"use client";
import { useEffect } from "react";
import { mountMusic } from "./music";

export function MusicPlayer() {
  useEffect(() => mountMusic(), []);
  return null;
}
