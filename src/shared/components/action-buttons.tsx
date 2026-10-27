"use client";

import { CircleNotchIcon } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { dangerButtonClass, ghostButtonClass, inkButtonClass } from "@/shared/components/button-classes";

export { dangerButtonClass, ghostButtonClass, inkButtonClass };

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
