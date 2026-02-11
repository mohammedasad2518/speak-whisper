import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface User {
  email: string;
  name: string;
  avatar: string;
}

interface AuthCtx {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(Ctx);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const signIn = useCallback(async (email: string, _password: string) => {
    // Mock auth — accept any credentials
    await new Promise((r) => setTimeout(r, 400));
    const name = email.split("@")[0];
    setUser({
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      avatar: name.charAt(0).toUpperCase(),
    });
  }, []);

  const signUp = useCallback(async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    setUser({
      email,
      name,
      avatar: name.charAt(0).toUpperCase(),
    });
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  return (
    <Ctx.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </Ctx.Provider>
  );
};
