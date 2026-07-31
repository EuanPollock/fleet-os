
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type LeaderboardRow = {
  id: string;
  name: string;
  totalPoints: number;
  predictionsMade: number;
  exactScores: number;
  correctResults: number;
  firstGoalHits: number;
};

export default function LeaderboardPage() {
  const router = useRouter();

  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLeaderboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, name");

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      const { data: predictions, error: predictionError } =
  await supabase
    .from("predictions")
    .select(
      "user_id, fixture_id, predicted_home_goals, predicted_away_goals, predicted_first_goal, points"
    );

      if (predictionError) {
        setError(predictionError.message);
        setLoading(false);
        return;
      }
      const { data: fixtures, error: fixtureError } = await supabase
  .from("fixtures")
  .select(
    "id, home_goals, away_goals, first_goal_minute"
  );

if (fixtureError) {
  setError(fixtureError.message);
  setLoading(false);
  return;
}

      const leaderboard =
        profiles?.map((profile) => {
          const playerPredictions =
            predictions?.filter(
              (prediction) => prediction.user_id === profile.id
            ) ?? [];

          const totalPoints = playerPredictions.reduce(
            (total, prediction) => total + (prediction.points ?? 0),
            0
          );
          let exactScores = 0;
let correctResults = 0;
let firstGoalHits = 0;

playerPredictions.forEach((prediction) => {
  const fixture = fixtures?.find(
    (fixture) => fixture.id === prediction.fixture_id
  );

  if (
    !fixture ||
    fixture.home_goals === null ||
    fixture.away_goals === null
  ) {
    return;
  }

  const exactScore =
    prediction.predicted_home_goals === fixture.home_goals &&
    prediction.predicted_away_goals === fixture.away_goals;

  if (exactScore) {
    exactScores += 1;
  } else {
    const predictedResult =
      prediction.predicted_home_goals > prediction.predicted_away_goals
        ? "H"
        : prediction.predicted_home_goals < prediction.predicted_away_goals
          ? "A"
          : "D";

    const actualResult =
      fixture.home_goals > fixture.away_goals
        ? "H"
        : fixture.home_goals < fixture.away_goals
          ? "A"
          : "D";

    if (predictedResult === actualResult) {
      correctResults += 1;
    }
  }

  if (
    fixture.first_goal_minute !== null &&
    prediction.predicted_first_goal === fixture.first_goal_minute
  ) {
    firstGoalHits += 1;
  }
});

          return {
  id: profile.id,
  name: profile.name || "Unnamed player",
  totalPoints,
  predictionsMade: playerPredictions.length,
  exactScores,
  correctResults,
  firstGoalHits,
};
        }) ?? [];

      leaderboard.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }

        return b.predictionsMade - a.predictionsMade;
      });

      setRows(leaderboard);
      setLoading(false);
    }

    loadLeaderboard();
  }, [router]);

function getPosition(index: number) {
  const currentPoints = rows[index].totalPoints;

  let position = index + 1;

  for (let i = 0; i < index; i++) {
    if (rows[i].totalPoints === currentPoints) {
      position = i + 1;
      break;
    }
  }

  if (position === 1) return "🥇";
  if (position === 2) return "🥈";
  if (position === 3) return "🥉";

  return `${position}`;
}

  return (
    <main className="min-h-screen bg-[#07152d] text-white">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex flex-col items-start gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-6">
          <div>
            <p className="font-bold tracking-[0.25em] text-green-400">
              2026/27
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Leaderboard
            </h1>

            <p className="mt-2 text-slate-400">
              Premier Picks
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10 sm:text-base"
          >
            ← Back to predictions
          </button>
        </header>

        {loading && (
          <p className="mt-10 text-slate-400">
            Loading leaderboard...
          </p>
        )}

        {error && (
          <div className="mt-8 rounded-xl bg-red-500/15 p-4 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
      <>
      <div className="space-y-3 sm:hidden">
  {rows.map((row, index) => (
    <div
      key={row.id}
      className="rounded-2xl border border-white/10 bg-[#102a54] p-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-2xl">
            {getPosition(index)}
          </span>

          <p className="min-w-0 truncate font-bold text-white">
            {row.name}
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-green-400">
            {row.totalPoints}
          </p>
          <p className="text-xs text-slate-400">pts</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3 text-center">
  <div>
    <p className="text-xs text-slate-400">Exact Result</p>
    <p className="mt-1 font-bold">
      {row.exactScores}
    </p>
  </div>

  <div>
    <p className="text-xs text-slate-400">Correct Result</p>
    <p className="mt-1 font-bold">
      {row.correctResults}
    </p>
  </div>

  <div>
    <p className="text-xs text-slate-400">FG Hits</p>
    <p className="mt-1 font-bold">
      {row.firstGoalHits}
    </p>
  </div>
</div>
    </div>
  ))}
</div>
      <div className="hidden sm:block">
          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-[60px_1fr_80px_80px_80px_80px_100px] bg-[#102a54] px-5 py-4 text-sm font-semibold text-slate-300">
  <span>Pos</span>
  <span>Player</span>
  <span className="text-right">Exact Result</span>
<span className="text-right">Correct Result</span>
<span className="text-right">FG Hits</span>
  <span className="text-right">Picks</span>
  <span className="text-right">Points</span>
</div>

            {rows.map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-[60px_1fr_80px_80px_80px_80px_100px] items-center border-t border-white/10 bg-white/5 px-5 py-5"
              >
                <span className="text-lg font-bold">
                  {getPosition(index)}
                </span>

                <span className="font-semibold">
                  {row.name}
                </span>
                <span className="text-right text-slate-300">
  {row.exactScores}
</span>

<span className="text-right text-slate-300">
  {row.correctResults}
</span>

<span className="text-right text-slate-300">
  {row.firstGoalHits}
</span>

                <span className="text-right text-slate-400">
                  {row.predictionsMade}
                </span>

                <span className="text-right text-2xl font-bold text-green-400">
                  {row.totalPoints}
                </span>
              </div>
            ))}
            <div className="border-t border-white/10 bg-white/5 px-5 py-3 text-center text-xs text-slate-400">
  <span className="font-semibold text-slate-300">Scoring:</span>{" "}
  Exact Result <span className="font-bold text-green-400">+5</span>
  {" · "}
  Correct Result <span className="font-bold text-green-400">+3</span>
  {" · "}
  FG Hit <span className="font-bold text-green-400">+5</span>
    </div>
 </section>
</div>
</>
)}
      </div>
    </main>
  );
}
