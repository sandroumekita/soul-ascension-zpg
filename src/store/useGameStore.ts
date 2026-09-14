import { create } from 'zustand';
import type { 
  CharacterStats, Equipment, OwnedSkill, Enemy, Difficulty, BattleLogMessage, Rarity
} from '../types/game';
import { BIOMES_CATALOG, WEAPONS_CATALOG, SKILLS_CATALOG, RARITY_MULTIPLIERS, CRAFTING_RECIPES_CATALOG } from '../data/gameCatalog';

// ---------- UNIQUE ID GENERATOR (replaces Date.now() collisions) ----------
let _nextId = 0;
const uid = (prefix: string) => `${prefix}_${++_nextId}`;

// ---------- DRY HELPERS ----------

/** Roll a rarity from weighted probabilities */
const rollRarity = (weights: number[]): Rarity => {
  const rarities: Rarity[] = ['normal', 'rare', 'epic', 'legendary', 'transcendent'];
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < rarities.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) return rarities[i];
  }
  return 'normal';
};

/** Get salvage material values for a given rarity */
const getSalvageValue = (rarity: Rarity): { mat1: number; mat2: number; mat3: number } => {
  switch (rarity) {
    case 'rare':      return { mat1: 5, mat2: 3, mat3: 0 };
    case 'epic':      return { mat1: 12, mat2: 6, mat3: 1 };
    case 'legendary':
    case 'transcendent': return { mat1: 30, mat2: 15, mat3: 3 };
    default:          return { mat1: 2, mat2: 1, mat3: 0 }; // normal
  }
};

// ---------- INTERFACES ----------

interface CalculatedStats {
  atk: number;
  def: number;
  hp: number;
  spd: number;
  critChance: number;
}

interface GameState {
  // Stats & Progress
  stats: CharacterStats;
  currentBiomeId: string;
  difficulty: Difficulty;
  biomeStage: number; // 1 to 10 (10 is Boss)
  isFightingBoss: boolean;
  autoAdvance: boolean;
  unlockedBiomes: string[];
  unlockedDifficulties: Difficulty[];
  
  // Current Combat
  currentEnemies: Enemy[];
  playerCurrentHp: number;
  playerMaxHp: number;
  playerDeathTimerSec: number;
  consecutiveDeaths: number;
  lastSkillUsed: { name: string; isAoE: boolean; timestamp: number } | null;
  lastBankaiUsed: { name: string; durationSec: number; timestamp: number } | null;
  
  // Cached computed stats (invalidated on equip/stat/buff changes)
  _cachedStats: CalculatedStats | null;
  // Cached resolved skill objects
  _cachedSkill1: typeof SKILLS_CATALOG[0] | null;
  _cachedSkill2: typeof SKILLS_CATALOG[0] | null;
  // Accumulators for per-attack mechanics
  _hitAccumulator: number;
  _healAccumulator: number;
  
  // Cooldowns & Active Buffs
  skill1Cooldown: number;
  skill2Cooldown: number;
  activeBuff: {
    atkBuffPct: number;
    spdBuffPct: number;
    defBuffPct: number;
    lifestealPct: number;
    durationLeft: number;
    name: string;
  } | null;
  
  // Loadout, Inventory & Crafting
  equippedSlot1SkillId: string | null;
  equippedSlot2SkillId: string | null;
  equippedWeapon: Equipment | null;
  equippedShihakusho: Equipment | null;
  equippedAccessory: Equipment | null;
  
  inventory: Equipment[];
  craftingMaterials: {
    material1: number;
    material2: number;
    material3: number;
  };
  ownedSkills: Record<string, OwnedSkill>;
  
  // Logs
  logs: BattleLogMessage[];
  
  // Actions & Utilities
  tick: (deltaTimeSec: number) => void;
  allocateStatPoint: (stat: 'atk' | 'def' | 'hp' | 'spd', amount?: number) => void;
  equipItem: (item: Equipment) => void;
  autoEquipBestWeapon: () => void;
  unequipSlot: (slot: 'weapon' | 'shihakusho' | 'accessory') => void;
  sellItem: (instanceId: string) => void;
  salvageItem: (instanceId: string) => void;
  salvageAllNormalItems: () => void;
  craftRecipe: (recipeId: string) => boolean;
  equipSkill: (skillId: string, slot: 1 | 2) => void;
  summonGacha: (costOrbs: number) => { item?: Equipment; skill?: string; isDuplicate: boolean };
  selectStage: (targetStage: number) => void;
  changeBiome: (biomeId: string) => void;
  changeDifficulty: (diff: Difficulty) => void;
  challengeBoss: () => void;
  toggleAutoAdvance: () => void;
  resetProgressSave: () => void;
}

const INITIAL_STATS: CharacterStats = {
  level: 1,
  exp: 0,
  nextLevelExp: 100,
  statPoints: 5,
  baseAtk: 15,
  baseDef: 5,
  baseHp: 100,
  baseSpd: 1.0,
  gold: 200,
  gems: 100,
  prestigeRank: 0,
};

const INITIAL_WEAPON: Equipment = {
  instanceId: 'initial_katana',
  weaponId: 'zangetsu',
  name: 'Katana Shinigami (Zangetsu Base)',
  rarity: 'normal',
  slot: 'weapon',
  atk: 25,
  hp: 0,
  def: 0,
  critChance: 0.05,
  spdBonus: 0.0,
  sellPrice: 50,
};

