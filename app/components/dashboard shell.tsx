"use client";

import Sidebar from "./sidebar";
import Topbar from "./topbar";

type DashboardShellProps = {
  children: React.ReactNode;
  user?: string;
};

export default function DashboardShell({
  children,
  user,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Topbar user={user} />

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
