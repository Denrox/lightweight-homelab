import Title from "~/components/shared/title/title";
import type { Route } from "./+types/how-to";
import ContentBlock from "~/components/shared/content-block/content-block";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "How To Use" },
    { name: "description", content: "How To Use" },
  ];
}

export default function HowTo() {
  return (
    <div className="flex flex-col justify-center h-full gap-[32px]">
      <Title title="How To Use Ubuntu Apt Mirror" />
      <ContentBlock className="flex-0">
        <div className="flex flex-col gap-[12px]">
          <div className="text-[16px] font-semibold">Add the following to your /etc/apt/sources.list</div>
          <div className="text-[14px]">deb http://mirror.root/ubuntu/ jammy main restricted universe multiverse</div>
          <div className="text-[14px]">deb http://mirror.root/ubuntu/ jammy-updates main restricted universe multiverse</div>
        </div>
      </ContentBlock>
      <Title title="How To Add a new download" />
      <ContentBlock className="flex-0">
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
    </div>
  );
}