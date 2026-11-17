"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns `false` during server rendering and the first client render, then
 * `true`.
 *
 * Used to gate browser-only behaviour (reading localStorage, portalling to
 * `document.body`) without setting state inside an effect.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
