import Title from "~/components/shared/title/title";
import classNames from "classnames";
import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";
import appConfig from "~/config/config.json";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Homelab Main Page" },
    { name: "description", content: "Homelab Main Page" },
  ];
}

const getPages = (config: { mirror: { disabled: boolean; }; dns: { disabled: boolean; ip: string; } }): { url: string, disabled?: boolean, name: string, description: string }[] => {
  return appConfig.hosts.map((host) => ({
    url: `http://${host.address}`,
    name: host.name,
    description: host.description,
    disabled: (host.id === "mirror" && config.mirror.disabled) || (host.id === "dns" && config.dns.disabled)
  }));
};

export async function loader() {
  const config = await fetch(`${appConfig.url}/config.json`);
  return {
    config: await config.json()
  }
}

export default function Home() {
  const { config } = useLoaderData<typeof loader>();
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
        {getPages(config).map((page) => (
          <div key={page.url} className={classNames("h-[120px] w-[calc(25%-24px)] bg-gray-100 border border-gray-200 shadow-md rounded-md flex flex-col gap-[12px] p-[12px]", {
            "opacity-70": page.disabled,
          })}>
            <a onClick={(e) => handleClick(e, page)} href={page.url} target="_blank" rel="noopener noreferrer" className={classNames("block text-[16px] text-blue-500 font-semibold", {
              "text-gray-500": page.disabled,
            })}>{`${page.name} (${page.url})`}</a>
            <div className="text-[12px] text-gray-500">
              {page.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
