import React, { useState, useEffect } from "react";
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
  Target,
  Zap,
  Award,
  Shield,
  Bell,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Activity,
  Users,
  Smartphone,
  Globe,
  MapPin,
  Phone,
  Mail,
  Star,
  ChevronRight,
  Plus,
  Minus,
  Filter,
  Search,
  Calendar as CalendarIcon,
  FileText,
  CreditCard as CardIcon,
  Landmark,
  Banknote,
  Timer,
  CheckSquare,
  AlertCircle,
  Info,
  X,
  Menu,
  LogOut,
  User,
  HelpCircle,
  MessageSquare,
  Receipt,
} from "lucide-react";
import { Button, Card, Badge } from "../ui";
import api from "../../../lib/api";
import { notificationService } from "../../../lib/notifications";

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
    <Card className="p-6 bg-white/80 backdrop-blur-xl border-0 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-8px_rgba(0,0,0,0.15)] transition-all duration-500 group">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${colorClasses[color] || colorClasses.blue} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon size={24} className="text-white" />
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
              trend === "up"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {change}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
          {title}
        </h3>
        {loading ? (
          <div className="h-8 w-20 bg-slate-200 animate-pulse rounded" />
        ) : (
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </p>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        )}
      </div>
    </Card>
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
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-6 rounded-2xl border-2 border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 transition-all duration-300 text-left group ${
      disabled
        ? "opacity-50 cursor-not-allowed"
        : "hover:scale-[1.02] active:scale-[0.98]"
    }`}
  >
    <div className="flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
          color === "emerald"
            ? "from-emerald-500 to-teal-500"
            : color === "purple"
              ? "from-purple-500 to-violet-500"
              : color === "orange"
                ? "from-orange-500 to-red-500"
                : "from-blue-500 to-indigo-500"
        } flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>
      <ChevronRight
        size={20}
        className="text-slate-400 group-hover:text-blue-500 transition-colors"
      />
    </div>
  </button>
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
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          {getTransactionIcon()}
        </div>
        <div>
          <p className="font-bold text-slate-900">{transaction.description}</p>
          <p className="text-sm text-slate-500">
            {new Date(transaction.date).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-bold ${
            transaction.type === "DISBURSEMENT"
              ? "text-emerald-600"
              : "text-slate-900"
          }`}
        >
          {transaction.type === "DISBURSEMENT" ? "+" : "-"}KES{" "}
          {transaction.amount.toLocaleString()}
        </p>
        {getStatusBadge()}
      </div>
    </div>
  );
};

// Loan progress component
const LoanProgress = ({ loan }: { loan: LoanApplication }) => {
  const progressPercentage =
    ((loan.loanAmount - (loan.remainingBalance || 0)) / loan.loanAmount) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Active Loan</h3>
          <p className="text-sm text-slate-600">Application #{loan.id}</p>
        </div>
        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
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
  );
};

