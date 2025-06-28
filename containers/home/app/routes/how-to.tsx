import Title from "~/components/shared/title/title";
import ContentBlock from "~/components/shared/content-block/content-block";
import PageLayoutNav from "~/components/shared/layout/page-layout-nav";
import type { Route } from "./+types/how-to";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useLocation } from "react-router";
import classNames from "classnames";
import appConfig from "~/config/config.json";
import NavLink from "~/components/shared/nav/nav-link";

export async function loader() {
  const config = await fetch(`${appConfig.url}/config.json`);
  return {
    config: await config.json()
  }
}

const sections = [
  {
    id: "ubuntu-apt-mirror",
    linkName: "Ubuntu Apt Mirror",
    title: "How To Use Ubuntu Apt Mirror",
  },
  {
    id: "downloader",
    linkName: "Downloader",
    title: "How To Add a new download",
  },
  {
    id: "dns-server",
    linkName: "DNS Server",
    title: "How To Use DNS Server",
  },
  {
    id: "data-structure",
    linkName: "Data Structure",
    title: "Data Folder Structure",
  },
]

export function meta({}: Route.MetaArgs) {
  return [
    { title: "How To Use" },
    { name: "description", content: "How To Use" },
  ];
}

export default function HowTo() {
  const { config } = useLoaderData<typeof loader>();
  const [activeSection, setActiveSection] = useState<string>("ubuntu-apt-mirror");
  const location = useLocation();

  useEffect(() => {
    const section = location.hash.slice(1);
    if (sections.some((s) => s.id === section)) {
      setActiveSection(section);
    }
  }, [location.hash]);

  return (
    <PageLayoutNav
      nav={sections.map((section) => (
        <NavLink
          key={section.id}
          to={`#${section.id}`}
          isActive={activeSection === section.id}
          onClick={() => setActiveSection(section.id)}
        >
          {section.linkName}
        </NavLink>
      ))}
    >
      <>
        <Title title={sections.find((section) => section.id === activeSection)?.title || ""} />
        {activeSection === "ubuntu-apt-mirror" && (
          <ContentBlock>
            <div className="flex flex-col gap-[12px]">
              <div className="text-[16px] font-semibold">Add the following to your /etc/apt/sources.list.d/ubuntu.sources</div>
              <div className="text-[14px]">Types: deb</div>
              <div className="text-[14px]">URIs: http://mirror.root/ubuntu/</div>
              <div className="text-[14px]">Suites: noble noble-updates noble-backports</div>
              <div className="text-[14px]">Components: main restricted universe multiverse</div>
              <div className="text-[14px]">Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg</div>
              <div className="text-[14px]">Types: deb</div>
              <div className="text-[14px]">URIs: http://mirror.root/security/ubuntu/</div>
              <div className="text-[14px]">Suites: noble-security</div>
              <div className="text-[14px]">Components: main restricted universe multiverse</div>
              <div className="text-[14px]">Signed-By: /usr/share/keyrings/ubuntu-archive-keyring.gpg</div>
            </div>
          </ContentBlock>
        )}
        {activeSection === "downloader" && (
          <ContentBlock>
            <div className="flex flex-col gap-[12px]">
              <div className="text-[16px] font-semibold">Edit the downloads.json file</div>
              <div className="text-[14px]">File location: /data/volumes/downloader/config/downloads.json</div>
              <div className="text-[16px] font-semibold">For adding a pattern download (download latest file matching the pattern)</div>
              <div className="text-[14px]">
                <pre>
                  {`              {
                    "url": "https://download.kiwix.org/zim/stack_exchange/",
                    "dest": "../../data/wiki/zim",
                    "pattern": "(stackoverflow\\.com_en_all)",
                    "type": "pattern",
                    "latest": true
                  }`}
                </pre>
              </div>
              <div className="text-[16px] font-semibold">For adding a specific file download</div>
              <div className="text-[14px]">
                <pre>
                  {`              {
                    "url": "https://releases.ubuntu.com/24.04/ubuntu-24.04.2-live-server-amd64.iso",
                    "dest": "../../data/files/os/ubuntu-releases",
                    "type": "direct"
                  }`}
                </pre>
              </div>
              <div className="text-[16px] font-semibold">For adding a docker image download</div>
              <div className="text-[14px]">
                <pre>
                  {`              {
                    "image": "nginx",
                    "type": "docker",
                    "namespace": "library"
                  }`}
                </pre>
              </div>
            </div>
          </ContentBlock>
        )}
        {activeSection === "dns-server" && (
          <ContentBlock>
            <div className="flex flex-col gap-[12px]">
              {config.dns.disabled && (
                <>
                  <div className="text-[16px] font-semibold">DNS Server is disabled</div>
                  <div className="text-[14px]">
                    DNS Server is disabled. The following hosts mappings need to be added to your router settings:
                  </div>
                  <ul className="text-[14px] list-disc list-inside pl-[16px]">  
                    {appConfig.hosts.map((host) => (
                      <li>
                        {`${host.address} ${host.name}`}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {!config.dns.disabled && (
                <>
                  <div className="text-[16px] font-semibold">DNS Server is enabled</div>
                  <div className="text-[14px]">
                    Add the following dns server address to your router settings:
                  </div>
                  <div className="text-[14px]">
                    {`${config.dns.ip}`}
                  </div>
                </>
              )}
            </div>
          </ContentBlock>
        )}
        {activeSection === "data-structure" && (
          <ContentBlock>
            <div className="flex flex-col gap-[12px]">
              <div className="text-[16px] font-semibold">Data Folder Structure</div>
              <div className="text-[14px]">
                The data folder contains all the configuration files and downloaded content. Here's the structure:
              </div>
              <pre className="text-[14px] bg-gray-100 p-4 rounded">
  {`data/
  ├── volumes/                      # Docker volumes
  │   ├── downloader/
  │   │   ├── config/
  │   │   │   ├── config.json       # Main configuration file (contains configurations from startup.sh)
  │   │   │   └── downloads.json    # Downloads list configuration
  │   │   ├── data/
  │   │   │   ├── files/
  │   │   │   │   └── os/
  │   │   │   │       └── ubuntu-releases/     # Ubuntu ISO files
  │   │   │   ├── wiki/
  │   │   │   │   └── zim/                    # Wiki ZIM files
  │   │   │   └── packages/                   # Downloaded packages
  │   │   └── logs/                 # Downloader logs by date
  │   ├── dns/
  │   │   └── config/
  │   │       └── Corefile          # DNS server configuration - your local network domains
  │   ├── nginx/
  │   │   └── conf/               # Nginx server configurations
  │   │       └── sites.conf      # Homenet hosts configuration
  │   ├── registry/
  │   │   └── registry/               # Docker registry storage
  │   │       └── config.yaml         # Docker registry configuration
  │   │       └── registry/               # Docker images storage
  │   └── trilium/
  │       └── data/               # Trilium notes storage
  │           ├── document.db     # Trilium database
  │           └── document.db-shm # Trilium database shared memory`}
              </pre>
              <div className="text-[16px] font-semibold mt-4">Configuration Files</div>
              <div className="text-[14px]">
                <ul className="list-disc list-inside pl-[16px]">
                  <li><span className="font-semibold">config.json:</span> Main configuration file for the homelab services</li>
                  <li><span className="font-semibold">downloads.json:</span> Configuration for automated downloads</li>
                  <li><span className="font-semibold">Corefile:</span> DNS server configuration</li>
                </ul>
              </div>
            </div>
          </ContentBlock>
        )}
      </>
    </PageLayoutNav>
  );
}