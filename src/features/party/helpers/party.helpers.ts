export type PersonInput = {
  name: string;
  email: string;
};

export type CreatePartyInput = {
  organizerName: string;
  organizerEmail: string;
  guests: PersonInput[];
  partyName: string;
  eventDate: string;
  location: string;
  budget: string;
  message: string;
};

export type ParsedParty =
  | { ok: true; value: CreatePartyInput }
  | { ok: false; error: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parsePeopleList(csvText: string): PersonInput[] {
  return csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const separator = line.indexOf(",");
      if (separator === -1) return { name: line, email: "" };
      return {
        name: line.slice(0, separator).trim(),
        email: line.slice(separator + 1).trim(),
      };
    });
}

export function parseCreateParty(input: CreatePartyInput): ParsedParty {
  const organizerName = input.organizerName.trim();
  const organizerEmail = input.organizerEmail.trim().toLowerCase();
  const guests = input.guests
    .map((guest) => ({
      name: guest.name.trim(),
      email: guest.email.trim().toLowerCase(),
    }))
    .filter((guest) => guest.name.length > 0 || guest.email.length > 0);

  if (!organizerName || !organizerEmail) {
    return { ok: false, error: "Add your name and email." };
  }
  if (!emailPattern.test(organizerEmail)) {
    return { ok: false, error: "Enter a valid email for the organizer." };
  }
  if (guests.length < 2) {
    return { ok: false, error: "Add at least 2 other people." };
  }
  for (const guest of guests) {
    if (!guest.name || !emailPattern.test(guest.email)) {
      return { ok: false, error: "Every person needs a name and a valid email." };
    }
  }

  const emails = [organizerEmail, ...guests.map((guest) => guest.email)];
  if (new Set(emails).size !== emails.length) {
    return { ok: false, error: "Each email can only be used once in a party." };
  }

  const partyName = input.partyName.trim();
  const eventDate = input.eventDate.trim();
  if (!partyName || !eventDate) {
    return { ok: false, error: "Add a party name and a date." };
  }

  return {
    ok: true,
    value: {
      organizerName,
      organizerEmail,
      guests,
      partyName,
      eventDate,
      location: input.location.trim(),
      budget: input.budget.trim(),
      message: input.message.trim(),
    },
  };
}

export function parsePerson(name: string, email: string): { ok: true; value: PersonInput } | { ok: false; error: string } {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedName || !emailPattern.test(trimmedEmail)) {
    return { ok: false, error: "Enter a name and a valid email." };
  }
  return { ok: true, value: { name: trimmedName, email: trimmedEmail } };
}

export function guestPageLetter(partyName: string, pageLink: string) {
  return [
    "Merry Christmas 🎄",
    "",
    `Welcome to ${partyName}! What a joy to have you with us. 🎁✨`,
    "",
    pageLink,
    "",
    "Warm wishes 🎅",
    "Secret Santa",
  ].join("\n");
}

export function wishlistUpdatedLetter(gifteeName: string, pageLink: string) {
  return [`${gifteeName} updated their wishlist.`, "", pageLink].join("\n");
}

export function noteSentLetter(body: string, pageLink: string) {
  return ["Your Secret Santa sent a note.", "", body, "", pageLink].join("\n");
}

export function orderedPair(leftId: string, rightId: string) {
  return leftId < rightId
    ? { participantAId: leftId, participantBId: rightId }
    : { participantAId: rightId, participantBId: leftId };
}
