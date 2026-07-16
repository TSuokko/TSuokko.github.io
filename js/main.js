import {
  createInventory,
  cycleItemShape,
  flipItem,
  itemDimensions,
  itemFootprint,
  itemShapeCount,
  moveItem,
  occupiedLoad,
  placeItem,
  placementFits,
  removeItem,
  rotateItem,
} from "./inventory.js";
import { categoryColor, ITEMS, matchesItemSearch, meetsItemRequirement } from "./items.js";
import { createSaveData, MAX_SAVE_BYTES, parseInventorySave, serializeInventory } from "./persistence.js";

const STORAGE_KEY = "field-loadout.inventory.v1";

const elements = {
  strength: document.querySelector("#strength"),
  capacity: document.querySelector("#capacity"),
  occupied: document.querySelector("#occupied"),
  saveStatus: document.querySelector("#save-status"),
  exportSave: document.querySelector("#export-save"),
  importSave: document.querySelector("#import-save"),
  saveFile: document.querySelector("#save-file"),
  reset: document.querySelector("#reset"),
  search: document.querySelector("#item-search"),
  catalog: document.querySelector("#catalog-list"),
  resultCount: document.querySelector("#result-count"),
  footprint: document.querySelector("#footprint-preview"),
  selectionLabel: document.querySelector("#selection-label"),
  selectionSize: document.querySelector("#selection-size"),
  rotate: document.querySelector("#rotate"),
  flip: document.querySelector("#flip"),
  shape: document.querySelector("#shape"),
  remove: document.querySelector("#remove"),
  dimensions: document.querySelector("#dimensions"),
  grid: document.querySelector("#inventory-grid"),
  toast: document.querySelector("#toast"),
};

let inventory = createInventory(3);
let lastSavedAt = null;
let storageEnabled = true;
let startupMessage = null;
let selectedCatalogId = null;
let selectedInstanceId = null;
let pendingRotation = false;
let pendingFlipped = false;
let pendingShapeIndex = 0;
let dragState = null;
let preview = null;
let pointerDrag = null;
let suppressClickUntil = 0;
let toastTimer = null;

try {
  const storedSave = localStorage.getItem(STORAGE_KEY);
  if (storedSave) {
    try {
      const restored = parseInventorySave(storedSave, ITEMS);
      inventory = restored.inventory;
      lastSavedAt = restored.savedAt;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      startupMessage = "An invalid or outdated local save was discarded.";
    }
  }
} catch {
  storageEnabled = false;
  startupMessage = "Local save could not be restored. Export is still available.";
}

for (let strength = 1; strength <= 10; strength += 1) {
  const option = document.createElement("option");
  option.value = strength;
  option.textContent = `${strength}  ·  Load ${strength * 10}`;
  option.selected = strength === inventory.strength;
  elements.strength.append(option);
}

function catalogItem(id) {
  return ITEMS.find((item) => item.id === id);
}

function selectedPlacement() {
  return inventory.placements.find((item) => item.instanceId === selectedInstanceId);
}

function clearPendingTransform() {
  pendingRotation = false;
  pendingFlipped = false;
  pendingShapeIndex = 0;
}

function announce(message, isError = false) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.toggle("error", isError);
  elements.toast.classList.add("visible");
  toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 2400);
}

function appendShapeCells(container, cells) {
  for (const cell of cells) {
    const shapeCell = document.createElement("i");
    shapeCell.className = "shape-cell";
    shapeCell.style.gridColumn = cell.column + 1;
    shapeCell.style.gridRow = cell.row + 1;
    shapeCell.setAttribute("aria-hidden", "true");
    container.append(shapeCell);
  }
}

function formatSaveTime(savedAt) {
  if (!savedAt) return storageEnabled ? "Ready" : "Unavailable";
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(savedAt));
}

function renderSaveStatus() {
  elements.saveStatus.textContent = formatSaveTime(lastSavedAt);
  elements.saveStatus.title = lastSavedAt ? `Last saved ${new Date(lastSavedAt).toLocaleString()}` : "No local save yet";
}

