import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Wallet,
  Zap,
  Award,
  Shield,
  Bell,
  Download,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  Phone,
  ChevronRight,
  Plus,
  Receipt,
  X,
  User,
  MessageSquare,
  Star,
  Loader2,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, Badge } from "../ui";
import api from "../../../lib/api";
import { notificationService } from "../../../lib/notifications";
import { authService } from "../../../lib/authUtils";
import { LoanRepayment, ProcessingFeePayment, ApplicationFlow } from '../client';
import { WithdrawalModal } from "./WithdrawalModal";

// Support configuration
const SUPPORT_CONFIG = {
  whatsapp: "+1(870)962-0043",
  tillNumber: "5617392",
  supportHours: "24/7",
};

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

interface LoanApplication {
  id: number;
  loanAmount: number;
  repaymentPeriod: number;
  status: string;
  createdAt: string;
  totalRepayment: number;
  monthlyPayment: number;
  interestRate: number;
  progress: number;
  nextPaymentDate?: string;
  remainingBalance?: number;
  processingFeePaid?: boolean;
  paymentEvidenceUrl?: string;
  mpesaTransactionId?: string;
  loan?: {
    id: number;
    status: string;
    interestRate: number;
    totalRepayment: number;
    monthlyInstallment: number;
    repayments: any[];
    startDate: string;
    endDate: string;
  };
}

interface Transaction {
  id: number;
  type: "DISBURSEMENT" | "PAYMENT" | "FEE" | "PROCESSING_FEE";
  amount: number;
  description: string;
  date: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
}

interface Charge {
  id: number;
  type: "PROCESSING_FEE" | "SERVICE_FEE" | "LATE_FEE";
  amount: number;
  description: string;
  status: "PAID" | "PENDING" | "OVERDUE";
  date: string;
  loanId?: number;
}

interface Notification {
  id: number | string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  time: string;
  timestamp?: Date;
  read: boolean;
  actionUrl?: string;
  userId?: string;
  loanId?: string;
  persistent?: boolean;
}

// Premium animated background
const DashboardBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/10 via-indigo-400/5 to-purple-400/10 blur-3xl rounded-full animate-pulse" />
    <div
      className="absolute -bottom-32 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/10 via-cyan-400/5 to-teal-400/10 blur-3xl rounded-full animate-pulse"
      style={{ animationDelay: "2s" }}
    />
    <div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-violet-400/5 to-pink-400/5 blur-3xl rounded-full animate-pulse"
      style={{ animationDelay: "4s" }}
    />
  </div>
);

// Animated Number Ticker for "scrolling" font effect
const NumberTicker = ({ value }: { value: string | number }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  if (typeof value === "string" && !/^\d+$/.test(value.replace(/[^0-9]/g, ''))) {
    return <>{value}</>;
  }

  // Simple entry animation for the text
  return (
    <motion.span
      key={value.toString()}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="inline-block"
    >
      {value}
    </motion.span>
  );
};

