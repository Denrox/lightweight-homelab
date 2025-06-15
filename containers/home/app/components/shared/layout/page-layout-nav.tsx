import type { PropsWithChildren } from "react"

interface PageLayoutNavProps {
  nav: JSX.Element;
}

export default function PageLayoutNav({ children, nav }: PropsWithChildren<PageLayoutNavProps>) {
  return (
    <div className="flex flex-row h-full gap-[32px]">
      <div className="flex flex-col w-[200px] h-full">
        {nav}
      </div>
      <div className="flex flex-col gap-[32px] flex-1 h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}