function persistInventory() {
  if (!storageEnabled) return;
  const saveData = createSaveData(inventory);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    lastSavedAt = saveData.savedAt;
    renderSaveStatus();
  } catch {
    storageEnabled = false;
    renderSaveStatus();
    announce("Local save failed. Export a backup instead.", true);
  }
}

function renderCatalog() {
  const results = ITEMS.filter((item) => matchesItemSearch(item, elements.search.value));
  elements.catalog.replaceChildren();
  elements.resultCount.textContent = `${results.length} item${results.length === 1 ? "" : "s"}`;

  for (const item of results) {
    const dimensions = itemDimensions(item.load);
    const requirementMet = meetsItemRequirement(item, inventory.strength);
    const itemColor = categoryColor(item.category);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "catalog-item";
    button.dataset.itemId = item.id;
    button.draggable = true;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(selectedCatalogId === item.id));
    button.setAttribute("aria-label", `${item.name}, Load ${item.load}, requires Strength ${item.requirement}${requirementMet ? "" : ", requirement not met"}`);
    if (selectedCatalogId === item.id) button.classList.add("selected");
    if (!requirementMet) button.classList.add("requirement-unmet");
    button.innerHTML = `
      <span class="item-swatch" style="--item-color: ${itemColor}" aria-hidden="true"></span>
      <span class="item-copy"><strong>${item.name}</strong><small>${item.category} · STR ${item.requirement}</small></span>
      <span class="item-load"><strong>${item.load}</strong><small>${dimensions.width}×${dimensions.height}</small></span>
    `;
    elements.catalog.append(button);
  }
}

function placementElement(placement) {
  const item = catalogItem(placement.itemId);
  const itemColor = categoryColor(item.category);
  const requirementMet = meetsItemRequirement(item, inventory.strength);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "placed-item";
  button.draggable = true;
  button.dataset.instanceId = placement.instanceId;
  button.style.gridColumn = `${placement.column + 1} / span ${placement.width}`;
  button.style.gridRow = `${placement.row + 1} / span ${placement.height}`;
  button.style.setProperty("--shape-columns", placement.width);
  button.style.setProperty("--shape-rows", placement.height);
  button.style.setProperty("--item-color", itemColor);
  button.title = `${item.name}, Load ${item.load}, requires Strength ${item.requirement}`;
  button.setAttribute("aria-label", `${item.name}, Load ${item.load}, requires Strength ${item.requirement}${requirementMet ? "" : ", requirement not met"}, at row ${placement.row + 1}, column ${placement.column + 1}`);
  if (selectedInstanceId === placement.instanceId) button.classList.add("selected");
  if (!requirementMet) button.classList.add("requirement-unmet");
  appendShapeCells(button, placement.cells);
  const name = document.createElement("span");
  name.className = "item-name";
  name.textContent = item.name;
  const load = document.createElement("small");
  load.textContent = item.load;
  button.append(name, load);
  return button;
}

function renderPlacementPreview() {
  elements.grid.querySelector(".placement-preview")?.remove();
  if (!preview) return;

  const marker = document.createElement("div");
  marker.className = `placement-preview ${preview.valid ? "valid" : "invalid"}`;
  marker.style.gridColumn = `${preview.column + 1} / span ${preview.width}`;
  marker.style.gridRow = `${preview.row + 1} / span ${preview.height}`;
  marker.style.setProperty("--shape-columns", preview.width);
  marker.style.setProperty("--shape-rows", preview.height);
  appendShapeCells(marker, preview.cells);
  const label = document.createElement("span");
  label.textContent = preview.valid ? "Place" : "Blocked";
  marker.append(label);
  elements.grid.append(marker);
}

