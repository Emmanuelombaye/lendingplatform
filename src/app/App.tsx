import React, { useState, useEffect } from 'react';
import '../styles/index.css';
import { 
  Navbar, 
  Hero, 
  LoanDetails, 
  Calculator, 
  Contact, 
  Footer,
  Testimonials,
  ComplianceStrip,
  PartnerLogos,
  TrustStats,
  SecurityAssurance,
  OfficePresence,
  FAQ,
  ScamNotice,
  ProgressTracker,
  ApplicationFlow
} from './components/client';
import { 
  AdminSidebar, 
  AdminHeader, 
  DashboardOverview, 
  ApplicationManagement,
  Reports,
  SettingsPage,
  PlaceholderView
} from './components/admin';

const App: React.FC = () => {
  const [view, setView] = useState('home'); 
  const [adminTab, setAdminTab] = useState('dashboard');

  useEffect(() => {
    if (['loans', 'calculator', 'how-it-works', 'contact'].includes(view)) {
      const element = document.getElementById(view);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [view]);

  if (view === 'admin') {
    return (
      <div className="bg-slate-50 min-h-screen flex">
        <AdminSidebar activeTab={adminTab} setActiveTab={setAdminTab} />
        <main className="flex-1 ml-72">
          <AdminHeader 
            title={adminTab.charAt(0).toUpperCase() + adminTab.slice(1).replace('-', ' ')} 
            onNavigate={setView}
          />
          <div className="p-4">
            {adminTab === 'dashboard' && <DashboardOverview />}
            {adminTab === 'applications' && <ApplicationManagement />}
            {adminTab === 'reports' && <Reports />}
            {adminTab === 'settings' && <SettingsPage />}
            {!['dashboard', 'applications', 'reports', 'settings'].includes(adminTab) && (
              <PlaceholderView title={adminTab.charAt(0).toUpperCase() + adminTab.slice(1).replace('-', ' ')} />
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <Navbar currentView={view} onNavigate={(v) => setView(v)} />
      
      <main>
        {(view === 'home' || ['loans', 'calculator', 'how-it-works', 'contact'].includes(view)) && (
          <div className="flex flex-col">
            <Hero onNavigate={setView} />
            <ComplianceStrip />
            <PartnerLogos />
            <div id="loans">
              <LoanDetails />
            </div>
            <div id="calculator">
              <Calculator />
            </div>
            <Testimonials />
            <TrustStats />
            <SecurityAssurance />
            <div id="how-it-works">
               <div className="py-24 px-6 bg-[#0F172A] text-white">
                  <div className="max-w-[1440px] mx-auto">
                    <div className="text-center mb-16">
                      <h2 className="text-4xl font-bold">How It Works</h2>
                      <p className="text-slate-400 mt-4">Five simple steps to secure your funding.</p>
                    </div>
                    <div className="grid md:grid-cols-5 gap-8">
                       {[
                         { step: "1", title: "Download Forms", desc: "Get all required PDF forms from our portal." },
                         { step: "2", title: "Fill & Sign", desc: "Complete the documents manually." },
                         { step: "3", title: "Upload Docs", desc: "Submit scanned copies to our platform." },
                         { step: "4", title: "Approval", desc: "Fast verification by our credit team." },
                         { step: "5", title: "Disbursement", desc: "Funds sent within 24hrs of fee payment." }
                       ].map((item, i) => (
                         <div key={i} className="relative group">
                            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl font-bold text-blue-400 mb-6 transition-all">
                               {item.step}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            </div>
            <OfficePresence />
            <FAQ />
            <ScamNotice />
            <div id="contact">
              <Contact />
            </div>
          </div>
        )}

        {view === 'apply' && (
          <div className="pt-24 pb-20 px-6 bg-slate-50 min-h-screen">
            <div className="max-w-[1200px] mx-auto">
              <ProgressTracker currentStep={1} />
              <ApplicationFlow />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
