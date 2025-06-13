import { useLoaderData } from "react-router";
import type { Route } from "./+types/downloader";
import fs from "fs/promises";
import appConfig from "~/config/config.json";
import Title from "~/components/shared/title/title";
import { useEffect, useState, useMemo } from "react";
import classNames from "classnames";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Downloader" },
    { name: "description", content: "Downloader" },
  ];
}

export async function loader() {
  const downloaderLogsDir = appConfig.downloaderLogsDir;
  const logs = await fs.readdir(downloaderLogsDir);

  const logsContent = await Promise.all(logs.filter((log) => log.endsWith(".log")).map(async (log) => {
    const logContent = await fs.readFile(`${downloaderLogsDir}/${log}`, "utf-8");
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

  const sortedLogs = logs.sort((a, b) => b.name > a.name ? 1 : -1);

  useEffect(() => {
    if (sortedLogs.length > 0) {
      setSelectedLog(sortedLogs[0].name);
    }
  }, [sortedLogs]);

  const selectedLogContent = useMemo(() => {
    return logs.find((log) => log.name === selectedLog)?.content || '';
  }, [selectedLog, logs]);

  return (
    <div className="flex flex-col justify-center h-full gap-[32px]">
      <Title title="Downloader Logs" />
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
      <div className="w-full overflow-y-auto p-[24px] border-[1px] border-gray-200 shadow-md rounded-md flex-1">
        <pre className="whitespace-pre-wrap text-[14px]">{selectedLogContent}</pre>
      </div>
    </div>
  );
}