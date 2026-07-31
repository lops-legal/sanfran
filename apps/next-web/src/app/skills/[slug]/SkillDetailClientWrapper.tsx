"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SkillDetailPage from "../../../components/SkillDetailPage";
import { LegalSkill } from "../../../lib/types";

interface Props {
  skill: LegalSkill;
}

export default function SkillDetailPageClientWrapper({ skill }: Props) {
  const router = useRouter();

  const handleBack = () => {
    router.push("/skills");
  };

  return <SkillDetailPage skill={skill} onBack={handleBack} />;
}