// Helper: Calculate total stats derived from base + equipment + buffs
const computeStats = (state: {
  stats: CharacterStats;
  equippedWeapon: Equipment | null;
  equippedShihakusho: Equipment | null;
  equippedAccessory: Equipment | null;
  activeBuff: GameState['activeBuff'];
}): CalculatedStats => {
  let atk = state.stats.baseAtk;
  let def = state.stats.baseDef;
  let hp = state.stats.baseHp;
  let spd = state.stats.baseSpd;
  let critChance = 0.05;

  if (state.equippedWeapon) {
    atk += state.equippedWeapon.atk;
    hp += state.equippedWeapon.hp;
    def += state.equippedWeapon.def;
    critChance += state.equippedWeapon.critChance;
    spd += state.equippedWeapon.spdBonus;
  }
  if (state.equippedShihakusho) {
    atk += state.equippedShihakusho.atk;
    hp += state.equippedShihakusho.hp;
    def += state.equippedShihakusho.def;
  }
  if (state.equippedAccessory) {
    atk += state.equippedAccessory.atk;
    hp += state.equippedAccessory.hp;
    def += state.equippedAccessory.def;
    critChance += state.equippedAccessory.critChance;
  }

  if (state.activeBuff) {
    if (state.activeBuff.atkBuffPct) atk *= (1 + state.activeBuff.atkBuffPct);
    if (state.activeBuff.spdBuffPct) spd *= (1 + state.activeBuff.spdBuffPct);
    if (state.activeBuff.defBuffPct) def *= (1 + state.activeBuff.defBuffPct);
  }

  return {
    atk: Math.round(atk),
    def: Math.round(def),
    hp: Math.round(hp),
    spd: parseFloat(spd.toFixed(2)),
    critChance,
  };
};

// Difficulty multipliers
const DIFF_MULTIPLIERS: Record<Difficulty, number> = {
  normal: 1.0,
  hard: 8.5,
  nightmare: 65.0,
  hell: 500.0,
};

// SPD hard cap: max 5 hits per second regardless of stat
const MAX_HITS_PER_SEC = 5.0;

// Helper: Spawn Horda de Inimigos
const spawnEnemiesForBiome = (biomeId: string, diff: Difficulty, stage: number, isBoss: boolean): Enemy[] => {
  const biome = BIOMES_CATALOG.find((b) => b.id === biomeId) || BIOMES_CATALOG[0];
  const diffMultiplier = DIFF_MULTIPLIERS[diff];
  
  if (isBoss || stage === 10) {
    const b = biome.boss;
    const maxHp = Math.round(b.hpBase * diffMultiplier);
    return [{
      id: uid('boss'),
      name: `[BOSS] ${b.name}`,
      maxHp,
      currentHp: maxHp,
      atk: Math.round(b.atkBase * diffMultiplier),
      def: Math.round(b.defBase * diffMultiplier),
      expReward: Math.round(b.expBase * diffMultiplier * 2.5),
      goldReward: Math.round(b.goldBase * diffMultiplier * 2.5),
      isBoss: true,
      attackSpeedSec: b.attackSpeedSec || 1.5,
      avatarIcon: b.avatarIcon || '💀',
    }];
  }

  const enemyCount = stage >= 8 ? 3 : stage >= 4 ? 2 : 1;
  const enemies: Enemy[] = [];

  for (let i = 0; i < enemyCount; i++) {
    const enemyTemplate = biome.enemies[(stage - 1 + i) % biome.enemies.length];
    const maxHp = Math.round(enemyTemplate.hpBase * diffMultiplier);
    enemies.push({
      id: uid(`enemy_${i}`),
      name: enemyTemplate.name,
      maxHp,
      currentHp: maxHp,
      atk: Math.round(enemyTemplate.atkBase * diffMultiplier),
      def: Math.round(enemyTemplate.defBase * diffMultiplier),
      expReward: Math.round(enemyTemplate.expBase * diffMultiplier),
      goldReward: Math.round(enemyTemplate.goldBase * diffMultiplier),
      isBoss: false,
      attackSpeedSec: enemyTemplate.attackSpeedSec || 1.2,
      avatarIcon: enemyTemplate.avatarIcon || '👻',
    });
  }

  return enemies;
};

/** Helper: Execute a skill against enemies, returns log message and updated cooldown */
const executeSkill = (
  skill: typeof SKILLS_CATALOG[0],
  calc: CalculatedStats,
  enemies: Enemy[],
  slotLabel: string,
): { log: BattleLogMessage; healAmount: number } => {
  const skillDamage = Math.round(calc.atk * skill.damageMultiplier);
  
  // Filter only alive enemies for targeting
  const aliveTargets = enemies.filter(e => e.currentHp > 0);
  const targetsCount = skill.isAoE ? Math.min(aliveTargets.length, skill.maxTargets || 3) : Math.min(1, aliveTargets.length);
  
  for (let i = 0; i < targetsCount; i++) {
    if (aliveTargets[i]) {
      aliveTargets[i].currentHp = Math.max(0, aliveTargets[i].currentHp - skillDamage);
      if (aliveTargets[i].currentHp <= 0 && aliveTargets[i].deathTimerSec === undefined) {
        aliveTargets[i].deathTimerSec = 0.5;
      }
    }
  }

  // Heal support (Minazuki etc)
  let healAmount = 0;
  if (skill.healPct && skill.healPct > 0) {
    healAmount = Math.round(calc.hp * skill.healPct);
  }

  const emoji = slotLabel === 'BANKAI' ? '🔥' : '💥';
  const aoeLabel = skill.isAoE ? 'ÁREA' : 'Single';
  
  return {
    log: {
      id: uid(`log_${slotLabel.toLowerCase()}`),
      text: `${emoji} [${slotLabel} ${aoeLabel}] ${skill.name} causou ${skillDamage} de dano em ${targetsCount} inimigo(s)!${healAmount > 0 ? ` Curou ${healAmount} HP!` : ''}`,
      type: 'skill',
      timestamp: new Date().toLocaleTimeString(),
    },
    healAmount,
  };
};

