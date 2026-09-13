import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { BIOMES_CATALOG, SKILLS_CATALOG } from '../data/gameCatalog';
import { GAME_THEME } from '../config/themeConfig';
import { HeroAvatarPixel } from './HeroAvatarPixel';
import { PixelMobSprite } from './PixelMobSprite';
import { Shield, Zap, Sparkles, Skull, Crown, Flame, Swords, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import type { FloatingDamage } from '../types/game';

export const BattleScreen: React.FC = () => {
  const {
    stats,
    currentEnemies,
    playerCurrentHp,
    playerMaxHp,
    currentBiomeId,
    difficulty,
    biomeStage,
    isFightingBoss,
    autoAdvance,
    logs,
    challengeBoss,
    selectStage,
    toggleAutoAdvance,
    skill1Cooldown,
    skill2Cooldown,
    equippedSlot1SkillId,
    equippedSlot2SkillId,
    equippedWeapon,
  } = useGameStore();

  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
  const [isHitAnimating, setIsHitAnimating] = useState<boolean>(false);
  const [showLogs, setShowLogs] = useState<boolean>(false); // Log opcional (padrão minimizado)

  const primaryEnemy = currentEnemies[0];

  // Monitora alterações na vida do inimigo primário para gerar números de dano flutuantes e feedback de morte
  useEffect(() => {
    if (!primaryEnemy) return;
    
    setIsHitAnimating(true);
    const hitTimer = setTimeout(() => setIsHitAnimating(false), 180);

    // Dispara animação de número flutuante de dano quando o mob recebe um golpe
    const newDmg: FloatingDamage = {
      id: `dmg_${Date.now()}_${Math.random()}`,
      damage: Math.round(stats.baseAtk * (equippedWeapon ? 1 + equippedWeapon.atk / 50 : 1)),
      isCrit: Math.random() < 0.25,
      isSkill: false,
      xOffset: (Math.random() - 0.5) * 40,
    };

    setFloatingDamages((prev) => [...prev.slice(-3), newDmg]);

    const timer = setTimeout(() => {
      setFloatingDamages((prev) => prev.filter((d) => d.id !== newDmg.id));
    }, 900);

    return () => {
      clearTimeout(timer);
      clearTimeout(hitTimer);
    };
  }, [primaryEnemy?.currentHp]);

  const currentBiome = BIOMES_CATALOG.find((b) => b.id === currentBiomeId) || BIOMES_CATALOG[0];

  // Formatação dos nomes das habilidades equipadas usando o catálogo
  const skill1Obj = SKILLS_CATALOG.find((s) => s.id === equippedSlot1SkillId);
  const skill2Obj = SKILLS_CATALOG.find((s) => s.id === equippedSlot2SkillId);

  const playerHpPct = Math.max(0, Math.min(100, (playerCurrentHp / playerMaxHp) * 100));

  // Cálculo de DPS Estimado em Tempo Real
  const weaponAtk = equippedWeapon ? equippedWeapon.atk : 0;
  const totalAtk = stats.baseAtk + weaponAtk;
  const calculatedDps = Math.round(totalAtk * stats.baseSpd);

  const canChallengeBoss = biomeStage >= 9;

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

        {/* Controles de Modo de Jogo (Auto-Avançar & Trava do Boss) */}
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

      {/* Visual da Horda de Inimigos (Trilha de 10 Fases Neon Glowing) */}
      <div className="my-3 bg-black/50 p-2.5 sm:p-3 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Swords size={15} className="text-red-400" /> Progresso da Horda:
        </div>
        <div className="flex gap-1.5 sm:gap-2 items-center w-full sm:w-auto justify-between">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((stageNum) => {
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

      {/* Arena de Batalha (Duelo Espelhado Anti-CLS: Herói vs Horda) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
        {/* Lado Esquerdo - Herói (Shinigami Substituto) */}
        <div className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-cyan-500/40 shadow-xl flex flex-col items-center justify-between relative overflow-hidden min-h-[300px]">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-full flex justify-between items-center mb-2">
            <span className="font-extrabold text-cyan-300 text-sm sm:text-base flex items-center gap-1.5">
              <Sparkles size={16} className="text-cyan-400" /> {GAME_THEME.heroTitle}
            </span>
            <span className="text-xs font-mono text-cyan-200 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800 font-bold">
              {playerCurrentHp} / {playerMaxHp} HP
            </span>
          </div>

          {/* Avatar HD Transparente do Herói */}
          <div className="my-auto flex flex-col items-center justify-center">
            <HeroAvatarPixel size="md" isAttacking={isHitAnimating} />
          </div>

          {/* Barra de Vida Player */}
          <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden border border-cyan-900/60 p-0.5 mt-2 mb-2 shadow-inner">
            <div
              className="bg-gradient-to-r from-cyan-600 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-200"
              style={{ width: `${playerHpPct}%` }}
            />
          </div>

          <div className="flex justify-center gap-3 text-xs text-cyan-300 font-semibold bg-black/40 px-3.5 py-1 rounded-full border border-white/5">
            <span className="flex items-center gap-1 font-bold text-amber-300">
              <Flame size={13} className="text-amber-400" /> {calculatedDps} DPS
            </span>
            <span>⚡ {stats.baseSpd.toFixed(2)}/s</span>
          </div>
        </div>

        {/* Lado Direito - Horda Inimiga (ALTURA FIXA MIN-H PARA 100% ELIMINAR CLS) */}
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

          {/* Área Central Estável dos Mobs (Slots Pré-alocados para evitar trepidação) */}
          <div className="flex flex-col justify-center gap-2.5 my-auto min-h-[170px] relative">
            {/* Números Flutuantes de Dano posicionados com precisão */}
            <div className="absolute -top-4 left-0 right-0 flex justify-center pointer-events-none z-30">
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

            {/* Mobs da Horda */}
            {currentEnemies.map((enemy, idx) => {
              const enemyHpPct = Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100));
              return (
                <div
                  key={enemy.id}
                  className={`p-2.5 rounded-xl border backdrop-blur-md transition-all duration-150 ${
                    idx === 0
                      ? 'bg-red-950/50 border-red-500/70 shadow-lg scale-[1.01]'
                      : 'bg-black/40 border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-extrabold text-xs flex items-center gap-2 ${enemy.isBoss ? 'text-amber-400' : 'text-red-300'}`}>
                      <PixelMobSprite icon={enemy.avatarIcon || '💀'} name={enemy.name} isBoss={enemy.isBoss} size="sm" />
                      <span>{enemy.name}</span>
                      {idx === 0 && (
                        <span className="text-[9px] bg-red-900 text-white px-1.5 py-0.2 rounded font-mono">
                          ALVO
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-gray-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                      {enemy.currentHp} / {enemy.maxHp} HP
                    </span>
                  </div>

                  {/* Barra de Vida individual */}
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-red-900/60 p-0.5 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-red-700 via-red-500 to-amber-500 h-full rounded-full transition-all duration-150"
                      style={{ width: `${enemyHpPct}%` }}
                    />
                  </div>
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

      {/* Slots de Habilidade com Nomes Formatados de gameCatalog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
        {/* Slot 1 Skill */}
        <div className="bg-black/60 p-3 rounded-xl border border-purple-500/40 flex items-center justify-between backdrop-blur-md">
          <div>
            <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">{GAME_THEME.skillSlot1Label}</div>
            <div className="text-xs sm:text-sm font-extrabold text-white mt-0.5">
              {skill1Obj ? skill1Obj.name : 'Nenhuma Habilidade Equipada'}
            </div>
          </div>
          {skill1Cooldown > 0 ? (
            <span className="text-xs font-mono bg-purple-950/90 text-purple-300 px-2.5 py-1 rounded-lg border border-purple-500 font-bold">
              {skill1Cooldown.toFixed(1)}s
            </span>
          ) : (
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/90 px-2.5 py-1 rounded-lg border border-emerald-500 shadow-md">
              PRONTO
            </span>
          )}
        </div>

        {/* Slot 2 Ultimate */}
        <div className="bg-black/60 p-3 rounded-xl border border-amber-500/40 flex items-center justify-between backdrop-blur-md">
          <div>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{GAME_THEME.skillSlot2Label}</div>
            <div className="text-xs sm:text-sm font-extrabold text-white mt-0.5">
              {skill2Obj ? skill2Obj.name : 'Nenhuma Bankai Equipada'}
            </div>
          </div>
          {skill2Cooldown > 0 ? (
            <span className="text-xs font-mono bg-amber-950/90 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500 font-bold">
              {skill2Cooldown.toFixed(1)}s
            </span>
          ) : (
            <span className="text-[11px] font-bold text-amber-300 bg-amber-950/90 px-2.5 py-1 rounded-lg border border-amber-500 shadow-md animate-pulse">
              PRONTO
            </span>
          )}
        </div>
      </div>

      {/* Log de Batalha Minimizável (Opcional) */}
      <div className="mt-2 bg-black/80 rounded-xl border border-white/10 overflow-hidden shadow-inner transition-all duration-300">
        <button
          onClick={() => setShowLogs(!showLogs)}
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
          <div className="p-3 h-32 overflow-y-auto flex flex-col-reverse text-xs font-mono gap-1.5">
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
