import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useUser, useSession, useAuth as useClerkAuth } from "@clerk/react";
import { useGetMe, getGetMeQueryKey, setAuthTokenGetter } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthUser {
  id: number;
  username: string;
  displayName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { session, isLoaded: sessionLoaded } = useSession();
  const { getToken } = useClerkAuth();
  const queryClient = useQueryClient();
  const syncedRef = useRef<string | null>(null);
  const [syncDone, setSyncDone] = useState(false);

  const isLoaded = userLoaded && sessionLoaded;

  // Register Clerk token getter so every API call carries the JWT.
  // This runs before any query fires because useGetMe is gated on syncDone.
  useEffect(() => {
    if (!clerkUser) {
      setAuthTokenGetter(null);
      return;
    }
    setAuthTokenGetter(getToken);
    return () => {
      setAuthTokenGetter(null);
    };
  }, [clerkUser, getToken]);

  // Sync Clerk user to our database
  useEffect(() => {
    if (!isLoaded) return;

    if (!clerkUser || !session) {
      syncedRef.current = null;
      setSyncDone(false);
      return;
    }

    if (syncedRef.current === clerkUser.id) {
      setSyncDone(true);
      return;
    }

    const email = clerkUser.primaryEmailAddress?.emailAddress;
    const displayName = clerkUser.fullName || clerkUser.firstName || "مستخدم";
    const avatarUrl = clerkUser.imageUrl;

    session.getToken().then((token) => {
      return fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email, displayName, avatarUrl }),
      });
    })
      .then((res) => {
        if (!res.ok) throw new Error("sync failed");
        syncedRef.current = clerkUser.id;
        setSyncDone(true);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      })
      .catch(() => {
        // Still let the app load even if sync fails
        setSyncDone(true);
      });
  }, [clerkUser?.id, isLoaded, session, queryClient]);

  const { data: user, isLoading: meLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: 2,
      staleTime: 5 * 60 * 1000,
      enabled: syncDone,
    },
  });

  const isLoading =
    !isLoaded ||
    (!!clerkUser && !syncDone) ||
    (syncDone && !!clerkUser && meLoading);

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
