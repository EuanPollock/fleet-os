
export default function VehiclesPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-10">

      <div className="mx-auto max-w-7xl">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Vehicles
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your entire fleet from one place.
            </p>
          </div>

          <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700">
            + Add Vehicle
          </button>

        </div>

        <div className="mt-8 rounded-3xl bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 p-6">

            <input
              placeholder="Search registration or vehicle..."
              className="w-80 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />

            <button className="rounded-xl border border-slate-300 px-4 py-3 hover:bg-slate-50">
              Filter
            </button>

          </div>

          <table className="w-full">

            <thead className="text-left text-sm uppercase tracking-wide text-slate-500">

              <tr>

                <th className="px-6 py-4">Registration</th>

                <th>Vehicle</th>

                <th>Driver</th>

                <th>Status</th>

                <th>Mileage</th>

                <th>MOT</th>

                <th></th>

              </tr>

            </thead>

            <tbody>

              <tr className="border-t hover:bg-slate-50">

                <td className="px-6 py-5 font-bold">
                  SK24 ABC
                </td>

                <td>
                  Ford Transit Custom
                </td>

                <td>
                  John Smith
                </td>

                <td>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    On Road
                  </span>

                </td>

                <td>
                  84,122
                </td>

                <td>
                  18 Sep 2026
                </td>

                <td className="pr-6 text-right">
                  →
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </main>
  );
}
