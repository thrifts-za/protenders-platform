"use client";

import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { identifyUser } from "@/lib/analytics";

function SessionTracker({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Identify user in analytics with their unique ID
      const userId = session.user.id || session.user.email || 'unknown';

      identifyUser(userId, {
        $email: session.user.email, // Reserved property for email
        $name: session.user.name, // Reserved property for name
        user_type: 'registered', // Track as registered user
        role: (session.user as any).role,
        last_login: new Date().toISOString(),
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
