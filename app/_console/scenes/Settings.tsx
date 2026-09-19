"use client";
import { useSyncExternalStore } from "react";
import {
  SHELLS, setShell, setSound, useShell, useSound,
  setMusic, setMusicTrack, setMusicVolume, useMusic, useMusicTrack, useMusicVolume,
} from "../prefs";
import { MUSIC_TRACKS, subscribeMusicStatus, getMusicStatus, getServerMusicStatus } from "../music";
import { playSfx } from "../sfx";
import { BackToMenu } from "./common";

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
      <BackToMenu />
    </section>
  );
}
