"use client";
import { useSyncExternalStore } from "react";
import {
  SHELLS, setShell, setSound, useShell, useSound,
  setMusic, setMusicTrack, setMusicVolume, useMusic, useMusicTrack, useMusicVolume,
} from "../prefs";
import { MUSIC_TRACKS, subscribeMusicStatus, getMusicStatus, getServerMusicStatus } from "../music";
import { playSfx } from "../sfx";
import { BackToMenu } from "./common";

/** 이 사이트의 개정 이력 — 버전마다 컨셉을 통째로 다시 그렸다 */
const REVISIONS = [
  { rev: "5.0", date: "2026.10", desc: "읽기 좋은 단정한 문서형을 기본으로 되돌리고, 이 게임기 버전은 /play 에 그대로 남겼습니다." },
  { rev: "4.0", date: "2026.09", desc: "두 화면 휴대용 게임기 컨셉. 도감·트레이너 카드·타운맵·기술머신으로 다시 구성하고, 도트 캐릭터와 배경음을 더했습니다." },
  { rev: "3.0", date: "2026.09", desc: "브루클린 로프트 — 섹션을 방으로, 프로젝트를 문 너머의 세계로 걸어 들어가는 포트폴리오." },
  { rev: "2.0", date: "2026.09", desc: "도면(drafting sheet) 컨셉으로 재작도. 디자인 시스템 의존을 떼고 프로젝트별 팔레트를 넣었습니다." },
  { rev: "1.0", date: "2026.07", desc: "초판. 자체 디자인 시스템 @usetaehwan/ui의 첫 소비처로 구축 — 웜 뉴트럴 · 문서형 레이아웃." },
];

export function Settings() {
  const sound = useSound(), shell = useShell();
  const music = useMusic(), track = useMusicTrack(), volume = useMusicVolume();
  const status = useSyncExternalStore(subscribeMusicStatus, getMusicStatus, getServerMusicStatus);
  return (
    <section data-scene="settings" className="scene">
      <h2 className="list-title">설정 <span>배경음 · 효과음 · 기기 색</span></h2>
      <fieldset className="settings-group music-settings">
        <legend>배경음</legend>
        <div className="options">
          {[true, false].map(on => (
            <button key={String(on)} type="button" data-nav className="opt"
              aria-label={on ? "배경음 켜기" : "배경음 끄기"} aria-pressed={music === on}
              onClick={() => setMusic(on)}>{on ? "켜기" : "끄기"}</button>
          ))}
        </div>
        <div className="music-tracks" role="group" aria-label="배경음 선택">
          {MUSIC_TRACKS.map(item => (
            <button key={item.id} type="button" data-nav className="music-track"
              aria-label={item.label + " 배경음 선택"} aria-pressed={track === item.id}
              onClick={() => setMusicTrack(item.id)}>
              <span className="music-note" aria-hidden>{track === item.id ? "♪" : "·"}</span>
              <span><strong>{item.label}</strong><small>{item.description}</small></span>
              {track === item.id && <span className="track-selected" aria-hidden>선택</span>}
            </button>
          ))}
        </div>
        <div className="music-volume">
          <label htmlFor="music-volume">음량</label>
          <input id="music-volume" type="range" min="0" max="100" step="5"
            value={volume} aria-label="배경음 음량" aria-valuetext={volume + "%"}
            onChange={event => setMusicVolume(Number(event.target.value))} />
          <output htmlFor="music-volume">{volume}%</output>
        </div>
        <p className="body-kr music-status" role="status">
          {status === "waiting" ? "한 번 터치하거나 키를 누르면 배경음이 재생됩니다."
            : status === "unavailable" ? "이 브라우저에서는 배경음을 재생할 수 없어요."
            : status === "paused" ? "다른 탭을 보는 동안 잠시 쉬고 있어요."
            : music ? MUSIC_TRACKS.find(item => item.id === track)?.label + " 재생 중"
            : "배경음은 꺼져 있어요. 효과음과 따로 설정할 수 있습니다."}
        </p>
      </fieldset>
      <fieldset className="settings-group">
        <legend>효과음</legend>
        <div className="options">
          {[true, false].map(on => (
            <button key={String(on)} type="button" data-nav className="opt"
              aria-label={on ? "효과음 켜기" : "효과음 끄기"} aria-pressed={sound === on}
              onClick={() => { setSound(on); if (on) playSfx("confirm"); }}>{on ? "켜기" : "끄기"}</button>
          ))}
        </div>
        <p className="body-kr">이동·결정·취소를 짧은 소리로 알려 줍니다. <span className="keys-hint">M 키로 전환</span></p>
      </fieldset>
      <fieldset className="settings-group">
        <legend>기기 색</legend>
        <div className="options">
          {SHELLS.map(item => (
            <button key={item.id} type="button" data-nav className="opt" data-shell-swatch={item.id}
              aria-label={item.label + " 기기 색"} aria-pressed={shell === item.id}
              onClick={() => setShell(item.id)}><span className="swatch" aria-hidden />{item.label}</button>
          ))}
        </div>
      </fieldset>
      <fieldset className="settings-group">
        <legend>사이트 버전</legend>
        <div className="options">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" data-nav className="opt">기본 버전으로 ↗</a>
        </div>
        <p className="body-kr">같은 내용을 스크롤 한 번으로 읽는 단정한 버전입니다.</p>
      </fieldset>
      <fieldset className="settings-group">
        <legend>이 사이트의 개정 이력</legend>
        <ol className="revisions">
          {REVISIONS.map((r) => (
            <li key={r.rev}>
              <span className="rev-no">v{r.rev}</span>
              <span className="rev-date">{r.date}</span>
              <p className="body-kr">{r.desc}</p>
            </li>
          ))}
        </ol>
      </fieldset>
      <BackToMenu />
    </section>
  );
}
