"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export function useAdminAuth() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const user = session?.user as any;
  const role = user?.role || "user";

  const loading = status === "loading";
  const isAuthenticated = !!user;
  const isAdmin = role === "admin" || role === "ADMIN";

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even on error
      router.push("/admin/login");
    }
  };

  return {
    user,
    loading,
    logout,
    isAdmin,
    isAuthenticated,
  };
}
