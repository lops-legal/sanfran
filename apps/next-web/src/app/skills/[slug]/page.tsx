import { fetchSkillBySlug } from "../../../lib/api";
import { notFound } from "next/navigation";
import SkillDetailPageClientWrapper from "./SkillDetailClientWrapper";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const skill = await fetchSkillBySlug(slug);
  
  if (!skill) return { title: "Skill não encontrada" };

  return {
    title: `${skill.name} | Sanfran.md`,
    description: skill.description,
  };
}

export default async function SkillPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const skill = await fetchSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  return <SkillDetailPageClientWrapper skill={skill} />;
}