function renderGrid() {
  elements.grid.replaceChildren();
  elements.grid.style.setProperty("--columns", inventory.width);
  elements.grid.style.setProperty("--rows", inventory.height);

  for (let row = 0; row < inventory.height; row += 1) {
    for (let column = 0; column < inventory.width; column += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "grid-cell";
      cell.dataset.row = row;
      cell.dataset.column = column;
      cell.style.gridColumn = column + 1;
      cell.style.gridRow = row + 1;
      cell.setAttribute("aria-label", `Row ${row + 1}, column ${column + 1}`);
      elements.grid.append(cell);
    }
  }

  for (const placement of inventory.placements) {
    elements.grid.append(placementElement(placement));
  }

  renderPlacementPreview();
}

function renderSelection() {
  const placement = selectedPlacement();
  const item = placement ? catalogItem(placement.itemId) : catalogItem(selectedCatalogId);
  elements.remove.disabled = !placement;
  elements.rotate.disabled = !item;
  elements.shape.disabled = !item || itemShapeCount(item.load) <= 1;
  elements.footprint.replaceChildren();
  elements.footprint.removeAttribute("style");

  if (!item) {
    elements.flip.disabled = true;
    elements.selectionLabel.textContent = "Nothing selected";
    elements.selectionSize.textContent = "Choose an item";
    return;
  }

  const footprint = placement
    ? { width: placement.width, height: placement.height, cells: placement.cells }
    : itemFootprint(item.load, pendingRotation, pendingFlipped, pendingShapeIndex);
  elements.flip.disabled = footprint.cells.length === footprint.width * footprint.height;
  elements.footprint.style.setProperty("--preview-columns", footprint.width);
  elements.footprint.style.setProperty("--preview-rows", footprint.height);
  elements.footprint.style.setProperty("--preview-color", categoryColor(item.category));
  appendShapeCells(elements.footprint, footprint.cells);
  elements.selectionLabel.textContent = placement ? "Packed item" : "Ready to place";
  elements.selectionSize.textContent = `${item.name} · ${footprint.width}×${footprint.height}`;
}

function renderStatus() {
  elements.capacity.textContent = inventory.load;
  elements.occupied.textContent = `${occupiedLoad(inventory)} / ${inventory.load}`;
  elements.dimensions.textContent = `${inventory.width} columns × ${inventory.height} rows`;
}

function renderAll() {
  renderCatalog();
  renderGrid();
  renderSelection();
  renderStatus();
  renderSaveStatus();
}

function chooseCatalogItem(itemId) {
  selectedCatalogId = itemId;
  selectedInstanceId = null;
  clearPendingTransform();
  renderAll();
}

function candidateFor(item, row, column, rotated, flipped = false, shapeIndex = 0, ignoredInstanceId = null) {
  const footprint = itemFootprint(item.load, rotated, flipped, shapeIndex);
  const candidate = {
    row,
    column,
    width: footprint.width,
    height: footprint.height,
    cells: footprint.cells,
  };
  return { ...candidate, valid: placementFits(inventory, candidate, ignoredInstanceId) };
}

function placeSelected(row, column) {
  const item = catalogItem(selectedCatalogId);
  if (!item) return;
  const next = placeItem(inventory, item, row, column, pendingRotation, undefined, pendingFlipped, pendingShapeIndex);
  if (!next) {
    announce("That item does not fit there.", true);
    return;
  }
  inventory = next;
  selectedCatalogId = null;
  clearPendingTransform();
  selectedInstanceId = inventory.placements.at(-1).instanceId;
  persistInventory();
  announce(`${item.name} packed.`);
  renderAll();
}

function gridPosition(event) {
  const rect = elements.grid.getBoundingClientRect();
  return {
    column: Math.max(0, Math.min(inventory.width - 1, Math.floor((event.clientX - rect.left) / rect.width * inventory.width))),
    row: Math.max(0, Math.min(inventory.height - 1, Math.floor((event.clientY - rect.top) / rect.height * inventory.height))),
  };
}

