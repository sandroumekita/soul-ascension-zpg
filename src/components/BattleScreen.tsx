import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { BIOMES_CATALOG } from '../data/gameCatalog';
import { GAME_THEME } from '../config/themeConfig';
import { HeroAvatarPixel } from './HeroAvatarPixel';
import { Shield, Zap, Sparkles, Skull, Crown, Flame, Swords } from 'lucide-react';
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
    toggleAutoAdvance,
    skill1Cooldown,
    skill2Cooldown,
    equippedSlot1SkillId,
    equippedSlot2SkillId,
    equippedWeapon,
  } = useGameStore();

  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
  const [isHitAnimating, setIsHitAnimating] = useState<boolean>(false);

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
      xOffset: (Math.random() - 0.5) * 60,
    };

    setFloatingDamages((prev) => [...prev.slice(-4), newDmg]);

    const timer = setTimeout(() => {
      setFloatingDamages((prev) => prev.filter((d) => d.id !== newDmg.id));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hitTimer);
    };
  }, [primaryEnemy?.currentHp]);

  const currentBiome = BIOMES_CATALOG.find((b) => b.id === currentBiomeId) || BIOMES_CATALOG[0];

  const playerHpPct = Math.max(0, Math.min(100, (playerCurrentHp / playerMaxHp) * 100));

  // Cálculo de DPS Estimado em Tempo Real
  const weaponAtk = equippedWeapon ? equippedWeapon.atk : 0;
  const totalAtk = stats.baseAtk + weaponAtk;
  const calculatedDps = Math.round(totalAtk * stats.baseSpd);

  const canChallengeBoss = biomeStage >= 9;

  return (
    <div className={`flex flex-col bg-gradient-to-b ${currentBiome.bgGradient} text-white p-5 rounded-2xl shadow-2xl border border-slate-700/60 relative overflow-hidden backdrop-blur-md`}>
      {/* Header do Bioma e Dificuldade */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-black/60 p-4 rounded-xl border border-white/10 backdrop-blur-md gap-3">
        <div>
          <span className="text-xs text-amber-400 font-semibold tracking-widest uppercase block">{currentBiome.japaneseName}</span>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            {currentBiome.name}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500 text-red-400 uppercase font-mono tracking-wider font-bold">
              {difficulty}
            </span>
          </h2>
        </div>

        {/* Controles de Modo de Jogo (Auto-Avançar & Trava do Boss) */}
        <div className="flex flex-col sm:items-end gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAutoAdvance}
              className={`text-xs px-3 py-1 rounded-lg font-bold border transition flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 ${
                autoAdvance
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-amber-950/80 border-amber-500 text-amber-300'
              }`}
              title="Alternar entre avançar horda ou farmar no mesmo estágio"
            >
              {autoAdvance ? '🔄 Horda Contínua ON' : '🛑 Farm Fixo (Parado)'}
            </button>

            <div className="text-sm font-semibold text-gray-300">
              Fase: <span className="text-amber-400 font-bold text-base">{biomeStage} / 10</span>
            </div>
          </div>

          {!isFightingBoss && canChallengeBoss && (
            <button
              onClick={challengeBoss}
              className="text-xs px-4 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-lg shadow-lg transition flex items-center gap-1.5 animate-pulse cursor-pointer hover:scale-105 active:scale-95"
              title="Desafiar Boss da Fase 10!"
            >
              <Skull size={15} /> Desafiar Boss!
            </button>
          )}
          {isFightingBoss && (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-lg font-bold animate-pulse">
              <Crown size={15} /> LUTA DE BOSS
            </span>
          )}
        </div>
      </div>

      {/* Visual da Horda de Inimigos (Múltiplos Mobs na Trilha de Batalha) */}
      <div className="my-4 bg-black/40 p-3 rounded-xl border border-white/5 flex justify-between items-center px-6">
        <div className="flex items-center gap-2 text-xs font-bold text-red-400">
          <Swords size={16} /> Avanço da Horda Hollow:
        </div>
        <div className="flex gap-2 items-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((stageNum) => (
            <div
              key={stageNum}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                stageNum < biomeStage
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                  : stageNum === biomeStage
                  ? 'bg-red-600 border-white text-white scale-110 shadow-lg shadow-red-500/50 animate-pulse'
                  : 'bg-slate-900 border-gray-800 text-gray-600'
              }`}
            >
              {stageNum === 10 ? '👑' : stageNum}
            </div>
          ))}
        </div>
      </div>

      {/* Arena de Batalha (Horda de Inimigos vs Shinigami) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
        {/* Visual dos Inimigos Ativos da Horda */}
        <div className={`bg-slate-950/80 p-5 rounded-2xl border border-red-500/40 shadow-xl flex flex-col justify-between relative overflow-hidden transition duration-150 min-h-[220px] ${isHitAnimating ? 'scale-[0.98] border-red-500 bg-red-950/30' : 'hover:border-red-500'}`}>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
          
          {/* Slash Flash Overlay on Damage Hit */}
          {isHitAnimating && (
            <div className="absolute inset-0 bg-red-500/15 backdrop-invert-0 pointer-events-none z-20 animate-pulse" />
          )}

          {/* Números Flutuantes de Dano Animados */}
          {floatingDamages.map((dmg) => (
            <div
              key={dmg.id}
              className={`absolute top-12 font-extrabold text-sm pointer-events-none animate-float-damage z-10 ${
                dmg.isCrit ? 'text-amber-400 text-lg shadow-red-500' : 'text-red-400'
              }`}
              style={{ left: `calc(50% + ${dmg.xOffset}px)` }}
            >
              -{dmg.damage} {dmg.isCrit ? '🔥 CRÍTICO!' : ''}
            </div>
          ))}

          <div className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>{GAME_THEME.enemyFactionName} ({currentEnemies.length} {currentEnemies.length === 1 ? 'mob' : 'mobs'})</span>
            {currentEnemies.length > 1 && <span className="text-[10px] bg-red-950 px-2 py-0.5 rounded border border-red-800 text-amber-300">💥 Ataques AoE Ativos</span>}
          </div>

          {/* Cards dos Mobs Simultâneos */}
          <div className="grid grid-cols-1 gap-2.5 my-auto">
            {currentEnemies.map((enemy, idx) => {
              const enemyHpPct = Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100));
              return (
                <div key={enemy.id} className={`p-2.5 rounded-xl border backdrop-blur-md transition ${idx === 0 ? 'bg-red-950/40 border-red-500/60 shadow-md' : 'bg-black/40 border-white/10 opacity-80'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-extrabold text-xs flex items-center gap-1.5 ${enemy.isBoss ? 'text-amber-400' : 'text-red-300'}`}>
                      <span>{enemy.avatarIcon || '💀'}</span>
                      {enemy.name} {idx === 0 && <span className="text-[9px] bg-red-900 text-white px-1.5 py-0.2 rounded">ALVO REPO</span>}
                    </span>
                    <span className="text-[10px] font-mono text-gray-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                      {enemy.currentHp} / {enemy.maxHp} HP
                    </span>
                  </div>

                  {/* Barra de Vida individual */}
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-red-900/60 p-0.5 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-red-700 via-red-500 to-amber-500 h-full rounded-full transition-all duration-150"
                      style={{ width: `${enemyHpPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-4 text-xs font-semibold text-gray-300 bg-black/40 px-4 py-1.5 rounded-full border border-white/5 mt-3">
            <span className="flex items-center gap-1.5"><Zap size={14} className="text-amber-400" /> ATK: {primaryEnemy?.atk || 0}</span>
            <span className="flex items-center gap-1.5"><Shield size={14} className="text-blue-400" /> DEF: {primaryEnemy?.def || 0}</span>
          </div>
        </div>

        {/* Visual do Personagem Principal (Player) */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-cyan-500/40 shadow-xl flex flex-col items-center justify-between relative overflow-hidden hover:border-cyan-400 transition duration-300">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-full flex justify-between items-center mb-3">
            <span className="font-extrabold text-cyan-300 text-base flex items-center gap-1.5">
              <Sparkles size={18} className="text-cyan-400" /> {GAME_THEME.heroTitle}
            </span>
            <span className="text-xs font-mono text-cyan-200 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800 font-bold">
              {playerCurrentHp} / {playerMaxHp} HP
            </span>
          </div>

          {/* Avatar do Player em Pixel Art Animado */}
          <div className="my-2 flex flex-col items-center">
            <HeroAvatarPixel size="md" isAttacking={isHitAnimating} />
            <span className="text-[10px] text-amber-300 font-mono mt-2 bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">
              Shinigami Substituto (Pixel Art)
            </span>
          </div>

          {/* Barra de Vida Player */}
          <div className="w-full bg-slate-900 h-5 rounded-full overflow-hidden border border-cyan-900/60 p-0.5 mb-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-cyan-600 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-200"
              style={{ width: `${playerHpPct}%` }}
            />
          </div>

          <div className="flex gap-4 text-xs text-cyan-300 font-semibold bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
            <span className="flex items-center gap-1 font-bold text-amber-300">
              <Flame size={14} className="text-amber-400" /> {calculatedDps} DPS
            </span>
            <span>⚡ {stats.baseSpd.toFixed(2)} Atks/s</span>
          </div>
        </div>
      </div>

      {/* Slots de Habilidade e Cooldown Visual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Slot 1 Skill */}
        <div className="bg-black/60 p-3.5 rounded-xl border border-purple-500/40 flex items-center justify-between backdrop-blur-md">
          <div>
            <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">{GAME_THEME.skillSlot1Label}</div>
            <div className="text-sm font-extrabold text-white mt-0.5">
              {equippedSlot1SkillId || 'Nenhuma'}
            </div>
          </div>
          {skill1Cooldown > 0 ? (
            <span className="text-xs font-mono bg-purple-950/90 text-purple-300 px-3 py-1.5 rounded-lg border border-purple-500 font-bold">
              {skill1Cooldown.toFixed(1)}s
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-300 bg-emerald-950/90 px-3 py-1.5 rounded-lg border border-emerald-500 shadow-lg shadow-emerald-950/50">
              PRONTO
            </span>
          )}
        </div>

        {/* Slot 2 Ultimate */}
        <div className="bg-black/60 p-3.5 rounded-xl border border-amber-500/40 flex items-center justify-between backdrop-blur-md">
          <div>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{GAME_THEME.skillSlot2Label}</div>
            <div className="text-sm font-extrabold text-white mt-0.5">
              {equippedSlot2SkillId || 'Nenhuma'}
            </div>
          </div>
          {skill2Cooldown > 0 ? (
            <span className="text-xs font-mono bg-amber-950/90 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500 font-bold">
              {skill2Cooldown.toFixed(1)}s
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-300 bg-amber-950/90 px-3 py-1.5 rounded-lg border border-amber-500 shadow-lg shadow-amber-950/50 animate-pulse">
              PRONTO
            </span>
          )}
        </div>
      </div>

      {/* Log de Batalha Em Tempo Real */}
      <div className="bg-black/80 p-4 rounded-xl border border-white/10 h-36 overflow-y-auto flex flex-col-reverse text-xs font-mono gap-1.5 shadow-inner">
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
    </div>
  );
};
