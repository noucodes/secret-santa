"use server";

import { rememberNotice } from "@/shared/notice/notice";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { parseCreateParty, parsePerson, type CreatePartyInput } from "@/features/party/helpers/party.helpers";
import {
  addExclusion,
  addNote,
  addParticipant,
  addWishlistItem,
  deleteWishlistItem,
  updateWishlistItem,
  changeEmailAndResend,
  createParty,
  deleteParty,
  joinParty,
  PartyError,
  recoverLinks,
  resendAllLinks,
  removeExclusion,
  removeParticipant,
  reuseParty,
  startDraw,
} from "@/features/party/services/party.service";

async function redirectWithNotice(path: string, notice: string) {
  await rememberNotice(notice);
  redirect(path);
}

function messageFrom(caughtError: unknown) {
  if (caughtError instanceof PartyError) return caughtError.message;
  if (caughtError instanceof Error && caughtError.message === "DATABASE_URL is not set.") {
    return "DATABASE_URL is not set.";
  }
  return "Something went wrong.";
}

export async function createPartyAction(input: CreatePartyInput) {
  const parsed = parseCreateParty(input);
  if (!parsed.ok) return { error: parsed.error };
  try {
    const created = await createParty(parsed.value);
    redirect(`/manage/${created.manageToken}`);
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) {
      throw caughtError;
    }
    return { error: messageFrom(caughtError) };
  }
}

export async function addParticipantAction(manageToken: string, formData: FormData) {
  const parsed = parsePerson(String(formData.get("name") ?? ""), String(formData.get("email") ?? ""));
  try {
    if (!parsed.ok) throw new PartyError(parsed.error);
    await addParticipant(manageToken, parsed.value);
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) throw caughtError;
    await redirectWithNotice(`/manage/${manageToken}`, messageFrom(caughtError));
  }
  revalidatePath(`/manage/${manageToken}`);
  redirect(`/manage/${manageToken}`);
}

export async function removeParticipantAction(manageToken: string, participantId: string) {
  try {
    await removeParticipant(manageToken, participantId);
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) throw caughtError;
    await redirectWithNotice(`/manage/${manageToken}`, messageFrom(caughtError));
  }
  revalidatePath(`/manage/${manageToken}`);
  redirect(`/manage/${manageToken}`);
}

export async function addExclusionAction(manageToken: string, formData: FormData) {
  try {
    await addExclusion(
      manageToken,
      String(formData.get("leftId") ?? ""),
      String(formData.get("rightId") ?? ""),
    );
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) throw caughtError;
    await redirectWithNotice(`/manage/${manageToken}`, messageFrom(caughtError));
  }
  revalidatePath(`/manage/${manageToken}`);
  redirect(`/manage/${manageToken}`);
}

export async function removeExclusionAction(manageToken: string, exclusionId: string) {
  try {
    await removeExclusion(manageToken, exclusionId);
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) throw caughtError;
    await redirectWithNotice(`/manage/${manageToken}`, messageFrom(caughtError));
  }
  revalidatePath(`/manage/${manageToken}`);
  redirect(`/manage/${manageToken}`);
}

export async function startDrawAction(manageToken: string) {
  try {
    const result = await startDraw(manageToken);
    const notice = result.sent
      ? "Names are drawn. Each person got an email."
      : "Names are drawn. Email was not sent, so copy the links below.";
    await redirectWithNotice(`/manage/${manageToken}`, notice);
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) throw caughtError;
    await redirectWithNotice(`/manage/${manageToken}`, messageFrom(caughtError));
  }
}

export async function resendAllLinksAction(manageToken: string) {
  try {
    const result = await resendAllLinks(manageToken);
    const notice =
      result.sentCount === result.total
        ? "Links sent to everyone."
        : result.sentCount === 0
          ? "Email was not sent. Copy the links below."
          : "Some emails were not sent. Copy the links below.";
    await redirectWithNotice(`/manage/${manageToken}`, notice);
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) throw caughtError;
    await redirectWithNotice(`/manage/${manageToken}`, messageFrom(caughtError));
  }
}

