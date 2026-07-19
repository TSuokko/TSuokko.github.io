import test from "node:test";
import assert from "node:assert/strict";
import { ammoBundleQuantity, CATEGORY_COLORS, categoryColor, compatibleAmmo, ITEMS, matchesItemSearch, meetsItemRequirement } from "../js/items.js";

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

test("Ammo bundle quantities and AmmoId links are valid", () => {
  const ammoItems = ITEMS.filter((item) => item.category === "Ammo");
  assert.equal(ammoItems.every((item) => Number.isInteger(ammoBundleQuantity(item))), true);
  assert.equal(ITEMS.filter((item) => item.AmmoId).every((item) => compatibleAmmo(item)), true);
  assert.equal(ammoBundleQuantity(ITEMS.find((item) => item.id === "9mmammo")), 10);
  assert.equal(ammoBundleQuantity(ITEMS.find((item) => item.id === "ECammo")), 30);
  assert.equal(ammoBundleQuantity(ITEMS.find((item) => item.id === "Missile")), 1);
});