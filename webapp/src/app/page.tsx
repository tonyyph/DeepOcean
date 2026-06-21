import Navbar from "@/components/ui/Navbar";
import { AISection } from "@/components/sections/AISection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { Footer } from "@/components/sections/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { PremiumSection } from "@/components/sections/PremiumSection";
import { ProblemSolutionSection } from "@/components/sections/ProblemSolutionSection";
import { ScreensPreviewSection } from "@/components/sections/ScreensPreviewSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { WidgetSection } from "@/components/sections/WidgetSection";
import { landingCssVariables } from "@/lib/landingTheme";

export default function Home() {
  return (
    <main className="landing-shell" style={landingCssVariables}>
      <div className="ambient-field" aria-hidden>
        <i /><i /><i /><i /><i /><i />
      </div>
      <Navbar />
      <HeroSection />
      <ProblemSolutionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ScreensPreviewSection />
      <PremiumSection />
      <AISection />
      <WidgetSection />
      <StatsSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
