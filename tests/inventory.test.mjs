import test from "node:test";
import assert from "node:assert/strict";
import {
  backpackDimensions,
  createInventory,
  cycleItemShape,
  flipItem,
  itemDimensions,
  itemFootprint,
  itemShapeCount,
  loadFromStrength,
  moveItem,
  occupiedLoad,
  placeItem,
  removeItem,
  renameItem,
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

test("composite items use the closest factor pair in landscape orientation", () => {
  assert.deepEqual(itemDimensions(6), { width: 3, height: 2 });
  assert.deepEqual(itemDimensions(4), { width: 2, height: 2 });
});

test("prime Load items fold into irregular two-row footprints", () => {
  const footprint = itemFootprint(7);
  assert.deepEqual({ width: footprint.width, height: footprint.height }, { width: 4, height: 2 });
  assert.deepEqual(footprint.cells, [
    { row: 0, column: 0 }, { row: 0, column: 1 }, { row: 0, column: 2 }, { row: 0, column: 3 },
    { row: 1, column: 0 }, { row: 1, column: 1 }, { row: 1, column: 2 },
  ]);
  assert.deepEqual(itemDimensions(5), { width: 3, height: 2 });
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
    width: 2, height: 2,
    cells: [
      { row: 0, column: 0 }, { row: 0, column: 1 },
      { row: 1, column: 0 }, { row: 1, column: 1 },
    ],
    rotated: false,
    flipped: false,
    shapeIndex: 0,
    customName: null,
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

test("irregular items can interlock without overlapping occupied cells", () => {
  const first = placeItem(createInventory(3), item("prime", 3), 0, 0, false, "one");
  const interlocked = placeItem(first, item("single", 1), 1, 1, false, "two");

  assert.ok(interlocked);
  assert.equal(occupiedLoad(interlocked), 4);
  assert.equal(placeItem(first, item("single", 1), 1, 0, false, "blocked"), null);
});

test("irregular rotation toggles between the base and 90-degree masks", () => {
  const baseInventory = placeItem(createInventory(3), item("prime", 7), 0, 0, false, "one");
  const basePlacement = baseInventory.placements[0];
  const rotatedInventory = rotateItem(baseInventory, "one");
  const rotatedPlacement = rotatedInventory.placements[0];

  assert.deepEqual({ width: rotatedPlacement.width, height: rotatedPlacement.height }, { width: 2, height: 4 });
  assert.deepEqual(rotateItem(rotatedInventory, "one").placements[0].cells, basePlacement.cells);
});

test("flip mirrors an irregular footprint and toggles back", () => {
  const inventory = placeItem(createInventory(3), item("prime", 7), 0, 0, false, "one");
  const flipped = flipItem(inventory, "one", item("prime", 7));

  assert.equal(flipped.placements[0].flipped, true);
  assert.deepEqual(flipped.placements[0].cells.at(-1), { row: 1, column: 1 });
  assert.deepEqual(flipItem(flipped, "one", item("prime", 7)).placements[0].cells, inventory.placements[0].cells);
});

test("shape cycles factor pairs for composites and folded widths for primes", () => {
  assert.equal(itemShapeCount(12), 3);
  assert.equal(itemShapeCount(7), 4);

  const composite = placeItem(createInventory(6), item("case", 12), 0, 0, false, "one");
  const nextComposite = cycleItemShape(composite, "one", item("case", 12));
  assert.deepEqual({ width: nextComposite.placements[0].width, height: nextComposite.placements[0].height }, { width: 6, height: 2 });

  const prime = placeItem(createInventory(3), item("prime", 7), 0, 0, false, "two");
  const nextPrime = cycleItemShape(prime, "two", item("prime", 7));
  assert.deepEqual({ width: nextPrime.placements[0].width, height: nextPrime.placements[0].height }, { width: 3, height: 3 });
});

test("rename changes only the selected item instance", () => {
  const first = placeItem(createInventory(3), item("knife", 2), 0, 0, false, "one");
  const inventory = placeItem(first, item("knife", 2), 1, 0, false, "two");
  const renamed = renameItem(inventory, "one", "Old Reliable");

  assert.equal(renamed.placements[0].customName, "Old Reliable");
  assert.equal(renamed.placements[1].customName, null);
  assert.equal(renameItem(inventory, "missing", "Name"), null);
});