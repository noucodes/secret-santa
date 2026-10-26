import { addNoteAction, addWishlistAction, setTakenAction } from "@/features/party/party.actions";
import { PartyStatus } from "@/features/party/party.constants";
import type { GuestView, WishlistItemView } from "@/features/party/services/party.service";
import {
  blockTitleClass,
  cardClass,
  fieldClass,
  GhostButton,
  hintClass,
  InkButton,
  labelClass,
  MetaLine,
  Notice,
  pageTitleClass,
  panelClass,
} from "@/shared/components/page-shell";

function WishlistRows({
  accessToken,
  items,
  emptyLabel,
}: {
  accessToken: string;
  items: WishlistItemView[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm font-medium text-mute">{emptyLabel}</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>
            {item.url ? (
              <a href={item.url} className="font-medium text-link underline decoration-link/40 underline-offset-4">
                {item.label}
              </a>
            ) : (
              item.label
            )}
            {item.taken ? <span className="ml-2 text-mute">Taken</span> : null}
          </span>
          <form action={setTakenAction.bind(null, accessToken, item.id, !item.taken)}>
            <GhostButton>{item.taken ? "Mark open" : "Mark taken"}</GhostButton>
          </form>
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
          <WishlistRows
            accessToken={accessToken}
            items={guest.recipientWishlist}
            emptyLabel="Nothing on this list yet."
          />
        </section>
      ) : null}

      <section className={panelClass}>
        <h2 className={blockTitleClass}>Your list</h2>
        <WishlistRows
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