export async function resendLinkAction(manageToken: string, participantId: string, formData: FormData) {
  try {
    const result = await changeEmailAndResend(
      manageToken,
      participantId,
      String(formData.get("email") ?? ""),
    );
    const notice = result.sent ? "Link sent." : "Email was not sent. Copy the link below.";
    await redirectWithNotice(`/manage/${manageToken}`, notice);
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) throw caughtError;
    await redirectWithNotice(`/manage/${manageToken}`, messageFrom(caughtError));
  }
}

export async function deletePartyAction(manageToken: string) {
  try {
    await deleteParty(manageToken);
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) throw caughtError;
    await redirectWithNotice(`/manage/${manageToken}`, messageFrom(caughtError));
  }
  redirect("/");
}

export async function reusePartyAction(manageToken: string, formData: FormData) {
  try {
    const created = await reuseParty(manageToken, formData.get("blockPreviousPairs") === "on");
    redirect(`/manage/${created.manageToken}`);
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) throw caughtError;
    await redirectWithNotice(`/manage/${manageToken}`, messageFrom(caughtError));
  }
}

export async function addWishlistAction(accessToken: string, formData: FormData) {
  try {
    await addWishlistItem(
      accessToken,
      String(formData.get("label") ?? ""),
      String(formData.get("url") ?? ""),
    );
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) throw caughtError;
    await redirectWithNotice(`/party/${accessToken}`, messageFrom(caughtError));
  }
  revalidatePath(`/party/${accessToken}`);
  redirect(`/party/${accessToken}`);
}

export async function updateWishlistAction(accessToken: string, itemId: string, formData: FormData) {
  try {
    await updateWishlistItem(
      accessToken,
      itemId,
      String(formData.get("label") ?? ""),
      String(formData.get("url") ?? ""),
    );
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) throw caughtError;
    await redirectWithNotice(`/party/${accessToken}`, messageFrom(caughtError));
  }
  revalidatePath(`/party/${accessToken}`);
  redirect(`/party/${accessToken}`);
}

export async function deleteWishlistAction(accessToken: string, itemId: string) {
  try {
    await deleteWishlistItem(accessToken, itemId);
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) throw caughtError;
    await redirectWithNotice(`/party/${accessToken}`, messageFrom(caughtError));
  }
  revalidatePath(`/party/${accessToken}`);
  redirect(`/party/${accessToken}`);
}

export async function addNoteAction(accessToken: string, formData: FormData) {
  try {
    await addNote(accessToken, String(formData.get("body") ?? ""));
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) throw caughtError;
    await redirectWithNotice(`/party/${accessToken}`, messageFrom(caughtError));
  }
  revalidatePath(`/party/${accessToken}`);
  redirect(`/party/${accessToken}`);
}

export async function joinPartyAction(joinToken: string, formData: FormData) {
  try {
    const accessToken = await joinParty(
      joinToken,
      String(formData.get("name") ?? ""),
      String(formData.get("email") ?? ""),
    );
    redirect(`/party/${accessToken}`);
  } catch (caughtError) {
    if (typeof caughtError === "object" && caughtError !== null && "digest" in caughtError) throw caughtError;
    await redirectWithNotice(`/join/${joinToken}`, messageFrom(caughtError));
  }
}

export async function recoverLinksAction(formData: FormData) {
  try {
    const result = await recoverLinks(String(formData.get("email") ?? ""));
    if (!result.found) {
      return { message: "If that email is in a party, the links are on the way." };
    }
    if (!result.sent) {
      return { message: "Email is not configured, so the links could not be sent." };
    }
    return { message: "If that email is in a party, the links are on the way." };
  } catch (caughtError) {
    return { message: messageFrom(caughtError) };
  }
}
