export function loadFromStrength(strength) {
  if (!Number.isInteger(strength) || strength < 1 || strength > 10) {
    throw new RangeError("Strength must be an integer from 1 to 10.");
  }

  return strength * 10;
}

function factorPairs(load) {
  if (!Number.isInteger(load) || load < 1) {
    throw new RangeError("Load must be a positive integer.");
  }

  const pairs = [];
  for (let width = 1; width <= Math.sqrt(load); width += 1) {
    if (load % width === 0) {
      pairs.push({ width, height: load / width });
    }
  }
  return pairs;
}

export function backpackDimensions(load) {
  const portraitPairs = factorPairs(load).filter(({ width, height }) => height > width);
  if (portraitPairs.length === 0) {
    throw new RangeError("Backpack Load must have a portrait factor pair.");
  }

  return portraitPairs.at(-1);
}

export function itemDimensions(load) {
  const closestPair = factorPairs(load).at(-1);
  return { width: closestPair.height, height: closestPair.width };
}

export function createInventory(strength = 3) {
  const load = loadFromStrength(strength);
  const { width, height } = backpackDimensions(load);
  return { strength, load, width, height, placements: [] };
}

export function placementFits(inventory, candidate, ignoredInstanceId = null) {
  if (
    candidate.row < 0 ||
    candidate.column < 0 ||
    candidate.row + candidate.height > inventory.height ||
    candidate.column + candidate.width > inventory.width
  ) {
    return false;
  }

  return inventory.placements.every((placed) => {
    if (placed.instanceId === ignoredInstanceId) return true;
    return (
      candidate.column + candidate.width <= placed.column ||
      candidate.column >= placed.column + placed.width ||
      candidate.row + candidate.height <= placed.row ||
      candidate.row >= placed.row + placed.height
    );
  });
}

export function placeItem(inventory, item, row, column, rotated = false, instanceId = crypto.randomUUID()) {
  const base = itemDimensions(item.load);
  const candidate = {
    instanceId,
    itemId: item.id,
    row,
    column,
    width: rotated ? base.height : base.width,
    height: rotated ? base.width : base.height,
    rotated,
  };

  if (!placementFits(inventory, candidate)) return null;
  return { ...inventory, placements: [...inventory.placements, candidate] };
}

export function moveItem(inventory, instanceId, row, column) {
  const current = inventory.placements.find((item) => item.instanceId === instanceId);
  if (!current) return null;

  const candidate = { ...current, row, column };
  if (!placementFits(inventory, candidate, instanceId)) return null;

  return {
    ...inventory,
    placements: inventory.placements.map((item) => item.instanceId === instanceId ? candidate : item),
  };
}

export function rotateItem(inventory, instanceId) {
  const current = inventory.placements.find((item) => item.instanceId === instanceId);
  if (!current) return null;

  const candidate = {
    ...current,
    width: current.height,
    height: current.width,
    rotated: !current.rotated,
  };
  if (!placementFits(inventory, candidate, instanceId)) return null;

  return {
    ...inventory,
    placements: inventory.placements.map((item) => item.instanceId === instanceId ? candidate : item),
  };
}

export function removeItem(inventory, instanceId) {
  return {
    ...inventory,
    placements: inventory.placements.filter((item) => item.instanceId !== instanceId),
  };
}

export function occupiedLoad(inventory) {
  return inventory.placements.reduce((total, item) => total + item.width * item.height, 0);
}