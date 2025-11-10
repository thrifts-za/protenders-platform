"use client";

import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { identifyUser } from "@/lib/analytics";

function SessionTracker({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userId = session.user.id || session.user.email || 'unknown';

      // Simplified user identification
      identifyUser(userId, {
        '$email': session.user.email,
        '$name': session.user.name,
        'role': (session.user as any).role,
      });

      console.log('Mixpanel: Authenticated user identified', userId);
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
