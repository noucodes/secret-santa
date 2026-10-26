import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { guestPageLetter } from "./party.helpers.ts";

describe("guestPageLetter", () => {
  it("welcomes the guest and keeps the private link", () => {
    const letter = guestPageLetter("Test Party", "http://localhost:3000/party/abc");

    assert.match(letter, /^Merry Christmas\./);
    assert.match(letter, /Test Party/);
    assert.match(letter, /person you buy for/);
    assert.match(letter, /http:\/\/localhost:3000\/party\/abc/);
    assert.equal(letter.includes("\u2014"), false);
  });
});
