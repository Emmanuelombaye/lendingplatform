import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Shield,
  Fingerprint,
  Smartphone,
  Lock,
  User,
  Mail,
  Phone,
  KeyRound,
  Zap,
  Star,
  TrendingUp,
  Award,
  Globe,
  ArrowRight,
  Facebook,
  Chrome,
  MessageCircle,
  X,
} from "lucide-react";
import { Button, Card } from "./ui";
import api from "../../lib/api";

interface AuthProps {
  onLoginSuccess: (user: any) => void;
}

interface FormErrors {
  [key: string]: string;
}

declare global {
  interface Window {
    onTelegramAuth: (user: any) => void;
    google?: any;
    FB?: any;
  }
}

// Premium animated background component
const PremiumBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-purple-500/20 blur-[120px] rounded-full animate-pulse" />
    <div
      className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/20 via-cyan-500/10 to-blue-500/20 blur-[100px] rounded-full animate-pulse"
      style={{ animationDelay: "2s" }}
    />
    <div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-violet-500/10 to-pink-500/10 blur-[80px] rounded-full animate-pulse"
      style={{ animationDelay: "1s" }}
    />

    {/* Floating geometric shapes */}
    <div className="absolute top-20 left-20 w-20 h-20 bg-blue-500/10 rounded-full animate-float" />
    <div
      className="absolute top-1/3 right-32 w-12 h-12 bg-emerald-500/10 rounded-full animate-float"
      style={{ animationDelay: "3s" }}
    />
    <div
      className="absolute bottom-32 right-20 w-16 h-16 bg-purple-500/10 rounded-full animate-float"
      style={{ animationDelay: "1.5s" }}
    />
  </div>
);

// Trust indicators component
const TrustIndicators = () => (
  <div className="flex items-center justify-center gap-8 mb-12 opacity-70">
    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
      <Shield size={16} className="text-emerald-500" />
      <span>256-bit SSL</span>
    </div>
    <div className="w-1 h-1 bg-slate-300 rounded-full" />
    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
      <Award size={16} className="text-blue-500" />
      <span>CBK Licensed</span>
    </div>
    <div className="w-1 h-1 bg-slate-300 rounded-full" />
    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
      <Globe size={16} className="text-purple-500" />
      <span>ISO 27001</span>
    </div>
  </div>
);

// Smart form validation
const useFormValidation = (initialState: any) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateEmail = (email: string): string => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return "Password must contain uppercase, lowercase, and numbers";
    }
    return "";
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return "Phone number is required";
    const phoneRegex = /^(\+254|\+1|0)[178]\d{8}$/;
    if (!phoneRegex.test(phone))
      return "Please enter a valid phone number";
    return "";
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "phone":
        return validatePhone(value);
      case "fullName":
        return !value ? "Full name is required" : "";
      case "confirmPassword":
        return value !== values.password ? "Passwords do not match" : "";
      default:
        return "";
    }
  };

  const handleChange = (name: string, value: string) => {
    setValues((prev: any) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev: any) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev: any) => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors((prev: any) => ({ ...prev, [name]: error }));
  };

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
    );
    return isValid;
  };

  return { values, errors, touched, handleChange, handleBlur, validateAll };
};

// Premium Input Component with Password Toggle
const PremiumInput = ({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  icon: Icon,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
  placeholder: string;
  icon: any;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}) => {
  const [internalShowPassword, setInternalShowPassword] = useState(showPassword);

  const handleToggle = () => {
    const newState = !internalShowPassword;
    setInternalShowPassword(newState);
    onTogglePassword?.();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-700 tracking-tight">
        {label}
      </label>
      <div className="relative group">
        <input
          type={internalShowPassword ? "password" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`w-full pl-12 pr-${internalShowPassword ? "12" : "4"} py-4 rounded-2xl border-2 transition-all duration-300 bg-white font-medium text-slate-900 placeholder:text-slate-400 ${error && touched
            ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
            : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"
            }`}
          placeholder={placeholder}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={handleToggle}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={internalShowPassword ? "Hide password" : "Show password"}
          >
            {internalShowPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && touched && (
        <div className="p-3 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest animate-in slide-in-from-top-2">
          <ShieldAlert size={16} />
          {error}
        </div>
      )}
      {!error && touched && value && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500">
          <CheckCircle2 size={20} />
        </div>
      )}
    </div>
  );
};