function updateDragPreview(event) {
  const rect = elements.grid.getBoundingClientRect();
  const overGrid = event.clientX >= rect.left && event.clientX <= rect.right
    && event.clientY >= rect.top && event.clientY <= rect.bottom;

  if (!dragState || !overGrid) {
    preview = null;
    renderPlacementPreview();
    return;
  }

  const { row, column } = gridPosition(event);
  if (dragState.type === "new") {
    preview = candidateFor(catalogItem(dragState.itemId), row, column, dragState.rotated, dragState.flipped, dragState.shapeIndex);
  } else {
    const placement = inventory.placements.find((item) => item.instanceId === dragState.instanceId);
    preview = {
      row, column, width: placement.width, height: placement.height, cells: placement.cells,
      valid: placementFits(inventory, { ...placement, row, column }, placement.instanceId),
    };
  }
  renderPlacementPreview();
}

function commitActiveDrag() {
  if (!dragState || !preview?.valid) return false;

  if (dragState.type === "new") {
    const item = catalogItem(dragState.itemId);
    inventory = placeItem(inventory, item, preview.row, preview.column, dragState.rotated, undefined, dragState.flipped, dragState.shapeIndex);
    selectedInstanceId = inventory.placements.at(-1).instanceId;
    selectedCatalogId = null;
    clearPendingTransform();
    persistInventory();
    announce(`${item.name} packed.`);
  } else {
    inventory = moveItem(inventory, dragState.instanceId, preview.row, preview.column);
    persistInventory();
    announce("Item moved.");
  }
  return true;
}

function beginPointerDrag(event, source, state, label) {
  if (event.pointerType !== "touch" && event.pointerType !== "pen") return;

  event.preventDefault();
  dragState = state;
  const proxy = document.createElement("div");
  proxy.className = "touch-drag-proxy";
  proxy.textContent = label;
  document.body.append(proxy);
  pointerDrag = { pointerId: event.pointerId, source, proxy };
  source.setPointerCapture(event.pointerId);
  proxy.style.transform = `translate(${event.clientX + 14}px, ${event.clientY + 14}px)`;
  document.body.classList.add("pointer-dragging");
}

function endPointerDrag(commit) {
  if (!pointerDrag) return;
  if (commit && !commitActiveDrag() && preview) announce("That item does not fit there.", true);
  pointerDrag.proxy.remove();
  pointerDrag = null;
  dragState = null;
  preview = null;
  suppressClickUntil = performance.now() + 500;
  document.body.classList.remove("pointer-dragging");
  renderAll();
}

elements.catalog.addEventListener("click", (event) => {
  if (performance.now() < suppressClickUntil) return;
  const entry = event.target.closest("[data-item-id]");
  if (entry) chooseCatalogItem(entry.dataset.itemId);
});

elements.catalog.addEventListener("pointerdown", (event) => {
  const grip = event.target.closest(".item-swatch");
  const entry = event.target.closest("[data-item-id]");
  if (!grip || !entry) return;
  const sameItem = selectedCatalogId === entry.dataset.itemId;
  const rotated = sameItem && pendingRotation;
  const flipped = sameItem && pendingFlipped;
  const shapeIndex = sameItem ? pendingShapeIndex : 0;
  selectedCatalogId = entry.dataset.itemId;
  selectedInstanceId = null;
  pendingRotation = rotated;
  pendingFlipped = flipped;
  pendingShapeIndex = shapeIndex;
  renderSelection();
  beginPointerDrag(
    event,
    entry,
    { type: "new", itemId: entry.dataset.itemId, rotated, flipped, shapeIndex },
    catalogItem(entry.dataset.itemId).name,
  );
});

