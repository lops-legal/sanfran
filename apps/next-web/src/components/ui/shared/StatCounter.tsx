"use client";

import React from "react";
import { useCountUp } from "../../../hooks/useCountUp";

interface StatCounterProps {
  end: number;
  duration?: number;
}

export function StatCounter({ end, duration = 2500 }: StatCounterProps) {
  const { ref, count } = useCountUp({ end, duration });
  return <span ref={ref}>{count}</span>;
}
