import { getDatabase } from "@/shared/db/db";
import { getAppOrigin, sendMail } from "@/shared/email/email";
import { ParticipantRole, PartyStatus } from "@/features/party/party.constants";
import {
  guestPageLetter,
  orderedPair,
  parsePerson,
  type CreatePartyInput,
  type PersonInput,
} from "@/features/party/helpers/party.helpers";
import { drawAssignments } from "@/features/party/helpers/draw.helpers";

export class PartyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PartyError";
  }
}

type PartyRow = {
  id: string;
  name: string;
  event_date: string;
  location: string;
  budget: string;
  message: string;
  status: PartyStatus;
  join_token: string;
};

type ParticipantRow = {
  id: string;
  party_id: string;
  name: string;
  email: string;
  role: ParticipantRole;
  access_token: string;
  recipient_id: string | null;
};

type WishlistRow = {
  id: string;
  participant_id: string;
  label: string;
  url: string | null;
};

export type ParticipantView = {
  id: string;
  name: string;
  email: string;
  role: ParticipantRole;
  accessToken: string;
  recipientId: string | null;
};

export type PartyView = {
  id: string;
  name: string;
  eventDate: string;
  location: string;
  budget: string;
  message: string;
  status: PartyStatus;
  joinToken: string;
  participants: ParticipantView[];
  exclusions: { id: string; participantAId: string; participantBId: string }[];
};

export type WishlistItemView = {
  id: string;
  label: string;
  url: string | null;
};

export type GuestView = {
  partyName: string;
  eventDate: string;
  location: string;
  budget: string;
  message: string;
  status: PartyStatus;
  participantId: string;
  participantName: string;
  recipientName: string | null;
  recipientWishlist: WishlistItemView[];
  ownWishlist: WishlistItemView[];
  notes: { id: string; body: string }[];
};

function mapParticipant(row: ParticipantRow): ParticipantView {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    accessToken: row.access_token,
    recipientId: row.recipient_id,
  };
}

async function loadParty(partyId: string): Promise<PartyView> {
  const sql = getDatabase();
  const parties = await sql`
    SELECT id, name, event_date, location, budget, message, status, join_token
    FROM parties
    WHERE id = ${partyId}
  `;
  const party = parties[0] as PartyRow | undefined;
  if (!party) throw new PartyError("Party not found.");

  const participantRows = (await sql`
    SELECT id, party_id, name, email, role, access_token, recipient_id
    FROM participants
    WHERE party_id = ${partyId}
    ORDER BY role DESC, name
  `) as ParticipantRow[];

  const exclusionRows = (await sql`
    SELECT id, participant_a_id, participant_b_id
    FROM exclusions
    WHERE party_id = ${partyId}
  `) as { id: string; participant_a_id: string; participant_b_id: string }[];

  return {
    id: party.id,
    name: party.name,
    eventDate: party.event_date,
    location: party.location,
    budget: party.budget,
    message: party.message,
    status: party.status,
    joinToken: party.join_token,
    participants: participantRows.map(mapParticipant),
    exclusions: exclusionRows.map((exclusion) => ({
      id: exclusion.id,
      participantAId: exclusion.participant_a_id,
      participantBId: exclusion.participant_b_id,
    })),
  };
}

async function requireManageParty(manageToken: string) {
  const sql = getDatabase();
  const rows = (await sql`
    SELECT party_id
    FROM participants
    WHERE access_token = ${manageToken}
      AND role = ${ParticipantRole.Organizer}
  `) as { party_id: string }[];
  const row = rows[0];
  if (!row) throw new PartyError("That manage link does not match a party.");
  return loadParty(row.party_id);
}

async function previousWishlist(email: string) {
  const sql = getDatabase();
  return (await sql`
    SELECT label, url
    FROM wishlist_items
    WHERE participant_id = (
      SELECT id
      FROM participants
      WHERE lower(email) = ${email}
      ORDER BY created_at DESC
      LIMIT 1
    )
  `) as { label: string; url: string | null }[];
}

async function guestLink(accessToken: string) {
  const origin = await getAppOrigin();
  return `${origin}/party/${accessToken}`;
}

async function manageLink(accessToken: string) {
  const origin = await getAppOrigin();
  return `${origin}/manage/${accessToken}`;
}

