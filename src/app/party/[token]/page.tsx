import { notFound } from "next/navigation";
import { GuestScreen } from "@/features/party/components/guest-screen";
import { getGuestParty, PartyError } from "@/features/party/services/party.service";
import { PageShell } from "@/shared/components/page-shell";
import { readNotice } from "@/shared/notice/notice";

export default async function GuestPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const notice = await readNotice();
  let guest;
  try {
    guest = await getGuestParty(token);
  } catch (caughtError) {
    if (caughtError instanceof PartyError) notFound();
    throw caughtError;
  }
  return (
    <PageShell>
      <GuestScreen accessToken={token} guest={guest} notice={notice} />
    </PageShell>
  );
}
