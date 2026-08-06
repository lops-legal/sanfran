import React from "react";
import { HeroSection } from "../components/home/HeroSection";
import { HowItWorksSection } from "../components/home/HowItWorksSection";
import { HowToPlugSection } from "../components/home/HowToPlugSection";
import { WhyUseSkillsSection } from "../components/home/WhyUseSkillsSection";
import { FeaturedSkillsSection } from "../components/home/FeaturedSkillsSection";
import { WhyUseOurMCPSection } from "../components/home/WhyUseOurMCPSection";
import { FinalCTASection } from "../components/home/FinalCTASection";
import { ScrollProgressBar } from "../components/home/ScrollProgressBar";

// Import cinematic styles
import "../styles/home-cinematic.css";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <ScrollProgressBar />
      <HeroSection />

      {/* Section Dividers */}
      <div className="section-divider" />
      <WhyUseSkillsSection />

      <div className="section-divider" />
      <HowItWorksSection />

      <div className="section-divider" />
      <HowToPlugSection />

      <div className="section-divider" />
      <FeaturedSkillsSection />

      <div className="section-divider" />
      <WhyUseOurMCPSection />

      <div className="section-divider" />
      <FinalCTASection />
    </div>
  );
}