export async function createParty(input: CreatePartyInput) {
  const sql = getDatabase();
  const partyId = crypto.randomUUID();
  const joinToken = crypto.randomUUID();
  const people = [
    {
      id: crypto.randomUUID(),
      name: input.organizerName,
      email: input.organizerEmail,
      role: ParticipantRole.Organizer,
      accessToken: crypto.randomUUID(),
    },
    ...input.guests.map((guest) => ({
      id: crypto.randomUUID(),
      name: guest.name,
      email: guest.email,
      role: ParticipantRole.Guest,
      accessToken: crypto.randomUUID(),
    })),
  ];

  const wishlistCopies = (
    await Promise.all(
      people.map(async (person) => ({
        participantId: person.id,
        items: await previousWishlist(person.email),
      })),
    )
  ).flatMap((copy) =>
    copy.items.map((item) => ({
      id: crypto.randomUUID(),
      participantId: copy.participantId,
      label: item.label,
      url: item.url,
    })),
  );

  await sql.transaction((txn) => [
    txn`
      INSERT INTO parties (id, name, event_date, location, budget, message, status, join_token)
      VALUES (
        ${partyId},
        ${input.partyName},
        ${input.eventDate},
        ${input.location},
        ${input.budget},
        ${input.message},
        ${PartyStatus.Pending},
        ${joinToken}
      )
    `,
    ...people.map(
      (person) => txn`
        INSERT INTO participants (id, party_id, name, email, role, access_token)
        VALUES (
          ${person.id},
          ${partyId},
          ${person.name},
          ${person.email},
          ${person.role},
          ${person.accessToken}
        )
      `,
    ),
    ...wishlistCopies.map(
      (item) => txn`
        INSERT INTO wishlist_items (id, participant_id, label, url)
        VALUES (${item.id}, ${item.participantId}, ${item.label}, ${item.url})
      `,
    ),
  ]);

  const organizer = people[0];
  await sendMail({
    to: organizer.email,
    subject: `Manage ${input.partyName}`,
    text: `Your party is ready. Guests are not emailed until you start the draw.\n\n${await manageLink(organizer.accessToken)}`,
  });

  return { manageToken: organizer.accessToken };
}

export async function getManageParty(manageToken: string) {
  return requireManageParty(manageToken);
}

function assertCanEditRoster(party: PartyView) {
  if (party.status !== PartyStatus.Pending) {
    throw new PartyError("People can only change before the draw.");
  }
  if (party.exclusions.length > 0) {
    throw new PartyError("Remove the exclusions before adding or removing people.");
  }
}

export async function addParticipant(manageToken: string, person: PersonInput) {
  const party = await requireManageParty(manageToken);
  assertCanEditRoster(party);
  const parsed = parsePerson(person.name, person.email);
  if (!parsed.ok) throw new PartyError(parsed.error);
  if (party.participants.some((participant) => participant.email === parsed.value.email)) {
    throw new PartyError("That email is already in this party.");
  }

  const sql = getDatabase();
  const participantId = crypto.randomUUID();
  const items = await previousWishlist(parsed.value.email);
  await sql.transaction((txn) => [
    txn`
      INSERT INTO participants (id, party_id, name, email, role, access_token)
      VALUES (
        ${participantId},
        ${party.id},
        ${parsed.value.name},
        ${parsed.value.email},
        ${ParticipantRole.Guest},
        ${crypto.randomUUID()}
      )
    `,
    ...items.map(
      (item) => txn`
        INSERT INTO wishlist_items (id, participant_id, label, url)
        VALUES (${crypto.randomUUID()}, ${participantId}, ${item.label}, ${item.url})
      `,
    ),
  ]);
}

export async function removeParticipant(manageToken: string, participantId: string) {
  const party = await requireManageParty(manageToken);
  assertCanEditRoster(party);
  const participant = party.participants.find((person) => person.id === participantId);
  if (!participant) throw new PartyError("That person is not in this party.");
  if (participant.role === ParticipantRole.Organizer) {
    throw new PartyError("The organizer stays in the party.");
  }
  if (party.participants.length <= 3) {
    throw new PartyError("A party needs at least 3 people.");
  }
  const sql = getDatabase();
  await sql`DELETE FROM participants WHERE id = ${participantId}`;
}

