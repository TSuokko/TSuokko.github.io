import {
  cellUsesBagSpace,
  cellWithinCapacity,
  consumeAmmo,
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
  renameItem,
  rotateItem,
  setItemDecay,
  totalAmmo,
} from "./inventory.js";
import { ammoBundleQuantity, categoryColor, compatibleAmmo, ITEMS, matchesItemSearch, meetsItemRequirement } from "./items.js";
import { createSaveData, MAX_CUSTOM_NAME_LENGTH, MAX_SAVE_BYTES, parseInventorySave, serializeInventory } from "./persistence.js";

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
  rename: document.querySelector("#rename"),
  description: document.querySelector("#description"),
  decay: document.querySelector("#decay"),
  ammo: document.querySelector("#ammo"),
  remove: document.querySelector("#remove"),
  dimensions: document.querySelector("#dimensions"),
  grid: document.querySelector("#inventory-grid"),
  toast: document.querySelector("#toast"),
  renameDialog: document.querySelector("#rename-dialog"),
  renameForm: document.querySelector("#rename-form"),
  renameInput: document.querySelector("#rename-input"),
  renameCancel: document.querySelector("#rename-cancel"),
  descriptionDialog: document.querySelector("#description-dialog"),
  descriptionTitle: document.querySelector("#description-title"),
  descriptionCategory: document.querySelector("#description-category"),
  descriptionLoad: document.querySelector("#description-load"),
  descriptionRequirement: document.querySelector("#description-requirement"),
  descriptionText: document.querySelector("#description-text"),
  descriptionProperties: document.querySelector("#description-properties"),
  descriptionClose: document.querySelector("#description-close"),
  decayDialog: document.querySelector("#decay-dialog"),
  decayForm: document.querySelector("#decay-form"),
  decayItemName: document.querySelector("#decay-item-name"),
  decayMinus: document.querySelector("#decay-minus"),
  decayPlus: document.querySelector("#decay-plus"),
  decayOutput: document.querySelector("#decay-output"),
  decayStatus: document.querySelector("#decay-status"),
  decayCancel: document.querySelector("#decay-cancel"),
  ammoDialog: document.querySelector("#ammo-dialog"),
  ammoForm: document.querySelector("#ammo-form"),
  ammoItemName: document.querySelector("#ammo-item-name"),
  ammoTotal: document.querySelector("#ammo-total"),
  ammoMinus: document.querySelector("#ammo-minus"),
  ammoUsed: document.querySelector("#ammo-used"),
  ammoPlus: document.querySelector("#ammo-plus"),
  ammoCancel: document.querySelector("#ammo-cancel"),
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
let decayDraft = 0;

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

function placementName(placement, item) {
  return placement.customName ?? item.name;
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
  const displayName = placementName(placement, item);
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
  const decayStatus = placement.decay === 10 ? "Broken" : `Decay ${placement.decay}`;
  const ammoStatus = placement.ammoQuantity === null ? "" : `, ${placement.ammoQuantity} rounds remaining`;
  button.title = `${displayName}, Load ${item.load}, requires Strength ${item.requirement}, ${decayStatus}${ammoStatus}`;
  button.setAttribute("aria-label", `${displayName}, Load ${item.load}, requires Strength ${item.requirement}${requirementMet ? "" : ", requirement not met"}, ${decayStatus}${ammoStatus}, at row ${placement.row + 1}, column ${placement.column + 1}`);
  if (selectedInstanceId === placement.instanceId) button.classList.add("selected");
  if (!requirementMet) button.classList.add("requirement-unmet");
  if (placement.decay === 10) button.classList.add("broken");
  appendShapeCells(button, placement.cells);
  const name = document.createElement("span");
  name.className = "item-name";
  name.textContent = displayName;
  const load = document.createElement("small");
  load.className = "item-load-label";
  load.textContent = item.load;
  const decay = document.createElement("span");
  decay.className = "decay-badge";
  decay.textContent = `D${placement.decay}`;
  const ammo = document.createElement("span");
  ammo.className = "ammo-badge";
  ammo.textContent = placement.ammoQuantity;
  ammo.hidden = placement.ammoQuantity === null || placement.ammoQuantity === ammoBundleQuantity(item);
  const broken = document.createElement("span");
  broken.className = "broken-label";
  broken.textContent = "Broken";
  button.append(name, load, decay, ammo, broken);
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
      const available = cellWithinCapacity(inventory, row, column);
      const usesBagSpace = cellUsesBagSpace(inventory, row, column);
      cell.disabled = !available;
      cell.classList.toggle("unavailable", !available);
      cell.classList.toggle("bag-space", usesBagSpace);
      cell.setAttribute("aria-label", available
        ? `Row ${row + 1}, column ${column + 1}${usesBagSpace ? ", Bag Space" : ""}`
        : `Row ${row + 1}, column ${column + 1}, unavailable`);
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
  elements.rename.disabled = !placement;
  elements.decay.disabled = !placement;
  elements.ammo.disabled = !placement || !compatibleAmmo(item);
  elements.description.disabled = !item;
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
  const decaySummary = placement ? ` · ${placement.decay === 10 ? "Broken" : `D${placement.decay}`}` : "";
  elements.selectionSize.textContent = `${placement ? placementName(placement, item) : item.name} · ${footprint.width}×${footprint.height}${decaySummary}`;
}

