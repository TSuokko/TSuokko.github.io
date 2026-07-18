import test from "node:test";
import assert from "node:assert/strict";
import { createInventory, moveItem, placeItem } from "../js/inventory.js";
import { parseInventorySave, serializeInventory } from "../js/persistence.js";

const catalog = [
  { id: "knife", load: 2 },
  { id: "kit", load: 4 },
  { id: "satchel", load: 1, category: "Bag", properties: { Space: 5 } },
];

test("save data round-trips stable placement fields", () => {
  const inventory = placeItem(createInventory(3), catalog[0], 1, 1, true, "knife-1", false, 0, "Scout's <Knife>");
  const restored = parseInventorySave(serializeInventory(inventory), catalog).inventory;

  assert.equal(restored.strength, 3);
  assert.deepEqual(restored.placements, inventory.placements);
  assert.equal(restored.placements[0].customName, "Scout's <Knife>");
});

test("Bag capacity is derived from ordered placements during import", () => {
  const bag = catalog.find((item) => item.id === "satchel");
  const expanded = placeItem(createInventory(3), bag, 0, 0, false, "bag");
  const inventory = placeItem(expanded, catalog[0], 6, 3, false, "knife");
  const serialized = serializeInventory(inventory);
  const restored = parseInventorySave(serialized, catalog).inventory;

  assert.equal(restored.load, 35);
  assert.equal(restored.height, 7);
  const reducedBag = { ...bag, properties: { Space: 4 } };
  assert.throws(() => parseInventorySave(serialized, [catalog[0], catalog[1], reducedBag]), /out-of-bounds/);
});

test("Bag import works when an older item was moved into bonus capacity", () => {
  const bag = catalog.find((item) => item.id === "satchel");
  const cargoFirst = placeItem(createInventory(3), catalog[0], 0, 1, false, "knife");
  const expanded = placeItem(cargoFirst, bag, 0, 0, false, "bag");
  const inventory = moveItem(expanded, "knife", 6, 3);
  const restored = parseInventorySave(serializeInventory(inventory), catalog).inventory;

  assert.equal(restored.load, 35);
  assert.equal(restored.placements.find((placement) => placement.instanceId === "knife").row, 6);
});

test("imports reject unknown properties and prototype pollution keys", () => {
  const valid = JSON.parse(serializeInventory(createInventory(3)));
  const polluted = JSON.stringify(valid).replace(/}$/, ',"__proto__":{"polluted":true}}');
  assert.throws(() => parseInventorySave(polluted, catalog), /invalid structure/);

  const placement = { instanceId: "knife-1", itemId: "knife", row: 0, column: 0, rotated: false, flipped: false, shapeIndex: 0, customName: null, html: "<script>" };
  valid.placements = [placement];
  assert.throws(() => parseInventorySave(JSON.stringify(valid), catalog), /invalid placement/);
});

test("imports reject unknown items, duplicate IDs, overlap, and invalid bounds", () => {
  const base = JSON.parse(serializeInventory(createInventory(3)));
  const placement = { instanceId: "one", itemId: "knife", row: 0, column: 0, rotated: false, flipped: false, shapeIndex: 0, customName: null };

  assert.throws(() => parseInventorySave(JSON.stringify({ ...base, placements: [{ ...placement, itemId: "missing" }] }), catalog), /unknown item/);
  assert.throws(() => parseInventorySave(JSON.stringify({ ...base, placements: [placement, placement] }), catalog), /duplicate/);
  assert.throws(() => parseInventorySave(JSON.stringify({ ...base, placements: [placement, { ...placement, instanceId: "two" }] }), catalog), /overlapping/);
  assert.throws(() => parseInventorySave(JSON.stringify({ ...base, placements: [{ ...placement, row: 99 }] }), catalog), /out-of-bounds/);
});

test("imports enforce Strength, file size, and primitive field types", () => {
  const base = JSON.parse(serializeInventory(createInventory(3)));
  assert.throws(() => parseInventorySave(JSON.stringify({ ...base, strength: 11 }), catalog), /Strength/);
  assert.throws(() => parseInventorySave("x".repeat(100_001), catalog), /too large/);
  assert.throws(() => parseInventorySave(JSON.stringify({ ...base, placements: [{ instanceId: "one", itemId: "knife", row: "0", column: 0, rotated: false, flipped: false, shapeIndex: 0, customName: null }] }), catalog), /coordinates/);
  assert.throws(() => parseInventorySave(JSON.stringify({ ...base, placements: [{ instanceId: "one", itemId: "knife", row: 0, column: 0, rotated: false, flipped: false, shapeIndex: 99, customName: null }] }), catalog), /transform/);
  assert.throws(() => parseInventorySave(JSON.stringify({ ...base, placements: [{ instanceId: "one", itemId: "knife", row: 0, column: 0, rotated: false, flipped: false, shapeIndex: 0, customName: "<script>\n" }] }), catalog), /custom name/);
});

test("version-1 saves migrate to the default flip and shape state", () => {
  const legacy = {
    version: 1,
    strength: 3,
    savedAt: "2026-07-16T12:00:00.000Z",
    placements: [{ instanceId: "knife-1", itemId: "knife", row: 0, column: 0, rotated: true }],
  };
  const placement = parseInventorySave(JSON.stringify(legacy), catalog).inventory.placements[0];

  assert.equal(placement.rotated, true);
  assert.equal(placement.flipped, false);
  assert.equal(placement.shapeIndex, 0);
  assert.equal(placement.customName, null);
});

test("version-2 saves migrate with no custom name", () => {
  const legacy = {
    version: 2,
    strength: 3,
    savedAt: "2026-07-16T12:00:00.000Z",
    placements: [{ instanceId: "knife-1", itemId: "knife", row: 0, column: 0, rotated: false, flipped: true, shapeIndex: 0 }],
  };

  assert.equal(parseInventorySave(JSON.stringify(legacy), catalog).inventory.placements[0].customName, null);
});