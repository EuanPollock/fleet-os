"use client";

type TopbarProps = {
  user?: string;
};

export default function Topbar({ user = "Fleet Manager" }: TopbarProps) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h2>

        <p className="text-sm text-slate-500">
          Welcome back. Here's what's happening across your fleet today.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-100">
          Notifications
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
            {user.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              {user}
            </p>

            <p className="text-sm text-slate-500">
              Fleet Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
