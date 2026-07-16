// Load determines footprint area. Requirement is the minimum Strength score.
export const CATEGORY_COLORS = Object.freeze({
  Armor: "#7c9e9d", //light blue
  Guns: "#333333", //dark grey
  Melee: "#774f13", //brown
  Ammo: "#ffff00", //yellow
  Energy: "#00ff00", //green
  Explosives: "#ff0000", //red
  Gear: "#3f2104", //dark brown
  Food: "#c7ec77", //light green
  Meds: "#ffb6c1", //light pink
  Tool: "#2b5d8b", //blue
  Misc: "#221e1e", //Black
});

const DEFAULT_CATEGORY_COLOR = "#718071";

export const ITEMS = [
  //armor
  { id: "cloth-armor", name: "Cloth Armor", load: 2, requirement: 1, category: "Armor" },
  { id: "leather-armor", name: "Leather Armor", load: 7, requirement: 1, category: "Armor" },
  { id: "metal-armor", name: "Metal Armor", load: 10, requirement: 5, category: "Armor" },
  { id: "multi-layer-armor", name: "Multi-layer Armor", load: 20, requirement: 3, category: "Armor"},
  { id: "ballistic-armor", name: "Ballistic Armor", load: 5, requirement: 3, category: "Armor" },
  { id: "steel-armor", name: "Steel Armor", load: 25, requirement: 6, category: "Armor" },
  { id: "power-armor", name: "Power Armor", load: 100, requirement: 8, category: "Armor" },
  //melee
  { id: "shiv", name: "Shiv", load: 1, requirement: 1, category: "Melee"},
  { id: "knife", name: "Knife", load: 2, requirement: 2, category: "Melee"},
  { id: "machete", name: "Machete", load: 3, requirement: 4, category: "Melee"},
  { id: "axe", name: "Axe", load: 10, requirement: 6, category: "Melee"},
  { id: "sledgehammer", name: "Sledgehammer", load: 26, requirement: 7, category: "Melee"},
  { id: "wrench", name: "Wrench", load: 5, requirement: 2, category: "Melee"},
  { id: "bat", name: "Baseball Bat", load: 8, requirement: 4, category: "Melee"},
  { id: "sword", name: "Sword", load: 4, requirement: 3, category: "Melee"},
  { id: "crowbar", name: "Crowbar", load: 20, requirement: 6, category: "Melee"},
  { id: "leadpipe", name: "Lead Pipe", load: 6, requirement: 5, category: "Melee"},
  { id: "shovel", name: "Shovel", load: 10, requirement: 4, category: "Melee"},
  { id: "whacker", name: "Whacker", load: 2, requirement: 1, category: "Melee"},
  { id: "buzzsaw", name: "Buzzsaw", load: 10, requirement: 5, category: "Melee"},
  { id: "chainsaw", name: "Chainsaw", load: 20, requirement: 8, category: "Melee"},
  { id: "brass-knuckles", name: "Brass Knuckles", load: 2, requirement: 5, category: "Melee"},
  { id: "spiked-knuckles", name: "Spiked Knuckles", load: 2, requirement: 4, category: "Melee"},
  { id: "boxing-gloves", name: "Boxing Gloves", load: 6, requirement: 3, category: "Melee"},
  { id: "trap-fist", name: "Trap Fist", load: 20, requirement: 8, category: "Melee"},
  { id: "power-fist", name: "Power Fist", load: 12, requirement: 6, category: "Melee"},
  //ammo
  { id: "ammo", name: "10x Ammo", load: 1, requirement: 1, category: "Ammo" },
  //guns
  { id: "9mm-pistol", name: "9mm Pistol", load: 5, requirement: 3, category: "Guns" },
  { id: "10mm-pistol", name: "10mm Pistol", load: 6, requirement: 4, category: "Guns" },
  { id: "pipe-pistol", name: "Pipe Pistol", load: 6, requirement: 3, category: "Guns" },
  { id: "acid-soaker", name: "Acid Soaker", load: 5, requirement: 1, category: "Guns" },
  { id: "flare-gun", name: "Flare Gun", load: 3, requirement: 1, category: "Guns" },
  { id: "5-56mm-pistol", name: "5.56mm Pistol", load: 7, requirement: 5, category: "Guns" },
  { id: "pipe-revolver", name: "Pipe Revolver", load: 5, requirement: 4, category: "Guns" },
  { id: "357-revolver", name: ".357 Revolver", load: 4, requirement: 4, category: "Guns" },
  { id: "44-magnum", name: ".44 Magnum", load: 5, requirement: 4, category: "Guns" },
  { id: "127-pistol", name: "12.7mm Pistol", load: 8, requirement: 5, category: "Guns" },
  { id: "9mm-submachine-gun", name: "9mm Submachine Gun", load: 6, requirement: 5, category: "Guns" },
  { id: "10mm-submachine-gun", name: "10mm Submachine Gun", load: 8, requirement: 6, category: "Guns" },
  { id: "tommy-gun", name: "Tommy Gun", load: 12, requirement: 6, category: "Guns" },
  { id: "syringer", name: "Syringer", load: 8, requirement: 2, category: "Guns" },
  { id: "varmint-rifle", name: "Varmint Rifle", load: 13, requirement: 4, category: "Guns" },
  { id: "trail-carbine", name: "Trail Carbine", load: 13, requirement: 4, category: "Guns" },
  { id: "sniper-rifle", name: "Sniper Rifle", load: 16, requirement: 5, category: "Guns" },
  { id: "assault-rifle", name: "Assault Rifle", load: 14, requirement: 5, category: "Guns" },
  { id: "single-shotgun", name: "Single Shotgun", load: 11, requirement: 4, category: "Guns" },
  { id: "sawed-off-shotgun", name: "Sawed Off Shotgun", load: 8, requirement: 4, category: "Guns" },
  { id: "double-barrel-shotgun", name: "Double Barrel Shotgun", load: 12, requirement: 5, category: "Guns" },
  { id: "combat-shotgun", name: "Combat Shotgun", load: 12, requirement: 5, category: "Guns" },
  { id: "flamer", name: "Flamer", load: 60, requirement: 7, category: "Guns" },
  { id: "minigun", name: "Minigun", load: 90, requirement: 9, category: "Guns" },
  { id: "fat-man", name: "Fat Man", load: 30, requirement: 5, category: "Guns" },
  { id: "missile-launcher", name: "Missile Launcher", load: 50, requirement: 7, category: "Guns" },
  //energy
  { id: "laser-pistol", name: "Laser Pistol", load: 5, requirement: 1, category: "Energy" },
  { id: "laser-rifle", name: "Laser Rifle", load: 8, requirement: 2, category: "Energy" },
  { id: "plasma-pistol", name: "Plasma Pistol", load: 4, requirement: 2, category: "Energy" },
  { id: "plasma-rifle", name: "Plasma Rifle", load: 8, requirement: 3, category: "Energy" },
  { id: "tri-beam", name: "Tri-Beam", load: 10, requirement: 2, category: "Energy" },
  { id: "gauss-pistol", name: "Gauss Pistol", load: 14, requirement: 5, category: "Energy" },
  { id: "gauss-rifle", name: "Gauss Rifle", load: 20, requirement: 5, category: "Energy" },
  { id: "cryolator", name: "Cryolator", load: 20, requirement: 6, category: "Energy" },
  { id: "tesla-cannon", name: "Tesla Cannon", load: 12, requirement: 4, category: "Energy" },
  //explosives
  { id: "dynamite", name: "Dynamite", load: 3, requirement: 1, category: "Explosives" },
  { id: "molotov", name: "Molotov Cocktail", load: 4, requirement: 1, category: "Explosives" },
  { id: "frag-grenade", name: "Frag Grenade", load: 3, requirement: 1, category: "Explosives" },
  { id: "plasma-grenade", name: "Plasma Grenade", load: 4, requirement: 1, category: "Explosives" },
  { id: "pulse-grenade", name: "Pulse Grenade", load: 4, requirement: 1, category: "Explosives" },
  { id: "cryo-grenade", name: "Cryo Grenade", load: 4, requirement: 1, category: "Explosives" },
  { id: "frag-mine", name: "Frag Mine", load: 8, requirement: 1, category: "Explosives" },  
  { id: "plasma-mine", name: "Plasma Mine", load: 8, requirement: 1, category: "Explosives" },
  { id: "pulse-mine", name: "Pulse Mine", load: 6, requirement: 1, category: "Explosives" },
  { id: "cryo-mine", name: "Cryo Mine", load: 8, requirement: 1, category: "Explosives" },
  { id: "nuke-mine", name: "Nuke Mine", load: 22, requirement: 1, category: "Explosives" },
  { id: "c4", name: "C4 Explosive", load: 12, requirement: 1, category: "Explosives" },
  //gear
  { id: "bear-trap", name: "Bear Trap", load: 30, requirement: 1, category: "Gear"},
  { id: "binoculars", name: "Binoculars", load: 2, requirement: 1, category: "Gear"},
  { id: "canteen", name: "Canteen", load: 2, requirement: 1, category: "Gear"},
  { id: "chains", name: "Chains", load: 12, requirement: 1, category: "Gear"},
  { id: "flare", name: "Flare", load: 1, requirement: 1, category: "Gear"},
  { id: "flashlight", name: "Flashlight", load: 2, requirement: 1, category: "Gear"},
  { id: "gasmask", name: "Gas Mask", load: 12, requirement: 1, category: "Gear"},
  { id: "lockpick", name: "Lockpick", load: 4, requirement: 1, category: "Gear"},
  { id: "rope", name: "Rope", load: 8, requirement: 1, category: "Gear"},
  { id: "sleeping-bag", name: "Sleeping Bag", load: 10, requirement: 1, category: "Gear"},
  { id: "weapon-repair-kit", name: "Weapon Repair Kit", load: 10, requirement: 1, category: "Gear"},
  //misc
  { id: "computer", name: "Computer Boy", load: 4, requirement: 1, category: "Misc"},
  { id: "stealth-boy", name: "Stealth Boy", load: 3, requirement: 1, category: "Misc"},
  { id: "two-way-radio", name: "Two-Way Radio", load: 2, requirement: 1, category: "Misc"},
  { id: "book", name: "Book", load: 1, requirement: 1, category: "Misc"},
  //food
  { id: "canned-food", name: "Canned Food", load: 2, requirement: 1, category: "Food"},
  { id: "candy", name: "Candy", load: 1, requirement: 1, category: "Food"},
  { id: "boxed-food", name: "Boxed Food", load: 4, requirement: 1, category: "Food"},
  { id: "vegetables", name: "Vegetable", load: 1, requirement: 1, category: "Food"},
  { id: "meat", name: "Meat", load: 3, requirement: 1, category: "Food"},
  { id: "drink", name: "Drink", load: 2, requirement: 1, category: "Food"},
  //meds
  { id: "antibiotics", name: "Antibiotics", load: 1, requirement: 1, category: "Meds"},
  { id: "doctors-bag", name: "Doctor's Bag", load: 15, requirement: 1, category: "Meds"},
  { id: "first-aid-kit", name: "First Aid Kit", load: 4, requirement: 1, category: "Meds"},
  { id: "rad-away", name: "Rad-Away", load: 4, requirement: 1, category: "Meds"},
  { id: "pills", name: "Pills", load: 1, requirement: 1, category: "Meds"},
  { id: "stimpak", name: "Stimpak", load: 4, requirement: 1, category: "Meds"},
  { id: "robot-fix-kit", name: "Robot Fix Kit", load: 4, requirement: 1, category: "Meds"},
  { id: "chem", name: "Chem (Bottle)", load: 1, requirement: 1, category: "Meds"},
  { id: "chems", name: "Chems (10x Pills)", load: 1, requirement: 1, category: "Meds"},
  { id: "overclock-program", name: "Overclock Program 10x", load: 1, requirement: 1, category: "Meds"}

];

export function categoryColor(category) {
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;
}

export function meetsItemRequirement(item, strength) {
  return strength >= item.requirement;
}

export function matchesItemSearch(item, searchTerm) {
  const query = searchTerm.trim().toLocaleLowerCase();
  return [item.name, item.category]
    .some((value) => value.toLocaleLowerCase().includes(query));
}