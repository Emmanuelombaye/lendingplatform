import React from 'react';
import {
    Hero,
    LoanDetails,
    Calculator,
    Contact,
    Testimonials,
    ComplianceStrip,
    PartnerLogos,
    TrustStats,
    SecurityAssurance,
    OfficePresence,
    FAQ,
    ScamNotice
} from './client';

interface HomeProps {
}

export const Home: React.FC<HomeProps> = () => {
    return (
        <div className="flex flex-col">
            <Hero />
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
    );
};
