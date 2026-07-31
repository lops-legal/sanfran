import { HeroSection } from "../components/home/HeroSection";
import { HowItWorksSection } from "../components/home/HowItWorksSection";
import { FeaturedSkillsSection } from "../components/home/FeaturedSkillsSection";
import { WhyUseOurMCPSection } from "../components/home/WhyUseOurMCPSection";
import { WhyUseSkillsSection } from "../components/home/WhyUseSkillsSection";
import { TrustSection } from "../components/home/TrustSection";
import { FinalCTASection } from "../components/home/FinalCTASection";
import { ScrollProgressBar } from "../components/ScrollProgressBar";

export default function Home() {
  return (
    <>
      <ScrollProgressBar />
      <HeroSection />
      <FeaturedSkillsSection />
      <HowItWorksSection />
      <WhyUseSkillsSection />
      <WhyUseOurMCPSection />
      <TrustSection />
      <FinalCTASection />
      
      <footer className="bg-white border-t border-[#E0D8D0] py-12">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-[#8B7D6B]">
            © {new Date().getFullYear()} Sanfran.md. Uma iniciativa open-source para a comunidade jurídica.
          </p>
        </div>
      </footer>
    </>
  );
}
