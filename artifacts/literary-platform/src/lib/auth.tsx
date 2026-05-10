import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
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
  const { user: clerkUser, isLoaded } = useUser();
  const queryClient = useQueryClient();
  const syncedRef = useRef<string | null>(null);
  const [syncDone, setSyncDone] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!clerkUser) {
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

    fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, displayName, avatarUrl }),
    })
      .then(() => {
        syncedRef.current = clerkUser.id;
        setSyncDone(true);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      })
      .catch(() => {
        setSyncDone(true);
      });
  }, [clerkUser?.id, isLoaded, queryClient]);

  const { data: user, isLoading: meLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
      staleTime: 5 * 60 * 1000,
      enabled: syncDone,
    },
  });

  const isLoading = !isLoaded || (!!clerkUser && !syncDone) || (syncDone && !!clerkUser && meLoading);

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
