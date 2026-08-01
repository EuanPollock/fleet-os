"use client";

import Sidebar from "./sidebar";
import Topbar from "./topbar";

type AppLayoutProps = {
  children: React.ReactNode;
  user?: string;
};

export default function AppLayout({
  children,
  user,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar />

      <div className="flex flex-1 flex-col">

        <Topbar user={user} />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
