import { Link } from "react-router";

export default function Header() {
  return (
    <div className="flex size-full bg-white border-b border-gray-100 shadow-sm justify-center items-center h-[72px]">
      <div className="container mx-auto flex flex-row items-center justify-between">
        <Link to="/" className="text-[24px] font-semibold text-blue-500">Homelab Main Page</Link>
      </div>
    </div>
  );
}