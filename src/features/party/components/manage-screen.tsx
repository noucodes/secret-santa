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
  textLinkClass,
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
  const pending = party.status === PartyStatus.Pending;
  const columnWidth = rosterLocked
    ? { name: "w-[19%]", role: "w-[10%]", email: "w-[30%]", guest: "w-[29%]", action: "w-[12%]" }
    : { name: "w-[19%]", role: "w-[10%]", email: "w-[26%]", guest: "w-[25%]", action: "w-[20%]" };

  return (
    <div className="enter mx-auto w-full space-y-6">
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
        <div className="min-w-0 overflow-x-auto rounded-[10px] border border-hairline">
          <table className="w-full table-fixed border-collapse text-left">
            <caption className="sr-only">People in this party</caption>
            <thead className="bg-surface text-center text-[13px] font-medium text-mute">
              <tr>
                <th scope="col" className={`${columnWidth.name} px-5 py-2.5 font-medium`}>Name</th>
                <th scope="col" className={`${columnWidth.role} px-5 py-2.5 font-medium`}>Role</th>
                <th scope="col" className={`${columnWidth.email} px-5 py-2.5 font-medium`}>Email</th>
                <th scope="col" className={`${columnWidth.guest} px-5 py-2.5 font-medium`}>Guest page</th>
                <th scope="col" className={`${columnWidth.action} px-5 py-2.5 font-medium`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {party.participants.map((participant) => {
                const resendFormId = `resend-${participant.id}`;
                return (
                <tr key={participant.id} className="border-t border-line">
                  <th scope="row" className="px-5 py-3 text-center align-middle font-medium">
                    <span className="flex h-11 items-center justify-center truncate">{participant.name}</span>
                  </th>
                  <td className="px-5 py-3 text-center align-middle text-sm">
                    <span className="flex h-11 items-center justify-center truncate">
                      {participant.role === ParticipantRole.Organizer ? "Organizer" : "Guest"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center align-middle">
                    <form id={resendFormId} action={resendLinkAction.bind(null, manageToken, participant.id)}>
                      <input
                        name="email"
                        type="email"
                        defaultValue={participant.email}
                        aria-label={`Email for ${participant.name}`}
                        className={`${fieldClass} mt-0 h-11 min-h-0 w-full text-center`}
                      />
                    </form>
                  </td>
                  <td className="px-5 py-3 text-center align-middle">
                    <a
                      href={`/party/${participant.accessToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`/party/${participant.accessToken}`}
                      className={`${textLinkClass} flex h-11 w-full min-w-0 items-center justify-center px-2 hover:underline underline-offset-2`}
                    >
                      <span className="sr-only">Guest page </span>
                      <span className="min-w-0 truncate text-center">{`/party/${participant.accessToken}`}</span>
                    </a>
                  </td>
                  <td className="px-5 py-3 align-middle whitespace-nowrap">
                    <div className="flex h-11 w-full items-center gap-2">
                      <button type="submit" form={resendFormId} className={`${ghostButtonClass} min-w-0 flex-1`}>
                        Send
                      </button>
                      {participant.role === ParticipantRole.Guest && !rosterLocked ? (
                        <form action={removeParticipantAction.bind(null, manageToken, participant.id)} className="shrink-0">
                          <SubmitControl className="text-sm font-medium text-mute">Remove</SubmitControl>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rosterLocked ? null : (
          <form action={addParticipantAction.bind(null, manageToken)} className="grid gap-3 sm:grid-cols-2">
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
          {drawn
            ? party.exclusions.length === 0
              ? "No pairs were blocked."
              : "These pairs cannot buy for each other."
            : "These two cannot buy for each other. Needs 4 or more people, and only before the draw."}
        </p>
        {party.exclusions.length === 0 ? (drawn ? null : <p className="text-sm font-medium text-mute">No pairs blocked yet.</p>) : (
          <div className="overflow-auto rounded-[10px] border border-hairline">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Blocked pairs</caption>
              <thead className="sticky top-0 z-10 bg-surface text-[13px] font-medium text-mute">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-medium">First</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Second</th>
                  {pending ? <th scope="col" className="px-3 py-2.5 font-medium">Action</th> : null}
                </tr>
              </thead>
              <tbody>
                {party.exclusions.map((exclusion) => (
                  <tr key={exclusion.id} className="border-t border-line text-sm">
                    <th scope="row" className="px-3 py-2 text-left align-middle font-medium">
                      {nameById.get(exclusion.participantAId)}
                    </th>
                    <td className="px-3 py-2 align-middle">{nameById.get(exclusion.participantBId)}</td>
                    {pending ? (
                      <td className="px-3 py-2 align-middle">
                        <form action={removeExclusionAction.bind(null, manageToken, exclusion.id)}>
                          <SubmitControl className="font-medium text-mute">Remove</SubmitControl>
                        </form>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pending && party.participants.length >= 4 ? (
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
          <div className="overflow-auto rounded-[10px] border border-hairline">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Who buys for whom</caption>
              <thead className="sticky top-0 z-10 bg-surface text-[13px] font-medium text-mute">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-medium">Buys</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">For</th>
                </tr>
              </thead>
              <tbody>
                {party.participants.map((participant) => {
                  const recipientName = participant.recipientId
                    ? nameById.get(participant.recipientId)
                    : "nobody yet";
                  return (
                    <tr key={participant.id} className="border-t border-line text-sm">
                      <th scope="row" className="px-3 py-2 text-left align-middle font-medium">
                        {participant.name}
                      </th>
                      <td className="px-3 py-2 align-middle">{recipientName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <CopyLine label="Join link" path={`/join/${party.joinToken}`} />

      <div className="flex flex-wrap gap-3">
        {pending ? (
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
