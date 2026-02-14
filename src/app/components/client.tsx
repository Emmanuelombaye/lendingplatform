import React, { useState } from 'react';
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
  CheckCircle2, 
  Info,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Star,
  Quote,
  ShieldAlert,
  Lock,
  Building2,
  HelpCircle,
  Building,
  CheckCircle,
  CreditCard,
  History,
  AlertCircle
} from 'lucide-react';
import { Button, Card, Badge, cn } from './ui';
import { ImageWithFallback } from './figma/ImageWithFallback';

// --- SHARED CLIENT LAYOUT ---

export const Navbar = ({ onNavigate, currentView }: { onNavigate: (view: string) => void, currentView: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Loans', id: 'loans' },
    { name: 'Calculator', id: 'calculator' },
    { name: 'How It Works', id: 'how-it-works' },
    { name: 'Contact', id: 'contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-[#0F172A] tracking-tight">Kredo</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-[#2563EB]",
                currentView === item.id ? "text-[#2563EB]" : "text-slate-600"
              )}
            >
              {item.name}
            </button>
          ))}
          <Button size="md" onClick={() => onNavigate('apply')}>Apply Now</Button>
          <Button size="md" variant="outline" onClick={() => onNavigate('admin')}>Admin Portal</Button>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 p-6 flex flex-col gap-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setIsOpen(false); }}
              className="text-left py-2 font-medium"
            >
              {item.name}
            </button>
          ))}
          <Button className="w-full" onClick={() => onNavigate('apply')}>Apply Now</Button>
        </div>
      )}
    </nav>
  );
};

// --- PAGES ---

export const Hero = ({ onNavigate }: { onNavigate: (v: string) => void }) => (
  <section className="pt-32 pb-20 px-6">
    <div className="max-w-[1440px] mx-auto grid md:grid-cols-2 gap-16 items-center">
      <div className="transition-all duration-700">
        <Badge variant="info">Reliable Business & Personal Loans</Badge>
        <h1 className="text-5xl md:text-7xl font-bold text-[#0F172A] mt-6 leading-[1.1]">
          Financial growth, <br /><span className="text-[#2563EB]">simplified.</span>
        </h1>
        <p className="text-xl text-slate-600 mt-8 max-w-lg leading-relaxed">
          Access fast, transparent, and flexible financing for your business or personal needs. Kenya's premier lending partner.
        </p>
        
        <div className="mt-10 flex flex-wrap gap-4">
          <Button size="lg" onClick={() => onNavigate('apply')}>Apply Now</Button>
          <Button size="lg" variant="outline" onClick={() => onNavigate('calculator')}>Calculate Your Loan</Button>
        </div>

        <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex gap-8 items-center max-w-fit">
          <div>
            <div className="text-sm text-slate-500 font-medium">Loan Range</div>
            <div className="text-2xl font-bold text-[#0F172A]">KES 40k – 300k</div>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div>
            <div className="text-sm text-slate-500 font-medium">Approval Time</div>
            <div className="text-2xl font-bold text-[#0F172A]">3 Working Days</div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl z-10 aspect-[4/3]">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1760243875440-3556238664d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiYW5rJTIwYnVpbGRpbmclMjBleHRlcmlvciUyMGdsYXNzJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc3MDk5OTcxNHww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Premium Fintech Building"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl z-20 border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-bold">Trusted by 5k+ Clients</div>
              <div className="text-xs text-slate-500">Verified lending across Kenya</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-[1440px] mx-auto mt-24 grid md:grid-cols-3 gap-8">
      {[
        { icon: <Clock className="w-8 h-8 text-[#2563EB]" />, title: "Fast Approval", desc: "Get your funds within 3 working days after document verification." },
        { icon: <ShieldCheck className="w-8 h-8 text-[#2563EB]" />, title: "Secure & Confidential", desc: "Your financial data is protected by enterprise-grade encryption." },
        { icon: <DollarSign className="w-8 h-8 text-[#2563EB]" />, title: "Transparent Pricing", desc: "No hidden fees. Every cost is clearly outlined before you commit." }
      ].map((feature, i) => (
        <Card key={i} className="p-8 hover:translate-y-[-4px] transition-transform">
          <div className="mb-6">{feature.icon}</div>
          <h3 className="text-xl font-bold text-[#0F172A] mb-3">{feature.title}</h3>
          <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
        </Card>
      ))}
    </div>
  </section>
);

