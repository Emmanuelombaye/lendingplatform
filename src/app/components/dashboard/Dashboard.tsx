import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    LayoutDashboard,
    FileText,
    Wallet,
    ShieldCheck,
    Settings,
    LogOut,
    Bell,
    Search,
    ChevronRight,
    TrendingUp,
    Clock,
    DollarSign,
    AlertCircle,
    Download,
    CreditCard,
    User,
    ShieldAlert,
    Loader2,
    Upload,
    LifeBuoy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge, cn } from '../ui';
import api from '../../../lib/api';

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
            active
                ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        )}
    >
        <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
            active ? "bg-white/20" : "bg-slate-50 group-hover:bg-white"
        )}>
            <Icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110", active ? "text-white" : "text-slate-400")} />
        </div>
        <span className="font-black text-sm tracking-tight">{label}</span>
        {active && (
            <motion.div
                layoutId="sidebar-active"
                className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff]"
            />
        )}
    </button>
);

const SidebarCategory = ({ label }: { label: string }) => (
    <div className="px-6 pt-10 pb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
            {label}
            <div className="h-px flex-1 bg-slate-100" />
        </span>
    </div>
);

const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <Card className="p-8 border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] hover:shadow-[0_48px_128px_-32px_rgba(0,0,0,0.1)] transition-all duration-700 group relative overflow-hidden rounded-[32px]">
        <div className={cn("absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-150", color)} />
        <div className="flex justify-between items-start mb-6">
            <div className={cn("p-4 rounded-2xl text-white shadow-lg", color)}>
                <Icon size={24} />
            </div>
            {trend && (
                <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] tracking-widest px-3 py-1">
                    <TrendingUp size={12} className="mr-1.5" /> {trend}
                </Badge>
            )}
        </div>
        <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</div>
        <div className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">{value}</div>
    </Card>
);

