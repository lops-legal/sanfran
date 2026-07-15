import React from "react";
import { HeroSection } from "../components/home/HeroSection";
import { HowItWorksSection } from "../components/home/HowItWorksSection";
import { FeaturedSkillsSection } from "../components/home/FeaturedSkillsSection";
import { TransitionQuote } from "../components/home/TransitionQuote";
import { TrustSection } from "../components/home/TrustSection";
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
      <HowItWorksSection />

      <div className="section-divider" />
      <FeaturedSkillsSection />

      <div className="section-divider" />
      <TransitionQuote />

      <div className="section-divider" />
      <TrustSection />

      <div className="section-divider" />
      <FinalCTASection />
    </div>
  );
}