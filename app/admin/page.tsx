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
  home_team: string;
  away_team: string;
  home_goals: number | null;
  away_goals: number | null;
  first_goal_minute: number | null;
};

type ResultInput = {
  homeGoals: string;
  awayGoals: string;
  firstGoal: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [results, setResults] = useState<Record<number, ResultInput>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const weekFixtures = useMemo(
    () =>
      fixtures.filter(
        (fixture) => fixture.matchweek === selectedWeek
      ),
    [fixtures, selectedWeek]
  );

  useEffect(() => {
    async function loadAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("fixtures")
        .select(
          "id, matchweek, kickoff, home_team, away_team, home_goals, away_goals, first_goal_minute"
        )
        .order("matchweek", { ascending: true })
        .order("kickoff", { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const loadedFixtures = data ?? [];
      setFixtures(loadedFixtures);

      const initialResults: Record<number, ResultInput> = {};

      loadedFixtures.forEach((fixture) => {
        initialResults[fixture.id] = {
          homeGoals:
            fixture.home_goals?.toString() ?? "",
          awayGoals:
            fixture.away_goals?.toString() ?? "",
          firstGoal:
            fixture.first_goal_minute?.toString() ?? "",
        };
      });

      setResults(initialResults);

      const now = Date.now();

      const currentFixture =
        loadedFixtures.find(
          (fixture) =>
            new Date(fixture.kickoff).getTime() >= now
        ) ?? loadedFixtures.at(-1);

      setSelectedWeek(currentFixture?.matchweek ?? 1);

      setLoading(false);
    }

    loadAdmin();
  }, [router]);

  function updateResult(
    fixtureId: number,
    field: keyof ResultInput,
    value: string
  ) {
    setResults((current) => ({
      ...current,
      [fixtureId]: {
        ...current[fixtureId],
        [field]: value,
      },
    }));

    setError("");
    setMessage("");
  }

  async function saveResults() {
    setError("");
    setMessage("");

    const completedFixtures = weekFixtures.filter((fixture) => {
      const result = results[fixture.id];

      return (
        result &&
        result.homeGoals !== "" &&
        result.awayGoals !== ""
      );
    });

    if (completedFixtures.length === 0) {
      setError("Enter at least one completed result.");
      return;
    }

    setSaving(true);

    for (const fixture of completedFixtures) {
      const result = results[fixture.id];

      const homeGoals = Number(result.homeGoals);
      const awayGoals = Number(result.awayGoals);

      if (
        !Number.isInteger(homeGoals) ||
        !Number.isInteger(awayGoals) ||
        homeGoals < 0 ||
        awayGoals < 0
      ) {
        setSaving(false);
        setError(
          `${fixture.home_team} vs ${fixture.away_team}: enter valid scores.`
        );
        return;
      }

      let firstGoalMinute: number | null = null;

      if (homeGoals === 0 && awayGoals === 0) {
        firstGoalMinute = null;
      } else {
        if (result.firstGoal === "") {
          setSaving(false);
          setError(
            `${fixture.home_team} vs ${fixture.away_team}: enter the first-goal minute.`
          );
          return;
        }

        firstGoalMinute = Number(result.firstGoal);

        if (
          !Number.isInteger(firstGoalMinute) ||
          firstGoalMinute < 1 ||
          firstGoalMinute > 120
        ) {
          setSaving(false);
          setError(
            `${fixture.home_team} vs ${fixture.away_team}: first-goal minute must be between 1 and 120.`
          );
          return;
        }
      }

      const { error: updateError } = await supabase
        .from("fixtures")
        .update({
          home_goals: homeGoals,
          away_goals: awayGoals,
          first_goal_minute: firstGoalMinute,
        })
        .eq("id", fixture.id);

      if (updateError) {
        setSaving(false);
        setError(updateError.message);
        return;
      }
    }

    setSaving(false);
    setMessage(
      `${completedFixtures.length} result${
        completedFixtures.length === 1 ? "" : "s"
      } saved. Points should now be recalculated automatically.`
    );
  }

  return (
    <main className="min-h-screen bg-[#07152d] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-bold tracking-[0.25em] text-green-400">
              ADMIN
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Match Results
            </h1>

            <p className="mt-2 text-slate-400">
              Enter official results and first-goal minutes.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-white/20 px-4 py-2 font-semibold hover:bg-white/10"
          >
            ← Back to dashboard
          </button>
        </header>

        <section className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">
            Gameweek {selectedWeek}
          </h2>

          <div className="flex items-center gap-3">
            <button
              disabled={selectedWeek <= 1}
              onClick={() =>
                setSelectedWeek((week) =>
                  Math.max(1, week - 1)
                )
              }
              className="rounded-xl border border-white/20 px-4 py-2 font-semibold disabled:opacity-30"
            >
              ← Previous
            </button>

            <span className="text-slate-400">
              {selectedWeek} / 38
            </span>

            <button
              disabled={selectedWeek >= 38}
              onClick={() =>
                setSelectedWeek((week) =>
                  Math.min(38, week + 1)
                )
              }
              className="rounded-xl border border-white/20 px-4 py-2 font-semibold disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </section>

        {loading && (
          <p className="mt-10 text-slate-400">
            Loading fixtures...
          </p>
        )}

        <section className="mt-8 space-y-5">
          {weekFixtures.map((fixture) => {
            const result = results[fixture.id] ?? {
              homeGoals: "",
              awayGoals: "",
              firstGoal: "",
            };

            const nilNil =
              result.homeGoals === "0" &&
              result.awayGoals === "0";

            return (
              <div
                key={fixture.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <p className="mb-4 text-sm text-slate-400">
                  {new Date(fixture.kickoff).toLocaleString(
                    "en-GB",
                    {
                      timeZone: "Europe/London",
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>

                <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_auto_auto_1fr]">
                  <p className="font-semibold md:text-right">
                    {fixture.home_team}
                  </p>

                  <input
                    type="number"
                    min="0"
                    value={result.homeGoals}
                    onChange={(event) =>
                      updateResult(
                        fixture.id,
                        "homeGoals",
                        event.target.value
                      )
                    }
                    className="w-16 rounded-xl bg-white px-3 py-3 text-center text-xl font-bold text-slate-950"
                  />

                  <span className="text-slate-500">—</span>

                  <input
                    type="number"
                    min="0"
                    value={result.awayGoals}
                    onChange={(event) =>
                      updateResult(
                        fixture.id,
                        "awayGoals",
                        event.target.value
                      )
                    }
                    className="w-16 rounded-xl bg-white px-3 py-3 text-center text-xl font-bold text-slate-950"
                  />

                  <p className="font-semibold">
                    {fixture.away_team}
                  </p>
                </div>

                <div className="mt-5 border-t border-white/10 pt-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    First goal minute
                  </label>

                  {nilNil ? (
                    <p className="text-sm text-slate-400">
                      No first goal for a 0–0 result.
                    </p>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      max="120"
                      placeholder="e.g. 18"
                      value={result.firstGoal}
                      onChange={(event) =>
                        updateResult(
                          fixture.id,
                          "firstGoal",
                          event.target.value
                        )
                      }
                      className="w-32 rounded-xl bg-white px-4 py-3 text-slate-950"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </section>

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

        {!loading && (
          <button
            onClick={saveResults}
            disabled={saving}
            className="mt-6 w-full rounded-xl bg-green-400 px-6 py-4 text-lg font-bold text-slate-950 transition hover:bg-green-300 disabled:opacity-60"
          >
            {saving
              ? "Saving results..."
              : `Save Gameweek ${selectedWeek} Results`}
          </button>
        )}
      </div>
    </main>
  );
}
