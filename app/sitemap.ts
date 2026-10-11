import type { MetadataRoute } from "next";
import { PROJECTS } from "./_data/projects";
import { TALKS } from "./_data/talks";
import { PRACTICES } from "./_data/ai-practices";

const BASE = "https://usetaehwan.page";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/play`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    ...PROJECTS.filter((p) => p.detail).map((p) => ({
      url: `${BASE}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...PRACTICES.map((d) => ({
      url: `${BASE}/ai/${d.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...TALKS.map((t) => ({
      url: `${BASE}/talks/${t.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
