"use client";

import { useState } from "react";
import { GiftIcon, PenIcon, TrashIcon } from "@phosphor-icons/react/ssr";
import { deleteWishlistAction, updateWishlistAction } from "@/features/party/party.actions";
import type { WishlistItemView } from "@/features/party/services/party.service";
import { fieldClass, hintClass, InkButton, labelClass, SubmitControl } from "@/shared/components/page-shell";

const iconButtonClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_#f8c544,0_0_0_5px_rgba(248,197,68,0.2)]";

function GiftMark() {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold" aria-hidden>
      <GiftIcon size={22} weight="fill" />
    </span>
  );
}

export function OwnWishlist({
  accessToken,
  items,
  emptyLabel,
}: {
  accessToken: string;
  items: WishlistItemView[];
  emptyLabel: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

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
      {items.map((item) => {
        const editing = editingId === item.id;
        return (
          <li key={item.id} className="rounded-[10px] border border-white/10 bg-lift px-4 py-3">
            {editing ? (
              <form action={updateWishlistAction.bind(null, accessToken, item.id)} className="space-y-3">
                <label className={labelClass}>
                  Gift idea
                  <input name="label" required defaultValue={item.label} className={fieldClass} />
                </label>
                <label className={labelClass}>
                  Link
                  <span className={hintClass}>Optional.</span>
                  <input name="url" type="url" defaultValue={item.url ?? ""} className={fieldClass} />
                </label>
                <div className="flex flex-wrap gap-3">
                  <InkButton>Save</InkButton>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-sm font-medium text-mute"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <GiftMark />
                {item.url ? (
                  <a
                    href={item.url}
                    className="min-w-0 flex-1 text-base font-semibold text-link underline decoration-link/40 underline-offset-4"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="min-w-0 flex-1 text-base font-semibold text-ink">{item.label}</span>
                )}
                <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    aria-label={`Edit ${item.label}`}
                    onClick={() => setEditingId(item.id)}
                    className={`${iconButtonClass} text-gold`}
                  >
                    <PenIcon size={20} weight="bold" />
                  </button>
                  <form action={deleteWishlistAction.bind(null, accessToken, item.id)}>
                    <SubmitControl
                      ariaLabel={`Delete ${item.label}`}
                      className={`${iconButtonClass} text-coral`}
                      replace
                    >
                      <TrashIcon size={20} weight="bold" />
                    </SubmitControl>
                  </form>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