// Premium stats card component
const StatsCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = "blue",
  subtitle,
  loading = false,
}: {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: any;
  color?: string;
  subtitle?: string;
  loading?: boolean;
}) => {
  const colorClasses: { [key: string]: string } = {
    blue: "from-blue-500 to-indigo-500",
    emerald: "from-emerald-500 to-teal-500",
    purple: "from-purple-500 to-violet-500",
    orange: "from-orange-500 to-red-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="p-4 bg-white/80 backdrop-blur-xl border-0 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 group overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-r ${colorClasses[color] || colorClasses.blue} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}
          >
            <Icon size={18} className="text-white" />
          </div>
          {change && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${trend === "up"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
                }`}
            >
              {trend === "up" ? (
                <TrendingUp size={10} />
              ) : (
                <TrendingDown size={10} />
              )}
              {change}
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
            {title}
          </h3>
          {loading ? (
            <div className="h-6 w-24 bg-slate-100 animate-pulse rounded" />
          ) : (
            <p className="text-xl font-black text-slate-900 tracking-tighter">
              <NumberTicker value={value} />
            </p>
          )}
          {subtitle && (
            <p className="text-[10px] text-slate-500 font-bold tracking-tight">
              {subtitle}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// Quick action button
const QuickActionButton = ({
  title,
  description,
  icon: Icon,
  onClick,
  color = "blue",
  disabled = false,
}: {
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
}) => (
  <motion.button
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={`p-4 rounded-xl border-2 border-slate-100 bg-white/50 backdrop-blur-sm hover:bg-white hover:border-blue-200 transition-all duration-300 text-left group ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-lg bg-gradient-to-r ${color === "emerald"
          ? "from-emerald-500 to-teal-500"
          : color === "purple"
            ? "from-purple-500 to-violet-500"
            : color === "orange"
              ? "from-orange-500 to-red-500"
              : "from-blue-500 to-indigo-500"
          } flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon size={16} className="text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
          {title}
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">{description}</p>
      </div>
      <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
    </div>
  </motion.button>
);

// Transaction item component
const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case "DISBURSEMENT":
        return <ArrowDownRight className="text-emerald-500" size={20} />;
      case "PAYMENT":
        return <ArrowUpRight className="text-blue-500" size={20} />;
      case "FEE":
      case "PROCESSING_FEE":
      case "SERVICE_FEE":
        return <CreditCard className="text-orange-500" size={20} />;
      default:
        return <Activity className="text-slate-500" size={20} />;
    }
  };

  const getStatusBadge = () => {
    switch (transaction.status) {
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Completed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200">
            Failed
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center justify-between p-3 hover:bg-white rounded-xl transition-all duration-300 group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
          {getTransactionIcon()}
        </div>
        <div>
          <p className="text-[11px] font-black text-slate-900 tracking-tight">{transaction.description}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            {new Date(transaction.date).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`text-[11px] font-black tracking-tight ${transaction.type === "DISBURSEMENT"
            ? "text-emerald-600"
            : "text-slate-900"
            }`}
        >
          {transaction.type === "DISBURSEMENT" ? "+" : "-"}KES{" "}
          {transaction.amount.toLocaleString()}
        </p>
        <div className="flex justify-end mt-0.5">
          {getStatusBadge()}
        </div>
      </div>
    </motion.div>
  );
};

