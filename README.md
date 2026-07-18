# TTRPG Survival Loadout

A dependency-free spatial inventory minigame built with HTML, CSS, and browser-native JavaScript modules. Uses items from Arcane Arcade's Fallout TTRPG. 

## Run locally

ES modules must be served over HTTP. From the repository root, use any static server, for example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Add items

Edit `js/items.js` and add entries to the exported `ITEMS` array:

```js
{
	id: "Weapon-repair-kit",
	name: "Weapon Repiar Kit",
	load: 6,
	requirement: 4,
	category: "Gear",
	description: "This plastic box filled with tools and mechanisms was used during the great war to repair soldiers’ weapons with ease. Though, the tech used to create them has long since been forgotten; many are still found across the wasteland.",
	properties: {
		Effect: "You can spend 6 AP to insert any weapon into the repair kit. After 1 minute, the weapon is ejected and loses 2 levels of decay. ",
		Uses: "The weapon repair kit ceases function after it has been used a total of three times."
	}
}
```

`description` supplies the item-specific summary shown by the Description control. `properties` accepts any label/value pairs appropriate to that item, so armor, weapons, consumables, and tools do not need to share one stat shape. Missing descriptions and property sets receive explicit empty-state text while an item is being drafted. Item search also matches description text.

Items in the `Bag` category can expand Total Load with a positive integer `Space` property:

```js
{
	id: "field-bag",
	name: "Field Bag",
	load: 2,
	requirement: 1,
	category: "Bag",
	description: "A compact bag with additional storage.",
	properties: {
		Space: 10
	}
}
```

Each packed Bag adds its Space to Total Load, and bonuses from multiple Bags stack. Backpack width stays fixed while new rows open downward; cells beyond the exact Total Load in a partial final row remain unavailable. A Bag cannot be removed while another packed item occupies capacity supplied by it.

`load` must be a positive integer. Composite Loads begin with the closest rectangular factor pair, so Load 6 begins as 3×2. Prime Loads begin with an irregular balanced fold: Load 7 has rows of 4 and 3 occupied cells.

The Shape control cycles composite items through their factor-pair rectangles and prime items through progressively narrower folded widths. Flip mirrors an irregular mask, while Rotate changes its orientation. Every transform preserves occupied Load and is rejected if it would overlap another item or leave the backpack.

`requirement` is the minimum Strength needed for the item. Items above the current Strength remain usable but are highlighted red in both the catalog and backpack.

Item colors come from the `CATEGORY_COLORS` map at the top of `js/items.js`. Add or edit category defaults there; categories without an entry use a neutral gray-green fallback.

Strength ranges from 1 to 10 and produces 10 to 100 base Load. The initial backpack dimensions use the closest factor pair that is strictly taller than wide, then Bag Space expands it downward.

## Controls

- Drag an item from the supply cache onto the backpack.
- On touch devices, drag from an item's silhouette, or select the item and then select its top-left grid cell.
- Drag packed items directly to move them; holding near a screen edge scrolls toward an off-screen grid.
- Select any catalog or packed item and use Description to view its information, Load, and Strength requirement.
- Select a packed item to rotate, flip, reshape, rename, or remove it. Submitting an empty name restores its catalog name.
- Press `R` to rotate, `F` to flip, `S` to cycle shape, and `Delete` to remove the selected item.
- Changing Strength clears the backpack after confirmation.

## Saves

The inventory saves automatically in browser `localStorage` after successful placement, movement, transformation, rename, removal, reset, import, or Strength changes. The Memory indicator shows the most recent local save time.

Use the down-arrow control to export a versioned JSON backup and the up-arrow control to import one. Local saves belong to the current browser and site address, so saves from `localhost` and GitHub Pages are separate. Export/import is the supported way to transfer a character between browsers or devices.

Imports are limited to 100 KB and accept only the exact save schema. Unknown properties, catalog item IDs, duplicate instance IDs, invalid types, overlaps, and out-of-bounds placements are rejected. Imported data cannot define HTML, scripts, styles, images, or catalog entries. An invalid or outdated automatic save is discarded without disabling future saves.

Current exports use save version 3 to preserve rotation, flip, shape, and per-instance custom names. Version-1 and version-2 saves remain importable; missing transform and custom-name fields migrate to their defaults.

## Tests

The inventory model uses Node's built-in test runner and has no dependencies:

```powershell
node --test tests/inventory.test.mjs
```