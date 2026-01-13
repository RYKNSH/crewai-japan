import ParticleBackground from '@/components/landing/ParticleBackground';
import LandingNavbar from '@/components/landing/LandingNavbar';
import HeroSection from '@/components/landing/HeroSection';
import UseCasesSection from '@/components/landing/UseCasesSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import LimitedOfferSection from '@/components/landing/LimitedOfferSection';
import StatsSection from '@/components/landing/StatsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import FinalCTASection from '@/components/landing/FinalCTASection';
import LandingFooter from '@/components/landing/LandingFooter';
import FloatingCTA from '@/components/landing/FloatingCTA';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/30 to-pink-50/50 overflow-x-hidden">
            {/* Three.js Particle Background */}
            <ParticleBackground />

            {/* Navigation */}
            <LandingNavbar />

            {/* Main Content */}
            <main>
                <HeroSection />
                <UseCasesSection />
                <FeaturesSection />
                <HowItWorksSection />
                <LimitedOfferSection />
                <StatsSection />
                <TestimonialsSection />
                <PricingSection />
                <FAQSection />
                <FinalCTASection />
            </main>

            {/* Footer */}
            <LandingFooter />

            {/* Floating CTA - Fixed at bottom */}
            <FloatingCTA />

            {/* Bottom spacer for floating CTA */}
            <div className="h-24" />
        </div>
    );
}
