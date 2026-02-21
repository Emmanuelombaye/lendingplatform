// src/app/components/auth.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Eye,
    EyeOff,
    Loader2,
    ArrowRight,
    ShieldCheck,
    Lock,
    Mail,
    User,
    Phone,
    AlertCircle,
    CheckCircle2,
    Camera,
    Smartphone,
    RefreshCw,
    ChevronLeft
} from "lucide-react";
import { authService } from "../../lib/authUtils";
import { cn } from "./ui";

// ─── Shared Wrapper ──────────────────────────────────────────────────────────
const AuthCard = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white flex items-center justify-center px-4 py-16">
        {/* Background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-32 w-96 h-96 bg-blue-400/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-indigo-400/10 blur-3xl rounded-full" />
        </div>

        <div className="relative z-10 w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-10">
                <a href="/" className="inline-flex items-center gap-3 group">
                    <img
                        src="/logovertex.png"
                        alt="GETVERTEX"
                        className="h-10 w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="text-2xl font-black tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors">
                        VERTEX
                    </span>
                </a>
            </div>

            <div className="bg-white/80 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] rounded-[40px] p-10 border border-white">
                {children}
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2">
                    <Lock size={14} className="text-emerald-500" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SSL Secured</span>
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Licensed Lender</span>
                </div>
            </div>
        </div>
    </div>
);

// ─── Input Component ──────────────────────────────────────────────────────────
const AuthInput = ({
    icon: Icon,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    rightElement,
    required,
}: {
    icon: any;
    label: string;
    type?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    rightElement?: React.ReactNode;
    required?: boolean;
}) => (
    <div className="space-y-2">
        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
            {label}
        </label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Icon size={18} />
            </div>
            <input
                type={type}
                required={required}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl pl-11 pr-11 py-4 text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium text-sm"
            />
            {rightElement && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {rightElement}
                </div>
            )}
        </div>
    </div>
);

// ─── OTP Verification Component ───────────────────────────────────────────────
const OTPVerification = ({
    email,
    onSuccess,
    onBack,
    isSimulated = false,
}: {
    email: string;
    onSuccess: (data: any) => void;
    onBack: () => void;
    isSimulated?: boolean;
}) => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(60);

    React.useEffect(() => {
        let timer: any;
        if (countdown > 0) {
            timer = setInterval(() => setCountdown(c => c - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join("");
        if (otpString.length < 6) {
            setError("Please enter the full 6-digit code.");
            return;
        }

        setLoading(true);
        setError("");
        const result = await authService.verifyOTP(email, otpString, navigate);

        if (result.success && result.data) {
            onSuccess(result.data);
        } else {
            setError(result.message || "Verification failed. Please try again.");
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        setResending(true);
        const result = await authService.resendOTP(email);
        setResending(false);
        if (result.success) {
            setCountdown(60);
            setError("");
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest mb-8 transition-colors"
            >
                <ChevronLeft size={16} /> Back
            </button>

            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-sm">
                    <Mail size={32} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verify Your Email</h1>
                <p className="text-slate-500 mt-2 font-medium text-sm">
                    Enter the 6-digit code sent to
                    <span className="block font-bold text-slate-900 mt-1">{email}</span>
                </p>

                {isSimulated && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-[11px] font-bold uppercase tracking-wider animate-pulse">
                        ⚠️ Simulator Mode: Check Server Logs for OTP
                    </div>
                )}
            </div>

            {error && <div className="mb-6"><Alert type="error" message={error} /></div>}

            <div className="flex justify-between gap-2 mb-8">
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        autoFocus={i === 0}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className="w-12 h-14 text-center text-xl font-black bg-white border-2 border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none transition-all shadow-sm"
                    />
                ))}
            </div>

            <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify & Continue"}
            </button>

            <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                    Didn't receive the code?
                </p>
                <button
                    onClick={handleResend}
                    disabled={countdown > 0 || resending}
                    className={cn(
                        "mt-2 text-sm font-bold flex items-center justify-center gap-2 mx-auto",
                        countdown > 0 ? "text-slate-300" : "text-blue-600 hover:text-blue-700"
                    )}
                >
                    {resending ? <RefreshCw className="animate-spin" size={14} /> : null}
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend New Code"}
                </button>
            </div>
        </div>
    );
};
const Alert = ({
    type,
    message,
}: {
    type: "error" | "success";
    message: string;
}) => {
    const isSuccess = type === "success";
    return (
        <div
            className={cn(
                "flex items-start gap-3 p-4 rounded-2xl text-sm font-medium",
                isSuccess
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-800"
            )}
        >
            {isSuccess ? (
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p>{message}</p>
        </div>
    );
};

// ─── Password Strength ────────────────────────────────────────────────────────
const PasswordStrength = ({ password }: { password: string }) => {
    const checks = [
        { label: "8+ chars", ok: password.length >= 8 },
        { label: "Uppercase", ok: /[A-Z]/.test(password) },
        { label: "Number", ok: /\d/.test(password) },
        { label: "Special", ok: /[!@#$%^&*]/.test(password) },
    ];
    const score = checks.filter((c) => c.ok).length;
    const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
    const labels = ["Weak", "Fair", "Good", "Strong"];

    if (!password) return null;

    return (
        <div className="space-y-2">
            <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1.5 flex-1 rounded-full transition-all duration-300",
                            i < score ? colors[score - 1] : "bg-slate-100"
                        )}
                    />
                ))}
            </div>
            <div className="flex justify-between items-center">
                <div className="flex gap-3">
                    {checks.map((c) => (
                        <span
                            key={c.label}
                            className={cn(
                                "text-[10px] font-bold",
                                c.ok ? "text-emerald-600" : "text-slate-400"
                            )}
                        >
                            {c.ok ? "✓" : "○"} {c.label}
                        </span>
                    ))}
                </div>
                {score > 0 && (
                    <span
                        className={cn(
                            "text-[10px] font-black uppercase tracking-wider",
                            score === 4 ? "text-emerald-600" : score >= 2 ? "text-yellow-600" : "text-red-500"
                        )}
                    >
                        {labels[score - 1]}
                    </span>
                )}
            </div>
        </div>
    );
};

// ─── Login Page ───────────────────────────────────────────────────────────────
export const Login = ({ onLoginSuccess }: { onLoginSuccess: (data: any) => void }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }
        setLoading(true);
        setError("");
        const result = await authService.login(email, password, navigate);
        if (result.success && result.data) {
            onLoginSuccess(result.data);
        } else {
            setError(result.message || "Login failed. Please try again.");
            setLoading(false);
        }
    };


    return (
        <AuthCard>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Welcome back
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Sign in to access your dashboard
                </p>
            </div>

            {error && <div className="mb-6"><Alert type="error" message={error} /></div>}


            <form onSubmit={handleSubmit} className="space-y-5">
                <>
                    <AuthInput
                        icon={Mail}
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="you@example.com"
                        required
                    />

                    <AuthInput
                        icon={Lock}
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={setPassword}
                        placeholder="Enter your password"
                        required
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                    />
                </>

                <div className="flex items-center justify-end">
                    <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        Forgot password?
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Signing in...
                        </>
                    ) : (
                        <>
                            Sign In
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-slate-500 text-sm">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-blue-600 font-black hover:text-blue-700 transition-colors"
                    >
                        Create one free →
                    </Link>
                </p>
            </div>
        </AuthCard>
    );
};

// ─── Register Page ────────────────────────────────────────────────────────────
export const Register = ({ onLoginSuccess }: { onLoginSuccess: (data: any) => void }) => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName || !email || !password) {
            setError("Full name, email, and password are required.");
            return;
        }

        if (!agreedToTerms) {
            setError("Please accept the Terms & Conditions to continue.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        setError("");

        const result = await authService.register(
            { fullName, email, phone: phone || undefined, password },
            navigate
        );

        if (result.success && result.data) {
            onLoginSuccess(result.data);
        } else {
            setError(result.message || "Registration failed. Please try again.");
            setLoading(false);
        }
    };


    return (
        <AuthCard>
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-4">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                        Free to Join
                    </span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Create your account
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Start your loan application in minutes
                </p>
            </div>

            {error && <div className="mb-6"><Alert type="error" message={error} /></div>}

            <form onSubmit={handleSubmit} className="space-y-5">
                <AuthInput
                    icon={User}
                    label="Full Name"
                    value={fullName}
                    onChange={setFullName}
                    placeholder="John Kamau"
                    required
                />

                <AuthInput
                    icon={Mail}
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    required
                />

                <AuthInput
                    icon={Phone}
                    label="Phone Number (optional)"
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    placeholder="+254 700 000 000"
                />

                <div className="space-y-2">
                    <AuthInput
                        icon={Lock}
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={setPassword}
                        placeholder="Create a strong password"
                        required
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                    />
                    <PasswordStrength password={password} />
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="mt-0.5">
                        <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="sr-only"
                        />
                        <div
                            className={cn(
                                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                                agreedToTerms
                                    ? "bg-blue-600 border-blue-600"
                                    : "border-slate-300 group-hover:border-blue-400"
                            )}
                        >
                            {agreedToTerms && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <span className="text-sm text-slate-600">
                        I agree to the{" "}
                        <a href="/Downloads/TERMS%20&%20CONDITIONS.pdf" target="_blank" className="text-blue-600 font-bold hover:underline">
                            Terms & Conditions
                        </a>{" "}
                        and acknowledge this is a genuine loan application.
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Creating account...
                        </>
                    ) : (
                        <>
                            Create Account & Apply
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-slate-500 text-sm">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-blue-600 font-black hover:text-blue-700 transition-colors"
                    >
                        Sign in →
                    </Link>
                </p>
            </div>
        </AuthCard>
    );
};