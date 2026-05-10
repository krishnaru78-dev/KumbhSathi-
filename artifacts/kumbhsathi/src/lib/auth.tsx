import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@workspace/api-client-react";
import { useGetMe } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem("kumbh_token");
  });

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("kumbh_token", newToken);
    } else {
      localStorage.removeItem("kumbh_token");
    }
    setTokenState(newToken);
  };

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("kumbh_token"));
  }, []);

  const { data: user, isLoading } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: token ? isLoading : false,
        setToken,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
