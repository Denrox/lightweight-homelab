import Title from "~/components/shared/title/title";
import classNames from "classnames";
import type { Route } from "./+types/home";

import config from "~/config/config.json";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Homelab Main Page" },
    { name: "description", content: "Homelab Main Page" },
  ];
}

const hosts = [
  { address: 'reg.root', name: 'Registry' },
  { address: 'mirror.root', name: 'APT Mirror' },
  { address: 'files.root', name: 'Files' },
  { address: 'git.root', name: 'Git (gogs)' },
  { address: 'wiki.root', name: 'Wiki (kiwix)' }
]

const pages: { url: string, disabled?: boolean, name: string, description: string }[] = [
  { url: `http://${hosts[0].address}`, name: hosts[0].name, description: 'Web UI for Docker Registry' },
  { url: `http://${hosts[1].address}`, disabled: config.mirror.disabled, name: config.mirror.disabled ? `${hosts[1].name} (disabled)` : hosts[1].name, description: 'APT Mirror for Ubuntu' },
  { url: `http://${hosts[2].address}`, name: hosts[2].name, description: 'Downloads defined in your downloads.json' },
  { url: `http://${hosts[3].address}`, name: hosts[3].name, description: 'Git server for your projects' },
  { url: `http://${hosts[4].address}`, name: hosts[4].name, description: 'Wiki server' },
  { url: `http://${config.dns.ip}`, disabled: config.dns.disabled, name: config.dns.disabled ? `DNS (disabled)` : 'DNS', description: config.dns.disabled ? 'DNS server is not running. You need to configures following hosts on your router manually: ' + hosts.map((host) => host.address).join(', ') : 'DNS server is running on this IP. Please add this IP as a settings for DNS server on your router.' },
]

export default function Home() {

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, page: { url: string, disabled?: boolean, name: string, description: string }) => {
    if (page.disabled) {
      event.preventDefault();
      alert('This service is disabled.');
    }
  };

  return (
    <div className="flex flex-col justify-center gap-[32px]">
      <Title title="Services running in this Homelab" />
      <div className="flex flex-row items-center gap-[32px] flex-wrap">
        {pages.map((page) => (
          <div key={page.url} className={classNames("h-[120px] w-[calc(25%-24px)] bg-gray-100 rounded-md flex flex-col gap-[12px] p-[12px] shadow-sm", {
            "opacity-70": page.disabled,
          })}>
            <a onClick={(e) => handleClick(e, page)} href={page.url} target="_blank" rel="noopener noreferrer" className={classNames("block text-[16px] text-blue-500 font-semibold", {
              "text-gray-500": page.disabled,
            })}>{page.name}</a>
            <div className="text-[12px] text-gray-500">
              {page.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
