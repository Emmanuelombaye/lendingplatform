import { useState, useEffect } from 'react';
import { Card, Badge, Button } from './ui';
import { Download } from 'lucide-react';
import api from '../lib/api';
import { formatCurrencyTZS, formatDateTZ } from '../lib/locale';

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
                    <h2 className="text-2xl font-bold text-[#0F172A]">Mikopo Inayoendelea</h2>
                    <p className="text-slate-500">Fuatilia na simamia mikopo iliyotolewa.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="md">
                        <Download className="mr-2 w-4 h-4" /> Pakua Ripoti
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Mkopaji</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Msingi</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Riba</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Jumla</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tarehe ya Kuanza</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Hali</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-500">Inapakia mikopo...</td>
                                </tr>
                            ) : loans.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-500">Hakuna mkopo unaoendelea.</td>
                                </tr>
                            ) : (
                                loans.map((loan: any) => (
                                    <tr key={loan.id} className="hover:bg-slate-50/30">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-[#0F172A]">{loan.application.user?.fullName}</div>
                                            <div className="text-xs text-slate-500">{loan.application.user?.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold">{formatCurrencyTZS(loan.principalAmount || 0)}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">{formatCurrencyTZS(loan.totalInterest || 0)}</td>
                                        <td className="px-6 py-4 font-bold text-emerald-700">{formatCurrencyTZS(loan.totalRepayment || 0)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{formatDateTZ(loan.startDate)}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={loan.status === 'ACTIVE' ? 'success' : 'default'}>
                                                {loan.status === 'ACTIVE' ? 'INAENDELEA' : loan.status}
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
