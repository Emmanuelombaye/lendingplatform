import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, Lock, KeyRound, User, Mail, Phone, Smartphone, CheckCircle2, Star } from "lucide-react";
import { Button, Card } from "./ui";
import { PremiumBackground, TrustIndicators, PremiumInput } from "./AuthComponents"; // adjust path
import api from "../../lib/api";

interface AuthProps {
  onLoginSuccess: (user: any) => void;
}

export const Register = ({ onLoginSuccess }: AuthProps) => {
  const navigate = useNavigate();

  // Step for multi-stage registration
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Password strength helpers
  const getStrengthColor = () => {
    const length = values.password.length;
    if (length >= 12) return "bg-emerald-500";
    if (length >= 8) return "bg-yellow-400";
    return "bg-red-500";
  };

  const getStrengthText = () => {
    const length = values.password.length;
    if (length >= 12) return "Strong";
    if (length >= 8) return "Medium";
    return "Weak";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateAll()) {
      setServerError("Please fix the errors above before continuing.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });

      if (res.data.success) {
        // If phone verification required
        if (res.data.data.requiresOTP) {
          setStep(2);
        } else {
          localStorage.setItem("token", res.data.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.data));
          onLoginSuccess(res.data.data);
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      setServerError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    if (!otp) {
      setOtpError("OTP is required");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { otp, phone: values.phone });
      if (res.data.success) {
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data));
        onLoginSuccess(res.data.data);
        navigate("/dashboard");
      } else {
        setOtpError("Invalid OTP. Please try again.");
      }
    } catch (err: any) {
      setOtpError("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

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
                <img src="/logovertex.png" alt="VERTEX" className="h-6 md:h-8 w-12 md:w-16" />
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

            {/* Step 1: Registration Form */}
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
                  showPasswordToggle
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
                  showPasswordToggle
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                />

                {/* Password Strength Meter */}
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-24 h-2 rounded-full ${getStrengthColor()}`} />
                  <span className="text-xs font-bold text-slate-500">{getStrengthText()}</span>
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

            {/* Step 2: OTP Verification */}
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
                <span className="text-slate-600 font-medium">Already have an account? </span>
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
            Protected by enterprise-grade security. Your data is encrypted and never shared with third parties.
          </div>
        </div>
      </div>
    </>
  );
};