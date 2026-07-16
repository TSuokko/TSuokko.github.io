# Field Loadout

A dependency-free spatial inventory minigame built with HTML, CSS, and browser-native JavaScript modules.

## Run locally

ES modules must be served over HTTP. From the repository root, use any static server, for example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

1. Push the repository to GitHub.
2. Open **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the default branch and the `/ (root)` folder, then save.

All application URLs are relative, so the site works from a project path such as `https://username.github.io/LoadBalancer/`. No build or deployment action is required.

## Add items

Edit `js/items.js` and add entries to the exported `ITEMS` array:

```js
{ id: "tool-kit", name: "Tool Kit", load: 6, color: "#758277", category: "Tool" }
```

`load` must be a positive integer. The closest factor pair becomes the item's footprint, so Load 6 becomes 3×2 and prime Load 5 becomes 5×1. Items can rotate after selection.

Strength ranges from 1 to 10 and produces 10 to 100 total Load. Backpack dimensions use the closest factor pair that is strictly taller than wide.

## Controls

- Drag an item from the supply cache onto the backpack.
- On touch devices, drag from an item's silhouette, or select the item and then select its top-left grid cell.
- Drag packed items directly to move them; holding near a screen edge scrolls toward an off-screen grid.
- Select a packed item to rotate or remove it.
- Press `R` to rotate and `Delete` to remove the selected item.
- Changing Strength clears the backpack after confirmation.

## Tests

The inventory model uses Node's built-in test runner and has no dependencies:

```powershell
node --test tests/inventory.test.mjs
```