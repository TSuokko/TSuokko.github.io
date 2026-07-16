import {
  createInventory,
  itemDimensions,
  moveItem,
  occupiedLoad,
  placeItem,
  placementFits,
  removeItem,
  rotateItem,
} from "./inventory.js";
import { ITEMS, matchesItemSearch } from "./items.js";

const elements = {
  strength: document.querySelector("#strength"),
  capacity: document.querySelector("#capacity"),
  occupied: document.querySelector("#occupied"),
  reset: document.querySelector("#reset"),
  search: document.querySelector("#item-search"),
  catalog: document.querySelector("#catalog-list"),
  resultCount: document.querySelector("#result-count"),
  footprint: document.querySelector("#footprint-preview"),
  selectionLabel: document.querySelector("#selection-label"),
  selectionSize: document.querySelector("#selection-size"),
  rotate: document.querySelector("#rotate"),
  remove: document.querySelector("#remove"),
  dimensions: document.querySelector("#dimensions"),
  grid: document.querySelector("#inventory-grid"),
  toast: document.querySelector("#toast"),
};

let inventory = createInventory(3);
let selectedCatalogId = null;
let selectedInstanceId = null;
let pendingRotation = false;
let dragState = null;
let preview = null;
let pointerDrag = null;
let suppressClickUntil = 0;
let toastTimer = null;

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

function announce(message, isError = false) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.toggle("error", isError);
  elements.toast.classList.add("visible");
  toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 2400);
}

function renderCatalog() {
  const results = ITEMS.filter((item) => matchesItemSearch(item, elements.search.value));
  elements.catalog.replaceChildren();
  elements.resultCount.textContent = `${results.length} item${results.length === 1 ? "" : "s"}`;

  for (const item of results) {
    const dimensions = itemDimensions(item.load);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "catalog-item";
    button.dataset.itemId = item.id;
    button.draggable = true;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(selectedCatalogId === item.id));
    if (selectedCatalogId === item.id) button.classList.add("selected");
    button.innerHTML = `
      <span class="item-swatch" style="--item-color: ${item.color}" aria-hidden="true"></span>
      <span class="item-copy"><strong>${item.name}</strong><small>${item.category}</small></span>
      <span class="item-load"><strong>${item.load}</strong><small>${dimensions.width}×${dimensions.height}</small></span>
    `;
    elements.catalog.append(button);
  }
}

function placementElement(placement) {
  const item = catalogItem(placement.itemId);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "placed-item";
  button.draggable = true;
  button.dataset.instanceId = placement.instanceId;
  button.style.gridColumn = `${placement.column + 1} / span ${placement.width}`;
  button.style.gridRow = `${placement.row + 1} / span ${placement.height}`;
  button.style.setProperty("--item-color", item.color);
  button.title = `${item.name}, Load ${item.load}`;
  button.setAttribute("aria-label", `${item.name}, Load ${item.load}, at row ${placement.row + 1}, column ${placement.column + 1}`);
  if (selectedInstanceId === placement.instanceId) button.classList.add("selected");
  button.innerHTML = `<span>${item.name}</span><small>${item.load}</small>`;
  return button;
}

function renderPlacementPreview() {
  elements.grid.querySelector(".placement-preview")?.remove();
  if (!preview) return;

  const marker = document.createElement("div");
  marker.className = `placement-preview ${preview.valid ? "valid" : "invalid"}`;
  marker.style.gridColumn = `${preview.column + 1} / span ${preview.width}`;
  marker.style.gridRow = `${preview.row + 1} / span ${preview.height}`;
  marker.textContent = preview.valid ? "Place" : "Blocked";
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
  elements.footprint.replaceChildren();
  elements.footprint.removeAttribute("style");

  if (!item) {
    elements.selectionLabel.textContent = "Nothing selected";
    elements.selectionSize.textContent = "Choose an item";
    return;
  }

  const base = itemDimensions(item.load);
  const dimensions = placement
    ? { width: placement.width, height: placement.height }
    : pendingRotation ? { width: base.height, height: base.width } : base;
  elements.footprint.style.setProperty("--preview-columns", dimensions.width);
  elements.footprint.style.setProperty("--preview-color", item.color);
  for (let cell = 0; cell < item.load; cell += 1) {
    elements.footprint.append(document.createElement("span"));
  }
  elements.selectionLabel.textContent = placement ? "Packed item" : "Ready to place";
  elements.selectionSize.textContent = `${item.name} · ${dimensions.width}×${dimensions.height}`;
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
}

