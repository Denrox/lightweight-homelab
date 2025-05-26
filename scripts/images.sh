#!/bin/bash

architectures=("amd64" "arm64")

input="./images.txt"
while IFS= read -r image
do
  set -f
  imageParts=($(echo "$image" | tr '/' '\n'))
  imagePartsLength=${#imageParts[@]}
  if [[ imagePartsLength -lt 2 ]]; then
    namespace="library"
    imgName="${image}"
  else
    namespace="${imageParts[0]}"
    imgName="${imageParts[1]}"
  fi
  
  tags="$(wget -q -O - "https://hub.docker.com/v2/namespaces/$namespace/repositories/$imgName/tags?page_size=25" | grep -o '"name": *"[^"]*' | grep -o '[^"]*$')"
  
  tag_count=0
  while IFS= read -r line; do
    if [ $tag_count -ge 3 ]; then
      break
    fi

    if [[ "$line" =~ ^[0-9]{1,2}\.[0-9]{1,2} ]]; then
      for arch in "${architectures[@]}"; do
        echo "Processing $image:$line for $arch"
        
        tagname="$image:$line"
        if ! docker pull --platform "linux/$arch" $tagname &> /dev/null; then
          echo "Failed to pull $tagname for $arch, skipping..."
          continue
        fi
        
        desttagname="$1/$imgName:$line-$arch"
        docker tag $tagname $desttagname
        
        docker push $desttagname &> /dev/null
        echo "pushed $desttagname"
        
        docker rmi $tagname $desttagname &> /dev/null
        sleep 10
      done
      ((tag_count++))
    fi
  done <<< "$tags"
done < "$input"