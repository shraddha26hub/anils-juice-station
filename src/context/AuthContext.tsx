"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AdminInfo = {
  id: string;
  user_id: string;
  branch_id: number;
  role: string;
};

type AuthContextType = {
  user: User | null;
  admin: AdminInfo | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAdmin(userId: string) {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, user_id, branch_id, role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
  console.error(
    "ADMIN PROFILE ERROR:",
    JSON.stringify(error, null, 2)
  );

  setAdmin(null);
  return;
}

    setAdmin(data);
  }

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await loadAdmin(session.user.id);
      } else {
        setUser(null);
        setAdmin(null);
      }

      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadAdmin(session.user.id);
        } else {
          setUser(null);
          setAdmin(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();

    setUser(null);
    setAdmin(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}