'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, FileText, DollarSign, CheckCircle2, Clock, LogOut,
  Settings, ChevronDown, ChevronUp, RefreshCw, TrendingUp,
  AlertCircle, Shield, Loader2, X, Check, Lock, Mail,
} from 'lucide-react';

// ── Standalone API helper (no shared axios instance) ─────────────────────────
const BASE = '/api';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  return res.json();
}

// ── Sub-components ────────────────────────────────────────────────────────────
const Stat = ({ title, value, icon: Icon, bg }: any) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
      <Icon size={16} className="text-white" />
    </div>
    <p className="text-xl font-black text-slate-900">{value}</p>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{title}</p>
  </div>
);

const Badge = ({ status }: { status: string }) => {
  const c: Record<string, string> = {
    SUBMITTED: 'bg-yellow-100 text-yellow-700',
    REVIEW: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    PENDING_DISBURSEMENT: 'bg-orange-100 text-orange-700',
    COMPLETED: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${c[status] || 'bg-slate-100 text-slate-500'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

const fmt = (n: number) => `TZS ${Number(n).toLocaleString()}`;

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        if (data.data.role !== 'ADMIN') {
          setError('Access denied. Admin accounts only.');
          return;
        }
        localStorage.setItem('admin_token', data.data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.data));
        onLogin(data.data.token);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">VERTEX ADMIN</h1>
          <p className="text-slate-400 text-sm mt-1">Management Portal</p>
        </div>

        <form onSubmit={submit} className="bg-slate-800 rounded-2xl p-6 space-y-4 border border-slate-700">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@getvertexloans.com"
                className="w-full bg-slate-700 border border-slate-600 focus:border-blue-500 rounded-xl pl-9 pr-4 py-3 text-white placeholder:text-slate-500 outline-none text-sm transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-700 border border-slate-600 focus:border-blue-500 rounded-xl pl-9 pr-4 py-3 text-white placeholder:text-slate-500 outline-none text-sm transition-colors"
              />
            </div>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-xl text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<'applications' | 'users' | 'settings'>('applications');
  const [stats, setStats] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [settingsForm, setSettingsForm] = useState({ interestRateDefault: '6.0', processingFeePercent: '6.5', minLoan: '40000', maxLoan: '1000000', maxMonths: '6' });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const [s, a, u, st] = await Promise.all([
        apiFetch('/admin/stats'),
        apiFetch(`/admin/applications?status=${filter}`),
        apiFetch('/admin/users'),
        apiFetch('/admin/settings'),
      ]);
      if (s.success) setStats(s.data);
      if (a.success) setApps(a.data.applications);
      if (u.success) setUsers(u.data.users);
      if (st.success && st.data.settings) {
        const s2 = st.data.settings;
        setSettingsForm({
          interestRateDefault: String(s2.interest_rate_default ?? 6.0),
          processingFeePercent: String(s2.processing_fee_percent ?? 6.5),
          minLoan: String(s2.min_loan ?? 40000),
          maxLoan: String(s2.max_loan ?? 1000000),
          maxMonths: String(s2.max_months ?? 6),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const action = async (id: number, act: 'APPROVE' | 'REJECT', reason?: string) => {
    setActionLoading(id);
    const res = await apiFetch(`/admin/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: act, reason }),
    });
    setActionLoading(null);
    if (res.success) { showToast(`Application ${act === 'APPROVE' ? 'approved' : 'rejected'}`); setRejectingId(null); load(); }
    else showToast(res.message || 'Failed');
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    const res = await apiFetch('/admin/settings', { method: 'PATCH', body: JSON.stringify(settingsForm) });
    setSettingsSaving(false);
    showToast(res.success ? 'Settings saved' : res.message || 'Failed');
  };

  const filtered = filter === 'ALL' ? apps : apps.filter(a => a.status === filter);

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-xl text-sm font-bold">
          {toast}
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-black text-slate-900">VERTEX <span className="text-blue-600">ADMIN</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
              <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : 'text-slate-600'} />
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs uppercase tracking-widest">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <Stat title="Users" value={stats.totalUsers} icon={Users} bg="bg-blue-500" />
            <Stat title="Pending" value={stats.pendingApplications} icon={Clock} bg="bg-yellow-500" />
            <Stat title="Active Loans" value={stats.activeLoans} icon={TrendingUp} bg="bg-emerald-500" />
            <Stat title="Disbursed" value={`TZS ${((stats.totalDisbursed || 0) / 1000).toFixed(0)}k`} icon={DollarSign} bg="bg-indigo-500" />
            <Stat title="Fees" value={`TZS ${((stats.totalFees || 0) / 1000).toFixed(0)}k`} icon={CheckCircle2} bg="bg-purple-500" />
          </div>
        )}

        <div className="flex gap-1 bg-white rounded-2xl p-1 border border-slate-100 shadow-sm mb-6 w-fit">
          {(['applications', 'users', 'settings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
        ) : (
          <>
            {tab === 'applications' && (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {['ALL', 'SUBMITTED', 'REVIEW', 'APPROVED', 'REJECTED'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all ${filter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>

                {filtered.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center text-slate-400 font-bold">No applications</div>
                ) : filtered.map(app => (
                  <div key={app.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                          <FileText size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{app.user?.fullName || '—'}</p>
                          <p className="text-xs text-slate-400">{app.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-sm">{fmt(app.loanAmount)}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{app.repaymentPeriod}mo</p>
                        </div>
                        <Badge status={app.status} />
                        <span className="text-[10px] text-slate-400 hidden md:block">{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {['SUBMITTED', 'REVIEW'].includes(app.status) && (
                          <>
                            <button onClick={() => action(app.id, 'APPROVE')} disabled={actionLoading === app.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase disabled:opacity-50">
                              {actionLoading === app.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Approve
                            </button>
                            <button onClick={() => setRejectingId(app.id)} disabled={actionLoading === app.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black uppercase">
                              <X size={11} /> Reject
                            </button>
                          </>
                        )}
                        <button onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                          {expanded === app.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                    </div>

                    {rejectingId === app.id && (
                      <div className="px-5 pb-4 pt-3 border-t border-slate-100 flex gap-2">
                        <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                          placeholder="Reason (optional)"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-400" />
                        <button onClick={() => action(app.id, 'REJECT', rejectReason)}
                          className="px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase hover:bg-red-700">
                          Confirm
                        </button>
                        <button onClick={() => setRejectingId(null)}
                          className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                          Cancel
                        </button>
                      </div>
                    )}

                    {expanded === app.id && (
                      <div className="border-t border-slate-100 p-5 bg-slate-50 grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {[
                          ['Phone', app.user?.phone],
                          ['ID Type', app.idType],
                          ['ID Number', app.idNumber],
                          ['TIN', app.tinNumber],
                          ['Business', app.businessName],
                          ['Fee Paid', app.processingFeePaid ? '✓ Yes' : '✗ No'],
                          ...(app.onlineFormData ? [
                            ['Purpose', app.onlineFormData.loanPurpose],
                            ['Income', app.onlineFormData.monthlyIncome ? fmt(app.onlineFormData.monthlyIncome) : null],
                            ['Guarantor', app.onlineFormData.guarantorName],
                          ] : []),
                        ].map(([label, val]) => (
                          <div key={label as string}>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{label}</span>
                            <span className="font-bold text-slate-900">{val || '—'}</span>
                          </div>
                        ))}
                        {app.loan && (
                          <div className="sm:col-span-2 md:col-span-3 pt-2 border-t border-slate-200 flex flex-wrap gap-4">
                            <span className="font-bold text-slate-900">Loan: <Badge status={app.loan.status} /></span>
                            <span className="font-bold text-slate-900">Total: {fmt(app.loan.totalRepayment)}</span>
                            <span className="font-bold text-slate-900">Monthly: {fmt(app.loan.monthlyInstallment)}</span>
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
                  <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Users ({users.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {['#', 'Name', 'Email', 'Phone', 'KYC', 'Score', 'Joined'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-400 font-bold">{u.id}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{u.fullName}</td>
                          <td className="px-4 py-3 text-slate-600">{u.email}</td>
                          <td className="px-4 py-3 text-slate-600">{u.phone || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${u.kycStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {u.kycStatus || 'PENDING'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">{u.creditScore || '—'}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-md">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Loan Settings</h2>
                <div className="space-y-4">
                  {[
                    ['Interest Rate (%)', 'interestRateDefault'],
                    ['Processing Fee (%)', 'processingFeePercent'],
                    ['Min Loan (TZS)', 'minLoan'],
                    ['Max Loan (TZS)', 'maxLoan'],
                    ['Max Months', 'maxMonths'],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
                      <input type="number"
                        value={settingsForm[key as keyof typeof settingsForm]}
                        onChange={e => setSettingsForm(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-xl px-4 py-2.5 text-slate-900 font-bold outline-none transition-all"
                      />
                    </div>
                  ))}
                  <button onClick={saveSettings} disabled={settingsSaving}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                    {settingsSaving ? <Loader2 size={15} className="animate-spin" /> : <Settings size={15} />}
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

// ── Root: manages login state locally ────────────────────────────────────────
export default function AdminPortal() {
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if already logged in as admin
    const t = localStorage.getItem('admin_token');
    const u = localStorage.getItem('admin_user');
    if (t && u) {
      try {
        const user = JSON.parse(u);
        if (user.role === 'ADMIN') { setToken(t); }
      } catch { }
    }
    setChecking(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!token) return <LoginScreen onLogin={setToken} />;
  return <AdminDashboard onLogout={logout} />;
}
