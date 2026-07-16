import test from "node:test";
import assert from "node:assert/strict";
import {
  backpackDimensions,
  createInventory,
  itemDimensions,
  loadFromStrength,
  moveItem,
  occupiedLoad,
  placeItem,
  removeItem,
  rotateItem,
} from "../js/inventory.js";

const item = (id, load) => ({ id, load });

test("Strength produces Load in multiples of ten", () => {
  assert.equal(loadFromStrength(1), 10);
  assert.equal(loadFromStrength(10), 100);
  assert.throws(() => loadFromStrength(0), RangeError);
});

test("backpacks use the closest strictly portrait factor pair", () => {
  assert.deepEqual(backpackDimensions(10), { width: 2, height: 5 });
  assert.deepEqual(backpackDimensions(30), { width: 5, height: 6 });
  assert.deepEqual(backpackDimensions(100), { width: 5, height: 20 });
});

test("items use the closest factor pair in landscape orientation", () => {
  assert.deepEqual(itemDimensions(6), { width: 3, height: 2 });
  assert.deepEqual(itemDimensions(4), { width: 2, height: 2 });
  assert.deepEqual(itemDimensions(5), { width: 5, height: 1 });
});

test("placement rejects overlap and every out-of-bounds direction", () => {
  const inventory = createInventory(3);
  const placed = placeItem(inventory, item("case", 4), 1, 1, false, "one");
  assert.ok(placed);
  assert.equal(placeItem(placed, item("other", 2), 1, 1, false, "two"), null);
  assert.equal(placeItem(placed, item("other", 2), -1, 0), null);
  assert.equal(placeItem(placed, item("other", 2), 0, -1), null);
  assert.equal(placeItem(placed, item("other", 2), placed.height, 0), null);
  assert.equal(placeItem(placed, item("other", 2), 0, placed.width), null);
});

test("invalid moves preserve prior state and valid moves retain identity", () => {
  const inventory = placeItem(createInventory(3), item("case", 4), 0, 0, false, "one");
  assert.equal(moveItem(inventory, "one", 0, inventory.width), null);
  assert.deepEqual(inventory.placements[0], {
    instanceId: "one", itemId: "case", row: 0, column: 0,
    width: 2, height: 2, rotated: false,
  });
  assert.equal(moveItem(inventory, "one", 2, 0).placements[0].row, 2);
});

test("rotation is accepted only when the rotated footprint fits", () => {
  const inventory = placeItem(createInventory(1), item("bar", 2), 0, 0, true, "one");
  const rotated = rotateItem(inventory, "one");
  assert.deepEqual(
    { width: rotated.placements[0].width, height: rotated.placements[0].height },
    { width: 2, height: 1 },
  );

  const edge = moveItem(inventory, "one", 0, 1);
  assert.equal(rotateItem(edge, "one"), null);
});

test("removal releases occupied Load", () => {
  const inventory = placeItem(createInventory(2), item("case", 4), 0, 0, false, "one");
  assert.equal(occupiedLoad(inventory), 4);
  assert.equal(occupiedLoad(removeItem(inventory, "one")), 0);
});