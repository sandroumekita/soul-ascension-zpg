import { create } from 'zustand';
import type { 
  CharacterStats, Equipment, OwnedSkill, Enemy, Difficulty, BattleLogMessage, Rarity 
} from '../types/game';
import { BIOMES_CATALOG, WEAPONS_CATALOG, SKILLS_CATALOG, RARITY_MULTIPLIERS } from '../data/gameCatalog';

interface GameState {
  // Stats & Progress
  stats: CharacterStats;
  currentBiomeId: string;
  difficulty: Difficulty;
  biomeStage: number; // 1 to 10 (10 is Boss)
  isFightingBoss: boolean;
  unlockedBiomes: string[];
  unlockedDifficulties: Difficulty[];
  
  // Current Combat
  currentEnemy: Enemy | null;
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
  
  // Loadout & Inventory
  equippedSlot1SkillId: string | null;
  equippedSlot2SkillId: string | null;
  equippedWeapon: Equipment | null;
  equippedShihakusho: Equipment | null;
  equippedAccessory: Equipment | null;
  
  inventory: Equipment[];
  ownedSkills: Record<string, OwnedSkill>; // skillId -> OwnedSkill
  
  // Logs
  logs: BattleLogMessage[];
  
  // Actions
  tick: (deltaTimeSec: number) => void;
  allocateStatPoint: (stat: 'atk' | 'def' | 'hp' | 'spd') => void;
  equipItem: (item: Equipment) => void;
  unequipSlot: (slot: 'weapon' | 'shihakusho' | 'accessory') => void;
  sellItem: (instanceId: string) => void;
  equipSkill: (skillId: string, slot: 1 | 2) => void;
  summonGacha: (costOrbs: number) => { item?: Equipment; skill?: string; isDuplicate: boolean };
  changeBiome: (biomeId: string) => void;
  changeDifficulty: (diff: Difficulty) => void;
  challengeBoss: () => void;
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
  reiryoku: 200,
  soulOrbs: 100, // Moeda Premium inicial
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

// Helper: Generate Spawn Enemy
const spawnEnemyForBiome = (biomeId: string, diff: Difficulty, stage: number, isBoss: boolean): Enemy => {
  const biome = BIOMES_CATALOG.find((b) => b.id === biomeId) || BIOMES_CATALOG[0];
  const diffMultiplier = diff === 'normal' ? 1.0 : diff === 'hard' ? 3.5 : diff === 'nightmare' ? 12.0 : 50.0;
  
  if (isBoss || stage === 10) {
    const b = biome.boss;
    const maxHp = Math.round(b.hpBase * diffMultiplier);
    return {
      id: `boss_${Date.now()}`,
      name: `[BOSS] ${b.name}`,
      maxHp,
      currentHp: maxHp,
      atk: Math.round(b.atkBase * diffMultiplier),
      def: Math.round(b.defBase * diffMultiplier),
      expReward: Math.round(b.expBase * diffMultiplier * 2.5),
      goldReward: Math.round(b.goldBase * diffMultiplier * 2.5),
      isBoss: true,
    };
  }

  const enemyTemplate = biome.enemies[(stage - 1) % biome.enemies.length];
  const maxHp = Math.round(enemyTemplate.hpBase * diffMultiplier);
  return {
    id: `enemy_${Date.now()}`,
    name: enemyTemplate.name,
    maxHp,
    currentHp: maxHp,
    atk: Math.round(enemyTemplate.atkBase * diffMultiplier),
    def: Math.round(enemyTemplate.defBase * diffMultiplier),
    expReward: Math.round(enemyTemplate.expBase * diffMultiplier),
    goldReward: Math.round(enemyTemplate.goldBase * diffMultiplier),
    isBoss: false,
  };
};

const SAVED_STATE_KEY = 'soul_ascension_save_v1';

export const useGameStore = create<GameState>((set, get) => ({
  stats: INITIAL_STATS,
  currentBiomeId: 'karakura',
  difficulty: 'normal',
  biomeStage: 1,
  isFightingBoss: false,
  unlockedBiomes: ['karakura'],
  unlockedDifficulties: ['normal'],

  currentEnemy: spawnEnemyForBiome('karakura', 'normal', 1, false),
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
    if (!state.currentEnemy) return;

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

    const enemy = { ...state.currentEnemy };
    let logsToAdd: BattleLogMessage[] = [];

    // --- PLAYER AUTO-ATTACK ---
    // Calculate attack tick threshold
    const attackIntervalSec = 1.0 / calc.spd;
    const hitsThisTick = deltaTimeSec / attackIntervalSec;

    let totalPlayerDamage = 0;
    const isCrit = Math.random() < calc.critChance;
    const rawDamage = Math.max(1, calc.atk - enemy.def * 0.5);
    const finalHitDamage = isCrit ? Math.round(rawDamage * 1.8) : Math.round(rawDamage);
    totalPlayerDamage = Math.round(finalHitDamage * hitsThisTick);

    // Apply Lifesteal
    if (newBuff && newBuff.lifestealPct > 0) {
      const healAmount = Math.round(totalPlayerDamage * newBuff.lifestealPct);
      newPlayerHp = Math.min(calc.hp, newPlayerHp + healAmount);
    }

    // --- SKILL EXECUTION AUTOMATION ---
    // Skill 1 Check
    if (newSkill1Cd <= 0 && state.equippedSlot1SkillId) {
      const skill = SKILLS_CATALOG.find((s) => s.id === state.equippedSlot1SkillId);
      if (skill) {
        const skillDamage = Math.round(calc.atk * skill.damageMultiplier);
        totalPlayerDamage += skillDamage;
        newSkill1Cd = skill.cooldownSec;

        logsToAdd.push({
          id: `log_${Date.now()}_s1`,
          text: `💥 [Habilidade] ${skill.name} causou ${skillDamage} de dano em ${enemy.name}!`,
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
        totalPlayerDamage += bankaiDamage;
        newSkill2Cd = bankai.cooldownSec;

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
          text: `🔥 [BANKAI] ${bankai.name} ativado! Dano: ${bankaiDamage}!`,
          type: 'skill',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    }

    // Apply Damage to Enemy
    enemy.currentHp = Math.max(0, enemy.currentHp - totalPlayerDamage);

    // --- ENEMY ATTACK BACK ---
    if (enemy.currentHp > 0) {
      const enemyRawDmg = Math.max(1, enemy.atk - calc.def * 0.4);
      const enemyDmgPerTick = Math.round(enemyRawDmg * deltaTimeSec);
      newPlayerHp = Math.max(0, newPlayerHp - enemyDmgPerTick);
    }

    // --- ENEMY DEFEATED CASE ---
    if (enemy.currentHp <= 0) {
      const gainedExp = enemy.expReward;
      const gainedGold = enemy.goldReward;
      let newStats = { ...state.stats, exp: state.stats.exp + gainedExp, reiryoku: state.stats.reiryoku + gainedGold };

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

      // Generate Loot (4% Chance on regular enemies, 100% on Bosses)
      let newInventory = [...state.inventory];
      if (enemy.isBoss || Math.random() < 0.04) {
        const weaponTemplate = WEAPONS_CATALOG[Math.floor(Math.random() * WEAPONS_CATALOG.length)];
        const rarities: Rarity[] = ['normal', 'rare', 'epic', 'legendary', 'transcendent'];
        
        // Taxas de raridade muito mais desafiadoras e valiosas
        const rarityWeights = enemy.isBoss 
          ? [0.45, 0.35, 0.15, 0.04, 0.01]   // Boss: 45% Normal, 35% Raro, 15% Épico, 4% Lendário, 1% Transcendente
          : [0.80, 0.15, 0.04, 0.009, 0.001]; // Normal: 80% Normal, 15% Raro, 4% Épico, 0.9% Lendário, 0.1% Transcendente
        
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

      if (enemy.isBoss || state.biomeStage === 10) {
        // VENCEU O BOSS DO BIOMA!
        logsToAdd.push({
          id: `log_boss_win_${Date.now()}`,
          text: `🏆 BOSS DERROTADO! Você concluiu as 10 Fases de ${state.currentBiomeId.toUpperCase()}!`,
          type: 'victory',
          timestamp: new Date().toLocaleTimeString(),
        });

        // Encontra o index do bioma atual
        const currentBiomeIdx = BIOMES_CATALOG.findIndex((b) => b.id === state.currentBiomeId);
        if (currentBiomeIdx < BIOMES_CATALOG.length - 1) {
          // Desbloqueia e avança para o próximo bioma
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
          // VENCEU O ÚLTIMO BIOMA (PALÁCIO REAL - AIZEN)!
          nextStage = 10; // Fica na fase 10 do último bioma
          nextIsBoss = true;

          // Desbloqueia a próxima Dificuldade Global
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
        // Avanço normal de fase (1 -> 2 -> ... -> 9 -> 10)
        nextStage = state.biomeStage + 1;
        if (nextStage === 10) {
          nextIsBoss = true;
        }
      }

      const nextEnemy = spawnEnemyForBiome(nextBiomeId, state.difficulty, nextStage, nextIsBoss);

      set({
        stats: newStats,
        inventory: newInventory,
        currentBiomeId: nextBiomeId,
        biomeStage: nextStage,
        isFightingBoss: nextIsBoss,
        unlockedBiomes: newUnlockedBiomes,
        unlockedDifficulties: newUnlockedDiffs,
        currentEnemy: nextEnemy,
        playerCurrentHp: calc.hp, // Full Heal na vitória
        playerMaxHp: calc.hp,
        skill1Cooldown: newSkill1Cd,
        skill2Cooldown: newSkill2Cd,
        activeBuff: newBuff,
        logs: [...logsToAdd, ...state.logs].slice(0, 30),
      });

      return;
    }

    // --- PLAYER DEFEATED (AUTO-RECUO PARA A FASE 9 SE FOR NO BOSS) ---
    if (newPlayerHp <= 0) {
      const fallbackStage = state.biomeStage === 10 ? 9 : Math.max(1, state.biomeStage - 1);
      logsToAdd.push({
        id: `log_defeat_${Date.now()}`,
        text: `💀 Seu Shinigami recuou para recuperar o HP. Voltando para a Fase ${fallbackStage}...`,
        type: 'system',
        timestamp: new Date().toLocaleTimeString(),
      });

      const nextEnemy = spawnEnemyForBiome(state.currentBiomeId, state.difficulty, fallbackStage, false);
      set({
        biomeStage: fallbackStage,
        isFightingBoss: false,
        currentEnemy: nextEnemy,
        playerCurrentHp: calc.hp,
        playerMaxHp: calc.hp,
        logs: [...logsToAdd, ...state.logs].slice(0, 30),
      });

      return;
    }

    set({
      currentEnemy: enemy,
      playerCurrentHp: newPlayerHp,
      playerMaxHp: calc.hp,
      skill1Cooldown: newSkill1Cd,
      skill2Cooldown: newSkill2Cd,
      activeBuff: newBuff,
      logs: logsToAdd.length > 0 ? [...logsToAdd, ...state.logs].slice(0, 30) : state.logs,
    });
  },

  // ---------------- ACTIONS ----------------
  allocateStatPoint: (stat: 'atk' | 'def' | 'hp' | 'spd') => {
    const { stats } = get();
    if (stats.statPoints <= 0) return;

    let newBaseAtk = stats.baseAtk;
    let newBaseDef = stats.baseDef;
    let newBaseHp = stats.baseHp;
    let newBaseSpd = stats.baseSpd;

    if (stat === 'atk') newBaseAtk += 4;
    if (stat === 'def') newBaseDef += 2;
    if (stat === 'hp') newBaseHp += 25;
    if (stat === 'spd') newBaseSpd += 0.05;

    set({
      stats: {
        ...stats,
        statPoints: stats.statPoints - 1,
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
      stats: { ...stats, reiryoku: stats.reiryoku + item.sellPrice },
    });
  },

  equipSkill: (skillId: string, slot: 1 | 2) => {
    if (slot === 1) set({ equippedSlot1SkillId: skillId });
    if (slot === 2) set({ equippedSlot2SkillId: skillId });
  },

  summonGacha: (costOrbs: number) => {
    const { stats, ownedSkills, inventory } = get();
    if (stats.soulOrbs < costOrbs) return { isDuplicate: false };

    const newOrbs = stats.soulOrbs - costOrbs;
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
        stats: { ...stats, soulOrbs: newOrbs },
        ownedSkills: updatedOwned,
      });

      return { skill: randomSkill.name, isDuplicate: isDup };
    } else {
      const weaponTemplate = WEAPONS_CATALOG[Math.floor(Math.random() * WEAPONS_CATALOG.length)];
      const rarities: Rarity[] = ['rare', 'epic', 'legendary', 'transcendent'];
      const rarity = rarities[Math.floor(Math.random() * rarities.length)];
      const mult = RARITY_MULTIPLIERS[rarity];

      const newEquip: Equipment = {
        instanceId: `gacha_${Date.now()}`,
        weaponId: weaponTemplate.id,
        name: `${weaponTemplate.name} (${rarity.toUpperCase()})`,
        rarity,
        slot: 'weapon',
        atk: Math.round(weaponTemplate.baseAtk * mult),
        hp: 0,
        def: 0,
        critChance: weaponTemplate.critChanceBonus,
        spdBonus: weaponTemplate.spdBonus,
        sellPrice: Math.round(100 * mult),
      };

      set({
        stats: { ...stats, soulOrbs: newOrbs },
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
      currentEnemy: spawnEnemyForBiome(biomeId, difficulty, 1, false),
    });
  },

  changeDifficulty: (diff: Difficulty) => {
    const { currentBiomeId } = get();
    set({
      difficulty: diff,
      biomeStage: 1,
      isFightingBoss: false,
      currentEnemy: spawnEnemyForBiome(currentBiomeId, diff, 1, false),
    });
  },

  challengeBoss: () => {
    const { currentBiomeId, difficulty } = get();
    set({
      biomeStage: 10,
      isFightingBoss: true,
      currentEnemy: spawnEnemyForBiome(currentBiomeId, difficulty, 10, true),
    });
  },

  resetProgressSave: () => {
    localStorage.removeItem(SAVED_STATE_KEY);
    window.location.reload();
  },
}));
