import {
  LandingHeader,
  HeroSection,
  ProblemSection,
  BenefitsSection,
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
  CustomerProfilesSection,
  PricingSection,
  FAQSection,
  CTASection,
  LandingFooter,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <HeroSection />
      <ProblemSection />
      <BenefitsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CustomerProfilesSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