// Biometric authentication component
const BiometricAuth = ({
  onBiometricLogin,
}: {
  onBiometricLogin: () => void;
}) => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (window.navigator && "credentials" in navigator) {
      setIsSupported(true);
    }
  }, []);

  if (!isSupported) return null;

  return (
    <button
      onClick={onBiometricLogin}
      className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-3 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
    >
      <Fingerprint size={20} />
      Login with Biometrics
    </button>
  );
};

// Social login buttons
const SocialLoginButton = ({
  provider,
  icon: Icon,
  onClick,
  loading = false,
}: {
  provider: string;
  icon: any;
  onClick: () => void;
  loading?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="flex-1 h-12 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-slate-700 hover:text-slate-900 disabled:opacity-50"
  >
    {loading ? (
      <Loader2 size={18} className="animate-spin" />
    ) : (
      <>
        <Icon size={18} />
        <span className="hidden sm:inline">{provider}</span>
      </>
    )}
  </button>
);

export const Login = ({ onLoginSuccess }: AuthProps) => {
  const navigate = useNavigate();
  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useFormValidation({
      email: "",
      password: "",
    });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [serverError, setServerError] = useState("");

  // Enhanced Telegram integration
  useEffect(() => {
    window.onTelegramAuth = async (user: any) => {
      setSocialLoading((prev: any) => ({ ...prev, telegram: true }));
      try {
        const res = await api.post("/auth/telegram", user);
        if (res.data.success) {
          localStorage.setItem("token", res.data.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.data));
          onLoginSuccess(res.data.data);
          navigate("/dashboard");
        }
      } catch (err: any) {
        setServerError("Telegram authentication failed. Please try again.");
      } finally {
        setSocialLoading((prev: any) => ({ ...prev, telegram: false }));
      }
    };

    // Load Telegram script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "vertexloans_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    const container = document.getElementById("telegram-login-container");
    if (container) {
      container.appendChild(script);
    }

    return () => script.remove();
  }, [navigate, onLoginSuccess]);

  const handleGoogleLogin = async () => {
    setSocialLoading((prev: any) => ({ ...prev, google: true }));
    try {
      // Simulate Google OAuth flow
      setTimeout(() => {
        setServerError("Google OAuth requires configuration. Contact support.");
        setSocialLoading((prev: any) => ({ ...prev, google: false }));
      }, 1000);
    } catch (error) {
      setServerError("Google authentication failed.");
      setSocialLoading((prev: any) => ({ ...prev, google: false }));
    }
  };

  const handleFacebookLogin = async () => {
    setSocialLoading((prev: any) => ({ ...prev, facebook: true }));
    try {
      // Simulate Facebook OAuth flow
      setTimeout(() => {
        setServerError(
          "Facebook OAuth requires configuration. Contact support.",
        );
        setSocialLoading((prev: any) => ({ ...prev, facebook: false }));
      }, 1000);
    } catch (error) {
      setServerError("Facebook authentication failed.");
      setSocialLoading((prev: any) => ({ ...prev, facebook: false }));
    }
  };

  const handleBiometricLogin = async () => {
    try {
      if ("credentials" in navigator && navigator.credentials) {
        // Simulate biometric authentication without actual WebAuthn
        // In production, you would use proper WebAuthn configuration
        const result = await new Promise((resolve) => {
          setTimeout(() => resolve(true), 1000);
        });

        if (result) {
          // Simulate biometric success
          onLoginSuccess({
            id: 1,
            fullName: "Biometric User",
            email: "user@vertex.com",
          });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      setServerError("Biometric authentication failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateAll()) return;

    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: values.email,
        password: values.password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data));
        onLoginSuccess(res.data.data);

        // Check if there's a pending application and redirect accordingly
        const pendingApplication = localStorage.getItem("pendingApplication");
        const redirectPath = localStorage.getItem("redirectAfterLogin");

        if (pendingApplication && JSON.parse(pendingApplication)) {
          localStorage.removeItem("redirectAfterLogin");
          navigate("/apply");
        } else if (redirectPath) {
          localStorage.removeItem("redirectAfterLogin");
          navigate(redirectPath);
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      setLoginAttempts((prev) => prev + 1);
      setServerError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PremiumBackground />
      <div className="min-h-screen flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md md:max-w-lg">
          <TrustIndicators />

          <Card className="p-10 bg-white/80 backdrop-blur-2xl border-0 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] rounded-[40px]">
            {/* Header */}
            <div className="text-center mb-8 md:mb-10">
              <div className="inline-flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Zap size={20} className="text-white" />
                </div>
                <img
                  src="/logovertex.png"
                  alt="VERTEX"
                  className="h-6 md:h-8 w-12 md:w-16"
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-900 tracking-tight mb-2">
                Welcome Back
              </h1>
              <p className="text-sm md:text-base text-slate-600 font-medium">
                Access your financial dashboard securely
              </p>
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Authentication Error</div>
                  <div className="text-sm mt-1">{serverError}</div>
                </div>
              </div>
            )}

            {/* Login Attempts Warning */}
            {loginAttempts >= 3 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center gap-3">
                <Shield size={20} />
                <div className="text-sm font-medium">
                  Multiple failed attempts detected. Account may be temporarily
                  locked.
                </div>
              </div>
            )}

            {/* Biometric Login */}
            <div className="mb-8">
              <BiometricAuth onBiometricLogin={handleBiometricLogin} />
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Or continue with email
              </span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              <PremiumInput
                label="Email Address"
                type="email"
                value={values.email}
                onChange={(value) => handleChange("email", value)}
                onBlur={() => handleBlur("email")}
                error={errors.email}
                touched={touched.email}
                placeholder="Enter your email"
                icon={Mail}
              />

              <PremiumInput
                label="Password"
                type="password"
                value={values.password}
                onChange={(value) => handleChange("password", value)}
                onBlur={() => handleBlur("password")}
                error={errors.password}
                touched={touched.password}
                placeholder="Enter your password"
                icon={KeyRound}
                showPasswordToggle={true}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 md:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock size={18} />
                    Sign In Securely
                  </div>
                )}
              </Button>
            </form>

            {/* Social Login */}
            <div className="mt-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Quick Access
                </span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <SocialLoginButton
                  provider="Google"
                  icon={Chrome}
                  onClick={handleGoogleLogin}
                  loading={socialLoading.google}
                />
                <SocialLoginButton
                  provider="Facebook"
                  icon={Facebook}
                  onClick={handleFacebookLogin}
                  loading={socialLoading.facebook}
                />
              </div>

              <div className="flex justify-center">
                <div
                  id="telegram-login-container"
                  className="flex justify-center"
                />
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-10 text-center">
              <span className="text-slate-600 font-medium">
                Don't have an account?{" "}
              </span>
              <button
                onClick={() => navigate("/register")}
                className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
              >
                Create Account
              </button>
            </div>
          </Card>

          {/* Security Notice */}
          <div className="mt-8 text-center text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Protected by enterprise-grade security. Your data is encrypted and
            never shared with third parties.
          </div>
        </div>
      </div>
    </>
  );
};

