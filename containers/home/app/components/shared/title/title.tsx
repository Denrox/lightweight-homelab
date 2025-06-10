import type { JSX } from "react";

interface TitleProps {
  title: string | JSX.Element;
  description?: string | JSX.Element;
}

export default function Title({ title }: TitleProps) {
  return (
    <div className="text-[20px] font-semibold text-center">
      {title}
    </div>
  );
};