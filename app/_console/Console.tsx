"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useSyncExternalStore } from "react";
import { playSfx } from "./sfx";
import { subscribeMusicStatus, getMusicStatus, getServerMusicStatus } from "./music";
import { nextShell, setSound, soundOn, useSound, useMusic, setMusic, useZoom, toggleZoom } from "./prefs";

export type Btn = "up" | "down" | "left" | "right" | "a" | "b" | "x" | "y" | "start" | "select";

const KEY_OF: Record<string, Btn> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  z: "a",
  Z: "a",
  Enter: "a",
  x: "b",
  X: "b",
  Escape: "b",
  Backspace: "b",
  s: "x",
  S: "x",
  m: "y",
  M: "y",
  c: "select",
  C: "select",
};

/** 아래 화면 커서가 옮겨질 때 — 위 화면 미리보기가 듣는다 */
export const CURSOR_EVENT = "console:cursor";

type Props = {
  /** 위 화면 */
  top: React.ReactNode;
  /** 아래 화면(터치) */
  children: React.ReactNode;
  /** 아래 화면 상단 막대의 현재 위치 */
  label: string;
  /** B — 없으면 backHref 로 이동 */
  onBack?: () => void;
  backHref?: string;
  /** X · START — 없으면 메뉴(/#menu)로 */
  onMenu?: () => void;
  /** 두 화면 위에 덮는 부팅 레이어 */
  bootTop?: React.ReactNode;
  bootBottom?: React.ReactNode;
};

/**
 * 게임기 본체 — 두 화면 휴대용 게임기. 아래 화면의 [data-nav] 요소가 커서 대상이고,
 * 방향키는 커서를 옮기거나(다음 대상이 화면 안에 보일 때) 화면을 굴린다. A 는 커서 대상을 누른다.
 * 아래 화면 커서와 위 화면 미리보기를 연결한다.
 */
