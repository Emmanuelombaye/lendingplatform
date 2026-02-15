import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from './ui';
import { Loader2, FileText, Calendar, DollarSign, Clock } from 'lucide-react';
import api from '../../lib/api';
import { LoanRepayment } from './client';

export const UserDashboard = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [activeLoan, setActiveLoan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [appsRes, loanRes] = await Promise.allSettled([
                api.get('/applications/my'),
                api.get('/loans/active')
            ]);

            if (appsRes.status === 'fulfilled' && appsRes.value.data.success) {
                setApplications(appsRes.value.data.data);
            }

            if (loanRes.status === 'fulfilled' && loanRes.value.data.success) {
                setActiveLoan(loanRes.value.data.data);
            } else {
                setActiveLoan(null);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 bg-slate-50">
            <div className="max-w-[1200px] mx-auto">
                {activeLoan && (
                    <div className="space-y-12 mb-12">
                        <LoanRepayment loan={activeLoan} onRepaymentSuccess={fetchDashboardData} />

                        {activeLoan.repayments && activeLoan.repayments.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-[#0F172A] mb-6">Payment History</h3>
                                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Balance</th>
                                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeLoan.repayments.map((r: any) => (
                                                <tr key={r.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-4 font-medium text-[#0F172A]">{new Date(r.paymentDate).toLocaleDateString()}</td>
                                                    <td className="p-4 font-bold text-emerald-600">+ KES {Number(r.amountPaid).toLocaleString()}</td>
                                                    <td className="p-4 text-slate-600">KES {Number(r.remainingBalance).toLocaleString()}</td>
                                                    <td className="p-4">
                                                        <Badge variant="success">Paid</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#0F172A]">My Applications</h1>
                    <p className="text-slate-500 mt-2">Track the status of your loan applications.</p>
                </div>

                {applications.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0F172A] mb-2">No Applications Yet</h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">You haven't submitted any loan applications yet. Get started today to secure your financial future.</p>
                        <Button onClick={() => window.location.reload()}>Apply for a Loan</Button>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {applications.map((app) => (
                            <Card key={app.id} className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#0F172A]">Business Loan Application</h3>
                                            <div className="text-sm text-slate-500">ID: #{app.id}</div>
                                        </div>
                                    </div>
                                    <Badge variant={
                                        app.status === 'APPROVED' ? 'success' :
                                            app.status === 'REJECTED' ? 'danger' :
                                                'info'
                                    }>
                                        {app.status}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-slate-100 mb-4">
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Amount</div>
                                        <div className="font-bold text-[#0F172A]">KES {Number(app.loanAmount).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Period</div>
                                        <div className="font-bold text-[#0F172A]">{app.repaymentPeriod} Months</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Date Applied</div>
                                        <div className="font-bold text-[#0F172A]">{new Date(app.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Documents</div>
                                        <div className="font-bold text-[#0F172A]">{app.documents?.length || 0} Files</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
