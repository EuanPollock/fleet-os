"use client";

import { useRouter } from "next/navigation";

export default function RulesPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#07152d] text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-bold tracking-[0.25em] text-green-400">
              2026/27
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Rules & How To Play
            </h1>

            <p className="mt-2 text-slate-400">
              Premier League Prediction League
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-white/20 px-4 py-2 font-semibold hover:bg-white/10"
          >
            ← Back to predictions
          </button>
        </header>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold">How to play</h2>

          <div className="mt-5 space-y-3 text-slate-300">
            <p>1. Open the current gameweek.</p>
            <p>2. Enter your predicted score for each fixture.</p>
            <p>
              3. Enter the exact minute you think the first goal will be scored.
            </p>
            <p>4. Press Save Predictions.</p>
            <p>
              5. You can change your prediction until that fixture's deadline.
            </p>
            <p>
              6. Once the deadline passes, the fixture locks and your prediction
              cannot be changed.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-blue-400/30 bg-[#102a54] p-6">
          <h2 className="text-2xl font-bold">Scoring</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Exact Result</p>
              <p className="mt-1 text-3xl font-bold text-green-400">
                +5
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Predict the exact final score.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Correct Result</p>
              <p className="mt-1 text-3xl font-bold text-green-400">
                +3
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Correct winner or draw, but the wrong score.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">FG Hit</p>
              <p className="mt-1 text-3xl font-bold text-green-400">
                +5
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Predict the exact first-goal minute.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-green-400/20 bg-green-500/10 p-4 text-sm text-slate-300">
            Exact Result replaces Correct Result points. You do not receive both.
            Maximum score per fixture is <strong className="text-white">10 points</strong>.
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold">Example</h2>

          <div className="mt-4 rounded-xl bg-[#102a54] p-5">
            <p className="text-sm font-semibold text-green-400">
              ACTUAL RESULT
            </p>

            <p className="mt-2 text-xl font-bold">
              Arsenal 2–1 Chelsea
            </p>

            <p className="mt-1 text-slate-300">
              First goal: 19'
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
            <div className="grid grid-cols-[1fr_100px] bg-white/10 px-4 py-3 text-sm font-semibold">
              <span>Prediction</span>
              <span className="text-right">Points</span>
            </div>

            {[
              ["2–1, FG 19'", "10"],
              ["2–1, FG 25'", "5"],
              ["3–1, FG 19'", "8"],
              ["1–1, FG 19'", "5"],
              ["0–1, FG 30'", "0"],
            ].map(([prediction, points]) => (
              <div
                key={prediction}
                className="grid grid-cols-[1fr_100px] border-t border-white/10 px-4 py-3"
              >
                <span>{prediction}</span>
                <span className="text-right font-bold text-green-400">
                  {points}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold">0–0 predictions</h2>

          <p className="mt-3 text-slate-300">
            If you predict 0–0, you do not need to enter a first-goal minute.
            There is no first-goal bonus available if the match finishes 0–0.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold">Leaderboard</h2>

          <div className="mt-4 space-y-2 text-slate-300">
            <p>
              <strong className="text-white">Exact Result</strong> — exact
              score predictions.
            </p>
            <p>
              <strong className="text-white">Correct Result</strong> — correct
              winner or draw where the score was not exact.
            </p>
            <p>
              <strong className="text-white">FG Hits</strong> — exact first-goal
              minute predictions.
            </p>
            <p>
              <strong className="text-white">Picks</strong> — predictions
              submitted.
            </p>
            <p>
              <strong className="text-white">Points</strong> — total league
              points.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold">Results</h2>

          <p className="mt-3 text-slate-300">
            Once official match results have been entered, your score, points
            breakdown and leaderboard totals will update automatically.
          </p>
        </section>
      </div>
    </main>
  );
}