export function Console({ top, children, label, onBack, backHref, onMenu, bootTop, bootBottom }: Props) {
  const screen = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLElement | null>(null);
  const led = useRef<HTMLSpanElement>(null);
  const device = useRef<HTMLDivElement>(null);
  const topView = useRef<HTMLDivElement>(null);
  const sound = useSound();
  const music = useMusic();
  const zoom = useZoom();
  const musicStatus = useSyncExternalStore(subscribeMusicStatus, getMusicStatus, getServerMusicStatus);
  const dialogMode = useRef(true);

  const setCursor = useCallback((el: HTMLElement | null, focus = false) => {
    if (cursor.current && cursor.current !== el) cursor.current.removeAttribute("data-cursor");
    const changed = cursor.current !== el;
    cursor.current = el;
    if (!el) return;
    el.setAttribute("data-cursor", "");
    if (focus) el.focus({ preventScroll: true });
    if (changed) window.dispatchEvent(new CustomEvent(CURSOR_EVENT, { detail: el }));
  }, []);

  const navItems = useCallback(
    () => Array.from(screen.current?.querySelectorAll<HTMLElement>("[data-nav]") ?? []).filter((el) => el.getClientRects().length > 0),
    []
  );

  const move = (dir: "up" | "down" | "left" | "right") => {
    dialogMode.current = false;
    const s = screen.current;
    if (!s) return;
    const items = navItems();
    const sr = s.getBoundingClientRect();
    const fwd = dir === "down" || dir === "right";
    const lateral = dir === "left" || dir === "right";
    const cur = cursor.current && items.includes(cursor.current) ? cursor.current : null;
    let next: HTMLElement | undefined;
    if (cur) {

      const cr = cur.getBoundingClientRect();
      const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
      const candidates = items.filter(el => el !== cur).map(el => {
        const r = el.getBoundingClientRect();
        const dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy;
        const forward = dir === "right" ? dx : dir === "left" ? -dx : dir === "down" ? dy : -dy;
        const cross = lateral ? Math.abs(dy) : Math.abs(dx);
        return { el, forward, score: forward + cross * 4 };
      }).filter(it => it.forward > 4).sort((a,b) => a.score - b.score);
      next = candidates[0]?.el;
      if (!next && items.every(el => Math.abs(el.getBoundingClientRect().left - cr.left) < 8))
        next = items[items.indexOf(cur) + (fwd ? 1 : -1)];

    } else {
      const inView = items.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > sr.top && r.top < sr.bottom;
      });
      next = fwd ? inView[0] : inView[inView.length - 1];
    }
    if (next) {
      const r = next.getBoundingClientRect();
      {
        setCursor(next, true);
        next.scrollIntoView({ block: r.height > sr.height ? "start" : "nearest" });
        return;
      }
    }
    if (!lateral) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      s.scrollBy({ top: (fwd ? 1 : -1) * s.clientHeight * 0.6, behavior: reduce ? "auto" : "smooth" });
    }
  };

  /** 소리·불빛·눌림 표시 — 동작과 무관하게 모든 입력에 붙는 손맛 */
  const feedback = (b: Btn) => {
    if (b === "y") {
      const on = !soundOn();
      setSound(on);
      if (on) playSfx("confirm");
    } else if (soundOn()) {
      playSfx(["up", "down", "left", "right"].includes(b) ? "move" : b === "b" ? "cancel" : "confirm");
    }
    const l = led.current;
    if (l) {
      l.removeAttribute("data-hit");
      void l.offsetWidth;
      l.setAttribute("data-hit", "");
    }
    const el = device.current?.querySelector<HTMLElement>(`[data-btn="${b}"]`);
    if (el) {
      el.setAttribute("data-pressed", "");
      window.setTimeout(() => el.removeAttribute("data-pressed"), 110);
    }
  };

  const act = (b: Btn) => {
    switch (b) {
      case "up":
      case "down":
      case "left":
      case "right":
        move(b);
        break;
      case "a":
        if (location.pathname === "/" && (!location.hash || location.hash === "#menu") && (dialogMode.current || document.activeElement?.matches(".greeting"))) window.dispatchEvent(new Event("console:dialog"));
        else cursor.current?.click();
        break;
      case "b":
        if (onBack) onBack();
        else if (backHref) window.location.href = backHref;
        break;
      case "x":
      case "start":
        if (onMenu) onMenu();
        else window.location.href = "/#menu";
        break;
      case "select":
        nextShell();
        break;
      case "y":
        break;
    }
  };

  const press = (b: Btn) => {
    if (!document.documentElement.dataset.booted) { document.documentElement.dataset.booted = "1"; return; }
    feedback(b);
    act(b);
  };

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.repeat && !e.key.startsWith("Arrow")) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest("input, textarea, select, [contenteditable='true']")) return;
    if (e.key === "f" || e.key === "F") { e.preventDefault(); toggleZoom(); return; }
    const b = KEY_OF[e.key];
    if (!b) return;
    if (!document.documentElement.dataset.booted) { e.preventDefault(); document.documentElement.dataset.booted = "1"; return; }
    // 링크·버튼에 포커스가 있으면 Enter 는 브라우저가 누른다 — 손맛만 준다
    if (e.key === "Enter" && t?.closest("a, button, summary")) {
      feedback("a");
      return;
    }
    e.preventDefault();
    press(b);
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // 위 화면은 스크롤하지 않는다 — 내용이 넘치면 화면 높이에 맞게 비례로 줄인다(최소 0.6배)
  useEffect(() => {
    const tv = topView.current;
    if (!tv) return;
    let raf = 0;
    const fit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const kids = (Array.from(tv.children) as HTMLElement[]).filter((el) => el.getClientRects().length > 0);
        kids.forEach((el) => { el.style.transform = ""; });
        const natural = tv.scrollHeight;
        const avail = tv.clientHeight;
        const scale = natural > avail + 1 ? Math.max(0.6, avail / natural) : 1;
        kids.forEach((el) => {
          el.style.transformOrigin = "top center";
          el.style.transform = scale < 1 ? `scale(${scale})` : "";
        });
      });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(tv);
    const mo = new MutationObserver(fit);
    mo.observe(tv, { subtree: true, childList: true, characterData: true });
    window.addEventListener(CURSOR_EVENT, fit);
    window.addEventListener("hashchange", fit);
    document.fonts?.ready.then(fit);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener(CURSOR_EVENT, fit);
      window.removeEventListener("hashchange", fit);
    };
  }, []);

  // 첫 화면·장면 전환 — 맨 위로, 커서는 화면 안에 보이는 기본 대상에
  useEffect(() => {
    const init = (event?: Event) =>
      requestAnimationFrame(() => {
        if (event) dialogMode.current = false;
        const s = screen.current;
        if (!s) return;
        s.scrollTop = 0;
        const sr = s.getBoundingClientRect();
        const items = navItems().filter((el) => el.getBoundingClientRect().top < sr.bottom);
        setCursor(items.find((el) => el.hasAttribute("data-nav-default")) ?? items[0] ?? null);
      });
    init();
    window.addEventListener("hashchange", init);
    return () => window.removeEventListener("hashchange", init);
  }, [navItems, setCursor]);

  const onPointerOver = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-nav]");
    if (el) { dialogMode.current = false; setCursor(el); }
  };
  const onFocus = (e: React.FocusEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-nav]");
    if (el) { dialogMode.current = false; setCursor(el); }
  };

  const btn = (b: Btn) => ({
    "data-btn": b,
    type: "button" as const,
    onClick: () => press(b),
    // 마우스로 눌러도 포커스는 화면 안에 남긴다
    onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
  });

  return (
    <main className="stage">
      <div ref={device} className="device">
        {/* 윗판 — 위 화면과 양옆 스피커 */}
        <div className="lid">
          <div className="speaker speaker-l" aria-hidden />
          <div className="screen-frame">
            <div className="screen screen-top">
              <div ref={topView} className="top-view">{top}</div>
              {bootTop}
            </div>
          </div>
          <div className="speaker speaker-r" aria-hidden />
          <div className="lid-brand" aria-hidden>
            <span className="brand-name">useTaehwan()</span>

          </div>
        </div>

        {/* 경첩 — 전원 불빛 */}
        <div className="hinge" aria-hidden>
          <span className="hinge-knuckle" />
          <span className="hinge-led">
            <span ref={led} className="led" />
            <span className="led-label">POWER</span>
          </span>
        </div>

        {/* 아랫판 — 터치 화면과 버튼 */}
        <div className="base">
          <div className="dpad" role="group" aria-label="방향 버튼">
            <button {...btn("up")} className="dpad-up" aria-label="위 (↑)" />
            <button {...btn("left")} className="dpad-left" aria-label="왼쪽 (←)" />
            <span className="dpad-mid" aria-hidden />
            <button {...btn("right")} className="dpad-right" aria-label="오른쪽 (→)" />
            <button {...btn("down")} className="dpad-down" aria-label="아래 (↓)" />
          </div>

          <div className="screen-frame screen-frame-bot">
            <div className="screen screen-bot">
              <div className="bot-bar">
                <span className="truncate">▶ {label}</span>
                <div className="bot-audio">
                  <button type="button" onClick={toggleZoom} className="bot-sound bot-zoom" aria-pressed={zoom}
                    aria-label={zoom ? "게임기 모습으로 돌아가기 (F)" : "화면 크게 보기 (F)"}>
                    {zoom ? "기기로" : "크게"}
                  </button>
                  <button type="button" onClick={() => setMusic(!music)} className="bot-sound bot-music"
                    aria-pressed={music} aria-label={music ? "배경음 끄기" : "배경음 켜기"}
                    data-playing={musicStatus === "playing"}>
                    BGM {music ? (musicStatus === "waiting" ? "대기" : "켜짐") : "꺼짐"}
                  </button>
                  <button type="button" onClick={() => feedback("y")} className="bot-sound"
                    aria-pressed={sound} aria-label={sound ? "효과음 끄기" : "효과음 켜기"}>
                    효과음 {sound ? "켜짐" : "꺼짐"}
                  </button>
                </div>
              </div>
              <div ref={screen} className="bot-scroll" tabIndex={-1} onPointerOver={onPointerOver} onFocus={onFocus} onClick={(e) => { if (e.detail > 0 && (e.target as HTMLElement).closest("[data-nav]")) feedback("a"); }}>
                {children}
              </div>
              {bootBottom}
            </div>
          </div>

          <div className="abxy" role="group" aria-label="A B X Y 버튼">
            <button {...btn("x")} className="face face-x" aria-label="X 메뉴 (S)">
              X
            </button>
            <button {...btn("y")} className="face face-y" aria-label="Y 효과음 켜고 끄기 (M)">
              Y
            </button>
            <button {...btn("a")} className="face face-a" aria-label="A 결정 (Z)">
              A
            </button>
            <button {...btn("b")} className="face face-b" aria-label="B 뒤로 (X)">
              B
            </button>
          </div>

          <div className="ss" role="group" aria-label="START SELECT">
            <div>
              <button {...btn("start")} className="pill" aria-label="START 메뉴" />
              <span className="key-label">START</span>
            </div>
            <div>
              <button {...btn("select")} className="pill" aria-label="SELECT 기기 색 바꾸기 (C)" />
              <span className="key-label">SELECT</span>
            </div>
          </div>

          <span className="mic" aria-hidden />
        </div>
      </div>
    </main>
  );
}
