"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Branch = {
  id: number;
  name: string;
};

export default function AdminHeader() {
  const [branch, setBranch] =
    useState<Branch | null>(null);

  useEffect(() => {
    async function loadBranch() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: admin } =
        await supabase
          .from("admin_users")
          .select("branch_id")
          .eq("user_id", user.id)
          .single();

      if (!admin) return;

      const { data: branchData } =
        await supabase
          .from("branches")
          .select("id, name")
          .eq("id", admin.branch_id)
          .single();

      setBranch(branchData);
    }

    loadBranch();
  }, []);

  return (
    <header className="border-b border-orange-100 bg-white px-6 py-5 lg:ml-64">

      <div className="mx-auto flex max-w-7xl items-center justify-between">

        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
            Admin Panel
          </p>

          <h1 className="mt-1 text-xl font-extrabold text-gray-900">
            Anil&apos;s Juice Station
          </h1>
        </div>

        <div className="rounded-xl bg-orange-50 px-4 py-2 text-right">

          <p className="text-xs font-bold text-gray-400">
            Your Branch
          </p>

          <p className="font-extrabold text-orange-600">
            {branch?.name ?? "Loading..."}
          </p>

        </div>

      </div>

    </header>
  );
}