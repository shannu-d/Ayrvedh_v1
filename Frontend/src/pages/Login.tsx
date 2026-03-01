import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNeedsVerification(false);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      if (err?.data?.requiresVerification) {
        setNeedsVerification(true);
        toast.warning("Please verify your email before logging in.");
      } else {
        toast.error(err?.message || "Login failed. Check your credentials.");
      }
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!email) { toast.error("Please enter your email first"); return; }
    setResending(true);
    try {
      await authApi.resendOtp(email, "registration");
      toast.success("Verification OTP sent! Check your inbox.");
    } catch {
      toast.error("Could not resend OTP. Please try again.");
    }
    setResending(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold">{t("welcomeBack")}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t("signInAccount")}</p>
        </div>

        {needsVerification && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-sm text-sm text-amber-800">
            <p className="font-medium mb-1">{t("emailNotVerified")}</p>
            <p className="text-amber-700 mb-2">{t("emailNotVerifiedDesc")}</p>
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="text-amber-900 font-semibold underline disabled:opacity-60"
            >
              {resending ? t("sending") : t("resendVerificationOtp")}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium">{t("password")}</label>
              <Link to="/forgot-password" className="text-xs text-muted-foreground hover:underline">
                {t("forgotPassword")}
              </Link>
            </div>
            <input
              type="password"
              required
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
            {loading ? t("signingIn") : t("signIn")}
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
          {t("noAccount")}{" "}
          <Link to="/register" className="text-foreground font-medium hover:underline">{t("signUp")}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
