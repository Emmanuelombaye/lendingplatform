// Scroll Animation Utilities
// Add smooth scroll animations and interactions to the frontend

export class ScrollAnimator {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollProgress();
        this.setupScrollIndicators();
        this.setupIntersectionObserver();
        this.setupParallax();
    }

    // Scroll progress bar
    setupScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = `${scrollPercent}%`;
        });
    }

    // Enhanced scroll indicators
    setupScrollIndicators() {
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        document.body.appendChild(indicator);

        let scrollTimeout;
        window.addEventListener('scroll', () => {
            indicator.classList.add('active');
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                indicator.classList.remove('active');
            }, 150);
        });
    }

    // Intersection Observer for scroll animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements with scroll animation classes
        document.querySelectorAll('.scroll-reveal, .scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in').forEach(el => {
            observer.observe(el);
        });
    }

    // Animate individual elements
    animateElement(element) {
        // Remove existing animation classes to prevent re-animation
        element.classList.remove('scroll-reveal', 'scroll-fade-in', 'scroll-slide-left', 'scroll-slide-right', 'scroll-scale-in');
        
        // Add appropriate animation based on element position
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementCenter = rect.top + rect.height / 2;
        
        if (elementCenter < viewportHeight * 0.3) {
            element.classList.add('slide-left');
        } else if (elementCenter > viewportHeight * 0.7) {
            element.classList.add('slide-right');
        } else {
            element.classList.add('fade-in');
        }
    }

    // Parallax effects
    setupParallax() {
        const parallaxElements = document.querySelectorAll('.parallax-slow, .parallax-medium, .parallax-fast');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.classList.contains('parallax-slow') ? 0.5 :
                              element.classList.contains('parallax-medium') ? 0.3 : 0.2;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // Smooth scroll to element
    static scrollToElement(element, duration = 800) {
        const targetY = element.offsetTop - 80; // Account for fixed header
        
        const startY = window.pageYOffset;
        const distance = targetY - startY;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startY, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        const easeInOutQuad = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };

        requestAnimationFrame(animation);
    }

    // Add scroll classes to elements
    static addScrollClasses() {
        const elements = document.querySelectorAll('.card, .stats-card, .loan-progress, .transaction-item');
        elements.forEach((element, index) => {
            element.classList.add('scroll-reveal');
            element.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Initialize on DOM load
    static init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => new ScrollAnimator());
        } else {
            new ScrollAnimator();
        }
    }
}

// Auto-initialize
ScrollAnimator.init();

// Export for use in components
window.ScrollAnimator = ScrollAnimator;
