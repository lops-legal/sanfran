import { createClient } from "@supabase/supabase-js";
import { MOCK_SKILLS } from "../src/data.js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log("Seeding Supabase DB with mock skills...");
  
  const mappedSkills = MOCK_SKILLS.map(skill => ({
    slug: skill.id,
    name: skill.name,
    description: skill.description,
    markdown_body: skill.markdownContent,
    version: skill.version,
    is_published: true,
    is_draft: false,
    owner_avatar: skill.ownerAvatar,
    vertical: skill.vertical,
    tags: skill.tags,
    quality_score: skill.qualityScore,
    regulatory_score: skill.regulatoryScore,
    compliance_checked: skill.complianceChecked,
    stars_count: skill.starsCount,
    downloads_count: 0,
    review_count: skill.reviewCount,
    rating: skill.rating,
  }));

  for (const skill of mappedSkills) {
    const { error } = await supabase.from('skills').upsert(skill, { onConflict: 'slug' });
    if (error) {
      console.error(`Failed to seed skill ${skill.slug}:`, error.message);
    } else {
      console.log(`✅ Seeded ${skill.slug}`);
    }
  }
  
  console.log("Refreshing materialized views...");
  // Use RPC if we had it, but anon key can't run REFRESH MATERIALIZED VIEW usually.
  // Actually, we can't run arbitrary SQL with the anon key via the JS client.
  // We will tell the user they might need to run the refresh command manually in the SQL editor,
  // OR the views might be empty until they do. Wait, in supabase_setup.sql, I added the REFRESH commands at the bottom!
  // So the views currently have count = 0 since the tables were empty.
  console.log("Done! Be sure to run 'REFRESH MATERIALIZED VIEW catalog_stats;' in the SQL editor if stats are 0.");
}

seed();
