import { GiftIcon } from "@phosphor-icons/react/ssr";
import { OwnWishlist } from "@/features/party/components/own-wishlist";
import { addNoteAction, addWishlistAction } from "@/features/party/party.actions";
import { PartyStatus } from "@/features/party/party.constants";
import type { GuestView, WishlistItemView } from "@/features/party/services/party.service";
import {
  blockTitleClass,
  cardClass,
  fieldClass,
  hintClass,
  InkButton,
  labelClass,
  MetaLine,
  Notice,
  pageTitleClass,
  panelClass,
} from "@/shared/components/page-shell";

function GiftMark() {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold" aria-hidden>
      <GiftIcon size={22} weight="fill" />
    </span>
  );
}

function WishlistRows({ items, emptyLabel }: { items: WishlistItemView[]; emptyLabel: string }) {
  if (items.length === 0) {
    return (
      <p className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-lift px-4 py-3 text-sm font-medium text-ink">
        <GiftMark />
        {emptyLabel}
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-lift px-4 py-3">
          <GiftMark />
          {item.url ? (
            <a
              href={item.url}
              className="text-base font-semibold text-link underline decoration-link/40 underline-offset-4"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-base font-semibold text-ink">{item.label}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function GuestScreen({
  accessToken,
  guest,
  notice,
}: {
  accessToken: string;
  guest: GuestView;
  notice?: string;
}) {
  const drawn = guest.status === PartyStatus.Drawn && guest.recipientName;

  return (
    <div className="enter mx-auto max-w-xl space-y-6">
      <MetaLine parts={[guest.partyName, guest.eventDate, guest.budget ? `Budget ${guest.budget}` : ""]} />
      {drawn ? (
        <div className={cardClass}>
          <p className="text-sm font-medium text-mute">Your match</p>
          <h1 className="mt-2 font-fancy! text-[clamp(2rem,4vw,2.75rem)] font-bold! leading-[1.1] tracking-normal! text-gold">
            {guest.recipientName}
          </h1>
        </div>
      ) : (
        <div className="space-y-3">
          <h1 className={pageTitleClass}>Names are not drawn yet</h1>
          <p className="text-sm font-medium text-mute">You can still fill your list. The name shows up here after the draw.</p>
        </div>
      )}
      {guest.message ? <p className="text-sm font-medium text-mute">{guest.message}</p> : null}
      <Notice message={notice} />

      {drawn ? (
        <section className={panelClass}>
          <h2 className={blockTitleClass}>{guest.recipientName}&apos;s list</h2>
          <WishlistRows items={guest.recipientWishlist} emptyLabel="Nothing in this list yet." />
        </section>
      ) : null}

      <section className={panelClass}>
        <h2 className={blockTitleClass}>Your list</h2>
        <OwnWishlist
          accessToken={accessToken}
          items={guest.ownWishlist}
          emptyLabel="Nothing here yet. Add a gift below."
        />
        <form action={addWishlistAction.bind(null, accessToken)} className="space-y-3">
          <label className={labelClass}>
            Gift idea
            <input name="label" required className={fieldClass} />
          </label>
          <label className={labelClass}>
            Link
            <span className={hintClass}>Optional.</span>
            <input name="url" type="url" className={fieldClass} />
          </label>
          <InkButton>Add idea</InkButton>
        </form>
      </section>

      {guest.notes.length > 0 ? (
        <section className={panelClass}>
          <h2 className={blockTitleClass}>Notes to you</h2>
          <p className="text-sm font-medium text-mute">The sender&apos;s name stays hidden.</p>
          {guest.notes.map((note) => (
            <p key={note.id} className="rounded-[10px] bg-lift px-4 py-3 text-sm">
              {note.body}
            </p>
          ))}
        </section>
      ) : null}

      {drawn ? (
        <form action={addNoteAction.bind(null, accessToken)} className={panelClass}>
          <h2 className={blockTitleClass}>Note to {guest.recipientName}</h2>
          <p className="text-sm font-medium text-mute">They see the note. Your name stays off it.</p>
          <label className={labelClass}>
            Message
            <textarea name="body" required className={`${fieldClass} min-h-24`} />
          </label>
          <InkButton>Send note</InkButton>
        </form>
      ) : null}
    </div>
  );
}
