export type Rarity = 'normal' | 'rare' | 'epic' | 'legendary' | 'transcendent';

export type Difficulty = 'normal' | 'hard' | 'nightmare' | 'hell';

export type EquipmentSlotType = 'weapon' | 'shihakusho' | 'accessory';

export interface WeaponData {
  id: string;
  name: string;
  user: string;
  description: string;
  baseAtk: number;
  critChanceBonus: number; // e.g. 0.05 for +5%
  spdBonus: number;        // e.g. 0.08 for +8%
  specialEffectName: string;
}

export interface Equipment {
  instanceId: string;
  weaponId: string;
  name: string;
  rarity: Rarity;
  slot: EquipmentSlotType;
  atk: number;
  hp: number;
  def: number;
  critChance: number;
  spdBonus: number;
  sellPrice: number;
}

export interface SkillData {
  id: string;
  name: string;
  character: string;
  slotType: 1 | 2; // Slot 1 = Active / Hado, Slot 2 = Bankai / Ultimate
  rarity: Rarity;
  description: string;
  cooldownSec: number;
  durationSec?: number; // Para buffs / bankais com duração
  damageMultiplier: number; // e.g. 2.5 for 250%
  stunSec?: number;
  lifestealPct?: number; // e.g. 0.15 for 15%
  atkBuffPct?: number;
  spdBuffPct?: number;
  defBuffPct?: number;
  isAoE?: boolean; // Se ataca múltiplos alvos da horda ao mesmo tempo
  maxTargets?: number; // Quantidade de inimigos atingidos pela área
  healPct?: number; // Percentual de HP restaurado ao ativar (e.g. 1.0 = 100%)
}

export interface OwnedSkill {
  skillId: string;
  level: number;
  unlocked: boolean;
}

export interface Enemy {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  atk: number;
  def: number;
  expReward: number;
  goldReward: number;
  isBoss: boolean;
  attackSpeedSec: number;
  avatarIcon: string;
  deathTimerSec?: number;
}

export interface Biome {
  id: string;
  name: string;
  japaneseName: string;
  description: string;
  bgGradient: string;
  enemies: {
    name: string;
    hpBase: number;
    atkBase: number;
    defBase: number;
    expBase: number;
    goldBase: number;
    attackSpeedSec: number;
    avatarIcon: string;
  }[];
  boss: {
    name: string;
    hpBase: number;
    atkBase: number;
    defBase: number;
    expBase: number;
    goldBase: number;
    attackSpeedSec: number;
    avatarIcon: string;
  };
}

export interface CharacterStats {
  level: number;
  exp: number;
  nextLevelExp: number;
  statPoints: number;
  baseAtk: number;
  baseDef: number;
  baseHp: number;
  baseSpd: number; // ataques por segundo (e.g. 1.0)
  gold: number; // Moeda padrão do jogo
  gems: number; // Moeda premium do jogo
  prestigeRank: number; // Rank de Prestige
}

export interface BattleLogMessage {
  id: string;
  text: string;
  type: 'player_attack' | 'enemy_attack' | 'skill' | 'loot' | 'system' | 'victory';
  timestamp: string;
}

export interface FloatingDamage {
  id: string;
  damage: number;
  isCrit: boolean;
  isSkill: boolean;
  xOffset: number;
}

export interface CraftingRecipe {
  id: string;
  resultWeaponId: string;
  resultRarity: Rarity;
  name: string;
  description: string;
  requiredMaterial1: number;
  requiredMaterial2: number;
  requiredMaterial3: number;
  goldCost: number;
}

export interface CraftingMaterials {
  material1: number;
  material2: number;
  material3: number;
}