// Loan progress component
const LoanProgress = ({ loan }: { loan: LoanApplication }) => {
  const progressPercentage =
    ((loan.loanAmount - (loan.remainingBalance || 0)) / loan.loanAmount) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full -mr-16 -mt-16 blur-2xl" />

        <div className="flex items-center justify-between mb-5 relative z-10">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Active Loan</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">REF: LW-{loan.id}</p>
          </div>
          <Badge className="bg-blue-600 text-white border-0 text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
            {loan.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Loan Amount
            </p>
            <p className="text-xl font-black text-slate-900">
              KES {loan.loanAmount.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 bg-white rounded-xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Remaining
            </p>
            <p className="text-xl font-black text-blue-600">
              KES {(loan.remainingBalance || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-700">Repayment Progress</span>
            <span className="font-bold text-blue-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 shadow-lg"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {loan.nextPaymentDate && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar size={16} />
              <span>
                Next payment due:{" "}
                {new Date(loan.nextPaymentDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// Credit score component
const CreditScoreCard = ({
  score,
  scoreChange,
  onTimeStreak = 0,
  loading = false
}: {
  score?: number;
  scoreChange?: string;
  onTimeStreak?: number;
  loading?: boolean;
}) => {
  const getScoreColor = () => {
    if (!score) return "text-slate-400";
    if (score >= 750) return "text-emerald-500";
    if (score >= 650) return "text-blue-500";
    if (score >= 550) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = () => {
    if (!score) return "No score yet";
    if (score >= 750) return "Excellent";
    if (score >= 650) return "Good";
    if (score >= 550) return "Fair";
    return "Building";
  };

  if (loading) {
    return (
      <Card className="p-4 bg-white border-0 shadow-sm animate-pulse">
        <div className="h-4 w-24 bg-slate-100 rounded mb-4" />
        <div className="h-10 w-20 bg-slate-100 rounded mx-auto mb-2" />
        <div className="h-4 w-16 bg-slate-100 rounded mx-auto" />
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-5 bg-white border-0 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors duration-500" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit Score</h3>
            <Shield size={16} className="text-blue-500" />
          </div>

          <div className="text-center mb-6">
            <div className={`text-4xl font-black mb-1 tracking-tighter ${getScoreColor()}`}>
              <NumberTicker value={score ?? '---'} />
            </div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{getScoreLabel()}</div>
          </div>

          {score ? (
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                <span>Range 300</span>
                <span>850</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${((score - 300) / 550) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${score >= 750 ? "bg-emerald-500" :
                    score >= 650 ? "bg-blue-500" :
                      score >= 550 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-slate-400 text-[10px] font-bold uppercase">Building Credit...</p>
            </div>
          )}

          {scoreChange && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                Monthly Change{" "}
                <span className={`${scoreChange.startsWith('+') ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                  {scoreChange} PTS
                </span>
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// Charges Section Component
const ChargesSection = ({
  charges,
  loading,
}: {
  charges: Charge[];
  loading: boolean;
}) => {
  if (loading) {
    return (
      <Card className="p-5 bg-purple-50/50 border-purple-100 shadow-sm animate-pulse">
        <div className="h-5 w-32 bg-purple-100 rounded mb-4" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-100 rounded" />
          <div className="h-4 w-2/3 bg-slate-100 rounded" />
        </div>
      </Card>
    );
  }

  const totalCharges = charges.reduce((sum, charge) => sum + charge.amount, 0);
  const paidCharges = charges.filter((charge) => charge.status === "PAID");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card className="p-5 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 border-purple-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Receipt size={14} />
            </div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Charges</h3>
          </div>
          <Badge className="bg-purple-100 text-purple-700 border-0 text-[10px] font-black uppercase px-2 py-0.5">
            {paidCharges.length}/{charges.length} PAID
          </Badge>
        </div>

        <div className="mb-4 p-3 bg-white/50 rounded-xl border border-purple-100 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Total Dues</p>
          <p className="text-xl font-black text-purple-600 tracking-tighter">
            KES {totalCharges.toLocaleString()}
          </p>
        </div>

        <div className="space-y-2">
          {charges.length > 0 ? (
            charges.map((charge) => (
              <div key={charge.id} className="flex items-center justify-between p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                <div>
                  <p className="text-[11px] font-black text-slate-900 tracking-tight">{charge.description}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(charge.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black text-slate-900">KES {charge.amount.toLocaleString()}</p>
                  <Badge className={`text-[9px] font-black uppercase px-1.5 py-0 border-0 ${charge.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                    }`}>
                    {charge.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">No outstanding charges</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// Main dashboard component
export const Dashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => authService.logout(navigate);
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [realTimeNotifications, setRealTimeNotifications] = useState<
    Notification[]
  >([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [creditScoreRating, setCreditScoreRating] = useState<string>('');
  const [scoreChange, setScoreChange] = useState<string>('');
  const [onTimePaymentsStreak, setOnTimePaymentsStreak] = useState<number>(0);
  const [maxCreditLimit, setMaxCreditLimit] = useState<number>(0);
  const [stats, setStats] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [applicationToPayFee, setApplicationToPayFee] = useState<any>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [pendingApplication, setPendingApplication] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeLoanData, setActiveLoanData] = useState<any>(null);
  const [pendingWithdrawal, setPendingWithdrawal] = useState<any>(null);

  const lastSeenNotificationIdsRef = useRef<Set<number>>(new Set());
  const fetchDashboardDataRef = useRef<(() => Promise<void>) | null>(null);

  // Helper to format membership date
  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return "---";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  // Initialize notification service and fetch real notifications
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification: any) => {
      const converted: Notification = {
        id: notification.id || Date.now(),
        type: notification.type || 'info',
        title: notification.title || 'New Notification',
        message: notification.message || '',
        time: 'Just now',
        read: false,
        actionUrl: notification.actionUrl
      };
      setRealTimeNotifications(prev => [converted, ...prev]);
      setNotifications(prev => [converted, ...prev]);
    });

    // Fetch dashboard data including credit score
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/users/dashboard');
        if (res.data.success) {
          const data = res.data.data;
          setUser(data.user);
          setApplications(data.applications);
          setTransactions(data.transactions);
          setCharges(data.charges);
          setNotifications(data.notifications);
          setStats(data.statistics);
          setCreditScore(data.statistics.creditScore);
          setCreditScoreRating(data.statistics.creditScoreRating);
          setScoreChange(data.statistics.scoreChange);
          setOnTimePaymentsStreak(data.statistics.onTimePaymentsStreak || 0);
          setMaxCreditLimit(data.statistics.maxCreditLimit);
          setActiveLoanData(data.activeLoan);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardDataRef.current = fetchDashboardData;
    fetchDashboardData();

    return unsubscribe;
  }, []);

  // Poll notifications every 5s so client sees approve/reject in near real time
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/users/notifications');
      if (res.data.success) {
        const data = res.data.data;
        const list = Array.isArray(data) ? data : (data?.notifications || []);

        const seen = lastSeenNotificationIdsRef.current;
        const unreadNew = list.filter((n: any) => !n.read);
        const newlyReceived = unreadNew.filter((n: any) => !seen.has(n.id));

        let shouldRefetchDashboard = false;
        newlyReceived.forEach((notif: any) => {
          seen.add(notif.id);
          const isApprovalOrRejection =
            (notif.type && (notif.type === 'SUCCESS' || notif.type === 'ERROR')) ||
            (notif.title && (String(notif.title).includes('Approved') || String(notif.title).includes('declined') || String(notif.title).includes('Update')));
          if (isApprovalOrRejection) shouldRefetchDashboard = true;

          notificationService.showNotification({
            id: notif.id.toString(),
            type: (notif.type && notif.type.toLowerCase()) === 'error' ? 'error' : (notif.type && notif.type.toLowerCase()) === 'success' ? 'success' : 'info',
            title: notif.title,
            message: notif.message,
            timestamp: new Date(notif.timestamp || Date.now()),
            actionUrl: notif.actionUrl,
            persistent: notif.persistent
          });
        });

        if (list.length) {
          list.forEach((n: any) => seen.add(n.id));
        }
        setNotifications(list);

        if (shouldRefetchDashboard && fetchDashboardDataRef.current) {
          await fetchDashboardDataRef.current();
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalBorrowed = stats?.totalBorrowed || 0;
  const totalRepaid = stats?.totalRepaid || 0;
  const totalChargesPaid = stats?.totalChargesPaid || 0;
  const availableCredit = stats?.availableCredit || 0;
  const creditUtilization = stats?.creditUtilization || 0;

  // Calculate active loan
  const activeLoan = applications.find(
    (app) => app.status === "APPROVED" && app.loan?.status === "ACTIVE"
  );

  const pendingDisbursement = applications.find(
    (app) => app.status === "APPROVED" && app.loan?.status === "PENDING_DISBURSEMENT"
  );

  const handleWhatsAppSupport = () => {
    const message = `Hello, I'm ${user?.fullName} (ID: ${user?.id}). I need assistance with my loan.`;
    const url = `https://wa.me/${SUPPORT_CONFIG.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleNotificationAction = async (notification: any) => {
    try {
      if (!notification.read) {
        await api.put(`/users/notifications/${notification.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      }
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
    } catch (error) {
      console.error('Failed to handle notification action:', error);
    }
  };

  const handlePayNow = () => {
    // 1. Check for processing fees first (critical path to activation)
    const approvedApp = applications.find(app => app.status === 'APPROVED' && !app.processingFeePaid);
    if (approvedApp) {
      setApplicationToPayFee(approvedApp);
      setShowPaymentModal(true);
      return;
    }

    // 2. Check for active loan repayments
    if (activeLoanData) {
      setShowPaymentModal(true);
    }
  };

  const unreadNotifications = (notifications || []).filter(n => !n.read);
  const totalUnreadCount = unreadNotifications.length;

  return (
    <>
      <DashboardBackground />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
            <div
              className="flex items-center gap-2 sm:gap-4 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold font-display text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                  GET<span className="text-blue-600">VERTEX</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center relative transition-all ${showNotifications ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "hover:bg-slate-100 text-slate-600"
                  }`}
              >
                <Bell size={20} />
                {totalUnreadCount > 0 && (
                  <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 ${showNotifications ? "bg-white border-blue-600" : "bg-red-500 border-white"
                    }`} />
                )}
              </button>
              <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
              <div className="flex items-center gap-3 pl-1 sm:pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {user?.role || "Member"}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors overflow-hidden border-2 border-white shadow-sm"
                >
                  <User size={20} />
                </button>
                <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
                <button
                  onClick={handleLogout}
                  className="px-4 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-bold text-xs uppercase tracking-widest hidden sm:flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-8">
          {/* Withdrawal Banner for Pending Disbursements */}
          <AnimatePresence>
            {pendingDisbursement && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8"
              >
                <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 border-0 shadow-2xl shadow-blue-200 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <Wallet size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">Your Loan is Ready! 💰</h3>
                        <p className="text-blue-100 font-bold opacity-80 uppercase text-[10px] tracking-[0.2em] mt-1">Pending Withdrawal</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-3xl font-black text-white">KES {Number(pendingDisbursement.loanAmount).toLocaleString()}</span>
                          <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-black uppercase tracking-widest px-2 py-0.5">Approved</Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowWithdrawModal(true)}
                      className="w-full md:w-auto bg-white text-blue-600 hover:bg-blue-50 font-black h-16 px-10 rounded-2xl shadow-xl flex items-center gap-3 transition-all active:scale-95"
                    >
                      Withdraw Now
                      <ArrowRight size={20} />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Welcome Section */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-slate-900 mb-2">
              Welcome back, {user?.fullName || "User"} 👋
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-medium">
              Here's what's happening with your finances today.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Borrowed"
              value={loading ? '---' : `KES ${totalBorrowed.toLocaleString()}`}
              icon={Wallet}
              color="blue"
              subtitle="Lifetime loans"
              loading={loading}
            />
            <StatsCard
              title="Amount Repaid"
              value={loading ? '---' : `KES ${totalRepaid.toLocaleString()}`}
              icon={TrendingUp}
              color="emerald"
              subtitle="Total payments made"
              loading={loading}
            />
            <StatsCard
              title="Charges Paid"
              value={loading ? '---' : `KES ${totalChargesPaid.toLocaleString()}`}
              icon={Receipt}
              color="purple"
              subtitle="Processing & service fees"
              loading={loading}
            />
            <StatsCard
              title="Credit Score"
              value={loading ? '---' : (creditScore ?? 'N/A')}
              icon={Award}
              color="orange"
              subtitle={creditScore ? `${creditScoreRating} rating` : 'Build your score — apply now'}
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Your application(s) - what you applied for and status */}
              {applications.length > 0 && (
                <Card className="p-6 bg-white/80 backdrop-blur-xl border-0 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)]">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Your application(s)</h3>
                  <div className="space-y-3">
                    {applications.map((app: any) => {
                      const statusLabel = app.status === 'APPROVED' ? 'Approved' : app.status === 'REJECTED' ? 'Rejected' : 'Under review';
                      const statusVariant = app.status === 'APPROVED' ? 'success' : app.status === 'REJECTED' ? 'destructive' : 'secondary';
                      return (
                        <div key={app.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                          <div>
                            <span className="font-bold text-slate-900">KES {Number(app.loanAmount).toLocaleString()}</span>
                            <span className="text-slate-500 mx-2">for</span>
                            <span className="font-medium text-slate-700">{app.repaymentPeriod} months</span>
                          </div>
                          <Badge variant={statusVariant}>{statusLabel}</Badge>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    {applications.some((a: any) => a.status === 'SUBMITTED' || a.status === 'REVIEW')
                      ? 'Once approved, you can pay the processing fee and proceed.'
                      : applications.some((a: any) => a.status === 'APPROVED' && !a.processingFeePaid)
                        ? 'Pay the processing fee below to activate your loan.'
                        : ''}
                  </p>
                </Card>
              )}

              {/* Processing Fee Payment - only for approved applications (after admin approval) */}
              {applications
                .filter((app) => app.status === 'APPROVED' && !app.processingFeePaid)
                .map((app) => (
                  <ProcessingFeePayment
                    key={app.id}
                    application={app}
                    processingFeePercent={stats?.processingFeePercent ?? 6.5}
                    onPaymentSuccess={() => {
                      // Refresh dashboard data after payment
                      window.location.reload();
                    }}
                  />
                ))}

              {/* Active Loan - merge activeLoanData so remaining balance and next payment date are correct */}
              {activeLoan && (
                <LoanProgress
                  loan={{
                    ...activeLoan,
                    remainingBalance: activeLoanData?.remainingBalance ?? activeLoan.remainingBalance,
                    nextPaymentDate: activeLoanData?.nextPaymentDate ?? activeLoan.nextPaymentDate,
                    status: activeLoan.loan?.status ?? activeLoan.status,
                  }}
                />
              )}

              {/* Quick Actions */}
              <Card className="p-6 bg-white/80 backdrop-blur-xl border-0 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)]">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QuickActionButton
                    title="Apply for Loan"
                    description="New loan application"
                    icon={Plus}
                    onClick={() => setShowApplyModal(true)}
                    color="blue"
                  />
                  <QuickActionButton
                    title="Make Payment"
                    description="Pay your loan installment or fee"
                    icon={CreditCard}
                    onClick={() => {
                      const approvedApp = applications.find(app => app.status === 'APPROVED' && !app.processingFeePaid);
                      if (approvedApp) {
                        setApplicationToPayFee(approvedApp);
                        setShowPaymentModal(true);
                      } else if (activeLoan) {
                        setShowPaymentModal(true);
                      }
                    }}
                    color="emerald"
                    disabled={!activeLoan && !applications.some(app => app.status === 'APPROVED' && !app.processingFeePaid)}
                  />
                  <QuickActionButton
                    title="Contact Support"
                    description="Get help from our team"
                    icon={MessageSquare}
                    onClick={() => setShowSupportModal(true)}
                    color="orange"
                  />
                  <QuickActionButton
                    title="Withdraw Loan"
                    description="Transfer funds to your account"
                    icon={Wallet}
                    onClick={() => {
                      if (applications.length === 0) {
                        alert("Please apply for a loan first.");
                        return;
                      }

                      const hasPaidFee = applications.some(app => app.processingFeePaid);
                      if (!hasPaidFee) {
                        const hasSubmittedEvidence = applications.some(app => app.paymentEvidenceUrl);
                        if (hasSubmittedEvidence) {
                          alert("Your payment evidence has been submitted and is currently being verified by our admin. Please check back shortly.");
                        } else {
                          alert("Please pay the processing fees first to activate your withdrawal.");
                        }
                        return;
                      }

                      setShowWithdrawModal(true);
                    }}
                    color="indigo"
                  />
                </div>
              </Card>

              {/* Recent Transactions */}
              <Card className="p-6 bg-white/80 backdrop-blur-xl border-0 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    Recent Transactions
                  </h3>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-200 animate-pulse rounded-xl" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" />
                            <div className="h-3 w-20 bg-slate-200 animate-pulse rounded" />
                          </div>
                        </div>
                        <div className="h-4 w-24 bg-slate-200 animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.map((transaction) => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity
                      size={48}
                      className="text-slate-300 mx-auto mb-4"
                    />
                    <p className="text-slate-500 font-medium">
                      No transactions yet
                    </p>
                    <p className="text-sm text-slate-400">
                      Your transaction history will appear here
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Charges & Fees */}
              <ChargesSection charges={charges} loading={loading} />

              {/* Credit Score */}
              <CreditScoreCard
                score={creditScore ?? undefined}
                scoreChange={stats?.scoreChange && stats.scoreChange !== "0" ? stats.scoreChange : undefined}
                onTimeStreak={onTimePaymentsStreak}
                loading={loading}
              />

              {/* Financial Insights */}
              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Financial Insights
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Star size={16} className="text-yellow-500" />
                      <span className="text-sm font-bold text-slate-900">
                        Payment History
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {loading
                        ? 'Loading...'
                        : totalRepaid > 0
                          ? `You've made consistent payments totaling KES ${totalRepaid.toLocaleString()}.`
                          : 'No payments made yet. Start by applying for a loan.'
                      }
                    </p>
                    {onTimePaymentsStreak > 0 && (
                      <p className="text-xs font-bold text-emerald-600 mt-1">
                        ✓ {onTimePaymentsStreak} on-time payment{onTimePaymentsStreak !== 1 ? 's' : ''} recorded
                      </p>
                    )}
                  </div>

                  <div className="p-4 bg-white rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={16} className="text-blue-500" />
                      <span className="text-sm font-bold text-slate-900">
                        Credit Builder
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {loading
                        ? 'Loading...'
                        : !creditScore
                          ? 'Apply for your first loan to start building your credit score.'
                          : creditScore >= 700
                            ? 'Excellent! Keep maintaining your good credit habits.'
                            : creditScore >= 600
                              ? 'Good progress. Continue timely payments to improve your score.'
                              : 'Focus on timely payments to build your credit score.'
                      }
                    </p>
                    {creditScore && (
                      <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${Math.round(((creditScore - 300) / 550) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <CreditCard size={16} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Payment Info
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-xl border-2 border-blue-100">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-1">
                        Pay via M-Pesa Till
                      </p>
                      <p className="text-2xl font-black text-blue-600">
                        {SUPPORT_CONFIG.tillNumber}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Use your loan ID as reference
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Next Payment</span>
                    <span className="font-bold text-blue-600">
                      {balanceVisible ?
                        (activeLoanData ? `KES ${activeLoanData.monthlyPayment.toLocaleString()}` : "No active loan")
                        : "••••••"
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Due Date</span>
                    <span className="font-bold text-slate-900">
                      {activeLoanData?.nextPaymentDate ?
                        new Date(activeLoanData.nextPaymentDate).toLocaleDateString()
                        : "No due date"
                      }
                    </span>
                  </div>

                  {activeLoanData && (
                    <Button
                      onClick={handlePayNow}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-lg shadow-blue-200 hover:scale-[1.02] transition-all"
                    >
                      Pay Now
                    </Button>
                  )}
                </div>
              </Card>

              {/* Account Summary */}
              <Card className="p-6 bg-white/80 backdrop-blur-xl border-0 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Account Summary
                  </h3>
                  <button
                    onClick={() => setBalanceVisible(!balanceVisible)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  >
                    {balanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Available Credit
                    </span>
                    <span className="font-bold text-slate-900">
                      {balanceVisible ? (availableCredit > 0 ? `KES ${availableCredit.toLocaleString()}` : "KES 0") : "••••••"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Total Charges Paid
                    </span>
                    <span className="font-bold text-purple-600">
                      {balanceVisible
                        ? `KES ${totalChargesPaid.toLocaleString()}`
                        : "••••••"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Member Since</span>
                    <span className="font-bold text-slate-900">{formatMemberSince(user?.memberSince)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>


        </main>

        {/* Support Modal */}
        {showSupportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white rounded-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    Contact Support
                  </h3>
                  <button
                    onClick={() => setShowSupportModal(false)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare size={32} className="text-green-600" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">
                      We're Here to Help!
                    </h4>
                    <p className="text-sm text-slate-600">
                      Get instant support through WhatsApp
                    </p>
                  </div>

                  <button
                    onClick={handleWhatsAppSupport}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors"
                  >
                    <Phone size={20} />
                    WhatsApp Support
                  </button>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-slate-500" />
                        <span className="text-sm font-mono text-slate-900">
                          {SUPPORT_CONFIG.whatsapp}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-slate-500" />
                        <span className="text-sm text-slate-600">
                          Available {SUPPORT_CONFIG.supportHours}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CreditCard size={16} className="text-slate-500" />
                        <span className="text-sm text-slate-600">
                          M-Pesa Till:{" "}
                          <span className="font-mono font-bold">
                            {SUPPORT_CONFIG.tillNumber}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>


                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Enhanced Notifications Dropdown */}
        {showNotifications && (
          <div className="fixed top-16 sm:top-20 right-4 sm:right-6 z-50 w-72 sm:w-80 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-top-2 duration-300">
            <Card className="p-3 sm:p-4 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs sm:text-sm font-semibold font-display text-slate-900">
                  Recent Notifications
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {totalUnreadCount} new
                </Badge>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {unreadNotifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationAction(notification)}
                    className="p-2 sm:p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${notification.type === "success"
                          ? "bg-green-500"
                          : notification.type === "warning"
                            ? "bg-yellow-500"
                            : notification.type === "error"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold font-display text-slate-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Bottom Navigation for Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-6 py-4 z-40">
          <div className="flex items-center justify-around">
            <button className="flex flex-col items-center gap-1 p-2">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <BarChart3 size={16} className="text-white" />
              </div>
              <span className="text-xs font-bold text-blue-600">Dashboard</span>
            </button>
            <button
              className="flex flex-col items-center gap-1 p-2"
              onClick={() => setShowApplyModal(true)}
            >
              <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                <Plus size={16} className="text-slate-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">Apply</span>
            </button>
            <button
              className="flex flex-col items-center gap-1 p-2"
              onClick={handlePayNow}
            >
              <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                <CreditCard size={16} className="text-slate-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">
                Payment
              </span>
            </button>
            <button
              className="flex flex-col items-center gap-1 p-2"
              onClick={() => setShowWithdrawModal(true)}
            >
              <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                <Wallet size={16} className="text-slate-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">
                Withdraw
              </span>
            </button>
            <button
              className="flex flex-col items-center gap-1 p-2"
              onClick={() => setShowSupportModal(true)}
            >
              <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                <MessageSquare size={16} className="text-slate-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">
                Support
              </span>
            </button>
            <button
              className="flex flex-col items-center gap-1 p-2"
              onClick={handleLogout}
            >
              <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                <LogOut size={16} className="text-red-500" />
              </div>
              <span className="text-xs font-medium text-red-500">
                Exit
              </span>
            </button>
          </div>
        </div>
        {/* Payment Modal Selection */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="relative w-full max-w-4xl my-8">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setApplicationToPayFee(null);
                }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-900 z-10 hover:scale-110 transition-transform"
              >
                <X size={24} />
              </button>

              {applicationToPayFee ? (
                <ProcessingFeePayment
                  application={applicationToPayFee}
                  processingFeePercent={stats?.processingFeePercent ?? 6.5}
                  onPaymentSuccess={() => {
                    setShowPaymentModal(false);
                    setApplicationToPayFee(null);
                    window.location.reload();
                  }}
                />
              ) : activeLoan ? (
                <LoanRepayment
                  loan={activeLoan}
                  onRepaymentSuccess={() => {
                    setShowPaymentModal(false);
                    window.location.reload();
                  }}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={() => {
          // Success logic if needed
        }}
      />

      {/* Loan Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-900 z-10 hover:scale-110 transition-transform font-bold"
              title="Close"
            >
              <X size={20} />
            </button>
            <ApplicationFlow
              user={user}
              pendingApplication={pendingApplication}
              setPendingApplication={(app: any) => {
                setPendingApplication(app);
                if (!app) {
                  setShowApplyModal(false);
                  window.location.reload();
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
