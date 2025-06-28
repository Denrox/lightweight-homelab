import Title from "~/components/shared/title/title";
import classNames from "classnames";
import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";
import appConfig from "~/config/config.json";
import PageLayoutFull from "~/components/shared/layout/page-layout-full";
import { useEffect, useMemo, useState } from "react";


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
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [pagesAvalabilityState, setPagesAvalabilityState] = useState<{ [key: string]: boolean }>({});
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, page: { url: string, disabled?: boolean, name: string, description: string }) => {
    if (page.disabled) {
      event.preventDefault();
      alert('This service is disabled.');
    }
  };
  const pages = useMemo(() => getPages(config), [config]);

  useEffect(() => {
    const checkPagesAvalability = async () => {
      const pages = getPages(config);
      const pagesAvalabilityState = await Promise.all(pages.map(async (page) => {
        try {
          const response = await fetch(page.url);
          return { [page.url]: response.ok };
        } catch (error) {
          return { [page.url]: false };
        }
      }));
      setPagesAvalabilityState(pagesAvalabilityState.reduce((acc, curr) => ({ ...acc, ...curr }), {}));
    };
    checkPagesAvalability();
    if (timer) {
      clearInterval(timer);
    }
    const interval = setInterval(checkPagesAvalability, 1000);
    setTimer(interval);
  }, [config]);

  return (
    <PageLayoutFull>
      <Title title="Services running in this Homelab" />
      <div className="flex flex-row items-center gap-[32px] flex-wrap px-[16px] lg:px-0">
        {pages.map((page) => (
          <div key={page.url} className={classNames("h-[120px] w-[calc(50%-18px)] lg:w-[calc(25%-24px)] relative bg-gray-100 border border-gray-200 shadow-md rounded-md flex flex-col gap-[12px] p-[12px]", {
            "opacity-70": page.disabled,
          })}>
            <a onClick={(e) => handleClick(e, page)} href={page.url} target="_blank" rel="noopener noreferrer" className={classNames("block text-[16px] w-[calc(100%-48px)] whitespace-nowrap overflow-hidden text-ellipsis text-blue-500 font-semibold", {
              "text-gray-500": page.disabled,
            })}>{`${page.name} (${page.url})`}</a>
            <div className="text-[12px] text-gray-500">
              {page.description}
            </div>
            <div className="absolute top-[12px] right-[12px] leading-none">
              {pagesAvalabilityState[page.url] ? <div className="font-semibold leading-[24px] text-[9px] text-green-500">Online</div> : <div className="font-semibold leading-[24px] text-[12px] text-red-500">Offline</div>}
            </div>
          </div>
        ))}
      </div>
    </PageLayoutFull>
  );
}
