import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { urlWithoutNotice } from "./notice.helpers.ts";

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