export const LoanDetails = () => (
  <section className="py-24 px-6 bg-slate-50">
    <div className="max-w-[1440px] mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-[#0F172A]">Loan Structure</h2>
        <p className="text-slate-600 mt-4">Simple, straightforward terms designed for you.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: "Loan Amount", value: "KES 40,000 – 300,000" },
            { label: "Monthly Interest", value: "6% per month" },
            { label: "Processing Fee", value: "6.5% (Post-approval)" },
            { label: "Repayment Period", value: "1 – 6 months" },
            { label: "Late Penalty", value: "2% per month" }
          ].map((item, i) => (
            <Card key={i} className="p-6 bg-white border-none shadow-sm">
              <div className="text-sm text-slate-500 mb-1 font-medium">{item.label}</div>
              <div className="text-xl font-bold text-[#0F172A]">{item.value}</div>
            </Card>
          ))}
          <Card className="p-6 bg-[#0F172A] text-white flex items-center justify-center text-center col-span-full">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-sm">Processing fee is only payable after loan approval.</span>
            </div>
          </Card>
        </div>

        <Card className="p-10 border-2 border-blue-100 relative">
          <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-xl text-sm font-bold">Repayment Example</div>
          <h3 className="text-2xl font-bold text-[#0F172A] mb-8">Sample Loan Scenario</h3>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Loan Amount</span>
              <span className="text-xl font-bold text-[#0F172A]">KES 100,000</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Period</span>
              <span className="text-xl font-bold text-[#0F172A]">6 Months</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Monthly Interest (6%)</span>
              <span className="text-xl font-bold text-[#0F172A]">KES 6,000</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Total Interest</span>
              <span className="text-xl font-bold text-[#0F172A]">KES 36,000</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-900 font-bold text-lg">Total Repayment</span>
              <span className="text-3xl font-bold text-[#2563EB]">KES 136,000</span>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl mt-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-800 font-semibold">Monthly Installment</span>
                <span className="text-2xl font-bold text-blue-800 underline decoration-2 decoration-blue-200 underline-offset-4">KES 22,667</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </section>
);

