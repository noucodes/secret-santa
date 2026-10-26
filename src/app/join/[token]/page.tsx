import { notFound } from "next/navigation";
import { JoinScreen } from "@/features/party/components/join-screen";
import { getJoinParty } from "@/features/party/services/party.service";
import { PageShell } from "@/shared/components/page-shell";
import { readNotice } from "@/shared/notice/notice";

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const party = await getJoinParty(token);
  if (!party) notFound();
  return (
    <PageShell>
      <JoinScreen joinToken={token} party={party} notice={await readNotice()} />
    </PageShell>
  );
}