async function insertExclusion(partyId: string, leftId: string, rightId: string) {
  if (leftId === rightId) throw new PartyError("Pick two different people.");
  const pair = orderedPair(leftId, rightId);
  const sql = getDatabase();
  await sql`
    INSERT INTO exclusions (id, party_id, participant_a_id, participant_b_id)
    VALUES (${crypto.randomUUID()}, ${partyId}, ${pair.participantAId}, ${pair.participantBId})
    ON CONFLICT DO NOTHING
  `;
}

export async function addExclusion(manageToken: string, leftId: string, rightId: string) {
  const party = await requireManageParty(manageToken);
  if (party.status !== PartyStatus.Pending) {
    throw new PartyError("Exclusions lock once the draw starts.");
  }
  if (party.participants.length < 4) {
    throw new PartyError("Exclusions need at least 4 people.");
  }
  const known = new Set(party.participants.map((participant) => participant.id));
  if (!known.has(leftId) || !known.has(rightId)) {
    throw new PartyError("Both people have to be in this party.");
  }
  await insertExclusion(party.id, leftId, rightId);
}

export async function removeExclusion(manageToken: string, exclusionId: string) {
  const party = await requireManageParty(manageToken);
  if (party.status !== PartyStatus.Pending) {
    throw new PartyError("Exclusions lock once the draw starts.");
  }
  const sql = getDatabase();
  await sql`DELETE FROM exclusions WHERE id = ${exclusionId} AND party_id = ${party.id}`;
}

export async function startDraw(manageToken: string) {
  const party = await requireManageParty(manageToken);
  if (party.status !== PartyStatus.Pending) throw new PartyError("This party is already drawn.");
  const pairs = drawAssignments(
    party.participants.map((participant) => participant.id),
    party.exclusions.map((exclusion) => ({
      leftId: exclusion.participantAId,
      rightId: exclusion.participantBId,
    })),
  );
  if (!pairs) {
    throw new PartyError("No valid draw. Remove an exclusion and try again.");
  }

  const sql = getDatabase();
  await sql.transaction((txn) => [
    ...pairs.map(
      (pair) => txn`
        UPDATE participants
        SET recipient_id = ${pair.recipientId}
        WHERE id = ${pair.giverId}
      `,
    ),
    txn`
      UPDATE parties
      SET status = ${PartyStatus.Drawn}
      WHERE id = ${party.id}
    `,
  ]);

  let sent = true;
  for (const participant of party.participants) {
    const result = await sendMail({
      to: participant.email,
      subject: `Your Secret Santa page for ${party.name}`,
      text: guestPageLetter(party.name, await guestLink(participant.accessToken)),
    });
    if (!result.sent) sent = false;
  }
  return { sent };
}

export async function changeEmailAndResend(manageToken: string, participantId: string, email: string) {
  const party = await requireManageParty(manageToken);
  const participant = party.participants.find((person) => person.id === participantId);
  if (!participant) throw new PartyError("That person is not in this party.");
  const parsed = parsePerson(participant.name, email);
  if (!parsed.ok) throw new PartyError(parsed.error);
  if (
    party.participants.some(
      (person) => person.id !== participantId && person.email === parsed.value.email,
    )
  ) {
    throw new PartyError("That email is already in this party.");
  }
  const sql = getDatabase();
  await sql`UPDATE participants SET email = ${parsed.value.email} WHERE id = ${participantId}`;
  const result = await sendMail({
    to: parsed.value.email,
    subject: `Your Secret Santa page for ${party.name}`,
    text: guestPageLetter(party.name, await guestLink(participant.accessToken)),
  });
  return result;
}

export async function deleteParty(manageToken: string) {
  const party = await requireManageParty(manageToken);
  const sql = getDatabase();
  await sql`DELETE FROM parties WHERE id = ${party.id}`;
}

