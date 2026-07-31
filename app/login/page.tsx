"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function LoginPage() {
  const router = useRouter();

  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function resetMessages() {
    setError("");
    setMessage("");
  }

  function switchMode() {
    resetMessages();
    setIsCreatingAccount((current) => !current);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    resetMessages();
    setLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setLoading(false);

    if (loginError) {
      setError(loginError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleCreateAccount(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    resetMessages();

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFirstName || !cleanLastName) {
      setError("Please enter your first and last name.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } =
      await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            first_name: cleanFirstName,
            last_name: cleanLastName,
            full_name: `${cleanFirstName} ${cleanLastName}`,
          },
          emailRedirectTo:
            "https://playpremierpicks.co.uk/login",
        },
      });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setMessage(
      "Account created. Check your email and click the confirmation link before signing in."
    );

    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
      <div className="w-full max-w-lg">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          {isCreatingAccount ? "CREATE ACCOUNT" : "WELCOME TO FLEETOS"}
        </p>

        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
          FleetOS
        </h1>

<p className="mt-3 mb-10 text-lg leading-7 text-slate-600">
  {isCreatingAccount
    ? "Create your FleetOS account."
    : "Sign in to manage your fleet, drivers and compliance from one place."}
</p>

        <form
          onSubmit={
            isCreatingAccount
              ? handleCreateAccount
              : handleLogin
          }
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl"
        >
          {isCreatingAccount && (
  <>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      First name
    </label>

    <input
      type="text"
      required
      autoComplete="given-name"
      value={firstName}
      onChange={(event) => setFirstName(event.target.value)}
      placeholder="Your first name"
      className="mb-5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
    />

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Last name
              </label>

              <input
                type="text"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
                placeholder="Your last name"
                className="mb-5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition"
              />
            </>
          )}

          <label className="mb-2 block font-semibold">
            Email
          </label>

          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="you@example.com"
            className="mb-5 w-full rounded-xl bg-white px-4 py-4 text-slate-950 outline-none"
          />

          <label className="mb-2 block font-semibold">
            Password
          </label>

          <input
            type="password"
            required
            minLength={8}
            autoComplete={
              isCreatingAccount
                ? "new-password"
                : "current-password"
            }
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Your password"
            className={`w-full rounded-xl bg-white px-4 py-4 text-slate-950 outline-none ${
              isCreatingAccount ? "mb-5" : ""
            }`}
          />

          {isCreatingAccount && (
            <>
              <label className="mb-2 block font-semibold">
                Confirm password
              </label>

              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Enter your password again"
                className="w-full rounded-xl bg-white px-4 py-4 text-slate-950 outline-none"
              />
            </>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-500/15 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-4 rounded-lg bg-green-500/15 p-3 text-sm leading-6 text-green-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading
              ? isCreatingAccount
                ? "Creating account..."
                : "Signing in..."
              : isCreatingAccount
                ? "Create Account"
                : "Sign In"}
          </button>
        <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
    <h2 className="text-lg font-semibold text-slate-900">
        Fleet Management Platform
    </h2>

    <p className="mt-2 text-sm leading-6 text-slate-600">
        Manage your vehicles, drivers, compliance, maintenance and reporting from one secure dashboard.
    </p>
</div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            {isCreatingAccount
              ? "Already have an account?"
              : "Don’t have an account?"}
          </p>

          <button
            type="button"
            onClick={switchMode}
            className="mt-2 font-semibold text-blue-600 hover:text-blue-700"
          >
            {isCreatingAccount
              ? "Sign in"
              : "Create an account"}
          </button>
        </div>

        <div className="mt-10 text-center">
    <p className="text-sm text-slate-500">
        Powered by <span className="font-semibold">PLK Systems</span>
    </p>

    <p className="mt-2 text-xs text-slate-400">
        FleetOS v1.0
    </p>
</div>
      </div>
    </main>
  );
}
