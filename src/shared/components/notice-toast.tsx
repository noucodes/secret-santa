"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NOTICE_COOKIE, urlWithoutNotice } from "@/shared/helpers/notice.helpers";

const NOTICE_VISIBLE_MS = 4000;
const NOTICE_EXIT_MS = 220;

export function Notice({ message }: { message?: string }) {
  const [text, setText] = useState(message ?? "");
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const nextUrl = urlWithoutNotice(window.location.href);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      History.prototype.replaceState.call(window.history, window.history.state, "", nextUrl);
    }
  }, []);

  useEffect(() => {
    if (!message) return;
    setText(message);
    setLeaving(false);
    document.cookie = `${NOTICE_COOKIE}=; Max-Age=0; path=/`;
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      hideTimer.current = null;
      setLeaving(true);
    }, NOTICE_VISIBLE_MS);
  }, [message]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => setText(""), NOTICE_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  if (!mounted || !text) return null;

  return createPortal(
    <p
      role="status"
      className={`notice-${leaving ? "out" : "in"} fixed right-4 bottom-4 z-50 w-fit max-w-[min(22rem,calc(100%-2rem))] rounded-xl border border-mint/30 bg-surface px-4 py-3 text-sm leading-snug text-ink shadow-[0_12px_32px_rgba(0,0,0,0.45)]`}
    >
      {text}
    </p>,
    document.body,
  );
}
