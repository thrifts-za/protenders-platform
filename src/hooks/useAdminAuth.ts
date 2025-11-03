"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export function useAdminAuth() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const user = session?.user as (typeof session)['user'] & { role?: string } | undefined;
  const role = user?.role || "user";

  const loading = status === "loading";
  const isAuthenticated = !!user;
  const isAdmin = role === "admin" || role === "ADMIN";

  const logout = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  return {
    user,
    loading,
    logout,
    isAdmin,
    isAuthenticated,
  };
}
