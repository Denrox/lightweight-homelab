import Title from "~/components/shared/title/title";
import ContentBlock from "~/components/shared/content-block/content-block";
import PageLayoutNav from "~/components/shared/layout/page-layout-nav";
import type { Route } from "./+types/how-to";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useLocation } from "react-router";
import classNames from "classnames";
import appConfig from "~/config/config.json";

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
        <Link to={`#${section.id}`} className={classNames("text-[16px] block leading-[48px] min-h-[48px] flex-0 bg-blue-200 border-white border-b-2 hover:border-blue-600 px-[16px] w-[200px] hover:text-blue-600 text-center font-semibold", {
          "border-blue-600 border-b-2 text-blue-600": activeSection === section.id
        })}>{section.linkName}</Link>
      ))}
    >
      <Title title={sections.find((section) => section.id === activeSection)?.title || ""} />
      {activeSection === "ubuntu-apt-mirror" && (
        <ContentBlock>
          <div className="flex flex-col gap-[12px]">
            <div className="text-[16px] font-semibold">Add the following to your /etc/apt/sources.list</div>
            <div className="text-[14px]">deb http://mirror.root/ubuntu/ jammy main restricted universe multiverse</div>
            <div className="text-[14px]">deb http://mirror.root/ubuntu/ jammy-updates main restricted universe multiverse</div>
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
    </PageLayoutNav>
  );
}