export const Register = ({ onLoginSuccess }: AuthProps) => {
  const navigate = useNavigate();
  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  // ...existing hooks and logic...

  return (
    <>
      <PremiumBackground />
      <div className="min-h-screen flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-lg md:max-w-xl">
          <TrustIndicators />
          <Card className="p-10 bg-white/80 backdrop-blur-2xl border-0 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] rounded-[40px]">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Star size={24} className="text-white" />
                </div>
                <img
                  src="/logovertex.png"
                  alt="VERTEX"
                  className="h-6 md:h-8 w-12 md:w-16"
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-900 tracking-tight mb-2">
                Join VERTEX
              </h1>
              <p className="text-sm md:text-base text-slate-600 font-medium">
                Create your account and unlock financial opportunities
              </p>
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Registration Error</div>
                  <div className="text-sm mt-1">{serverError}</div>
                </div>
              </div>
            )}

            {/* Registration Form */}
            {step === 1 && (
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <PremiumInput
                  label="Full Name"
                  type="text"
                  value={values.fullName}
                  onChange={(value) => handleChange("fullName", value)}
                  onBlur={() => handleBlur("fullName")}
                  error={errors.fullName}
                  touched={touched.fullName}
                  placeholder="Enter your full name"
                  icon={User}
                />
                    <PremiumInput
                      label="Email Address"
                      type="email"
                      value={values.email}
                      onChange={(value) => handleChange("email", value)}
                      onBlur={() => handleBlur("email")}
                      error={errors.email}
                      touched={touched.email}
                      placeholder="Enter your email"
                      icon={Mail}
                    />
                    <PremiumInput
                      label="Phone Number"
                      type="tel"
                      value={values.phone}
                      onChange={(value) => handleChange("phone", value)}
                      onBlur={() => handleBlur("phone")}
                      error={errors.phone}
                      touched={touched.phone}
                      placeholder="Enter your phone number"
                      icon={Phone}
                    />
                    <PremiumInput
                      label="Password"
                      type="password"
                      value={values.password}
                      onChange={(value) => handleChange("password", value)}
                      onBlur={() => handleBlur("password")}
                      error={errors.password}
                      touched={touched.password}
                      placeholder="Create a password"
                      icon={KeyRound}
                      showPasswordToggle={true}
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                    />
                    <PremiumInput
                      label="Confirm Password"
                      type="password"
                      value={values.confirmPassword}
                      onChange={(value) => handleChange("confirmPassword", value)}
                      onBlur={() => handleBlur("confirmPassword")}
                      error={errors.confirmPassword}
                      touched={touched.confirmPassword}
                      placeholder="Confirm your password"
                      icon={Lock}
                      showPasswordToggle={true}
                      showPassword={showConfirmPassword}
                      onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                    {/* Password Strength Meter */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-24 h-2 rounded-full ${getStrengthColor()}`} />
                      <span className="text-xs font-bold text-slate-500">
                        {getStrengthText()}
                      </span>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 md:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={18} />
                          Creating Account...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock size={18} />
                          Create Account
                        </div>
                      )}
                    </Button>
                  </form>
                )}

                {/* OTP Verification Form */}
                {step === 2 && (
                  <form onSubmit={handleOTPSubmit} className="space-y-5 md:space-y-6">
                    <div className="mb-4 text-center">
                      <Smartphone size={32} className="mx-auto text-blue-600 mb-2" />
                      <h2 className="text-lg font-bold text-blue-700 mb-2">Verify Phone</h2>
                      <p className="text-sm text-slate-600">Enter the OTP sent to your phone number.</p>
                    </div>
                    <PremiumInput
                      label="OTP Code"
                      type="text"
                      value={otp}
                      onChange={setOtp}
                      onBlur={() => {}}
                      error={otpError}
                      touched={!!otpError}
                      placeholder="Enter OTP"
                      icon={Smartphone}
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 md:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={18} />
                          Verifying...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={18} />
                          Verify OTP
                        </div>
                      )}
                    </Button>
                  </form>
                )}

                {/* Sign In Link */}
                {step === 1 && (
                  <div className="mt-10 text-center">
                    <span className="text-slate-600 font-medium">
                      Already have an account?{" "}
                    </span>
                    <button
                      onClick={() => navigate("/login")}
                      className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </Card>
              {/* Security Notice */}
              <div className="mt-8 text-center text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Protected by enterprise-grade security. Your data is encrypted and
                never shared with third parties.
              </div>
            </div>
          </div>
        </>
      );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setSubmitAttempts((prev) => prev + 1);

    // Client-side validation
    if (!validateAll()) {
      setServerError("Please fix the errors above before continuing.");
      return;
    }

    // Additional validation checks
            {/* Server Error */}
            {serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Registration Error</div>
                  <div className="text-sm mt-1">{serverError}</div>
                </div>
              </div>
            )}
                                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-start gap-3">
                                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                                    <div>
                                      <div className="font-medium">Registration Error</div>
                                      <div className="text-sm mt-1">{serverError}</div>
                                    </div>
                                  </div>
                                )}

                                {/* Registration Form */}
                                {step === 1 && (
                                  <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                                    <PremiumInput
                                      label="Full Name"
                                      type="text"
                                      value={values.fullName}
                                      onChange={(value) => handleChange("fullName", value)}
                                      onBlur={() => handleBlur("fullName")}
                                      error={errors.fullName}
                                      touched={touched.fullName}
                                      placeholder="Enter your full name"
                                      icon={User}
                                    />

                                    <PremiumInput
                                      label="Email Address"
                                      type="email"
                                      value={values.email}
                                      onChange={(value) => handleChange("email", value)}
                                      onBlur={() => handleBlur("email")}
                                      error={errors.email}
                                      touched={touched.email}
                                      placeholder="Enter your email"
                                      icon={Mail}
                                    />

                                    <PremiumInput
                                      label="Phone Number"
                                      type="tel"
                                      value={values.phone}
                                      onChange={(value) => handleChange("phone", value)}
                                      onBlur={() => handleBlur("phone")}
                                      error={errors.phone}
                                      touched={touched.phone}
                                      placeholder="Enter your phone number"
                                      icon={Phone}
                                    />

                                    <PremiumInput
                                      label="Password"
                                      type="password"
                                      value={values.password}
                                      onChange={(value) => handleChange("password", value)}
                                      onBlur={() => handleBlur("password")}
                                      error={errors.password}
                                      touched={touched.password}
                                      placeholder="Create a password"
                                      icon={KeyRound}
                                      showPasswordToggle={true}
                                      showPassword={showPassword}
                                      onTogglePassword={() => setShowPassword(!showPassword)}
                                    />

                                    <PremiumInput
                                      label="Confirm Password"
                                      type="password"
                                      value={values.confirmPassword}
                                      onChange={(value) => handleChange("confirmPassword", value)}
                                      onBlur={() => handleBlur("confirmPassword")}
                                      error={errors.confirmPassword}
                                      touched={touched.confirmPassword}
                                      placeholder="Confirm your password"
                                      icon={Lock}
                                      showPasswordToggle={true}
                                      showPassword={showConfirmPassword}
                                      onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                                    />

                                    {/* Password Strength Meter */}
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className={`w-24 h-2 rounded-full ${getStrengthColor()}`} />
                                      <span className="text-xs font-bold text-slate-500">
                                        {getStrengthText()}
                                      </span>
                                    </div>

                                    <Button
                                      type="submit"
                                      disabled={loading}
                                      className="w-full h-12 md:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                                    >
                                      {loading ? (
                                        <div className="flex items-center gap-2">
                                          <Loader2 className="animate-spin" size={18} />
                                          Creating Account...
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <Lock size={18} />
                                          Create Account
                                        </div>
                                      )}
                                    </Button>
                                  </form>
                                )}

                                {/* OTP Verification Form */}
                                {step === 2 && (
                                  <form onSubmit={handleOTPSubmit} className="space-y-5 md:space-y-6">
                                    <div className="mb-4 text-center">
                                      <Smartphone size={32} className="mx-auto text-blue-600 mb-2" />
                                      <h2 className="text-lg font-bold text-blue-700 mb-2">Verify Phone</h2>
                                      <p className="text-sm text-slate-600">Enter the OTP sent to your phone number.</p>
                                    </div>
                                    <PremiumInput
                                      label="OTP Code"
                                      type="text"
                                      value={otp}
                                      onChange={setOtp}
                                      onBlur={() => {}}
                                      error={otpError}
                                      touched={!!otpError}
                                      placeholder="Enter OTP"
                                      icon={Smartphone}
                                    />
                                    <Button
                                      type="submit"
                                      disabled={loading}
                                      className="w-full h-12 md:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                                    >
                                      {loading ? (
                                        <div className="flex items-center gap-2">
                                          <Loader2 className="animate-spin" size={18} />
                                          Verifying...
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <CheckCircle2 size={18} />
                                          Verify OTP
                                        </div>
                                      )}
                                    </Button>
                                  </form>
                                )}

                                {/* Sign In Link */}
                                {step === 1 && (
                                  <div className="mt-10 text-center">
                                    <span className="text-slate-600 font-medium">
                                      Already have an account?{" "}
                                    </span>
                                    <button
                                      onClick={() => navigate("/login")}
                                      className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
                                    >
                                      Sign In
                                    </button>
                                  </div>
                                )}
                              </Card>

                              {/* Security Notice */}
                              <div className="mt-8 text-center text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                Protected by enterprise-grade security. Your data is encrypted and
                                never shared with third parties.
                              </div>
                            </div>
                          </div>
                        </>

                  <PremiumInput
                    label="Confirm Password"
                    type="password"
                    value={values.confirmPassword}
                    onChange={(value) => handleChange("confirmPassword", value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    error={errors.confirmPassword}
                    touched={touched.confirmPassword}
                    placeholder="Confirm your password"
                    icon={Lock}
                    showPasswordToggle
                    showPassword={showConfirmPassword}
                    onTogglePassword={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  />

                  {/* Terms and Conditions */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        className="w-4 h-4 mt-1 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <div className="text-sm text-slate-700 leading-relaxed">
                        I agree to the{" "}
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Privacy Policy
                        </button>
                        , and consent to receive loan offers and updates.
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 h-14 rounded-2xl border-2 font-medium"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        loading ||
                        strengthScore < 3 ||
                        values.password !== values.confirmPassword
                      }
                      className="flex-1 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={20} />
                          Creating Account...
                        </div>
                      ) : strengthScore < 3 ? (
                        <div className="flex items-center gap-2">
                          <Shield size={20} />
                          Strengthen Password
                        </div>
                      ) : values.password !== values.confirmPassword ? (
                        <div className="flex items-center gap-2">
                          <X size={20} />
                          Passwords Don't Match
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <TrendingUp size={20} />
                          Create Account
                        </div>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>

            {/* Sign In Link */}
            <div className="mt-10 text-center">
              <span className="text-slate-600 font-medium">
                Already have an account?{" "}
              </span>
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
              >
                Sign In
              </button>
            </div>
          </Card>

          {/* Security Notice */}
          <div className="mt-8 text-center text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your personal information is protected by bank-level encryption and
            will never be shared without your consent.
          </div>
        </div>
      </div>
    </>
  );
};
