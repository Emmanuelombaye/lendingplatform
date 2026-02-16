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
    ScamNotice,
    EligibilityCheck,
    BrandTrustBar,
    ImpactStories,
    SecurityGrid,
    ApplicationFlow
} from './client';

interface HomeProps {
}

export const Home: React.FC<HomeProps> = () => {
    return (
        <div className="flex flex-col animate-fade-in">
            <Hero />
            <ComplianceStrip />
            <div id="loans">
                <LoanDetails />
            </div>
            <div id="calculator">
                <Calculator />
            </div>
            <BrandTrustBar />
            <EligibilityCheck />
            <ImpactStories />
            <div id="how-it-works">
                <ApplicationFlow />
            </div>
            <SecurityGrid />
            <OfficePresence />
            <FAQ />
            <ScamNotice />
            <div id="contact">
                <Contact />
            </div>
        </div>
    );
};
