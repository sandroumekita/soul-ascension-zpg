import { create } from 'zustand';
import type { 
  CharacterStats, Equipment, OwnedSkill, Enemy, Difficulty, BattleLogMessage, Rarity
} from '../types/game';
import { BIOMES_CATALOG, WEAPONS_CATALOG, SKILLS_CATALOG, RARITY_MULTIPLIERS, CRAFTING_RECIPES_CATALOG } from '../data/gameCatalog';

interface GameState {
  // Stats & Progress
  stats: CharacterStats;
  currentBiomeId: string;
  difficulty: Difficulty;
  biomeStage: number; // 1 to 10 (10 is Boss)
  isFightingBoss: boolean;
  autoAdvance: boolean; // Controls whether to advance to next stage or hold/farm
  unlockedBiomes: string[];
  unlockedDifficulties: Difficulty[];
  
  // Current Combat
  currentEnemies: Enemy[];
  playerCurrentHp: number;
  playerMaxHp: number;
  
  // Cooldowns & Active Buffs
  skill1Cooldown: number; // sec left
  skill2Cooldown: number; // sec left
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
  ownedSkills: Record<string, OwnedSkill>; // skillId -> OwnedSkill
  
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
  baseSpd: 1.0, // 1 ataque por segundo
  gold: 200,
  gems: 100, // Moeda Premium inicial
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

// Helper: Calculate total stats derived from base + points + equipment + buffs
const getCalculatedStats = (state: {
  stats: CharacterStats;
  equippedWeapon: Equipment | null;
  equippedShihakusho: Equipment | null;
  equippedAccessory: Equipment | null;
  activeBuff: GameState['activeBuff'];
}) => {
  let atk = state.stats.baseAtk;
  let def = state.stats.baseDef;
  let hp = state.stats.baseHp;
  let spd = state.stats.baseSpd;
  let critChance = 0.05; // 5% base

  // Equipments
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

  // Active Buffs
  if (state.activeBuff) {
    if (state.activeBuff.atkBuffPct) atk *= (1 + state.activeBuff.atkBuffPct);
    if (state.activeBuff.spdBuffPct) spd *= (1 + state.activeBuff.spdBuffPct);
    if (state.activeBuff.defBuffPct) def *= (1 + state.activeBuff.defBuffPct);
  }

  return { atk: Math.round(atk), def: Math.round(def), hp: Math.round(hp), spd: parseFloat(spd.toFixed(2)), critChance };
};

// Helper: Spawn Horda de Inimigos (1 a 3 mobs simultâneos conforme o estágio)
const spawnEnemiesForBiome = (biomeId: string, diff: Difficulty, stage: number, isBoss: boolean): Enemy[] => {
  const biome = BIOMES_CATALOG.find((b) => b.id === biomeId) || BIOMES_CATALOG[0];
  const diffMultiplier = diff === 'normal' ? 1.0 : diff === 'hard' ? 3.5 : diff === 'nightmare' ? 12.0 : 50.0;
  
  if (isBoss || stage === 10) {
    const b = biome.boss;
    const maxHp = Math.round(b.hpBase * diffMultiplier);
    return [{
      id: `boss_${Date.now()}`,
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

  // Gera de 1 a 3 mobs simultâneos dependendo da fase do estágio (Fases 1-3 = 1 mob, Fases 4-7 = 2 mobs, Fases 8-9 = 3 mobs)
  const enemyCount = stage >= 8 ? 3 : stage >= 4 ? 2 : 1;
  const enemies: Enemy[] = [];

  for (let i = 0; i < enemyCount; i++) {
    const enemyTemplate = biome.enemies[(stage - 1 + i) % biome.enemies.length];
    const maxHp = Math.round(enemyTemplate.hpBase * diffMultiplier);
    enemies.push({
      id: `enemy_${Date.now()}_${i}`,
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

const SAVED_STATE_KEY = 'soul_ascension_save_v1';

export const useGameStore = create<GameState>((set, get) => ({
  stats: INITIAL_STATS,
  currentBiomeId: 'karakura',
  difficulty: 'normal',
  biomeStage: 1,
  isFightingBoss: false,
  autoAdvance: true, // Por padrão avança automaticamente
  unlockedBiomes: ['karakura'],
  unlockedDifficulties: ['normal'],

  currentEnemies: spawnEnemiesForBiome('karakura', 'normal', 1, false),
  playerCurrentHp: 100,
  playerMaxHp: 100,

  skill1Cooldown: 0,
  skill2Cooldown: 0,
  activeBuff: null,

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
      id: '1',
      text: '⚔️ Bem-vindo ao Soul Ascension! Seu combate autônomo iniciou na Cidade de Karakura.',
      type: 'system',
      timestamp: new Date().toLocaleTimeString(),
    },
  ],

  // ---------------- COMBAT ENGINE TICK ----------------
  tick: (deltaTimeSec: number) => {
    const state = get();
    if (state.currentEnemies.length === 0) return;

    const calc = getCalculatedStats(state);
    let newPlayerHp = state.playerCurrentHp;
    let newSkill1Cd = Math.max(0, state.skill1Cooldown - deltaTimeSec);
    let newSkill2Cd = Math.max(0, state.skill2Cooldown - deltaTimeSec);
    let newBuff = state.activeBuff;

    // Handle Buff Timer
    if (newBuff) {
      const remaining = newBuff.durationLeft - deltaTimeSec;
      if (remaining <= 0) {
        newBuff = null;
      } else {
        newBuff = { ...newBuff, durationLeft: remaining };
      }
    }

    const enemies = state.currentEnemies.map((e) => ({ ...e }));
    let logsToAdd: BattleLogMessage[] = [];

    // O alvo primário é o primeiro mob vivo da fila
    const primaryEnemy = enemies[0];
    if (!primaryEnemy) return;

    // --- PLAYER AUTO-ATTACK (Alvo Primário) ---
    const attackIntervalSec = 1.0 / calc.spd;
    const hitsThisTick = deltaTimeSec / attackIntervalSec;

    const isCrit = Math.random() < calc.critChance;
    const rawDamage = Math.max(1, calc.atk - primaryEnemy.def * 0.5);
    const finalHitDamage = isCrit ? Math.round(rawDamage * 1.8) : Math.round(rawDamage);
    const autoAttackDmg = Math.round(finalHitDamage * hitsThisTick);
    
    primaryEnemy.currentHp = Math.max(0, primaryEnemy.currentHp - autoAttackDmg);

    // Apply Lifesteal
    if (newBuff && newBuff.lifestealPct > 0) {
      const healAmount = Math.round(autoAttackDmg * newBuff.lifestealPct);
      newPlayerHp = Math.min(calc.hp, newPlayerHp + healAmount);
    }

    // --- SKILL EXECUTION AUTOMATION (Suporte a AoE) ---
    // Skill 1 Check
    if (newSkill1Cd <= 0 && state.equippedSlot1SkillId) {
      const skill = SKILLS_CATALOG.find((s) => s.id === state.equippedSlot1SkillId);
      if (skill) {
        const skillDamage = Math.round(calc.atk * skill.damageMultiplier);
        newSkill1Cd = skill.cooldownSec;

        // Se for Habilidade em Área (AoE), atinge múltiplos mobs da horda!
        const targetsCount = skill.isAoE ? Math.min(enemies.length, skill.maxTargets || 3) : 1;
        for (let i = 0; i < targetsCount; i++) {
          if (enemies[i]) {
            enemies[i].currentHp = Math.max(0, enemies[i].currentHp - skillDamage);
          }
        }

        logsToAdd.push({
          id: `log_${Date.now()}_s1`,
          text: `💥 [Habilidade ${skill.isAoE ? 'ÁREA' : 'Single'}] ${skill.name} causou ${skillDamage} de dano em ${targetsCount} inimigo(s)!`,
          type: 'skill',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    }

    // Skill 2 (Bankai) Check
    if (newSkill2Cd <= 0 && state.equippedSlot2SkillId) {
      const bankai = SKILLS_CATALOG.find((s) => s.id === state.equippedSlot2SkillId);
      if (bankai) {
        const bankaiDamage = Math.round(calc.atk * bankai.damageMultiplier);
        newSkill2Cd = bankai.cooldownSec;

        // Se for Bankai em Área (AoE), dizima múltiplos inimigos!
        const targetsCount = bankai.isAoE ? Math.min(enemies.length, bankai.maxTargets || 5) : 1;
        for (let i = 0; i < targetsCount; i++) {
          if (enemies[i]) {
            enemies[i].currentHp = Math.max(0, enemies[i].currentHp - bankaiDamage);
          }
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

        logsToAdd.push({
          id: `log_${Date.now()}_s2`,
          text: `🔥 [BANKAI ${bankai.isAoE ? 'ÁREA' : 'Single'}] ${bankai.name} ativado! Dano: ${bankaiDamage} em ${targetsCount} inimigo(s)!`,
          type: 'skill',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    }

    // --- ATAQUES SIMULTÂNEOS DOS INIMIGOS DA HORDA ---
    enemies.forEach((enemy) => {
      if (enemy.currentHp > 0) {
        const enemyRawDmg = Math.max(1, enemy.atk - calc.def * 0.4);
        const enemyDmgPerTick = Math.round((enemyRawDmg / (enemy.attackSpeedSec || 1.2)) * deltaTimeSec);
        newPlayerHp = Math.max(0, newPlayerHp - enemyDmgPerTick);
      }
    });

    // Filtra mobs sobreviventes
    const aliveEnemies = enemies.filter((e) => e.currentHp > 0);
    const defeatedEnemies = enemies.filter((e) => e.currentHp <= 0);

    // --- HORDA ELIMINADA / RESPAWN / AVANÇO ---
    if (aliveEnemies.length === 0) {
      // Recompensas acumuladas de todos os mobs mortos nesta rodada
      let totalExpGained = 0;
      let totalGoldGained = 0;
      let wasBossDefeated = false;

      defeatedEnemies.forEach((e) => {
        totalExpGained += e.expReward;
        totalGoldGained += e.goldReward;
        if (e.isBoss) wasBossDefeated = true;
      });

      let newStats = { ...state.stats, exp: state.stats.exp + totalExpGained, gold: state.stats.gold + totalGoldGained };

      // Check Level Up
      if (newStats.exp >= newStats.nextLevelExp) {
        newStats.level += 1;
        newStats.statPoints += 3;
        newStats.exp -= newStats.nextLevelExp;
        newStats.nextLevelExp = Math.round(newStats.nextLevelExp * 1.4);

        logsToAdd.push({
          id: `log_lvl_${Date.now()}`,
          text: `🎉 LEVEL UP! Você alcançou o Nível ${newStats.level}! (+3 Pontos de Atributo)`,
          type: 'system',
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      // Generate Loot (15% Chance por mob normal da horda, 100% no Boss)
      let newInventory = [...state.inventory];
      if (wasBossDefeated || Math.random() < 0.15) {
        const weaponTemplate = WEAPONS_CATALOG[Math.floor(Math.random() * WEAPONS_CATALOG.length)];
        const rarities: Rarity[] = ['normal', 'rare', 'epic', 'legendary', 'transcendent'];
        const rarityWeights = wasBossDefeated 
          ? [0.55, 0.30, 0.115, 0.032, 0.003]   
          : [0.80, 0.16, 0.035, 0.0048, 0.0002]; 
        
        const rand = Math.random();
        let cumulative = 0;
        let selectedRarity: Rarity = 'normal';
        for (let i = 0; i < rarities.length; i++) {
          cumulative += rarityWeights[i];
          if (rand <= cumulative) {
            selectedRarity = rarities[i];
            break;
          }
        }

        const mult = RARITY_MULTIPLIERS[selectedRarity];
        const newEquip: Equipment = {
          instanceId: `equip_${Date.now()}_${Math.random()}`,
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
          id: `log_loot_${Date.now()}`,
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
          id: `log_boss_win_${Date.now()}`,
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
            id: `log_unlock_biome_${Date.now()}`,
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
                id: `log_unlock_diff_${Date.now()}`,
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

      set({
        stats: newStats,
        inventory: newInventory,
        currentBiomeId: nextBiomeId,
        biomeStage: nextStage,
        isFightingBoss: nextIsBoss,
        unlockedBiomes: newUnlockedBiomes,
        unlockedDifficulties: newUnlockedDiffs,
        currentEnemies: nextEnemies,
        playerCurrentHp: calc.hp,
        playerMaxHp: calc.hp,
        skill1Cooldown: newSkill1Cd,
        skill2Cooldown: newSkill2Cd,
        activeBuff: newBuff,
        logs: [...logsToAdd, ...state.logs].slice(0, 30),
      });

      return;
    }

    // --- PLAYER DEFEATED (AUTO-RECUO) ---
    if (newPlayerHp <= 0) {
      const fallbackStage = state.biomeStage === 10 ? 9 : Math.max(1, state.biomeStage - 1);
      logsToAdd.push({
        id: `log_defeat_${Date.now()}`,
        text: `💀 Seu Shinigami recuou para recuperar o HP. Voltando para a Fase ${fallbackStage}...`,
        type: 'system',
        timestamp: new Date().toLocaleTimeString(),
      });

      const nextEnemies = spawnEnemiesForBiome(state.currentBiomeId, state.difficulty, fallbackStage, false);
      set({
        biomeStage: fallbackStage,
        isFightingBoss: false,
        currentEnemies: nextEnemies,
        playerCurrentHp: calc.hp,
        playerMaxHp: calc.hp,
        logs: [...logsToAdd, ...state.logs].slice(0, 30),
      });

      return;
    }

    set({
      currentEnemies: aliveEnemies,
      playerCurrentHp: newPlayerHp,
      playerMaxHp: calc.hp,
      skill1Cooldown: newSkill1Cd,
      skill2Cooldown: newSkill2Cd,
      activeBuff: newBuff,
      logs: logsToAdd.length > 0 ? [...logsToAdd, ...state.logs].slice(0, 30) : state.logs,
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
    if (stat === 'spd') newBaseSpd += 0.05 * pointsToUse;

    set({
      stats: {
        ...stats,
        statPoints: stats.statPoints - pointsToUse,
        baseAtk: newBaseAtk,
        baseDef: newBaseDef,
        baseHp: newBaseHp,
        baseSpd: parseFloat(newBaseSpd.toFixed(2)),
      },
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
      });
    }
  },

  autoEquipBestWeapon: () => {
    const { equippedWeapon, inventory } = get();
    if (inventory.length === 0) return;

    // Encontra a arma do inventário com maior dano de ATK
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
      });
    }
  },

  unequipSlot: (slot: 'weapon' | 'shihakusho' | 'accessory') => {
    const { equippedWeapon, inventory } = get();
    if (slot === 'weapon' && equippedWeapon) {
      set({
        equippedWeapon: null,
        inventory: [...inventory, equippedWeapon],
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

    // Converte o item em materiais baseados na raridade
    let mat1Gained = 2;
    let mat2Gained = 1;
    let mat3Gained = 0;

    if (item.rarity === 'rare') {
      mat1Gained = 5;
      mat2Gained = 3;
    } else if (item.rarity === 'epic') {
      mat1Gained = 12;
      mat2Gained = 6;
      mat3Gained = 1;
    } else if (item.rarity === 'legendary' || item.rarity === 'transcendent') {
      mat1Gained = 30;
      mat2Gained = 15;
      mat3Gained = 3;
    }

    const updatedMaterials = {
      material1: craftingMaterials.material1 + mat1Gained,
      material2: craftingMaterials.material2 + mat2Gained,
      material3: craftingMaterials.material3 + mat3Gained,
    };

    const newLog: BattleLogMessage = {
      id: `log_salvage_${Date.now()}`,
      text: `♻️ ITEM DESMONTADO: ${item.name} gerou +${mat1Gained} Mat.1, +${mat2Gained} Mat.2!`,
      type: 'system',
      timestamp: new Date().toLocaleTimeString(),
    };

    set({
      inventory: inventory.filter((i) => i.instanceId !== instanceId),
      craftingMaterials: updatedMaterials,
      logs: [newLog, ...logs.slice(0, 49)],
    });
  },

  salvageAllNormalItems: () => {
    const { inventory, craftingMaterials, logs } = get();
    const normalItems = inventory.filter((i) => i.rarity === 'normal');
    if (normalItems.length === 0) return;

    let mat1Gained = 0;
    let mat2Gained = 0;

    normalItems.forEach(() => {
      mat1Gained += 2;
      mat2Gained += 1;
    });

    const remainingInventory = inventory.filter((i) => i.rarity !== 'normal');
    const updatedMaterials = {
      ...craftingMaterials,
      material1: craftingMaterials.material1 + mat1Gained,
      material2: craftingMaterials.material2 + mat2Gained,
    };

    const newLog: BattleLogMessage = {
      id: `log_salvage_bulk_${Date.now()}`,
      text: `♻️ RECICLAGEM EM LOTE: ${normalItems.length} itens comuns geraram +${mat1Gained} Mat.1, +${mat2Gained} Mat.2!`,
      type: 'system',
      timestamp: new Date().toLocaleTimeString(),
    };

    set({
      inventory: remainingInventory,
      craftingMaterials: updatedMaterials,
      logs: [newLog, ...logs.slice(0, 49)],
    });
  },

  craftRecipe: (recipeId: string) => {
    const { craftingMaterials, stats, inventory, logs } = get();
    const recipe = CRAFTING_RECIPES_CATALOG.find((r) => r.id === recipeId);
    if (!recipe) return false;

    // Verificar se possui recursos suficientes
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
      instanceId: `crafted_${Date.now()}`,
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

    const newMaterials = {
      material1: craftingMaterials.material1 - recipe.requiredMaterial1,
      material2: craftingMaterials.material2 - recipe.requiredMaterial2,
      material3: craftingMaterials.material3 - recipe.requiredMaterial3,
    };

    const newLog: BattleLogMessage = {
      id: `log_craft_${Date.now()}`,
      text: `🔨 FORJA CONCLUÍDA! Você forjou com sucesso: ${newEquip.name}!`,
      type: 'loot',
      timestamp: new Date().toLocaleTimeString(),
    };

    set({
      craftingMaterials: newMaterials,
      stats: { ...stats, gold: stats.gold - recipe.goldCost },
      inventory: [...inventory, newEquip],
      logs: [newLog, ...logs.slice(0, 49)],
    });

    return true;
  },

  equipSkill: (skillId: string, slot: 1 | 2) => {
    if (slot === 1) set({ equippedSlot1SkillId: skillId });
    if (slot === 2) set({ equippedSlot2SkillId: skillId });
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
      
      // Taxas de Gacha de alta raridade (Gacha realista):
      // Normal: 52.8%, Raro: 35%, Épico: 10%, Lendário: 2.0%, Transcendente: 0.2%
      const rarities: Rarity[] = ['normal', 'rare', 'epic', 'legendary', 'transcendent'];
      const gachaWeights = [0.528, 0.35, 0.10, 0.02, 0.002];

      const rand = Math.random();
      let cumulative = 0;
      let selectedRarity: Rarity = 'normal';
      for (let i = 0; i < rarities.length; i++) {
        cumulative += gachaWeights[i];
        if (rand <= cumulative) {
          selectedRarity = rarities[i];
          break;
        }
      }

      const mult = RARITY_MULTIPLIERS[selectedRarity];

      const newEquip: Equipment = {
        instanceId: `gacha_${Date.now()}`,
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

  changeBiome: (biomeId: string) => {
    const { difficulty } = get();
    set({
      currentBiomeId: biomeId,
      biomeStage: 1,
      isFightingBoss: false,
      currentEnemies: spawnEnemiesForBiome(biomeId, difficulty, 1, false),
    });
  },

  changeDifficulty: (diff: Difficulty) => {
    const { currentBiomeId } = get();
    set({
      difficulty: diff,
      biomeStage: 1,
      isFightingBoss: false,
      currentEnemies: spawnEnemiesForBiome(currentBiomeId, diff, 1, false),
    });
  },

  challengeBoss: () => {
    const { currentBiomeId, difficulty, biomeStage } = get();
    // O desafio do boss só está disponível se o jogador já estiver no Estágio 9 ou superior
    if (biomeStage < 9) return;

    set({
      biomeStage: 10,
      isFightingBoss: true,
      currentEnemies: spawnEnemiesForBiome(currentBiomeId, difficulty, 10, true),
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