export async function getGuestParty(accessToken: string): Promise<GuestView> {
  const sql = getDatabase();
  const participantRows = (await sql`
    SELECT id, party_id, name, email, role, access_token, recipient_id
    FROM participants
    WHERE access_token = ${accessToken}
  `) as ParticipantRow[];
  const participant = participantRows[0];
  if (!participant) throw new PartyError("That link does not match a person.");

  const partyRows = (await sql`
    SELECT id, name, event_date, location, budget, message, status, join_token
    FROM parties
    WHERE id = ${participant.party_id}
  `) as PartyRow[];
  const party = partyRows[0];
  if (!party) throw new PartyError("Party not found.");

  const ownWishlist = (await sql`
    SELECT id, participant_id, label, url
    FROM wishlist_items
    WHERE participant_id = ${participant.id}
    ORDER BY created_at
  `) as WishlistRow[];

  let recipientName: string | null = null;
  let recipientWishlist: WishlistRow[] = [];
  if (participant.recipient_id) {
    const recipientRows = (await sql`
      SELECT name FROM participants WHERE id = ${participant.recipient_id}
    `) as { name: string }[];
    recipientName = recipientRows[0]?.name ?? null;
    recipientWishlist = (await sql`
      SELECT id, participant_id, label, url
      FROM wishlist_items
      WHERE participant_id = ${participant.recipient_id}
      ORDER BY created_at
    `) as WishlistRow[];
  }

  const noteRows = (await sql`
    SELECT id, body
    FROM notes
    WHERE recipient_id = ${participant.id}
    ORDER BY created_at
  `) as { id: string; body: string }[];

  const toView = (item: WishlistRow): WishlistItemView => ({
    id: item.id,
    label: item.label,
    url: item.url,
  });

  return {
    partyName: party.name,
    eventDate: party.event_date,
    location: party.location,
    budget: party.budget,
    message: party.message,
    status: party.status,
    participantId: participant.id,
    participantName: participant.name,
    recipientName,
    recipientWishlist: recipientWishlist.map(toView),
    ownWishlist: ownWishlist.map(toView),
    notes: noteRows,
  };
}

async function requireGuest(accessToken: string) {
  const sql = getDatabase();
  const rows = (await sql`
    SELECT id, party_id, recipient_id
    FROM participants
    WHERE access_token = ${accessToken}
  `) as { id: string; party_id: string; recipient_id: string | null }[];
  const guest = rows[0];
  if (!guest) throw new PartyError("That link does not match a person.");
  return guest;
}

export async function updateWishlistItem(accessToken: string, itemId: string, label: string, url: string) {
  const guest = await requireGuest(accessToken);
  const trimmedLabel = label.trim();
  if (!trimmedLabel) throw new PartyError("Add a gift idea.");
  const trimmedUrl = url.trim();
  const sql = getDatabase();
  const rows = await sql`
    UPDATE wishlist_items
    SET label = ${trimmedLabel}, url = ${trimmedUrl.length > 0 ? trimmedUrl : null}
    WHERE id = ${itemId} AND participant_id = ${guest.id}
    RETURNING id
  `;
  if (rows.length === 0) throw new PartyError("That gift idea is gone.");
}

export async function deleteWishlistItem(accessToken: string, itemId: string) {
  const guest = await requireGuest(accessToken);
  const sql = getDatabase();
  const rows = await sql`
    DELETE FROM wishlist_items
    WHERE id = ${itemId} AND participant_id = ${guest.id}
    RETURNING id
  `;
  if (rows.length === 0) throw new PartyError("That gift idea is gone.");
}

export async function addWishlistItem(accessToken: string, label: string, url: string) {
  const guest = await requireGuest(accessToken);
  const trimmedLabel = label.trim();
  if (!trimmedLabel) throw new PartyError("Add a gift idea.");
  const trimmedUrl = url.trim();
  const sql = getDatabase();
  await sql`
    INSERT INTO wishlist_items (id, participant_id, label, url)
    VALUES (
      ${crypto.randomUUID()},
      ${guest.id},
      ${trimmedLabel},
      ${trimmedUrl.length > 0 ? trimmedUrl : null}
    )
  `;
}

export async function addNote(accessToken: string, body: string) {
  const guest = await requireGuest(accessToken);
  if (!guest.recipient_id) throw new PartyError("You can send a note after the draw.");
  const trimmed = body.trim();
  if (!trimmed) throw new PartyError("Write a note first.");
  const sql = getDatabase();
  await sql`
    INSERT INTO notes (id, party_id, author_id, recipient_id, body)
    VALUES (
      ${crypto.randomUUID()},
      ${guest.party_id},
      ${guest.id},
      ${guest.recipient_id},
      ${trimmed}
    )
  `;
}