elements.catalog.addEventListener("dragstart", (event) => {
  const entry = event.target.closest("[data-item-id]");
  if (!entry) return;
  const sameItem = selectedCatalogId === entry.dataset.itemId;
  const rotated = sameItem && pendingRotation;
  const flipped = sameItem && pendingFlipped;
  const shapeIndex = sameItem ? pendingShapeIndex : 0;
  selectedCatalogId = entry.dataset.itemId;
  selectedInstanceId = null;
  pendingRotation = rotated;
  pendingFlipped = flipped;
  pendingShapeIndex = shapeIndex;
  dragState = { type: "new", itemId: entry.dataset.itemId, rotated, flipped, shapeIndex };
  renderSelection();
  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("text/plain", entry.dataset.itemId);
});

elements.grid.addEventListener("click", (event) => {
  if (performance.now() < suppressClickUntil) return;
  const placed = event.target.closest("[data-instance-id]");
  if (placed) {
    selectedInstanceId = placed.dataset.instanceId;
    selectedCatalogId = null;
    clearPendingTransform();
    renderAll();
    return;
  }
  const cell = event.target.closest(".grid-cell");
  if (cell) placeSelected(Number(cell.dataset.row), Number(cell.dataset.column));
});

elements.grid.addEventListener("pointerdown", (event) => {
  const placed = event.target.closest("[data-instance-id]");
  if (!placed) return;
  const placement = inventory.placements.find((item) => item.instanceId === placed.dataset.instanceId);
  selectedInstanceId = placement.instanceId;
  selectedCatalogId = null;
  clearPendingTransform();
  beginPointerDrag(
    event,
    placed,
    { type: "move", instanceId: placement.instanceId, rotated: placement.rotated },
    catalogItem(placement.itemId).name,
  );
});

document.addEventListener("pointermove", (event) => {
  if (!pointerDrag || event.pointerId !== pointerDrag.pointerId) return;
  event.preventDefault();
  pointerDrag.proxy.style.transform = `translate(${event.clientX + 14}px, ${event.clientY + 14}px)`;
  updateDragPreview(event);
  if (event.clientY < 72) window.scrollBy(0, -18);
  if (event.clientY > window.innerHeight - 72) window.scrollBy(0, 18);
}, { passive: false });

document.addEventListener("pointerup", (event) => {
  if (pointerDrag && event.pointerId === pointerDrag.pointerId) endPointerDrag(true);
});

document.addEventListener("pointercancel", (event) => {
  if (pointerDrag && event.pointerId === pointerDrag.pointerId) endPointerDrag(false);
});

elements.grid.addEventListener("dragstart", (event) => {
  const placed = event.target.closest("[data-instance-id]");
  if (!placed) return;
  const placement = inventory.placements.find((item) => item.instanceId === placed.dataset.instanceId);
  selectedInstanceId = placement.instanceId;
  selectedCatalogId = null;
  dragState = { type: "move", instanceId: placement.instanceId, rotated: placement.rotated };
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", placement.instanceId);
});

elements.grid.addEventListener("dragover", (event) => {
  if (!dragState) return;
  event.preventDefault();
  updateDragPreview(event);
});

elements.grid.addEventListener("drop", (event) => {
  event.preventDefault();
  if (!commitActiveDrag()) {
    announce("That item does not fit there.", true);
  }
  dragState = null;
  preview = null;
  renderAll();
});

document.addEventListener("dragend", () => {
  dragState = null;
  preview = null;
  renderGrid();
});

