// Dynamic Meta Data Generator
// Updates HTML meta tags with real-time data from backend settings

class DynamicMetaUpdater {
    constructor() {
        this.settings = null;
        this.init();
    }

    async init() {
        try {
            // Fetch settings from API
            const response = await fetch('/api/public/settings');
            if (response.ok) {
                const data = await response.json();
                this.settings = data.data;
                this.updateMetaTags();
            }
        } catch (error) {
            console.log('Using fallback meta data');
            this.updateMetaTagsWithFallback();
        }
    }

    updateMetaTags() {
        if (!this.settings) return;

        // Update description
        const description = `GETVERTEX Loans - Fast & Secure Business Financing. Get KES ${this.numberToK(this.settings.minLoan)}-${this.numberToK(this.settings.maxLoan)} loans with transparent terms and quick approval.`;
        
        // Update keywords
        const keywords = `business loans Kenya, personal loans, GETVERTEX, fast approval, transparent lending, KES ${this.numberToK(this.settings.minLoan)} loans, KES ${this.numberToK(this.settings.maxLoan)} loans`;

        // Update meta tags
        this.updateMetaTag('description', description);
        this.updateMetaTag('keywords', keywords);

        // Update Open Graph tags for social sharing
        this.updateMetaProperty('og:description', description);
        this.updateMetaProperty('og:title', 'GETVERTEX Loans - Fast Business Financing');
        this.updateMetaProperty('og:type', 'website');
        this.updateMetaProperty('og:site_name', 'Vertex Loans');

        // Update Twitter Card
        this.updateMetaName('twitter:description', description);
        this.updateMetaName('twitter:title', 'GETVERTEX Loans - Fast Business Financing');
        this.updateMetaName('twitter:card', 'summary_large_image');
    }

    updateMetaTagsWithFallback() {
        const description = 'GETVERTEX Loans - Fast & Secure Business Financing. Get KES 5k-1M loans with transparent terms and quick approval.';
        const keywords = 'business loans Kenya, personal loans, GETVERTEX, fast approval, transparent lending, KES 5k loans, KES 1M loans';

        this.updateMetaTag('description', description);
        this.updateMetaTag('keywords', keywords);
        this.updateMetaProperty('og:description', description);
        this.updateMetaName('twitter:description', description);
    }

    updateMetaTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (meta) {
            meta.content = content;
        } else {
            meta = document.createElement('meta');
            meta.name = name;
            meta.content = content;
            document.head.appendChild(meta);
        }
    }

    updateMetaProperty(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (meta) {
            meta.content = content;
        } else {
            meta = document.createElement('meta');
            meta.property = property;
            meta.content = content;
            document.head.appendChild(meta);
        }
    }

    updateMetaName(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (meta) {
            meta.content = content;
        } else {
            meta = document.createElement('meta');
            meta.name = name;
            meta.content = content;
            document.head.appendChild(meta);
        }
    }

    numberToK(num) {
        const number = Number(num);
        if (number >= 1000000) {
            return `${(number / 1000000).toFixed(1)}M`;
        } else if (number >= 1000) {
            return `${(number / 1000).toFixed(0)}k`;
        }
        return number.toString();
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DynamicMetaUpdater();
});

// Export for manual usage
window.DynamicMetaUpdater = DynamicMetaUpdater;
