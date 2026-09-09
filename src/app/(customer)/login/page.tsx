"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        throw new Error(loginError.message);
      }

      if (!data.user) {
        throw new Error("Login failed.");
      }

      // Check whether the user is an admin
      const {
        data: admin,
        error: adminError,
      } = await supabase
        .from("admin_users")
        .select("id, user_id, branch_id, role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminError) {
        console.error("ADMIN CHECK ERROR:", adminError);

        await supabase.auth.signOut();

        throw new Error(
          "Unable to verify your admin account."
        );
      }

      if (!admin) {
        await supabase.auth.signOut();

        throw new Error(
          "This account does not have admin access."
        );
      }

      // Successful admin login
      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to login.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-orange-50 px-6 py-16">

      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">

        <div className="w-full rounded-3xl bg-white p-8 shadow-lg">

          {/* HEADER */}

          <div className="text-center">

            <div className="text-6xl">
              🍹
            </div>

            <p className="mt-5 text-sm font-bold uppercase tracking-[0.25em] text-orange-500">
              Anil&apos;s Juice Station
            </p>

            <h1 className="mt-3 text-3xl font-extrabold text-gray-900">
              Admin Login
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              Login to manage your branch.
            </p>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label className="mb-2 block text-sm font-bold text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="admin@example.com"
                autoComplete="email"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-bold text-gray-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-orange-500 px-6 py-4 font-bold text-white shadow-md transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Logging in..."
                : "Login to Dashboard"}
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}