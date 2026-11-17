"use client";

import { useEffect, useRef } from "react";

/**
 * Navigation for the cinematic hero.
 *
 *  - Snapping: when scrolling stops inside the pinned story at a point where
 *    no scene is fully showing, glide to the nearest whole scene — favouring
 *    the direction of travel once a quarter of the way into a change.
 *  - The progress rail: its buttons (`data-cine-scene`) jump to their scene.
 *  - Keyboard: ↓ / ↑ (and Page Down / Page Up) step one scene at a time while
 *    the story is on screen; ↓ on the last scene moves on past the story.
 *
 * Outside the story nothing changes. The scene windows mirror the timings in
 * Hero.tsx (`sceneRange`) and the `cine-*` keyframes in globals.css; keep
 * them in step.
 */
export function CineSnap({ scenes, overlap }: { scenes: number; overlap: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = ref.current?.closest<HTMLElement>(".cine-track");
    const stage = track?.querySelector<HTMLElement>(".cine-stage");
    if (!track || !stage) return;

    // Where each scene is fully showing, as fractions of the pinned scroll.
    const width = 1 / scenes;
    const o = overlap / 100;
    const settled = Array.from({ length: scenes }, (_, index) => {
      const start = index === 0 ? 0 : index * width - o;
      const end = index === scenes - 1 ? 1 : (index + 1) * width + o;
      const span = end - start;
      if (index === 0) return { from: 0, to: span * 0.6, rest: 0 };
      if (index === scenes - 1) {
        const from = start + span * 0.4;
        return { from, to: 1, rest: (from + 1) / 2 };
      }
      return { from: start + span * 0.38, to: start + span * 0.62, rest: start + span * 0.5 };
    });

    let lastY = window.scrollY;
    let direction = 0;
    let snapping = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    /** The pinned story's position on the page, or null when it is not playing. */
    const geometry = () => {
      if (getComputedStyle(stage).position !== "sticky") return null;
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
      const start = track.getBoundingClientRect().top + window.scrollY - header;
      const length = track.offsetHeight - stage.offsetHeight;
      if (length <= 0) return null;
      return { start, length, progress: (window.scrollY - start) / length };
    };

    const goTo = (index: number) => {
      const g = geometry();
      if (!g) return;
      snapping = true;
      window.scrollTo({ top: g.start + settled[index].rest * g.length, behavior: "smooth" });
    };

    /** The scene showing at this point (the nearest one while between two). */
    const sceneAt = (progress: number) => {
      let best = 0;
      settled.forEach((scene, index) => {
        const distance = progress < scene.from ? scene.from - progress : progress > scene.to ? progress - scene.to : 0;
        const bestScene = settled[best];
        const bestDistance =
          progress < bestScene.from ? bestScene.from - progress : progress > bestScene.to ? progress - bestScene.to : 0;
        if (distance < bestDistance) best = index;
      });
      return best;
    };

    const settle = () => {
      const g = geometry();
      if (!g || g.progress <= 0 || g.progress >= 1) return;
      const { progress } = g;
      if (settled.some((scene) => progress >= scene.from && progress <= scene.to)) return;

      // Between scene `behind` and scene `ahead`.
      const ahead = settled.findIndex((scene) => scene.from > progress);
      if (ahead <= 0) return;
      const behind = ahead - 1;
      const into = (progress - settled[behind].to) / (settled[ahead].from - settled[behind].to);
      const target =
        direction > 0 ? (into > 0.25 ? ahead : behind) : direction < 0 ? (into < 0.75 ? behind : ahead) : into < 0.5 ? behind : ahead;
      goTo(target);
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (!snapping && y !== lastY) direction = Math.sign(y - lastY);
      lastY = y;
      if (!("onscrollend" in window)) {
        clearTimeout(timer);
        timer = setTimeout(onScrollEnd, 160);
      }
    };

    const onScrollEnd = () => {
      if (snapping) {
        snapping = false;
        return;
      }
      settle();
    };

    // The progress rail.
    const onClick = (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest<HTMLElement>("[data-cine-scene]");
      if (!button || !stage.contains(button)) return;
      const index = Number(button.dataset.cineScene);
      if (Number.isInteger(index) && index >= 0 && index < scenes) goTo(index);
    };

    // Arrow keys and Page Up / Page Down step one scene at a time.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
      const step =
        event.key === "ArrowDown" || event.key === "PageDown" ? 1 : event.key === "ArrowUp" || event.key === "PageUp" ? -1 : 0;
      if (!step) return;
      const active = document.activeElement;
      if (
        active instanceof HTMLElement &&
        (active.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName) || active.closest("[role=dialog]"))
      ) {
        return;
      }
      const g = geometry();
      // Only while the story fills the screen; at either end, scroll the page as usual.
      if (!g || g.progress < -0.05 || g.progress > 1.001) return;
      const next = sceneAt(Math.min(1, Math.max(0, g.progress))) + step;
      if (next < 0) return;
      event.preventDefault();
      if (next >= scenes) {
        // Past the last scene: continue to whatever follows the story.
        snapping = true;
        window.scrollTo({ top: g.start + g.length + stage.offsetHeight, behavior: "smooth" });
        return;
      }
      direction = step;
      goTo(next);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScrollEnd);
    stage.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScrollEnd);
      stage.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      clearTimeout(timer);
    };
  }, [scenes, overlap]);

  return <span ref={ref} hidden />;
}