elements.rotate.addEventListener("click", () => {
  if (selectedInstanceId) {
    const next = rotateItem(inventory, selectedInstanceId);
    if (!next) return announce("There is no room to rotate this item.", true);
    inventory = next;
    persistInventory();
    announce("Item rotated.");
  } else if (selectedCatalogId) {
    pendingRotation = !pendingRotation;
    if (dragState?.type === "new") dragState.rotated = pendingRotation;
  }
  if (dragState) {
    renderSelection();
  } else {
    renderAll();
  }
});

  elements.flip.addEventListener("click", () => {
    if (selectedInstanceId) {
      const placement = selectedPlacement();
      const next = flipItem(inventory, selectedInstanceId, catalogItem(placement.itemId));
      if (!next) return announce("There is no room to flip this item.", true);
      inventory = next;
      persistInventory();
      announce("Item flipped.");
    } else if (selectedCatalogId) {
      pendingFlipped = !pendingFlipped;
      if (dragState?.type === "new") dragState.flipped = pendingFlipped;
    }
    if (dragState) renderSelection(); else renderAll();
  });

  elements.shape.addEventListener("click", () => {
    if (selectedInstanceId) {
      const placement = selectedPlacement();
      const next = cycleItemShape(inventory, selectedInstanceId, catalogItem(placement.itemId));
      if (!next) return announce("The next shape does not fit here.", true);
      inventory = next;
      persistInventory();
      announce("Item shape changed.");
    } else if (selectedCatalogId) {
      const item = catalogItem(selectedCatalogId);
      pendingShapeIndex = (pendingShapeIndex + 1) % itemShapeCount(item.load);
      if (dragState?.type === "new") dragState.shapeIndex = pendingShapeIndex;
    }
    if (dragState) renderSelection(); else renderAll();
  });

elements.remove.addEventListener("click", () => {
  if (!selectedInstanceId) return;
  inventory = removeItem(inventory, selectedInstanceId);
  selectedInstanceId = null;
  persistInventory();
  announce("Item removed.");
  renderAll();
});

elements.search.addEventListener("input", renderCatalog);

elements.reset.addEventListener("click", () => {
  if (inventory.placements.length && !confirm("Clear every item from the backpack?")) return;
  inventory = createInventory(inventory.strength);
  selectedInstanceId = null;
  selectedCatalogId = null;
  clearPendingTransform();
  persistInventory();
  announce("Backpack cleared.");
  renderAll();
});

elements.strength.addEventListener("change", () => {
  const nextStrength = Number(elements.strength.value);
  if (inventory.placements.length && !confirm("Changing Strength clears the backpack. Continue?")) {
    elements.strength.value = inventory.strength;
    return;
  }
  inventory = createInventory(nextStrength);
  selectedInstanceId = null;
  selectedCatalogId = null;
  clearPendingTransform();
  persistInventory();
  announce(`Strength set to ${nextStrength}.`);
  renderAll();
});

elements.exportSave.addEventListener("click", () => {
  const blob = new Blob([serializeInventory(inventory)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `field-loadout-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  announce("Inventory exported.");
});

elements.importSave.addEventListener("click", () => elements.saveFile.click());

elements.saveFile.addEventListener("change", async () => {
  const file = elements.saveFile.files?.[0];
  elements.saveFile.value = "";
  if (!file) return;
  if (!file.name.toLocaleLowerCase().endsWith(".json")) {
    announce("Choose a JSON save file.", true);
    return;
  }
  if (file.size > MAX_SAVE_BYTES) {
    announce("Save file is larger than 100 KB.", true);
    return;
  }

  try {
    const restored = parseInventorySave(await file.text(), ITEMS);
    if (inventory.placements.length && !confirm("Replace the current inventory with this save?")) return;
    inventory = restored.inventory;
    elements.strength.value = inventory.strength;
    selectedInstanceId = null;
    selectedCatalogId = null;
    clearPendingTransform();
    persistInventory();
    renderAll();
    announce("Inventory imported.");
  } catch (error) {
    announce(error instanceof Error ? error.message : "Save import failed.", true);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, select")) return;
  if (event.key.toLocaleLowerCase() === "r" && !elements.rotate.disabled) elements.rotate.click();
  if (event.key.toLocaleLowerCase() === "f" && !elements.flip.disabled) elements.flip.click();
  if (event.key.toLocaleLowerCase() === "s" && !elements.shape.disabled) elements.shape.click();
  if ((event.key === "Delete" || event.key === "Backspace") && selectedInstanceId) elements.remove.click();
  if (event.key === "Escape") {
    selectedCatalogId = null;
    selectedInstanceId = null;
    clearPendingTransform();
    preview = null;
    renderAll();
  }
});

renderAll();
if (startupMessage) announce(startupMessage, true);