function chooseCatalogItem(itemId) {
  selectedCatalogId = itemId;
  selectedInstanceId = null;
  pendingRotation = false;
  renderAll();
}

function candidateFor(item, row, column, rotated, ignoredInstanceId = null) {
  const base = itemDimensions(item.load);
  const candidate = {
    row,
    column,
    width: rotated ? base.height : base.width,
    height: rotated ? base.width : base.height,
  };
  return { ...candidate, valid: placementFits(inventory, candidate, ignoredInstanceId) };
}

function placeSelected(row, column) {
  const item = catalogItem(selectedCatalogId);
  if (!item) return;
  const next = placeItem(inventory, item, row, column, pendingRotation);
  if (!next) {
    announce("That item does not fit there.", true);
    return;
  }
  inventory = next;
  selectedCatalogId = null;
  pendingRotation = false;
  selectedInstanceId = inventory.placements.at(-1).instanceId;
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
    preview = candidateFor(catalogItem(dragState.itemId), row, column, dragState.rotated);
  } else {
    const placement = inventory.placements.find((item) => item.instanceId === dragState.instanceId);
    preview = {
      row, column, width: placement.width, height: placement.height,
      valid: placementFits(inventory, { ...placement, row, column }, placement.instanceId),
    };
  }
  renderPlacementPreview();
}

function commitActiveDrag() {
  if (!dragState || !preview?.valid) return false;

  if (dragState.type === "new") {
    const item = catalogItem(dragState.itemId);
    inventory = placeItem(inventory, item, preview.row, preview.column, dragState.rotated);
    selectedInstanceId = inventory.placements.at(-1).instanceId;
    selectedCatalogId = null;
    announce(`${item.name} packed.`);
  } else {
    inventory = moveItem(inventory, dragState.instanceId, preview.row, preview.column);
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
  const rotated = selectedCatalogId === entry.dataset.itemId && pendingRotation;
  selectedCatalogId = entry.dataset.itemId;
  selectedInstanceId = null;
  pendingRotation = rotated;
  renderSelection();
  beginPointerDrag(
    event,
    entry,
    { type: "new", itemId: entry.dataset.itemId, rotated },
    catalogItem(entry.dataset.itemId).name,
  );
});

elements.catalog.addEventListener("dragstart", (event) => {
  const entry = event.target.closest("[data-item-id]");
  if (!entry) return;
  const rotated = selectedCatalogId === entry.dataset.itemId && pendingRotation;
  selectedCatalogId = entry.dataset.itemId;
  selectedInstanceId = null;
  pendingRotation = rotated;
  dragState = { type: "new", itemId: entry.dataset.itemId, rotated };
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
    pendingRotation = false;
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
  pendingRotation = false;
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

elements.remove.addEventListener("click", () => {
  if (!selectedInstanceId) return;
  inventory = removeItem(inventory, selectedInstanceId);
  selectedInstanceId = null;
  announce("Item removed.");
  renderAll();
});

elements.search.addEventListener("input", renderCatalog);

elements.reset.addEventListener("click", () => {
  if (inventory.placements.length && !confirm("Clear every item from the backpack?")) return;
  inventory = createInventory(inventory.strength);
  selectedInstanceId = null;
  selectedCatalogId = null;
  pendingRotation = false;
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
  pendingRotation = false;
  announce(`Strength set to ${nextStrength}.`);
  renderAll();
});

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, select")) return;
  if (event.key.toLocaleLowerCase() === "r" && !elements.rotate.disabled) elements.rotate.click();
  if ((event.key === "Delete" || event.key === "Backspace") && selectedInstanceId) elements.remove.click();
  if (event.key === "Escape") {
    selectedCatalogId = null;
    selectedInstanceId = null;
    pendingRotation = false;
    preview = null;
    renderAll();
  }
});

renderAll();