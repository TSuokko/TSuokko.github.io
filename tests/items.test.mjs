import test from "node:test";
import assert from "node:assert/strict";
import { ITEMS, matchesItemSearch } from "../js/items.js";

test("item search matches names and categories without case sensitivity", () => {
  const medicalKit = ITEMS.find((item) => item.id === "medical-kit");

  assert.equal(matchesItemSearch(medicalKit, "kit"), true);
  assert.equal(matchesItemSearch(medicalKit, "MEDICAL"), true);
  assert.equal(matchesItemSearch(medicalKit, "tool"), false);
});

test("empty search terms match every catalog item", () => {
  assert.equal(ITEMS.every((item) => matchesItemSearch(item, "  ")), true);
});