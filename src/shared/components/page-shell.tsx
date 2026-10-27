import Link from "next/link";
import type { ReactNode } from "react";
import { inkButtonClass } from "@/shared/components/button-classes";
import { SiteFooter, SiteHeader } from "@/shared/components/site-chrome";

export { DangerButton, GhostButton, InkButton, SubmitControl } from "@/shared/components/action-buttons";
export { dangerButtonClass, ghostButtonClass, inkButtonClass } from "@/shared/components/button-classes";
export { Notice } from "@/shared/components/notice-toast";

const focus =
  "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#f8c544,0_0_0_5px_rgba(248,197,68,0.2)]";

export const chipClass =
  "inline-flex h-10 items-center rounded-full border border-white/10 bg-white/5 px-3.5 text-sm font-medium text-mute";
export const chipActiveClass =
  "inline-flex h-10 items-center rounded-full border border-gold/40 bg-gold/15 px-3.5 text-sm font-semibold text-gold";

export const textLinkClass = `rounded-sm text-sm font-medium text-link ${focus}`;

export const labelClass = "block text-sm font-medium leading-[1.4] tracking-[-0.01em] text-ink";
export const hintClass = "mt-1 block text-[13px] font-medium leading-[1.2] tracking-[-0.01em] text-mute";
export const errorTextClass = "text-sm font-medium text-coral";
export const cardClass =
  "rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.4)] backdrop-blur-md md:p-8";
export const panelClass = `space-y-4 ${cardClass}`;
export const pageTitleClass =
  "font-fancy! text-[clamp(2rem,4vw,2.75rem)] font-bold! leading-[1.1] tracking-normal! text-ink";
export const blockTitleClass = "text-[2rem] leading-[1.13] tracking-[-0.031em] text-ink";

export const fieldClass =
  "mt-2 min-h-12 w-full rounded-[10px] border border-hairline bg-lift px-3.5 text-[15px] leading-[1.3] tracking-[-0.01em] text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-mute/70 focus:border-gold focus:shadow-[0_0_0_3px_rgba(248,197,68,0.15)]";

export function PageShell({
  children,
  active,
  showNav = true,
}: {
  children: ReactNode;
  active?: string;
  showNav?: boolean;
}) {
  return (
    <div className="relative isolate flex min-h-[100dvh] flex-col overflow-x-clip bg-[#010f39]">
      {/* Faded hero art keeps inner pages in the same winter scene as the home page */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[url(/santa/hero.png)] bg-cover bg-center opacity-45 [mask-image:linear-gradient(#000_25%,transparent)]"
      />
      <SiteHeader active={active} showNav={showNav} />
      <main className="mx-auto w-full max-w-[1199px] flex-1 px-4 pt-8 pb-16 md:px-8 md:pt-12">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function MetaLine({ parts }: { parts: Array<string | null | undefined | false> }) {
  const visible = parts.filter((part): part is string => Boolean(part));
  if (visible.length === 0) return null;
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-mute">
      {visible.map((part, index) => (
        <span key={`${part}-${index}`}>{part}</span>
      ))}
    </p>
  );
}

export function InkLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={inkButtonClass}>
      {children}
    </Link>
  );
}
