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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function clearMessages() {
    setError("");
    setMessage("");
  }

  function toggleMode() {
    clearMessages();
    setIsCreatingAccount(!isCreatingAccount);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    clearMessages();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleCreateAccount(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    clearMessages();

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`,
        },
        emailRedirectTo:
  "https://your-fleetos.vercel.app/login",
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setMessage(
      "Your account has been created. Please verify your email before signing in."
    );

    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-6 py-12">

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-100 blur-3xl opacity-60" />

        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-slate-200 blur-3xl opacity-40" />

      </div>

      <div className="relative w-full max-w-md">

        <div className="mb-10">

          <p className="mb-3 text-sm font-bold tracking-[0.35em] text-blue-600 uppercase">
            {isCreatingAccount
              ? "Create Account"
              : "Welcome to"}
          </p>

          <h1 className="text-5xl font-black tracking-tight text-slate-900">
            FleetOS
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            {isCreatingAccount
              ? "Create your FleetOS account."
              : "Manage vehicles, drivers, maintenance and compliance from one premium dashboard."}
          </p>

        </div>

        <form
          onSubmit={
            isCreatingAccount
              ? handleCreateAccount
              : handleLogin
          }
          className="rounded-3xl border border-slate-200 bg-white p-10 shadow-2xl"
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
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="mb-5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Last name
              </label>

              <input
                type="text"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                className="mb-5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </>
          )}

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email address
          </label>

          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@company.co.uk"
            className="mb-5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />

          <label className="mb-2 block text-sm font-semibold text-slate-700">
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
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />

          {isCreatingAccount && (
            <>
              <label className="mt-5 mb-2 block text-sm font-semibold text-slate-700">
                Confirm password
              </label>

              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {message}
            </div>
          )}

          {!isCreatingAccount && (
            <div className="mt-5 flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  className="rounded border-slate-300"
                />
                Remember me
              </label>

              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-slate-900 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? isCreatingAccount
                ? "Creating account..."
                : "Signing in..."
              : isCreatingAccount
              ? "Create FleetOS Account"
              : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">

          <p className="text-sm text-slate-500">
            {isCreatingAccount
              ? "Already have an account?"
              : "New to FleetOS?"}
          </p>

          <button
            type="button"
            onClick={toggleMode}
            className="mt-3 font-semibold text-blue-600 hover:text-blue-700"
          >
            {isCreatingAccount
              ? "Sign In"
              : "Create an account"}
          </button>

          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">
              Powered by <span className="font-semibold">PLK Systems</span>
            </p>

            <p className="mt-2 text-xs text-slate-400">
              FleetOS v1.0
            </p>
          </div>

        </div>

      </div>

    </main>
  );
}
