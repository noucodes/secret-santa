const focus =
  "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#f8c544,0_0_0_5px_rgba(248,197,68,0.2)]";

const press =
  "inline-flex h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-semibold leading-none tracking-[-0.01em] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

export const inkButtonClass = `${press} bg-gold text-[#2a1a00] hover:bg-[#ffd25e] ${focus}`;
export const ghostButtonClass = `${press} border border-white/15 bg-white/5 text-ink hover:bg-white/10 ${focus}`;
export const dangerButtonClass = `${press} border border-coral/30 bg-coral/10 text-coral hover:bg-coral/20 ${focus}`;
