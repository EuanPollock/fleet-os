"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Vehicles", href: "/dashboard/vehicles" },
  { title: "Drivers", href: "/dashboard/drivers" },
  { title: "Maintenance", href: "/dashboard/maintenance" },
  { title: "Compliance", href: "/dashboard/compliance" },
  { title: "Reports", href: "/dashboard/reports" },
  { title: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col">
      <div className="border-b border-slate-800 p-8">
        <h1 className="text-3xl font-bold">
          Fleet<span className="text-blue-500">OS</span>
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Fleet Management Platform
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-xl px-4 py-3 transition ${
              pathname === item.href
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