function renderDecayDraft() {
  elements.decayOutput.value = decayDraft;
  elements.decayOutput.textContent = decayDraft;
  elements.decayStatus.textContent = decayDraft === 10 ? "Broken" : "Operational";
  elements.decayStatus.classList.toggle("broken", decayDraft === 10);
  elements.decayMinus.disabled = decayDraft === 0;
  elements.decayPlus.disabled = decayDraft === 10;
}

function syncAmmoStepper() {
  const amount = Number(elements.ammoUsed.value);
  const maximum = Number(elements.ammoUsed.max);
  const validAmount = Number.isInteger(amount);
  elements.ammoMinus.disabled = !validAmount || amount <= 1;
  elements.ammoPlus.disabled = !validAmount || amount >= maximum;
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
  const entry = event.target.closest("[data-item-id]");
  if (entry && document.activeElement === elements.search) elements.search.blur();

  const grip = event.target.closest(".item-swatch");
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
    placementName(placement, catalogItem(placement.itemId)),
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
  const placement = selectedPlacement();
  const next = removeItem(inventory, selectedInstanceId, catalogItem(placement.itemId));
  if (!next) return announce("Move or remove items using this Bag's Space first.", true);
  inventory = next;
  selectedInstanceId = null;
  persistInventory();
  announce("Item removed.");
  renderAll();
});

elements.rename.addEventListener("click", () => {
  const placement = selectedPlacement();
  if (!placement) return;
  elements.renameInput.value = placement.customName ?? "";
  elements.renameDialog.showModal();
  elements.renameInput.focus();
  elements.renameInput.select();
});

elements.description.addEventListener("click", () => {
  const placement = selectedPlacement();
  const item = placement ? catalogItem(placement.itemId) : catalogItem(selectedCatalogId);
  if (!item) return;

  elements.descriptionTitle.textContent = placement ? placementName(placement, item) : item.name;
  elements.descriptionCategory.textContent = placement?.customName ? `${item.name} · ${item.category}` : item.category;
  elements.descriptionLoad.textContent = item.load;
  elements.descriptionRequirement.textContent = item.requirement;
  elements.descriptionText.textContent = item.description;
  elements.descriptionProperties.replaceChildren();
  const properties = [
    ...(placement ? [["Decay", placement.decay === 10 ? "10 · Broken" : `${placement.decay} / 10`]] : []),
    ...(placement?.ammoQuantity !== null ? [["Remaining", placement.ammoQuantity]] : []),
    ...(compatibleAmmo(item) ? [
      ["Compatible Ammo", compatibleAmmo(item).name],
      ["Ammo Available", totalAmmo(inventory, item.AmmoId)],
    ] : []),
    ...Object.entries(item.properties),
  ];
  if (properties.length === 0) {
    const empty = document.createElement("p");
    empty.className = "description-empty";
    empty.textContent = "No unique properties recorded.";
    elements.descriptionProperties.append(empty);
  } else {
    for (const [label, value] of properties) {
      const term = document.createElement("dt");
      term.textContent = label;
      const detail = document.createElement("dd");
      detail.textContent = value;
      elements.descriptionProperties.append(term, detail);
    }
  }
  elements.descriptionDialog.showModal();
});

