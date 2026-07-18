import test from "node:test";
import assert from "node:assert/strict";
import { CATEGORY_COLORS, categoryColor, ITEMS, matchesItemSearch, meetsItemRequirement } from "../js/items.js";

test("item search matches names and categories without case sensitivity", () => {
  const clothArmor = ITEMS.find((item) => item.id === "cloth-armor");

  assert.equal(matchesItemSearch(clothArmor, "cloth"), true);
  assert.equal(matchesItemSearch(clothArmor, "ARMOR"), true);
  assert.equal(matchesItemSearch(clothArmor, "melee"), false);
});

test("empty search terms match every catalog item", () => {
  assert.equal(ITEMS.every((item) => matchesItemSearch(item, "  ")), true);
});

test("item requirements compare against Strength inclusively", () => {
  const metalArmor = ITEMS.find((item) => item.id === "metal-armor");

  assert.equal(meetsItemRequirement(metalArmor, 4), false);
  assert.equal(meetsItemRequirement(metalArmor, 5), true);
  assert.equal(meetsItemRequirement(metalArmor, 6), true);
});

test("items in the same category always resolve to the same color", () => {
  const meleeColors = ITEMS
    .filter((item) => item.category === "Melee")
    .map((item) => categoryColor(item.category));

  assert.deepEqual([...new Set(meleeColors)], [CATEGORY_COLORS.Melee]);
  assert.equal(categoryColor("Unknown"), "#718071");
});

test("every catalog item exposes description and properties fields", () => {
  assert.equal(ITEMS.every((item) => typeof item.description === "string" && item.description.length > 0), true);
  assert.equal(ITEMS.every((item) => item.properties && typeof item.properties === "object"), true);
  assert.equal(Object.keys(ITEMS.find((item) => item.id === "knife").properties).length > 0, true);
});