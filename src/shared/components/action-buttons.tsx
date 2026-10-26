"use client";

import { CircleNotchIcon } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

const focus =
  "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#f8c544,0_0_0_5px_rgba(248,197,68,0.2)]";

const press =
  "inline-flex h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-semibold leading-none tracking-[-0.01em] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

export const inkButtonClass = `${press} bg-gold text-[#2a1a00] shadow-[0_8px_24px_rgba(248,197,68,0.25)] hover:bg-[#ffd25e] ${focus}`;
export const ghostButtonClass = `${press} border border-white/15 bg-white/5 text-ink hover:bg-white/10 ${focus}`;
export const dangerButtonClass = `${press} border border-coral/30 bg-coral/10 text-coral hover:bg-coral/20 ${focus}`;

function Spinner({ size }: { size: number }) {
  return <CircleNotchIcon size={size} weight="bold" className="shrink-0 motion-safe:animate-spin" aria-hidden />;
}

type ActionButtonProps = {
  children: ReactNode;
  type?: "submit" | "button";
  disabled?: boolean;
  onClick?: () => void;
};

function ActionButton({ children, type = "submit", disabled, onClick, className }: ActionButtonProps & { className: string }) {
  const { pending } = useFormStatus();
  const busy = type === "submit" && pending;
  return (
    <button type={type} disabled={disabled || busy} onClick={onClick} className={className} aria-busy={busy}>
      {busy ? <Spinner size={16} /> : null}
      {children}
    </button>
  );
}

export function InkButton(props: ActionButtonProps) {
  return <ActionButton {...props} className={inkButtonClass} />;
}

export function GhostButton(props: ActionButtonProps) {
  return <ActionButton {...props} className={ghostButtonClass} />;
}

export function DangerButton(props: ActionButtonProps) {
  return <ActionButton {...props} className={dangerButtonClass} />;
}

export function SubmitControl({
  children,
  className,
  ariaLabel,
  replace = false,
}: {
  children: ReactNode;
  className: string;
  ariaLabel?: string;
  replace?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      disabled={pending}
      aria-busy={pending}
      aria-label={ariaLabel}
    >
      {pending ? <Spinner size={replace ? 20 : 16} /> : null}
      {pending && replace ? null : children}
    </button>
  );
}
