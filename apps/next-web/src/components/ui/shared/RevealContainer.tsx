"use client";

import React from "react";
import { useInView } from "../../../hooks/useInView";

interface RevealContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
}

export function RevealContainer({ children, className = "", delay = 0, threshold = 0.1 }: RevealContainerProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold });
  
  const revealStyle = {
    transitionDelay: `${delay}ms`,
  };

  return (
    <div 
      ref={ref} 
      style={revealStyle}
      className={`${className} transition-all duration-1000 transform ${inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
    >
      {children}
    </div>
  );
}
