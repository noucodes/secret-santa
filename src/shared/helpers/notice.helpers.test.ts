import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeNotice, encodeNotice, urlWithoutNotice } from "./notice.helpers.ts";

describe("encodeNotice", () => {
  it("round-trips a notice through a cookie value", () => {
    assert.equal(decodeNotice(encodeNotice("Link sent.")), "Link sent.");
  });

  it("returns nothing for an empty cookie", () => {
    assert.equal(decodeNotice(undefined), undefined);
  });
});

describe("urlWithoutNotice", () => {
  it("drops the notice query so a refresh stays quiet", () => {
    assert.equal(urlWithoutNotice("http://localhost:3001/manage/abc?notice=Link%20sent."), "/manage/abc");
  });

  it("keeps other query params", () => {
    assert.equal(
      urlWithoutNotice("http://localhost:3001/manage/abc?reveal=1&notice=Link%20sent."),
      "/manage/abc?reveal=1",
    );
  });

  it("leaves a url with no notice unchanged", () => {
    assert.equal(urlWithoutNotice("http://localhost:3001/party/abc"), "/party/abc");
  });
});
