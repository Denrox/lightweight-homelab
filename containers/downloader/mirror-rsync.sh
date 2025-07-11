#!/bin/bash
set -euo pipefail;

syncDate=$(date +%F);

sourceFolder='./mirror-rsync.d';
baseDirectory="/usr/local/data/packages";
tmpDirectory="/usr/local/data/mirror-tmp";

# Function to run rsync with better error handling
run_rsync_with_retry() {
    local source="$1"
    local dest="$2"
    local files_list="$3"
    local max_attempts=3
    local attempt=1
    local exit_code=1
    
    while [[ $exit_code -gt 0 ]] && [[ $attempt -le $max_attempts ]]; do
        echo "$(date +%T) rsync attempt $attempt of $max_attempts";
        SECONDS=0;
        
        # Run rsync with options to handle verification errors
        rsync --copy-links \
              --files-from="$files_list" \
              --no-motd \
              --delete-during \
              --archive \
              --recursive \
              --human-readable \
              --partial \
              --partial-dir=.rsync-partial \
              --timeout=300 \
              --contimeout=60 \
              --ignore-errors \
              --exclude='*.tmp' \
              --exclude='*.part' \
              "$source" "$dest" 2>&1;
        
        exit_code=$?;
        
        if [[ $exit_code -gt 0 ]]; then
            if [[ $attempt -lt $max_attempts ]]; then
                local wait_time=$((attempt*900)); # 15, 30, 45 minutes
                echo "$(date +%T) rsync attempt $attempt failed with exit code $exit_code, waiting $wait_time seconds to retry" 1>&2;
                sleep $wait_time;
            else
                echo "$(date +%T) rsync failed all $max_attempts attempts" 1>&2;
            fi
        else
            echo "$(date +%T) rsync completed successfully in $SECONDS seconds";
        fi
        
        ((attempt++));
    done
    
    return $exit_code;
}

#Basic checks
if [[ ! -d "$sourceFolder" ]]; then
		echo "Source folder $sourceFolder does not exist!"
		exit 1;

