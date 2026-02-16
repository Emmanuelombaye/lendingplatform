import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button, Card } from './ui';
import api from '../../lib/api';

interface AuthProps {
    onLoginSuccess: (user: any) => void;
}

declare global {
    interface Window {
        onTelegramAuth: (user: any) => void;
    }
}

export const Login = ({ onLoginSuccess }: AuthProps) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Handle Telegram Auth Callback
        window.onTelegramAuth = async (user: any) => {
            setLoading(true);
            setError('');
            try {
                const res = await api.post('/auth/telegram', user);
                if (res.data.success) {
                    localStorage.setItem('token', res.data.data.token);
                    localStorage.setItem('user', JSON.stringify(res.data.data));
                    onLoginSuccess(res.data.data);
                    navigate('/');
                }
            } catch (err: any) {
                setError('Telegram login failed. ' + (err.response?.data?.message || ''));
            } finally {
                setLoading(false);
            }
        };

        // Reload Telegram script if it's already there to ensure widget renders
        const existingScript = document.getElementById('telegram-widget-script');
        if (existingScript) existingScript.remove();

        const script = document.createElement('script');
        script.id = 'telegram-widget-script';
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', 'vertexloans_bot');
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');
        script.async = true;

        const container = document.getElementById('telegram-login-container');
        if (container) {
            container.appendChild(script);
        }

        return () => {
            if (script) script.remove();
        };
    }, [navigate, onLoginSuccess]);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            // This is a placeholder for actual Google Auth logic (e.g., using @react-oauth/google)
            // For now, we'll simulate the call to the backend
            // In a real app, you'd get the credential from the Google SDK
            // const res = await api.post('/auth/google', { email, googleId, fullName });
            setError('Google Login integration requires client ID configuration. Please contact admin.');
        } catch (err: any) {
            setError('Google login failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        setLoading(true);
        setError('');
        try {
            // Placeholder for Facebook Login logic
            setError('Facebook Login integration requires App ID configuration. Please contact admin.');
        } catch (err: any) {
            setError('Facebook login failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data.success) {
                localStorage.setItem('token', res.data.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.data));
                onLoginSuccess(res.data.data);
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center bg-mesh-gradient animate-fade-in relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full animate-glow-pulse" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 blur-[120px] rounded-full animate-glow-pulse" style={{ animationDelay: '2s' }} />

            <Card className="w-full max-w-md p-10 glass-card border-white/40 shadow-2xl rounded-[40px] relative z-10 transition-transform duration-500 hover:scale-[1.01]">
                <div className="text-center mb-8">
                    <img src="/logovertex.png" alt="GETVERTEX" className="h-10 w-auto mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-[#0F172A]">Welcome Back</h2>
                    <p className="text-slate-500 mt-2">Sign in to access your dashboard</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all pr-12"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <Button className="w-full h-12 text-base font-bold shadow-lg shadow-blue-500/20" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-8 flex items-center gap-4">
                    <div className="h-px bg-slate-100 flex-1" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Or Continue With</span>
                    <div className="h-px bg-slate-100 flex-1" />
                </div>

                <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <button
                            onClick={handleGoogleLogin}
                            className="h-12 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all group"
                        >
                            <span className="text-sm font-bold text-slate-600">Google</span>
                        </button>
                        <button
                            onClick={handleFacebookLogin}
                            className="h-12 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all group"
                        >
                            <span className="text-sm font-bold text-slate-600">Facebook</span>
                        </button>
                    </div>

                    <div className="w-full flex flex-col items-center gap-2">
                        <div id="telegram-login-container" className="flex justify-center w-full min-h-[44px]">
                            {/* Telegram widget injected here by useEffect */}
                        </div>
                        <p className="text-[10px] text-slate-400 italic">Fully secure Telegram authentication</p>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-slate-500">
                    Don't have an account?{' '}
                    <button onClick={() => navigate('/register')} className="text-blue-600 font-bold hover:underline">
                        Create Account
                    </button>
                </div>
            </Card>
        </div>
    );
};

export const Register = ({ onLoginSuccess }: AuthProps) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/auth/register', {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            if (res.data.success) {
                localStorage.setItem('token', res.data.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.data));
                onLoginSuccess(res.data.data);
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center bg-slate-50 animate-fade-in">
            <Card className="w-full max-w-lg p-10 bg-white border-slate-100 shadow-2xl rounded-[40px]">
                <div className="text-center mb-8">
                    <img src="/logovertex.png" alt="GETVERTEX" className="h-10 w-auto mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-[#0F172A]">Get Started</h2>
                    <p className="text-slate-500 mt-2">Join GETVERTEX today</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Full Name</label>
                        <input
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Phone</label>
                        <input
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Confirm</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 mt-4">
                        <Button className="w-full h-12 text-base font-bold shadow-lg shadow-blue-500/20" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Create Account'}
                        </Button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500 font-medium">
                    Already have an account?{' '}
                    <button onClick={() => navigate('/login')} className="text-blue-600 font-bold hover:underline">
                        Sign In
                    </button>
                </div>
            </Card>
        </div>
    );
};
