"use client";

import Marketplace from "../../components/Marketplace";
import { useRouter } from "next/navigation";
import { LegalSkill } from "../../lib/types";

export default function SkillsPage() {
  const router = useRouter();

  const handleSelectSkill = (skill: LegalSkill) => {
    router.push(`/skills/${skill.slug}`);
  };

  return <Marketplace onSelectSkill={handleSelectSkill} />;
}
