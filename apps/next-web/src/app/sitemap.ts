import type { MetadataRoute } from "next";
import { REPO_SKILLS } from "../lib/catalog";
import { SITE_URL } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/skills", "/integrate", "/docs"].map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const }));
  const skills = REPO_SKILLS.map((s) => ({ url: `${SITE_URL}/skills/${s.slug}`, lastModified: s.updatedAt, changeFrequency: "monthly" as const }));
  return [...pages, ...skills];
}
