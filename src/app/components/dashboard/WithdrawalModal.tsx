import React, { useState, useEffect } from "react";
import {
    Building2,
    Smartphone,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    ShieldCheck,
    Building,
    CreditCard,
    Loader2,
    X,
    Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, Badge } from "../ui";
import api from "../../../lib/api";

interface Loan {
    id: number;
    principalAmount: number;
    status: string;
}

export const WithdrawalModal = ({
    isOpen,
    onClose,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loan, setLoan] = useState<Loan | null>(null);
    const [method, setMethod] = useState<'MPESA' | 'BANK' | null>(null);
    const [accountDetails, setAccountDetails] = useState("");
    const [bankName, setBankName] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchPendingLoan();
        }
    }, [isOpen]);

    const fetchPendingLoan = async () => {
        setLoading(true);
        try {
            const res = await api.get('/loans/pending-withdrawal');
            if (res.data.success) {
                setLoan(res.data.data);
            } else {
                setError("No pending loan found for withdrawal.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to fetch loan details");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError("");
        try {
            const details = method === 'BANK' ? `${bankName} - ${accountDetails}` : accountDetails;
            const res = await api.post('/loans/withdraw', {
                method,
                accountDetails: details
            });
            if (res.data.success) {
                setStep(4);
                if (onSuccess) onSuccess();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to submit withdrawal request");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={onClose}
                />
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Withdraw Funds</h2>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Disbursement Center</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 pt-0">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Verifying Loan Status...</p>
                        </div>
                    ) : error && step !== 4 ? (
                        <div className="py-12 px-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Notice</h3>
                            <p className="text-slate-500 font-medium mb-8">{error}</p>
                            <Button className="w-full h-14 rounded-2xl font-bold" onClick={onClose}>Close</Button>
                        </div>
                    ) : (
                        <>
                            {/* Stepper */}
                            <div className="flex items-center gap-2 mb-8">
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]" : "bg-slate-100"
                                            }`}
                                    />
                                ))}
                            </div>

                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <Card className="p-6 bg-blue-50/50 border-blue-100 border-2 rounded-3xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Wallet size={80} />
                                        </div>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Available for Withdrawal</p>
                                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                                            KES {loan?.principalAmount.toLocaleString()}
                                        </h3>
                                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                            <ShieldCheck size={14} className="text-emerald-500" />
                                            Verified Application LW-{loan?.id}
                                        </div>
                                    </Card>

                                    <div className="grid grid-cols-1 gap-4">
                                        <button
                                            onClick={() => { setMethod('MPESA'); setStep(2); }}
                                            className="p-5 rounded-3xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                                                    <Smartphone size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 tracking-tight">M-Pesa Express</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Instant Transfer</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </button>

                                        <button
                                            onClick={() => { setMethod('BANK'); setStep(2); }}
                                            className="p-5 rounded-3xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                                                    <Building2 size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 tracking-tight">Bank Transfer</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Commercial Banks</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">
                                            {method === 'MPESA' ? "M-Pesa Details" : "Bank Account Details"}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium">Please provide accurate information for 1-hour disbursement.</p>
                                    </div>

                                    <div className="space-y-4">
                                        {method === 'BANK' && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Bank Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Equity Bank, KCB"
                                                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 outline-none transition-all font-bold"
                                                    value={bankName}
                                                    onChange={(e) => setBankName(e.target.value)}
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                                                {method === 'MPESA' ? "M-Pesa Number" : "Account Number"}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={method === 'MPESA' ? "0712 345 678" : "Account number"}
                                                className="w-full h-14 bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 outline-none transition-all font-bold"
                                                value={accountDetails}
                                                onChange={(e) => setAccountDetails(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => setStep(1)}>Back</Button>
                                        <Button
                                            className="flex-[2] h-14 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                                            onClick={() => setStep(3)}
                                            disabled={!accountDetails || (method === 'BANK' && !bankName)}
                                        >
                                            Confirm Details
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                                            <ShieldCheck size={32} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900">Review & Submit</h3>
                                        <p className="text-sm text-slate-500 font-medium">Verify your withdrawal information </p>
                                    </div>

                                    <Card className="p-6 bg-slate-50 border-none rounded-3xl space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Amount</span>
                                            <span className="font-black text-slate-900">KES {loan?.principalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Method</span>
                                            <span className="font-black text-slate-900">{method === 'MPESA' ? "M-Pesa" : "Bank Transfer"}</span>
                                        </div>
                                        <div className="flex justify-between items-start py-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Details</span>
                                            <span className="font-black text-slate-900 text-right max-w-[180px]">
                                                {method === 'BANK' ? `${bankName}\n${accountDetails}` : accountDetails}
                                            </span>
                                        </div>
                                    </Card>

                                    <div className="flex gap-4 pt-4">
                                        <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => setStep(2)}>Modify</Button>
                                        <Button
                                            className="flex-[2] h-14 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                "Submit Withdrawal"
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-12 text-center"
                                >
                                    <div className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center text-emerald-500 mx-auto mb-8 shadow-inner">
                                        <CheckCircle2 size={48} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Request Received!</h3>
                                    <p className="text-slate-500 font-medium mb-10 max-w-[300px] mx-auto leading-relaxed">
                                        Your withdrawal request has been submitted. Funds will reflect in your account within 1-2 hours.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="w-full h-16 rounded-3xl font-black text-slate-900 border-2"
                                        onClick={onClose}
                                    >
                                        Return to Dashboard
                                    </Button>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
