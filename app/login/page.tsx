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
  <main className="min-h-screen bg-slate-100">
    <div className="mx-auto flex min-h-screen max-w-7xl">

      {/* LEFT SIDE */}

      <div className="hidden w-1/2 flex-col justify-center px-16 lg:flex">

        <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-blue-600">
          FleetOS
        </p>

        <h1 className="text-6xl font-black leading-tight text-slate-900">
          Modern Fleet
          <br />
          Management
        </h1>

        <p className="mt-8 max-w-lg text-xl leading-9 text-slate-600">
          Manage vehicles, drivers, compliance,
          maintenance and reporting from one
          secure platform.
        </p>

        <div className="mt-12 space-y-5">

          <div className="flex items-center gap-3">
            <span className="text-emerald-500">✓</span>
            <span className="text-lg text-slate-700">
              Vehicle Management
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-500">✓</span>
            <span className="text-lg text-slate-700">
              Driver Database
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-500">✓</span>
            <span className="text-lg text-slate-700">
              Compliance Tracking
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-500">✓</span>
            <span className="text-lg text-slate-700">
              Maintenance Scheduling
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-500">✓</span>
            <span className="text-lg text-slate-700">
              Reporting & Analytics
            </span>
          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-2xl">
        </form>

</div>

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
