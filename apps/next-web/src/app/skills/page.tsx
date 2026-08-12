import Marketplace from "../../components/Marketplace";
import { getCatalogStats, listSkills } from "../../lib/skills-server";

export const metadata = {
  title: "Catálogo de Skills Jurídicas | Sanfran.md",
  description: "Explore centenas de skills jurídicas brasileiras prontas para uso em assistentes de IA via MCP.",
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
