import { useState, useEffect } from 'react';
import { Card, Badge, Button } from './ui';
import { Download } from 'lucide-react';
import api from '../lib/api';

export const LoanManagement = () => {
    const [loans, setLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLoans = async () => {
        try {
            const res = await api.get('/admin/loans');
            if (res.data.success) {
                setLoans(res.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
        const interval = setInterval(fetchLoans, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Active Loans</h2>
                    <p className="text-slate-500">Monitor and manage disbursed loans.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="md">
                        <Download className="mr-2 w-4 h-4" /> Export Report
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Borrower</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Principal</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Interest</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total Due</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Start Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-500">Loading loans...</td>
                                </tr>
                            ) : loans.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-500">No active loans found.</td>
                                </tr>
                            ) : (
                                loans.map((loan: any) => (
                                    <tr key={loan.id} className="hover:bg-slate-50/30">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-[#0F172A]">{loan.application.user?.fullName}</div>
                                            <div className="text-xs text-slate-500">{loan.application.user?.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold">KES {loan.principalAmount?.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">KES {loan.totalInterest?.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-bold text-emerald-700">KES {loan.totalRepayment?.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(loan.startDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={loan.status === 'ACTIVE' ? 'success' : 'default'}>
                                                {loan.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
