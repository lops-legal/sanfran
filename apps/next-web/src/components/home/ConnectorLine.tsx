"use client";

import React from "react";
import { useInView } from "../../hooks/useInView";

export function ConnectorLine() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <div ref={ref} className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%]">
      <div
        style={{ 
          width: inView ? "100%" : "0%", 
          transition: "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)", 
          transitionDelay: "300ms" 
        }}
        className="connector-line-horizontal"
      />
    </div>
  );
}
