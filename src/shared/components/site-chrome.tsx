import Link from "next/link";
import { LogoMotion } from "@/shared/components/logo-motion";

export const ORG = "Ad On Group";
const YEAR = 2026;

export const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";
export const pill = `inline-flex h-12 items-center gap-2.5 rounded-full px-7 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${focus}`;

export const icons = {
  gift: "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
  people: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  calendar: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  arrow: "M5 12h14M12 5l7 7-7 7",
};

export function Icon({ d, className = "size-5" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

const navLinks = [
  { href: "/", label: "The Secret Santa" },
  { href: "/#how", label: "How it works" },
  { href: "/#how", label: "Wishlists" },
  { href: "/recover", label: "Organiser" },
];

export function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-[1100px] items-center justify-between gap-4 px-4 py-5 md:px-8">
      <Link href="/" aria-label={`${ORG} home`} className={`rounded-sm ${focus}`}>
        <LogoMotion className="h-10 w-auto md:h-12" />
      </Link>
      <nav className="hidden items-center gap-8 text-[13px] md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`border-b-2 pb-1 transition-colors duration-150 ${link.href === active ? "border-ember" : "border-transparent text-ink/85 hover:text-ink"} ${focus}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Link href="/create" className={`${pill} h-10 bg-gold px-5 text-[#2a1a00]`}>
        <Icon d={icons.gift} className="size-4" /> Join the draw
      </Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="flex min-h-[32rem] items-end md:min-h-80 bg-[url(/santa/footer.png)] bg-cover bg-bottom pb-[clamp(2.5rem,7vw,7rem)] [mask-image:linear-gradient(transparent,#000_22%)] md:aspect-[3/1]">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-6 px-24 text-center md:flex-row md:items-center md:justify-between md:gap-0 md:px-8 md:text-left">
        <div className="md:pr-10">
          <p className="font-display text-2xl tracking-[-0.03em]">{ORG}</p>
          <p className="mt-1 text-sm text-ink/80">Great people. Greater together.</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[15px] md:border-x md:border-ink/25 md:px-12 md:py-4">
          <Link href="/" className={`hover:text-gold ${focus}`}>About</Link>
          <Link href="/#how" className={`hover:text-gold ${focus}`}>How it works</Link>
          <Link href="/#how" className={`hover:text-gold ${focus}`}>Wishlist</Link>
        </nav>
        <p className="text-xs text-ink/80 md:pl-10">© {YEAR} ADON Group. All rights reserved.</p>
      </div>
    </footer>
  );
}
