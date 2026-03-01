import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useTranslation } from "react-i18next";

type Step = "form" | "otp";

const Register = () => {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(name, email, password);
      toast.success("OTP sent! Check your email.");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter the full 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      toast.success("Email verified! Welcome to Ayurvedh 🌿");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired OTP");
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      await authApi.resendOtp(email, "registration");
      toast.success("A new OTP has been sent to your email");
    } catch {
      toast.error("Could not resend OTP. Please try again.");
    }
    setResending(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Step 1: Registration form */}
        {step === "form" && (
          <>
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-bold">{t("createAccount")}</h1>
              <p className="text-muted-foreground mt-2 text-sm">{t("joinCommunity")}</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("fullName")}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("email")}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("password")}</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground text-background py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? t("sendingOtp") : t("createAccount")}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">{t("orContinueWith")}</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-3 py-2.5 border border-border rounded-sm text-sm font-medium hover:bg-muted transition-colors"
              onClick={() => toast.info("Google sign-in coming soon!")}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t("continueWithGoogle")}
            </button>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {t("alreadyHaveAccount")}{" "}
              <Link to="/login" className="text-foreground font-medium hover:underline">{t("signIn")}</Link>
            </p>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h1 className="font-serif text-3xl font-bold">{t("verifyEmail")}</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {t("codeSentTo")}{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
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

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-foreground text-background py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? t("verifying") : t("verifyCreateAccount")}
              </button>
            </form>

            <div className="text-center mt-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("didntReceiveCode")}{" "}
                <button
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-foreground font-medium hover:underline disabled:opacity-50"
                >
                  {resending ? t("sending") : t("resendOtp")}
                </button>
              </p>
              <button
                onClick={() => setStep("form")}
                className="text-xs text-muted-foreground hover:underline"
              >
                {t("backToRegistration")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