export const Calculator = () => {
  const [amount, setAmount] = useState(100000);
  const [months, setMonths] = useState(6);

  const monthlyInterest = amount * 0.06;
  const totalInterest = monthlyInterest * months;
  const totalRepayment = amount + totalInterest;
  const monthlyInstallment = totalRepayment / months;

  return (
    <section className="py-24 px-6">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <Badge variant="info">Plan Your Future</Badge>
          <h2 className="text-4xl font-bold text-[#0F172A] mt-4">Loan Repayment Calculator</h2>
          <p className="text-slate-600 mt-4 max-w-lg mx-auto">Calculate your estimated monthly payments and total costs with our transparent calculator.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="p-8 space-y-8">
            <div>
              <div className="flex justify-between mb-4">
                <label className="text-sm font-bold text-[#0F172A]">Loan Amount</label>
                <span className="text-[#2563EB] font-bold">KES {amount.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="40000" 
                max="300000" 
                step="5000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
              />
              <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                <span>KES 40,000</span>
                <span>KES 300,000</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-4">Repayment Period (Months)</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMonths(m)}
                    className={cn(
                      "py-3 rounded-xl font-bold transition-all border",
                      months === m 
                        ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-200" 
                        : "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="bg-[#0F172A] p-8 text-white relative overflow-hidden">
             {/* Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center text-slate-400 font-medium text-sm">
                <span>Monthly Interest (6%)</span>
                <span className="text-white font-bold">KES {monthlyInterest.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 font-medium text-sm">
                <span>Total Interest</span>
                <span className="text-white font-bold">KES {totalInterest.toLocaleString()}</span>
              </div>
              <div className="pt-6 border-t border-slate-700/50">
                <div className="text-slate-400 font-medium text-sm mb-1">Total Repayment</div>
                <div className="text-4xl font-bold text-[#2563EB]">KES {totalRepayment.toLocaleString()}</div>
              </div>
              <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                <div className="text-slate-400 text-sm mb-1">Estimated Monthly Installment</div>
                <div className="text-2xl font-bold text-white">KES {Math.round(monthlyInstallment).toLocaleString()}</div>
              </div>
              <div className="flex items-start gap-3 mt-4 text-xs text-slate-400">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <p>Processing fee (6.5%) is paid after loan approval. All calculations are estimates subject to final review.</p>
              </div>
              <Button size="lg" className="w-full mt-4 bg-white text-[#0F172A] hover:bg-slate-100">Start Your Application</Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export const ApplicationFlow = () => {
  const [step, setStep] = useState(1);

  const steps = [
    { title: "Download Forms", icon: <Download /> },
    { title: "Fill & Sign", icon: <FileText /> },
    { title: "Upload & Submit", icon: <Upload /> }
  ];

  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#0F172A]">Application Process</h2>
          <div className="mt-12 flex items-center justify-center max-w-2xl mx-auto px-4">
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center relative">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-colors border-2",
                    step > i + 1 ? "bg-emerald-500 border-emerald-500 text-white" :
                    step === i + 1 ? "bg-blue-600 border-blue-600 text-white" :
                    "bg-white border-slate-200 text-slate-400"
                  )}>
                    {step > i + 1 ? <CheckCircle2 className="w-6 h-6" /> : React.cloneElement(s.icon as React.ReactElement, { className: "w-6 h-6" })}
                  </div>
                  <span className={cn(
                    "absolute -bottom-8 whitespace-nowrap text-sm font-bold",
                    step === i + 1 ? "text-blue-600" : "text-slate-500"
                  )}>{s.title}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors",
                    step > i + 1 ? "bg-emerald-500" : "bg-slate-200"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="mt-24">
          <Card className="p-10 min-h-[500px] flex items-center justify-center">
            {step === 1 && (
              <div className="w-full max-w-4xl text-center">
                <h3 className="text-2xl font-bold mb-4">Step 1: Download Required Forms</h3>
                <p className="text-slate-500 mb-10">Please download, print, fill and sign these forms manually before proceeding.</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    "Loan Application Form",
                    "Loan Agreement",
                    "Guarantor Form",
                    "Terms & Conditions"
                  ].map((form, i) => (
                    <button key={i} className="flex flex-col items-center gap-4 p-6 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                        <FileText className="text-blue-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{form}</span>
                      <Badge variant="info">PDF</Badge>
                    </button>
                  ))}
                </div>
                <div className="mt-12 flex justify-center">
                  <Button size="lg" onClick={() => setStep(2)}>I've Downloaded the Forms <ChevronRight className="ml-2 w-5 h-5" /></Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="w-full max-w-4xl flex flex-col items-center text-center">
                 <div className="w-64 h-64 bg-slate-100 rounded-full mb-8 flex items-center justify-center overflow-hidden">
                    <ImageWithFallback 
                      src="https://images.unsplash.com/photo-1758519291448-f768beb8912d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMHBlcnNvbiUyMHVzaW5nJTIwbGFwdG9wJTIwZGlnaXRhbCUyMGZpbmFuY2V8ZW58MXx8fHwxNzcwOTk5NzE1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Signing Illustration"
                      className="w-full h-full object-cover opacity-80"
                    />
                 </div>
                 <h3 className="text-2xl font-bold mb-4">Step 2: Fill & Sign</h3>
                 <p className="text-slate-500 max-w-md mx-auto mb-10">Ensure all sections are clearly filled and signed by you and your guarantor where applicable.</p>
                 <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)}>Go Back</Button>
                    <Button size="lg" onClick={() => setStep(3)}>Ready to Upload <ChevronRight className="ml-2 w-5 h-5" /></Button>
                 </div>
              </div>
            )}

            {step === 3 && (
              <div className="w-full max-w-4xl">
                 <div className="flex flex-col md:flex-row gap-12">
                    <div className="flex-1 space-y-6">
                      <h3 className="text-2xl font-bold mb-4">Step 3: Upload Documents</h3>
                      <div className="space-y-4">
                        {[
                          "Signed Loan Application",
                          "Signed Agreement",
                          "Guarantor Form",
                          "ID Copy (Front & Back)",
                          "Bank/M-Pesa Statement",
                          "Proof of Income"
                        ].map((doc, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-medium">{doc}</span>
                            </div>
                            {i < 2 ? (
                              <Badge variant="success">Uploaded</Badge>
                            ) : (
                              <Button size="sm" variant="outline">Upload</Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="md:w-80 space-y-6">
                       <Card className="p-6 bg-slate-50 border-none shadow-none h-full">
                          <h4 className="font-bold text-sm text-[#0F172A] mb-4 uppercase tracking-wider">Application Status</h4>
                          <div className="space-y-4">
                             <div className="flex items-center gap-3 text-emerald-600">
                               <CheckCircle2 className="w-5 h-5" />
                               <span className="text-sm font-bold">Loan Form Uploaded</span>
                             </div>
                             <div className="flex items-center gap-3 text-emerald-600">
                               <CheckCircle2 className="w-5 h-5" />
                               <span className="text-sm font-bold">ID Uploaded</span>
                             </div>
                             <div className="flex items-center gap-3 text-slate-400">
                               <Clock className="w-5 h-5" />
                               <span className="text-sm font-medium">Income Proof Pending</span>
                             </div>
                          </div>
                          <div className="mt-8 pt-8 border-t border-slate-200">
                             <Badge variant="warning">Under Review</Badge>
                             <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                               Our team will review your application within 3 working days once all documents are uploaded.
                             </p>
                          </div>
                          <Button className="w-full mt-6" disabled>Finalize Submission</Button>
                       </Card>
                    </div>
                 </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export const Testimonials = () => {
  const reviews = [
    {
      name: "David Maina",
      role: "Founder, GreenAgri Solutions",
      content: "Kredo was a lifesaver when we needed urgent capital for our greenhouse expansion. The 3-day approval window is real. Highly professional team!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"
    },
    {
      name: "Sarah Wanjiku",
      role: "Retail Business Owner",
      content: "The transparency is what sold me. No hidden charges, and the interest rate is competitive. The online document upload process is so seamless.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop"
    },
    {
      name: "Peter Otieno",
      role: "Logistics Manager",
      content: "I've tried many lenders in Nairobi, but Kredo's personalized service stands out. They actually take the time to understand your business cycle.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop"
    },
    {
      name: "Faith Mutua",
      role: "Creative Director",
      content: "Secure, reliable, and extremely fast. I recommend Kredo to any serious entrepreneur looking for growth financing. 5 stars all the way!",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
    },
    {
      name: "Kevin Kiprop",
      role: "Hardware Store Owner",
      content: "The repayment terms are flexible, which is exactly what my seasonal business needed. The admin portal is also very helpful for tracking.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop"
    },
    {
      name: "Lydia Nekesa",
      role: "Pharmacy Owner",
      content: "Quick turnaround and friendly staff. They made the whole application process feel human rather than just a transaction. Thank you Kredo!",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-24 px-6 bg-slate-50/50">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-16">
          <Badge variant="info">Client Success Stories</Badge>
          <h2 className="text-4xl font-bold text-[#0F172A] mt-4">Trusted by Kenya's <span className="text-blue-600">Leading Entrepreneurs</span></h2>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto">See why thousands of business owners across Kenya choose Kredo as their preferred financial partner.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <Card key={i} className="p-8 hover:shadow-xl transition-all border-none bg-white relative group">
              <div className="absolute top-6 right-8 text-blue-100 group-hover:text-blue-200 transition-colors">
                <Quote size={48} fill="currentColor" />
              </div>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 leading-relaxed mb-8 relative z-10">"{review.content}"</p>
              <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100">
                  <ImageWithFallback src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold text-[#0F172A]">{review.name}</div>
                  <div className="text-xs text-slate-500">{review.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-20 p-10 bg-[#0F172A] rounded-[32px] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h3 className="text-3xl font-bold mb-3">Join 5,000+ happy clients today</h3>
              <p className="text-slate-400 max-w-lg">Experience the future of business lending. Fast, secure, and transparent.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
               <div className="px-6 py-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                  <div className="text-2xl font-bold text-white">4.9/5</div>
                  <div className="text-xs text-slate-500 font-medium">Customer Rating</div>
               </div>
               <div className="px-6 py-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-xs text-slate-500 font-medium">Satisfaction Rate</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ComplianceStrip = () => (
  <div className="bg-slate-50 border-y border-slate-100 py-4 px-6">
    <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
      <div className="flex items-center gap-2 text-slate-500">
        <ShieldCheck size={16} className="text-emerald-600" />
        <span className="text-xs font-medium uppercase tracking-wider">Registered & Compliant with CBK Guidelines</span>
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <Lock size={16} className="text-blue-600" />
        <span className="text-xs font-medium uppercase tracking-wider">Data Protected by ODPC Regulations</span>
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <Building size={16} className="text-slate-400" />
        <span className="text-xs font-medium uppercase tracking-wider">License No: KRD-2026-0042</span>
      </div>
    </div>
  </div>
);

export const PartnerLogos = () => (
  <section className="py-16 px-6 bg-white">
    <div className="max-w-[1440px] mx-auto">
      <div className="text-center mb-10">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Trusted Financial & Institutional Partners</h3>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all">
        {/* Simple text-based logos or SVG placeholders for major Kenyan/Global brands */}
        <div className="text-2xl font-black text-slate-400 hover:text-emerald-600 cursor-default">M-PESA</div>
        <div className="text-2xl font-black text-slate-400 hover:text-red-700 cursor-default">EQUITY</div>
        <div className="text-2xl font-black text-slate-400 hover:text-blue-800 cursor-default">KCB</div>
        <div className="text-2xl font-black text-slate-400 hover:text-green-700 cursor-default">CO-OP BANK</div>
        <div className="text-2xl font-black text-slate-400 hover:text-blue-600 cursor-default">WORLD BANK</div>
        <div className="text-2xl font-black text-slate-400 hover:text-indigo-600 cursor-default">IFC</div>
      </div>
      <p className="text-center text-xs text-slate-400 mt-10">
        Loans are processed through secure and recognized financial channels.
      </p>
    </div>
  </section>
);

export const TrustStats = () => (
  <section className="py-24 px-6 bg-[#0F172A] text-white overflow-hidden relative">
    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
    <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
      {[
        { label: "Loans Processed", value: "12,500+" },
        { label: "Capital Disbursed", value: "KES 420M+" },
        { label: "Client Satisfaction", value: "98.4%" },
        { label: "Counties Served", value: "47/47" }
      ].map((stat, i) => (
        <div key={i}>
          <div className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">{stat.value}</div>
          <div className="text-slate-400 font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  </section>
);

export const SecurityAssurance = () => (
  <section className="py-24 px-6 bg-white">
    <div className="max-w-[1440px] mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <Badge variant="info">Security First</Badge>
          <h2 className="text-4xl font-bold text-[#0F172A] mt-6 mb-8 leading-tight">
            Your Financial Information is <span className="text-blue-600">Safeguarded</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {[
              { icon: <Lock className="text-blue-600" />, title: "256-bit Encryption", desc: "All document uploads are secured with enterprise-grade SSL certificates." },
              { icon: <ShieldCheck className="text-blue-600" />, title: "Confidential Storage", desc: "Data is stored on encrypted servers with strict access controls." },
              { icon: <History className="text-blue-600" />, title: "Purpose-Only Use", desc: "Your information is used strictly for loan processing and evaluation." },
              { icon: <X className="text-blue-600" />, title: "Zero Sharing Policy", desc: "We never sell or share your personal data with third-party marketers." }
            ].map((item, i) => (
              <div key={i} className="space-y-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  {item.icon}
                </div>
                <h4 className="font-bold text-[#0F172A]">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="bg-slate-50 rounded-[40px] p-12 relative overflow-hidden">
             <div className="relative z-10 flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8">
                 <Lock className="w-12 h-12 text-blue-600" />
               </div>
               <h3 className="text-2xl font-bold text-[#0F172A] mb-4">Bank-Level Security</h3>
               <p className="text-slate-500 mb-8 max-w-sm">We use the same technology as leading global banks to ensure your information remains private and secure.</p>
               <div className="flex gap-4">
                 <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   SSL SECURED
                 </div>
                 <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
                   PCI DSS COMPLIANT
                 </div>
               </div>
             </div>
             {/* Abstract grid pattern */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const OfficePresence = () => (
  <section className="py-24 px-6 bg-slate-50">
    <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
       <div className="order-2 lg:order-1 relative">
         <div className="rounded-[32px] overflow-hidden shadow-2xl aspect-video">
           <ImageWithFallback 
             src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"
             alt="Kredo Headquarters"
             className="w-full h-full object-cover"
           />
         </div>
         <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 hidden md:block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <Building2 size={24} />
              </div>
              <div>
                <div className="text-sm font-bold">Physical Presence</div>
                <div className="text-xs text-slate-500">Visit us for a consultation</div>
              </div>
            </div>
         </div>
       </div>
       <div className="order-1 lg:order-2 space-y-8">
         <div>
            <Badge variant="info">Legitimate & Real</Badge>
            <h2 className="text-4xl font-bold text-[#0F172A] mt-6 leading-tight">Visit Our Headquarters</h2>
            <p className="text-slate-600 mt-6 text-lg leading-relaxed">
              We believe in transparency and human connection. Our physical office in Nairobi is open for clients who prefer in-person interactions.
            </p>
         </div>
         
         <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3 font-bold text-[#0F172A]">
                 <MapPin className="text-blue-600" />
                 Physical Address
               </div>
               <p className="text-slate-500 text-sm leading-relaxed">
                 12th Floor, Kredo Towers<br />
                 Waiyaki Way, Westlands<br />
                 Nairobi, Kenya
               </p>
            </div>
            <div className="space-y-4">
               <div className="flex items-center gap-3 font-bold text-[#0F172A]">
                 <Clock className="text-blue-600" />
                 Business Hours
               </div>
               <p className="text-slate-500 text-sm leading-relaxed">
                 Mon - Fri: 8:00 AM - 5:00 PM<br />
                 Sat: 9:00 AM - 1:00 PM<br />
                 Sun: Closed
               </p>
            </div>
         </div>
         
         <Button variant="outline" size="lg">Get Directions</Button>
       </div>
    </div>
  </section>
);

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = [
    { q: "Do I have to pay any fees before my loan is approved?", a: "No. Kredo will NEVER ask you for a processing fee before your loan application is fully approved. The 6.5% processing fee is only payable after you receive your official approval notification." },
    { q: "How long does the approval process take?", a: "Our standard processing time is 3 working days once all required documents have been uploaded and verified by our team." },
    { q: "Is my personal and financial data secure?", a: "Absolutely. We use bank-level 256-bit encryption for all data transmissions and store your documents on secure, encrypted servers compliant with ODPC regulations." },
    { q: "What documents are required for an application?", a: "You will need a signed loan form, a copy of your national ID (front & back), your latest 6-month bank or M-Pesa statement, and a signed guarantor form." },
    { q: "How is the monthly interest calculated?", a: "We charge a simple monthly interest of 6% on the principal amount. For example, a KES 100,000 loan would accrue KES 6,000 in interest per month." }
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-16">
          <Badge variant="info">Got Questions?</Badge>
          <h2 className="text-4xl font-bold text-[#0F172A] mt-4">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className={cn(
              "border rounded-2xl overflow-hidden transition-all",
              openIndex === i ? "border-blue-200 bg-blue-50/20" : "border-slate-100 hover:border-slate-200"
            )}>
              <button 
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
              >
                <span className={cn("font-bold transition-colors", openIndex === i ? "text-blue-600" : "text-[#0F172A] group-hover:text-blue-500")}>
                  {faq.q}
                </span>
                <div className={cn("transition-transform duration-300", openIndex === i ? "rotate-180" : "")}>
                  <ChevronRight size={20} className={openIndex === i ? "text-blue-600" : "text-slate-400"} />
                </div>
              </button>
              {openIndex === i && (
                <div className="px-8 pb-6 text-slate-600 leading-relaxed text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ScamNotice = () => (
  <div className="max-w-[1440px] mx-auto px-6 mb-12">
    <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h4 className="font-bold text-amber-900">Safety Notice: Protect Yourself from Scams</h4>
          <p className="text-sm text-amber-700">Kredo will <strong>NEVER</strong> request any processing fee, commitment fee, or insurance fee before your loan is approved.</p>
        </div>
      </div>
      <Button variant="outline" className="border-amber-200 text-amber-800 hover:bg-amber-100 whitespace-nowrap">Report Suspicious Activity</Button>
    </div>
  </div>
);

export const ProgressTracker = ({ currentStep }: { currentStep: number }) => {
  const steps = ["Documents", "Review", "Approval", "Disbursement"];
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-[#0F172A]">Application Status</h3>
        <Badge variant={currentStep === 4 ? "success" : "info"}>
          {currentStep === 4 ? "Ready for Funds" : "In Progress"}
        </Badge>
      </div>
      <div className="relative flex justify-between">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 z-0"></div>
        <div className="absolute top-5 left-0 h-0.5 bg-blue-600 z-0 transition-all duration-700" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
        {steps.map((label, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 bg-white",
              currentStep > i + 1 ? "bg-blue-600 border-blue-600 text-white" : 
              currentStep === i + 1 ? "border-blue-600 text-blue-600 scale-110 shadow-lg shadow-blue-100" : 
              "border-slate-200 text-slate-400"
            )}>
              {currentStep > i + 1 ? <CheckCircle2 size={20} /> : <span className="text-sm font-bold">{i + 1}</span>}
            </div>
            <span className={cn(
              "text-xs font-bold transition-colors",
              currentStep >= i + 1 ? "text-[#0F172A]" : "text-slate-400"
            )}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Contact = () => (
  <section className="py-24 px-6">
    <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-16">
      <div className="space-y-12">
        <div>
          <h2 className="text-4xl font-bold text-[#0F172A]">Get in Touch</h2>
          <p className="text-slate-600 mt-4 max-w-md">Have questions about our loan products? Our team is here to help you grow your financial freedom.</p>
        </div>
        
        <div className="space-y-6">
          {[
            { icon: <Phone />, title: "Phone", content: "+254 700 000 000" },
            { icon: <MessageSquare />, title: "WhatsApp", content: "+254 711 000 000" },
            { icon: <Mail />, title: "Email", content: "hello@kredo.co.ke" },
            { icon: <MapPin />, title: "Address", content: "Kredo Towers, Westlands, Nairobi" }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#2563EB]">
                {React.cloneElement(item.icon as React.ReactElement, { className: "w-6 h-6" })}
              </div>
              <div>
                <div className="font-bold text-[#0F172A]">{item.title}</div>
                <div className="text-slate-600">{item.content}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full h-64 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200">
          <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
             Map Placeholder (Westlands, Nairobi)
          </div>
        </div>
      </div>

      <Card className="p-10">
        <h3 className="text-2xl font-bold mb-8">Send us a Message</h3>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Full Name</label>
              <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email Address</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="john@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Subject</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="How can we help?" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Message</label>
            <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Tell us more..."></textarea>
          </div>
          <Button size="lg" className="w-full">Send Message</Button>
        </form>
      </Card>
    </div>
  </section>
);

export const Footer = () => (
  <footer className="bg-[#0F172A] text-white pt-24 pb-12 px-6">
    <div className="max-w-[1440px] mx-auto">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 pb-20 border-b border-slate-800">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Kredo</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Nairobi's premier licensed digital lending platform. Empowering entrepreneurs through transparent, secure, and fast financial solutions.
          </p>
          <div className="flex gap-4">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 cursor-pointer transition-colors">
                 <div className="w-5 h-5 bg-slate-400 opacity-20"></div>
               </div>
             ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-bold mb-8 text-white uppercase tracking-wider text-sm">Products</h4>
          <ul className="space-y-4 text-slate-400">
            <li><a href="#" className="hover:text-blue-400 transition-colors">Business Growth Loans</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Personal Financing</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Emergency Credits</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Asset Financing</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-8 text-white uppercase tracking-wider text-sm">Company</h4>
          <ul className="space-y-4 text-slate-400">
            <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Office of Data Protection</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-bold mb-8 text-white uppercase tracking-wider text-sm">Legitimacy</h4>
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
             <div className="text-xs text-slate-400 mb-1">Company Reg No.</div>
             <div className="text-sm font-bold">PVT-LRD2024-X492</div>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
             <div className="text-xs text-slate-400 mb-1">CBK Licensed Lender</div>
             <div className="text-sm font-bold">License #KRD-0042-2026</div>
          </div>
        </div>
      </div>
      
      <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-slate-500 text-sm">
          &copy; 2026 Kredo Financial Limited. All rights reserved.
        </div>
        <div className="flex items-center gap-8 grayscale opacity-50">
           <div className="text-xl font-black text-slate-500">M-PESA</div>
           <div className="text-xl font-black text-slate-500">KCB</div>
           <div className="text-xl font-black text-slate-500">VISA</div>
        </div>
        <div className="flex gap-6 text-sm text-slate-400">
           <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500" /> SECURE</span>
           <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-500" /> VERIFIED</span>
        </div>
      </div>
    </div>
  </footer>
);
