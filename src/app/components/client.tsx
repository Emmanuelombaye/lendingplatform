import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SupportWidget } from "./SupportWidget";
import {
  ShieldCheck,
  Clock,
  DollarSign,
  ChevronRight,
  Menu,
  X,
  Download,
  Upload,
  FileText,
  Info,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Quote,
  ShieldAlert,
  Lock,
  Building2,
  Building,
  CreditCard,
  AlertCircle,
  Loader2,
  ArrowRight,
  BarChart3,
  Users,
  ClipboardList,
  UserSquare2,
  Check,
  CheckCircle2,
  Camera,
  Zap,
} from "lucide-react";
import { Button, Card, Badge, cn } from "./ui";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import api from "../../lib/api";
import { authService } from "../../lib/authUtils";

// --- SHARED CLIENT LAYOUT ---

export const Navbar = ({
  user,
  onLogout,
}: {
  user?: any;
  onLogout?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentView =
    location.pathname.replace("/", "") ||
    (location.hash ? location.hash.replace("#", "") : "home");

  const navItems = [
    { name: t("nav.home"), id: "home" },
    { name: t("nav.loans"), id: "loans" },
    { name: t("nav.calculator"), id: "calculator" },
    { name: t("nav.how_it_works"), id: "how-it-works" },
    { name: t("nav.contact"), id: "contact" },
  ];

  const handleNavigation = (id: string) => {
    if (id === "home") navigate("/");
    else if (["loans", "calculator", "how-it-works", "contact"].includes(id)) {
      if (location.pathname !== "/") {
        navigate("/#" + id);
      } else {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", "/#" + id);
      }
    } else {
      navigate("/" + id);
    }
    setIsOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700",
        scrolled
          ? "bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] py-4"
          : "bg-transparent py-6",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full" />
            <img
              src="/logovertex.png"
              alt="GETVERTEX"
              className="h-7 md:h-8 w-auto object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            VERTEX
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={cn(
                "text-[13px] font-semibold tracking-tight transition-all duration-300 relative py-1 px-2",
                currentView === item.id
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-900",
              )}
            >
              {item.name}
              <span
                className={cn(
                  "absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] bg-blue-600 rounded-full transition-all duration-500",
                  currentView === item.id ? "w-3 opacity-100" : "w-0 opacity-0",
                )}
              />
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <div className="flex items-center gap-2 mr-2">
            <button
              onClick={() => changeLanguage('en')}
              className={cn("w-6 h-6 rounded-full overflow-hidden border-2 transition-all", i18n.language === 'en' ? "border-blue-600 scale-110" : "border-transparent opacity-70 hover:opacity-100")}
              title="English (UK)"
            >
              <img src="https://flagcdn.com/w40/gb.png" alt="UK Flag" className="w-full h-full object-cover" />
            </button>
            <button
              onClick={() => changeLanguage('sw')}
              className={cn("w-6 h-6 rounded-full overflow-hidden border-2 transition-all", i18n.language === 'sw' ? "border-blue-600 scale-110" : "border-transparent opacity-70 hover:opacity-100")}
              title="Swahili (Tanzania)"
            >
              <img src="https://flagcdn.com/w40/tz.png" alt="Tanzania Flag" className="w-full h-full object-cover" />
            </button>
            <button
              onClick={() => changeLanguage('zm')}
              className={cn("w-6 h-6 rounded-full overflow-hidden border-2 transition-all", i18n.language === 'zm' ? "border-blue-600 scale-110" : "border-transparent opacity-70 hover:opacity-100")}
              title="English (Zambia)"
            >
              <img src="https://flagcdn.com/w40/zm.png" alt="Zambia Flag" className="w-full h-full object-cover" />
            </button>
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="font-semibold text-slate-700 text-sm"
                onClick={() => navigate("/dashboard")}
              >
                {t("nav.dashboard")}
              </Button>
              <Button
                variant="outline"
                className="border-2 font-bold rounded-xl text-sm px-5 h-10"
                onClick={onLogout}
              >
                {t("nav.sign_out")}
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                className="font-bold text-slate-700 text-sm"
                onClick={() => navigate("/login")}
              >
                {t("nav.sign_in")}
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 h-auto rounded-xl shadow-lg shadow-blue-500/15 group text-sm"
                onClick={() => navigate("/register")}
              >
                {t("nav.apply_now")}{" "}
                <ChevronRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 animate-slide-up shadow-2xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className="text-left text-base lg:text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors py-3 px-4 rounded-xl"
            >
              {item.name}
            </button>
          ))}
          <div className="flex items-center gap-4 py-2 px-4">
            <button
              onClick={() => changeLanguage('en')}
              className={cn("w-8 h-8 rounded-full overflow-hidden border-2 transition-all", i18n.language === 'en' ? "border-blue-600 scale-110" : "border-transparent opacity-70 hover:opacity-100")}
              title="English (UK)"
            >
              <img src="https://flagcdn.com/w40/gb.png" alt="UK Flag" className="w-full h-full object-cover" />
            </button>
            <button
              onClick={() => changeLanguage('sw')}
              className={cn("w-8 h-8 rounded-full overflow-hidden border-2 transition-all", i18n.language === 'sw' ? "border-blue-600 scale-110" : "border-transparent opacity-70 hover:opacity-100")}
              title="Swahili (Tanzania)"
            >
              <img src="https://flagcdn.com/w40/tz.png" alt="Tanzania Flag" className="w-full h-full object-cover" />
            </button>
            <button
              onClick={() => changeLanguage('zm')}
              className={cn("w-8 h-8 rounded-full overflow-hidden border-2 transition-all", i18n.language === 'zm' ? "border-blue-600 scale-110" : "border-transparent opacity-70 hover:opacity-100")}
              title="English (Zambia)"
            >
              <img src="https://flagcdn.com/w40/zm.png" alt="Zambia Flag" className="w-full h-full object-cover" />
            </button>
          </div>
          <div className="h-px bg-slate-100 my-4" />
          {user ? (
            <div className="space-y-3">
              <Button
                className="w-full py-4 h-auto rounded-2xl font-semibold"
                variant="ghost"
                onClick={() => {
                  navigate("/dashboard");
                  setIsOpen(false);
                }}
              >
                {t("nav.dashboard")}
              </Button>
              <Button
                className="w-full py-4 h-auto rounded-2xl font-semibold"
                variant="outline"
                onClick={onLogout}
              >
                {t("nav.sign_out")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                className="w-full py-6 h-auto rounded-2xl font-black"
                variant="outline"
                onClick={() => navigate("/login")}
              >
                {t("nav.sign_in")}
              </Button>
              <Button
                className="w-full py-6 h-auto rounded-2xl font-black bg-blue-600 text-white"
                onClick={() => navigate("/register")}
              >
                {t("nav.apply_now")}
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

// --- PAGES ---

export const Hero = ({ user }: { user?: any }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="pt-40 pb-20 px-6 relative overflow-hidden bg-white">
      {/* Mesh Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/30 blur-[120px] rounded-full -mr-96 -mt-96 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/30 blur-[100px] rounded-full -ml-72 -mb-72 pointer-events-none" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50/50 border border-blue-100/50 rounded-full mb-8">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600">
              {t("hero.badge")}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-slate-900 leading-[1.1] tracking-tight">
            {t("hero.title_part1")} <br />
            <span className="text-blue-600">{t("hero.title_empowers")}</span>
          </h1>
          Broadway font is naturally bold, so font-bold is enough.

          <p className="text-base md:text-lg text-slate-500 mt-6 md:mt-8 max-w-lg font-medium leading-relaxed">
            {t("hero.description")}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 md:px-10 py-5 md:py-6 h-auto rounded-2xl text-base shadow-lg shadow-blue-500/20 group items-center flex"
              onClick={() => navigate(user ? "/dashboard" : "/register")}
            >
              {t("hero.start_application")}{" "}
              <ArrowRight className="ml-2 md:ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="ghost"
              className="font-bold px-8 md:px-10 py-5 md:py-6 h-auto rounded-2xl text-base text-slate-700 hover:bg-slate-50 border border-slate-100"
              onClick={() => {
                const el = document.getElementById("calculator");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("hero.calculate_loan")}
            </Button>
          </div>

          <div className="mt-14 flex items-center gap-10">
            <div>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">
                300k {t("common.currency")}
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {t("hero.max_limit")}
              </div>
            </div>
            <div className="w-px h-10 bg-slate-100" />
            <div>
              <div className="text-3xl font-bold text-slate-900 tracking-tight">
                47/47
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {t("hero.counties_served")}
              </div>
            </div>
          </div>
        </div>

        <div className="relative group hidden lg:block">
          {/* Main Visual */}
          <div className="relative z-10 rounded-[64px] overflow-hidden shadow-[0_64px_128px_-32px_rgba(0,0,0,0.15)] border-4 border-white transform hover:scale-[1.02] transition-transform duration-700">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop"
              alt="Professional Business"
              className="w-full h-[650px] object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply" />
          </div>

          {/* Floating HUD */}
          <div className="absolute top-20 -right-12 z-20 bg-white/80 backdrop-blur-xl p-6 rounded-[32px] shadow-2xl border border-white animate-float">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {t("hero.success_rate")}
                </div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  98.4%
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute bottom-20 -left-12 z-20 bg-[#0F172A] p-6 rounded-[32px] shadow-2xl border border-slate-800 animate-float"
            style={{ animationDelay: "1s" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Clock size={24} />
              </div>
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {t("hero.quick_approval")}
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  <span className="text-blue-400">{t("hero.hr_window").split(' ')[0]}</span> {t("hero.hr_window").split(' ')[1] || ""}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const LoanDetails = () => {
  const { t } = useTranslation();

  return (
    <section className="py-32 px-6 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-100/20 blur-[100px] rounded-full -ml-48 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            {t("loan_details.title_part1")} <span className="text-blue-600">{t("loan_details.title_growth")}</span>
          </h2>
          <p className="text-slate-500 mt-5 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            {t("loan_details.description")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                label: t("loan_details.amount"),
                value: `${t("common.currency")} 40k – 1M`,
                icon: <DollarSign className="text-blue-600" />,
              },
              {
                label: t("loan_details.interest"),
                value: "6.0% Fixed",
                icon: <BarChart3 className="text-blue-600" />,
              },
              {
                label: t("loan_details.fee"),
                value: "6.5% (Post-Approval)",
                icon: <ShieldCheck className="text-blue-600" />,
              },
              {
                label: t("loan_details.period"),
                value: `Up to 6 ${t("common.months")}`,
                icon: <Clock className="text-blue-600" />,
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="p-7 bg-white border-none shadow-sm hover:shadow-md transition-all duration-500 group rounded-2xl"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                  {item.label}
                </div>
                <div className="text-xl font-bold text-slate-900 tracking-tight">
                  {item.value}
                </div>
              </Card>
            ))}
            <Card className="p-8 bg-[#0F172A] text-white flex items-center justify-center text-center col-span-full rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/10 animate-pulse" />
              <div className="flex items-center gap-4 relative z-10">
                <Info className="w-6 h-6 text-blue-400" />
                <span className="font-bold text-sm tracking-tight italic">
                  {t("loan_details.zero_upfront")}
                </span>
              </div>
            </Card>
          </div>

          <Card className="p-10 border-none shadow-xl relative bg-white rounded-[32px] overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-2 rounded-bl-2xl text-[9px] font-bold uppercase tracking-widest">
              {t("loan_details.sample_scenario")}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">
              {t("loan_details.repayment_example")}
            </h3>

            <div className="space-y-6">
              <div className="flex justify-between items-center pb-5 border-b border-slate-50">
                <span className="text-sm text-slate-500 font-semibold">{t("loan_details.principal")}</span>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  {t("common.currency")} 100,000
                </span>
              </div>
              <div className="flex justify-between items-center pb-5 border-b border-slate-50">
                <span className="text-sm text-slate-500 font-semibold">{t("loan_details.duration")}</span>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  6 {t("common.months")}
                </span>
              </div>
              <div className="flex justify-between items-center pb-5 border-b border-slate-50">
                <span className="text-sm text-slate-500 font-semibold">
                  {t("loan_details.interest")} (6%)
                </span>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  {t("common.currency")} 6,000
                </span>
              </div>

              <div className="p-8 bg-blue-600 text-white rounded-[24px] mt-8 shadow-xl shadow-blue-500/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                <div className="flex justify-between items-center relative z-10 mb-1">
                  <span className="text-blue-100 font-bold uppercase tracking-widest text-[9px]">
                    {t("loan_details.total_repayment")}
                  </span>
                  <span className="text-blue-200 line-through text-xs opacity-50">
                    {t("common.currency")} 142k
                  </span>
                </div>
                <div className="text-4xl font-bold tracking-tight relative z-10">
                  {t("common.currency")} 136,000
                </div>
                <div className="mt-5 pt-5 border-t border-white/20 relative z-10 flex justify-between items-center">
                  <span className="text-sm font-semibold opacity-80">
                    {t("loan_details.monthly_installment")}
                  </span>
                  <span className="text-xl font-bold">{t("common.currency")} 22,667</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export const Calculator = () => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(
    () => Number(localStorage.getItem("loanAmount")) || 40000,
  );
  const [months, setMonths] = useState(
    () => Number(localStorage.getItem("loanMonths")) || 6,
  );

  useEffect(() => {
    localStorage.setItem("loanAmount", amount.toString());
    localStorage.setItem("loanMonths", months.toString());
  }, [amount, months]);

  const [settings, setSettings] = useState({
    interestRateDefault: 6.0,
    processingFeePercent: 6.5,
    minLoan: 40000,
    maxLoan: 1000000,
    maxMonths: 6,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/public/settings");
        if (res.data.success) {
          const s = res.data.data;
          setSettings({
            interestRateDefault: Number(s.interestRateDefault),
            processingFeePercent: Number(s.processingFeePercent),
            minLoan: Number(s.minLoan),
            maxLoan: Number(s.maxLoan),
            maxMonths: Number(s.maxMonths),
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };
    fetchSettings();
  }, []);

  const interestRate = settings.interestRateDefault / 100;
  const monthlyInterest = amount * interestRate;
  const totalInterest = monthlyInterest * months;
  const totalRepayment = amount + totalInterest;
  const monthlyInstallment = totalRepayment / months;

  const monthOptions = Array.from(
    { length: settings.maxMonths },
    (_, i) => i + 1,
  );

  return (
    <section
      id="calculator"
      className="py-40 px-6 bg-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50/50 border border-blue-100/50 rounded-full mb-8">
              <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600">
                {t("calculator.badge")}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-[1.2] tracking-tight">
              {t("calculator.title_plan")} <br />
              <span className="text-blue-600 italic">{t("calculator.title_milestones")}</span>
            </h2>
            <p className="text-lg text-slate-500 mt-8 max-w-lg font-medium leading-relaxed">
              {t("calculator.desc")}
            </p>

            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="p-7 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="text-2xl font-bold text-slate-900">300k</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {t("calculator.daily_disbursement")}
                </div>
              </div>
              <div className="p-7 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="text-2xl font-bold text-slate-900">6.0%</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {t("calculator.fixed_rate")}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-blue-600/5 blur-3xl rounded-[64px] pointer-events-none" />
            <div className="relative z-10 space-y-8">
              <Card className="p-10 border-none shadow-md rounded-3xl bg-white/80 backdrop-blur-xl">
                <div className="space-y-10">
                  <div>
                    <div className="flex justify-between items-end mb-6">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {t("calculator.loan_amount")}
                      </label>
                      <span className="text-3xl font-bold text-slate-900 tracking-tight">
                        {t("common.currency")} {amount.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={settings.minLoan}
                      max={settings.maxLoan}
                      step="40000"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>{t("calculator.min")}: {settings.minLoan / 1000}k</span>
                      <span>{t("calculator.max")}: {settings.maxLoan / 1000}k</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                      {t("calculator.repayment_period")}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {monthOptions.map((m) => (
                        <button
                          key={m}
                          onClick={() => setMonths(m)}
                          className={cn(
                            "h-12 rounded-xl font-bold transition-all border flex items-center justify-center text-[13px]",
                            months === m
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                              : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900",
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900 p-8 text-white rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full -mr-12 -mt-12" />

                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center text-slate-400 text-[11px] font-semibold">
                    <span>
                      {t("calculator.monthly_interest")} ({settings.interestRateDefault}%)
                    </span>
                    <span className="text-white">
                      {t("common.currency")} {monthlyInterest.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px] font-semibold border-b border-white/5 pb-6">
                    <span>{t("calculator.total_interest_paid")}</span>
                    <span className="text-white">
                      {t("common.currency")} {totalInterest.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        {t("calculator.total_repayment")}
                      </div>
                      <div className="text-3xl font-bold tracking-tight text-white">
                        {t("common.currency")} {totalRepayment.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                        {t("calculator.monthly_installment")}
                      </div>
                      <div className="text-xl font-bold text-white">
                        {t("common.currency")} {Math.round(monthlyInstallment).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl mt-4 shadow-lg shadow-blue-500/20"
                    onClick={() => {
                      const el = document.getElementById("eligibility");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {t("calculator.check_eligibility")}
                  </Button>

                  <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5">
                    <ShieldCheck size={12} className="text-blue-500" />
                    {t("calculator.secure_app")}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const EligibilitySection = ({ user }: { user: any }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    amount: "100000",
    income: "",
  });
  const navigate = useNavigate();

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setStep(2);
    }, 2000);
  };

  return (
    <section
      id="eligibility"
      className="py-32 md:py-40 px-6 relative overflow-hidden bg-slate-50"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-blue-500/[0.04] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/[0.08] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50/50 border border-emerald-100/50 rounded-full mb-8">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-600">
              {t("eligibility.badge")}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.2]">
            {t("eligibility.title_know")} <br />
            <span className="text-blue-600 italic">{t("eligibility.title_instantly")}</span>
          </h2>
          <p className="text-base md:text-lg text-slate-500 mt-6 font-medium max-w-2xl mx-auto leading-relaxed">
            {t("eligibility.desc")}
          </p>
        </div>

        <Card className="max-w-xl mx-auto p-8 md:p-10 bg-white/80 backdrop-blur-xl border-none shadow-xl rounded-[32px] relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl -mr-12 -mt-12 rounded-full" />

          {step === 1 ? (
            <form onSubmit={handleCheck} className="space-y-8 relative z-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-4">
                    {t("eligibility.phone_number")}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+254 700 000 000"
                    className="w-full bg-slate-50/50 border border-slate-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-400 outline-none transition-all font-semibold text-base"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-4">
                      {t("eligibility.loan_amount")}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="100,000"
                      className="w-full bg-slate-50/50 border border-slate-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-400 outline-none transition-all font-semibold text-base"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-4">
                      {t("eligibility.monthly_income")}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="50,000"
                      className="w-full bg-slate-50/50 border border-slate-100 focus:border-blue-600 focus:bg-white rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-400 outline-none transition-all font-semibold text-base"
                      value={formData.income}
                      onChange={(e) =>
                        setFormData({ ...formData, income: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={analyzing}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t("eligibility.analyzing")}...</span>
                    </>
                  ) : (
                    <>
                      <span>{t("calculator.check_eligibility")}</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 py-2 border-t border-slate-50 mt-4">
                  <div className="flex items-center gap-1.5 grayscale opacity-60">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Secure</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-200 rounded-full" />
                  <div className="flex items-center gap-1.5 grayscale opacity-60">
                    <Lock size={14} className="text-emerald-600" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">No Credit Impact</span>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 animate-slide-up relative z-10">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Great news!</h3>
              <p className="text-base text-slate-500 mb-8 font-medium">
                You are pre-qualified for a loan of up to <span className="text-blue-600 font-bold">{t("common.currency")} {Number(formData.amount).toLocaleString()}</span>
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/20"
                  onClick={() => navigate("/register")}
                >
                  {t("eligibility.continue_app")}
                </Button>
                <button
                  onClick={() => setStep(1)}
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                  Edit Details
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};

export const ApplicationFlow = ({
  loanAmount,
  repaymentPeriod,
  user,
  pendingApplication,
  setPendingApplication,
}: {
  loanAmount?: number;
  repaymentPeriod?: number;
  user?: any;
  pendingApplication?: any;
  setPendingApplication?: (app: any) => void;
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [error, setError] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState<any>(null);
  // Application mode – MANUAL keeps existing document workflow, ONLINE uses full online form
  const [mode, setMode] = useState<"MANUAL" | "ONLINE">("ONLINE");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [kraPin, setKraPin] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessRegNo, setBusinessRegNo] = useState("");
  // ONLINE application extra structured fields (Google-forms style)
  const [onlineFullName, setOnlineFullName] = useState("");
  const [onlineGender, setOnlineGender] = useState<"MALE" | "FEMALE" | "OTHER" | "">(
    "",
  );
  const [onlinePhone, setOnlinePhone] = useState("");
  const [onlineEmail, setOnlineEmail] = useState("");
  const [onlineAddress, setOnlineAddress] = useState("");
  const [onlineLoanPurpose, setOnlineLoanPurpose] = useState("");
  const [onlineMonthlyIncome, setOnlineMonthlyIncome] = useState("");
  const [onlineGuarantorName, setOnlineGuarantorName] = useState("");
  const [onlineGuarantorPhone, setOnlineGuarantorPhone] = useState("");
  const [onlineAgreeTerms, setOnlineAgreeTerms] = useState(false);
  const navigate = useNavigate();

  // Use props or localStorage fallback
  const finalAmount =
    loanAmount || Number(localStorage.getItem("loanAmount")) || 100000;
  const finalPeriod =
    repaymentPeriod || Number(localStorage.getItem("loanMonths")) || 6;

  // Online-specific amount and period (user must choose; defaults seeded from finalAmount/finalPeriod)
  const [onlineAmount, setOnlineAmount] = useState<number>(finalAmount);
  const [onlineMonths, setOnlineMonths] = useState<number>(
    Math.min(finalPeriod, 6),
  );

  // Effective values actually sent to backend and used in confirmations
  const effectiveAmount =
    mode === "ONLINE" ? onlineAmount || finalAmount : finalAmount;
  const effectivePeriod =
    mode === "ONLINE" ? onlineMonths || finalPeriod : finalPeriod;

  // Document configuration
  const manualDocs = [
    {
      key: "applicationForm",
      label: "Loan Application",
      template: "/Downloads/Loan%20Application%20Form.pdf",
      icon: <FileText />,
    },
    {
      key: "loanAgreement",
      label: "Signed Agreement",
      template: "/Downloads/Loan%20agreement.pdf",
      icon: <ShieldCheck />,
    },
    {
      key: "guarantorForm",
      label: "Guarantor Form",
      template: "/Downloads/GUARANTOR%20FORM.pdf",
      icon: <Users />,
    },
    {
      key: "termsConditions",
      label: "Terms & Conditions",
      template: "/Downloads/TERMS%20&%20CONDITIONS.pdf",
      icon: <ClipboardList />,
    },
  ];

  const idLabelPrefix =
    idType === "DRIVING_LICENSE" ? "Driving License" : "ID Photo";

  const idDocs = [
    { key: "idFront", label: `${idLabelPrefix} (Front)`, icon: <UserSquare2 />, template: undefined },
    { key: "idBack", label: `${idLabelPrefix} (Back)`, icon: <UserSquare2 />, template: undefined },
  ];

  // For MANUAL we keep full pack + ID images, for ONLINE we only require ID images
  const activeDocs = mode === "MANUAL" ? [...manualDocs, ...idDocs] : idDocs;
  const activeDocKeys = activeDocs.map((doc) => doc.key);

  const handleFileChange = (key: string, file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(`File ${file.name} is too large. Maximum size is 10MB.`);
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError(
        `File ${file.name} is not a supported format. Please use JPG, PNG, or PDF.`,
      );
      return;
    }

    setError("");
    setFiles((prev) => ({ ...prev, [key]: file }));
    setUploadStatus((prev) => ({ ...prev, [key]: true }));
    setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
  };

  const handleSubmit = async (overrideFiles?: any) => {
    setLoading(true);
    setError("");

    try {
      const activeFiles = overrideFiles || files;

      // Validate that we have files or user is logged in
      if (!user && Object.keys(activeFiles).length === 0) {
        setError("Please log in or upload required documents to continue.");
        setLoading(false);
        return;
      }

      // Show user feedback
      setError("Creating your application...");

      const appRes = await api.post("/applications/create", {
        userId: user?.id,
        loanAmount: effectiveAmount,
        repaymentPeriod: effectivePeriod,
        mode,
        idType,
        idNumber,
        kraPin,
        businessName,
        businessRegNo,
        // Extra structured fields for ONLINE applications – backend currently
        // ignores them unless extended, but including them is backward compatible.
        onlineFormData:
          mode === "ONLINE"
            ? {
              fullName: onlineFullName,
              phone: onlinePhone,
              email: onlineEmail,
              address: onlineAddress,
              loanPurpose: onlineLoanPurpose,
              monthlyIncome: onlineMonthlyIncome,
              guarantorName: onlineGuarantorName,
              guarantorPhone: onlineGuarantorPhone,
            }
            : undefined,
      });

      if (appRes.data && appRes.data.success) {
        // Fix: Backend returns { application: { id: ... } } via sendResponse
        const applicationId = appRes.data.data.application?.id || appRes.data.data.id;
        setError("Application created! Uploading documents...");

        // Upload files if any exist
        const fileEntries = Object.entries(activeFiles);
        let uploadedCount = 0;

        if (fileEntries.length > 0) {
          for (const [key, file] of fileEntries) {
            if (file && file instanceof File) {
              try {
                setError(`Uploading ${file.name}...`);
                const formData = new FormData();
                formData.append("document", file);
                formData.append("type", key);

                await api.post(
                  `/applications/${applicationId}/upload`,
                  formData,
                  {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                      if (progressEvent.total) {
                        const progress = Math.round(
                          (progressEvent.loaded * 100) / progressEvent.total,
                        );
                        setUploadProgress((prev) => ({
                          ...prev,
                          [key]: progress,
                        }));
                      }
                    },
                  },
                );
                uploadedCount++;
                setUploadProgress((prev) => ({ ...prev, [key]: 100 }));
              } catch (uploadError: any) {
                console.error(`Failed to upload ${key}:`, uploadError);
                setError(
                  `Failed to upload ${file.name}. ${uploadError.response?.data?.message || "Please try again."}`,
                );
                setLoading(false);
                return;
              }
            }
          }
        }

        // Clear pending application after successful submission
        setPendingApplication?.(null);
        localStorage.removeItem("loanAmount");
        localStorage.removeItem("loanMonths");
        localStorage.removeItem("pendingApplication");

        setError("Application submitted successfully!");
        setTimeout(() => setStep(4), 1000);

        // Return appRes for success dialog
        return appRes;
      } else {
        const errorMsg =
          appRes.data?.message ||
          "Failed to create application. Please try again.";
        setError(errorMsg);
      }
    } catch (error: any) {
      console.error("Application submission error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Network error. Please check your connection and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onFinalSubmit = async () => {
    setShowConfirmation(false);
    setError("");
    setLoading(true);

    try {
      // Prepare form data
      const formData = {
        files,
        loanAmount: effectiveAmount,
        repaymentPeriod: effectivePeriod,
        uploadStatus,
      };

      // Use auth service to handle form submission with authentication check
      const result = await authService.handleFormSubmission(
        formData,
        async (data) => {
          if (mode === "MANUAL") {
            // Existing manual workflow – require all documents
            const completedUploads = activeDocKeys.filter(
              (key) => uploadStatus[key],
            ).length;
            if (completedUploads < activeDocKeys.length) {
              throw new Error(
                `Please upload all required documents. ${completedUploads}/${activeDocKeys.length} completed.`,
              );
            }

            // Validate files are actually files
            const validFiles = Object.values(files).filter(
              (file) => file instanceof File,
            );
            if (validFiles.length === 0) {
              throw new Error(
                "No valid files found. Please upload your documents.",
              );
            }
          } else {
            // ONLINE mode – require core ID details instead of full document pack
            if (!idType || !idNumber) {
              throw new Error(
                "Please provide your ID type and ID number to continue.",
              );
            }

            if (
              !onlineGender ||
              !onlineFullName ||
              !onlinePhone ||
              !onlineEmail ||
              !onlineLoanPurpose
            ) {
              throw new Error(
                "Please complete your gender, personal details and loan purpose.",
              );
            }

            if (!onlineAgreeTerms) {
              throw new Error(
                "Please confirm that you agree to the terms and conditions to continue.",
              );
            }
          }

          // Submit the application through existing handleSubmit
          const appRes = await handleSubmit();

          // If we reach here, submission was successful
          if (appRes && appRes.data && appRes.data.success) {
            setSubmittedApplication(appRes.data.data);
            setShowSuccess(true);
          }
        },
        navigate,
        "/apply",
      );

      if (!result.success) {
        setError(result.message);
        // If authentication is required, the auth service will handle the redirect
        if (result.message.includes("create an account")) {
          // Additional feedback for user
          setError(`${result.message} Your progress has been saved.`);
        }
      }
    } catch (error: any) {
      console.error("Final submit error:", error);
      setError(
        error.message || "Failed to submit application. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit if we have a pending application and user just logged in
  useEffect(() => {
    if (user && pendingApplication) {
      // Check if we have a complete pending application
      const hasPendingData =
        pendingApplication.files || pendingApplication.formData;

      if (hasPendingData) {
        setError("Resuming your application...");

        // Restore form state from pending application
        if (pendingApplication.files) {
          setFiles(pendingApplication.files);
          // Update upload status for restored files
          const newUploadStatus: Record<string, boolean> = {};
          Object.keys(pendingApplication.files).forEach((key) => {
            if (pendingApplication.files[key]) {
              newUploadStatus[key] = true;
            }
          });
          setUploadStatus(newUploadStatus);
        }

        // Auto-submit if we have valid files
        if (pendingApplication.files) {
          const validFiles = Object.values(pendingApplication.files).filter(
            (file) => file instanceof File,
          );

          if (validFiles.length > 0) {
            const timer = setTimeout(() => {
              handleSubmit(pendingApplication.files);
            }, 1000);

            return () => clearTimeout(timer);
          }
        }

        // Clear the pending application after processing
        const clearTimer = setTimeout(() => {
          authService.clearPendingApplication();
          setPendingApplication?.(null);
          setError("");
        }, 2000);

        return () => clearTimeout(clearTimer);
      }
    }
  }, [user, pendingApplication]);

  const overallUploadPercent =
    activeDocKeys.length > 0
      ? Math.round(
        (activeDocKeys.filter((key) => uploadStatus[key]).length /
          activeDocKeys.length) *
        100,
      )
      : 0;

  const isSubmitDisabled =
    (mode === "MANUAL" &&
      activeDocKeys.filter((key) => uploadStatus[key]).length <
      activeDocKeys.length &&
      !!user) ||
    (mode === "ONLINE" &&
      ["idFront", "idBack"].filter((key) => uploadStatus[key]).length < 2 &&
      !!user) ||
    loading;

  let mainContent: React.ReactElement;

  if (step === 4) {
    mainContent = (
      <div className="text-center animate-in zoom-in-95 duration-700 bg-white p-20 rounded-[64px] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.1)] border-2 border-emerald-50">
        <div className="w-40 h-40 bg-emerald-500 rounded-[48px] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 size={80} className="text-white" />
        </div>
        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
          Application Submitted
        </h3>
        <p className="text-lg text-slate-500 mb-12 font-medium leading-relaxed max-w-xl mx-auto">
          We've received your documents. Our team is reviewing them now.
          You'll receive an update within 48 hours.
        </p>

        <div className="bg-slate-50 rounded-[32px] p-8 flex items-center justify-center gap-6 border-2 border-dashed border-slate-200">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
            <DollarSign size={24} className="animate-bounce" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Disbursement Pending Review
          </span>
        </div>

        <Button
          size="lg"
          className="mt-16 bg-blue-600 hover:bg-blue-700 text-white font-bold px-16 h-16 rounded-2xl text-lg shadow-xl shadow-blue-500/20"
          onClick={() => navigate("/dashboard")}
        >
          View My Dashboard
        </Button>
      </div>
    );
  } else {
    mainContent = (
      <div className="space-y-8">


        {/* ONLINE mode: structured in-browser application form (like Google Forms) */}
        {mode === "ONLINE" && (
          <div className="space-y-8">
            {/* Step 1: Personal & business details */}
            <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Online Application Details
                </h3>
                <div className="px-3 py-1 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg">
                  Step 01/02
                </div>
              </div>

              <div className="space-y-6">
                {/* Personal information */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Personal Details
                  </span>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setOnlineGender("MALE")}
                        className={cn(
                          "h-11 rounded-full text-[11px] font-bold border transition-all",
                          onlineGender === "MALE"
                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                            : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900",
                        )}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setOnlineGender("FEMALE")}
                        className={cn(
                          "h-11 rounded-full text-[11px] font-bold border transition-all",
                          onlineGender === "FEMALE"
                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                            : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900",
                        )}
                      >
                        Female
                      </button>
                    </div>
                    <input
                      type="text"
                      value={onlineFullName}
                      onChange={(e) => setOnlineFullName(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-6 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
                      placeholder="Full Name (as per ID)"
                    />
                    <input
                      type="tel"
                      value={onlinePhone}
                      onChange={(e) => setOnlinePhone(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-6 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
                      placeholder="Mobile Number"
                    />
                    <input
                      type="email"
                      value={onlineEmail}
                      onChange={(e) => setOnlineEmail(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-6 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
                      placeholder="Email Address"
                    />
                    <input
                      type="text"
                      value={onlineAddress}
                      onChange={(e) => setOnlineAddress(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-6 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
                      placeholder="Residential / Postal Address"
                    />
                  </div>
                </div>

                {/* ID section */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Identification
                  </span>
                  <div className="space-y-3">
                    <div className="inline-flex rounded-full bg-slate-100 p-1">
                      <button
                        type="button"
                        className={cn(
                          "px-4 py-1.5 text-[11px] font-bold rounded-full transition-colors",
                          idType !== "DRIVING_LICENSE"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800",
                        )}
                        onClick={() => setIdType("NATIONAL_ID")}
                      >
                        National ID
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "px-4 py-1.5 text-[11px] font-bold rounded-full transition-colors",
                          idType === "DRIVING_LICENSE"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800",
                        )}
                        onClick={() => setIdType("DRIVING_LICENSE")}
                      >
                        Driving License
                      </button>
                    </div>
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-6 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
                      placeholder="ID / Driving License Number"
                    />
                  </div>
                </div>

                {/* Business & financial section */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Business & Financials
                  </span>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={kraPin}
                      onChange={(e) => setKraPin(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-6 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
                      placeholder="TIN (Optional)"
                    />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-6 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
                      placeholder="Business Name (Optional)"
                    />
                    <input
                      type="text"
                      value={businessRegNo}
                      onChange={(e) => setBusinessRegNo(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-6 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
                      placeholder="Registration Number"
                    />
                  </div>
                  <input
                    type="text"
                    value={onlineLoanPurpose}
                    onChange={(e) => setOnlineLoanPurpose(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-6 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
                    placeholder="Loan Purpose (e.g. Working capital)"
                  />
                  <input
                    type="number"
                    value={onlineMonthlyIncome}
                    onChange={(e) => setOnlineMonthlyIncome(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-6 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
                    placeholder="Average Monthly Income (TZS)"
                  />
                </div>

                {/* Guarantor section */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Guarantor Details
                  </span>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={onlineGuarantorName}
                      onChange={(e) => setOnlineGuarantorName(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-6 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
                      placeholder="Guarantor Full Name"
                    />
                    <input
                      type="tel"
                      value={onlineGuarantorPhone}
                      onChange={(e) => setOnlineGuarantorPhone(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-6 py-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all font-medium"
                      placeholder="Guarantor Phone Number"
                    />
                  </div>
                </div>

                {/* Amount & period selection (strict for ONLINE mode) */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Loan Amount & Period
                  </span>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Amount
                      </span>
                      <span className="text-lg font-bold text-slate-900 tracking-tight">
                        TZS {onlineAmount.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={40000}
                      max={1000000}
                      step={40000}
                      value={onlineAmount}
                      onChange={(e) => setOnlineAmount(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Min: 40k</span>
                      <span>Max: 1000k</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Repayment Period (Months)
                    </span>
                    <div className="grid grid-cols-6 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setOnlineMonths(m)}
                          className={cn(
                            "h-10 rounded-xl font-bold text-[11px] border flex items-center justify-center transition-all",
                            onlineMonths === m
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                              : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900",
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Declarations */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlineAgreeTerms}
                      onChange={(e) => setOnlineAgreeTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-600">
                      I confirm that the information provided is accurate and I
                      agree to the Vertex Loans terms & conditions and data
                      privacy policy.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8 px-4">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {mode === "MANUAL" ? "Required Documents" : "Identity Documents"}
              </h3>
              <div className="px-3 py-1 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg">
                {mode === "MANUAL" ? "Step 02/03" : "Step 02/02"}
              </div>
            </div>
            <div className="grid gap-4">
              {activeDocs.map((doc) => (
                <div
                  key={doc.key}
                  className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:border-blue-600/30 hover:shadow-xl transition-all duration-500"
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-[22px] flex items-center justify-center transition-all duration-500 shadow-sm",
                        uploadStatus[doc.key]
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600",
                      )}
                    >
                      {React.cloneElement(doc.icon as any, { size: 28 })}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 mb-1 text-base">
                        {doc.label}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-widest",
                            uploadStatus[doc.key]
                              ? "text-emerald-500"
                              : "text-slate-400",
                          )}
                        >
                          {uploadStatus[doc.key]
                            ? "✓ Uploaded"
                            : "• Pending"}
                        </span>
                        {doc.template && (
                          <a
                            href={doc.template}
                            download
                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download size={12} />
                            Template
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileChange(doc.key, e.target.files[0])
                      }
                    />
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                        uploadStatus[doc.key]
                          ? "bg-emerald-50 text-emerald-500"
                          : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-95",
                      )}
                    >
                      {uploadStatus[doc.key] ? (
                        <Check size={20} strokeWidth={3} />
                      ) : (
                        <Upload size={20} strokeWidth={3} />
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky top-32">
            <div className="absolute -inset-6 bg-blue-600/5 blur-3xl rounded-[64px] pointer-events-none" />
            <Card className="p-10 bg-white/80 backdrop-blur-xl border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[48px] relative overflow-hidden">
              <div className="space-y-10">
                <div className="flex items-center gap-5 p-6 bg-blue-600 text-white rounded-[32px] shadow-xl shadow-blue-500/20">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <div className="font-bold text-lg">AES-256 Security</div>
                    <p className="text-xs font-medium text-blue-100">
                      End-to-end encrypted upload
                    </p>
                  </div>
                </div>

                <div className="space-y-5 px-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Upload Progress</span>
                    <span>{overallUploadPercent}%</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                      style={{ width: overallUploadPercent + "%" }}
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic text-slate-500 text-sm font-medium leading-relaxed">
                  "Please ensure all documents are clear and legible to avoid
                  delays in your review process."
                </div>

                <Button
                  size="lg"
                  className="w-full h-16 rounded-2xl text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold shadow-2xl shadow-blue-500/30 group transition-all"
                  disabled={isSubmitDisabled}
                  onClick={() => setShowConfirmation(true)}
                  type="button"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      Submit Application
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </span>
                  )}
                </Button>
              </div>
            </Card>

            {/* Confirmation Dialog */}
            {showConfirmation && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Confirm Application Submission
                    </h3>
                    <p className="text-slate-600">
                      You're about to submit your loan application for TZS{" "}
                      {effectiveAmount.toLocaleString()} with a repayment period of{" "}
                      {effectivePeriod} months.
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        Loan Amount
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        TZS {effectiveAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        Repayment Period
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {effectivePeriod} months
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        Documents
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {
                          Object.keys(files).filter((key) => files[key]).length
                        }{" "}
                        uploaded
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 rounded-xl border-2 font-medium"
                      onClick={() => setShowConfirmation(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                      onClick={onFinalSubmit}
                    >
                      Confirm & Submit
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Success Dialog */}
            {showSuccess && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Application Submitted Successfully!
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Your loan application has been submitted and is now under
                      review. We'll notify you within 24 hours about the status.
                    </p>
                    {submittedApplication && (
                      <div className="text-left space-y-2">
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="text-xs font-medium text-slate-700">
                            Application ID
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            #{submittedApplication.id}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="text-xs font-medium text-slate-700">
                            Status
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {submittedApplication.status}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                      onClick={() => navigate("/dashboard")}
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-xl border-2 font-medium"
                      onClick={() => {
                        setShowSuccess(false);
                        setStep(1);
                      }}
                    >
                      Submit Another Application
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="application" className="py-40 px-6 bg-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
              Secure Onboarding Flow
            </span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            Seamlessly <br />
            <span className="text-blue-600 italic">Connected.</span>
          </h2>
          <p className="text-xl text-slate-500 mt-10 font-medium max-w-2xl mx-auto leading-relaxed">
            Your capital is closer than you think. Complete these steps to
            finalize your application.
          </p>

          {/* Error/Status Message */}
          {error && (
            <div
              className={`mt-8 p-4 rounded-2xl max-w-2xl mx-auto ${error.includes("success") ||
                error.includes("created") ||
                error.includes("Uploading")
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800"
                }`}
            >
              <div className="flex items-center gap-3">
                {error.includes("success") || error.includes("created") ? (
                  <CheckCircle2
                    size={20}
                    className="text-emerald-600 flex-shrink-0"
                  />
                ) : (
                  <AlertCircle
                    size={20}
                    className="text-red-600 flex-shrink-0"
                  />
                )}
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto">{mainContent}</div>
      </div>
    </section>
  );
};



export const ComplianceStrip = () => (
  <div className="bg-[#0F172A] py-8 px-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-3xl" />
    <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-16 gap-y-6 relative z-10">
      <div className="flex items-center gap-4 text-slate-400 group cursor-default">
        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-colors">
          <ShieldCheck size={20} className="text-emerald-500" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] group-hover:text-white transition-colors">
          BOT Licensed Compliant
        </span>
      </div>
      <div className="flex items-center gap-4 text-slate-400 group cursor-default">
        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors">
          <Lock size={20} className="text-blue-500" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] group-hover:text-white transition-colors">
          ODPC Data Protected
        </span>
      </div>
      <div className="flex items-center gap-4 text-slate-400 group cursor-default">
        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-slate-500 transition-colors">
          <Building size={20} className="text-slate-400" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] group-hover:text-white transition-colors">
          Reg: PVT-LRD2024-X492
        </span>
      </div>
    </div>
  </div>
);







export const OfficePresence = () => (
  <section className="py-40 px-6 bg-slate-50">
    <div className="max-w-7xl mx-auto items-center grid lg:grid-cols-2 gap-24">
      <div className="order-2 lg:order-1 relative group">
        <div className="rounded-[64px] overflow-hidden shadow-[0_64px_128px_-32px_rgba(0,0,0,0.15)] transform hover:scale-[1.02] transition-transform duration-1000 border-4 border-white">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"
            alt="Vertex HQ"
            className="w-full aspect-video object-cover"
          />
        </div>
        <div className="absolute -bottom-10 -right-10 bg-slate-900 p-10 rounded-[48px] shadow-3xl border border-slate-800 hidden md:block group-hover:-translate-x-4 group-hover:-translate-y-4 transition-transform duration-700">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
              <Building2 size={32} />
            </div>
            <div className="text-white">
              <div className="text-lg font-black tracking-tight">Visit Us</div>
              <div className="text-xs font-bold text-slate-500">
                Physical Consultations
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="order-1 lg:order-2 space-y-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
              Legitimacy & Presence
            </span>
          </div>
          <h2 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95]">
            Experience <br />
            <span className="text-blue-600">transparency.</span>
          </h2>
          <p className="text-xl text-slate-500 mt-10 font-medium leading-relaxed">
            We believe in human connection. Our physical office in Nairobi is
            designed to provide you with the face-to-face trust you deserve.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-slate-900">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <MapPin size={18} />
              </div>
              <span className="font-black tracking-tight">HQ Location</span>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed text-sm ml-12">
              12th Floor, Vertex Towers
              <br />
              Waiyaki Way, Westlands
              <br />
              Nairobi, Tanzania
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-slate-900">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock size={18} />
              </div>
              <span className="font-black tracking-tight">Service Hours</span>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed text-sm ml-12">
              Mon - Fri: 8 AM - 5 PM
              <br />
              Sat: 9 AM - 1 PM
              <br />
              Sun: Closed
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="h-16 px-10 rounded-2xl border-2 font-black text-slate-900 hover:bg-slate-900 hover:text-white transition-all"
        >
          Get Directions
        </Button>
      </div>
    </div>
  </section>
);

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = [
    {
      q: "Do I have to pay any fees before my loan is approved?",
      a: "No. GETVERTEX will NEVER ask you for a processing fee before your loan application is fully approved. The 6.5% processing fee is only payable after you receive your official approval notification.",
    },
    {
      q: "How long does the approval process take?",
      a: "Our standard processing time is quick once all required documents have been uploaded and verified by our team.",
    },
    {
      q: "Is my personal and financial data secure?",
      a: "Absolutely. We use bank-level 256-bit encryption for all data transmissions and store your documents on secure, encrypted servers compliant with ODPC regulations.",
    },
    {
      q: "What documents are required for an application?",
      a: "You will need a signed loan form, a copy of your national ID (front & back), proof of income (payslip/income statement), and a signed guarantor form.",
    },
    {
      q: "How is the monthly interest calculated?",
      a: "We charge a simple monthly interest of 6% on the principal amount. For example, a TZS 100,000 loan would accrue TZS 6,000 in interest per month.",
    },
  ];

  return (
    <section id="faq" className="py-40 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-24 anim-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
              Got Questions?
            </span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            Clarity in <br />
            <span className="text-blue-600 italic">every detail.</span>
          </h2>
          <p className="text-xl text-slate-500 mt-10 font-medium max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about GETVERTEX loans, processing times,
            and security protocols.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={cn(
                "group rounded-[32px] border-2 transition-all duration-500 overflow-hidden",
                openIndex === i
                  ? "border-blue-600 bg-blue-50/10 shadow-xl"
                  : "border-slate-100 bg-white hover:border-slate-200",
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full px-10 py-8 flex items-center justify-between text-left group"
              >
                <span
                  className={cn(
                    "text-xl font-black tracking-tight transition-colors duration-500",
                    openIndex === i
                      ? "text-blue-600"
                      : "text-slate-900 group-hover:text-blue-500",
                  )}
                >
                  {faq.q}
                </span>
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                    openIndex === i
                      ? "bg-blue-600 text-white rotate-180 shadow-lg shadow-blue-500/30"
                      : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600",
                  )}
                >
                  <ChevronRight size={24} />
                </div>
              </button>
              <div
                className={cn(
                  "px-10 overflow-hidden transition-all duration-700 ease-in-out",
                  openIndex === i
                    ? "max-h-[500px] pb-10 opacity-100"
                    : "max-h-0 opacity-0",
                )}
              >
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-3xl border-t border-blue-100/50 pt-8">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ScamNotice = () => (
  <section className="pb-40 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="bg-amber-50/50 border-2 border-amber-100 p-10 md:p-16 rounded-[64px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[100px] rounded-full -mr-48 -mt-48 pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="w-24 h-24 bg-amber-100 rounded-[32px] flex items-center justify-center text-amber-600 shadow-xl shadow-amber-500/10 shrink-0 animate-glow-pulse">
            <ShieldAlert size={48} />
          </div>
          <div className="text-center lg:text-left">
            <h4 className="text-3xl font-black text-amber-950 mb-4 tracking-tight">
              Protect yourself from digital fraud.
            </h4>
            <p className="text-xl text-amber-900/70 font-medium leading-relaxed">
              GETVERTEX will{" "}
              <strong className="text-amber-600 font-black">NEVER</strong>{" "}
              request any processing fee, insurance fee, or "commitment funds"
              before your loan is approved and disbursed.
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="lg:ml-auto h-20 px-12 rounded-3xl border-2 border-amber-200 text-amber-900 font-black text-lg hover:bg-amber-100 transition-all whitespace-nowrap"
          >
            Report Suspicious Activity
          </Button>
        </div>
      </div>
    </div>
  </section>
);




export const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    try {
      const res = await api.post("/public/contact", formData);
      if (res.data.success) {
        setStatus("success");
        setFormData({ fullName: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-40 px-6 relative overflow-hidden bg-white"
    >
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-24">
          <div className="space-y-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                  Personalized Support
                </span>
              </div>
              <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]">
                Let's build <br />
                <span className="text-blue-600 italic">together.</span>
              </h2>
              <p className="text-xl text-slate-500 mt-10 font-medium leading-relaxed max-w-md">
                Our team of financial specialists is ready to help you navigate
                your capital journey with precision.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {[
                {
                  icon: <Phone />,
                  title: "Call Center",
                  content: "+1(870)962-0043",
                },
                {
                  icon: <MessageSquare />,
                  title: "WhatsApp Business",
                  content: "+1(870)962-0043",
                },
                {
                  icon: <Mail />,
                  title: "Direct Email",
                  content: "support@getvertexloans.com",
                },
                {
                  icon: <MapPin />,
                  title: "Main HQ",
                  content: "Vertex Towers, Westlands",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-4 p-8 bg-slate-50 rounded-[32px] hover:bg-white hover:shadow-xl transition-all duration-500 group border border-transparent hover:border-blue-100"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {React.cloneElement(item.icon as any, { size: 20 })}
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">
                      {item.title}
                    </div>
                    <div className="font-black text-slate-900 tracking-tight">
                      {item.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-blue-600/5 blur-3xl rounded-[64px] pointer-events-none" />
            <Card className="p-12 bg-white/80 backdrop-blur-xl border-none shadow-[0_64px_128px_-32px_rgba(0,0,0,0.1)] rounded-[64px] relative overflow-hidden">
              <h3 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">
                Send a brief.
              </h3>

              {status === "success" && (
                <div className="mb-10 p-6 bg-emerald-50 text-emerald-700 rounded-[32px] flex items-center gap-4 animate-in zoom-in-95 duration-500 border border-emerald-100">
                  <CheckCircle2 size={32} />
                  <span className="font-black text-sm uppercase tracking-widest">
                    Message Dispatched Successfully
                  </span>
                </div>
              )}

              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                      Identity
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-8 py-5 text-slate-900 placeholder:text-slate-400 outline-none transition-all font-black"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                      E-Mail Address
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-8 py-5 text-slate-900 placeholder:text-slate-400 outline-none transition-all font-black"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                    Brief Topic
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[24px] px-8 py-5 text-slate-900 placeholder:text-slate-400 outline-none transition-all font-black"
                    placeholder="e.g. Loan Refinancing"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                    Inquiry Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[32px] px-8 py-6 text-slate-900 placeholder:text-slate-400 outline-none transition-all font-black resize-none"
                    placeholder="Tell us about your needs..."
                  ></textarea>
                </div>
                <Button
                  size="lg"
                  className="w-full h-20 rounded-[28px] text-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-2xl shadow-blue-500/30 group"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <span className="flex items-center gap-3">
                      Dispatch Message
                      <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export const LoanRepayment = ({
  loan,
  onRepaymentSuccess,
}: {
  loan: any;
  onRepaymentSuccess: () => void;
}) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/loans/repay", { amount: Number(amount) });
      if (res.data.success) {
        setAmount("");
        onRepaymentSuccess();
        alert("Payment successful!");
      } else {
        setError("Payment failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-12 bg-white border-2 border-blue-50 shadow-[0_64px_128px_-32px_rgba(0,0,0,0.1)] rounded-[64px] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            Instant Repayment
          </h3>
          <p className="text-slate-500 font-medium mt-2">
            Settle your balance securely via M-PESA or Bank.
          </p>
        </div>
        <Badge
          className={cn(
            "h-12 px-8 rounded-full text-xs font-black uppercase tracking-widest",
            loan.status === "ACTIVE"
              ? "bg-emerald-500 text-white"
              : "bg-slate-900 text-white",
          )}
        >
          {loan.status} APPLICATION
        </Badge>
      </div>

      <div className="grid sm:grid-cols-2 gap-8 mb-12">
        <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100/50">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">
            Total Repayment
          </div>
          <div className="text-3xl font-black text-slate-900">
            TZS {Number(loan.totalRepayment).toLocaleString()}
          </div>
        </div>
        <div className="p-8 bg-blue-600 text-white rounded-[32px] shadow-xl shadow-blue-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-2 px-2 relative z-10">
            Remaining Balance
          </div>
          <div className="text-3xl font-black relative z-10">
            TZS {loan.remainingBalance.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mb-12 space-y-4">
        <div className="flex justify-between items-end px-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Growth Progress
          </span>
          <span className="text-2xl font-black text-blue-600">
            {Math.round(loan.progress)}%
          </span>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            style={{ width: `${loan.progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleRepay} className="space-y-8">
        <div className="p-8 bg-[#fdfdfd] border-2 border-slate-100 rounded-[32px] mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-6 mb-8">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
              <Phone size={24} />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">M-Pesa Instructions</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Follow these steps on your phone</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Till Number</span>
              <span className="text-2xl font-black text-blue-600 tracking-tighter">5617392</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Account ID</span>
              <span className="text-lg font-black text-slate-900">LW-{loan.id}</span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl flex items-start gap-4">
            <Info size={18} className="text-blue-600 mt-1 flex-shrink-0" />
            <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
              Open M-Pesa → Lipa na M-Pesa → Buy Goods & Services → Enter Till <span className="font-black underline px-0.5">5617392</span>. Once paid, click the button below to synchronize.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">
            Amount to Remit (TZS)
          </label>
          <div className="relative">
            <span className="absolute left-10 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">
              TZS
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-[32px] px-24 py-8 text-slate-900 placeholder:text-slate-400 outline-none transition-all font-black text-3xl shadow-sm"
              placeholder="0.00"
              max={loan.remainingBalance}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest animate-in slide-in-from-top-2">
            <ShieldAlert size={16} />
            {error}
          </div>
        )}

        <Button
          size="lg"
          className="w-full h-24 rounded-[40px] text-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-2xl shadow-emerald-500/30 group transition-all"
          disabled={loading || !amount}
        >
          {loading ? (
            <span className="flex items-center gap-4">
              <Loader2 className="animate-spin" />
              Verifying Payment...
            </span>
          ) : (
            <span className="flex items-center gap-4">
              <CreditCard size={32} />
              Confirm Repayment
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
};

export const ProcessingFeePayment = ({
  application,
  onPaymentSuccess,
  processingFeePercent = 6.5,
}: {
  application: any;
  onPaymentSuccess: () => void;
  processingFeePercent?: number;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const feePercent = processingFeePercent ?? 6.5;
  const processingFee = Number(application.loanAmount) * (feePercent / 100);

  const handlePayProcessingFee = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.post(`/payments/initiate-processing-fee/${application.id}`);
      if (res.data.success && res.data.data.link) {
        // Redirect to Flutterwave checkout
        window.location.href = res.data.data.link;
      } else {
        setError("Failed to initiate payment. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-12 bg-white border-2 border-orange-50 shadow-[0_64px_128px_-32px_rgba(0,0,0,0.1)] rounded-[64px] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            Processing Fee Payment
          </h3>
          <p className="text-slate-500 font-medium mt-2">
            Pay the processing fee to activate your approved loan
          </p>

          {application.status === 'APPROVED' && !application.processingFeePaid ? (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  Action Required: Pay processing fee to activate your loan
                </span>
              </div>
              <Button
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl"
                onClick={() => setShowPayment(true)}
              >
                Pay Processing Fee - TZS {processingFee.toLocaleString()}
              </Button>
            </div>
          ) : application.processingFeePaid ? (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">
                  Processing fee paid - Your loan is now active
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-800">
                  Waiting for admin approval...
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-sm text-slate-600 mb-2">Loan Application #{application.id}</div>
          <Badge variant={application.status === 'APPROVED' ? 'success' : 'info'}>
            {application.status}
          </Badge>
        </div>
      </div>

      {showPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <Card className="w-full max-w-lg p-10 bg-white rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-3xl rounded-full" />
            
            <button 
              onClick={() => setShowPayment(false)}
              className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-orange-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CreditCard className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                Secure Payment
              </h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto">
                Complete your processing fee to activate your loan instantly.
              </p>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100/50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Processing Fee ({feePercent}%)
                </span>
                <span className="text-2xl font-black text-slate-900">
                  TZS {processingFee.toLocaleString()}
                </span>
              </div>
              
              <div className="p-8 bg-[#fdfdfd] border-2 border-blue-50 rounded-[32px] text-center">
                <div className="h-12 flex items-center justify-center mb-6">
                  <img src="https://flutterwave.com/images/logo/full.svg" alt="Flutterwave" className="h-full opacity-80" />
                </div>
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-tight">Official Payment Partner</p>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Select <span className="text-blue-600 font-bold">Mobile Money</span> on the next screen to pay via M-Pesa, Tigo Pesa, or Airtel Money.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest border border-red-100">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <Button
                size="lg"
                className="w-full h-20 rounded-[28px] text-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-4 group transition-all"
                onClick={handlePayProcessingFee}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Zap size={24} className="fill-blue-200 group-hover:scale-110 transition-transform" />
                    Secure Checkout
                  </>
                )}
              </Button>

              <button
                onClick={() => setShowPayment(false)}
                className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors py-4"
              >
                Cancel and Return
              </button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};

export const Footer = () => (
  <footer className="bg-[#0F172A] text-white pt-40 pb-20 px-6 relative overflow-hidden">
    {/* Premium background effects */}
    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full animate-glow-pulse pointer-events-none" />
    <div
      className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full animate-glow-pulse pointer-events-none"
      style={{ animationDelay: "2s" }}
    />

    <div className="max-w-7xl mx-auto relative z-10">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-24 pb-32 border-b border-slate-800/60">
        <div className="space-y-10">
          <div
            className="flex items-center gap-4 group cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src="/logovertex.png"
              alt="GETVERTEX"
              className="h-14 w-auto object-contain transition-transform group-hover:rotate-[360deg] duration-1000"
            />
            <span className="text-3xl font-black tracking-tighter text-white">
              VERTEX
            </span>
          </div>
          <p className="text-slate-400 font-medium leading-relaxed">
            Tanzania's premier digital lending ecosystem. Bridging the capital gap
            with transparency, security, and velocity.
          </p>
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:scale-110 cursor-pointer transition-all duration-500"
              >
                <div className="w-6 h-6 bg-slate-400/20 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-10">
            Financial Products
          </h4>
          <ul className="space-y-6">
            {[
              "Business Growth",
              "Merchant Capital",
              "Asset Financing",
              "Emergency Credit",
            ].map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-slate-400 font-bold hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                >
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full scale-0 group-hover:scale-100 transition-transform" />
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-10">
            Corporate Hub
          </h4>
          <ul className="space-y-6">
            {[
              "Strategic Vision",
              "Privacy Mandate",
              "Terms of Service",
              "Contact Support: +1(870)962-0043",
            ].map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-slate-400 font-bold hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                >
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full scale-0 group-hover:scale-100 transition-transform" />
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-8">
          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-10">
            Certified Authority
          </h4>
          <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 hover:border-blue-500/30 transition-all duration-500">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 px-2">
              BOT Licensed Lender
            </div>
            <div className="text-lg font-black text-white px-2">
              KRD-0042-2026
            </div>
          </div>
          <div className="p-8 bg-blue-600/10 rounded-[32px] border border-blue-500/20 hover:border-blue-500/40 transition-all duration-500">
            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 px-2">
              ODPC Registered
            </div>
            <div className="text-lg font-black text-white px-2">
              #PVT-LRD2024-X
            </div>
          </div>
        </div>
      </div>

      <div className="pt-16 flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="text-slate-500 text-sm font-medium tracking-tight">
          &copy; 2026 GETVERTEX Financial Limited. Registered in the Republic of
          Tanzania.
        </div>
        <div className="flex items-center gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <div className="text-2xl font-black text-white tracking-tighter">
            M-PESA
          </div>
          <div className="text-2xl font-black text-white tracking-widest italic">
            KCB
          </div>
          <div className="text-xl font-serif font-black text-white">EQUITY</div>
        </div>
        <div className="flex gap-8">
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest text-emerald-500">
            System Operational
          </Badge>
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest text-blue-500">
            AES-256 Protected
          </Badge>
        </div>
      </div>
    </div>
  </footer>
);

export const BrandTrustBar = () => (
  <div className="py-24 bg-white border-y border-slate-50 overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-16">
        Authorized & Regulated Financial Ecosystem
      </p>
      <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
        <div className="flex items-center gap-2 font-black text-3xl text-slate-900 italic tracking-tighter">
          SECURE PAY
        </div>
        <div className="flex items-center gap-2 font-black text-3xl text-slate-900 border-[4px] border-slate-900 px-4 tracking-tighter">
          DATA SHIELD
        </div>
        <div className="flex items-center gap-2 font-black text-3xl text-slate-900 uppercase">
          Privacy First
        </div>
        <div className="flex items-center gap-2 font-black text-3xl text-slate-900 tracking-widest italic">
          TRUST CONNECT
        </div>
      </div>
    </div>
  </div>
);

export const ImpactStories = () => {
  const stories = [
    {
      name: "Mercy Wanjiku",
      business: "Wanjiku Groceries",
      amount: "TZS 75,000+",
      quote:
        "Vertex believed in my vision when no one else would. The capital arrived within hours of the final review.",
      img: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "John Mutua",
      business: "Mutua Tech Solutions",
      amount: "TZS 450,000+",
      quote:
        "Scaling my tech shop required quick liquidity. Vertex provided the flexibility I needed to dominate the market.",
      img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop",
    },
  ];

  return (
    <section id="impact" className="py-40 bg-slate-50 relative overflow-hidden">
      {/* Decorative background text */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-[0.015] pointer-events-none select-none">
        <div className="text-[25rem] font-black tracking-tighter">IMPACT</div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-32 group">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
              Societal Growth
            </span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            Real Growth, <br />
            <span className="text-blue-600 italic">Real Ripples.</span>
          </h2>
          <p className="text-xl text-slate-500 mt-10 font-medium max-w-2xl mx-auto leading-relaxed">
            Beyond capital, we provide the fuel for dreams that transform
            communities across Tanzania.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {stories.map((story, i) => (
            <Card
              key={i}
              className="p-0 overflow-hidden border-none shadow-[0_64px_128px_-32px_rgba(0,0,0,0.1)] hover:shadow-2xl transition-all duration-700 bg-white rounded-[64px] group"
            >
              <div className="grid sm:grid-cols-2 h-full">
                <div className="h-80 sm:h-auto overflow-hidden relative">
                  <ImageWithFallback
                    src={story.img}
                    alt={story.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-blue-600/10 pointer-events-none" />
                </div>
                <div className="p-12 flex flex-col justify-center relative">
                  <div className="w-16 h-2 bg-blue-600 mb-10 rounded-full" />
                  <p className="text-2xl font-bold text-slate-900 italic leading-relaxed mb-10 group-hover:text-blue-600 transition-colors">
                    "{story.quote}"
                  </p>
                  <div>
                    <div className="font-black text-2xl text-slate-900 tracking-tight">
                      {story.name}
                    </div>
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                      {story.business}
                    </div>
                    <div className="mt-10">
                      <Badge className="bg-slate-900 text-white font-black px-6 py-2 rounded-2xl text-[10px] tracking-[0.2em]">
                        CAPITAL: {story.amount}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export const SecurityGrid = () => {
  const features = [
    {
      title: "Bank-Grade Encryption",
      desc: "Your data is protected by industry-leading AES-256 bit encryption, the exact same standard used by global financial institutions.",
      icon: <ShieldCheck className="w-12 h-12 text-blue-600" />,
    },
    {
      title: "Data Privacy Policy",
      desc: "We are fully compliant with the Tanzania Data Protection Act. We never share your personal information without explicit consent.",
      icon: <Lock className="w-12 h-12 text-indigo-600" />,
    },
    {
      title: "Fair Lending Practices",
      desc: "We work with licensed bureaus to ensure fair credit reporting and help you build a positive credit score for the future.",
      icon: <BarChart3 className="w-12 h-12 text-emerald-600" />,
    },
  ];

  return (
    <section className="py-40 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-16">
          {features.map((f, i) => (
            <div
              key={i}
              className="group p-12 rounded-[64px] bg-slate-50/50 hover:bg-white hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-700 border-2 border-transparent hover:border-blue-50"
            >
              <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl flex items-center justify-center mb-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                {React.cloneElement(f.icon as any, { size: 40 })}
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">
                {f.title}
              </h3>
              <p className="text-lg text-slate-500 leading-relaxed font-bold">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