export const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
    const [updating, setUpdating] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [dashRes, activityRes] = await Promise.all([
                    api.get('/users/dashboard'),
                    api.get('/users/activity')
                ]);

                if (dashRes.data.success) setDashboardData(dashRes.data.data);
                if (activityRes.data.success) setActivityLogs(activityRes.data.data);
            } catch (err) {
                console.error("Dashboard fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.next !== passwords.confirm) {
            return setMsg({ text: 'Passwords do not match', type: 'error' });
        }
        setUpdating(true);
        try {
            const res = await api.post('/users/change-password', {
                currentPassword: passwords.current,
                newPassword: passwords.next
            });
            if (res.data.success) {
                setMsg({ text: 'Password updated successfully!', type: 'success' });
                setPasswords({ current: '', next: '', confirm: '' });
            }
        } catch (err: any) {
            setMsg({ text: err.response?.data?.message || 'Update failed', type: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="font-bold text-slate-900 uppercase tracking-widest text-xs">Initializing Your Hub...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 flex transition-all duration-500">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-slate-100 p-6 flex flex-col fixed h-full z-20">
                <div className="flex items-center gap-4 mb-12 px-4 py-2">
                    <img src="/logovertex.png" className="h-10 w-auto" alt="Logo" />
                    <span className="font-black text-2xl tracking-tighter text-[#0F172A]">VERTEX</span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
                    <SidebarCategory label="Main Menu" />
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Account Hub"
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                    />
                    <SidebarItem
                        icon={Bell}
                        label="Notifications"
                        active={activeTab === 'activity'}
                        onClick={() => setActiveTab('activity')}
                    />

                    <SidebarCategory label="Finance Area" />
                    <SidebarItem
                        icon={FileText}
                        label="Active Loans"
                        active={activeTab === 'loans'}
                        onClick={() => setActiveTab('loans')}
                    />
                    <SidebarItem
                        icon={Wallet}
                        label="Payment Center"
                        active={activeTab === 'repay'}
                        onClick={() => setActiveTab('repay')}
                    />

                    <SidebarCategory label="Trust & Verification" />
                    <SidebarItem
                        icon={ShieldCheck}
                        label="KYC Status"
                        active={activeTab === 'kyc'}
                        onClick={() => setActiveTab('kyc')}
                    />

                    <SidebarCategory label="Client Care" />
                    <SidebarItem
                        icon={LifeBuoy}
                        label="Support Hub"
                        active={activeTab === 'support'}
                        onClick={() => setActiveTab('support')}
                    />
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-2 px-2">
                    <SidebarItem icon={Settings} label="Global Settings" onClick={() => setActiveTab('settings')} active={activeTab === 'settings'} />
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-xs uppercase tracking-widest mt-4"
                    >
                        <LogOut size={18} />
                        Exit Application
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-80 p-12">
                {/* Top Header */}
                <header className="flex justify-between items-center mb-16">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">Hello, {dashboardData?.user?.fullName.split(' ')[0]} 👋</h1>
                        <p className="text-lg text-slate-500 font-medium">Welcome back to your <span className="text-blue-600 font-black">financial hub.</span></p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                placeholder="Search tools..."
                                className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl w-64 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all font-medium text-sm"
                            />
                        </div>
                        <button className="relative p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        </button>
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-[2px]">
                            <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white font-black text-sm border-2 border-white/10">
                                {dashboardData?.user?.fullName.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-10"
                        >
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <StatCard
                                    icon={DollarSign}
                                    label="Available Credit"
                                    value={`KES ${dashboardData?.eligibilityLimit.toLocaleString()}`}
                                    trend="+12%"
                                    color="bg-blue-600"
                                />
                                <StatCard
                                    icon={Clock}
                                    label="Current Balance"
                                    value={dashboardData?.activeLoan ? `KES ${Number(dashboardData.activeLoan.totalRepayment).toLocaleString()}` : 'KES 0'}
                                    color="bg-slate-900"
                                />
                                <StatCard
                                    icon={ShieldCheck}
                                    label="KYC Status"
                                    value={dashboardData?.user?.kycStatus}
                                    color={dashboardData?.user?.kycStatus === 'VERIFIED' ? "bg-emerald-500" : "bg-amber-500"}
                                />
                            </div>

                            {/* Loans Section */}
                            <div className="grid lg:grid-cols-3 gap-10">
                                <Card className="lg:col-span-2 p-10 border-slate-100 relative overflow-hidden">
                                    <div className="flex justify-between items-end mb-8">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Applications</h3>
                                            <p className="text-slate-500 text-sm font-medium">Track your funding progress.</p>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('loans')}>View All <ChevronRight size={16} /></Button>
                                    </div>

                                    <div className="space-y-6">
                                        {dashboardData?.applications?.slice(0, 3).map((app: any) => (
                                            <div key={app.id} className="p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 hover:border-blue-500/30 transition-all group hover:bg-white hover:shadow-xl hover:shadow-blue-500/5">
                                                <div className="flex justify-between mb-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-all duration-500 shadow-sm group-hover:bg-blue-600 group-hover:text-white">
                                                            <FileText size={28} />
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-900 text-lg">Loan Application #{app.id}</div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                                                <div className="text-[10px] font-black text-slate-400 font-mono tracking-widest uppercase">{app.status}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-black text-slate-900 text-xl font-mono tracking-tighter tabular-nums">KES {Number(app.amount).toLocaleString()}</div>
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(app.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                                        <span>Progress Status</span>
                                                        <span className="text-blue-600">{app.progress}%</span>
                                                    </div>
                                                    <div className="h-3 bg-white border border-slate-100 rounded-full overflow-hidden p-[2px]">
                                                        <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(37,99,235,0.4)]" style={{ width: `${app.progress}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {dashboardData?.applications?.length === 0 && (
                                            <div className="py-20 text-center">
                                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                                                    <AlertCircle size={40} />
                                                </div>
                                                <h4 className="font-black text-slate-900 text-lg">No active loans</h4>
                                                <p className="text-slate-500 mb-8 max-w-xs mx-auto">Get the capital you need to scale your vision today.</p>
                                                <Button className="btn-shimmer" onClick={() => window.location.href = '/apply'}>Apply for a Loan</Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* Account Actions / Quick Fixes */}
                                <div className="space-y-8">
                                    <Card className="p-8 bg-[#0F172A] text-white relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-600/30 transition-colors" />
                                        <h4 className="text-lg font-black tracking-tight mb-2">Need Help?</h4>
                                        <p className="text-slate-400 text-sm font-medium mb-8">Our dedicated advisors are here to support your growth journey.</p>
                                        <Button variant="outline" className="w-full border-slate-700 text-white hover:bg-slate-800 h-14 rounded-2xl">
                                            Message Support
                                        </Button>
                                    </Card>

                                    <Card className="p-8 border-slate-100">
                                        <h4 className="text-lg font-black tracking-tight mb-6">Security Check</h4>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", dashboardData?.user?.kycStatus === 'VERIFIED' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600")}>
                                                    {dashboardData?.user?.kycStatus === 'VERIFIED' ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-bold text-slate-900">KYC Verification</div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dashboardData?.user?.kycStatus}</div>
                                                </div>
                                                {dashboardData?.user?.kycStatus !== 'VERIFIED' && (
                                                    <button onClick={() => setActiveTab('kyc')} className="text-xs font-black text-blue-600 uppercase hover:underline">Complete</button>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                                    <CreditCard size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-bold text-slate-900">Bank Details</div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unlinked</div>
                                                </div>
                                                <button onClick={() => setActiveTab('settings')} className="text-xs font-black text-blue-600 uppercase hover:underline">Link</button>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'loans' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Loan Portfolio</h2>
                                    <p className="text-slate-500 font-medium">Manage and track all your loan applications in real-time.</p>
                                </div>
                                <Button className="btn-shimmer" onClick={() => window.location.href = '/apply'}>New Application</Button>
                            </div>

                            <div className="grid gap-6">
                                {dashboardData?.applications?.map((app: any) => (
                                    <Card key={app.id} className="p-10 border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] hover:shadow-[0_48px_128px_-32px_rgba(0,0,0,0.1)] transition-all duration-700 group overflow-hidden relative rounded-[40px]">
                                        <div className="flex flex-col lg:flex-row justify-between gap-10">
                                            <div className="flex gap-8">
                                                <div className="w-20 h-20 rounded-[28px] bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700 shadow-sm">
                                                    <FileText size={36} />
                                                </div>
                                                <div>
                                                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                                                        Loan Application #{app.id}
                                                        <Badge variant={app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'danger' : 'info'} className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-none shadow-sm">
                                                            {app.status}
                                                        </Badge>
                                                    </h4>
                                                    <p className="text-base font-bold text-slate-400 mt-2">Submitted on {new Date(app.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-10 bg-slate-50/50 backdrop-blur-md p-8 rounded-[32px] border border-slate-100/50">
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Principal</div>
                                                    <div className="text-xl font-black text-slate-900 font-mono tracking-tighter tabular-nums">KES {Number(app.amount).toLocaleString()}</div>
                                                </div>
                                                <div className="w-px h-10 bg-slate-200 hidden sm:block" />
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Status</div>
                                                    <div className="text-base font-black text-blue-600 uppercase tracking-tight">{app.progress === 100 ? "Settled" : "Verifying"}</div>
                                                </div>
                                                <Button variant="outline" size="lg" className="bg-white border-slate-200 hover:bg-slate-50 rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-sm">
                                                    <Download size={18} className="mr-2" /> Agreement
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-10 pt-10 border-t border-slate-50">
                                            <div className="flex justify-between items-end mb-5">
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Milestone Tracking</div>
                                                    <div className="text-base font-black text-slate-900 tracking-tight">{app.status === 'REJECTED' ? 'Application Terminated' : app.progress < 100 ? "Credit Review & Internal Verification" : "Fully Disbursed to Wallet"}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-black text-blue-600 font-mono italic">{app.progress}%</div>
                                                </div>
                                            </div>
                                            <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${app.progress}%` }}
                                                    transition={{ duration: 1.5, ease: "circOut" }}
                                                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_100%] animate-shimmer rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                                {(!dashboardData?.applications || dashboardData.applications.length === 0) && (
                                    <div className="py-24 text-center bg-white rounded-[60px] border-2 border-dashed border-slate-100">
                                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                                            <AlertCircle size={48} />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Loan Portfolio Found</h3>
                                        <p className="text-slate-500 mb-10 text-lg font-medium max-w-sm mx-auto">Access Kenya's most flexible capital for your business growth today.</p>
                                        <Button className="btn-shimmer px-10 h-16 rounded-2xl text-lg" onClick={() => window.location.href = '/apply'}>Start Application</Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'repay' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Repayment Center</h2>
                                    <p className="text-slate-500 font-medium">Manage your schedules and view payment history.</p>
                                </div>
                                <Button className="h-14 px-8 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white font-black text-sm uppercase tracking-tight">
                                    <DollarSign size={18} className="mr-2" /> Make a Payment
                                </Button>
                            </div>

                            <div className="grid lg:grid-cols-3 gap-10">
                                <Card className="lg:col-span-2 p-8 border-slate-100">
                                    <h4 className="text-xl font-black text-slate-900 mb-10 px-4 tracking-tighter">Transaction Ledger</h4>
                                    <div className="overflow-x-auto px-2">
                                        <table className="w-full text-left border-separate border-spacing-y-4">
                                            <thead>
                                                <tr>
                                                    <th className="pb-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Settlement Date</th>
                                                    <th className="pb-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Allocation Type</th>
                                                    <th className="pb-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount (KES)</th>
                                                    <th className="pb-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Balance</th>
                                                    <th className="pb-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dashboardData?.activeLoan?.repayments?.map((r: any) => (
                                                    <tr key={r.id} className="group hover:scale-[1.01] transition-all duration-300">
                                                        <td className="py-6 px-6 bg-slate-50/50 rounded-l-[24px] border-y border-l border-slate-100 font-black text-slate-900">{new Date(r.paymentDate).toLocaleDateString()}</td>
                                                        <td className="py-6 px-6 bg-slate-50/50 border-y border-slate-100 font-bold text-slate-500 italic text-sm">Monthly Installment</td>
                                                        <td className="py-6 px-6 bg-slate-50/50 border-y border-slate-100 font-black text-emerald-600 tabular-nums font-mono">+{Number(r.amountPaid).toLocaleString()}</td>
                                                        <td className="py-6 px-6 bg-slate-50/50 border-y border-slate-100 font-bold text-slate-600 font-mono tracking-tighter tabular-nums">KES {Number(r.remainingBalance).toLocaleString()}</td>
                                                        <td className="py-6 px-6 bg-slate-50/50 border-y border-r border-slate-100 rounded-r-[24px]">
                                                            <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] tracking-widest px-3 py-1">VERIFIED</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!dashboardData?.activeLoan?.repayments || dashboardData.activeLoan.repayments.length === 0) && (
                                                    <tr>
                                                        <td colSpan={5} className="py-20 text-center font-bold text-slate-400 uppercase tracking-widest text-xs">
                                                            No transaction records found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>

                                <div className="space-y-8">
                                    <Card className="p-8 bg-blue-600 text-white relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-700" />
                                        <div className="relative z-10">
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2 font-mono">Next Statement</div>
                                            <div className="text-2xl font-black tracking-tighter mb-8">February 28, 2026</div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-sm font-bold opacity-80">
                                                    <span>Minimum Due</span>
                                                    <span>KES 12,450.00</span>
                                                </div>
                                                <div className="h-px bg-white/20 w-full" />
                                                <div className="flex justify-between items-center text-sm font-bold">
                                                    <span>Remaining Balance</span>
                                                    <span className="text-xl font-black">KES {dashboardData?.activeLoan ? Number(dashboardData.activeLoan.totalRepayment).toLocaleString() : '0.00'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-8 border-slate-100">
                                        <h4 className="text-lg font-black text-slate-900 mb-6 tracking-tight">Payment Methods</h4>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-blue-500/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 border border-slate-100 shadow-sm">
                                                        <CreditCard size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900">M-PESA Paybill</div>
                                                        <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Acct: 405523</div>
                                                    </div>
                                                </div>
                                                <Badge className="bg-blue-600/10 text-blue-600 border-none">Primary</Badge>
                                            </div>
                                            <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 border-2 font-black text-sm group">
                                                <Loader2 size={16} className="mr-2 group-hover:animate-spin" /> Link New Method
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'kyc' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-4xl"
                        >
                            <div className="mb-12">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Security & KYC</h2>
                                <p className="text-slate-500 font-medium">Verified accounts enjoy higher loan limits and faster processing.</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8 mb-12">
                                <div className={cn(
                                    "p-6 rounded-[32px] border-2 transition-all duration-500",
                                    dashboardData?.user?.kycStatus === 'VERIFIED' ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-100"
                                )}>
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm", dashboardData?.user?.kycStatus === 'VERIFIED' ? "bg-emerald-500 text-white" : "bg-slate-900 text-white")}>
                                        <ShieldCheck size={24} />
                                    </div>
                                    <h4 className="font-black text-slate-900 tracking-tight mb-1">KYC Status</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{dashboardData?.user?.kycStatus}</p>
                                </div>

                                <div className="p-6 rounded-[32px] bg-white border-2 border-slate-100 border-dashed flex flex-col items-center justify-center text-center group cursor-pointer hover:border-blue-500/50 transition-all">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all mb-4">
                                        <FileText size={24} />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900">Upload ID</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">National ID / Passport</p>
                                </div>

                                <div className="p-6 rounded-[32px] bg-white border-2 border-slate-100 border-dashed flex flex-col items-center justify-center text-center group cursor-pointer hover:border-blue-500/50 transition-all">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all mb-4">
                                        <User size={24} />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900">Take Selfie</h4>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Live Verification</p>
                                </div>
                            </div>

                            <Card className="p-12 border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] rounded-[48px]">
                                <div className="flex flex-col md:flex-row gap-12">
                                    <div className="w-20 h-20 rounded-[32px] bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
                                        <AlertCircle size={40} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter mb-6 flex items-center gap-4">
                                            Compliance Verification
                                            <Badge className="bg-amber-500/10 text-amber-600 border-none font-black text-[10px] tracking-widest px-4 py-1.5 rounded-full">ACTION REQUIRED</Badge>
                                        </h4>
                                        <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed max-w-2xl">
                                            To comply with Central Bank regulations and unlock higher disbursement limits, we need to verify your primary identification. This process is encrypted and takes less than 2 minutes.
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-6 mb-12">
                                            <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-blue-600/30 transition-all">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-500 shadow-sm transition-transform group-hover:scale-110">
                                                    <ShieldCheck size={20} />
                                                </div>
                                                <span className="text-sm font-black text-slate-700">National ID Scans</span>
                                            </div>
                                            <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-blue-600/30 transition-all">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-500 shadow-sm transition-transform group-hover:scale-110">
                                                    <ShieldCheck size={20} />
                                                </div>
                                                <span className="text-sm font-black text-slate-700">Live Face Verification</span>
                                            </div>
                                        </div>
                                        <Button className="h-20 px-16 rounded-[28px] bg-blue-600 hover:bg-blue-700 text-white font-black text-lg uppercase tracking-tight shadow-2xl shadow-blue-500/30 hover:-translate-y-1 transition-all">
                                            Begin Secure Verification
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Activity Tab */}
                    {activeTab === 'activity' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-4xl"
                        >
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-10">Security Activity Monitor</h2>
                            <Card className="p-0 border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden rounded-[32px]">
                                <div className="divide-y divide-slate-50">
                                    {activityLogs.map((log) => (
                                        <div key={log.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all duration-300 group">
                                            <div className="flex items-center gap-8">
                                                <div className="w-14 h-14 bg-slate-900 border-2 border-slate-800 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                                                    {log.action.includes('Login') ? <ShieldCheck size={28} /> : <Settings size={28} />}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 text-lg tracking-tight">{log.action}</div>
                                                    <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{log.details}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-base font-black text-slate-900 tabular-nums">{new Date(log.date).toLocaleDateString()}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h2>
                                <p className="text-slate-500 font-medium">Manage your personal information and security preferences.</p>
                            </div>

                            <Card className="p-12 border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] rounded-[40px] space-y-10">
                                <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] font-mono">Personal Identity</h3>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Legal Representative Name</label>
                                        <input className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-2xl px-6 font-black text-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all outline-none" defaultValue={dashboardData?.user?.fullName} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Linked Mobile Asset</label>
                                        <input className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-2xl px-6 font-black text-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all outline-none" defaultValue={dashboardData?.user?.phone || 'Not Registered'} readOnly />
                                    </div>
                                </div>
                                <Button className="h-16 px-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/10">Update Global Profile</Button>
                            </Card>

                            <Card className="p-12 border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] rounded-[40px] space-y-10">
                                <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] font-mono">Authentication & Privacy</h3>
                                <form onSubmit={handlePasswordChange} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Current Secure Key</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-2xl px-6 font-black focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">New Password Phrase</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwords.next}
                                                onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                                                className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-2xl px-6 font-black focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Verify New Phrase</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-2xl px-6 font-black focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    {msg.text && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn("p-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3", msg.type === 'success' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600")}
                                        >
                                            <div className={cn("w-2 h-2 rounded-full", msg.type === 'success' ? "bg-emerald-500" : "bg-red-500")} />
                                            {msg.text}
                                        </motion.div>
                                    )}
                                    <Button type="submit" disabled={updating} className="w-full h-20 rounded-[28px] font-black uppercase tracking-widest text-sm bg-blue-600 hover:bg-blue-700 text-white border-none shadow-2xl shadow-blue-500/20 group">
                                        {updating ? <Loader2 size={24} className="animate-spin" /> : "Authorize Password Update"}
                                    </Button>
                                </form>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};
