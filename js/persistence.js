import { createInventory, itemShapeCount, placeItem } from "./inventory.js";

export const SAVE_VERSION = 2;
export const MAX_SAVE_BYTES = 100_000;
const MAX_PLACEMENTS = 100;
const INSTANCE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(record, allowedKeys) {
  const keys = Object.keys(record);
  return keys.length === allowedKeys.length && keys.every((key) => allowedKeys.includes(key));
}

export function createSaveData(inventory, savedAt = new Date().toISOString()) {
  return {
    version: SAVE_VERSION,
    strength: inventory.strength,
    savedAt,
    placements: inventory.placements.map(({ instanceId, itemId, row, column, rotated, flipped, shapeIndex }) => ({
      instanceId,
      itemId,
      row,
      column,
      rotated,
      flipped,
      shapeIndex,
    })),
  };
}

export function serializeInventory(inventory) {
  return JSON.stringify(createSaveData(inventory), null, 2);
}

export function parseInventorySave(text, catalog) {
  if (typeof text !== "string" || new TextEncoder().encode(text).length > MAX_SAVE_BYTES) {
    throw new Error("Save file is too large.");
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Save file is not valid JSON.");
  }

  if (!isRecord(data) || !hasExactKeys(data, ["version", "strength", "savedAt", "placements"])) {
    throw new Error("Save file has an invalid structure.");
  }
  if (data.version !== 1 && data.version !== SAVE_VERSION) throw new Error("Save file version is not supported.");
  if (!Number.isInteger(data.strength) || data.strength < 1 || data.strength > 10) {
    throw new Error("Save file contains an invalid Strength score.");
  }
  if (typeof data.savedAt !== "string" || data.savedAt.length > 40 || !Number.isFinite(Date.parse(data.savedAt))) {
    throw new Error("Save file contains an invalid save time.");
  }
  if (!Array.isArray(data.placements) || data.placements.length > MAX_PLACEMENTS) {
    throw new Error("Save file contains too many placements.");
  }

  const itemsById = new Map(catalog.map((item) => [item.id, item]));
  const instanceIds = new Set();
  let inventory = createInventory(data.strength);

  for (const placement of data.placements) {
    const placementKeys = data.version === 1
      ? ["instanceId", "itemId", "row", "column", "rotated"]
      : ["instanceId", "itemId", "row", "column", "rotated", "flipped", "shapeIndex"];
    if (!isRecord(placement) || !hasExactKeys(placement, placementKeys)) {
      throw new Error("Save file contains an invalid placement.");
    }
    if (typeof placement.instanceId !== "string" || !INSTANCE_ID_PATTERN.test(placement.instanceId)) {
      throw new Error("Save file contains an invalid instance ID.");
    }
    if (instanceIds.has(placement.instanceId)) throw new Error("Save file contains duplicate instance IDs.");
    if (typeof placement.itemId !== "string" || !itemsById.has(placement.itemId)) {
      throw new Error("Save file references an unknown item.");
    }
    if (!Number.isInteger(placement.row) || !Number.isInteger(placement.column) || typeof placement.rotated !== "boolean") {
      throw new Error("Save file contains invalid placement coordinates.");
    }
    const item = itemsById.get(placement.itemId);
    const flipped = data.version === 1 ? false : placement.flipped;
    const shapeIndex = data.version === 1 ? 0 : placement.shapeIndex;
    if (typeof flipped !== "boolean" || !Number.isInteger(shapeIndex) || shapeIndex < 0 || shapeIndex >= itemShapeCount(item.load)) {
      throw new Error("Save file contains an invalid item transform.");
    }

    const next = placeItem(
      inventory,
      item,
      placement.row,
      placement.column,
      placement.rotated,
      placement.instanceId,
      flipped,
      shapeIndex,
    );
    if (!next) throw new Error("Save file contains overlapping or out-of-bounds items.");
    inventory = next;
    instanceIds.add(placement.instanceId);
  }

  return { inventory, savedAt: data.savedAt };
}