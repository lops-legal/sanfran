import { getSkillBySlug } from "../../../lib/skills-server";
import { notFound } from "next/navigation";
import SkillDetailPageClientWrapper from "./SkillDetailClientWrapper";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);
  
  if (!skill) return { title: "Skill não encontrada" };

  return {
    title: `${skill.name} | Sanfran.md`,
    description: skill.description,
  };
}

export default async function SkillPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  return <SkillDetailPageClientWrapper skill={skill} />;
}

