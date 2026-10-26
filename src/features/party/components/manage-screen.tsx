import { EnvelopeSimpleIcon } from "@phosphor-icons/react/ssr";
import {
  addExclusionAction,
  addParticipantAction,
  deletePartyAction,
  removeExclusionAction,
  removeParticipantAction,
  resendAllLinksAction,
  resendLinkAction,
  reusePartyAction,
  startDrawAction,
} from "@/features/party/party.actions";
import { PartyStatus, ParticipantRole } from "@/features/party/party.constants";
import type { PartyView } from "@/features/party/services/party.service";
import { CopyLine } from "@/shared/components/copy-line";
import {
  blockTitleClass,
  chipActiveClass,
  chipClass,
  DangerButton,
  fieldClass,
  ghostButtonClass,
  GhostButton,
  InkButton,
  labelClass,
  MetaLine,
  Notice,
  pageTitleClass,
  panelClass,
  SubmitControl,
} from "@/shared/components/page-shell";

export function ManageScreen({
  manageToken,
  party,
  notice,
  reveal,
}: {
  manageToken: string;
  party: PartyView;
  notice?: string;
  reveal: boolean;
}) {
  const rosterLocked = party.status !== PartyStatus.Pending || party.exclusions.length > 0;
  const nameById = new Map(party.participants.map((participant) => [participant.id, participant.name]));
  const drawn = party.status === PartyStatus.Drawn;

  return (
    <div className="enter mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className={pageTitleClass}>{party.name}</h1>
        <span className={drawn ? chipActiveClass : chipClass}>{drawn ? "Drawn" : "Waiting to draw"}</span>
      </div>
      <MetaLine
        parts={[party.eventDate, party.location, party.budget, `${party.participants.length} people`]}
      />
      <Notice message={notice} />
      <p className="text-sm font-medium text-mute">
        If an email does not arrive, copy the links on this page. Guests only see who they buy for.
      </p>

      <section className={panelClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={blockTitleClass}>People</h2>
          <form action={resendAllLinksAction.bind(null, manageToken)}>
            <InkButton>
              <EnvelopeSimpleIcon size={16} weight="bold" aria-hidden />
              Email everyone
            </InkButton>
          </form>
        </div>
        {party.participants.map((participant) => (
          <div key={participant.id} className="space-y-3 border-t border-line pt-4">
            <p className="font-medium">
              {participant.name}{" "}
              {participant.role === ParticipantRole.Organizer ? (
                <span className="font-normal text-mute">Organizer</span>
              ) : null}
            </p>
            <CopyLine label="Guest page" path={`/party/${participant.accessToken}`} />
            <form action={resendLinkAction.bind(null, manageToken, participant.id)} className="flex flex-wrap items-end gap-2">
              <label className={`${labelClass} min-w-48 flex-1`}>
                Email
                <input name="email" type="email" defaultValue={participant.email} className={fieldClass} />
              </label>
              <GhostButton>Send</GhostButton>
            </form>
            {participant.role === ParticipantRole.Guest && !rosterLocked ? (
              <form action={removeParticipantAction.bind(null, manageToken, participant.id)}>
                <SubmitControl className="text-sm font-medium text-mute">Remove</SubmitControl>
              </form>
            ) : null}
          </div>
        ))}
        {rosterLocked ? null : (
          <form action={addParticipantAction.bind(null, manageToken)} className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
            <label className={labelClass}>
              Name
              <input name="name" className={fieldClass} />
            </label>
            <label className={labelClass}>
              Email
              <input name="email" type="email" className={fieldClass} />
            </label>
            <InkButton>Add</InkButton>
          </form>
        )}
      </section>

      <section className={panelClass}>
        <h2 className={blockTitleClass}>Exclusions</h2>
        <p className="text-sm font-medium text-mute">
          These two cannot buy for each other. Needs 4 or more people, and only before the draw.
        </p>
        {party.exclusions.length === 0 ? <p className="text-sm font-medium text-mute">No pairs blocked yet.</p> : null}
        {party.exclusions.map((exclusion) => (
          <div key={exclusion.id} className="flex items-center justify-between gap-3 text-sm">
            <span>
              {nameById.get(exclusion.participantAId)} and {nameById.get(exclusion.participantBId)}
            </span>
            {party.status === PartyStatus.Pending ? (
              <form action={removeExclusionAction.bind(null, manageToken, exclusion.id)}>
                <SubmitControl className="font-medium text-mute">Remove</SubmitControl>
              </form>
            ) : null}
          </div>
        ))}
        {party.status === PartyStatus.Pending && party.participants.length >= 4 ? (
          <form action={addExclusionAction.bind(null, manageToken)} className="grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              First person
              <select name="leftId" className={fieldClass}>
                {party.participants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Second person
              <select name="rightId" className={fieldClass}>
                {party.participants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name}
                  </option>
                ))}
              </select>
            </label>
            <GhostButton>Exclude</GhostButton>
          </form>
        ) : null}
      </section>

      {drawn && reveal ? (
        <section className={panelClass}>
          <h2 className={blockTitleClass}>Matches</h2>
          {party.participants.map((participant) => {
            const recipientName = participant.recipientId
              ? nameById.get(participant.recipientId)
              : "nobody yet";
            return (
              <p key={participant.id} className="text-sm">
                {participant.name} buys for {recipientName}
              </p>
            );
          })}
        </section>
      ) : null}

      <CopyLine label="Join link" path={`/join/${party.joinToken}`} />

      <div className="flex flex-wrap gap-3">
        {party.status === PartyStatus.Pending ? (
          <form action={startDrawAction.bind(null, manageToken)}>
            <InkButton>Start the draw</InkButton>
          </form>
        ) : (
          <a href={reveal ? `/manage/${manageToken}` : `/manage/${manageToken}?reveal=1`} className={ghostButtonClass}>
            {reveal ? "Hide matches" : "Show matches"}
          </a>
        )}
        <form action={deletePartyAction.bind(null, manageToken)}>
          <DangerButton>Delete party</DangerButton>
        </form>
      </div>

      <form action={reusePartyAction.bind(null, manageToken)} className={panelClass}>
        <h2 className={blockTitleClass}>Reuse this party</h2>
        <p className="text-sm font-medium text-mute">Copies the same people into a new party.</p>
        {drawn ? (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="blockPreviousPairs" />
            Keep last year&apos;s pairs apart
          </label>
        ) : null}
        <InkButton>Create the copy</InkButton>
      </form>
    </div>
  );
}
