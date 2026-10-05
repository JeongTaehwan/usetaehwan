/** scripts/dashboard-sync.mjs 가 만드는 파일의 모양 */

export type UsageRow = { name: string; count: number; last: string };

export type DashboardPublic = {
  generated: string;
  days: number | null;
  repo: string;
  usage: {
    source: "hook" | "transcripts" | "none" | "demo";
    skills: UsageRow[];
    agents: UsageRow[];
    otherCount: number;
    unused: string[];
    daily: [string, number][];
  };
  candidates: { groups: number; requests: number };
  budget: {
    skills: { name: string; desc: number; body: number }[];
    agents: { name: string; model: string; desc: number }[];
    memory: number;
    limits: { desc: number; desc_total: number; body: number; agent_desc: number; memory: number };
  };
  profiles: {
    models: Record<string, { profile?: string; evaluated?: string; note?: string }>;
    profiles: { name: string; description: string; skills: number | "all"; agents: number | "all" }[];
    evals: string[];
  };
  ontology: {
    concepts: number;
    references: number;
    relations: Record<string, number>;
    topConcepts: { label: string; domain: string; count: number }[];
    domains: { label: string; count: number }[];
    crossDomain: { pair: string[]; count: number }[];
  } | null;
};

export type Candidate = {
  count: number;
  sessions: number;
  keywords: string[];
  examples: [string, string][];
};

export type DashboardPrivate = {
  generated: string;
  days: number | null;
  candidates: Candidate[];
  otherUsage: { skills: UsageRow[]; agents: UsageRow[] };
};

/** public/dashboard-owner.enc.json — data 는 암호문 뒤에 16바이트 태그를 붙인 base64 */
export type EncryptedFile =
  | { v: 2; status: "empty" }
  | { v: 2; alg: "A256GCM"; generated: string; iv: string; data: string };