elements.descriptionClose.addEventListener("click", () => elements.descriptionDialog.close());

elements.decay.addEventListener("click", () => {
  const placement = selectedPlacement();
  if (!placement) return;
  const item = catalogItem(placement.itemId);
  decayDraft = placement.decay;
  elements.decayItemName.textContent = placementName(placement, item);
  renderDecayDraft();
  elements.decayDialog.showModal();
});

elements.decayMinus.addEventListener("click", () => {
  decayDraft = Math.max(0, decayDraft - 1);
  renderDecayDraft();
});

elements.decayPlus.addEventListener("click", () => {
  decayDraft = Math.min(10, decayDraft + 1);
  renderDecayDraft();
});

elements.decayCancel.addEventListener("click", () => elements.decayDialog.close("cancel"));

elements.decayForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const placement = selectedPlacement();
  if (!placement) {
    elements.decayDialog.close();
    return;
  }

  inventory = setItemDecay(inventory, placement.instanceId, decayDraft);
  persistInventory();
  elements.decayDialog.close("save");
  renderAll();
  announce(decayDraft === 10 ? "Item is Broken." : `Item Decay set to ${decayDraft}.`);
});

elements.ammo.addEventListener("click", () => {
  const placement = selectedPlacement();
  const item = placement ? catalogItem(placement.itemId) : null;
  const ammo = compatibleAmmo(item);
  if (!ammo) return;

  const available = totalAmmo(inventory, ammo.id);
  elements.ammoItemName.textContent = `${placementName(placement, item)} · ${ammo.name}`;
  elements.ammoTotal.textContent = available;
  elements.ammoUsed.value = available > 0 ? 1 : 0;
  elements.ammoUsed.min = available > 0 ? 1 : 0;
  elements.ammoUsed.max = available;
  elements.ammoUsed.disabled = available === 0;
  syncAmmoStepper();
  elements.ammoForm.querySelector('[type="submit"]').disabled = available === 0;
  elements.ammoDialog.showModal();
  if (available > 0) {
    elements.ammoUsed.focus();
    elements.ammoUsed.select();
  }
});

elements.ammoMinus.addEventListener("click", () => {
  const amount = Number(elements.ammoUsed.value);
  elements.ammoUsed.value = Math.max(1, Number.isInteger(amount) ? amount - 1 : 1);
  syncAmmoStepper();
});

elements.ammoPlus.addEventListener("click", () => {
  const amount = Number(elements.ammoUsed.value);
  const maximum = Number(elements.ammoUsed.max);
  elements.ammoUsed.value = Math.min(maximum, Number.isInteger(amount) ? amount + 1 : 1);
  syncAmmoStepper();
});

elements.ammoUsed.addEventListener("input", syncAmmoStepper);

elements.ammoCancel.addEventListener("click", () => elements.ammoDialog.close("cancel"));

elements.ammoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const placement = selectedPlacement();
  const item = placement ? catalogItem(placement.itemId) : null;
  const ammo = compatibleAmmo(item);
  const amount = Number(elements.ammoUsed.value);
  const next = ammo ? consumeAmmo(inventory, ammo.id, amount) : null;
  if (!next) {
    announce("Enter a whole number within the available ammo.", true);
    return;
  }

  inventory = next;
  persistInventory();
  elements.ammoDialog.close("save");
  renderAll();
  announce(`${amount} ${amount === 1 ? "round" : "rounds"} used.`);
});

elements.renameCancel.addEventListener("click", () => elements.renameDialog.close("cancel"));

elements.renameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const placement = selectedPlacement();
  if (!placement) {
    elements.renameDialog.close();
    return;
  }

  const value = elements.renameInput.value.trim();
  if (value.length > MAX_CUSTOM_NAME_LENGTH || /[\u0000-\u001f\u007f]/.test(value)) {
    announce(`Names must be ${MAX_CUSTOM_NAME_LENGTH} characters or fewer.`, true);
    return;
  }
  inventory = renameItem(inventory, placement.instanceId, value || null);
  persistInventory();
  elements.renameDialog.close("save");
  renderAll();
  announce(value ? "Item renamed." : "Default item name restored.");
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