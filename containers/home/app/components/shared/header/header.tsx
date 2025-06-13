import { Link, useLocation } from "react-router";
import classNames from "classnames";

export default function Header() {
  const location = useLocation();
  console.log(location.pathname);
  return (
    <div className="flex size-full bg-gradient-to-r from-blue-400 to-blue-600 border-b border-gray-100 shadow-sm justify-center items-center h-[72px]">
      <div className="container gap-[2px] h-full mx-auto text-white flex flex-row items-center justify-center">
        <Link to="/" className={classNames("text-[16px] hover:border-b-2 hover:border-blue-600 flex items-center justify-center h-full block px-[16px] min-w-[200px] hover:bg-blue-200 hover:text-blue-600 text-center font-semibold", {
          "border-b-2 border-blue-600 text-blue-600 bg-blue-200": location.pathname === "/"
        })}>Homelab Main Page</Link>
        <Link to="/downloader" className={classNames("text-[16px] hover:border-b-2 hover:border-blue-600 flex items-center justify-center h-full block px-[16px] min-w-[200px] hover:bg-blue-200 hover:text-blue-600 text-center font-semibold", {
          "border-b-2 border-blue-600 text-blue-600 bg-blue-200": location.pathname === "/downloader"
        })}>Downloader Logs</Link>
      </div>
    </div>
  );
}