// Material drop rates by enemy type
const MATERIAL_DROP_RATES = {
  normal: { mat1Chance: 0.40, mat1Qty: 1, mat2Chance: 0.15, mat2Qty: 1, mat3Chance: 0, mat3Qty: 0 },
  boss: { mat1Chance: 1.0, mat1Qty: 5, mat2Chance: 1.0, mat2Qty: 3, mat3Chance: 1.0, mat3Qty: 1 },
};

const SAVED_STATE_KEY = 'soul_ascension_save_v1';

export const useGameStore = create<GameState>((set, get) => ({
  stats: INITIAL_STATS,
  currentBiomeId: 'karakura',
  difficulty: 'normal',
  biomeStage: 1,
  isFightingBoss: false,
  autoAdvance: true,
  unlockedBiomes: ['karakura'],
  unlockedDifficulties: ['normal'],

  currentEnemies: spawnEnemiesForBiome('karakura', 'normal', 1, false),
  playerCurrentHp: 100,
  playerMaxHp: 100,

  // Cached values
  _cachedStats: null,
  _cachedSkill1: SKILLS_CATALOG.find(s => s.id === 'getsuga_tensho') || null,
  _cachedSkill2: SKILLS_CATALOG.find(s => s.id === 'bankai_tensa') || null,
  _hitAccumulator: 0,
  _healAccumulator: 0,

  skill1Cooldown: 0,
  skill2Cooldown: 0,
  activeBuff: null,
  playerDeathTimerSec: 0,
  consecutiveDeaths: 0,
  lastSkillUsed: null,
  lastBankaiUsed: null,

  equippedSlot1SkillId: 'getsuga_tensho',
  equippedSlot2SkillId: 'bankai_tensa',
  equippedWeapon: INITIAL_WEAPON,
  equippedShihakusho: null,
  equippedAccessory: null,

  inventory: [],
  craftingMaterials: {
    material1: 20,
    material2: 10,
    material3: 2,
  },
  ownedSkills: {
    getsuga_tensho: { skillId: 'getsuga_tensho', level: 1, unlocked: true },
    bankai_tensa: { skillId: 'bankai_tensa', level: 1, unlocked: true },
  },

  logs: [
    {
      id: 'log_welcome',
      text: '⚔️ Bem-vindo ao Soul Ascension! Seu combate autônomo iniciou na Cidade de Karakura.',
      type: 'system',
      timestamp: new Date().toLocaleTimeString(),
    },
  ],

  // ---------------- COMBAT ENGINE TICK ----------------
  tick: (deltaTimeSec: number) => {
    const state = get();
    if (state.currentEnemies.length === 0) return;

    // Use cached stats or compute fresh
    const calc = state._cachedStats || computeStats(state);

    // --- PLAYER DEATH & 3-SECOND RECOVERY COOLDOWN ---
    if (state.playerDeathTimerSec > 0) {
      const remainingDeathTimer = Math.max(0, state.playerDeathTimerSec - deltaTimeSec);
      if (remainingDeathTimer === 0) {
        // Recovery complete after 3 seconds: retreat to fallback stage and restore HP
        const fallbackStage = state.biomeStage === 10 ? 9 : Math.max(1, state.biomeStage - 1);
        const nextEnemies = spawnEnemiesForBiome(state.currentBiomeId, state.difficulty, fallbackStage, false);
        const recoveryLog: BattleLogMessage = {
          id: uid('log_respawn'),
          text: `⚡ Reiatsu restaurada! Seu Shinigami recuperou o HP e voltou ao combate na Fase ${fallbackStage}!`,
          type: 'system',
          timestamp: new Date().toLocaleTimeString(),
        };

        set({
          biomeStage: fallbackStage,
          isFightingBoss: false,
          currentEnemies: nextEnemies,
          playerCurrentHp: calc.hp,
          playerMaxHp: calc.hp,
          playerDeathTimerSec: 0,
          _hitAccumulator: 0,
          _healAccumulator: 0,
          logs: [recoveryLog, ...state.logs].slice(0, 30),
        });
      } else {
        set({
          playerDeathTimerSec: remainingDeathTimer,
          playerCurrentHp: 0,
        });
      }
      return;
    }

    let newPlayerHp = state.playerCurrentHp;
    let newSkill1Cd = Math.max(0, state.skill1Cooldown - deltaTimeSec);
    let newSkill2Cd = Math.max(0, state.skill2Cooldown - deltaTimeSec);
    let newBuff = state.activeBuff;
    let lastSkillObj = state.lastSkillUsed;
    let lastBankaiObj = state.lastBankaiUsed;

    // Handle Buff Timer
    if (newBuff) {
      const remaining = newBuff.durationLeft - deltaTimeSec;
      if (remaining <= 0) {
        newBuff = null;
      } else {
        newBuff = { ...newBuff, durationLeft: remaining };
      }
    }

    // Mutate enemies in-place via shallow copies (one copy, not per-frame deep clone)
    const enemies = state.currentEnemies.map((e) => ({ ...e }));
    const logsToAdd: BattleLogMessage[] = [];

    // Filter to alive enemies for targeting
    const aliveEnemiesBefore = enemies.filter(e => e.currentHp > 0);
    const primaryEnemy = aliveEnemiesBefore.length > 0 ? aliveEnemiesBefore[0] : null;

    let hitAccum = state._hitAccumulator;
    let healAccum = state._healAccumulator;

    // --- PLAYER AUTO-ATTACK (only if there is an alive target) ---
    if (primaryEnemy) {
      const effectiveSpd = Math.min(calc.spd, MAX_HITS_PER_SEC);
      const hitsThisTick = deltaTimeSec * effectiveSpd;
      hitAccum += hitsThisTick;

      let totalAutoAttackDmg = 0;
      while (hitAccum >= 1.0) {
        hitAccum -= 1.0;
        // Multiplicative damage formula: ATK * (100 / (100 + DEF))
        const rawDamage = Math.max(1, Math.round(calc.atk * (100 / (100 + primaryEnemy.def))));
        const isCrit = Math.random() < calc.critChance;
        const hitDamage = isCrit ? Math.round(rawDamage * 1.8) : rawDamage;
        totalAutoAttackDmg += hitDamage;
      }

      if (totalAutoAttackDmg > 0) {
        primaryEnemy.currentHp = Math.max(0, primaryEnemy.currentHp - totalAutoAttackDmg);
        if (primaryEnemy.currentHp <= 0 && primaryEnemy.deathTimerSec === undefined) {
          primaryEnemy.deathTimerSec = 0.5; // Start 0.5s death timer
        }
      }

      // Apply Lifesteal with float accumulator (50% vs mobs, 100% vs boss)
      if (newBuff && newBuff.lifestealPct > 0 && totalAutoAttackDmg > 0) {
        const lifestealMult = primaryEnemy.isBoss ? 1.0 : 0.5;
        healAccum += totalAutoAttackDmg * newBuff.lifestealPct * lifestealMult;
        if (healAccum >= 1.0) {
          const healApply = Math.floor(healAccum);
          healAccum -= healApply;
          newPlayerHp = Math.min(calc.hp, newPlayerHp + healApply);
        }
      }
    }

    // --- SKILL EXECUTION (only if there are alive targets) ---
    if (aliveEnemiesBefore.length > 0) {
      // Skill 1
      if (newSkill1Cd <= 0 && state._cachedSkill1) {
        const skill = state._cachedSkill1;
        const result = executeSkill(skill, calc, enemies, 'Habilidade');
        newSkill1Cd = skill.cooldownSec;
        logsToAdd.push(result.log);
        if (result.healAmount > 0) {
          newPlayerHp = Math.min(calc.hp, newPlayerHp + result.healAmount);
        }
        lastSkillObj = { name: skill.name, isAoE: !!skill.isAoE, timestamp: Date.now() };
      }

      // Skill 2 (Bankai)
      if (newSkill2Cd <= 0 && state._cachedSkill2) {
        const bankai = state._cachedSkill2;
        const result = executeSkill(bankai, calc, enemies, 'BANKAI');
        newSkill2Cd = bankai.cooldownSec;
        logsToAdd.push(result.log);
        if (result.healAmount > 0) {
          newPlayerHp = Math.min(calc.hp, newPlayerHp + result.healAmount);
        }

        if (bankai.durationSec) {
          newBuff = {
            atkBuffPct: bankai.atkBuffPct || 0,
            spdBuffPct: bankai.spdBuffPct || 0,
            defBuffPct: bankai.defBuffPct || 0,
            lifestealPct: bankai.lifestealPct || 0,
            durationLeft: bankai.durationSec,
            name: bankai.name,
          };
        }
        lastBankaiObj = { name: bankai.name, durationSec: bankai.durationSec || 6, timestamp: Date.now() };
      }
    }

    // --- ENEMY ATTACKS (all alive enemies attack, boss burst smoothed by deltaTime) ---
    enemies.forEach((enemy) => {
      if (enemy.currentHp > 0) {
        const isBossSkillHit = enemy.isBoss && Math.random() < (0.15 * deltaTimeSec);
        let enemyDmgPerTick = 0;

        if (isBossSkillHit) {
          // Boss burst SMOOTHED by deltaTime (was instant before)
          const bossSkillDmg = Math.max(10, Math.round(enemy.atk * 1.6 - calc.def * 0.16));
          enemyDmgPerTick = Math.round(bossSkillDmg * deltaTimeSec);
          logsToAdd.push({
            id: uid('log_boss_skill'),
            text: `⚠️ [BOSS HABILIDADE] ${enemy.name} desferiu um Golpe Perfurante de Reiatsu! causou ${enemyDmgPerTick} de dano!`,
            type: 'system',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else {
          // Regular damage with multiplicative formula
          const enemyRawDmg = Math.max(1, Math.round(enemy.atk * (100 / (100 + calc.def))));
          enemyDmgPerTick = Math.round((enemyRawDmg / (enemy.attackSpeedSec || 1.2)) * deltaTimeSec);
        }

        newPlayerHp = Math.max(0, newPlayerHp - enemyDmgPerTick);
      }
    });

    // Update death countdown timer (0.5s timeout) for any dying enemies
    enemies.forEach((enemy) => {
      if (enemy.currentHp <= 0) {
        if (enemy.deathTimerSec === undefined) {
          enemy.deathTimerSec = 0.5;
        } else {
          enemy.deathTimerSec = Math.max(0, enemy.deathTimerSec - deltaTimeSec);
        }
      }
    });

    // Alive enemies (still fighting)
    const aliveEnemies = enemies.filter((e) => e.currentHp > 0);
    // Dying enemies (HP reached 0, waiting out the 0.5s death animation/clear delay)
    const dyingEnemies = enemies.filter((e) => e.currentHp <= 0 && (e.deathTimerSec ?? 0) > 0);

    // --- HORDE ELIMINATED / RESPAWN / ADVANCE ---
    // Only advance when ALL enemies are dead AND all 0.5s death delays have finished!
    if (aliveEnemies.length === 0 && dyingEnemies.length === 0) {
      let totalExpGained = 0;
      let totalGoldGained = 0;
      let wasBossDefeated = false;

      // Material drops from defeated enemies
      let matDrops = { mat1: 0, mat2: 0, mat3: 0 };
      const diffMult = DIFF_MULTIPLIERS[state.difficulty];
      const matDiffScale = Math.max(1, Math.round(Math.sqrt(diffMult)));

      enemies.forEach((e) => {
        totalExpGained += e.expReward;
        totalGoldGained += e.goldReward;
        if (e.isBoss) {
          wasBossDefeated = true;
          matDrops.mat1 += MATERIAL_DROP_RATES.boss.mat1Qty * matDiffScale;
          matDrops.mat2 += MATERIAL_DROP_RATES.boss.mat2Qty * matDiffScale;
          matDrops.mat3 += MATERIAL_DROP_RATES.boss.mat3Qty * matDiffScale;
        } else {
          if (Math.random() < MATERIAL_DROP_RATES.normal.mat1Chance) {
            matDrops.mat1 += MATERIAL_DROP_RATES.normal.mat1Qty * matDiffScale;
          }
          if (Math.random() < MATERIAL_DROP_RATES.normal.mat2Chance) {
            matDrops.mat2 += MATERIAL_DROP_RATES.normal.mat2Qty * matDiffScale;
          }
        }
      });

      let newStats = { ...state.stats, exp: state.stats.exp + totalExpGained, gold: state.stats.gold + totalGoldGained };

      // Update crafting materials
      const newMaterials = {
        material1: state.craftingMaterials.material1 + matDrops.mat1,
        material2: state.craftingMaterials.material2 + matDrops.mat2,
        material3: state.craftingMaterials.material3 + matDrops.mat3,
      };

      // Log material drops
      if (matDrops.mat1 > 0 || matDrops.mat2 > 0 || matDrops.mat3 > 0) {
        logsToAdd.push({
          id: uid('log_mat_drop'),
          text: `⚙️ MATERIAIS: +${matDrops.mat1} Reishi, +${matDrops.mat2} Minério${matDrops.mat3 > 0 ? `, +${matDrops.mat3} Essência` : ''}`,
          type: 'loot',
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      // Check Level Up
      if (newStats.exp >= newStats.nextLevelExp) {
        newStats.level += 1;
        newStats.statPoints += 3;
        newStats.exp -= newStats.nextLevelExp;
        newStats.nextLevelExp = Math.round(newStats.nextLevelExp * 1.75);

        logsToAdd.push({
          id: uid('log_lvl'),
          text: `🎉 LEVEL UP! Você alcançou o Nível ${newStats.level}! (+3 Pontos de Atributo)`,
          type: 'system',
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      // Generate Loot (15% per normal horde, 100% on Boss)
      let newInventory = [...state.inventory];
      if (wasBossDefeated || Math.random() < 0.15) {
        const weaponTemplate = WEAPONS_CATALOG[Math.floor(Math.random() * WEAPONS_CATALOG.length)];
        const selectedRarity = rollRarity(
          wasBossDefeated 
            ? [0.55, 0.30, 0.115, 0.032, 0.003]   
            : [0.80, 0.16, 0.035, 0.0048, 0.0002]
        );

        const mult = RARITY_MULTIPLIERS[selectedRarity];
        const newEquip: Equipment = {
          instanceId: uid('equip'),
          weaponId: weaponTemplate.id,
          name: `${weaponTemplate.name} (${selectedRarity.toUpperCase()})`,
          rarity: selectedRarity,
          slot: 'weapon',
          atk: Math.round(weaponTemplate.baseAtk * mult),
          hp: 0,
          def: 0,
          critChance: weaponTemplate.critChanceBonus,
          spdBonus: weaponTemplate.spdBonus,
          sellPrice: Math.round(50 * mult),
        };

        newInventory.push(newEquip);
        logsToAdd.push({
          id: uid('log_loot'),
          text: `💎 LOOT DROP! Você encontrou: ${newEquip.name}!`,
          type: 'loot',
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      // Progress Stage
      let nextStage = state.biomeStage;
      let nextIsBoss = false;
      let nextBiomeId = state.currentBiomeId;
      let newUnlockedBiomes = [...state.unlockedBiomes];
      let newUnlockedDiffs = [...state.unlockedDifficulties];

      if (wasBossDefeated || state.biomeStage === 10) {
        logsToAdd.push({
          id: uid('log_boss_win'),
          text: `🏆 BOSS DERROTADO! Você concluiu as 10 Fases de ${state.currentBiomeId.toUpperCase()}!`,
          type: 'victory',
          timestamp: new Date().toLocaleTimeString(),
        });

        const currentBiomeIdx = BIOMES_CATALOG.findIndex((b) => b.id === state.currentBiomeId);
        if (currentBiomeIdx < BIOMES_CATALOG.length - 1) {
          const nextBiomeObj = BIOMES_CATALOG[currentBiomeIdx + 1];
          nextBiomeId = nextBiomeObj.id;
          nextStage = 1;
          if (!newUnlockedBiomes.includes(nextBiomeId)) {
            newUnlockedBiomes.push(nextBiomeId);
          }
          logsToAdd.push({
            id: uid('log_unlock_biome'),
            text: `🔓 NOVO BIOMA DESBLOQUEADO: Avançando para ${nextBiomeObj.name}!`,
            type: 'system',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else {
          nextStage = 10;
          nextIsBoss = true;

          const diffsOrder: Difficulty[] = ['normal', 'hard', 'nightmare', 'hell'];
          const currentDiffIdx = diffsOrder.indexOf(state.difficulty);
          if (currentDiffIdx < diffsOrder.length - 1) {
            const nextDiff = diffsOrder[currentDiffIdx + 1];
            if (!newUnlockedDiffs.includes(nextDiff)) {
              newUnlockedDiffs.push(nextDiff);
              logsToAdd.push({
                id: uid('log_unlock_diff'),
                text: `🔥 DIFICULDADE DESBLOQUEADA! A dificuldade ${nextDiff.toUpperCase()} agora está acessível!`,
                type: 'victory',
                timestamp: new Date().toLocaleTimeString(),
              });
            }
          }
        }
      } else {
        if (state.autoAdvance) {
          nextStage = Math.min(9, state.biomeStage + 1);
        } else {
          nextStage = state.biomeStage;
        }
      }

      const nextEnemies = spawnEnemiesForBiome(nextBiomeId, state.difficulty, nextStage, nextIsBoss);

      if (state.consecutiveDeaths > 0) {
        logsToAdd.push({
          id: uid('log_reset_deaths'),
          text: `✨ Vitória conquistada! Sequência de derrotas zerada.`,
          type: 'victory',
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      set({
        stats: newStats,
        inventory: newInventory,
        craftingMaterials: newMaterials,
        currentBiomeId: nextBiomeId,
        biomeStage: nextStage,
        isFightingBoss: nextIsBoss,
        unlockedBiomes: newUnlockedBiomes,
        unlockedDifficulties: newUnlockedDiffs,
        currentEnemies: nextEnemies,
        playerCurrentHp: calc.hp,
        playerMaxHp: calc.hp,
        consecutiveDeaths: 0,
        skill1Cooldown: newSkill1Cd,
        skill2Cooldown: newSkill2Cd,
        activeBuff: newBuff,
        _cachedStats: computeStats({ ...state, activeBuff: newBuff }),
        _hitAccumulator: hitAccum,
        _healAccumulator: 0,
        logs: [...logsToAdd, ...state.logs].slice(0, 30),
      });

      return;
    }

    // --- PLAYER DEFEATED (PENALIDADE PROGRESSIVA DE MORTE E AUTO-ADVANCE OFF SE 3 SEGUIDAS) ---
    if (newPlayerHp <= 0) {
      const nextConsecutiveDeaths = (state.consecutiveDeaths || 0) + 1;
      // Tempo base de 3s, aumentando +1.5s por derrota consecutiva, com limite máximo de 8.0s
      const deathTimer = Math.min(8.0, 3.0 + (nextConsecutiveDeaths - 1) * 1.5);
      const shouldDisableAuto = nextConsecutiveDeaths >= 3 && state.autoAdvance;

      logsToAdd.push({
        id: uid('log_defeat'),
        text: `💀 Derrota #${nextConsecutiveDeaths}! Recuperando Reiatsu em ${deathTimer.toFixed(1)}s (Penalidade ativa)...`,
        type: 'system',
        timestamp: new Date().toLocaleTimeString(),
      });

      if (shouldDisableAuto) {
        logsToAdd.push({
          id: uid('log_auto_off'),
          text: `⚠️ 3 DERROTAS SEGUIDAS! O avanço de Horda Contínua foi DESATIVADO automaticamente para sua proteção.`,
          type: 'system',
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      set({
        playerCurrentHp: 0,
        playerDeathTimerSec: deathTimer,
        consecutiveDeaths: nextConsecutiveDeaths,
        autoAdvance: shouldDisableAuto ? false : state.autoAdvance,
        _hitAccumulator: 0,
        _healAccumulator: 0,
        logs: [...logsToAdd, ...state.logs].slice(0, 30),
      });

      return;
    }

    // Keep alive enemies + dying enemies (so they remain visible at 0 HP for 0.5s)
    const visibleEnemies = enemies.filter((e) => e.currentHp > 0 || (e.deathTimerSec ?? 0) > 0);
    const hasNewLogs = logsToAdd.length > 0;
    set({
      currentEnemies: visibleEnemies,
      playerCurrentHp: newPlayerHp,
      playerMaxHp: calc.hp,
      skill1Cooldown: newSkill1Cd,
      skill2Cooldown: newSkill2Cd,
      activeBuff: newBuff,
      lastSkillUsed: lastSkillObj,
      lastBankaiUsed: lastBankaiObj,
      _cachedStats: calc,
      _hitAccumulator: hitAccum,
      _healAccumulator: healAccum,
      logs: hasNewLogs ? [...logsToAdd, ...state.logs].slice(0, 30) : state.logs,
    });
  },

  // ---------------- ACTIONS ----------------
  allocateStatPoint: (stat: 'atk' | 'def' | 'hp' | 'spd', amount = 1) => {
    const { stats } = get();
    if (stats.statPoints <= 0) return;

    const pointsToUse = Math.min(stats.statPoints, Math.max(1, amount));

    let newBaseAtk = stats.baseAtk;
    let newBaseDef = stats.baseDef;
    let newBaseHp = stats.baseHp;
    let newBaseSpd = stats.baseSpd;

    if (stat === 'atk') newBaseAtk += 4 * pointsToUse;
    if (stat === 'def') newBaseDef += 2 * pointsToUse;
    if (stat === 'hp') newBaseHp += 25 * pointsToUse;
    if (stat === 'spd') {
      // Soft Cap Scaling for point allocation
      for (let i = 0; i < pointsToUse; i++) {
        if (newBaseSpd < 2.5) {
          newBaseSpd += 0.05;
        } else if (newBaseSpd < 4.0) {
          newBaseSpd += 0.025;
        } else {
          newBaseSpd += 0.01;
        }
      }
    }

    set({
      stats: {
        ...stats,
        statPoints: stats.statPoints - pointsToUse,
        baseAtk: newBaseAtk,
        baseDef: newBaseDef,
        baseHp: newBaseHp,
        baseSpd: parseFloat(newBaseSpd.toFixed(2)),
      },
      _cachedStats: null, // Invalidate cache
    });
  },

  equipItem: (item: Equipment) => {
    const { equippedWeapon, inventory } = get();
    if (item.slot === 'weapon') {
      const remainingInventory = inventory.filter((i) => i.instanceId !== item.instanceId);
      if (equippedWeapon) remainingInventory.push(equippedWeapon);

      set({
        equippedWeapon: item,
        inventory: remainingInventory,
        _cachedStats: null, // Invalidate cache
      });
    }
  },

  autoEquipBestWeapon: () => {
    const { equippedWeapon, inventory } = get();
    if (inventory.length === 0) return;

    const weaponsInInv = inventory.filter((i) => i.slot === 'weapon');
    if (weaponsInInv.length === 0) return;

    weaponsInInv.sort((a, b) => b.atk - a.atk);
    const bestWeapon = weaponsInInv[0];

    const currentAtk = equippedWeapon ? equippedWeapon.atk : 0;
    if (bestWeapon.atk > currentAtk) {
      const remainingInv = inventory.filter((i) => i.instanceId !== bestWeapon.instanceId);
      if (equippedWeapon) remainingInv.push(equippedWeapon);

      set({
        equippedWeapon: bestWeapon,
        inventory: remainingInv,
        _cachedStats: null, // Invalidate cache
      });
    }
  },

  unequipSlot: (slot: 'weapon' | 'shihakusho' | 'accessory') => {
    const { equippedWeapon, inventory } = get();
    if (slot === 'weapon' && equippedWeapon) {
      set({
        equippedWeapon: null,
        inventory: [...inventory, equippedWeapon],
        _cachedStats: null, // Invalidate cache
      });
    }
  },

  sellItem: (instanceId: string) => {
    const { inventory, stats } = get();
    const item = inventory.find((i) => i.instanceId === instanceId);
    if (!item) return;

    set({
      inventory: inventory.filter((i) => i.instanceId !== instanceId),
      stats: { ...stats, gold: stats.gold + item.sellPrice },
    });
  },

  salvageItem: (instanceId: string) => {
    const { inventory, craftingMaterials, logs } = get();
    const item = inventory.find((i) => i.instanceId === instanceId);
    if (!item) return;

    const { mat1, mat2, mat3 } = getSalvageValue(item.rarity);

    const newLog: BattleLogMessage = {
      id: uid('log_salvage'),
      text: `♻️ ITEM DESMONTADO: ${item.name} gerou +${mat1} Mat.1, +${mat2} Mat.2!`,
      type: 'system',
      timestamp: new Date().toLocaleTimeString(),
    };

    set({
      inventory: inventory.filter((i) => i.instanceId !== instanceId),
      craftingMaterials: {
        material1: craftingMaterials.material1 + mat1,
        material2: craftingMaterials.material2 + mat2,
        material3: craftingMaterials.material3 + mat3,
      },
      logs: [newLog, ...logs.slice(0, 49)],
    });
  },

  salvageAllNormalItems: () => {
    const { inventory, craftingMaterials, logs } = get();
    const normalItems = inventory.filter((i) => i.rarity === 'normal');
    if (normalItems.length === 0) return;

    const { mat1, mat2, mat3 } = getSalvageValue('normal');
    const totalMat1 = mat1 * normalItems.length;
    const totalMat2 = mat2 * normalItems.length;
    const totalMat3 = mat3 * normalItems.length;

    const newLog: BattleLogMessage = {
      id: uid('log_salvage_bulk'),
      text: `♻️ RECICLAGEM EM LOTE: ${normalItems.length} itens comuns geraram +${totalMat1} Mat.1, +${totalMat2} Mat.2!`,
      type: 'system',
      timestamp: new Date().toLocaleTimeString(),
    };

    set({
      inventory: inventory.filter((i) => i.rarity !== 'normal'),
      craftingMaterials: {
        material1: craftingMaterials.material1 + totalMat1,
        material2: craftingMaterials.material2 + totalMat2,
        material3: craftingMaterials.material3 + totalMat3,
      },
      logs: [newLog, ...logs.slice(0, 49)],
    });
  },

  craftRecipe: (recipeId: string) => {
    const { craftingMaterials, stats, inventory, logs } = get();
    const recipe = CRAFTING_RECIPES_CATALOG.find((r) => r.id === recipeId);
    if (!recipe) return false;

    if (
      craftingMaterials.material1 < recipe.requiredMaterial1 ||
      craftingMaterials.material2 < recipe.requiredMaterial2 ||
      craftingMaterials.material3 < recipe.requiredMaterial3 ||
      stats.gold < recipe.goldCost
    ) {
      return false;
    }

    const weaponTemplate = WEAPONS_CATALOG.find((w) => w.id === recipe.resultWeaponId) || WEAPONS_CATALOG[0];
    const mult = RARITY_MULTIPLIERS[recipe.resultRarity as keyof typeof RARITY_MULTIPLIERS] || 1.0;

    const newEquip: Equipment = {
      instanceId: uid('crafted'),
      weaponId: weaponTemplate.id,
      name: `${weaponTemplate.name} (${recipe.resultRarity.toUpperCase()})`,
      rarity: recipe.resultRarity,
      slot: 'weapon',
      atk: Math.round(weaponTemplate.baseAtk * mult),
      hp: 0,
      def: 0,
      critChance: weaponTemplate.critChanceBonus,
      spdBonus: weaponTemplate.spdBonus,
      sellPrice: Math.round(150 * mult),
    };

    const newLog: BattleLogMessage = {
      id: uid('log_craft'),
      text: `🔨 FORJA CONCLUÍDA! Você forjou com sucesso: ${newEquip.name}!`,
      type: 'loot',
      timestamp: new Date().toLocaleTimeString(),
    };

    set({
      craftingMaterials: {
        material1: craftingMaterials.material1 - recipe.requiredMaterial1,
        material2: craftingMaterials.material2 - recipe.requiredMaterial2,
        material3: craftingMaterials.material3 - recipe.requiredMaterial3,
      },
      stats: { ...stats, gold: stats.gold - recipe.goldCost },
      inventory: [...inventory, newEquip],
      logs: [newLog, ...logs.slice(0, 49)],
    });

    return true;
  },

  equipSkill: (skillId: string, slot: 1 | 2) => {
    const resolved = SKILLS_CATALOG.find(s => s.id === skillId) || null;
    if (slot === 1) {
      set({ equippedSlot1SkillId: skillId, _cachedSkill1: resolved });
    }
    if (slot === 2) {
      set({ equippedSlot2SkillId: skillId, _cachedSkill2: resolved });
    }
  },

  summonGacha: (costOrbs: number) => {
    const { stats, ownedSkills, inventory } = get();
    if (stats.gems < costOrbs) return { isDuplicate: false };

    const newOrbs = stats.gems - costOrbs;
    const isSkillDrop = Math.random() < 0.5;

    if (isSkillDrop) {
      const randomSkill = SKILLS_CATALOG[Math.floor(Math.random() * SKILLS_CATALOG.length)];
      const existing = ownedSkills[randomSkill.id];
      const isDup = !!existing;

      const updatedOwned: Record<string, OwnedSkill> = {
        ...ownedSkills,
        [randomSkill.id]: {
          skillId: randomSkill.id,
          level: existing ? existing.level + 1 : 1,
          unlocked: true,
        },
      };

      set({
        stats: { ...stats, gems: newOrbs },
        ownedSkills: updatedOwned,
      });

      return { skill: randomSkill.name, isDuplicate: isDup };
    } else {
      const weaponTemplate = WEAPONS_CATALOG[Math.floor(Math.random() * WEAPONS_CATALOG.length)];
      const selectedRarity = rollRarity([0.528, 0.35, 0.10, 0.02, 0.002]);
      const mult = RARITY_MULTIPLIERS[selectedRarity];

      const newEquip: Equipment = {
        instanceId: uid('gacha'),
        weaponId: weaponTemplate.id,
        name: `${weaponTemplate.name} (${selectedRarity.toUpperCase()})`,
        rarity: selectedRarity,
        slot: 'weapon',
        atk: Math.round(weaponTemplate.baseAtk * mult),
        hp: 0,
        def: 0,
        critChance: weaponTemplate.critChanceBonus,
        spdBonus: weaponTemplate.spdBonus,
        sellPrice: Math.round(100 * mult),
      };

      set({
        stats: { ...stats, gems: newOrbs },
        inventory: [...inventory, newEquip],
      });

      return { item: newEquip, isDuplicate: false };
    }
  },

  selectStage: (targetStage: number) => {
    const { currentBiomeId, difficulty } = get();
    if (targetStage < 1 || targetStage > 10) return;

    const isBoss = targetStage === 10;
    set({
      biomeStage: targetStage,
      isFightingBoss: isBoss,
      consecutiveDeaths: 0,
      currentEnemies: spawnEnemiesForBiome(currentBiomeId, difficulty, targetStage, isBoss),
      _hitAccumulator: 0,
      _healAccumulator: 0,
    });
  },

  changeBiome: (biomeId: string) => {
    const { difficulty } = get();
    set({
      currentBiomeId: biomeId,
      biomeStage: 1,
      isFightingBoss: false,
      consecutiveDeaths: 0,
      currentEnemies: spawnEnemiesForBiome(biomeId, difficulty, 1, false),
      _cachedStats: null,
      _hitAccumulator: 0,
      _healAccumulator: 0,
    });
  },

  changeDifficulty: (diff: Difficulty) => {
    const { currentBiomeId } = get();
    set({
      difficulty: diff,
      biomeStage: 1,
      isFightingBoss: false,
      consecutiveDeaths: 0,
      currentEnemies: spawnEnemiesForBiome(currentBiomeId, diff, 1, false),
      _cachedStats: null,
      _hitAccumulator: 0,
      _healAccumulator: 0,
    });
  },

  challengeBoss: () => {
    const { currentBiomeId, difficulty, biomeStage } = get();
    if (biomeStage < 9) return;

    set({
      biomeStage: 10,
      isFightingBoss: true,
      consecutiveDeaths: 0,
      currentEnemies: spawnEnemiesForBiome(currentBiomeId, difficulty, 10, true),
      _hitAccumulator: 0,
      _healAccumulator: 0,
    });
  },

  toggleAutoAdvance: () => {
    const { autoAdvance } = get();
    set({ autoAdvance: !autoAdvance });
  },

  resetProgressSave: () => {
    localStorage.removeItem(SAVED_STATE_KEY);
    window.location.reload();
  },
}));
