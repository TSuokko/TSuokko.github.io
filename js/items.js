// Load determines footprint area. Requirement is the minimum Strength score.
export const CATEGORY_COLORS = Object.freeze({
  Armor: "#7c9e9d", //light blue
  Guns: "#333333", //dark grey
  Melee: "#774f13", //brown
  Ammo: "#f2f2e9", //yellow
  Energy: "#00ff00", //green
  Explosives: "#ff0000", //red
  Gear: "#3f2104", //dark brown
  Food: "#1f9907", //light green
  Meds: "#ffb6c1", //light pink
  Tool: "#2b5d8b", //blue
  Misc: "#221e1e", //Black
  Junk: "#7721ee", //saddle brown
  Bag: "#ffff00", //magenta
});

const DEFAULT_CATEGORY_COLOR = "#718071";

//descriptions currently are tests
const ITEM_DEFINITIONS = [
  //bag
  {
    id: "backpack", name: "Backpack", load: 5, requirement: 1, category: "Bag",
    description: " A leather, burlap, or cloth bag with straps or a sling to grant you more space to store items on you. ",
    properties: { Space: 55 }
  },
  {
    id: "camp-backpack", name: "Camping Backpack", load: 5, requirement: 1, category: "Bag",
    description: "This large, heavy duty backpack has nylon strings made for tightening, a waist belt to help balance, many pockets, and an overhead compartment for larger storage. ",
    properties: { Space: 105 }
  },
  {
    id: "bandolier", name: "Bandolier", load: 5, requirement: 1, category: "Bag",
    description: "This pocketed strap fits across any part of the body to allow for additional items to be carried. It is not considered a bag allowing you to wear it and a backpack without becoming encumbered.",
    properties: { Space: 30 }
  },
  //armor
  //note, armor load is based on if the user is wearing the armor 
  {
    id: "cloth-armor", name: "Cloth Armor", load: 3, requirement: 1, category: "Armor",
    description: "Cloth armor doesn't provide much protection. However it lends its simplicity to being light and having the most amount of upgrade slots. Most vault suits are considered cloth armor.",
    properties: { AC: 10, DT: 0, Slots: 8 }
  },
  {
    id: "leather-armor", name: "Leather Armor", load: 8, requirement: 1, category: "Armor",
    description: "A jacket, fittings around the arms, knee pads, and boots all fall under leather armor. Leather isn't very tough but can fit easily around one's body.",
    properties: { AC: 11, DT: 1, Slots: 6 }
  },
  {
    id: "metal-armor", name: "Metal Armor", load: 10, requirement: 5, category: "Armor",
    description: "In the wasteland, you take what you can get. Metal armor is a combination of various pieces that have been welded or fitted around the body. Granting toughness but allowing less coverage.",
    properties: { AC: 12, DT: 0, Slots: 4 }
  },
  {
    id: "multi-layer-armor", name: "Multi-layer Armor", load: 20, requirement: 3, category: "Armor",
    description: "A combination of vestments. Layers of leather, cloth, tarp, metal, anything lying around to act as armor is considered multilayered. This armor provides maximum coverage but sacrifices toughness.",
    properties: { AC: 10, DT: 2, Slots: 5 }
  },
  {
    id: "ballistic-armor", name: "Ballistic Armor", load: 5, requirement: 3, category: "Armor",
    description: "Bulletproof vests, kevlar, or military grade jackets. Ballistic weave is a pre-war synthetic fiber whose reproduction has been lost with the war. Extremely rare but provides the best of all armor aspects; coverage, toughness, and weight.",
    properties: { AC: 12, DT: 3, Slots: 2 }
  },
  {
    id: "steel-armor", name: "Steel Armor", load: 25, requirement: 6, category: "Armor",
    description: "Fitted plates of metal that cover the body like a knight provide a modern solution in the apocalypse for dealing with threats. steel maximizes coverage and toughness so long as you have the strength.",
    properties: { AC: 13, DT: 2, Slots: 2 }
  },
  { id: "clothing", name: "Clothes", load: 2, requirement: 1, category: "Armor" },
  {
    id: "ins-clothing", name: "Insulated Clothes", load: 5, requirement: 1, category: "Armor",
    description: "Heat trapping clothing, furs, weighted jackets, boots, hats, gloves, all the works to keep you warm.",
    properties: {
      Time: "On/Off: 1 minute",
      Armor: "You are considered insulated while you wear this clothing. You cannot wear armor over this clothing (however, there is an insulated armor upgrade).",
      Combat: "While you wear insulated clothing, your maximum AP is reduced by 1 to a minimum of 6."
    }
  },
  {
    id: "hazmat", name: "Hazmat Suit", load: 10, requirement: 1, category: "Armor",
    description: "This large yellow suit is lined with layers of lead to provide the most protection from radiation without wearing power armor.",
    properties: {
      Time: "On/Off: 1 minute",
      Armor: "You are considered insulated while you wear this clothing. You can wear armor over this clothing.",
      Combat: "While you wear a hazmat suit, your maximum AP is reduced by 1 to a minimum of 6.",
      Radiation: "Your radiation DC decreases by 10 and you are immune to radiation damage. If you fail a radiation check, your radiation DC does not increase. For every 5 points of damage you take to your hit points while wearing a hazmat suit, it gains a level of decay. Each level of decay increases your radiation score by 1.",
      Repair: "Crafting DC is equal to 12 (+2) and requires x2 lead and x1 cloth."
    }
  },
  //melee
  {
    id: "shiv", name: "Shiv", load: 1, requirement: 1, category: "Melee",
    properties: {
      AP: 3, Damage: "1d4 Piercing", Crit: "20, x2",
      Fragile: "When this weapon gains a level of decay, it breaks and ceases function."
    }
  },
  {
    id: "knife", name: "Knife", load: 2, requirement: 2, category: "Melee",
    properties: { AP: 3, Damage: "1d6 Piercing or Slashing", Crit: "20, x3", Thrown: "Range: STR x3/x6" }
  },
  {
    id: "switchblade", name: "Switchblade", load: 1, requirement: 1, category: "Melee",
    properties: {
      AP: 3, Damage: "1d6 Piercing or Slashing", Crit: "20, x2",
      Fragile: "When this weapon gains a level of decay, it breaks and ceases function.",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead."
    }
  },
  {
    id: "combat-knife", name: "Combat Knife", load: 2, requirement: 2, category: "Melee",
    properties: {
      AP: 3, Damage: "2d4 Piercing or Slashing", Crit: "20, x3", Thrown: "Range: STR x3/x8",
      Precise: "When you deal damage to a creature's hitpoints from a critical hit with a weapon that has this property, the target gains two levels of bleeding or two levels of short circuit if they are a robot or synth."
    }
  },
  {
    id: "Spear", name: "Spear", load: 8, requirement: 2, category: "Melee",
    properties: {
      AP: 4, Damage: "1d10 Piercing or Slashing", Crit: "20, x2", Thrown: "Range: STR x6/x10",
      Reach: "The range of the weapon is increased by 5 feet."
    }
  },
  {
    id: "sword", name: "Sword", load: 4, requirement: 3, category: "Melee",
    properties: {
      AP: 4, Damage: "2d6 Piercing or Slashing", Crit: "20, x2",
      Defensive: "If you block while holding this weapon, your DT increases by 2."
    }
  },
  {
    id: "cleaver", name: "Cleaver", load: 2, requirement: 4, category: "Melee",
    properties: {
      AP: 5, Damage: "1d6 Slashing", Crit: "20, x3",
      Debilitating: "When you deal damage to a creature's hit points from a targeted attack, you roll twice on the conditions table and apply both conditions. If you roll the same condition twice, the effects stack.",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead."
    }
  },
  {
    id: "fire-axe", name: "Fire Axe", load: 10, requirement: 6, category: "Melee",
    properties: {
      AP: 6, Damage: "2d10 Slashing", Crit: "20, x3",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead.",
      Sturdy: "The weapon does not decay if you throw it, and ignores the negative effects of the first 2 levels of decay."
    }
  },
  {
    id: "hatchet", name: "Hatchet", load: 2, requirement: 4, category: "Melee",
    properties: {
      AP: 4, Damage: "2d6 Piercing", Crit: "20, x3",
      Thrown: "Range: STR x4/x8"
    }
  },
  {
    id: "machete", name: "Machete", load: 3, requirement: 4, category: "Melee",
    properties: {
      AP: 4, Damage: "2d4 Slashing", Crit: "20, x3",
      Precise: "When you deal damage to a creature's hitpoints from a critical hit with a weapon that has this property, the target gains two levels of bleeding or two levels of short circuit if they are a robot or synth.",
      Sturdy: "The weapon does not decay if you throw it, and ignores the negative effects of the first 2 levels of decay."
    }
  },
  {
    id: "sickle", name: "Sickle", load: 2, requirement: 2, category: "Melee",
    properties: {
      AP: 4, Damage: "1d8 Piercing", Crit: "19-20 (use targeted attack)",
      Defensive: "If you block while holding this weapon, your DT increases by 1.",
      Debilitating: "When you deal damage to a creature's hit points from a targeted attack, you roll twice on the conditions table and apply both conditions. If you roll the same condition twice, the effects stack.",
      Precise: "When you deal damage to a creature's hitpoints from a critical hit with a weapon that has this property, the target gains two levels of bleeding or two levels of short circuit if they are a robot or synth."
    }
  },
  {
    id: "pickaxe", name: "Pickaxe", load: 6, requirement: 6, category: "Melee",
    properties: {
      AP: 6, Damage: "3d6 Piercing", Crit: "20, x3",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead.",
      Sturdy: "The weapon does not decay if you throw it, and ignores the negative effects of the first 2 levels of decay."
    }
  },
  {
    id: "pitchfork", name: "Pitchfork", load: 8, requirement: 3, category: "Melee",
    properties: {
      AP: 5, Damage: "4d4 Piercing", Crit: "20, x3",
      Reach: "The range of the weapon is increased by 5 feet.",
      Debilitating: "When you deal damage to a creature's hit points from a targeted attack, you roll twice on the conditions table and apply both conditions. If you roll the same condition twice, the effects stack.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "wrench", name: "Wrench", load: 5, requirement: 2, category: "Melee",
    properties: {
      AP: 4, Damage: "2d4 Bludgeoning", Crit: "20, +4d4",
      Sturdy: "The weapon does not decay if you throw it, and ignores the negative effects of the first 2 levels of decay."
    }
  },
  {
    id: "crowbar", name: "Crowbar", load: 20, requirement: 6, category: "Melee",
    properties: {
      AP: 6, Damage: "2d10 Bludgeoning", Crit: "20, +4d10",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead.",
      Durable: "The weapon does not decay if you throw it, and ignores the negative effects of the first 2 levels of decay.",
      Defensive: "If you block while holding this weapon, your DT increases by 1.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "sledgehammer", name: "Sledgehammer", load: 26, requirement: 7, category: "Melee",
    properties: {
      AP: 6, Damage: "1d12 bludgeoning", Crit: "20, +3d12 & Dazed",
      Sturdy: "The weapon does not decay if you throw it, and ignores the negative effects of the first 2 levels of decay.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead."
    }
  },
  {
    id: "bat", name: "Baseball Bat", load: 8, requirement: 4, category: "Melee",
    properties: {
      AP: 5, Damage: "3d4 Bludgeoning", Crit: "20, +2d4, push back 5ft.",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead.",
      Sturdy: "The weapon does not decay if you throw it, and ignores the negative effects of the first 2 levels of decay.",
      Defensive: "If you block while holding this weapon, your DT increases by 1.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "super-sledge", name: "Super Sledge", load: 30, requirement: 8, category: "Melee",
    properties: {
      AP: 6, Damage: "3d12 Bludgeoning", Crit: "20, +3d12, Dazed",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
    }
  },
  {
    id: "golf-club", name: "Golf Club (9 iron)", load: 5, requirement: 3, category: "Melee",
    properties: {
      AP: 5, Damage: "1d8 Bludgeoning", Crit: "20, +1d6, Prone",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
    }
  },
  {
    id: "dress-cane", name: "Dress Cane", load: 3, requirement: 2, category: "Melee",
    properties: {
      AP: 4, Damage: "1d4 Bludgeoning", Crit: "20, +3d4, Prone",
      Defensive: "If you block while holding this weapon, your DT increases by 1."
    }
  },
  {
    id: "leadpipe", name: "Lead Pipe", load: 6, requirement: 5, category: "Melee",
    properties: {
      AP: 5, Damage: "1d8 Bludgeoning", Crit: "20, +1d6",
      Sturdy: "The weapon does not decay if you throw it, and ignores the negative effects of the first 2 levels of decay.",
      Defensive: "If you block while holding this weapon, your DT increases by 1."
    }
  },
  {
    id: "rolling-pin", name: "Rolling Pin", load: 3, requirement: 4, category: "Melee",
    properties: {
      AP: 4, Damage: "1d6 Bludgeoning", Crit: "20, +2d6",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead.",
      Breakable: "When this weapon gains a level of decay, it breaks and ceases function.",
      Defensive: "If you block while holding this weapon, your DT increases by 1.",
    }
  },
  {
    id: "shovel", name: "Shovel", load: 10, requirement: 4, category: "Melee",
    properties: {
      AP: 4, Damage: "3d4 Bludgeoning or Slashing", Crit: "20, x3",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
      Defensive: "If you block while holding this weapon, your DT increases by 1."
    }
  },
  {
    id: "tire-iron", name: "Tire Iron", load: 4, requirement: 2, category: "Melee",
    properties: {
      AP: 4, Damage: "1d6 Bludgeoning", Crit: "20, +1d4, Prone",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead."
    }
  },
  {
    id: "pool-cue", name: "Pool Cue", load: 4, requirement: 3, category: "Melee",
    properties: {
      AP: 5, Damage: "1d6 Bludgeoning", Crit: "20, +3d6",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead.",
      Breakable: "When this weapon gains a level of decay, it breaks and ceases function.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
    }
  },
  {
    id: "c-whacker", name: "Commie Whacker", load: 2, requirement: 1, category: "Melee",
    properties: {
      AP: 4, Damage: "1 dmg Bludgeoning", Crit: "20, +2 dmg",
      Fragile: "When this weapon gains a level of decay, it breaks and ceases function.",
      Weak: "When you deal damage with a weapon that hasthis property, you do not add any ability score modifier to the damage roll.",
      Special: "If the target admits they are a communist, the weapon always critically hits."
    }
  },
  {
    id: "board", name: "Board", load: 8, requirement: 5, category: "Melee",
    properties: {
      AP: 4, Damage: "1d8 Bludgeoning", Crit: "20, +1d8",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead.",
      Breakable: "When this weapon gains a level of decay, it breaks and ceases function.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
    }
  },
  {
    id: "stop-sign", name: "Stop Sign", load: 45, requirement: 9, category: "Melee",
    properties: {
      AP: 6, Damage: "3d8 Bludgeoning or slashing. Applies Dazed", Crit: "20, x3",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
      Reach: "The range of the weapon is increased by 5 feet.",
    }
  },
  {
    id: "cattle-prod", name: "Cattle Prod", load: 5, requirement: 3, category: "Melee", AmmoId: "ECammo",
    properties: {
      AP: 4, Damage: "1d4 Bludgeoning, 2d8 electricity", Crit: "20, Dazed",
      Reload: "Energy Cells, 10 rounds.",
      Depleted: "1d4 bludgeoning."
    }
  },
  {
    id: "ripper", name: "Ripper", load: 5, requirement: 6, category: "Melee", AmmoId: "ECammo",
    properties: {
      AP: 3, Damage: "2d8 Slashing", Crit: "20, +3d8",
      Debilitating: "When you deal damage to a creature's hit points from a targeted attack, you roll twice on the conditions table and apply both conditions. If you roll the same condition twice, the effects stack.",
      Mangle: " When you deal damage to a creature's hit points from a targeted attack, the target gains two levels of bleeding or two levels of short circuit if they are a robot or synth.",
      Reload: "Energy Cells, 10 rounds.",
      Depleted: "1d4 bludgeoning."
    }
  },
  {
    id: "buzzsaw", name: "Handy Buzz blade", load: 10, requirement: 5, category: "Melee", AmmoId: "ECammo",
    properties: {
      AP: 5, Damage: "1d10 Slashing", Crit: "20, x3",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead.",
      Mangle: " When you deal damage to a creature's hit points from a targeted attack, the target gains two levels of bleeding or two levels of short circuit if they are a robot or synth.",
      Reload: "Energy Cells, 10 rounds.",
      Depleted: "1d6 slashing."
    }
  },
  {
    id: "chainsaw", name: "Chainsaw", load: 20, requirement: 8, category: "Melee", AmmoId: "ECammo",
    properties: {
      AP: 6, Damage: "6d8 Slashing", Crit: "20, +6d8",
      Debilitating: "When you deal damage to a creature's hit points from a targeted attack, you roll twice on the conditions table and apply both conditions. If you roll the same condition twice, the effects stack.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
      Mangle: " When you deal damage to a creature's hit points from a targeted attack, the target gains two levels of bleeding or two levels of short circuit if they are a robot or synth.",
      Reload: "Energy Cells, 5 rounds.",
      Depleted: "1d8 bludgeoning"
    }
  },
  {
    id: "drill", name: "Drill", load: 8, requirement: 5, category: "Melee", AmmoId: "ECammo",
    properties: {
      AP: 4, Damage: "1d8 slashing", Crit: "19-20, (use targeted attacks)",
      Debilitating: "When you deal damage to a creature's hit points from a targeted attack, you roll twice on the conditions table and apply both conditions. If you roll the same condition twice, the effects stack.",
      Mangle: " When you deal damage to a creature's hit points from a targeted attack, the target gains two levels of bleeding or two levels of short circuit if they are a robot or synth.",
      Precise: "When you deal damage to a creature's hitpoints from a critical hit with a weapon that has this property, the target gains two levels of bleeding or two levels of short circuit if they are a robot or synth.",
      Reload: "Energy Cells, 20 rounds.",
      Depleted: "1d4 piercing."
    }
  },
  {
    id: "plasma-cutter", name: "Plasma Cutter", load: 12, requirement: 5, category: "Melee", AmmoId: "MFammo",
    properties: {
      AP: 5, Damage: "4d8 plasma", Crit: "20,  Applies severe limb conditions of your choice.",
      Dismember: "When you deal damage to a creature's hit points from a targeted attack, you roll twice on the conditions table and apply both conditions. If you roll the same condition twice, the effects stack.",
      Reload: "Microfusion Cells, 5 rounds.",
      Depleted: "1d6 bludgeoning"
    }
  },
  {
    id: "brass-knuckles", name: "Brass Knuckles", load: 2, requirement: 5, category: "Melee",
    properties: {
      AP: 4, Damage: "1d4 + 1 dmg Bludgeoning", Crit: "20, +4d4",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead.",
      Durable: "The weapon does not decay if you throw it, and ignores the negative effects of the first 2 levels of decay."
    }
  },
  {
    id: "spiked-knuckles", name: "Spiked Knuckles", load: 2, requirement: 4, category: "Melee",
    properties: {
      AP: 4, Damage: "1d4 + 1 dmg Piercing", Crit: "19-20 (use targeted attacks)",
      Precise: "When you deal damage to a creature's hitpoints from a critical hit with a weapon that has this property, the target gains two levels of bleeding or two levels of short circuit if they are a robot or synth.",
    }
  },
  {
    id: "boxing-gloves", name: "Boxing Gloves", load: 6, requirement: 3, category: "Melee",
    properties: {
      AP: 4, Damage: "1d4 Bludgeoning", Crit: "20, +1d4, Applies Dazed",
      Defensive: "If you block while holding this weapon, your DT increases by 1.",
      Sturdy: "The weapon does not decay if you throw it, and ignores the negative effects of the first 2 levels of decay."
    }
  },
  {
    id: "h-trap-fist", name: "Hunting Trap Fist", load: 20, requirement: 8, category: "Melee",
    properties: {
      AP: 5, Damage: "4d4 Piercing", Crit: "20, X2",
      Clasp: "When you deal damage to a creature's hit points, the weapon clamps onto them and renders them unable to move away from you. The creature becomes grappled by you and any Strength or Agility ability checks made to escape this grapple have disadvantage. If the grappled creature is one size category larger than you, they are not grappled unless your Strength ability score is equal to 10. A creature two size categories, or larger, than you cannot be grappled in this way.",
      Debilitating: "When you deal damage to a creature's hit points from a targeted attack, you roll twice on the conditions table and apply both conditions. If you roll the same condition twice, the effects stack.",
      Defensive: "If you block while holding this weapon, your DT increases by 1.",
      Mangle: " When you deal damage to a creature's hit points from a targeted attack, the target gains two levels of bleeding or two levels of short circuit if they are a robot or synth."

    },
  },
  {
    id: "power-fist", name: "Power Fist", load: 12, requirement: 6, category: "Melee", AmmoId: "ECammo",
    properties: {
      AP: 4, Damage: "4d6 Bludgeoning", Crit: "20, x2, Prone or knockback 15 feet.",
      Debilitating: "When you deal damage to a creature's hit points from a targeted attack, you roll twice on the conditions table and apply both conditions. If you roll the same condition twice, the effects stack.",
      Weighted: "When you roll a 1 on the damage dice with a weapon that has this property, it is a 2 instead.",
      Reload: "Energy Cells, 20 rounds.",
      Depleted: "1d6 bludgeoning."
    }
  },
  //ammo
  { id: "357ammo", name: ".357 Ammo 10x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 10 } },
  { id: "50ammo", name: ".50 Ammo 10x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 10 } },
  { id: "308ammo", name: ".308 Ammo 10x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 10 } },
  { id: "44ammo", name: ".44 Ammo 10x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 10 } },
  { id: "45ammo", name: ".45 Ammo 10x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 10 } },
  { id: "5mmammo", name: "5mm Ammo 10x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 10 } },
  { id: "10mmammo", name: "10mm Ammo 10x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 10 } },
  { id: "9mmammo", name: "9mm Ammo 10x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 10 } },
  { id: "12g-ammo", name: "12 gauge Ammo 10x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 10 } },
  { id: "127mmammo", name: "12.7mm Ammo 10x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 10 } },
  { id: "556ammo", name: "5.56mm Ammo 10x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 10 } },
  { id: "Flareammo", name: "Flare Ammo 10x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 10 } },
  { id: "ECammo", name: "Energy Cell Ammo 30x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 30 } },
  { id: "MFammo", name: "Microfusion Ammo 30x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 30 } },
  { id: "cryo-ammo", name: "Cryo Cell Ammo 30x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 30 } },
  { id: "Fusion-core", name: "Fusion Core", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 1 } },
  { id: "2mmEC-ammo", name: "2mm EC ammo 30x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 30 } },
  { id: "Gamma-cell-ammo", name: "Gamma Cell ammo 30x", load: 1, requirement: 1, category: "Ammo", properties: { Quantity: 30 } },
  { id: "Fuel", name: "Fuel", load: 20, requirement: 1, category: "Ammo", properties: { Quantity: 1 } },
  { id: "Mini-nuke", name: "Mini Nuke", load: 12, requirement: 1, category: "Ammo", properties: { Quantity: 1 } },
  { id: "Missile", name: "Missile", load: 10, requirement: 1, category: "Ammo", properties: { Quantity: 1 } },
  //guns
  {
    id: "flare-gun", name: "Flare Gun", load: 3, requirement: 1, category: "Guns", AmmoId: "Flareammo",
    properties: {
      Reload: "Flare, 1 round", AP: 4, Damage: "1d4 Fire", Range: "PER x4/x10", Crit: "20, +1d4",
      Incendiary: "When you deal damage to a target creature's hit points, they gain the Burning condition. If an attack with a ranged weapon with this property misses, the projectile may land nearby and alight any flammable objects. Additionally, any flammable objects hit by a weapon with this property immediately burst into flames.",
      QuickReload: "Reloading a weapon with this property costs 4 AP instead of 6."
    }
  },
  {
    id: "acid-soaker", name: "Acid Soaker", load: 5, requirement: 1, category: "Guns",
    properties: {
      Reload: "Acid, 20 rounds", AP: 4, Damage: "1 Acid", Range: "30 ft.", Crit: "20, +1d4",
      Corrosive: "When you deal damage to a creature's hit points with a weapon that has this property, their armor gains one level of decay. If they have natural armor, their AC and DT decrease by 1 to a maximum of 3 until their hit points are returned to full. Power Armor is unaffected by this condition.",
    }
  },
  {
    id: "pipe-pistol", name: "Pipe Pistol", load: 6, requirement: 3, category: "Guns", AmmoId: "9mmammo",
    properties: {
      Reload: "9mm, 12 rounds", AP: 5, Damage: "1d4 Ballistic", Range: "PER x6/x10", Crit: "20, +1d4",
      Kickback: "If you hold a this with one hand, both the short and long range are halved.",
      Breakable: "The weapon gains a level of decay when you roll a 3 or lower on an attack roll.",
      Semiautomatic: "If you spend AP to attack with this weapon directly after spending AP to attack with it on the same turn, you can make another attack without spending any AP."
    }
  },
  {
    id: "10mm-pistol", name: "10mm Pistol", load: 6, requirement: 4, category: "Guns", AmmoId: "10mmammo",
    properties: {
      Reload: "10mm, 12 rounds", AP: 5, Damage: "2d4 Ballistic", Range: "PER x8/x16", Crit: "19, +1d4",
      Kickback: "If you hold a this with one hand, both the short and long range are halved.",
      Sturdy: "The weapon does not decay if you throw it, and ignores the negative effects of the first 2 levels of decay."
    }
  },
  {
    id: "9mm-pistol", name: "9mm Pistol", load: 5, requirement: 3, category: "Guns", AmmoId: "9mmammo",
    properties: {
      Reload: "9mm, 13 rounds", AP: 5, Damage: "1d6 Ballistic", Range: "PER x8/x12", Crit: "20, +1d6",
      Kickback: "If you hold a this with one hand, both the short and long range are halved."
    }
  },
  {
    id: "5-56mm-pistol", name: "5.56mm Pistol", load: 7, requirement: 5, category: "Guns", AmmoId: "556ammo",
    properties: {
      Reload: "5.56mm, 5 rounds", AP: 4, Damage: "1d8 Ballistic", Range: "PER x5/x16", Crit: "20, x2",
      Kickback: "If you hold a this with one hand, both the short and long range are halved.",
      ManualReload: "Reloading a weapon with this property costs 6 AP instead of 4."
    }
  },
  {
    id: "pipe-revolver", name: "Pipe Revolver", load: 5, requirement: 4, category: "Guns", AmmoId: "44ammo",
    properties: {
      Reload: ".44, 6 rounds", AP: 5, Damage: "1d6 Ballistic", Range: "PER x6/x10", Crit: "20, x2",
      Breakable: "The weapon gains a level of decay when you roll a 3 or lower on an attack roll.",
      ManualReload: "Reloading a weapon with this property costs 6 AP instead of 4."
    }
  },
  {
    id: "357-revolver", name: ".357 Revolver", load: 4, requirement: 4, category: "Guns", AmmoId: "357ammo",
    properties: {
      Reload: ".357, 6 rounds", AP: 5, Damage: "1d8 Ballistic", Range: "PER x6/x18", Crit: "20, x3",
      Accurate: "When you make a targeted attack roll with a weapon that has this property, you may choose the limb condition instead of rolling for it.",
      ManualReload: "Reloading a weapon with this property costs 6 AP instead of 4."
    }
  },
  {
    id: "44-magnum", name: ".44 Magnum", load: 5, requirement: 4, category: "Guns", AmmoId: "44ammo",
    properties: {
      Reload: ".44, 6 rounds", AP: 5, Damage: "2d8 Ballistic", Range: "PER x6/x14", Crit: "20, x3",
      Accurate: "When you make a targeted attack roll with a weapon that has this property, you may choose the limb condition instead of rolling for it.",
      ManualReload: "Reloading a weapon with this property costs 6 AP instead of 4."
    }
  },
  {
    id: "127-pistol", name: "12.7mm Pistol", load: 8, requirement: 5, category: "Guns", AmmoId: "127mmammo",
    properties: {
      Reload: "12.7mm, 7 rounds", AP: 5, Damage: "2d6 Ballistic", Range: "PER x5/x10", Crit: "20, +1d6",
      Kickback: "If you hold a this with one hand, both the short and long range are halved.",
      Semiautomatic: "If you spend AP to attack with this weapon directly after spending AP to attack with it on the same turn, you can make another attack without spending any AP."
    }
  },
  {
    id: "45-auto-pistol", name: ".45 Auto Pistol", load: 6, requirement: 3, category: "Guns", AmmoId: "45ammo",
    properties: {
      Reload: ".45, 7 rounds", AP: 4, Damage: "1d10 Ballistic", Range: "PER x10/x16", Crit: "20, x3",
      Kickback: "If you hold a this with one hand, both the short and long range are halved.",
      Semiautomatic: "If you spend AP to attack with this weapon directly after spending AP to attack with it on the same turn, you can make another attack without spending any AP."
    }
  },
  {
    id: "9mm-submachine-gun", name: "9mm Submachine Gun", load: 6, requirement: 5, category: "Guns", AmmoId: "9mmammo",
    properties: {
      Reload: "9mm, 30 rounds", AP: 6, Damage: "1d4 Ballistic", Range: "PER x4/x8", Crit: "20, +1d4",
      Automatic: "When you spend AP to attack, you can make a number of additional attacks without spending any additional AP, the target of these additional attacks must be within 10 feet of the previous target and you do not add your agility modifier to the damage of the additional attacks.",
      AdditionalAttacks: 2,
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
      Unstable: "A weapon with this property gains a level of decay every five times you reload it instead of ten."
    }
  },
  {
    id: "10mm-submachine-gun", name: "10mm Submachine Gun", load: 8, requirement: 6, category: "Guns", AmmoId: "10mmammo",
    properties: {
      Reload: "10mm, 30 rounds", AP: 6, Damage: "1d6 Ballistic", Range: "PER x4/x8", Crit: "20, +1d6",
      Automatic: "When you spend AP to attack, you can make a number of additional attacks without spending any additional AP, the target of these additional attacks must be within 10 feet of the previous target and you do not add your agility modifier to the damage of the additional attacks.",
      AdditionalAttacks: 2,
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
      Unstable: "A weapon with this property gains a level of decay every five times you reload it instead of ten."
    }
  },
  {
    id: "tommy-gun", name: "Tommy Gun", load: 12, requirement: 6, category: "Guns", AmmoId: "45ammo",
    properties: {
      Reload: ".45, 50 rounds", AP: 6, Damage: "1d6 Ballistic", Range: "PER x4/x7", Crit: "20, +1d6",
      Automatic: "When you spend AP to attack, you can make a number of additional attacks without spending any additional AP, the target of these additional attacks must be within 10 feet of the previous target and you do not add your agility modifier to the damage of the additional attacks.",
      AdditionalAttacks: 4,
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
      Unstable: "A weapon with this property gains a level of decay every five times you reload it instead of ten.",
      QuickReload: "Reloading a weapon with this property costs 4 AP instead of 6."
    }
  },
  {
    id: "127mm-submachine-gun", name: "12.7mm Submachine Gun", load: 10, requirement: 6, category: "Guns", AmmoId: "127mmammo",
    properties: {
      Reload: "12.7mm, 21 rounds", AP: 6, Damage: "1d10 Ballistic", Range: "PER x5/x8", Crit: "20, +1d10",
      Automatic: "When you spend AP to attack, you can make a number of additional attacks without spending any additional AP, the target of these additional attacks must be within 10 feet of the previous target and you do not add your agility modifier to the damage of the additional attacks.",
      AdditionalAttacks: 5,
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
      Unstable: "A weapon with this property gains a level of decay every five times you reload it instead of ten."
    }
  },
  {
    id: "syringer", name: "Syringer", load: 8, requirement: 2, category: "Guns",
    properties: {
      Reload: "Syringe, 1 round", AP: 5, Damage: "1 dmg Piercing", Range: "PER x3/x6", Crit: "20, deals damage to hit points.",
      Accurate: "When you make a targeted attack roll with a weapon that has this property, you may choose the limb condition instead of rolling for it.",
      Powerful: "When you deal damage to a creature within 5 feet of you with a weapon that has this property, you deal extra damage equal to the crit damage.",
      QuickReload: "Reloading a weapon with this property costs 4 AP instead of 6."
    }
  },
  {
    id: "varmint-rifle", name: "Varmint Rifle", load: 13, requirement: 4, category: "Guns", AmmoId: "556ammo",
    properties: {
      Reload: "5.56mm, 5 rounds", AP: 6, Damage: "2d4 Ballistic", Range: "PER x8/x18", Crit: "20, +2d4",
      Accurate: "When you make a targeted attack roll with a weapon that has this property, you may choose the limb condition instead of rolling for it.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "trail-carbine", name: "Trail Carbine", load: 13, requirement: 4, category: "Guns", AmmoId: "44ammo",
    properties: {
      Reload: ".44, 8 rounds", AP: 6, Damage: "2d8 Ballistic", Range: "PER x8/x18", Crit: "20, x2",
      Accurate: "When you make a targeted attack roll with a weapon that has this property, you may choose the limb condition instead of rolling for it.",
      ManualReload: "When you reload a weapon with this property, you can choose how much AP you spend to reload but you must spend at least 3. You reload 1 round for every AP spent to reload.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "cowboy-repeater", name: "Cowboy Repeater", load: 13, requirement: 4, category: "Guns", AmmoId: "357ammo",
    properties: {
      Reload: ".357, 7 rounds", AP: 5, Damage: "2d6 Ballistic", Range: "PER x8/x18", Crit: "20, x2",
      Accurate: "When you make a targeted attack roll with a weapon that has this property, you may choose the limb condition instead of rolling for it.",
      ManualReload: "When you reload a weapon with this property, you can choose how much AP you spend to reload but you must spend at least 3. You reload 1 round for every AP spent to reload.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "junk-jet", name: "Junk Jet", load: 18, requirement: 6, category: "Guns",
    properties: {
      Reload: "Junk, 5 rounds", AP: 6, Damage: "3d6 Bludgeoning or Piercing", Range: "PER x4/x10", Crit: "19, +3d6",
      Breakable: "The weapon gains a level of decay when you roll a 3 or lower on an attack roll.",
      Powerful: "When you deal damage to a creature within 5 feet of you with a weapon that has this property, you deal extra damage equal to the crit damage.",
      Unstable: "A weapon with this property gains a level of decay every five times you reload it instead of ten.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "sniper-rifle", name: "Sniper Rifle", load: 16, requirement: 5, category: "Guns", AmmoId: "308ammo",
    properties: {
      Reload: ".308, 6 rounds", AP: 6, Damage: "2d12 Ballistic", Range: "PER x10/x30", Crit: "20, x5",
      Accurate: "When you make a targeted attack roll with a weapon that has this property, you may choose the limb condition instead of rolling for it.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "assault-rifle", name: "Assault Rifle", load: 14, requirement: 5, category: "Guns", AmmoId: "5mmammo",
    properties: {
      Reload: "5mm, 24 rounds", AP: 6, Damage: "1d10 Ballistic", Range: "PER x8/x18", Crit: "20, +1d10",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
      QuickReload: "Reloading a weapon with this property costs 4 AP instead of 6.",
      AutomaticShot: "When you spend AP to attack, you can make a number of additional attacks without spending any additional AP, the target of these additional attacks must be within 10 feet of the previous target and you do not add your agility modifier to the damage of the additional attacks.",
      AdditionalAttacks: 3,
      Unstable: "A weapon with this property gains a level of decay every five times you reload it instead of ten.",
      SingleShot: "The following properties activate (Accurate, Semi-Automatic) and Automatic Shot properties are disabled.",
      Accurate: "When you make a targeted attack roll with a weapon that has this property, you may choose the limb condition instead of rolling for it.",
      SemiAutomatic: "If you spend AP to attack with this weapon directly after spending AP to attack with it on the same turn, you can make another attack without spending any AP.",
    }
  },
  {
    id: "anti-material-rifle", name: "Anti-Material Rifle", load: 20, requirement: 7, category: "Guns", AmmoId: "50ammo",
    properties: {
      Reload: ".50, 6 rounds", AP: 6, Damage: "5d8 Ballistic", Range: "PER x16/x40", Crit: "20, x5",
      Accurate: "When you make a targeted attack roll with a weapon that has this property, you may choose the limb condition instead of rolling for it.",
      Destructive: "When you roll a 1 on the damage dice with an explosive that has this property, it is a 2 instead.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "single-shotgun", name: "Single Shotgun", load: 11, requirement: 4, category: "Guns",
    properties: {
      Reload: "20 gauge, 1 round", AP: 4, Damage: "3d6 Ballistic", Range: "PER x3/x6", Crit: "20, +3d6",
      Powerful: "When you deal damage to a creature within 5 feet of you with a weapon that has this property, you deal extra damage equal to the crit damage.",
      ManualReload: "When you reload a weapon with this property, you can choose how much AP you spend to reload but you must spend at least 3. You reload 1 round for every AP spent to reload.",
      Spread: "When you attack a target in the second range increment of a weapon that has this property, you also target each creature and object within 5 feet of the target",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "sawed-off-shotgun", name: "Sawed Off Shotgun", load: 8, requirement: 4, category: "Guns", AmmoId: "12g-ammo",
    properties: {
      Reload: "12 gauge, 2 rounds", AP: 4, Damage: "2d10 Ballistic", Range: "PER x2/x4", Crit: "20, +4d10",
      Destructive: "When you roll a 1 on the damage dice with an explosive that has this property, it is a 2 instead.",
      Powerful: "When you deal damage to a creature within 5 feet of you with a weapon that has this property, you deal extra damage equal to the crit damage.",
      ManualReload: "When you reload a weapon with this property, you can choose how much AP you spend to reload but you must spend at least 3. You reload 1 round for every AP spent to reload.",
      Spread: "When you attack a target in the second range increment of a weapon that has this property, you also target each creature and object within 5 feet of the target",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
      Unstable: "A weapon with this property gains a level of decay every five times you reload it instead of ten."
    }
  },
  {
    id: "double-barrel-shotgun", name: "Double Barrel Shotgun", load: 12, requirement: 5, category: "Guns", AmmoId: "12g-ammo",
    properties: {
      Reload: "12 gauge, 2 rounds", AP: 4, Damage: "2d10 Ballistic", Range: "PER x3/x6", Crit: "20, +3d10",
      Powerful: "When you deal damage to a creature within 5 feet of you with a weapon that has this property, you deal extra damage equal to the crit damage.",
      ManualReload: "When you reload a weapon with this property, you can choose how much AP you spend to reload but you must spend at least 3. You reload 1 round for every AP spent to reload.",
      Spread: "When you attack a target in the second range increment of a weapon that has this property, you also target each creature and object within 5 feet of the target",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "combat-shotgun", name: "Combat Shotgun", load: 12, requirement: 5, category: "Guns", AmmoId: "12g-ammo",
    properties: {
      Reload: "12 gauge, 8 rounds", AP: 4, Damage: "2d12 Ballistic", Range: "PER x4/x7", Crit: "20, +2d12",
      Powerful: "When you deal damage to a creature within 5 feet of you with a weapon that has this property, you deal extra damage equal to the crit damage.",
      Spread: "When you attack a target in the second range increment of a weapon that has this property, you also target each creature and object within 5 feet of the target",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "flamer", name: "Flamer", load: 60, requirement: 7, category: "Guns", AmmoId: "Fuel",
    properties: {
      Reload: "Fuel, 5 rounds", AP: 6, Damage: "2d10 Fire", Range: "60ft. line,10 feet wide, or a 20 ft cone.", Crit: "-",
      AreaOfEffect: "When you attack with a weapon that has this property, you do not make an attack roll. Instead you use the required ammo and any creatures or objects in range take the weapon's damage when the attack hits. You do not add your Agility modifier to this damage.",
      Incendiary: "When you deal damage to a target creature's hit points, they gain the Burning condition. If an attack with a ranged weapon with this property misses, the projectile may land nearby and alight any flammable objects. Additionally, any flammable objects hit by a weapon with this property immediately burst into flames.",
      SlowReload: "Reloading a weapon with this property costs 8 AP instead of 6.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "minigun", name: "Minigun", load: 90, requirement: 9, category: "Guns", AmmoId: "5mmammo",
    properties: {
      Reload: "5mm, 120 rounds (uses 10 per attack)", AP: 6, Damage: "5d6 Ballistic", Range: "PER x15/x40", Crit: "20, +2d6",
      Automatic: "When you spend AP to attack, you can make a number of additional attacks without spending any additional AP, the target of these additional attacks must be within 10 feet of the previous target and you do not add your agility modifier to the damage of the additional attacks.",
      AdditionalAttacks: 2,
      Destructive: "When you roll a 1 on the damage dice with an explosive that has this property, it is a 2 instead.",
      Durable: "A weapon with this property does not gain decay from attack rolls.",
      SlowReload: "Reloading a weapon with this property costs 8 AP instead of 6.",
      Spread: "When you attack a target in the second range increment of a weapon that has this property, you also target each creature and object within 5 feet of the target",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "fat-man", name: "Fat Man", load: 30, requirement: 5, category: "Guns", AmmoId: "Mini-nuke",
    properties: {
      Reload: "Mini Nuke, 1 round", AP: 6, Damage: "12d10 Explosive, 30ft radius and 2 levels of radiation in a 60ft radius", Range: "120 feet", Crit: "-",
      AreaOfEffect: "When you attack with a weapon that has this property, you do not make an attack roll. Instead you use the required ammo and any creatures or objects in range take the weapon's damage when the attack hits. You do not add your Agility modifier to this damage.",
      Destructive: "When you roll a 1 on the damage dice with an explosive that has this property, it is a 2 instead.",
      Durable: "A weapon with this property does not gain decay from attack rolls.",
      SlowReload: "Reloading a weapon with this property costs 8 AP instead of 6.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "missile-launcher", name: "Missile Launcher", load: 50, requirement: 7, category: "Guns", AmmoId: "Missile",
    properties: {
      Reload: "Missile, 1 round", AP: 6, Damage: "10d6 Explosive, 10ft radius", Range: "x10/x40", Crit: "-",
      AreaOfEffect: "When you attack with a weapon that has this property, you do not make an attack roll. Instead you use the required ammo and any creatures or objects in range take the weapon's damage when the attack hits. You do not add your Agility modifier to this damage.",
      Destructive: "When you roll a 1 on the damage dice with an explosive that has this property, it is a 2 instead.",
      Durable: "A weapon with this property does not gain decay from attack rolls.",
      SlowReload: "Reloading a weapon with this property costs 8 AP instead of 6.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  //energy
  {
    id: "laser-pistol", name: "Laser Pistol", load: 5, requirement: 1, category: "Energy", AmmoId: "ECammo",
    properties: {
      Reload: "1 Energy Cell, 30 rounds", AP: 4, Damage: "1d8 Laser + PER Mod", Range: "x10/x20", Crit: "20, x2, applies Burning condition.",
      SemiAutomatic: " If you spend AP to attack with this weapon directly after spending AP to attack with it on the same turn, you can make another attack without spending any AP."
    }
  },
  {
    id: "laser-rifle", name: "Laser Rifle", load: 8, requirement: 2, category: "Energy", AmmoId: "ECammo",
    properties: {
      Reload: "1 Energy Cell, 24 rounds", AP: 5, Damage: "2d6 Laser + PER Mod", Range: "x12/x24", Crit: "20, x2, applies Burning condition.",
      Accurate: "When you make a targeted attack roll with a weapon that has this property, you may choose the limb condition instead of rolling for it.",
      Unwieldy: "If you attack with a ranged weapon that has this property with only one hand, you have disadvantage on the attack roll."
    }
  },
  {
    id: "tri-beam", name: "Tri-Beam Laser", load: 10, requirement: 2, category: "Energy", AmmoId: "ECammo",
    properties: {
      Reload: "1 Energy Cell, 8 rounds", AP: 5, Damage: "3d6 Laser + PER Mod", Range: "x4/x8", Crit: "20, 5d6 Laser and applies Burning condition.",
      Spread: "When you attack a target in the second range increment of a weapon that has this property, you also target each creature and object within 5 feet of the target",
      Powerful: "When you deal damage to a creature within 5 feet of you with a weapon that has this property, you deal extra damage equal to the crit damage.",
      Unwieldy: "If you attack with a ranged weapon that has this property with only one hand, you have disadvantage on the attack roll."
    }
  },
  {
    id: "plasma-pistol", name: "Plasma Pistol", load: 4, requirement: 2, category: "Energy", AmmoId: "MFammo",
    properties: {
      Reload: "1 Microfusion Cell, 16 rounds", AP: 5, Damage: "1d12 Plasma + PER Mod", Range: "x6/x10", Crit: "20, x3",
      Destructive: "When you roll a 1 on the damage dice with an explosive that has this property, it is a 2 instead.",
      Kickback: "If you hold a this with one hand, both the short and long range are halved."
    }
  },
  {
    id: "plasma-rifle", name: "Plasma Rifle", load: 8, requirement: 3, category: "Energy", AmmoId: "MFammo",
    properties: {
      Reload: "1 Microfusion Cell, 12 rounds", AP: 6, Damage: "2d8 Plasma + PER Mod", Range: "x8/x12", Crit: "20, x3",
      Destructive: "When you roll a 1 on the damage dice with an explosive that has this property, it is a 2 instead.",
      Debilitating: "When you deal damage to a creature's hit points from a targeted attack with a weapon that has this property, you roll twice on the conditions table and apply both conditions. If you roll the same condition twice, the effects stack.",
      Unwieldy: "If you attack with a ranged weapon that has this property with only one hand, you have disadvantage on the attack roll."
    }
  },
  {
    id: "gauss-pistol", name: "Gauss Pistol", load: 14, requirement: 5, category: "Energy", AmmoId: "2mmEC-ammo",
    properties: {
      Reload: "2mm EC, 12 rounds", AP: 3, Damage: "1d10 Ballistic + PER Mod", Range: "x8/x16", Crit: "20, +2d10",
      Charge: "When you spend action points to make an attack roll with a weapon that has this property, you can spend 3 additional AP to add one additional damage dice to the damage. Alternatively, you can spend 6 additional AP to add two additional damage dice. Whenever you charge a weapon, you add your modifier twice to the damage total instead of once.",
      Kickback: "If you hold a this with one hand, both the short and long range are halved.",
      Powerful: "When you deal damage to a creature within 5 feet of you with a weapon that has this property, you deal extra damage equal to the crit damage.",
      Unstable: "A weapon with this property gains a level of decay every five times you reload it instead of ten."
    }
  },
  {
    id: "gauss-rifle", name: "Gauss Rifle", load: 20, requirement: 5, category: "Energy", AmmoId: "2mmEC-ammo",
    properties: {
      Reload: "2mm EC, 6 rounds", AP: 3, Damage: "1d12 Ballistic + PER Mod", Range: "x10/x20", Crit: "20, +4d12",
      Charge: "When you spend action points to make an attack roll with a weapon that has this property, you can spend 3 additional AP to add one additional damage dice to the damage. Alternatively, you can spend 6 additional AP to add two additional damage dice. Whenever you charge a weapon, you add your modifier twice to the damage total instead of once.",
      Kickback: "If you hold a this with one hand, both the short and long range are halved.",
      Powerful: "When you deal damage to a creature within 5 feet of you with a weapon that has this property, you deal extra damage equal to the crit damage.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll.",
      Unstable: "A weapon with this property gains a level of decay every five times you reload it instead of ten."
    }
  },
  {
    id: "gamma-gun", name: "Gamma Gun", load: 8, requirement: 2, category: "Energy", AmmoId: "Gamma-cell-ammo",
    properties: {
      Reload: "1 Gammacell, 8 rounds", AP: 4, Damage: "1d12 Radiation + PER Mod", Range: "x6/x10", Crit: "20, +1d12",
      Kickback: "If you hold a this with one hand, both the short and long range are halved.",
      Radioactive: "When you deal damage to a target creature's hit points with a weapon that has this property, they must succeed a radiation check or take 1 level of rads."
    }
  },
  {
    id: "cryolator", name: "Cryolator", load: 20, requirement: 6, category: "Energy", AmmoId: "cryo-ammo",
    properties: {
      Reload: "1 Cryocell, 3 rounds", AP: 5, Damage: "3d10 Cryo", Range: "20ft cone", Crit: "20, x2",
      AreaOfEffect: "When you attack with a weapon that has this property, you do not make an attack roll. Instead you use the required ammo and any creatures or objects in range take the weapon's damage when the attack hits. You do not add your Agility modifier to this damage.",
      Freezing: "When a creature takes damage from a weapon with this property, they gain the Slowed condition until the end of their next turn.",
      SlowReload: "Reloading a weapon with this property costs 10 AP instead of 6. If you and another creature are within 5 feet of the weapon, you can instead spend 5 AP to reload the weapon so long as they spend 5 AP on their previous turn to help you. If your maximum AP is 9 or lower and you reload a weapon with this property and another creature is not helping you; you must spend all your AP, then you must spend any leftover AP on your next turn to reload the weapon",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "tesla-cannon", name: "Tesla Cannon", load: 12, requirement: 4, category: "Energy", AmmoId: "MFammo",
    properties: {
      Reload: "1 Microfusion Cell, 5 rounds", AP: 3, Damage: "1d8 Electricity + PER Mod", Range: "30 feet", Crit: "20, 1d8 and applies Dazed condition.",
      Arc: "When you deal damage to a creature with a weapon that has this property, the energy leaps to another nearby creature. Each creature within 20 feet of the previously damaged creature takes the same damage. The energy leaps so long as there is a new target within 20 feet of the previous one.",
      Charge: "When you spend action points to make an attack roll with a weapon that has this property, you can spend 3 additional AP to add one additional damage dice to the damage. Alternatively, you can spend 6 additional AP to add two additional damage dice. Whenever you charge a weapon, you add your modifier twice to the damage total instead of once.",
      Electromagnetic: "When a robot, synth, or creature made of inorganic material takes damage from a weapon with this property, the damage is doubled for them.",
      TwoHanded: "If you attack with only one hand, you have disadvantage on the attack roll unless you spend 2 additional AP to attack. Alternatively, if your Strength ability score is greater than Strength requirement by at least 3, you can wield this weapon with one hand without having disadvantage on the attack roll."
    }
  },
  {
    id: "gatling-laser", name: "Gatling Laser", load: 50, requirement: 5, category: "Energy", AmmoId: "Fusion-core",
    properties: {
      Reload: "1 Fusion Core, 100 rounds", AP: 6, Damage: "2d10 Laser + PER Mod", Range: "x30/x30", Crit: "20, +1d10 and applies Burning condition.",
      Automatic: "When you spend AP to attack, you can make a number of additional attacks without spending any additional AP, the target of these additional attacks must be within 10 feet of the previous target and you do not add your agility modifier to the damage of the additional attacks.",
      AdditionalAttacks: 4,
      Destructive: "When you roll a 1 on the damage dice with an explosive that has this property, it is a 2 instead.",
      Unwieldy: "If you attack with a ranged weapon that has this property with only one hand, you have disadvantage on the attack roll.",
    }
  },
  //explosives
  {
    id: "dynamite", name: "Dynamite", load: 3, requirement: 1, category: "Explosives",
    properties: {
      AP: 6, Damage: "3d6 explosive", Range: "STR x6", Area: "5ft/20ft radius",
      Deafening: "Each creature in 10ft becomes deafened for a number of rounds equal to 4 - their Endurance ability modifier to a minimum of 1.",
      Destructive: "When you roll a 1 on the damage dice with an explosive that has this property, it is a 2 instead."
    }
  },
  {
    id: "molotov", name: "Molotov Cocktail", load: 4, requirement: 1, category: "Explosives",
    properties: {
      AP: 6, Damage: "3d10 fire", Range: "STR x6", Area: "5ft radius",
      Incendiary: "When a creature takes damage from an explosive with this property, they gain the Burning condition.",
      Shattering: "The explosive always detonates at the end of your turn regardless of your explosive roll."
    }
  },
  {
    id: "frag-grenade", name: "Frag Grenade", load: 3, requirement: 1, category: "Explosives",
    properties: {
      AP: 5, Damage: "4d6 explosive", Range: "STR x10", Area: "5ft/20ft radius",
      Deafening: "Each creature in 10ft becomes deafened for a number of rounds equal to 4 - their Endurance ability modifier to a minimum of 1.",
      Destructive: "When you roll a 1 on the damage dice with an explosive that has this property, it is a 2 instead.",
      Dismembering: "When an explosive with this property deals damage to hit points of the creature in its first range (ie:the creature takes the full damage), they gain two random leg conditions, or a random arm condition if they are prone when the explosive detonates. If the explosive deals enough damage to bring the target creature to 0 hit points, the limb is severed instead."
    }
  },
  {
    id: "plasma-grenade", name: "Plasma Grenade", load: 4, requirement: 1, category: "Explosives",
    properties: {
      AP: 4, Damage: "4d8 plasma", Range: "STR x10", Area: "10ft radius"
    }
  },
  /**PulseGrenade 150c 4AP 2d8electricity STRx10 15ft.radius Electromagnetic. */
  {
    id: "pulse-grenade", name: "Pulse Grenade", load: 4, requirement: 1, category: "Explosives",
    properties: {
      AP: 4, Damage: "2d8 electricity", Range: "STR x10", Area: "15ft radius",
      Electromagnetic: "When a robot, synth, or creature made of inorganic material takes damage from an explosive with this property, the damage is doubled for them."
    }
  },
  {
    id: "incendiary-grenade", name: "Incendiary Grenade", load: 3, requirement: 1, category: "Explosives",
    properties: {
      AP: 5, Damage: "2d6 explosive and 3d6 fire", Range: "STR x10", Area: "5ft/15ft radius",
      Deafening: "Each creature in 5ft becomes deafened for a number of rounds equal to 4 - their Endurance ability modifier to a minimum of 1.",
      Incendiary: "When a creature takes damage from an explosive with this property, they gain the Burning condition."
    }
  },
  {
    id: "cryo-grenade", name: "Cryo Grenade", load: 4, requirement: 1, category: "Explosives",
    properties: {
      AP: 4, Damage: "2d6 explosive and 3d6 cold", Range: "STR x10", Area: "5ft/10ft radius",
      Deafening: "Each creature in 5ft becomes deafened for a number of rounds equal to 4 - their Endurance ability modifier to a minimum of 1.",
      Freezing: "When a creature takes damage from an explosive with this property, they gain the Slowed condition until the end of their next turn."
    }
  },
  {
    id: "flash-bang", name: "Flash Bang", load: 3, requirement: 1, category: "Explosives",
    properties: {
      AP: 5, Damage: "1 dmg explosive", Range: "STR x10", Area: "20ft radius",
      Blinding: "Each creature in 20ft becomes blinded for a number of rounds equal to 4 - their Endurance ability modifier to a minimum of 1.",
      Deafening: "Each creature in 20ft becomes deafened for a number of rounds equal to 4 - their Endurance ability modifier to a minimum of 1."
    }
  },
  {
    id: "frag-mine", name: "Frag Mine", load: 8, requirement: 1, category: "Explosives",
    properties: {
      AP: 6, Damage: "6d6 explosive", Area: "2.5ft/10ft radius",
      Proximity: "If a creature moves into the area, the mine triggers and they take damage to their Hit Points.",
      Deafening: "Each creature in 10ft becomes deafened for a number of rounds equal to 4 - their Endurance ability modifier to a minimum of 1.",
      Destructive: "When you roll a 1 on the damage dice with an explosive that has this property, it is a 2 instead.",
      Dismembering: "When an explosive with this property deals damage to hit points of the creature in its first range (ie:the creature takes the full damage), they gain two random leg conditions, or a random arm condition if they are prone when the explosive detonates. If the explosive deals enough damage to bring the target creature to 0 hit points, the limb is severed instead."
    }
  },
  {
    id: "plasma-mine", name: "Plasma Mine", load: 8, requirement: 1, category: "Explosives",
    properties: {
      AP: 6, Damage: "4d8 plasma + PER Mod", Area: "10ft radius",
      Proximity: " An explosive with this property does not detonate after any allotted time has passed, but instead; when a creature enters the proximity area of the explosive for the first time on a turn; it detonates at the end of that creature's turn. Each explosive’s proximity area is a 10 foot radius.",
    }
  },
  {
    id: "pulse-mine", name: "Pulse Mine", load: 6, requirement: 1, category: "Explosives",
    properties: {
      AP: 6, Damage: "3d8 electricity + PER Mod", Area: "20ft radius",
      Proximity: " An explosive with this property does not detonate after any allotted time has passed, but instead; when a creature enters the proximity area of the explosive for the first time on a turn; it detonates at the end of that creature's turn. Each explosive’s proximity area is a 10 foot radius.",
      Electromagnetic: "When a robot, synth, or creature made of inorganic material takes damage from an explosive with this property, the damage is doubled for them."
    }
  },
  {
    id: "cryo-mine", name: "Cryo Mine", load: 8, requirement: 1, category: "Explosives",
    properties: {
      AP: 6, Damage: "4d6 cold + PER Mod", Area: "10ft radius",
      Proximity: " An explosive with this property does not detonate after any allotted time has passed, but instead; when a creature enters the proximity area of the explosive for the first time on a turn; it detonates at the end of that creature's turn. Each explosive’s proximity area is a 10 foot radius.",
      Freezing: "When a creature takes damage from an explosive with this property, they gain the Slowed condition until the end of their next turn."
    }
  },
  {
    id: "c4", name: "C4 Explosive", load: 12, requirement: 1, category: "Explosives",
    properties: {
      AP: 6, Damage: "15d6 explosive + 10", Area: "5ft/25ft radius",
      Deafening: "Each creature in 10ft becomes deafened for a number of rounds equal to 4 - their Endurance ability modifier to a minimum of 1.",
      Destructive: "When you roll a 1 on the damage dice with an explosive that has this property, it is a 2 instead.",
      Dismembering: "When an explosive with this property deals damage to hit points of the creature in its first range (ie:the creature takes the full damage), they gain two random leg conditions, or a random arm condition if they are prone when the explosive detonates. If the explosive deals enough damage to bring the target creature to 0 hit points, the limb is severed instead."
    }
  },
  {
    id: "nuke-mine", name: "Nuke Mine", load: 22, requirement: 1, category: "Explosives",
    properties: {
      AP: 6, Damage: "12d10 explosive + 10 and two levels of radiation", Area: "45ft radius",
      Proximity: " An explosive with this property does not detonate after any allotted time has passed, but instead; when a creature enters the proximity area of the explosive for the first time on a turn; it detonates at the end of that creature's turn. Each explosive’s proximity area is a 10 foot radius.",
      Destructive: "When you roll a 1 on the damage dice with an explosive that has this property, it is a 2 instead."
    }
  },
  //gear
  {
    id: "bear-trap", name: "Bear Trap", load: 30, requirement: 1, category: "Gear",
    Description: "If a creature moves into the area, the trap triggers and they take damage to their Hit Points and become grappled",
    properties: { AP: 6, Damage: "3d4 piercing", Area: "5ft", Actions: "Arm, disarm, reset, pry open" }
  },
  {
    id: "binoculars", name: "Binoculars", load: 2, requirement: 1, category: "Gear",
    description: "You can spend 3 AP to look through binoculars. While you look through them, your sight is magnified. You have advantage on any perception ability checks relying on sight when viewing objects, creatures, or a location that are at least 100 feet away.",
  },
  {
    id: "canteen", name: "Canteen", load: 2, requirement: 1, category: "Gear",
    description: "The metal canteen holds 1 liter of liquid.",
  },
  {
    id: "chains", name: "Chains", load: 12, requirement: 1, category: "Gear",
    description: "Outside of the typical, practical uses of a chain; if you are holding a chain while attempting to grapple or strangle another creature, you have advantage on your Strength ability rolls.",
    properties: { AC: 10, DT: 10, HP: 10, Vulnerable: "ballistic, laser, plasma" }
  },
  {
    id: "flare", name: "Flare", load: 1, requirement: 1, category: "Ammo",
    description: "You can spend 6 AP on your turn to light this flare. This flare creates bright red light in a 30 foot radius and dim red light for an additional 30 feet. This light lasts for 1 hour.",
    properties: { Quantity: 1 }
  },
  {
    id: "flashlight", name: "Flashlight", load: 2, requirement: 1, category: "Gear", AmmoId: "ECammo",
    description: "You can spend 1 AP while holding this flashlight to create bright light in a 20 foot cone and dim light for an additional 20 feet. The light lasts for 8 hours so long as you spend 6 AP to load an energy cell into the flashlight"
  },
  {
    id: "gasmask", name: "Gas Mask", load: 12, requirement: 1, category: "Gear",
    description: "While you wear this mask, your radiation DC decreases by 3 and your passive sense decreases by 2."
  },
  {
    id: "lockpick", name: "Lockpick", load: 4, requirement: 1, category: "Gear",
    description: "These metal tools allow you to pick locks with far more proficiency. When you make a breach skill check to pick a lock, the DC is reduced by 5. After you use these lockpicks a total of five times, they break and cease function.",
  },
  {
    id: "rope", name: "Rope", load: 8, requirement: 1, category: "Gear",
    description: "Rope can be used to tie items together, make a pulley system, climb, or tie someone up. If you are holding a rope while attempting to grapple or strangle another creature, you have advantage on your Strength ability rolls.",
    properties: { AC: 10, DT: 2, HP: 5, Vulnerable: "ballistic, laser, plasma, slashing" }
  },
  {
    id: "sleeping-bag", name: "Sleeping Bag", load: 10, requirement: 1, category: "Gear",
    description: "This nylon, cloth, or hide bag allows you to sleep even in the roughest terrain."
  },
  {
    id: "tent", name: "Tent", load: 12, requirement: 1, category: "Gear",
    description: "This small tent provides shelter from outside sources, weather, and terrain."
  },
  {
    id: "weapon-repair-kit", name: "Weapon Repair Kit", load: 10, requirement: 1, category: "Gear",
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
  {
    id: "antibiotics", name: "Antibiotics", load: 1, requirement: 1, category: "Meds",
    description: "This bottled medicine can stop diseases. How it affects the disease you contracted is dependent on the disease. You can consume this bottled medicine with 5 AP."
  },
  {
    id: "antivenom", name: "Antivenom", load: 3, requirement: 1, category: "Meds",
    description: "You can consume this bottled medicine with 5 AP. If you do; you become resistant to poison damage dealt to your hit points for the next 6 hours."
  },
  {
    id: "doctors-bag", name: "Doctor's Bag", load: 15, requirement: 1, category: "Meds",
    description: "This bag includes specialized tools, bandages, gauze, and healing serums to provide medical aid. You can use this kit on yourself or another creature so long as they are next to you. When you use it, choose one of the following actions. After you have used three of these actions, the doctor bag supplies are used and it no longer functions.",
    properties: {
      Tourniquet: "Spend 6 AP and remove up to two levels of bleeding.",
      Pills: "Spend 6 AP to heal a dying creature 1 hit point.",
      Stitch: "Spend 10 minutes and heal a creature with a number of hit points equal to double their healing rate + your medicine skill bonus.",
      Set: "Spend 10 minutes and a creature with the Broken Arm or Broken Leg condition may remove it."
    }
  },
  {
    id: "first-aid-kit", name: "First Aid Kit", load: 4, requirement: 1, category: "Meds",
    description: "You can use this kit on yourself or another creature so long as they are next to you. When you use it, choose one of the following actions. After you have used one of these actions, the first aid kit supplies are used and it no longer functions.",
    properties: {
      Tourniquet: "Spend 6 AP and remove up to one level of bleeding.",
      Pills: "Spend 6 AP to heal a dying creature 1 hit point.",
      Stitch: "Spend 10 minutes and heal a creature with a number of hit points equal to their healing rate + your medicine skill bonus."
    }
  },
  {
    id: "rad-away", name: "Rad-Away", load: 4, requirement: 1, category: "Meds",
    description: "You can spend 15 minutes to use this medicinal item on yourself or a creature within 5 feet of you. At the end of the hour, the affected creature removes two levels of radiation but gains one level of thirst."
  },
  {
    id: "fixer", name: "Fixer (5x Pills)", load: 1, requirement: 1, category: "Meds",
    description: "You can spend 4 AP to consume it. When you do; you become cured of one addiction of your choice. However, you gain one level of dehydration, hunger, and exhaustion."
  },
  {
    id: "rad-x", name: "Rad-X (10x Pills)", load: 1, requirement: 1, category: "Meds",
    description: "You can consume this small pill with 3 AP. If you do; your radiation DC decreases by 2 for the next 3 hours. You can consume a total of three Rad-X at one time to gain their benefits, if you consume more than three you do not gain any additional benefits."
  },
  { id: "pills", name: "Pills", load: 1, requirement: 1, category: "Meds" },
  {
    id: "stimpak", name: "Stimpak", load: 4, requirement: 1, category: "Meds",
    description: "You can spend 4 AP to use this medicinal item on yourself or another creature so long as they are next to you. If that creature is a human, mutant, abomination, animal, or insect; they heal a number of hit points equal to their healing rate. If that creature is a ghoul; they heal a number of hit points equal to half their healing rate."
  },
  /**Super Stimpak. You can spend 4 AP to use this
medicinal item on yourself or another creature so long as
they are next to you. If that creature is a human, mutant,
gen-2 synth, abomination, animal, or insect; they heal a
number of hit points equal to double their healing rate. If
that creature is a ghoul; they heal a number of hit points
equal to their healing rate. */
  {
    id: "super-stimpak", name: "Super Stimpak", load: 6, requirement: 1, category: "Meds",
    description: "You can spend 4 AP to use this medicinal item on yourself or another creature so long as they are next to you. If that creature is a human, mutant, gen-2 synth, abomination, animal, or insect; they heal a number of hit points equal to double their healing rate. If that creature is a ghoul; they heal a number of hit points equal to their healing rate."
  },
  {
    id: "robot-fix-kit", name: "Quick Fix-it 1.0", load: 4, requirement: 1, category: "Meds",
    description: "Quick Fix-it 1.0 is a healing stim but for robots! You can spend 4 AP to use this item on yourself or another creature so long as they are next to you. If that creature is a robot or gen-2 synth; they heal a number of hit points equal to half their healing rate."
  },
  { id: "chem", name: "Chem (Bottle)", load: 1, requirement: 1, category: "Meds" },
  { id: "chems", name: "Chems (10x Pills)", load: 1, requirement: 1, category: "Meds" },
  { id: "overclock-program", name: "Overclock Program 10x", load: 1, requirement: 1, category: "Meds" },
  { id: "cigs", name: "Cigarettes 10x", load: 1, requirement: 1, category: "Meds" },
  {
    id: "healing-powder", name: "Healing Powder", load: 3, requirement: 1, category: "Meds",
    description: "You can spend 6 AP to use this medicinal item on yourself or another creature so long as they are next to you. If that creature is a human, mutant, abomination, animal, or insect; at the start of each of their turns they heal a number of hit points equal to half their healing rate (rounded down). After healing for three rounds, the effects cease. Ghouls, robots, and gen-2 synths are unaffected by healing powder."
  },
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
  {
    id: "computer", name: "Pip Boy", load: 4, requirement: 1, category: "Misc",
    description: "A wearable computer that attaches to the wrist and allows for a variety of helpful functions. Every Pip-Boy has the ability to display maps of various locations, play holotapes, track your location via satellite, record and playback audio, and input text notes. Additionally, if you are wearing a Vault Suit that has no more than five levels of decay, any Pip-Boy you wear can monitor your vitals; whenever you heal your hit points, you heal an additional amount equal to your level. "
  },
  {
    id: "stealth-boy", name: "Stealth Boy", load: 3, requirement: 1, category: "Misc",
    description: "This technological, pre-war wonder generates a modulating field that transmits the reflected light from one side of an object to the other. You can spend 3 AP to activate a stealth boy, once you activate you become invisible for 1 minute so long as you keep the stealth boy on your body. Once a stealth boy has been activated, it cannot be activated again."
  },
  {
    id: "two-way-radio", name: "Two-Way Radio", load: 2, requirement: 1, category: "Misc", AmmoId: "ECammo",
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

export function ammoBundleQuantity(item) {
  const quantity = item?.properties?.Quantity;
  return item?.category === "Ammo" && Number.isInteger(quantity) && quantity > 0 ? quantity : null;
}

export function compatibleAmmo(item, catalog = ITEMS) {
  if (typeof item?.AmmoId !== "string") return null;
  const ammo = catalog.find((candidate) => candidate.id === item.AmmoId);
  return ammoBundleQuantity(ammo) ? ammo : null;
}

export function matchesItemSearch(item, searchTerm) {
  const query = searchTerm.trim().toLocaleLowerCase();
  return [item.name, item.category, item.description]
    .some((value) => value.toLocaleLowerCase().includes(query));
}