import type { PropsWithChildren } from "react";

export default function PageLayoutFull({ children }: PropsWithChildren<{}>) {
  return (
    <div className="flex flex-col justify-center h-full gap-[32px]">{children}</div>
  )
}