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
  const { width, height } = itemFootprint(load);
  return { width, height };
}

function itemShapeVariants(load) {
  const pairs = factorPairs(load);
  if (pairs.length === 1 && load > 2) {
    return Array.from({ length: Math.ceil(load / 2) }, (_, index) => {
      const width = Math.ceil(load / 2) - index;
      return { width, height: Math.ceil(load / width) };
    });
  }

  return [...pairs].reverse().map((pair) => ({ width: pair.height, height: pair.width }));
}

export function itemShapeCount(load) {
  return itemShapeVariants(load).length;
}

export function itemFootprint(load, rotated = false, flipped = false, shapeIndex = 0) {
  const variants = itemShapeVariants(load);
  const variant = variants[((shapeIndex % variants.length) + variants.length) % variants.length];
  let { width, height } = variant;
  let cells = Array.from({ length: load }, (_, index) => ({
    row: Math.floor(index / width),
    column: index % width,
  }));

  if (flipped) {
    cells = cells.map((cell) => ({ row: cell.row, column: width - 1 - cell.column }));
  }
  if (!rotated) return { width, height, cells };

  cells = cells.map((cell) => ({ row: cell.column, column: height - 1 - cell.row }));
  [width, height] = [height, width];
  return {
    width,
    height,
    cells,
  };
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

  const occupiedCells = new Set();
  for (const placed of inventory.placements) {
    if (placed.instanceId === ignoredInstanceId) continue;
    for (const cell of placed.cells) {
      occupiedCells.add(`${placed.row + cell.row}:${placed.column + cell.column}`);
    }
  }

  return candidate.cells.every((cell) => (
    !occupiedCells.has(`${candidate.row + cell.row}:${candidate.column + cell.column}`)
  ));
}

export function placeItem(inventory, item, row, column, rotated = false, instanceId = crypto.randomUUID(), flipped = false, shapeIndex = 0) {
  const footprint = itemFootprint(item.load, rotated, flipped, shapeIndex);
  const candidate = {
    instanceId,
    itemId: item.id,
    row,
    column,
    width: footprint.width,
    height: footprint.height,
    cells: footprint.cells,
    rotated,
    flipped,
    shapeIndex,
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
    cells: current.rotated
      ? current.cells.map((cell) => ({ row: current.width - 1 - cell.column, column: cell.row }))
      : current.cells.map((cell) => ({ row: cell.column, column: current.height - 1 - cell.row })),
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
  return inventory.placements.reduce((total, item) => total + item.cells.length, 0);
}

export function flipItem(inventory, instanceId, item) {
  const current = inventory.placements.find((placement) => placement.instanceId === instanceId);
  if (!current) return null;

  const footprint = itemFootprint(item.load, current.rotated, !current.flipped, current.shapeIndex);
  const candidate = { ...current, ...footprint, flipped: !current.flipped };
  if (!placementFits(inventory, candidate, instanceId)) return null;

  return {
    ...inventory,
    placements: inventory.placements.map((placement) => placement.instanceId === instanceId ? candidate : placement),
  };
}

export function cycleItemShape(inventory, instanceId, item) {
  const current = inventory.placements.find((placement) => placement.instanceId === instanceId);
  if (!current) return null;

  const shapeIndex = (current.shapeIndex + 1) % itemShapeCount(item.load);
  const footprint = itemFootprint(item.load, current.rotated, current.flipped, shapeIndex);
  const candidate = { ...current, ...footprint, shapeIndex };
  if (!placementFits(inventory, candidate, instanceId)) return null;

  return {
    ...inventory,
    placements: inventory.placements.map((placement) => placement.instanceId === instanceId ? candidate : placement),
  };
}