export async function joinParty(joinToken: string, name: string, email: string) {
  const sql = getDatabase();
  const partyRows = (await sql`
    SELECT id, status FROM parties WHERE join_token = ${joinToken}
  `) as { id: string; status: PartyStatus }[];
  const party = partyRows[0];
  if (!party) throw new PartyError("That join link does not match a party.");
  if (party.status !== PartyStatus.Pending) {
    throw new PartyError("This party has already drawn names.");
  }
  const exclusionRows = (await sql`
    SELECT id FROM exclusions WHERE party_id = ${party.id} LIMIT 1
  `) as { id: string }[];
  if (exclusionRows.length > 0) {
    throw new PartyError("The organizer locked the guest list with exclusions.");
  }
  const parsed = parsePerson(name, email);
  if (!parsed.ok) throw new PartyError(parsed.error);
  const existing = (await sql`
    SELECT id FROM participants
    WHERE party_id = ${party.id} AND lower(email) = ${parsed.value.email}
  `) as { id: string }[];
  if (existing.length > 0) throw new PartyError("That email is already in this party.");

  const participantId = crypto.randomUUID();
  const accessToken = crypto.randomUUID();
  const items = await previousWishlist(parsed.value.email);
  await sql.transaction((txn) => [
    txn`
      INSERT INTO participants (id, party_id, name, email, role, access_token)
      VALUES (
        ${participantId},
        ${party.id},
        ${parsed.value.name},
        ${parsed.value.email},
        ${ParticipantRole.Guest},
        ${accessToken}
      )
    `,
    ...items.map(
      (item) => txn`
        INSERT INTO wishlist_items (id, participant_id, label, url)
        VALUES (${crypto.randomUUID()}, ${participantId}, ${item.label}, ${item.url})
      `,
    ),
  ]);
  return accessToken;
}

export async function recoverLinks(email: string) {
  const parsed = parsePerson("Person", email);
  if (!parsed.ok) throw new PartyError(parsed.error);
  const sql = getDatabase();
  const rows = (await sql`
    SELECT participants.name, participants.email, participants.role, participants.access_token, parties.name AS party_name
    FROM participants
    JOIN parties ON parties.id = participants.party_id
    WHERE lower(participants.email) = ${parsed.value.email}
    ORDER BY parties.created_at DESC
  `) as {
    role: ParticipantRole;
    access_token: string;
    party_name: string;
  }[];

  if (rows.length === 0) return { sent: false, found: false };

  const lines: string[] = [];
  for (const row of rows) {
    if (row.role === ParticipantRole.Organizer) {
      lines.push(`Manage ${row.party_name}: ${await manageLink(row.access_token)}`);
    }
    lines.push(`Your page for ${row.party_name}: ${await guestLink(row.access_token)}`);
  }

  const result = await sendMail({
    to: parsed.value.email,
    subject: "Your Secret Santa links",
    text: lines.join("\n"),
  });
  return { sent: result.sent, found: true };
}

export async function reuseParty(manageToken: string, blockPreviousPairs: boolean) {
  const party = await requireManageParty(manageToken);
  const guests = party.participants
    .filter((participant) => participant.role === ParticipantRole.Guest)
    .map((participant) => ({ name: participant.name, email: participant.email }));
  const organizer = party.participants.find(
    (participant) => participant.role === ParticipantRole.Organizer,
  );
  if (!organizer) throw new PartyError("This party has no organizer.");

  const created = await createParty({
    organizerName: organizer.name,
    organizerEmail: organizer.email,
    guests,
    partyName: party.name,
    eventDate: party.eventDate,
    location: party.location,
    budget: party.budget,
    message: party.message,
  });

  if (blockPreviousPairs && party.status === PartyStatus.Drawn) {
    const copy = await requireManageParty(created.manageToken);
    const idByEmail = new Map(copy.participants.map((participant) => [participant.email, participant.id]));
    for (const participant of party.participants) {
      if (!participant.recipientId) continue;
      const recipient = party.participants.find((person) => person.id === participant.recipientId);
      if (!recipient) continue;
      const leftId = idByEmail.get(participant.email);
      const rightId = idByEmail.get(recipient.email);
      if (!leftId || !rightId || leftId === rightId) continue;
      await insertExclusion(copy.id, leftId, rightId);
    }
  }

  return created;
}

export async function getJoinParty(joinToken: string) {
  const sql = getDatabase();
  const rows = (await sql`
    SELECT name, event_date, location, budget, status
    FROM parties
    WHERE join_token = ${joinToken}
  `) as {
    name: string;
    event_date: string;
    location: string;
    budget: string;
    status: PartyStatus;
  }[];
  const party = rows[0];
  if (!party) return null;
  return {
    name: party.name,
    eventDate: party.event_date,
    location: party.location,
    budget: party.budget,
    status: party.status,
  };
}
