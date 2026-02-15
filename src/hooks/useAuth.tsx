import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

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

// Mock OTP store: email -> { otp, expiresAt }
type OtpEntry = { otp: string; expiresAt: number };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const otpStore = useRef<Map<string, OtpEntry>>(new Map());

  const sendOtp = useCallback(async (email: string) => {
    // Mock: generate a 6-digit OTP and store it (valid for 5 minutes)
    await new Promise((r) => setTimeout(r, 500));
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.current.set(email.toLowerCase(), {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    // In a real system this would send an email. For academic demo, log it.
    console.log(`[NeuroVoice Mock OTP] Code for ${email}: ${otp}`);
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const entry = otpStore.current.get(email.toLowerCase());
    if (!entry) throw new Error("No OTP was sent for this email");
    if (Date.now() > entry.expiresAt) {
      otpStore.current.delete(email.toLowerCase());
      throw new Error("OTP has expired. Please request a new one.");
    }
    if (entry.otp !== otp) throw new Error("Invalid OTP");
    otpStore.current.delete(email.toLowerCase());

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
