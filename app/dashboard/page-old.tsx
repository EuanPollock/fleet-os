"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Fixture = {
  id: number;
  matchweek: number;
  kickoff: string;
  prediction_deadline: string | null;
  home_team: string;
  away_team: string;
  home_goals: number | null;
  away_goals: number | null;
  first_goal_minute: number | null;
};

type PredictionValues = {
  home: string;
  away: string;
  firstGoal: string;
  points: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
const [leaguePosition, setLeaguePosition] = useState<number | null>(null);
  const [allFixtures, setAllFixtures] = useState<Fixture[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(1);

  const [predictions, setPredictions] = useState<
    Record<number, PredictionValues>
  >({});

  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // Predictions open on Monday 17 August 2026 at 9:00am
const predictionsOpenAt = new Date("2026-08-17T09:00:00+01:00");
const predictionsAreOpen = new Date() >= predictionsOpenAt;

  const fixtures = useMemo(
    () =>
      allFixtures.filter(
        (fixture) => fixture.matchweek === selectedWeek
      ),
    [allFixtures, selectedWeek]
  );

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");
      const { data: profileData } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

setIsAdmin(profileData?.role === "admin");

const { data: allProfiles } = await supabase
  .from("profiles")
  .select("id");

const { data: allPredictionPoints } = await supabase
  .from("predictions")
  .select("user_id, points");

if (allProfiles && allPredictionPoints) {
  const playerTotals = allProfiles.map((profile) => {
    const total = allPredictionPoints
      .filter((prediction) => prediction.user_id === profile.id)
      .reduce(
        (sum, prediction) => sum + (prediction.points ?? 0),
        0
      );

    return {
      id: profile.id,
      points: total,
    };
  });

  playerTotals.sort((a, b) => b.points - a.points);

  const myTotal =
    playerTotals.find((player) => player.id === user.id)?.points ?? 0;

  const position =
    playerTotals.findIndex(
      (player) => player.points === myTotal
    ) + 1;

  setLeaguePosition(position);
}

      const { data: fixtureData, error: fixtureError } = await supabase
        .from("fixtures")
        .select(
          "id, matchweek, kickoff, prediction_deadline, home_team, away_team, home_goals, away_goals, first_goal_minute"
        )
        .order("matchweek", { ascending: true })
        .order("kickoff", { ascending: true });

      if (fixtureError) {
        setError(fixtureError.message);
        setLoading(false);
        return;
      }

      const loadedFixtures = fixtureData ?? [];
      setAllFixtures(loadedFixtures);

      const now = Date.now();

      const nextFixture = loadedFixtures.find(
        (fixture) =>
          new Date(
            fixture.prediction_deadline ?? fixture.kickoff
          ).getTime() > now
      );

      const automaticWeek =
        nextFixture?.matchweek ??
        loadedFixtures.at(-1)?.matchweek ??
        1;

      setSelectedWeek(automaticWeek);

      const fixtureIds = loadedFixtures.map(
        (fixture) => fixture.id
      );

      if (fixtureIds.length > 0) {
        const { data: predictionData, error: predictionError } =
          await supabase
            .from("predictions")
            .select(
              "fixture_id, predicted_home_goals, predicted_away_goals, predicted_first_goal, points"
            )
            .eq("user_id", user.id)
            .in("fixture_id", fixtureIds);

        if (predictionError) {
          setError(predictionError.message);
        } else {
          const saved: Record<number, PredictionValues> = {};

          predictionData?.forEach((prediction) => {
           saved[prediction.fixture_id] = {
  home: prediction.predicted_home_goals?.toString() ?? "",
  away: prediction.predicted_away_goals?.toString() ?? "",
  firstGoal: prediction.predicted_first_goal?.toString() ?? "",
  points: prediction.points ?? 0,
};
          });

          setPredictions(saved);

          const points =
            predictionData?.reduce(
              (total, prediction) =>
                total + (prediction.points ?? 0),
              0
            ) ?? 0;

          setTotalPoints(points);
        }
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  function getDeadline(fixture: Fixture) {
    return new Date(
      fixture.prediction_deadline ?? fixture.kickoff
    );
  }

  function isLocked(fixture: Fixture) {
  const finished =
    fixture.home_goals !== null &&
    fixture.away_goals !== null;

  return finished || Date.now() >= getDeadline(fixture).getTime();
}

  function updatePrediction(
    fixtureId: number,
    field: keyof PredictionValues,
    value: string
  ) {
    setPredictions((current) => ({
  ...current,
  [fixtureId]: {
    home: current[fixtureId]?.home ?? "",
    away: current[fixtureId]?.away ?? "",
    firstGoal: current[fixtureId]?.firstGoal ?? "",
    points: current[fixtureId]?.points ?? 0,
    [field]: value,
  },
}));

    setMessage("");
    setError("");
  }

  async function savePredictions() {

    if (!predictionsAreOpen) {
  setError("Predictions open on Monday 17 August at 9:00am.");
  return;
}
    
    setMessage("");
    setError("");

    if (!userId) return;

    const unlockedFixtures = fixtures.filter(
      (fixture) => !isLocked(fixture)
    );

    const completedFixtures = unlockedFixtures.filter(
      (fixture) => {
        const prediction = predictions[fixture.id];

        return (
          prediction &&
          prediction.home !== "" &&
          prediction.away !== ""
        );
      }
    );

    if (completedFixtures.length === 0) {
      setError("There are no completed unlocked predictions to save.");
      return;
    }

    const rows = [];

    for (const fixture of completedFixtures) {
      const prediction = predictions[fixture.id];

      const home = Number(prediction.home);
      const away = Number(prediction.away);

      if (
        !Number.isInteger(home) ||
        !Number.isInteger(away) ||
        home < 0 ||
        away < 0
      ) {
        setError(
          `${fixture.home_team} vs ${fixture.away_team}: enter valid scores.`
        );
        return;
      }

      let firstGoal: number | null = null;

      if (home === 0 && away === 0) {
        firstGoal = null;
      } else {
        if (prediction.firstGoal === "") {
          setError(
            `${fixture.home_team} vs ${fixture.away_team}: enter a first-goal minute.`
          );
          return;
        }

        firstGoal = Number(prediction.firstGoal);

        if (
          !Number.isInteger(firstGoal) ||
          firstGoal < 1 ||
          firstGoal > 120
        ) {
          setError(
            `${fixture.home_team} vs ${fixture.away_team}: first-goal minute must be between 1 and 120.`
          );
          return;
        }
      }

      rows.push({
        user_id: userId,
        fixture_id: fixture.id,
        predicted_home_goals: home,
        predicted_away_goals: away,
        predicted_first_goal: firstGoal,
      });
    }

    setSaving(true);

    const { error: saveError } = await supabase
      .from("predictions")
      .upsert(rows, {
        onConflict: "user_id,fixture_id",
      });

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    setMessage(
      `${rows.length} prediction${
        rows.length === 1 ? "" : "s"
      } saved successfully.`
    );
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const predictionsMade = fixtures.filter((fixture) => {
    const prediction = predictions[fixture.id];

    return (
      prediction &&
      prediction.home !== "" &&
      prediction.away !== ""
    );
  }).length;

  return (
    <main className="min-h-screen bg-[#07152d] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="border-b border-white/10 pb-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="font-bold tracking-[0.25em] text-green-400">
        2026/27
      </p>

      <h1 className="mt-2 text-3xl font-bold">
        PREMIER PICKS
      </h1>

      <p className="mt-1 text-sm text-slate-400">
        {email}
      </p>
    </div>

    <div className="grid grid-cols-4 gap-2 sm:flex sm:items-center sm:gap-3">
  {isAdmin && (
    <button
      onClick={() => router.push("/admin")}
      className="rounded-lg bg-green-400 px-2 py-2 text-xs font-bold text-slate-950 transition hover:bg-green-300 sm:rounded-xl sm:px-4 sm:text-sm"
    >
      Admin
    </button>
  )}

  <button
  onClick={() => router.push("/leaderboard")}
  className="flex items-center justify-center rounded-lg border border-white/20 px-2 py-2 text-center text-xs font-semibold transition hover:bg-white/10 sm:rounded-xl sm:px-4"
>
  Leaderboard
</button>

  <button
    onClick={() => router.push("/rules")}
    className="rounded-lg border border-white/20 px-2 py-2 text-xs font-semibold transition hover:bg-white/10 sm:rounded-xl sm:px-4 sm:text-sm"
  >
    Rules
  </button>

  <button
    onClick={handleLogout}
    className="rounded-lg border border-white/20 px-2 py-2 text-xs font-semibold transition hover:bg-white/10 sm:rounded-xl sm:px-4 sm:text-sm"
  >
    Log out
  </button>
</div>
  </div>
</header>

        <section className="mt-6 sm:mt-10">
  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-sm font-semibold text-green-400">
        GAMEWEEK {selectedWeek}
      </p>

      <h2 className="mt-2 text-2xl font-bold sm:text-4xl">
        Make your Predictions
      </h2>

      <p className="mt-2 text-sm leading-5 text-slate-400 sm:mt-3 sm:text-base">
        Predict each scoreline and the minute of the first goal.
      </p>
    </div>

    <div className="flex items-center justify-between gap-3 sm:justify-start">
      <button
        disabled={selectedWeek <= 1}
        onClick={() =>
          setSelectedWeek((week) =>
            Math.max(1, week - 1)
          )
        }
        className="flex-1 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold disabled:opacity-30 sm:flex-none sm:py-2"
      >
        ← Previous
      </button>

      <span className="whitespace-nowrap text-sm text-slate-400">
        {selectedWeek} / 38
      </span>

      <button
        disabled={selectedWeek >= 38}
        onClick={() =>
          setSelectedWeek((week) =>
            Math.min(38, week + 1)
          )
        }
        className="flex-1 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold disabled:opacity-30 sm:flex-none sm:py-2"
      >
        Next →
      </button>
    </div>
  </div>
</section>

<section className="mt-6 grid grid-cols-3 gap-3 sm:mt-8">
          <div className="rounded-2xl border border-blue-400/30 bg-[#102a54] px-4 py-4 sm:p-6">
            <p className="min-h-8 text-xs leading-4 text-slate-400">
  Your points
</p>
            <p className="mt-2 text-3xl font-bold sm:text-4xl">
  {totalPoints}
</p>
          </div>

          <div className="rounded-2xl border border-blue-400/30 bg-[#102a54] px-4 py-4 sm:p-6">
            <p className="text-xs leading-4 text-slate-400 sm:text-sm">
              League position
            </p>
            <p className="mt-2 text-3xl font-bold sm:text-4xl">
  {leaguePosition ?? "—"}
</p>
          </div>

          <div className="rounded-2xl border border-blue-400/30 bg-[#102a54] px-4 py-4 sm:p-6">
            <p className="text-xs leading-4 text-slate-400 sm:text-sm">
              Predictions made
            </p>
            <p className="mt-2 text-3xl font-bold sm:text-4xl">
              {predictionsMade} / {fixtures.length}
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="mb-5 text-xl font-bold">
            Gameweek {selectedWeek} fixtures
          </h3>

          {!predictionsAreOpen && (
  <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5">
    <p className="font-bold text-amber-300">
      🔒 Predictions aren't open yet
    </p>

    <p className="mt-2 text-sm text-slate-300">
      Predictions open on <strong>Monday 17 August at 9:00am</strong>.
      Until then you can browse the fixtures, check out the leaderboard and
      get familiar with the app.
    </p>
  </div>
)}
          
          {loading && (
            <p className="text-slate-400">
              Loading fixtures...
            </p>
          )}

          <div className="space-y-5">
            {fixtures.map((fixture) => {
              const prediction = predictions[fixture.id] ?? {
  home: "",
  away: "",
  firstGoal: "",
  points: 0,
};

const finished =
  fixture.home_goals !== null &&
  fixture.away_goals !== null;
      const hasPrediction =
  prediction.home !== "" &&
  prediction.away !== "";

const predictedHome = Number(prediction.home);
const predictedAway = Number(prediction.away);

const exactScore =
  finished &&
  hasPrediction &&
  predictedHome === fixture.home_goals &&
  predictedAway === fixture.away_goals;

function outcome(home: number, away: number) {
  if (home > away) return "H";
  if (home < away) return "A";
  return "D";
}

const correctResult =
  finished &&
  hasPrediction &&
  !exactScore &&
  outcome(predictedHome, predictedAway) ===
    outcome(fixture.home_goals!, fixture.away_goals!);

const exactFirstGoal =
  finished &&
  fixture.first_goal_minute !== null &&
  prediction.firstGoal !== "" &&
  Number(prediction.firstGoal) === fixture.first_goal_minute;
              const locked = isLocked(fixture);

              const isNilNil =
                prediction.home === "0" &&
                prediction.away === "0";

              return (
                <div
                  key={fixture.id}
                  className={`rounded-2xl border p-6 ${
                    locked
                      ? "border-red-400/20 bg-red-950/20"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-400">
                      {new Date(
                        fixture.kickoff
                      ).toLocaleString("en-GB", {
                        timeZone: "Europe/London",
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {locked ? (
                      <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-300">
                        LOCKED
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-bold text-green-300">
                        OPEN
                      </span>
                    )}
                  </div>
{finished && (
  <div className="mb-6 rounded-xl border border-green-400/30 bg-green-500/10 p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold tracking-widest text-green-400">
          FINAL RESULT
        </p>

        <p className="mt-2 text-xl font-bold">
          {fixture.home_team} {fixture.home_goals}
          {" – "}
          {fixture.away_goals} {fixture.away_team}
        </p>
      </div>

      <p className="text-2xl font-bold text-green-400">
        +{prediction.points} pts
      </p>
    </div>

    <div className="mt-4 border-t border-white/10 pt-4 text-sm text-slate-300">
      <p>
        Your prediction:{" "}
        <span className="font-bold text-white">
          {prediction.home || "—"}–{prediction.away || "—"}
        </span>
      </p>

      <p className="mt-1">
        Your first goal:{" "}
        <span className="font-bold text-white">
          {prediction.firstGoal
            ? `${prediction.firstGoal}'`
            : "—"}
        </span>
      </p>

      <p className="mt-1">
        Actual first goal:{" "}
        <span className="font-bold text-white">
          {fixture.first_goal_minute !== null
            ? `${fixture.first_goal_minute}'`
            : "No goal"}
        </span>
      </p>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
  {exactScore && (
    <span className="rounded-full bg-green-400/15 px-3 py-1 text-sm font-semibold text-green-300">
      🎯 Exact score +5
    </span>
  )}

  {correctResult && (
    <span className="rounded-full bg-blue-400/15 px-3 py-1 text-sm font-semibold text-blue-300">
      ✓ Correct result +3
    </span>
  )}

  {exactFirstGoal && (
    <span className="rounded-full bg-green-400/15 px-3 py-1 text-sm font-semibold text-green-300">
      ⏱ Exact first goal +5
    </span>
  )}

  {!exactScore && !correctResult && !exactFirstGoal && (
    <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-400">
      No points from this match
    </span>
  )}
</div>
    </div>
  </div>
)}
                  {!finished && (
  <>
                  <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-2 sm:gap-4">
  <p className="min-w-0 text-right text-sm font-semibold sm:text-base">
    {fixture.home_team}
  </p>

  <input
    type="number"
    min="0"
    disabled={locked || !predictionsAreOpen}
    value={prediction.home}
    onChange={(event) =>
      updatePrediction(
        fixture.id,
        "home",
        event.target.value
      )
    }
    className="h-12 w-12 rounded-xl bg-white text-center text-xl font-bold text-slate-950 outline-none disabled:bg-slate-600 disabled:text-slate-300 sm:h-auto sm:w-16 sm:px-3 sm:py-3"
  />

  <span className="text-sm font-semibold text-slate-400">
    v
  </span>

  <input
    type="number"
    min="0"
    disabled={locked || !predictionsAreOpen}
    value={prediction.away}
    onChange={(event) =>
      updatePrediction(
        fixture.id,
        "away",
        event.target.value
      )
    }
    className="h-12 w-12 rounded-xl bg-white text-center text-xl font-bold text-slate-950 outline-none disabled:bg-slate-600 disabled:text-slate-300 sm:h-auto sm:w-16 sm:px-3 sm:py-3"
  />

  <p className="min-w-0 text-left text-sm font-semibold sm:text-base">
    {fixture.away_team}
  </p>
</div>

                  <div className="mt-5 border-t border-white/10 pt-4">
  <div className="flex items-center justify-between gap-4">
    <div>
      <label className="block text-sm font-semibold text-slate-300">
        First goal minute
      </label>

      <p className="mt-1 text-xs text-slate-500">
        Deadline:{" "}
        {getDeadline(fixture).toLocaleString("en-GB", {
          timeZone: "Europe/London",
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>

    {isNilNil ? (
      <span className="text-sm text-slate-400">Not required</span>
    ) : (
      <input
        type="number"
        min="1"
        max="120"
        disabled={locked || !predictionsAreOpen}
        placeholder="0"
        value={prediction.firstGoal}
        onChange={(event) =>
          updatePrediction(
            fixture.id,
            "firstGoal",
            event.target.value
          )
        }
        className="w-20 rounded-xl bg-white px-2 py-2 text-center text-lg font-bold text-slate-950 outline-none disabled:bg-slate-600 disabled:text-slate-300"
      />
    )}
  </div>
</div>
      </>
)}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-red-500/15 p-4 text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-xl bg-green-500/15 p-4 text-green-300">
              {message}
            </div>
          )}

          {!loading && fixtures.some((fixture) => !isLocked(fixture)) && (
            <button
              onClick={savePredictions}
              disabled={saving || !predictionsAreOpen}
              className="mt-6 w-full rounded-xl bg-green-400 px-6 py-4 text-lg font-bold text-slate-950 transition hover:bg-green-300 disabled:opacity-60"
            >
              {!predictionsAreOpen
  ? "Predictions open 17 August"
  : saving
    ? "Saving..."
    : `Save Gameweek ${selectedWeek} Predictions`}
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
