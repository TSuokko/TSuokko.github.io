// Add or edit items here. Load determines footprint area; color is any CSS color.
export const ITEMS = [
  { id: "field-knife", name: "Field Knife", load: 3, color: "#c7c0a8", category: "Tool" },
  { id: "sidearm", name: "Service Sidearm", load: 6, color: "#9ba6a4", category: "Equipment" },
  { id: "shell-box", name: "Shell Box", load: 4, color: "#b24938", category: "Supply" },
  { id: "medical-kit", name: "Medical Kit", load: 4, color: "#d6d8ca", category: "Medical" },
  { id: "canteen", name: "Field Canteen", load: 2, color: "#71816b", category: "Supply" },
  { id: "rope-coil", name: "Rope Coil", load: 5, color: "#a88a55", category: "Tool" },
  { id: "radio", name: "Compact Radio", load: 6, color: "#59645f", category: "Equipment" },
  { id: "flare-pack", name: "Signal Flares", load: 3, color: "#d17d35", category: "Supply" },
  { id: "herb-pouch", name: "Herb Pouch", load: 2, color: "#668b59", category: "Medical" },
  { id: "long-tool", name: "Folding Saw", load: 7, color: "#847b6b", category: "Tool" },
];

export function matchesItemSearch(item, searchTerm) {
  const query = searchTerm.trim().toLocaleLowerCase();
  return [item.name, item.category]
    .some((value) => value.toLocaleLowerCase().includes(query));
}