import type { SpriteName } from "../Pixel";

export const SCENE_IDS = ["menu", "dex", "trainer", "map", "notes", "caster", "link", "settings"] as const;
export type SceneId = (typeof SCENE_IDS)[number];

export const SCENE_LABEL: Record<SceneId, string> = {
  menu: "메뉴",
  dex: "도감 · 프로젝트",
  trainer: "트레이너 카드 · 소개",
  map: "타운맵 · 경력",
  notes: "기술머신 · AI 노트",
  caster: "라이브캐스터 · 발표",
  link: "통신 · 연락",
  settings: "설정",
};

/** v3 로프트의 앵커 → v4 장면 (예전 링크가 깨지지 않게) */
export const LEGACY_HASH: Record<string, SceneId> = {
  top: "menu",
  league: "map",
  setlist: "caster",
  projects: "dex",
  about: "trainer",
  experience: "map",
  skyline: "map",
  ai: "notes",
  talks: "caster",
  contact: "link",
};

export function toScene(hash: string): SceneId {
  const h = hash.replace(/^#/, "");
  return (SCENE_IDS as readonly string[]).includes(h) ? (h as SceneId) : LEGACY_HASH[h] ?? "menu";
}

export const PROJECT_SPRITE: Record<string, SpriteName> = {
  "usetaehwan-ui": "blocks",
  gak: "ball",
  orbit: "planet",
  oneureodi: "pin",
  kkini: "bowl",
};

export const EMAIL = "kt26625417@gmail.com";
export const GITHUB_URL = "https://github.com/JeongTaehwan";
export const GMAIL_COMPOSE = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${encodeURIComponent("usetaehwan.page 문의")}`;

/** 장면 끝의 되돌아가기 — B 버튼과 같은 일 */
export function BackToMenu() {
  return (
    <a href="#menu" data-nav className="back-row">
      <span>◀ 메뉴로</span>
      <kbd>B</kbd>
    </a>
  );
}
