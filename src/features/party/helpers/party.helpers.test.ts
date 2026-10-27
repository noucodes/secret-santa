import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { guestPageLetter, noteSentLetter, wishlistUpdatedLetter } from "./party.helpers.ts";

describe("wishlistUpdatedLetter", () => {
  it("tells the buyer their giftee updated the list", () => {
    const letter = wishlistUpdatedLetter("Ada", "http://localhost:3000/party/buyer");

    assert.match(letter, /Ada updated their wishlist/);
    assert.match(letter, /http:\/\/localhost:3000\/party\/buyer/);
  });
});

describe("noteSentLetter", () => {
  it("stays anonymous and keeps the note and page link", () => {
    const letter = noteSentLetter("Wool socks", "http://localhost:3000/party/giftee");

    assert.match(letter, /Your Secret Santa sent a note/);
    assert.match(letter, /Wool socks/);
    assert.match(letter, /http:\/\/localhost:3000\/party\/giftee/);
    assert.equal(letter.includes("Ada"), false);
  });
});

describe("guestPageLetter", () => {
  it("welcomes the guest and keeps the private link", () => {
    const letter = guestPageLetter("Test Party", "http://localhost:3000/party/abc");

    assert.match(letter, /Merry Christmas/);
    assert.match(letter, /Welcome to Test Party/);
    assert.match(letter, /🎄/);
    assert.match(letter, /http:\/\/localhost:3000\/party\/abc/);
    assert.equal(letter.includes("person you buy for"), false);
    assert.equal(letter.includes("names are drawn"), false);
    assert.equal(letter.includes("\u2014"), false);
  });
});
