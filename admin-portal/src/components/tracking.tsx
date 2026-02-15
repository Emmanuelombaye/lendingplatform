import React, { useState, useEffect } from 'react';
import { Loader2, Search, Percent, MessageSquare, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Badge, Button, cn } from './ui';
import api from '../lib/api';

export const TrackingManagement = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [editProgress, setEditProgress] = useState<{ [key: number]: number }>({});
    const [editNotes, setEditNotes] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        fetchApplications();
        const interval = setInterval(fetchApplications, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await api.get('/admin/applications');
            if (res.data.success) {
                setApplications(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProgress = async (appId: number) => {
        setSaving(appId);
        try {
            await api.put(`/admin/applications/${appId}/progress`, {
                processingProgress: editProgress[appId] ?? 0,
                progressNote: editNotes[appId] ?? ''
            });
            await fetchApplications();
        } catch (error) {
            console.error('Failed to update progress', error);
        } finally {
            setSaving(null);
        }
    };

    const filteredApps = applications.filter(app =>
        app.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        app.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        String(app.id).includes(search)
    );

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-emerald-500';
        if (progress >= 50) return 'bg-blue-500';
        if (progress >= 25) return 'bg-amber-500';
        return 'bg-slate-300';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                        placeholder="Search by name, email, or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-[#0F172A]">{applications.length}</div>
                    <div className="text-xs text-slate-500 mt-1">Total Applications</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">{applications.filter(a => a.processingProgress < 25).length}</div>
                    <div className="text-xs text-slate-500 mt-1">Just Started</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{applications.filter(a => a.processingProgress >= 25 && a.processingProgress < 80).length}</div>
                    <div className="text-xs text-slate-500 mt-1">In Progress</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">{applications.filter(a => a.processingProgress >= 80).length}</div>
                    <div className="text-xs text-slate-500 mt-1">Near Complete</div>
                </Card>
            </div>

            {/* Applications List */}
            <div className="space-y-3">
                {filteredApps.map((app) => (
                    <Card key={app.id} className="overflow-hidden">
                        {/* Header Row */}
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => {
                                const newId = expandedId === app.id ? null : app.id;
                                setExpandedId(newId);
                                if (newId !== null) {
                                    setEditProgress(prev => ({ ...prev, [app.id]: app.processingProgress || 0 }));
                                    setEditNotes(prev => ({ ...prev, [app.id]: app.progressNote || '' }));
                                }
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                                    {app.user?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                    <div className="font-bold text-[#0F172A] text-sm">{app.user?.fullName}</div>
                                    <div className="text-xs text-slate-500">#{app.id} · KES {Number(app.loanAmount).toLocaleString()} · {app.repaymentPeriod}mo</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant={
                                    app.status === 'APPROVED' ? 'success' :
                                        app.status === 'REJECTED' ? 'danger' :
                                            app.status === 'REVIEW' ? 'warning' : 'info'
                                }>{app.status}</Badge>
                                <div className="flex items-center gap-2 min-w-[120px]">
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-500", getProgressColor(app.processingProgress || 0))}
                                            style={{ width: `${app.processingProgress || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 w-10 text-right">{app.processingProgress || 0}%</span>
                                </div>
                                {expandedId === app.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                        </div>

                        {/* Expanded Edit Panel */}
                        {expandedId === app.id && (
                            <div className="px-4 pb-4 border-t border-slate-100 pt-4 bg-slate-50/50">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Progress Slider */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                                            <Percent size={14} />
                                            Processing Progress
                                        </label>
                                        <div className="space-y-3">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="5"
                                                value={editProgress[app.id] ?? 0}
                                                onChange={(e) => setEditProgress(prev => ({ ...prev, [app.id]: parseInt(e.target.value) }))}
                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                            />
                                            <div className="flex justify-between text-xs text-slate-400">
                                                <span>0%</span>
                                                <span className="text-lg font-bold text-blue-600">{editProgress[app.id] ?? 0}%</span>
                                                <span>100%</span>
                                            </div>
                                            {/* Quick Buttons */}
                                            <div className="flex gap-2">
                                                {[10, 25, 50, 75, 100].map(val => (
                                                    <button
                                                        key={val}
                                                        onClick={() => setEditProgress(prev => ({ ...prev, [app.id]: val }))}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                                            (editProgress[app.id] ?? 0) === val
                                                                ? "bg-blue-600 text-white"
                                                                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                                                        )}
                                                    >
                                                        {val}%
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Note */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                                            <MessageSquare size={14} />
                                            Status Note (visible to client)
                                        </label>
                                        <textarea
                                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm resize-none"
                                            rows={3}
                                            placeholder="e.g. Documents under review, Verification in progress..."
                                            value={editNotes[app.id] ?? ''}
                                            onChange={(e) => setEditNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <Button
                                        onClick={() => handleSaveProgress(app.id)}
                                        disabled={saving === app.id}
                                        className="gap-2"
                                    >
                                        {saving === app.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Check size={16} />
                                        )}
                                        Save Progress
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};
