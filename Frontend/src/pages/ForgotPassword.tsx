import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type Step = "email" | "otp" | "newPassword";

const ForgotPassword = () => {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { forgotPassword, resetPassword } = useAuth();
    const navigate = useNavigate();

    // Step 1 — Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword(email);
            toast.success("OTP sent! Check your email.");
            setStep("otp");
        } catch (err: any) {
            toast.error(err?.message || "Failed to send OTP");
        }
        setLoading(false);
    };

    // Step 2 — Verify OTP (just advances UI, real verify happens with reset)
    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) { toast.error("Enter the full 6-digit OTP"); return; }
        setStep("newPassword");
    };

    // Step 3 — Reset password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
        setLoading(true);
        try {
            await resetPassword(email, otp, newPassword);
            toast.success("Password reset! Please log in.");
            navigate("/login");
        } catch (err: any) {
            toast.error(err?.message || "Invalid OTP or request expired");
            setStep("otp");
            setOtp("");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                {/* Step 1: Enter email */}
                {step === "email" && (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="font-serif text-3xl font-bold">Forgot Password</h1>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Enter your email and we'll send you a reset code.
                            </p>
                        </div>
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-foreground text-background py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {loading ? "Sending..." : "Send Reset Code"}
                            </button>
                        </form>
                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Remember it?{" "}
                            <Link to="/login" className="text-foreground font-medium hover:underline">Sign In</Link>
                        </p>
                    </>
                )}

                {/* Step 2: Enter OTP */}
                {step === "otp" && (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="font-serif text-3xl font-bold">Enter Code</h1>
                            <p className="text-muted-foreground mt-2 text-sm">
                                We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
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
                                disabled={otp.length !== 6}
                                className="w-full bg-foreground text-background py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                Continue
                            </button>
                        </form>
                        <div className="text-center mt-4">
                            <button onClick={() => { setStep("email"); setOtp(""); }} className="text-xs text-muted-foreground hover:underline">
                                ← Back
                            </button>
                        </div>
                    </>
                )}

                {/* Step 3: New password */}
                {step === "newPassword" && (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="font-serif text-3xl font-bold">New Password</h1>
                            <p className="text-muted-foreground mt-2 text-sm">Set a new password for your account.</p>
                        </div>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">New Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="Min. 6 characters"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="Same as above"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-foreground text-background py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    </>
                )}

            </div>
        </div>
    );
};

export default ForgotPassword;
