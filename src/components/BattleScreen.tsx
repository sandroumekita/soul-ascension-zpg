import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { BIOMES_CATALOG, SKILLS_CATALOG } from '../data/gameCatalog';
import { GAME_THEME } from '../config/themeConfig';
import { HeroAvatarPixel } from './HeroAvatarPixel';
import { PixelMobSprite } from './PixelMobSprite';
import { Shield, Zap, Sparkles, Skull, Crown, Flame, Swords, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import type { FloatingDamage } from '../types/game';

// Static array extracted outside component to avoid recreation every render
const STAGE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const SLOT_INDICES = [0, 1, 2] as const;

// Floating damage overlay extracted to its own component to isolate re-renders
const DamageOverlay: React.FC<{ enemyHp: number | undefined }> = React.memo(({ enemyHp }) => {
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
  const baseAtk = useGameStore(state => state.stats.baseAtk);
  const weaponAtk = useGameStore(state => state.equippedWeapon?.atk || 0);

  useEffect(() => {
    if (enemyHp === undefined) return;

    const newDmg: FloatingDamage = {
      id: `dmg_${Date.now()}_${Math.random()}`,
      damage: Math.round(baseAtk * (1 + weaponAtk / 50)),
      isCrit: Math.random() < 0.25,
      isSkill: false,
      xOffset: (Math.random() - 0.5) * 40,
    };

    setFloatingDamages((prev) => [...prev.slice(-3), newDmg]);

    const timer = setTimeout(() => {
      setFloatingDamages((prev) => prev.filter((d) => d.id !== newDmg.id));
    }, 900);

    return () => clearTimeout(timer);
  }, [enemyHp, baseAtk, weaponAtk]);

  return (
    <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-30">
      {floatingDamages.map((dmg) => (
        <div
          key={dmg.id}
          className={`absolute font-black text-sm pointer-events-none animate-float-damage ${
            dmg.isCrit ? 'text-amber-400 text-base drop-shadow-[0_2px_4px_rgba(239,68,68,0.8)]' : 'text-red-400'
          }`}
          style={{ transform: `translateX(${dmg.xOffset}px)` }}
        >
          -{dmg.damage} {dmg.isCrit ? '🔥 CRÍTICO!' : ''}
        </div>
      ))}
    </div>
  );
});

export const BattleScreen: React.FC = () => {
  // Atomic Zustand selectors — only re-render when these specific values change
  const {
    currentEnemies,
    playerCurrentHp,
    playerMaxHp,
    currentBiomeId,
    difficulty,
    biomeStage,
    isFightingBoss,
    autoAdvance,
    logs,
    skill1Cooldown,
    skill2Cooldown,
    equippedSlot1SkillId,
    equippedSlot2SkillId,
    equippedWeapon,
    baseAtk,
    baseSpd,
    playerDeathTimerSec,
    lastSkillUsed,
    lastBankaiUsed,
    activeBuff,
    consecutiveDeaths,
    ownedSkills,
    unlockedBiomes,
    bossKeys,
    maxUnlockedStagePerBiome,
  } = useGameStore(useShallow((state) => ({
    currentEnemies: state.currentEnemies,
    playerCurrentHp: state.playerCurrentHp,
    playerMaxHp: state.playerMaxHp,
    currentBiomeId: state.currentBiomeId,
    difficulty: state.difficulty,
    biomeStage: state.biomeStage,
    isFightingBoss: state.isFightingBoss,
    autoAdvance: state.autoAdvance,
    logs: state.logs,
    skill1Cooldown: state.skill1Cooldown,
    skill2Cooldown: state.skill2Cooldown,
    equippedSlot1SkillId: state.equippedSlot1SkillId,
    equippedSlot2SkillId: state.equippedSlot2SkillId,
    equippedWeapon: state.equippedWeapon,
    baseAtk: state.stats.baseAtk,
    baseSpd: state.stats.baseSpd,
    playerDeathTimerSec: state.playerDeathTimerSec,
    lastSkillUsed: state.lastSkillUsed,
    lastBankaiUsed: state.lastBankaiUsed,
    activeBuff: state.activeBuff,
    consecutiveDeaths: state.consecutiveDeaths,
    ownedSkills: state.ownedSkills,
    unlockedBiomes: state.unlockedBiomes,
    bossKeys: state.stats.bossKeys ?? 0,
    maxUnlockedStagePerBiome: state.maxUnlockedStagePerBiome,
  })));

  // Actions (stable references, won't trigger re-renders)
  const challengeBoss = useGameStore(state => state.challengeBoss);
  const selectStage = useGameStore(state => state.selectStage);
  const toggleAutoAdvance = useGameStore(state => state.toggleAutoAdvance);
  const equipSkill = useGameStore(state => state.equipSkill);
  const changeBiome = useGameStore(state => state.changeBiome);

  const [isHitAnimating, setIsHitAnimating] = useState<boolean>(false);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [logFilter, setLogFilter] = useState<'all' | 'loot' | 'skill' | 'system'>('all');

  const primaryEnemy = currentEnemies.find((e) => e.currentHp > 0) || currentEnemies[0];

  // Monitor primary enemy HP for hit animation
  useEffect(() => {
    if (!primaryEnemy) return;
    
    setIsHitAnimating(true);
    const hitTimer = setTimeout(() => setIsHitAnimating(false), 180);

    return () => clearTimeout(hitTimer);
  }, [primaryEnemy?.currentHp]);

  // Memoized biome and skill lookups
  const currentBiome = useMemo(
    () => BIOMES_CATALOG.find((b) => b.id === currentBiomeId) || BIOMES_CATALOG[0],
    [currentBiomeId]
  );

  const skill1Obj = useMemo(
    () => SKILLS_CATALOG.find((s) => s.id === equippedSlot1SkillId),
    [equippedSlot1SkillId]
  );

  const skill2Obj = useMemo(
    () => SKILLS_CATALOG.find((s) => s.id === equippedSlot2SkillId),
    [equippedSlot2SkillId]
  );

  const slot1Skills = useMemo(() => SKILLS_CATALOG.filter(s => s.slotType === 1), []);
  const slot2Skills = useMemo(() => SKILLS_CATALOG.filter(s => s.slotType === 2), []);

  const playerHpPct = Math.max(0, Math.min(100, (playerCurrentHp / playerMaxHp) * 100));

  const weaponAtk = equippedWeapon ? equippedWeapon.atk : 0;
  const totalAtk = baseAtk + weaponAtk;
  const calculatedDps = Math.round(totalAtk * baseSpd);

  const currentKey = `${currentBiomeId}_${difficulty}`;
  const maxUnlockedStage = maxUnlockedStagePerBiome?.[currentKey] ?? Math.max(biomeStage, 1);
  const canChallengeBoss = maxUnlockedStage >= 10 || biomeStage >= 9;

  const toggleLogs = useCallback(() => setShowLogs(prev => !prev), []);

  return (
    <div className={`flex flex-col bg-gradient-to-b ${currentBiome.bgGradient} text-white p-2 sm:p-5 rounded-xl sm:rounded-2xl shadow-2xl border border-slate-700/60 relative overflow-hidden backdrop-blur-md w-full max-w-full`}>
      {/* Header do Bioma e Dificuldade (Select de Troca Rápida de Mapa) */}
      <div className="flex justify-between items-center bg-black/60 py-1.5 px-2 sm:p-4 rounded-xl border border-white/10 backdrop-blur-md gap-1.5 w-full min-w-0">
        <div className="min-w-0 flex-1 flex items-center gap-1.5">
          <div className="relative min-w-0 max-w-[170px] xs:max-w-[210px] sm:max-w-[260px] flex-1">
            <select
              value={currentBiomeId}
              onChange={(e) => changeBiome(e.target.value)}
              className="bg-slate-950 text-amber-300 font-extrabold text-[11px] sm:text-sm rounded-lg px-2 py-1 pr-6 border border-amber-500/50 hover:border-amber-400 focus:outline-none cursor-pointer appearance-none truncate w-full shadow-inner"
              title="Trocar Mapa"
            >
              {BIOMES_CATALOG.map((b) => {
                const isUnlocked = unlockedBiomes.includes(b.id);
                return (
                  <option
                    key={b.id}
                    value={b.id}
                    disabled={!isUnlocked}
                    className={isUnlocked ? 'bg-slate-950 text-amber-300 font-bold' : 'bg-slate-900 text-slate-500 italic'}
                  >
                    {isUnlocked ? `🗺️ ${b.name}` : `🔒 ${b.name} (Bloqueado)`}
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-amber-400">
              <ChevronDown size={12} />
            </div>
          </div>
          <span className="text-[8px] sm:text-xs px-1.5 py-0.5 rounded bg-red-950 border border-red-500 text-red-400 uppercase font-mono font-bold shrink-0">
            {difficulty}
          </span>
        </div>

        {/* Controles de Modo de Jogo e Boss */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Contador de Chaves do Boss */}
          <div
            className="flex items-center gap-0.5 text-[9px] sm:text-xs px-1.5 py-1 rounded-lg bg-black/70 border border-amber-500/40 text-amber-300 font-mono font-bold shrink-0 shadow-sm"
            title={`Chaves do Boss: ${bossKeys} (Cai de Hollows)`}
          >
            <span>🗝️</span>
            <span>{bossKeys}</span>
          </div>

          <button
            onClick={toggleAutoAdvance}
            className={`text-[9px] sm:text-xs px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg font-bold border transition flex items-center gap-0.5 cursor-pointer hover:scale-105 active:scale-95 shrink-0 ${
              autoAdvance
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-amber-950/80 border-amber-500 text-amber-300'
            }`}
            title="Avançar automático ou ficar na mesma fase"
          >
            {autoAdvance ? '🔄 Auto' : '🛑 Fixo'}
          </button>

          {!isFightingBoss && canChallengeBoss && (
            <button
              onClick={challengeBoss}
              className={`text-[9px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 font-black rounded-lg shadow-lg transition flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 shrink-0 ${
                bossKeys > 0
                  ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white border border-amber-300 ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 opacity-60 cursor-not-allowed'
              }`}
              title={
                bossKeys > 0
                  ? `Desafiar Boss da Fase 10! (Consome 1 Chave - Você possui ${bossKeys})`
                  : 'Precisa de 1 Chave! Derrote Hollows nas Fases 1-9 para pegar.'
              }
            >
              <Skull size={12} className={bossKeys > 0 ? 'text-amber-200 animate-bounce shrink-0' : 'text-slate-500 shrink-0'} />
              <span className="font-extrabold tracking-wide">BOSS</span>
              <span className={`text-[8px] sm:text-[9px] px-1 py-0.2 rounded font-mono font-black ${
                bossKeys > 0 ? 'bg-black/60 text-amber-300' : 'bg-slate-900 text-slate-500'
              }`}>
                -1 🗝️
              </span>
            </button>
          )}
          {isFightingBoss && (
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-xs px-2 py-1 bg-red-600/30 text-red-300 border border-red-500 rounded-lg font-black animate-pulse shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.6)]">
              <Crown size={12} className="text-amber-400 shrink-0" /> BOSS
            </span>
          )}
        </div>
      </div>

      {/* Trilha de 10 Fases */}
      <div className="my-1 sm:my-2.5 bg-black/50 py-1 px-1.5 sm:p-2.5 rounded-xl border border-white/5 flex justify-between items-center gap-1 w-full overflow-hidden">
        <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-300 shrink-0">
          <Swords size={12} className="text-red-400" /> Fase:
        </div>
        <div className="flex gap-1 sm:gap-1.5 items-center w-full justify-between">
          {STAGE_NUMBERS.map((stageNum) => {
            const isCompleted = stageNum < maxUnlockedStage;
            const isCurrent = stageNum === biomeStage;
            const isBoss = stageNum === 10;
            const isUnlocked = stageNum <= maxUnlockedStage || (isBoss && biomeStage >= 9);

            return (
              <button
                key={stageNum}
                onClick={() => isUnlocked && selectStage(stageNum)}
                disabled={!isUnlocked}
                className={`w-[22px] h-[22px] sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-mono font-bold border transition shrink-0 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 border-white text-white scale-110 shadow-lg shadow-amber-500/50 animate-pulse cursor-pointer'
                    : isCompleted
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 hover:bg-emerald-800 hover:scale-110 active:scale-95 cursor-pointer'
                    : isUnlocked
                    ? 'bg-slate-800 border-amber-500/50 text-amber-200 hover:bg-slate-700 hover:border-amber-400 hover:scale-110 active:scale-95 cursor-pointer'
                    : 'bg-slate-950/40 border-slate-900 text-slate-700 opacity-40 cursor-not-allowed select-none'
                }`}
                title={
                  !isUnlocked
                    ? isBoss
                      ? 'Boss (Bloqueado - Chegue na Fase 9 primeiro)'
                      : `Fase ${stageNum} (Bloqueada - Vença a Fase ${stageNum - 1} primeiro)`
                    : isCurrent
                    ? isBoss
                      ? 'Boss da Fase 10 (Em combate!)'
                      : `Fase ${stageNum} (Atual)`
                    : isBoss
                    ? bossKeys > 0
                      ? `Desafiar Boss da Fase 10! (Consome 1 🗝️ - Você possui ${bossKeys})`
                      : `Boss da Fase 10 (Requer 1 🗝️ - Você possui 0)`
                    : `Ir para a Fase ${stageNum}`
                }
              >
                {isBoss ? (isUnlocked ? '👑' : '🔒') : stageNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* Arena de Batalha (Lado a Lado no mobile e desktop) */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-4 my-1 sm:my-2 w-full">
        {/* Lado Esquerdo - Herói */}
        <div className={`bg-slate-950/80 p-2 sm:p-5 rounded-xl sm:rounded-2xl border ${
          playerDeathTimerSec > 0
            ? 'border-red-600/80 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
            : activeBuff
            ? 'border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
            : 'border-cyan-500/40 shadow-xl'
        } flex flex-col items-center justify-between relative overflow-hidden min-h-[250px] sm:min-h-[300px] min-w-0 w-full`}>
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Overlay Sutil de Morte / Recuperação (apenas dentro do card do personagem) */}
          {playerDeathTimerSec > 0 && (
            <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center z-40 p-2 sm:p-3 pointer-events-none">
              <div className="bg-slate-950/95 border border-red-500/80 px-2.5 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-2xl flex flex-col items-center gap-1 text-center max-w-[200px]">
                <span className="text-[10px] sm:text-[11px] font-mono font-extrabold text-red-400 flex items-center gap-1">
                  💀 Derrotado {consecutiveDeaths > 1 && `(${consecutiveDeaths}x)`}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-300 font-mono">
                  Revive em: <strong className="text-red-400 text-xs sm:text-sm font-black">{playerDeathTimerSec.toFixed(1)}s</strong>
                </span>
                {consecutiveDeaths > 1 && (
                  <span className="text-[8px] sm:text-[9px] text-amber-400 font-mono bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.2 rounded">
                    +{((consecutiveDeaths - 1) * 1.5).toFixed(1)}s (Max 8s)
                  </span>
                )}
                {consecutiveDeaths >= 3 && (
                  <span className="text-[8px] sm:text-[9px] text-red-300 font-bold bg-red-950/90 border border-red-700 px-1.5 py-0.2 rounded animate-pulse">
                    🛑 Auto Desativado!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Header do Card do Herói */}
          <div className="w-full flex justify-between items-center mb-1 sm:mb-2 z-10 gap-1 min-w-0">
            <span className="font-extrabold text-cyan-300 text-[10px] sm:text-sm flex items-center gap-1 min-w-0 flex-1">
              <Sparkles size={12} className="text-cyan-400 shrink-0 sm:w-3.5 sm:h-3.5" />
              <span className="truncate">{GAME_THEME.heroTitle}</span>
            </span>
            <span className={`text-[9px] sm:text-xs font-mono px-1 sm:px-2 py-0.5 rounded border font-bold shrink-0 ${
              playerDeathTimerSec > 0
                ? 'text-red-400 bg-red-950/80 border-red-700 animate-pulse'
                : 'text-cyan-200 bg-cyan-950/60 border-cyan-800'
            }`}>
              {playerCurrentHp}/{playerMaxHp}
            </span>
          </div>

          {/* Notificações de Ativação */}
          <div className="absolute top-9 sm:top-12 inset-x-0 flex flex-col items-center gap-1 z-30 pointer-events-none px-2">
            {lastBankaiUsed && Date.now() - lastBankaiUsed.timestamp < 2000 && (
              <div className="flex items-center gap-1 bg-amber-950/95 border border-amber-400/90 px-2 sm:px-3 py-0.5 rounded-full text-[9px] sm:text-[11px] font-extrabold text-amber-300 shadow-xl animate-bounce backdrop-blur-md">
                <span>🔥 卍解 · {lastBankaiUsed.name.replace(/^Bankai:\s*/i, '')}</span>
              </div>
            )}
            {lastSkillUsed && Date.now() - lastSkillUsed.timestamp < 1500 && (
              <div className="flex items-center gap-1 bg-purple-950/95 border border-purple-400/90 px-2 sm:px-3 py-0.5 rounded-full text-[9px] sm:text-[11px] font-extrabold text-purple-200 shadow-xl animate-bounce backdrop-blur-md">
                <Zap size={10} className="text-purple-300 shrink-0" />
                <span className="truncate max-w-[110px]">{lastSkillUsed.name}</span>
              </div>
            )}
          </div>

          {/* Avatar HD Transparente do Herói */}
          <div className="my-auto flex flex-col items-center justify-center z-10">
            <HeroAvatarPixel
              size="responsive"
              isAttacking={isHitAnimating}
              isDead={playerDeathTimerSec > 0}
              isBankai={!!activeBuff}
            />
          </div>

          {/* Barra de Vida Player */}
          <div className="w-full bg-slate-900 h-2.5 sm:h-3.5 rounded-full overflow-hidden border border-cyan-900/60 p-0.5 mt-1 sm:mt-2 mb-1 sm:mb-2 shadow-inner z-10">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                playerDeathTimerSec > 0
                  ? 'w-0 bg-red-950'
                  : 'bg-gradient-to-r from-cyan-600 via-teal-400 to-emerald-400'
              }`}
              style={{ width: `${playerDeathTimerSec > 0 ? 0 : playerHpPct}%` }}
            />
          </div>

          <div className="flex justify-center gap-2 sm:gap-3 text-[9px] sm:text-xs text-cyan-300 font-semibold bg-black/40 px-2 sm:px-3.5 py-0.5 sm:py-1 rounded-full border border-white/5 z-10">
            <span className="flex items-center gap-1 font-bold text-amber-300">
              <Flame size={11} className="text-amber-400" /> {calculatedDps} DPS
            </span>
            <span>⚡ {baseSpd.toFixed(2)}/s</span>
          </div>

          {/* Indicadores compactos de CD no Card do Herói */}
          <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5 z-10 text-[8px] sm:text-[10px] font-mono w-full">
            {skill1Obj && (
              <div className={`px-1.5 py-0.5 rounded border flex items-center gap-1 transition ${
                skill1Cooldown > 0
                  ? 'bg-purple-950/50 border-purple-900/60 text-purple-300/80'
                  : 'bg-purple-950/90 border-purple-500/70 text-purple-200 font-bold'
              }`}>
                <span>⚡:</span>
                {skill1Cooldown > 0 ? (
                  <span className="font-bold text-purple-300 flex items-center gap-0.5">
                    <strong className="text-[7px] sm:text-[8px] bg-purple-500/30 text-purple-200 px-0.5 rounded">CD</strong>
                    {skill1Cooldown.toFixed(1)}s
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">OK</span>
                )}
              </div>
            )}

            {skill2Obj && (
              <div className={`px-1.5 py-0.5 rounded border flex items-center gap-1 transition ${
                activeBuff
                  ? 'bg-amber-950/90 border-amber-400 text-amber-300 font-bold animate-pulse'
                  : skill2Cooldown > 0
                  ? 'bg-amber-950/50 border-amber-900/60 text-amber-300/80'
                  : 'bg-amber-950/90 border-amber-500/70 text-amber-200 font-bold'
              }`}>
                <span>🔥:</span>
                {activeBuff ? (
                  <span className="text-amber-300 font-bold">({activeBuff.durationLeft.toFixed(0)}s)</span>
                ) : skill2Cooldown > 0 ? (
                  <span className="font-bold text-amber-300 flex items-center gap-0.5">
                    <strong className="text-[7px] sm:text-[8px] bg-amber-500/30 text-amber-200 px-0.5 rounded">CD</strong>
                    {skill2Cooldown.toFixed(1)}s
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">OK</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito - Horda Inimiga */}
        <div className={`bg-slate-950/80 p-2 sm:p-5 rounded-xl sm:rounded-2xl border border-red-500/40 shadow-xl flex flex-col justify-between relative overflow-hidden transition duration-150 min-h-[250px] sm:min-h-[300px] min-w-0 w-full ${isHitAnimating ? 'border-red-500 bg-red-950/20' : ''}`}>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
          
          {/* Header do Card da Horda */}
          <div className="text-[9px] sm:text-xs font-bold text-red-400 mb-1 sm:mb-2 uppercase tracking-wider flex items-center justify-between border-b border-red-950/60 pb-1 min-w-0">
            <span className="truncate">
              {isFightingBoss ? 'Guardião / Boss' : `Horda (${currentEnemies.filter(e => e.currentHp > 0).length}/${currentEnemies.length})`}
            </span>
          </div>

          {/* 3 Slots Fixos Anti-CLS */}
          <div className="flex flex-col justify-start gap-1 sm:gap-2 my-auto h-[155px] sm:h-[195px] relative overflow-hidden w-full">
            <DamageOverlay enemyHp={primaryEnemy?.currentHp} />

            {SLOT_INDICES.map((slotIndex) => {
              const enemy = currentEnemies[slotIndex];
              if (!enemy) {
                return (
                  <div
                    key={`empty_slot_${slotIndex}`}
                    className="h-[46px] sm:h-[58px] rounded-lg sm:rounded-xl border border-dashed border-slate-950 bg-black/10 opacity-30 flex items-center justify-center text-[9px] sm:text-[10px] text-slate-700 font-mono"
                  >
                    -- Vazio --
                  </div>
                );
              }

              const isDead = enemy.currentHp <= 0;
              const enemyHpPct = isDead ? 0 : Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100));
              const isCurrentTarget = !isDead && enemy.id === primaryEnemy?.id;

              return (
                <div
                  key={enemy.id}
                  className={`h-[46px] sm:h-[58px] p-1 sm:p-2 rounded-lg sm:rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col justify-between overflow-hidden relative min-w-0 w-full ${
                    isDead
                      ? 'bg-gradient-to-r from-red-950/90 via-black to-red-950/90 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse'
                      : isCurrentTarget
                      ? 'bg-red-950/50 border-red-500/70 shadow-lg scale-[1.01]'
                      : 'bg-black/40 border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-center z-10 gap-1 min-w-0 w-full">
                    <span className={`font-extrabold text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1 ${isDead ? 'text-red-400' : enemy.isBoss ? 'text-amber-400' : 'text-red-300'}`}>
                      <div className={isDead ? 'grayscale opacity-50 scale-90 transition-all duration-300 shrink-0' : 'shrink-0'}>
                        <PixelMobSprite icon={enemy.avatarIcon || '💀'} name={enemy.name} isBoss={enemy.isBoss} size="sm" />
                      </div>
                      <span className={`truncate min-w-0 ${isDead ? 'line-through opacity-75' : ''}`}>{enemy.name}</span>
                      {isDead ? (
                        <span className="text-[7px] sm:text-[9px] bg-red-600 text-white px-1 py-0.2 rounded font-mono font-black shrink-0 animate-bounce shadow-md">
                          💀
                        </span>
                      ) : enemy.isBoss ? (
                        <span className="text-[7px] sm:text-[8px] bg-red-600 text-amber-200 px-1 py-0.2 rounded font-mono font-black shrink-0 border border-amber-400 shadow-sm animate-pulse">
                          👑 CHEFE
                        </span>
                      ) : isCurrentTarget ? (
                        <span className="text-[7px] sm:text-[9px] bg-red-900 text-white px-1 py-0.2 rounded font-mono shrink-0">
                          ALVO
                        </span>
                      ) : null}
                    </span>
                    <span className={`text-[8px] sm:text-[10px] font-mono px-1 sm:px-2 py-0.2 sm:py-0.5 rounded border shrink-0 font-bold ${
                      isDead
                        ? 'text-red-400 bg-red-950 border-red-700 shadow-sm animate-pulse'
                        : 'text-gray-300 bg-black/60 border-white/10'
                    }`}>
                      {isDead ? 0 : enemy.currentHp}/{enemy.maxHp}
                    </span>
                  </div>

                  {/* Barra de Vida individual */}
                  <div className="w-full bg-slate-900 h-1.5 sm:h-2 rounded-full overflow-hidden border border-red-900/60 p-0.5 shadow-inner z-10">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDead
                          ? 'w-0 bg-red-950'
                          : 'bg-gradient-to-r from-red-700 via-red-500 to-amber-500'
                      }`}
                      style={{ width: `${enemyHpPct}%` }}
                    />
                  </div>

                  {/* Efeito visual de desintegração ao morrer */}
                  {isDead && (
                    <div className="absolute inset-0 bg-red-600/10 pointer-events-none animate-ping opacity-25" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-2 sm:gap-4 text-[9px] sm:text-xs font-semibold text-gray-300 bg-black/40 px-2 sm:px-3.5 py-0.5 sm:py-1 rounded-full border border-white/5 mt-1 sm:mt-2">
            <span className="flex items-center gap-1"><Zap size={11} className="text-amber-400" /> ATK:{primaryEnemy?.atk || 0}</span>
            <span className="flex items-center gap-1"><Shield size={11} className="text-blue-400" /> DEF:{primaryEnemy?.def || 0}</span>
          </div>
        </div>
      </div>

      {/* Slots de Habilidade / Troca Rápida */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-3 my-1 sm:my-2 w-full max-w-full overflow-hidden">
        {/* Slot 1: Habilidade / Hadō */}
        {(() => {
          const isSkillRecentlyUsed = !!(lastSkillUsed && Date.now() - lastSkillUsed.timestamp < 1500);
          const maxCd1 = skill1Obj?.cooldownSec || 1;
          const cdPct1 = Math.max(0, Math.min(100, ((maxCd1 - skill1Cooldown) / maxCd1) * 100));

          return (
            <div className={`p-1.5 sm:p-3 rounded-xl border flex flex-col justify-between backdrop-blur-md transition-all duration-300 min-w-0 w-full overflow-hidden ${
              isSkillRecentlyUsed
                ? 'bg-purple-950/90 border-purple-400 ring-2 ring-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.7)] scale-[1.02]'
                : skill1Cooldown > 0
                ? 'bg-black/70 border-purple-950/80 opacity-90'
                : 'bg-black/60 border-purple-500/40 hover:border-purple-500/70'
            }`}>
              {/* Linha superior: Rótulo + Status/CD */}
              <div className="flex items-center justify-between w-full gap-1 mb-1 min-w-0">
                <div className="text-[8px] sm:text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-0.5 min-w-0 truncate">
                  <Zap size={9} className="shrink-0" /> <span className="truncate">Hadō</span>
                </div>

                <div className="shrink-0">
                  {isSkillRecentlyUsed ? (
                    <span className="text-[8px] sm:text-[10px] font-black text-purple-200 bg-purple-900 px-1 sm:px-2 py-0.2 sm:py-0.5 rounded border border-purple-400 shadow-md animate-bounce">
                      ATIVOU!
                    </span>
                  ) : skill1Cooldown > 0 ? (
                    <div className="flex items-center gap-0.5 bg-purple-950/90 text-purple-300 px-1 sm:px-2 py-0.2 sm:py-0.5 rounded border border-purple-500/70 font-mono text-[8px] sm:text-xs font-bold shadow-inner">
                      <span className="text-[6px] sm:text-[8px] font-black bg-purple-500/30 text-purple-200 px-0.5 rounded">CD</span>
                      <span>{skill1Cooldown.toFixed(1)}s</span>
                    </div>
                  ) : (
                    <span className="text-[8px] sm:text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-1 sm:px-2 py-0.2 sm:py-0.5 rounded border border-emerald-500 shadow-md flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                      PRONTO
                    </span>
                  )}
                </div>
              </div>

              {/* Linha do Meio: Dropdown select */}
              <div className="relative w-full min-w-0 overflow-hidden">
                <select
                  value={equippedSlot1SkillId || ''}
                  onChange={(e) => equipSkill(e.target.value, 1)}
                  style={{ maxWidth: '100%' }}
                  className="w-full max-w-full bg-slate-950/90 hover:bg-slate-900 text-white font-extrabold text-[9px] sm:text-xs rounded-lg px-1.5 py-1 border border-purple-500/50 hover:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer transition truncate pr-5 appearance-none shadow-inner"
                  title="Trocar Habilidade"
                >
                  {slot1Skills.map((s) => {
                    const isUnlocked = !!ownedSkills[s.id]?.unlocked;
                    const cleanName = s.name.length > 20 ? `${s.name.slice(0, 18)}...` : s.name;
                    return (
                      <option
                        key={s.id}
                        value={s.id}
                        disabled={!isUnlocked}
                        className={isUnlocked ? 'bg-slate-950 text-white font-medium' : 'bg-slate-900 text-slate-500 italic'}
                      >
                        {isUnlocked ? `⚡ ${cleanName} (${s.cooldownSec}s)` : `🔒 ${cleanName}`}
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-purple-400">
                  <ChevronDown size={11} />
                </div>
              </div>

              {/* Barra de Recarga (CD Progress) */}
              {skill1Obj && (
                <div className="w-full bg-slate-900/80 h-1 sm:h-1.5 rounded-full overflow-hidden mt-1 border border-purple-950/60">
                  <div
                    className={`h-full transition-all duration-100 ${
                      skill1Cooldown > 0 ? 'bg-gradient-to-r from-purple-700 to-purple-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${cdPct1}%` }}
                  />
                </div>
              )}
            </div>
          );
        })()}

        {/* Slot 2: Bankai */}
        {(() => {
          const isBankaiActive = !!activeBuff;
          const isBankaiJustFired = !!(lastBankaiUsed && Date.now() - lastBankaiUsed.timestamp < 2000);
          const maxCd2 = skill2Obj?.cooldownSec || 1;
          const cdPct2 = isBankaiActive
            ? Math.max(0, Math.min(100, (activeBuff.durationLeft / (skill2Obj?.durationSec || 10)) * 100))
            : Math.max(0, Math.min(100, ((maxCd2 - skill2Cooldown) / maxCd2) * 100));

          return (
            <div className={`p-1.5 sm:p-3 rounded-xl border flex flex-col justify-between backdrop-blur-md transition-all duration-300 min-w-0 w-full overflow-hidden ${
              isBankaiActive || isBankaiJustFired
                ? 'bg-gradient-to-r from-amber-950/90 via-black to-red-950/90 border-amber-400 ring-2 ring-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.8)] animate-pulse'
                : skill2Cooldown > 0
                ? 'bg-black/70 border-amber-950/80 opacity-90'
                : 'bg-black/60 border-amber-500/40 hover:border-amber-500/70'
            }`}>
              {/* Linha superior: Rótulo + Status/CD */}
              <div className="flex items-center justify-between w-full gap-1 mb-1 min-w-0">
                <div className="text-[8px] sm:text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-0.5 min-w-0 truncate">
                  <Flame size={9} className="shrink-0" /> <span className="truncate">Bankai</span>
                </div>

                <div className="shrink-0">
                  {isBankaiActive ? (
                    <span className="text-[8px] sm:text-[10px] font-black text-amber-300 bg-amber-950 px-1 sm:px-2 py-0.2 sm:py-0.5 rounded border border-amber-400 shadow-lg animate-pulse flex items-center gap-0.5">
                      ATIVA ({activeBuff.durationLeft.toFixed(0)}s)
                    </span>
                  ) : skill2Cooldown > 0 ? (
                    <div className="flex items-center gap-0.5 bg-amber-950/90 text-amber-300 px-1 sm:px-2 py-0.2 sm:py-0.5 rounded border border-amber-500/70 font-mono text-[8px] sm:text-xs font-bold shadow-inner">
                      <span className="text-[6px] sm:text-[8px] font-black bg-amber-500/30 text-amber-200 px-0.5 rounded">CD</span>
                      <span>{skill2Cooldown.toFixed(1)}s</span>
                    </div>
                  ) : (
                    <span className="text-[8px] sm:text-[10px] font-bold text-amber-300 bg-amber-950/90 px-1 sm:px-2 py-0.2 sm:py-0.5 rounded border border-amber-500 shadow-md flex items-center gap-1 animate-pulse">
                      <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping" />
                      PRONTO
                    </span>
                  )}
                </div>
              </div>

              {/* Linha do Meio: Dropdown select */}
              <div className="relative w-full min-w-0 overflow-hidden">
                <select
                  value={equippedSlot2SkillId || ''}
                  onChange={(e) => equipSkill(e.target.value, 2)}
                  style={{ maxWidth: '100%' }}
                  className="w-full max-w-full bg-slate-950/90 hover:bg-slate-900 text-white font-extrabold text-[9px] sm:text-xs rounded-lg px-1.5 py-1 border border-amber-500/50 hover:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer transition truncate pr-5 appearance-none shadow-inner"
                  title="Trocar Bankai"
                >
                  {slot2Skills.map((s) => {
                    const isUnlocked = !!ownedSkills[s.id]?.unlocked;
                    const cleanName = s.name.length > 20 ? `${s.name.slice(0, 18)}...` : s.name;
                    return (
                      <option
                        key={s.id}
                        value={s.id}
                        disabled={!isUnlocked}
                        className={isUnlocked ? 'bg-slate-950 text-white font-medium' : 'bg-slate-900 text-slate-500 italic'}
                      >
                        {isUnlocked ? `🔥 ${cleanName} (${s.cooldownSec}s)` : `🔒 ${cleanName}`}
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-amber-400">
                  <ChevronDown size={11} />
                </div>
              </div>

              {/* Barra de Recarga (CD Progress) */}
              {skill2Obj && (
                <div className="w-full bg-slate-900/80 h-1 sm:h-1.5 rounded-full overflow-hidden mt-1 border border-amber-950/60">
                  <div
                    className={`h-full transition-all duration-100 ${
                      isBankaiActive
                        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500'
                        : skill2Cooldown > 0
                        ? 'bg-gradient-to-r from-amber-700 to-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${cdPct2}%` }}
                  />
                </div>
              )}
            </div>
          );
        })()}
      </div>


      {/* Log de Batalha Minimizável */}
      <div className="mt-2 bg-black/80 rounded-xl border border-white/10 overflow-hidden shadow-inner transition-all duration-300">
        <button
          onClick={toggleLogs}
          className="w-full p-2.5 bg-slate-950/90 hover:bg-slate-900 text-xs text-slate-300 font-mono font-bold flex justify-between items-center px-4 cursor-pointer border-b border-white/5"
        >
          <span className="flex items-center gap-2">
            {showLogs ? <EyeOff size={14} className="text-amber-400" /> : <Eye size={14} className="text-slate-400" />}
            Log de Batalha {showLogs ? '(Aberto)' : '(Oculto)'}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            {showLogs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>

        {showLogs && (
          <div className="flex flex-col">
            {/* Barra de Filtro do Log */}
            <div className="flex items-center gap-1 p-2 bg-slate-950/80 border-b border-white/5 overflow-x-auto">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'loot', label: '💎 Drops' },
                { id: 'skill', label: '⚡ Habilidades' },
                { id: 'system', label: '📜 Sistema' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setLogFilter(f.id as any)}
                  className={`text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-bold transition cursor-pointer shrink-0 ${
                    logFilter === f.id
                      ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                      : 'bg-black/50 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="p-3 h-52 sm:h-64 overflow-y-auto flex flex-col-reverse text-xs font-mono gap-1.5" role="log" aria-live="polite">
              {(() => {
                const filtered = logs.filter((log) => {
                  if (logFilter === 'all') return true;
                  if (logFilter === 'loot') return log.type === 'loot';
                  if (logFilter === 'skill') return log.type === 'skill';
                  if (logFilter === 'system') return log.type === 'system' || log.type === 'victory';
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-slate-500 text-[10px] text-center italic py-4">
                      Nenhum registro por aqui.
                    </div>
                  );
                }

                return filtered.map((log) => (
                  <div
                    key={log.id}
                    className={`py-1 px-2.5 rounded-lg border ${
                      log.type === 'skill'
                        ? 'text-purple-300 bg-purple-950/40 border-purple-800/40'
                        : log.type === 'loot'
                        ? 'text-amber-300 bg-amber-950/50 border-amber-800/50 font-bold'
                        : log.type === 'victory'
                        ? 'text-emerald-300 bg-emerald-950/50 border-emerald-800/50 font-bold'
                        : 'text-gray-300 border-transparent'
                    }`}
                  >
                    <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
                    {log.text}
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
