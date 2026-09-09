"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
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
    setLoading(true);

    try {
      /*
       * 1. Login with Supabase Auth
       */

      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log(
        "LOGIN USER:",
        data.user
      );

      console.log(
        "LOGIN ERROR:",
        loginError
      );

      if (loginError) {
        throw loginError;
      }

      if (!data.user) {
        throw new Error(
          "Login failed."
        );
      }

      /*
       * 2. Check that a session actually exists
       */

      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log(
        "LOGIN SESSION:",
        sessionData.session
      );

      console.log(
        "SESSION ERROR:",
        sessionError
      );

      if (sessionError) {
        throw new Error(
          sessionError.message
        );
      }

      if (!sessionData.session) {
        throw new Error(
          "Login succeeded, but no authentication session was created."
        );
      }

      /*
       * 3. Check whether this user is an admin
       */

      const {
        data: admin,
        error: adminError,
      } = await supabase
        .from("admin_users")
        .select(
          "id, user_id, branch_id, role"
        )
        .eq(
          "user_id",
          data.user.id
        )
        .maybeSingle();

      console.log(
        "ADMIN DATA:",
        admin
      );

      console.log(
        "ADMIN ERROR:",
        adminError
      );

      if (adminError) {
        throw new Error(
          `Unable to verify admin account: ${adminError.message}`
        );
      }

      if (!admin) {
        throw new Error(
          "You are not registered as an admin."
        );
      }

      /*
       * 4. Admin verified
       */

      console.log(
        "ADMIN LOGIN SUCCESS"
      );

      console.log(
        "ADMIN BRANCH:",
        admin.branch_id
      );

      /*
       * Give Supabase a moment to finish
       * persisting the browser session before
       * navigating to the admin dashboard.
       */

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 300)
      );

      router.replace("/admin");

    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      /*
       * Only sign out when the login itself
       * should not remain active.
       */

      await supabase.auth.signOut();

      setError(
        error instanceof Error
          ? error.message
          : "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50 px-6">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">

        {/* LOGO */}

        <div className="text-center">

          <div className="text-5xl">
            🔐
          </div>

          <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
            Anil's Juice Station
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
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

            <label className="text-sm font-bold text-gray-800">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="admin@example.com"
              required
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500"
            />

          </div>

          {/* PASSWORD */}

          <div>

            <label className="text-sm font-bold text-gray-800">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="••••••••"
              required
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500"
            />

          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {/* LOGIN */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-orange-500 py-3.5 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Logging in..."
              : "Login as Admin"}
          </button>

        </form>

      </div>

    </main>
  );
}