import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface User {
  email: string;
  name: string;
  avatar: string;
}

interface AuthCtx {
  user: User | null;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  sendOtp: async () => {},
  verifyOtp: async () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(Ctx);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const sendOtp = useCallback(async (_email: string) => {
    // Demo mode: simulate sending OTP without generating or storing one
    await new Promise((r) => setTimeout(r, 500));
  }, []);

  const verifyOtp = useCallback(async (email: string, _otp: string) => {
    // Demo mode: accept any numeric input without validation
    await new Promise((r) => setTimeout(r, 400));
    const name = email.split("@")[0];
    setUser({
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      avatar: name.charAt(0).toUpperCase(),
    });
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  return (
    <Ctx.Provider value={{ user, sendOtp, verifyOtp, signOut }}>
      {children}
    </Ctx.Provider>
  );
};
