import Marketplace from "../../components/Marketplace";
import { getCatalogStats, listSkills } from "../../lib/skills-server";

export const metadata = {
  title: "Skills jurídicas",
  description: "Skills jurídicas brasileiras para usar no Claude, ChatGPT, Grok ou Manus: prazos, contratos, LGPD, contencioso e gestão jurídica.",
};

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q = "", sort = "stars" } = await searchParams;
  
  // Busca inicial no servidor para renderização instantânea
  const [initialStats, initialData] = await Promise.all([
    getCatalogStats(),
    listSkills({ 
      search: q, 
      sortBy: sort as any, 
      pageSize: 12 
    })
  ]);

  return (
    <Marketplace 
      initialStats={initialStats}
      initialData={initialData}
      initialQuery={q}
      initialSort={sort}
    />
  );
}
