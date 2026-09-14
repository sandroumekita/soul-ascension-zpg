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
  })));

  // Actions (stable references, won't trigger re-renders)
  const challengeBoss = useGameStore(state => state.challengeBoss);
  const selectStage = useGameStore(state => state.selectStage);
  const toggleAutoAdvance = useGameStore(state => state.toggleAutoAdvance);

  const [isHitAnimating, setIsHitAnimating] = useState<boolean>(false);
  const [showLogs, setShowLogs] = useState<boolean>(false);

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

  const playerHpPct = Math.max(0, Math.min(100, (playerCurrentHp / playerMaxHp) * 100));

  const weaponAtk = equippedWeapon ? equippedWeapon.atk : 0;
  const totalAtk = baseAtk + weaponAtk;
  const calculatedDps = Math.round(totalAtk * baseSpd);

  const canChallengeBoss = biomeStage >= 9;

  const toggleLogs = useCallback(() => setShowLogs(prev => !prev), []);

  return (
    <div className={`flex flex-col bg-gradient-to-b ${currentBiome.bgGradient} text-white p-3 sm:p-5 rounded-2xl shadow-2xl border border-slate-700/60 relative overflow-hidden backdrop-blur-md`}>
      {/* Header do Bioma e Dificuldade */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-black/60 p-3.5 sm:p-4 rounded-xl border border-white/10 backdrop-blur-md gap-3">
        <div>
          <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase block mb-0.5">{currentBiome.japaneseName}</span>
          <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
            {currentBiome.name}
            <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500 text-red-400 uppercase font-mono tracking-wider font-bold">
              {difficulty}
            </span>
          </h2>
        </div>

        {/* Controles de Modo de Jogo */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5">
          <button
            onClick={toggleAutoAdvance}
            className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 ${
              autoAdvance
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-amber-950/80 border-amber-500 text-amber-300'
            }`}
            title="Alternar entre avançar horda ou farmar no mesmo estágio"
          >
            {autoAdvance ? '🔄 Horda Contínua ON' : '🛑 Farm Fixo (Parado)'}
          </button>

          {!isFightingBoss && canChallengeBoss && (
            <button
              onClick={challengeBoss}
              className="text-xs px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-lg shadow-lg transition flex items-center gap-1.5 animate-pulse cursor-pointer hover:scale-105 active:scale-95"
              title="Desafiar Boss da Fase 10!"
            >
              <Skull size={14} /> Desafiar Boss!
            </button>
          )}
          {isFightingBoss && (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-lg font-bold animate-pulse">
              <Crown size={14} /> LUTA DE BOSS
            </span>
          )}
        </div>
      </div>

      {/* Trilha de 10 Fases */}
      <div className="my-3 bg-black/50 p-2.5 sm:p-3 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Swords size={15} className="text-red-400" /> Progresso da Horda:
        </div>
        <div className="flex gap-1.5 sm:gap-2 items-center w-full sm:w-auto justify-between">
          {STAGE_NUMBERS.map((stageNum) => {
            const isCompleted = stageNum < biomeStage;
            const isCurrent = stageNum === biomeStage;
            return (
              <button
                key={stageNum}
                onClick={() => selectStage(stageNum)}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border transition cursor-pointer hover:scale-115 active:scale-95 ${
                  isCompleted
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 hover:bg-emerald-800'
                    : isCurrent
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 border-white text-white scale-110 shadow-lg shadow-amber-500/50 animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-600'
                }`}
                title={`Ir para o Estágio ${stageNum}`}
              >
                {stageNum === 10 ? '👑' : stageNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* Arena de Batalha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
        {/* Lado Esquerdo - Herói */}
        <div className={`bg-slate-950/80 p-4 sm:p-5 rounded-2xl border ${
          playerDeathTimerSec > 0
            ? 'border-red-600/80 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
            : activeBuff
            ? 'border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
            : 'border-cyan-500/40 shadow-xl'
        } flex flex-col items-center justify-between relative overflow-hidden min-h-[300px]`}>
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Notificação Sutil de Bankai (apenas dentro do card do personagem) */}
          {lastBankaiUsed && Date.now() - lastBankaiUsed.timestamp < 2000 && (
            <div className="absolute top-11 z-30 pointer-events-none flex items-center gap-1 bg-amber-950/90 border border-amber-400/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-300 shadow-md animate-bounce">
              <span>🔥 卍解 · {lastBankaiUsed.name}</span>
            </div>
          )}

          {/* Notificação Sutil de Habilidade (apenas dentro do card do personagem) */}
          {lastSkillUsed && Date.now() - lastSkillUsed.timestamp < 1500 && (
            <div className="absolute top-11 z-30 pointer-events-none flex items-center gap-1 bg-purple-950/90 border border-purple-400/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-200 shadow-md animate-bounce">
              <Zap size={11} className="text-purple-300" />
              <span>{lastSkillUsed.name}</span>
            </div>
          )}

          {/* Overlay Sutil de Morte / Recuperação (apenas dentro do card do personagem) */}
          {playerDeathTimerSec > 0 && (
            <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center z-30 p-3 pointer-events-none">
              <div className="bg-slate-950/95 border border-red-500/80 px-4 py-2.5 rounded-xl shadow-2xl flex flex-col items-center gap-1 text-center">
                <span className="text-[11px] font-mono font-extrabold text-red-400 flex items-center gap-1.5">
                  💀 Shinigami Derrotado
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  Recuperando em: <strong className="text-red-400 text-sm font-black">{playerDeathTimerSec.toFixed(1)}s</strong>
                </span>
              </div>
            </div>
          )}

          <div className="w-full flex justify-between items-center mb-2 z-10">
            <span className="font-extrabold text-cyan-300 text-sm sm:text-base flex items-center gap-1.5">
              <Sparkles size={16} className="text-cyan-400" /> {GAME_THEME.heroTitle}
              {activeBuff && (
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-full font-bold animate-pulse flex items-center gap-1">
                  🔥 BANKAI ({activeBuff.durationLeft.toFixed(0)}s)
                </span>
              )}
            </span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded border font-bold ${
              playerDeathTimerSec > 0
                ? 'text-red-400 bg-red-950/80 border-red-700 animate-pulse'
                : 'text-cyan-200 bg-cyan-950/60 border-cyan-800'
            }`}>
              {playerCurrentHp} / {playerMaxHp} HP
            </span>
          </div>

          {/* Avatar HD Transparente do Herói */}
          <div className="my-auto flex flex-col items-center justify-center z-10">
            <HeroAvatarPixel
              size="md"
              isAttacking={isHitAnimating}
              isDead={playerDeathTimerSec > 0}
              isBankai={!!activeBuff}
            />
          </div>

          {/* Barra de Vida Player */}
          <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden border border-cyan-900/60 p-0.5 mt-2 mb-2 shadow-inner z-10">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                playerDeathTimerSec > 0
                  ? 'w-0 bg-red-950'
                  : 'bg-gradient-to-r from-cyan-600 via-teal-400 to-emerald-400'
              }`}
              style={{ width: `${playerDeathTimerSec > 0 ? 0 : playerHpPct}%` }}
            />
          </div>

          <div className="flex justify-center gap-3 text-xs text-cyan-300 font-semibold bg-black/40 px-3.5 py-1 rounded-full border border-white/5 z-10">
            <span className="flex items-center gap-1 font-bold text-amber-300">
              <Flame size={13} className="text-amber-400" /> {calculatedDps} DPS
            </span>
            <span>⚡ {baseSpd.toFixed(2)}/s</span>
          </div>
        </div>

        {/* Lado Direito - Horda Inimiga */}
        <div className={`bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-red-500/40 shadow-xl flex flex-col justify-between relative overflow-hidden transition duration-150 min-h-[300px] ${isHitAnimating ? 'border-red-500 bg-red-950/20' : ''}`}>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
          
          {/* Header do Card da Horda */}
          <div className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider flex items-center justify-between border-b border-red-950/60 pb-1.5">
            <span>{GAME_THEME.enemyFactionName} ({currentEnemies.length})</span>
            {currentEnemies.length > 1 && (
              <span className="text-[10px] bg-red-950 px-2 py-0.5 rounded border border-red-800 text-amber-300 font-mono">
                💥 Horda AoE
              </span>
            )}
          </div>

          {/* 3 Slots Fixos Anti-CLS */}
          <div className="flex flex-col justify-start gap-2 my-auto h-[195px] relative overflow-hidden">
            <DamageOverlay enemyHp={primaryEnemy?.currentHp} />

            {SLOT_INDICES.map((slotIndex) => {
              const enemy = currentEnemies[slotIndex];
              if (!enemy) {
                return (
                  <div
                    key={`empty_slot_${slotIndex}`}
                    className="h-[58px] rounded-xl border border-dashed border-slate-950 bg-black/10 opacity-30 flex items-center justify-center text-[10px] text-slate-700 font-mono"
                  >
                    -- Slot Vazio --
                  </div>
                );
              }

              const isDead = enemy.currentHp <= 0;
              const enemyHpPct = isDead ? 0 : Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100));
              const isCurrentTarget = !isDead && enemy.id === primaryEnemy?.id;

              return (
                <div
                  key={enemy.id}
                  className={`h-[58px] p-2 rounded-xl border backdrop-blur-md transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
                    isDead
                      ? 'bg-gradient-to-r from-red-950/90 via-black to-red-950/90 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse'
                      : isCurrentTarget
                      ? 'bg-red-950/50 border-red-500/70 shadow-lg scale-[1.01]'
                      : 'bg-black/40 border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-center z-10">
                    <span className={`font-extrabold text-xs flex items-center gap-1.5 ${isDead ? 'text-red-400' : enemy.isBoss ? 'text-amber-400' : 'text-red-300'}`}>
                      <div className={isDead ? 'grayscale opacity-50 scale-90 transition-all duration-300' : ''}>
                        <PixelMobSprite icon={enemy.avatarIcon || '💀'} name={enemy.name} isBoss={enemy.isBoss} size="sm" />
                      </div>
                      <span className={`truncate max-w-[120px] sm:max-w-[150px] ${isDead ? 'line-through opacity-75' : ''}`}>{enemy.name}</span>
                      {isDead ? (
                        <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-mono font-black shrink-0 animate-bounce shadow-md">
                          💀 ELIMINADO
                        </span>
                      ) : isCurrentTarget ? (
                        <span className="text-[9px] bg-red-900 text-white px-1.5 py-0.2 rounded font-mono shrink-0">
                          ALVO
                        </span>
                      ) : null}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 font-bold ${
                      isDead
                        ? 'text-red-400 bg-red-950 border-red-700 shadow-sm animate-pulse'
                        : 'text-gray-300 bg-black/60 border-white/10'
                    }`}>
                      {isDead ? 0 : enemy.currentHp} / {enemy.maxHp} HP
                    </span>
                  </div>

                  {/* Barra de Vida individual */}
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-red-900/60 p-0.5 shadow-inner z-10">
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

          <div className="flex justify-center gap-4 text-xs font-semibold text-gray-300 bg-black/40 px-3.5 py-1 rounded-full border border-white/5 mt-2">
            <span className="flex items-center gap-1"><Zap size={13} className="text-amber-400" /> ATK: {primaryEnemy?.atk || 0}</span>
            <span className="flex items-center gap-1"><Shield size={13} className="text-blue-400" /> DEF: {primaryEnemy?.def || 0}</span>
          </div>
        </div>
      </div>

      {/* Slots de Habilidade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
        {/* Slot 1: Habilidade / Hadō */}
        {(() => {
          const isSkillRecentlyUsed = !!(lastSkillUsed && Date.now() - lastSkillUsed.timestamp < 1500);
          return (
            <div className={`p-3 rounded-xl border flex items-center justify-between backdrop-blur-md transition-all duration-300 ${
              isSkillRecentlyUsed
                ? 'bg-purple-950/90 border-purple-400 ring-2 ring-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.7)] scale-[1.02]'
                : 'bg-black/60 border-purple-500/40'
            }`}>
              <div>
                <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Zap size={11} /> {GAME_THEME.skillSlot1Label}
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white mt-0.5">
                  {skill1Obj ? skill1Obj.name : 'Nenhuma Habilidade Equipada'}
                </div>
              </div>
              {isSkillRecentlyUsed ? (
                <span className="text-[11px] font-black text-purple-200 bg-purple-900 px-2.5 py-1 rounded-lg border border-purple-400 shadow-md animate-bounce">
                  ⚡ DISPARADA!
                </span>
              ) : skill1Cooldown > 0 ? (
                <span className="text-xs font-mono bg-purple-950/90 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-500 font-bold">
                  {skill1Cooldown.toFixed(1)}s
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/90 px-2.5 py-1 rounded-lg border border-emerald-500 shadow-md">
                  PRONTO
                </span>
              )}
            </div>
          );
        })()}

        {/* Slot 2: Bankai */}
        {(() => {
          const isBankaiActive = !!activeBuff;
          const isBankaiJustFired = !!(lastBankaiUsed && Date.now() - lastBankaiUsed.timestamp < 2000);
          return (
            <div className={`p-3 rounded-xl border flex items-center justify-between backdrop-blur-md transition-all duration-300 ${
              isBankaiActive || isBankaiJustFired
                ? 'bg-gradient-to-r from-amber-950/90 via-black to-red-950/90 border-amber-400 ring-2 ring-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.8)] animate-pulse'
                : 'bg-black/60 border-amber-500/40'
            }`}>
              <div>
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Flame size={11} /> {GAME_THEME.skillSlot2Label}
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-white mt-0.5">
                  {skill2Obj ? skill2Obj.name : 'Nenhuma Bankai Equipada'}
                </div>
              </div>
              {isBankaiActive ? (
                <span className="text-[11px] font-black text-amber-300 bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-400 shadow-lg animate-pulse flex items-center gap-1">
                  🔥 ATIVA ({activeBuff.durationLeft.toFixed(1)}s)
                </span>
              ) : skill2Cooldown > 0 ? (
                <span className="text-xs font-mono bg-amber-950/90 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500 font-bold">
                  {skill2Cooldown.toFixed(1)}s
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-300 bg-amber-950/90 px-2.5 py-1 rounded-lg border border-amber-500 shadow-md animate-pulse">
                  PRONTO
                </span>
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
            Log de Batalha {showLogs ? '(Aberto)' : '(Minimizado)'}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            {showLogs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>

        {showLogs && (
          <div className="p-3 h-32 overflow-y-auto flex flex-col-reverse text-xs font-mono gap-1.5" role="log" aria-live="polite">
            {logs.map((log) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
