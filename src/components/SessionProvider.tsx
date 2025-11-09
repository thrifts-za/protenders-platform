"use client";

import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { identifyUser } from "@/lib/analytics";

function SessionTracker({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Identify user in analytics
      identifyUser(session.user.id || session.user.email || 'unknown', {
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role,
      });
    }
  }, [session, status]);

  return <>{children}</>;
}

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthSessionProvider>
      <SessionTracker>{children}</SessionTracker>
    </NextAuthSessionProvider>
  );
}
