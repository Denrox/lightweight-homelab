import { Link, useLoaderData, useParams } from "react-router";
import type { Route } from "./+types/downloader";
import fs from "fs/promises";
import appConfig from "~/config/config.json";
import Title from "~/components/shared/title/title";
import { useEffect, useState, useMemo } from "react";
import classNames from "classnames";
import ContentBlock from "~/components/shared/content-block/content-block";
import PageLayoutNav from "~/components/shared/layout/page-layout-nav";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Logs" },
    { name: "description", content: "Logs" },
  ];
}

const sections = [
  { id: "downloader", linkName: "Downloader", title: "Downloader Logs" },
  { id: "nginx", linkName: "Nginx", title: "Nginx Logs" }
];

export async function loader({ params }: Route.LoaderArgs) {
  const log = (params as { log: string; }).log;

  let logs: string[] = [];
  let logsDir: string = "";

  if (log === "downloader") {
    logsDir = appConfig.downloaderLogsDir;
    logs = await fs.readdir(logsDir);
  } else if (log === "nginx") {
    logsDir = appConfig.nginxLogsDir;
    logs = await fs.readdir(logsDir);
  }

  const logsContent = await Promise.all(logs.filter((log) => log.endsWith(".log") || log.match(/\.log.+$/)).map(async (log) => {
    const logContent = await fs.readFile(`${logsDir}/${log}`, "utf-8");
    return {
      name: log,
      content: logContent
    }
  }));

  return {
    logs: logsContent
  }
}

export default function Downloader() {
  const { logs } = useLoaderData<typeof loader>();
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { log } = useParams();

  useEffect(() => {
    if (log) {
      setActiveSection(log);
    }
  }, [log]);

  const sortedLogs = useMemo(() => {
    return logs.sort((a, b) => b.name > a.name ? 1 : -1);
  }, [logs]);

  useEffect(() => {
    if (sortedLogs.length > 0) {
      setSelectedLog(sortedLogs[0].name);
    }
  }, [sortedLogs]);

  const selectedLogContent = useMemo(() => {
    return sortedLogs.find((log) => log.name === selectedLog)?.content || '';
  }, [selectedLog, sortedLogs]);

  return (
    <PageLayoutNav
      nav={sections.map((section) => (
        <Link to={`/logs/${section.id}`} className={classNames("text-[16px] block leading-[48px] min-h-[48px] flex-0 bg-blue-200 border-white border-b-2 hover:border-blue-600 px-[16px] w-[200px] hover:text-blue-600 text-center font-semibold", {
          "border-blue-600 border-b-2 text-blue-600": activeSection === section.id
        })}>{section.linkName}</Link>
      ))}
    >
      <>
        <Title title={sections.find((section) => section.id === activeSection)?.title || ""} />
        {sortedLogs.length > 0 && (
          <div className="flex flex-row justify-around align-center flex-wrap gap-[12px]">
            {sortedLogs.map((log) => (
              <div className={classNames("text-[16px] h-[40px] flex items-center justify-center font-semibold px-[12px] rounded-md shadow-sm hover:bg-gray-200 cursor-pointer", {
                "bg-blue-200": selectedLog === log.name,
                "bg-gray-100": selectedLog !== log.name
              })} onClick={() => {
                setSelectedLog(log.name);
              }}>{log.name}</div>
            ))}
          </div>
        )}
        <ContentBlock className="flex-1">
          <pre className="whitespace-pre-wrap text-[14px]">{selectedLogContent || "No logs found"}</pre>
        </ContentBlock>
      </>
    </PageLayoutNav>
  );
}