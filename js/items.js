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
  Junk: "#7721ee", //saddle brown
});

const DEFAULT_CATEGORY_COLOR = "#718071";

//descriptions currently are tests
const ITEM_DEFINITIONS = [
  //armor
  //note, armor load is based on if the user is wearing the armor 
  { id: "cloth-armor", name: "Cloth Armor", load: 2, requirement: 1, category: "Armor", 
    description: "Cloth armor doesn’t provide much protection. However it lends its simplicity to being light and having the most amount of upgrade slots. Most vault suits are considered cloth armor.", 
    properties: { AC: 10, DT: 0, Slots: 8 } },
  { id: "leather-armor", name: "Leather Armor", load: 7, requirement: 1, category: "Armor", 
    description: "A jacket, fittings around the arms, knee pads, and boots all fall under leather armor. Leather isn't very tough but can fit easily around one's body.", 
    properties: { AC: 11, DT: 1, Slots: 6 } 
  },
  { id: "metal-armor", name: "Metal Armor", load: 10, requirement: 5, category: "Armor",
    description: "In the wasteland, you take what you can get. Metal armor is a combination of various pieces that have been welded or fitted around the body. Granting toughness but allowing less coverage.",
    properties: { AC: 12, DT: 0, Slots: 4 }
   },
  { id: "multi-layer-armor", name: "Multi-layer Armor", load: 20, requirement: 3, category: "Armor",
    description: "A combination of vestments. Layers of leather, cloth, tarp, metal, anything lying around to act as armor is considered multilayered. This armor provides maximum coverage but sacrifices toughness.",
    properties: { AC: 10, DT: 2, Slots: 5 }
   },
  { id: "ballistic-armor", name: "Ballistic Armor", load: 5, requirement: 3, category: "Armor",
    description: "Bulletproof vests, kevlar, or military grade jackets. Ballistic weave is a pre-war synthetic fiber whose reproduction has been lost with the war. Extremely rare but provides the best of all armor aspects; coverage, toughness, and weight.",
    properties: { AC: 12, DT: 3, Slots: 2 }
   },
  { id: "steel-armor", name: "Steel Armor", load: 25, requirement: 6, category: "Armor",
    description: "Fitted plates of metal that cover the body like a knight provide a modern solution in the apocalypse for dealing with threats. steel maximizes coverage and toughness so long as you have the strength.",
    properties: { AC: 13, DT: 2, Slots: 2 }
   },
  { id: "clothing", name: "Clothes", load: 2, requirement: 1, category: "Armor" },
  { id: "ins-clothing", name: "Insulated Clothes", load: 5, requirement: 1, category: "Armor",
    description: "Heat trapping clothing, furs, weighted jackets, boots, hats, gloves, all the works to keep you warm.",
    properties: { Time: "On/Off: 1 minute", 
      Armor: "You are considered insulated while you wear this clothing. You cannot wear armor over this clothing (however, there is an insulated armor upgrade).",
      Combat:"While you wear insulated clothing, your maximum AP is reduced by 1 to a minimum of 6." }
   },
  { id: "hazmat", name: "Hazmat Suit", load: 10, requirement: 1, category: "Armor",
    description: "This large yellow suit is lined with layers of lead to provide the most protection from radiation without wearing power armor.",
    properties: { Time: "On/Off: 1 minute", 
      Armor: "You are considered insulated while you wear this clothing. You can wear armor over this clothing.",
      Combat:"While you wear a hazmat suit, your maximum AP is reduced by 1 to a minimum of 6.",
      Radiation: "Your radiation DC decreases by 10 and you are immune to radiation damage. If you fail a radiation check, your radiation DC does not increase. For every 5 points of damage you take to your hit points while wearing a hazmat suit, it gains a level of decay. Each level of decay increases your radiation score by 1.",
      Repair: "Crafting DC is equal to 12 (+2) and requires x2 lead and x1 cloth." }
   },
  //melee
  { id: "shiv", name: "Shiv", load: 1, requirement: 1, category: "Melee",
    properties: { AP: 3, Damage: "1d4 Piercing", Crit: "20, x2", 
      Fragile: "When this weapon gains a level of decay, it breaks and ceases function." }
   },
  { id: "knife", name: "Knife", load: 2, requirement: 2, category: "Melee", 
    properties: { AP: 3, Damage: "1d6 Piercing or Slashing", Crit: "20, x3", Thrown: "Range: STR x3/x6" } 
  },
  { id: "machete", name: "Machete", load: 3, requirement: 4, category: "Melee" },
  { id: "axe", name: "Axe", load: 10, requirement: 6, category: "Melee" },
  { id: "sledgehammer", name: "Sledgehammer", load: 26, requirement: 7, category: "Melee" },
  { id: "wrench", name: "Wrench", load: 5, requirement: 2, category: "Melee" },
  { id: "bat", name: "Baseball Bat", load: 8, requirement: 4, category: "Melee" },
  { id: "sword", name: "Sword", load: 4, requirement: 3, category: "Melee" },
  { id: "crowbar", name: "Crowbar", load: 20, requirement: 6, category: "Melee" },
  { id: "leadpipe", name: "Lead Pipe", load: 6, requirement: 5, category: "Melee" },
  { id: "shovel", name: "Shovel", load: 10, requirement: 4, category: "Melee" },
  { id: "whacker", name: "Whacker", load: 2, requirement: 1, category: "Melee" },
  { id: "buzzsaw", name: "Buzzsaw", load: 10, requirement: 5, category: "Melee" },
  { id: "chainsaw", name: "Chainsaw", load: 20, requirement: 8, category: "Melee" },
  { id: "brass-knuckles", name: "Brass Knuckles", load: 2, requirement: 5, category: "Melee" },
  { id: "spiked-knuckles", name: "Spiked Knuckles", load: 2, requirement: 4, category: "Melee" },
  { id: "boxing-gloves", name: "Boxing Gloves", load: 6, requirement: 3, category: "Melee" },
  { id: "trap-fist", name: "Trap Fist", load: 20, requirement: 8, category: "Melee" },
  { id: "power-fist", name: "Power Fist", load: 12, requirement: 6, category: "Melee" },
  //ammo
  { id: "357ammo", name: ".357 Ammo 10x", load: 1, requirement: 1, category: "Ammo" },
  { id: "50ammo", name: ".50 Ammo 10x", load: 1, requirement: 1, category: "Ammo" },
  { id: "308ammo", name: ".308 Ammo 10x", load: 1, requirement: 1, category: "Ammo" },
  { id: "44ammo", name: ".44 Ammo 10x", load: 1, requirement: 1, category: "Ammo" },
  { id: "45ammo", name: ".45 Ammo 10x", load: 1, requirement: 1, category: "Ammo" },
  { id: "10mmammo", name: "10mm Ammo 10x", load: 1, requirement: 1, category: "Ammo" },
  { id: "9mmammo", name: "9mm Ammo 10x", load: 1, requirement: 1, category: "Ammo" },
  { id: "12g-ammo", name: "12 gauge Ammo 10x", load: 1, requirement: 1, category: "Ammo" },
  { id: "127mmammo", name: "12.7mm Ammo 10x", load: 1, requirement: 1, category: "Ammo" },
  { id: "556ammo", name: "5.56mm Ammo 10x", load: 1, requirement: 1, category: "Ammo" },
  { id: "Flareammo", name: "Flare Ammo 10x", load: 1, requirement: 1, category: "Ammo" },
  { id: "ECammo", name: "Energy Cell Ammo 30x", load: 1, requirement: 1, category: "Ammo" },
  { id: "MFammo", name: "Microfusion Ammo 30x", load: 1, requirement: 1, category: "Ammo" },
  { id: "cryo-ammo", name: "Cryo Cell Ammo 30x", load: 1, requirement: 1, category: "Ammo" },
  { id: "Fusion-core", name: "Fusion Core", load: 1, requirement: 1, category: "Ammo" },
  { id: "2mmEC-ammo", name: "2mm EC ammo 30x", load: 1, requirement: 1, category: "Ammo" },
  { id: "Gamme-cell-ammo", name: "Gamma Cell ammo 30x", load: 1, requirement: 1, category: "Ammo" },
  { id: "Fuel", name: "Fuel", load: 20, requirement: 1, category: "Ammo" },
  { id: "Mini-nuke", name: "Mini Nuke", load: 12, requirement: 1, category: "Ammo" },
  { id: "Missile", name: "Missile", load: 10, requirement: 1, category: "Ammo" },
  //guns
  { id: "9mm-pistol", name: "9mm Pistol", load: 5, requirement: 3, category: "Guns", 
    properties: { Ammo: "9mm", AP: 5, Damage: "1d6 Ballistic", Range:"x8/x12", Crit: "20, +1d6", Reload: 13, Kickback: "If you hold a this with one hand, both the short and long range are halved." } },
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
  { id: "laser-pistol", name: "Laser Pistol", load: 5, requirement: 1, category: "Energy", description: "A compact directed-energy sidearm with no conventional projectile.", properties: { Ammunition: "Energy cell", Damage: "Energy", Grip: "One-handed" } },
  { id: "laser-rifle", name: "Laser Rifle", load: 8, requirement: 2, category: "Energy" },
  { id: "plasma-pistol", name: "Plasma Pistol", load: 4, requirement: 2, category: "Energy" },
  { id: "plasma-rifle", name: "Plasma Rifle", load: 8, requirement: 3, category: "Energy" },
  { id: "tri-beam", name: "Tri-Beam", load: 10, requirement: 2, category: "Energy" },
  { id: "gauss-pistol", name: "Gauss Pistol", load: 14, requirement: 5, category: "Energy" },
  { id: "gauss-rifle", name: "Gauss Rifle", load: 20, requirement: 5, category: "Energy" },
  { id: "cryolator", name: "Cryolator", load: 20, requirement: 6, category: "Energy" },
  { id: "tesla-cannon", name: "Tesla Cannon", load: 12, requirement: 4, category: "Energy" },
  //explosives
  { id: "dynamite", name: "Dynamite", load: 3, requirement: 1, category: "Explosives", 
    properties: { AP: 6, Damage: "3d6 explosive", Range:"STR x6", Area: "5ft/20ft radius", 
      Deafening:"Each creature in 10ft becomes deafened for a number of rounds equal to 4 - their Endurance ability modifier to a minimum of 1.",
      Destructive: "When you roll a 1 on the damage dice with an explosive that has this property, it is a 2 instead."
     } },
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
  { id: "bear-trap", name: "Bear Trap", load: 30, requirement: 1, category: "Gear",
    Description: "If a creature moves into the area, the trap triggers and they take damage to their Hit Points and become grappled",
    properties: { AP: 6, Damage: "3d4 piercing", Area: "5ft", Actions: "Arm, disarm, reset, pry open"}
   },
  { id: "binoculars", name: "Binoculars", load: 2, requirement: 1, category: "Gear",
    description: "You can spend 3 AP to look through binoculars. While you look through them, your sight is magnified. You have advantage on any perception ability checks relying on sight when viewing objects, creatures, or a location that are at least 100 feet away.",
   },
  { id: "canteen", name: "Canteen", load: 2, requirement: 1, category: "Gear",
    description: "The metal canteen holds 1 liter of liquid.",
   },
  { id: "chains", name: "Chains", load: 12, requirement: 1, category: "Gear",
    description: "Outside of the typical, practical uses of a chain; if you are holding a chain while attempting to grapple or strangle another creature, you have advantage on your Strength ability rolls.",
    properties: { AC: 10, DT: 10, HP: 10, Vulnerable: "ballistic, laser, plasma" }
   },
  { id: "flare", name: "Flare", load: 1, requirement: 1, category: "Gear",
    description: "You can spend 6 AP on your turn to light this flare. This flare creates bright red light in a 30 foot radius and dim red light for an additional 30 feet. This light lasts for 1 hour.",
   },
  { id: "flashlight", name: "Flashlight", load: 2, requirement: 1, category: "Gear", 
    description: "You can spend 1 AP while holding this flashlight to create bright light in a 20 foot cone and dim light for an additional 20 feet. The light lasts for 8 hours so long as you spend 6 AP to load an energy cell into the flashlight" },
  { id: "gasmask", name: "Gas Mask", load: 12, requirement: 1, category: "Gear",
    description: "While you wear this mask, your radiation DC decreases by 3 and your passive sense decreases by 2."
   },
  { id: "lockpick", name: "Lockpick", load: 4, requirement: 1, category: "Gear",
    description: "These metal tools allow you to pick locks with far more proficiency. When you make a breach skill check to pick a lock, the DC is reduced by 5. After you use these lockpicks a total of five times, they break and cease function.",
   },
  { id: "rope", name: "Rope", load: 8, requirement: 1, category: "Gear",
    description: "Rope can be used to tie items together, make a pulley system, climb, or tie someone up. If you are holding a rope while attempting to grapple or strangle another creature, you have advantage on your Strength ability rolls.",
    properties: { AC: 10, DT: 2, HP: 5, Vulnerable: "ballistic, laser, plasma, slashing" }
   },
  { id: "sleeping-bag", name: "Sleeping Bag", load: 10, requirement: 1, category: "Gear",
    description: "This nylon, cloth, or hide bag allows you to sleep even in the roughest terrain."
   },
  { id: "tent", name: "Tent", load: 12, requirement: 1, category: "Gear",
    description: "This small tent provides shelter from outside sources, weather, and terrain."
   },
  { id: "weapon-repair-kit", name: "Weapon Repair Kit", load: 10, requirement: 1, category: "Gear",
    description: "This plastic box filled with tools and mechanisms was used during the great war to repair soldiers' weapons with ease. Though, the tech used to create them has long since been forgotten; many are still found across the wasteland. You can spend 6 AP to insert any weapon into the repair kit. After 1 minute, the weapon is ejected and loses 2 levels of decay. The weapon repair kit ceases function after it has been used a total of three times."
   },
  //food
  { id: "canned-food", name: "Canned Food", load: 2, requirement: 1, category: "Food" },
  { id: "dried-food", name: "Dried Food", load: 1, requirement: 1, category: "Food" },
  { id: "candy", name: "Candy", load: 1, requirement: 1, category: "Food" },
  { id: "boxed-food", name: "Boxed Food", load: 4, requirement: 1, category: "Food" },
  { id: "vegetables", name: "Vegetable/Fruit", load: 1, requirement: 1, category: "Food" },
  { id: "meat", name: "Meat", load: 3, requirement: 1, category: "Food" },
  { id: "steak", name: "Steak", load: 6, requirement: 1, category: "Food" },
  { id: "drink", name: "Drink", load: 2, requirement: 1, category: "Food" },
  { id: "alcohol", name: "Alcohol", load: 2, requirement: 1, category: "Food" },
  { id: "stew", name: "Stew", load: 8, requirement: 1, category: "Food" },
  //meds
  { id: "antibiotics", name: "Antibiotics", load: 1, requirement: 1, category: "Meds",
    description: "This bottled medicine can stop diseases. How it affects the disease you contracted is dependent on the disease. You can consume this bottled medicine with 5 AP."
   },
  { id: "antivenom", name: "Antivenom", load: 3, requirement: 1, category: "Meds",
    description: "You can consume this bottled medicine with 5 AP. If you do; you become resistant to poison damage dealt to your hit points for the next 6 hours."
   },
  { id: "doctors-bag", name: "Doctor's Bag", load: 15, requirement: 1, category: "Meds",
    description: "This bag includes specialized tools, bandages, gauze, and healing serums to provide medical aid. You can use this kit on yourself or another creature so long as they are next to you. When you use it, choose one of the following actions. After you have used three of these actions, the doctor bag supplies are used and it no longer functions.",
    properties: { Tourniquet: "Spend 6 AP and remove up to two levels of bleeding.",
      Pills: "Spend 6 AP to heal a dying creature 1 hit point.",
      Stitch: "Spend 10 minutes and heal a creature with a number of hit points equal to double their healing rate + your medicine skill bonus.",
      Set:"Spend 10 minutes and a creature with the Broken Arm or Broken Leg condition may remove it."
    }
   },
  { id: "first-aid-kit", name: "First Aid Kit", load: 4, requirement: 1, category: "Meds",
    description: "You can use this kit on yourself or another creature so long as they are next to you. When you use it, choose one of the following actions. After you have used one of these actions, the first aid kit supplies are used and it no longer functions.",
    properties: { Tourniquet: "Spend 6 AP and remove up to one level of bleeding.",
      Pills: "Spend 6 AP to heal a dying creature 1 hit point.",
      Stitch: "Spend 10 minutes and heal a creature with a number of hit points equal to their healing rate + your medicine skill bonus."
    }
  },
  { id: "rad-away", name: "Rad-Away", load: 4, requirement: 1, category: "Meds",
    description: "You can spend 15 minutes to use this medicinal item on yourself or a creature within 5 feet of you. At the end of the hour, the affected creature removes two levels of radiation but gains one level of thirst."
   },
  { id: "pills", name: "Pills", load: 1, requirement: 1, category: "Meds" },
  { id: "stimpak", name: "Stimpak", load: 4, requirement: 1, category: "Meds",
    description: "You can spend 4 AP to use this medicinal item on yourself or another creature so long as they are next to you. If that creature is a human, mutant, abomination, animal, or insect; they heal a number of hit points equal to their healing rate. If that creature is a ghoul; they heal a number of hit points equal to half their healing rate."
   },
  { id: "robot-fix-kit", name: "Quick Fix-it 1.0", load: 4, requirement: 1, category: "Meds",
    description: "Quick Fix-it 1.0 is a healing stim but for robots! You can spend 4 AP to use this item on yourself or another creature so long as they are next to you. If that creature is a robot or gen-2 synth; they heal a number of hit points equal to half their healing rate."
   },
  { id: "chem", name: "Chem (Bottle)", load: 1, requirement: 1, category: "Meds" },
  { id: "chems", name: "Chems (10x Pills)", load: 1, requirement: 1, category: "Meds" },
  { id: "overclock-program", name: "Overclock Program 10x", load: 1, requirement: 1, category: "Meds" },
  { id: "cigs", name: "Cigarettes 10x", load: 1, requirement: 1, category: "Meds" },
  //junk
  { id: "ad-junk", name: "Adhesive Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "ac-junk", name: "Acid Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "al-junk", name: "Aluminum Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "ans-junk", name: "Antiseptic Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "asb-junk", name: "Asbestos Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "bf-junk", name: "Ballistic Fiber Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "ce-junk", name: "Ceramic Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "cir-junk", name: "Circuitry Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "cir-junk", name: "Circuitry Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "cl-junk", name: "Cloth Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "cr-junk", name: "Crystal Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "cu-junk", name: "Copper Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "fer-junk", name: "Fertilizer Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "fio-junk", name: "Fiber Optics Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "fig-junk", name: "Fiber Glass Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "ge-junk", name: "Gears Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "gl-junk", name: "Glass Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "led-junk", name: "Lead Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "let-junk", name: "Leather Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "nuc-junk", name: "Nuclear Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "oil-junk", name: "Oil Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "pa-junk", name: "Paint Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "pl-junk", name: "Plastic Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "rb-junk", name: "Rubber Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "scr-junk", name: "Screw Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "sil-junk", name: "Silver Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "spr-junk", name: "Spring Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "stl-junk", name: "Steel Junk", load: 1, requirement: 1, category: "Junk" },
  { id: "wd-junk", name: "Wood Junk", load: 1, requirement: 1, category: "Junk" },
  //misc
  { id: "computer", name: "Pip Boy", load: 4, requirement: 1, category: "Misc",
    description: "A wearable computer that attaches to the wrist and allows for a variety of helpful functions. Every Pip-Boy has the ability to display maps of various locations, play holotapes, track your location via satellite, record and playback audio, and input text notes. Additionally, if you are wearing a Vault Suit that has no more than five levels of decay, any Pip-Boy you wear can monitor your vitals; whenever you heal your hit points, you heal an additional amount equal to your level. "
   },
  { id: "stealth-boy", name: "Stealth Boy", load: 3, requirement: 1, category: "Misc",
    description: "This technological, pre-war wonder generates a modulating field that transmits the reflected light from one side of an object to the other. You can spend 3 AP to activate a stealth boy, once you activate you become invisible for 1 minute so long as you keep the stealth boy on your body. Once a stealth boy has been activated, it cannot be activated again."
   },
  { id: "two-way-radio", name: "Two-Way Radio", load: 2, requirement: 1, category: "Misc",
    description: "These small militaristic devices allow for long range communication. The dual radios function so long as you spend 6 AP to load an energy cell into each one, in which they each last for a total of 100 activations. You can spend 3 AP to activate one of the radios, when you activate it; any sound made within 5 feet of the radio is transmitted to the other radio which can be heard out to a range of 5 feet. If both radios are activated simultaneously, neither emit any sound."
   },
  { id: "book", name: "Book", load: 1, requirement: 1, category: "Misc" },
  { id: "Load1", name: "Other1", load: 1, requirement: 1, category: "Misc" },
  { id: "Load2", name: "Other2", load: 2, requirement: 1, category: "Misc" },
  { id: "Load3", name: "Other3", load: 3, requirement: 1, category: "Misc" },
  { id: "Load4", name: "Other4", load: 4, requirement: 1, category: "Misc" },
  { id: "Load5", name: "Other5", load: 5, requirement: 1, category: "Misc" },
  { id: "Load6", name: "Other6", load: 6, requirement: 1, category: "Misc" },
  { id: "Load7", name: "Other7", load: 7, requirement: 1, category: "Misc" },
  { id: "Load8", name: "Other8", load: 8, requirement: 1, category: "Misc" },
  { id: "Load9", name: "Other9", load: 9, requirement: 1, category: "Misc" },
  { id: "Load10", name: "Other10", load: 10, requirement: 1, category: "Misc" }

];

export const ITEMS = ITEM_DEFINITIONS.map((item) => Object.freeze({
  ...item,
  description: item.description ?? "No description recorded for this item.",
  properties: Object.freeze({ ...(item.properties ?? {}) }),
}));

export function categoryColor(category) {
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;
}

export function meetsItemRequirement(item, strength) {
  return strength >= item.requirement;
}

export function matchesItemSearch(item, searchTerm) {
  const query = searchTerm.trim().toLocaleLowerCase();
  return [item.name, item.category, item.description]
    .some((value) => value.toLocaleLowerCase().includes(query));
}