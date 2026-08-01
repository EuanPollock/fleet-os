export default function CostsPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-slate-900">
          Costs
        </h1>

        <p className="mt-2 text-slate-600">
          Track and analyse the running costs of your fleet.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-slate-500">Fuel Spend</p>
            <h2 className="mt-2 text-3xl font-bold">£3,420</h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-slate-500">Maintenance</p>
            <h2 className="mt-2 text-3xl font-bold">£1,180</h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-slate-500">Insurance</p>
            <h2 className="mt-2 text-3xl font-bold">£980</h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-slate-500">Total Monthly Cost</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              £5,580
            </h2>
          </div>
        </div>
      </div>
    </main>
  );
}
