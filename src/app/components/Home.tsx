import React from 'react';
import {
    Hero,
    LoanDetails,
    Calculator,
    Contact,
    ComplianceStrip,
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
    user?: any;
}

export const Home: React.FC<HomeProps> = ({ user }) => {
    return (
        <div className="flex flex-col animate-fade-in">
            <Hero user={user} />
            <ComplianceStrip />
            <div id="loans">
                <LoanDetails />
            </div>
            <div id="calculator">
                <Calculator />
            </div>
            <BrandTrustBar />
            <EligibilityCheck user={user} />
            <ImpactStories />
            {/* Only show application flow for guests; logged in users apply from dashboard */}
            {!user && (
                <div id="how-it-works">
                    <ApplicationFlow />
                </div>
            )}
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