// Credit score component
const CreditScoreCard = ({ score = 720 }: { score?: number }) => {
  const getScoreColor = () => {
    if (score >= 750) return "text-emerald-600";
    if (score >= 650) return "text-blue-600";
    if (score >= 550) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = () => {
    if (score >= 750) return "Excellent";
    if (score >= 650) return "Good";
    if (score >= 550) return "Fair";
    return "Poor";
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Credit Score</h3>
        <Shield size={20} className="text-emerald-400" />
      </div>

      <div className="text-center mb-4">
        <div className={`text-5xl font-black mb-2 ${getScoreColor()}`}>
          {score}
        </div>
        <div className="text-slate-300 font-medium">{getScoreLabel()}</div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Range</span>
          <span className="text-white">300-850</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              score >= 750
                ? "bg-emerald-500"
                : score >= 650
                  ? "bg-blue-500"
                  : score >= 550
                    ? "bg-yellow-500"
                    : "bg-red-500"
            }`}
            style={{ width: `${(score / 850) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-white/10 rounded-xl">
        <p className="text-xs text-slate-300">
          Your score improved by{" "}
          <span className="text-emerald-400 font-bold">+15 points</span> this
          month
        </p>
      </div>
    </Card>
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
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <Receipt size={16} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Charges & Fees</h3>
        </div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-3 bg-white rounded-lg">
              <div className="h-4 bg-slate-200 animate-pulse rounded mb-2" />
              <div className="h-3 bg-slate-200 animate-pulse rounded w-1/2" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const totalCharges = charges.reduce((sum, charge) => sum + charge.amount, 0);
  const paidCharges = charges.filter((charge) => charge.status === "PAID");

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <Receipt size={16} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Charges & Fees</h3>
        </div>
        <Badge variant="info" className="text-xs">
          {paidCharges.length}/{charges.length} paid
        </Badge>
      </div>

      <div className="mb-4 p-3 bg-white rounded-xl border-2 border-purple-100">
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-1">Total Charges</p>
          <p className="text-2xl font-black text-purple-600">
            KES {totalCharges.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">
            {paidCharges.length > 0 &&
              `${paidCharges.reduce((sum, charge) => sum + charge.amount, 0).toLocaleString()} paid`}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {charges.length > 0 ? (
          charges.map((charge) => (
            <div
              key={charge.id}
              className="p-3 bg-white rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-900">
                  {charge.description}
                </span>
                <Badge
                  variant={
                    charge.status === "PAID"
                      ? "success"
                      : charge.status === "OVERDUE"
                        ? "danger"
                        : "warning"
                  }
                  className="text-xs"
                >
                  {charge.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {new Date(charge.date).toLocaleDateString()}
                </span>
                <span
                  className={`text-sm font-bold ${
                    charge.status === "PAID"
                      ? "text-green-600"
                      : charge.status === "OVERDUE"
                        ? "text-red-600"
                        : "text-orange-600"
                  }`}
                >
                  KES {charge.amount.toLocaleString()}
                </span>
              </div>
              {charge.loanId && (
                <div className="mt-1">
                  <span className="text-xs text-slate-400">
                    Loan ID: #{charge.loanId}
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Receipt size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No charges yet</p>
            <p className="text-sm text-slate-400">
              Your fees and charges will appear here
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Main dashboard component
export const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
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

  // Initialize notification service and fetch real notifications
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      const converted: Notification = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        time: formatRelativeTime(notification.timestamp.toISOString()),
        timestamp: notification.timestamp,
        read: false,
        actionUrl: notification.actionUrl,
        userId: notification.userId,
        loanId: notification.loanId,
        persistent: notification.persistent,
      };
      setRealTimeNotifications((prev) => [converted, ...prev.slice(0, 4)]);
    });

    // Load stored notifications
    const stored = notificationService.getStoredNotifications();
    const convertedStored = stored.map(
      (n): Notification => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        time: formatRelativeTime(n.timestamp.toISOString()),
        timestamp: n.timestamp,
        read: (n as any).read || false,
        actionUrl: n.actionUrl,
        userId: n.userId,
        loanId: n.loanId,
        persistent: n.persistent,
      }),
    );
    setRealTimeNotifications(convertedStored.slice(0, 5));

    return unsubscribe;
  }, []);

  // Fetch notifications on component mount and set up polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/users/notifications");
      if (response.data.success) {
        const backendNotifications = response.data.notifications.map((notif: any) => ({
          id: notif.id,
          type: notif.type.toLowerCase(),
          title: notif.title,
          message: notif.message,
          time: formatRelativeTime(notif.createdAt),
          timestamp: new Date(notif.createdAt),
          read: notif.read,
          actionUrl: "/dashboard",
          userId: notif.userId.toString(),
          loanId: notif.loanId?.toString(),
          persistent: notif.persistent,
        }));
        setNotifications(backendNotifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch real data from API
        const response = await api.get("/users/dashboard");
        const data = response.data.data;

        // Set user data
        setUser(data.user);

        // Convert backend data to frontend format
        const formattedApplications = data.applications.map((app: any) => ({
          id: app.id,
          loanAmount: app.loanAmount,
          repaymentPeriod: app.repaymentPeriod,
          status: app.status,
          createdAt: app.createdAt.split("T")[0],
          totalRepayment: app.loan?.totalRepayment || 0,
          monthlyPayment: app.loan?.monthlyInstallment || 0,
          interestRate: app.loan?.interestRate || 0,
          progress: data.activeLoan?.progress || 0,
          nextPaymentDate: data.activeLoan?.nextPaymentDate || null,
          remainingBalance: data.activeLoan?.remainingBalance || 0,
        }));

        const formattedTransactions = data.transactions.map((txn: any) => ({
          id: txn.id,
          type: txn.type,
          amount: txn.amount,
          description: txn.description,
          date: txn.date,
          status: txn.status,
        }));

        const formattedCharges = data.charges.map((charge: any) => ({
          id: charge.id,
          type: charge.type,
          amount: charge.amount,
          description: charge.description,
          status: charge.status,
          date: charge.date,
          loanId: charge.loanId,
        }));

        setApplications(formattedApplications);
        setTransactions(formattedTransactions);
        setCharges(formattedCharges);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Fallback to mock data on error
        setApplications([]);
        setTransactions([]);
        setCharges([]);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const activeLoan = applications.find((app) => app.status === "APPROVED");
  const totalBorrowed = applications.reduce(
    (sum, app) =>
      sum +
      (typeof app.loanAmount === "string"
        ? parseFloat(app.loanAmount)
        : app.loanAmount),
    0,
  );
  const totalRepaid = applications.reduce((sum, app) => {
    const loanAmount =
      typeof app.loanAmount === "string"
        ? parseFloat(app.loanAmount)
        : app.loanAmount;
    const remaining = app.remainingBalance || 0;
    return sum + (loanAmount - remaining);
  }, 0);
  const totalChargesPaid = charges
    .filter((charge) => charge.status === "PAID")
    .reduce(
      (sum, charge) =>
        sum +
        (typeof charge.amount === "string"
          ? parseFloat(charge.amount)
          : charge.amount),
      0,
    );

  const handleWhatsAppSupport = () => {
    window.open(
      `https://wa.me/${SUPPORT_CONFIG.whatsapp.replace("+", "").replace("(", "").replace(")", "").replace("-", "")}?text=Hello, I need support with my Vertex Loans account.`,
      "_blank",
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  };

  const handleNotificationAction = async (notification: Notification) => {
    // Update local state
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
    );

    // Update real-time notifications
    setRealTimeNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
    );

    // Mark as read in service
    notificationService.markAsRead(notification.id.toString());

    // Mark as read in backend
    try {
      await api.put(`/users/notifications/${notification.id}/read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const unreadNotifications = [
    ...notifications,
    ...realTimeNotifications,
  ].filter((n) => !n.read);
  const totalUnreadCount = unreadNotifications.length;

  return (
    <>
      <DashboardBackground />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between min-h-0">
              <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap size={16} className="text-white sm:size-5" />
                  </div>
                  <img
                    src="/logovertex.png"
                    alt="VERTEX"
                    className="h-5 w-auto sm:h-6 flex-shrink-0"
                  />
                </div>
                <div className="hidden lg:block h-6 w-px bg-slate-200 flex-shrink-0" />
                <div className="hidden lg:block min-w-0">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 truncate">
                    Dashboard
                  </h1>
                  <p className="text-xs text-slate-500 font-medium truncate">
                    Manage your finances
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                {/* Notifications */}
                <div className="relative flex-shrink-0">
                  <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors relative">
                    <Bell size={16} className="text-slate-600 sm:size-4.5" />
                    {totalUnreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-[10px] sm:text-xs text-white font-bold leading-none">
                          {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                        </span>
                      </div>
                    )}
                  </button>
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="hidden sm:block text-right min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-white sm:size-4.5" />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <LogOut size={14} className="sm:size-4.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              Welcome back, {user?.fullName?.split(" ")[0] || "User"} 👋
            </h2>
            <p className="text-slate-600 font-medium">
              Here's what's happening with your finances today.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Borrowed"
              value={`KES ${totalBorrowed.toLocaleString()}`}
              change="+12.5%"
              trend="up"
              icon={Wallet}
              color="blue"
              subtitle="This year"
              loading={loading}
            />
            <StatsCard
              title="Amount Repaid"
              value={`KES ${totalRepaid.toLocaleString()}`}
              change="+8.2%"
              trend="up"
              icon={TrendingUp}
              color="emerald"
              subtitle="Total payments"
              loading={loading}
            />
            <StatsCard
              title="Charges Paid"
              value={`KES ${totalChargesPaid.toLocaleString()}`}
              change="0%"
              trend="up"
              icon={Receipt}
              color="purple"
              subtitle="Processing & service fees"
              loading={loading}
            />
            <StatsCard
              title="Credit Score"
              value="720"
              change="+15"
              trend="up"
              icon={Award}
              color="orange"
              subtitle="Excellent rating"
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Active Loan */}
              {activeLoan && <LoanProgress loan={activeLoan} />}

              {/* Quick Actions */}
              <Card className="p-6 bg-white/80 backdrop-blur-xl border-0 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)]">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QuickActionButton
                    title="Apply for Loan"
                    description="Get instant pre-approval"
                    icon={Plus}
                    onClick={() => navigate("/apply")}
                    color="blue"
                  />
                  <QuickActionButton
                    title="Make Payment"
                    description="Pay your loan installment"
                    icon={CreditCard}
                    onClick={() => {
                      /* Handle payment */
                    }}
                    color="emerald"
                    disabled={!activeLoan}
                  />
                  <QuickActionButton
                    title="Download Statement"
                    description="Get your account statement"
                    icon={Download}
                    onClick={() => {
                      /* Handle download */
                    }}
                    color="purple"
                  />
                  <QuickActionButton
                    title="Contact Support"
                    description="Get help from our team"
                    icon={MessageSquare}
                    onClick={() => setShowSupportModal(true)}
                    color="orange"
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
              <CreditScoreCard />

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
                        Excellent Payment History
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      You've made 12 on-time payments in a row!
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={16} className="text-blue-500" />
                      <span className="text-sm font-bold text-slate-900">
                        Credit Builder
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Keep up the good work to improve your credit score.
                    </p>
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
                      {balanceVisible ? "KES 31,500" : "••••••"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Due Date</span>
                    <span className="font-bold text-slate-900">
                      Feb 15, 2024
                    </span>
                  </div>
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
                      {balanceVisible ? "KES 200,000" : "••••••"}
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
                    <span className="font-bold text-slate-900">Jan 2024</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Performance Analytics */}
          <div className="mt-8">
            <Card className="p-6 bg-white/80 backdrop-blur-xl border-0 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Financial Performance
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPeriod("7d")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      selectedPeriod === "7d"
                        ? "bg-blue-100 text-blue-600"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    7D
                  </button>
                  <button
                    onClick={() => setSelectedPeriod("30d")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      selectedPeriod === "30d"
                        ? "bg-blue-100 text-blue-600"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    30D
                  </button>
                  <button
                    onClick={() => setSelectedPeriod("90d")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      selectedPeriod === "90d"
                        ? "bg-blue-100 text-blue-600"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    90D
                  </button>
                </div>
              </div>

              <div className="h-64 bg-slate-50 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <BarChart3
                    size={48}
                    className="text-slate-300 mx-auto mb-4"
                  />
                  <p className="text-slate-500 font-medium">
                    Analytics chart will appear here
                  </p>
                  <p className="text-sm text-slate-400">
                    Track your financial progress over time
                  </p>
                </div>
              </div>
            </Card>
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

                  <div className="text-center">
                    <p className="text-xs text-slate-500">
                      Our support team will respond within 5 minutes during
                      business hours
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Enhanced Notifications Dropdown */}
        {totalUnreadCount > 0 && (
          <div className="fixed top-16 sm:top-20 right-4 sm:right-6 z-50 w-72 sm:w-80 max-w-[calc(100vw-2rem)]">
            <Card className="p-3 sm:p-4 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
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
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${
                          notification.type === "success"
                            ? "bg-green-500"
                            : notification.type === "warning"
                              ? "bg-yellow-500"
                              : notification.type === "error"
                                ? "bg-red-500"
                                : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
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
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-around">
            <button className="flex flex-col items-center gap-1 p-2">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <BarChart3 size={16} className="text-white" />
              </div>
              <span className="text-xs font-bold text-blue-600">Dashboard</span>
            </button>
            <button
              className="flex flex-col items-center gap-1 p-2"
              onClick={() => navigate("/apply")}
            >
              <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                <Plus size={16} className="text-slate-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">Apply</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2">
              <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                <Receipt size={16} className="text-slate-600" />
              </div>
              <span className="text-xs font-medium text-slate-600">
                Charges
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
          </div>
        </div>
      </div>
    </>
  );
};
