import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, AudioWaveform, ArrowLeft } from "lucide-react";

const SignInPage = () => {
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Email is required"); return; }
    setLoading(true);
    setError("");
    try {
      await sendOtp(email);
      setStep("otp");
      setSuccess("OTP sent successfully");
    } catch {
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setError("Enter the full 6-digit code"); return; }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await verifyOtp(email, otp);
      navigate("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm glass-card-strong p-8 space-y-8 animate-glass-in">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <AudioWaveform className="h-5 w-5 text-foreground" />
            <span className="text-lg font-bold tracking-tight text-foreground">NeuroVoice</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {step === "email" ? "Sign in with Email" : "Enter verification code"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {step === "email"
              ? "We'll send a one-time code to your email"
              : `Code sent to ${email}`}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 glass-input"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button type="submit" className="w-full h-11 glass-btn font-semibold text-foreground" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Verification Code</label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            {success && <p className="text-sm text-foreground font-medium">{success}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button type="submit" className="w-full h-11 glass-btn font-semibold text-foreground" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Verify & Sign In"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setOtp(""); setError(""); setSuccess(""); }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Use a different email
            </button>
          </form>
        )}

        <p className="text-xs text-muted-foreground text-center">
          OTP verification is implemented in demo mode for academic purposes.
          No real authentication or email delivery is performed.
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
