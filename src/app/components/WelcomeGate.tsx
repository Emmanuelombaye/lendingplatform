import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, Shield, TrendingUp, Clock } from 'lucide-react';

interface WelcomeGateProps {
    onSkip: () => void;
    onLoginSuccess: (user: any) => void;
}

export const WelcomeGate: React.FC<WelcomeGateProps> = ({ onSkip }) => {
    const navigate = useNavigate();
    const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

    const socialButtons = [
        // ... (socialButtons array content is unchanged, but I need to include it or use a smart replacement)
        // Actually, to avoid re-writing the whole large array, I'll try to just target the beginning and the button part.
        // But replace_file_content requires contiguous block.
        // Let's just include the array. It's not that big.
        {
            id: 'google',
            label: 'Continue with Google',
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
            ),
            bg: 'bg-white hover:bg-gray-50',
            text: 'text-gray-700',
            border: 'border border-gray-200',
        },
        {
            id: 'facebook',
            label: 'Continue with Facebook',
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            ),
            bg: 'bg-[#1877F2] hover:bg-[#166FE5]',
            text: 'text-white',
            border: '',
        },
        {
            id: 'telegram',
            label: 'Continue with Telegram',
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
            ),
            bg: 'bg-[#0088cc] hover:bg-[#0077b5]',
            text: 'text-white',
            border: '',
        },
    ];

    const features = [
        { icon: <Clock className="w-5 h-5" />, title: 'Fast Approval', desc: '24hr processing' },
        { icon: <TrendingUp className="w-5 h-5" />, title: 'Low Rates', desc: 'From 6% interest' },
        { icon: <Shield className="w-5 h-5" />, title: 'CBK Licensed', desc: 'Fully regulated' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }} />
            </div>

            <div className="relative z-10 w-full max-w-md mx-auto px-6 py-12">
                {/* Logo & Brand */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 mb-6">
                        <span className="text-white text-2xl font-black">V</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        GETVERTEX<span className="text-blue-400">.</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        Kenya's trusted digital lending platform
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/[0.07] backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-white text-center mb-1">Welcome</h2>
                    <p className="text-slate-400 text-sm text-center mb-8">Sign in or create an account to continue</p>

                    {/* Social Login Buttons */}
                    <div className="space-y-3 mb-6">
                        {socialButtons.map((btn) => (
                            <button
                                key={btn.id}
                                onMouseEnter={() => setHoveredSocial(btn.id)}
                                onMouseLeave={() => setHoveredSocial(null)}
                                className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${btn.bg} ${btn.text} ${btn.border} ${hoveredSocial === btn.id ? 'scale-[1.02] shadow-lg' : 'scale-100'}`}
                            >
                                {btn.icon}
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Email Login / Register */}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25"
                        >
                            Sign In with Email
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => navigate('/register')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02]"
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Skip */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={onSkip}
                            className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors duration-200 underline underline-offset-4 decoration-slate-600 hover:decoration-slate-400"
                        >
                            Skip for now →
                        </button>
                    </div>
                </div>

                {/* Trust Features */}
                <div className="mt-8 grid grid-cols-3 gap-3">
                    {features.map((feat, i) => (
                        <div key={i} className="text-center p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                            <div className="flex justify-center text-blue-400 mb-2">{feat.icon}</div>
                            <p className="text-white text-xs font-bold">{feat.title}</p>
                            <p className="text-slate-500 text-[10px] mt-0.5">{feat.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <p className="text-center text-slate-600 text-[11px] mt-6 leading-relaxed">
                    By continuing, you agree to our{' '}
                    <span className="text-slate-400 hover:text-blue-400 cursor-pointer transition-colors">Terms of Service</span>
                    {' '}and{' '}
                    <span className="text-slate-400 hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</span>
                </p>
            </div>
        </div>
    );
};
