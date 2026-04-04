'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, FileText, DollarSign, CheckCircle2, Clock,
  LogOut, Settings, ChevronDown, ChevronUp, RefreshCw,
  TrendingUp, AlertCircle, Shield, Loader2, X, Check,
} from 'lucide-react';
import api from '@/lib/api';
import { authService } from '@/lib/authUtils';
import { formatCurrencyTZS } from '@/lib/locale';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: color }}>
      <Icon size={18} className="text-white" />
    </div>
    <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{title}</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    SUBMITTED: 'bg-yellow-100 text-yellow-700',
    REVIEW: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    PENDING_DISBURSEMENT: 'bg-orange-100 text-orange-700',
    COMPLETED: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false); // true once auth check passes
  const [tab, setTab] = useState<'applications' | 'users' | 'settings'>('applications');
  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expandedApp, setExpandedApp] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    interestRateDefault: '6.0',
    processingFeePercent: '6.5',
    minLoan: '40000',
    maxLoan: '1000000',
    maxMonths: '6',
  });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Step 1: Auth check — runs once on mount ──────────────────────────────
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/admin');
      router.replace('/login');
      return;
    }
    if ((user as any).role !== 'ADMIN') {
      router.replace('/dashboard');
      return;
    }
    setReady(true); // auth passed — allow render and data fetch
  }, []); // empty deps — runs once only

  // ── Step 2: Fetch data — only runs when ready=true or filterStatus changes ─
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes, usersRes, settingsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get(`/admin/applications?status=${filterStatus}`),
        api.get('/admin/users'),
        api.get('/admin/settings'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (appsRes.data.success) setApplications(appsRes.data.data.applications);
      if (usersRes.data.success) setUsers(usersRes.data.data.users);
      if (settingsRes.data.success && settingsRes.data.data.settings) {
        const s = settingsRes.data.data.settings;
        setSettingsForm({
          interestRateDefault: String(s.interest_rate_default ?? 6.0),
          processingFeePercent: String(s.processing_fee_percent ?? 6.5),
          minLoan: String(s.min_loan ?? 40000),
          maxLoan: String(s.max_loan ?? 1000000),
          maxMonths: String(s.max_months ?? 6),
        });
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.replace('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    if (ready) fetchAll();
  }, [ready, fetchAll]);

  // ── Block render until auth check passes ─────────────────────────────────
  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const handleAction = async (appId: number, action: 'APPROVE' | 'REJECT', reason?: string) => {
    setActionLoading(appId);
    try {
      const res = await api.patch(`/admin/applications/${appId}`, { action, reason });
      if (res.data.success) {
        showToast(`Application ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
        setRejectingId(null);
        setRejectReason('');
        fetchAll();
      } else {
        showToast(res.data.message, 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await api.patch('/admin/settings', settingsForm);
      if (res.data.success) showToast('Settings saved successfully');
      else showToast(res.data.message, 'error');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSettingsSaving(false);
    }
  };

  const filteredApps = filterStatus === 'ALL'
    ? applications
    : applications.filter(a => a.status === filterStatus);

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight">VERTEX <span className="text-blue-600">ADMIN</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <RefreshCw size={15} className={`text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => authService.logout((p) => router.push(p))}
              className="flex items-center gap-2 px-4 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold text-xs uppercase tracking-widest"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="#3b82f6" />
            <StatCard title="Pending Review" value={stats.pendingApplications} icon={Clock} color="#eab308" />
            <StatCard title="Active Loans" value={stats.activeLoans} icon={TrendingUp} color="#10b981" />
            <StatCard title="Total Disbursed" value={`TZS ${(stats.totalDisbursed / 1000).toFixed(0)}k`} icon={DollarSign} color="#6366f1" />
            <StatCard title="Fees Collected" value={`TZS ${(stats.totalFees / 1000).toFixed(0)}k`} icon={CheckCircle2} color="#8b5cf6" />
          </div>
        )}

        <div className="flex gap-1 bg-white rounded-2xl p-1 border border-slate-100 shadow-sm mb-6 w-fit">
          {(['applications', 'users', 'settings'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <>
            {tab === 'applications' && (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {['ALL', 'SUBMITTED', 'REVIEW', 'APPROVED', 'REJECTED'].map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border ${filterStatus === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {filteredApps.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center text-slate-400 font-bold">No applications found</div>
                ) : filteredApps.map((app) => (
                  <div key={app.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <FileText size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{app.user?.fullName || 'Unknown'}</p>
                          <p className="text-xs text-slate-400 font-medium">{app.user?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-black text-slate-900">{formatCurrencyTZS(app.loanAmount)}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{app.repaymentPeriod} months</p>
                        </div>
                        <StatusBadge status={app.status} />
                        <p className="text-[10px] text-slate-400 font-bold hidden md:block">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {['SUBMITTED', 'REVIEW'].includes(app.status) && (
                          <>
                            <button
                              onClick={() => handleAction(app.id, 'APPROVE')}
                              disabled={actionLoading === app.id}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                              {actionLoading === app.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingId(app.id)}
                              disabled={actionLoading === app.id}
                              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                            >
                              <X size={12} /> Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                          {expandedApp === app.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {rejectingId === app.id && (
                      <div className="px-5 pb-4 border-t border-slate-100 pt-4 flex gap-3">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection (optional)"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-red-400"
                        />
                        <button
                          onClick={() => handleAction(app.id, 'REJECT', rejectReason)}
                          disabled={actionLoading === app.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                          Confirm Reject
                        </button>
                        <button onClick={() => setRejectingId(null)} className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200">
                          Cancel
                        </button>
                      </div>
                    )}

                    {expandedApp === app.id && (
                      <div className="border-t border-slate-100 p-5 bg-slate-50 grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Phone</span><span className="font-bold text-slate-900">{app.user?.phone || '—'}</span></div>
                        <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">ID Type</span><span className="font-bold text-slate-900">{app.idType || '—'}</span></div>
                        <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">ID Number</span><span className="font-bold text-slate-900">{app.idNumber || '—'}</span></div>
                        <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">TIN</span><span className="font-bold text-slate-900">{app.tinNumber || '—'}</span></div>
                        <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Business</span><span className="font-bold text-slate-900">{app.businessName || '—'}</span></div>
                        <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Fee Paid</span><span className={`font-black ${app.processingFeePaid ? 'text-emerald-600' : 'text-orange-500'}`}>{app.processingFeePaid ? 'Yes' : 'No'}</span></div>
                        {app.onlineFormData && (
                          <>
                            <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Loan Purpose</span><span className="font-bold text-slate-900">{app.onlineFormData.loanPurpose || '—'}</span></div>
                            <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Monthly Income</span><span className="font-bold text-slate-900">{app.onlineFormData.monthlyIncome ? formatCurrencyTZS(app.onlineFormData.monthlyIncome) : '—'}</span></div>
                            <div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Guarantor</span><span className="font-bold text-slate-900">{app.onlineFormData.guarantorName || '—'}{app.onlineFormData.guarantorPhone ? ` (${app.onlineFormData.guarantorPhone})` : ''}</span></div>
                          </>
                        )}
                        {app.loan && (
                          <div className="sm:col-span-2 md:col-span-3 pt-2 border-t border-slate-200">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Loan</span>
                            <div className="flex flex-wrap gap-6">
                              <span className="font-bold text-slate-900">Status: <StatusBadge status={app.loan.status} /></span>
                              <span className="font-bold text-slate-900">Total: {formatCurrencyTZS(app.loan.totalRepayment)}</span>
                              <span className="font-bold text-slate-900">Monthly: {formatCurrencyTZS(app.loan.monthlyInstallment)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'users' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Registered Users ({users.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {['ID', 'Name', 'Email', 'Phone', 'KYC', 'Credit Score', 'Joined'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3 font-bold text-slate-500">#{u.id}</td>
                          <td className="px-5 py-3 font-bold text-slate-900">{u.fullName}</td>
                          <td className="px-5 py-3 text-slate-600">{u.email}</td>
                          <td className="px-5 py-3 text-slate-600">{u.phone || '—'}</td>
                          <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${u.kycStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>{u.kycStatus || 'PENDING'}</span></td>
                          <td className="px-5 py-3 font-bold text-slate-900">{u.creditScore || '—'}</td>
                          <td className="px-5 py-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-lg">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Loan Settings</h2>
                <div className="space-y-5">
                  {[
                    { label: 'Interest Rate (%)', key: 'interestRateDefault' },
                    { label: 'Processing Fee (%)', key: 'processingFeePercent' },
                    { label: 'Min Loan (TZS)', key: 'minLoan' },
                    { label: 'Max Loan (TZS)', key: 'maxLoan' },
                    { label: 'Max Months', key: 'maxMonths' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
                      <input
                        type="number"
                        value={settingsForm[key as keyof typeof settingsForm]}
                        onChange={e => setSettingsForm(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-xl px-4 py-3 text-slate-900 font-bold outline-none transition-all"
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {settingsSaving ? <Loader2 size={16} className="animate-spin" /> : <Settings size={16} />}
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