elif [[ $(ls -1 "$sourceFolder"/* | wc -l) -eq 0 ]]; then
    echo "No master source file(s) found in $sourceFolder, create one and add name, releases, repositories and architectures per README." 1>&2;
    exit 1;
elif [[ ! $(which rsync) ]] || [[ ! $(which sed) ]] || [[ ! $(which awk) ]]; then
	echo "Missing one or more of required tools 'rsync', 'sed' and 'awk' (or they are not in the PATH for this user)." 1>&2;
	exit 1;
elif [[ ! $(which gunzip) ]] && [[ ! $(which xzcat) ]]; then
	echo "Warning: missing both 'gunzip' and 'xzcat', required to work with certain repositories that do not provide uncompressed Packages lists. This may not work with your chosen repository. Install gzip and/or xz for best compatibility." 1>&2;
fi

#Add a marker for a second APT mirror to look for - if the sync falls on its face, can drop this out of the pair and sync exclusively from the mirror until fixed
if [[ -f $baseDirectory/lastSuccess ]]; then
	rm -v "$baseDirectory/lastSuccess";
fi
for sourceServer in "$sourceFolder"/*
do
	source "$sourceServer";
	if [[ -z "$name" ]] || [[ -z "$releases" ]] || [[ -z "$repositories" ]] || [[ -z "$architectures" ]]
	then
		echo "Error: $sourceServer is missing one or more of 'name', 'releases', 'repositories' or 'architectures' entries! Skipping." 1>&2;
		continue;
	fi

	masterSource=$(basename "$sourceServer");
	#File to build a list of files to rsync from the remote mirror - will contain one line for every file in the dists/ to sync
	filename="packages-$masterSource-$syncDate.txt";

	echo "$syncDate $(date +%T) Starting, exporting to $tmpDirectory/$filename";

	#In case leftover from testing or failed previous run
	if [[ -f "$tmpDirectory/$filename" ]]; then
		rm -v "$tmpDirectory/$filename";
	fi

	echo "$(date +%T) Syncing releases";
	localPackageStore="$baseDirectory/$masterSource/$name";
	mkdir -p "$localPackageStore/dists"

	echo -n ${releases[*]} | sed 's/ /\n/g' | rsync --no-motd --delete-during --archive --recursive --human-readable --files-from=- $masterSource::"$name/dists/" "$localPackageStore/dists/";

	echo "$(date +%T) Generating package list";
	#rather than hard-coding, use a config file to run the loop. The same config file as used above to sync the releases
	for release in ${releases[*]}; do
		for repo in ${repositories[*]}; do
			for arch in ${architectures[*]}; do
				if [[ ! -f "$localPackageStore/dists/$release/$repo/binary-$arch/Packages" ]]; then  #uncompressed file not found
					if [[ $(which gunzip) ]]; then #See issue #5 - some distros don't provide gunzip by default but have xz
					  if [[ -f "$localPackageStore/dists/$release/$repo/binary-$arch/Packages.gz" ]]; then
							packageArchive="$localPackageStore/dists/$release/$repo/binary-$arch/Packages.gz";
							echo "$(date +%T) Extracting $release $repo $arch Packages file from archive $packageArchive";
							if [[ -L "$packageArchive" ]]; then #Some distros (e.g. Debian) make Packages.gz a symlink to a hashed filename. NB. it is relative to the binary-$arch folder
								echo "$(date +%T) Archive is a symlink, resolving";
								packageArchive=$(readlink $packageArchive | sed --expression "s_^_${packageArchive}_" --expression 's/Packages\.gz//');
							fi
							gunzip <"$packageArchive" >"$localPackageStore/dists/$release/$repo/binary-$arch/Packages";
						fi
					elif [[ $(which xzcat) ]]; then
						if [[ -f "$localPackageStore/dists/$release/$repo/binary-$arch/Packages.xz" ]]; then
							packageArchive="$localPackageStore/dists/$release/$repo/binary-$arch/Packages.xz";
							echo "$(date +%T) Extracting $release $repo $arch Packages file from archive $packageArchive";
							if [[ -L "$packageArchive" ]]; then #Same as above
								echo "$(date +%T) Archive is a symlink, resolving";
								packageArchive=$(readlink $packageArchive | sed --expression "s_^_${packageArchive}_" --expression 's/Packages\.xz//');
							fi
							xzcat <"$packageArchive" >"$localPackageStore/dists/$release/$repo/binary-$arch/Packages";
						fi
					else
						echo "$(date +%T) Error: uncompressed package list not found in remote repo and decompression tools for .gz or .xz files not found on this system, aborting. Please install either gunzip or xzcat to use this script." 1>&2;
						exit 1;
					fi
					echo "$(date +%T) Extracting packages from $release $repo $arch";
					if [[ -s "$localPackageStore/dists/$release/$repo/binary-$arch/Packages" ]]; then #Have experienced zero filesizes for certain repos
						awk '/^Filename: / { print $2; }' "$localPackageStore/dists/$release/$repo/binary-$arch/Packages" >> "$tmpDirectory/$filename";
					else
						echo "$(date +%T) Package list is empty, skipping";
					fi
				fi
			done
		done
	done

	echo "$(date +%T) Deduplicating";

	sort --unique "$tmpDirectory/$filename" > "$tmpDirectory/$filename.sorted";
	rm -v "$tmpDirectory/$filename";
	mv -v "$tmpDirectory/$filename.sorted" "$tmpDirectory/$filename";

	echo "$(wc -l $tmpDirectory/$filename | awk '{print $1}') files to be sync'd";

	echo "$(date +%T) Running rsync";

	# Use the improved rsync function with better error handling
	run_rsync_with_retry "$masterSource::$name" "$localPackageStore/" "$tmpDirectory/$filename";
	exitCode=$?;

	# Clean up any partial files
	if [[ -d "$localPackageStore/.rsync-partial" ]]; then
		echo "$(date +%T) Cleaning up partial files";
		rm -rf "$localPackageStore/.rsync-partial";
	fi

	#Exiting here will stop the lastSuccess file being created, and will stop APT02 running its own sync
	if [[ $exitCode -gt 0 ]]; then
		echo "rsync failed all 3 attempts, erroring out" 1>&2;
		exit 2;
	fi

	echo "$(date +%T) Sync from $masterSource complete, runtime: $SECONDS s";

	echo "$(date +%T) Deleting obsolete packages";

	#Build a list of files that have been synced and delete any that are not in the list
	if [[ -d "$localPackageStore/pool/" ]]; then
		echo "$(date +%T) Checking for obsolete packages in $localPackageStore/pool/";
		find "$localPackageStore/pool/" -type f | { grep -Fvf "$tmpDirectory/$filename" || true; } | xargs --no-run-if-empty -I {} rm -v {}; # '|| true' used here to prevent grep causing pipefail if there are no packages to delete - grep normally returns 1 if no files are found
		echo "$(date +%T) Obsolete package cleanup completed";
	else
		echo "$(date +%T) Pool directory $localPackageStore/pool/ does not exist, skipping obsolete package cleanup";
	fi

	echo "$(date +%T) Completed $masterSource";

	rm -v "$tmpDirectory/$filename";
done
touch "$baseDirectory/lastSuccess";

echo "$(date +%T) Finished";
