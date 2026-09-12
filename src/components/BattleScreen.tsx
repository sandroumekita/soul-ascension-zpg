import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { BIOMES_CATALOG } from '../data/gameCatalog';
import { Shield, Zap, Sparkles, Skull, Crown } from 'lucide-react';

export const BattleScreen: React.FC = () => {
  const {
    currentEnemy,
    playerCurrentHp,
    playerMaxHp,
    currentBiomeId,
    difficulty,
    biomeStage,
    isFightingBoss,
    logs,
    challengeBoss,
    skill1Cooldown,
    skill2Cooldown,
    equippedSlot1SkillId,
    equippedSlot2SkillId,
  } = useGameStore();

  const currentBiome = BIOMES_CATALOG.find((b) => b.id === currentBiomeId) || BIOMES_CATALOG[0];

  const enemyHpPct = currentEnemy ? Math.max(0, Math.min(100, (currentEnemy.currentHp / currentEnemy.maxHp) * 100)) : 0;
  const playerHpPct = Math.max(0, Math.min(100, (playerCurrentHp / playerMaxHp) * 100));

  return (
    <div className={`flex flex-col h-full bg-gradient-to-b ${currentBiome.bgGradient} text-white p-4 rounded-xl shadow-2xl border border-slate-800 relative overflow-hidden`}>
      {/* Header do Bioma e Dificuldade */}
      <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/10 backdrop-blur-md">
        <div>
          <span className="text-xs text-amber-400 font-semibold tracking-widest uppercase block">{currentBiome.japaneseName}</span>
          <h2 className="text-lg font-bold flex items-center gap-2">
            {currentBiome.name}
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 uppercase font-mono">
              {difficulty}
            </span>
          </h2>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-300">
            Estágio: <span className="text-amber-400 font-bold">{biomeStage} / 5</span>
          </div>
          {!isFightingBoss && (
            <button
              onClick={challengeBoss}
              className="mt-1 text-xs px-3 py-1 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-md shadow-lg transition flex items-center gap-1 animate-pulse"
            >
              <Skull size={14} /> Desafiar Boss!
            </button>
          )}
          {isFightingBoss && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold">
              <Crown size={14} /> LUTA DE BOSS
            </span>
          )}
        </div>
      </div>

      {/* Arena de Batalha (Inimigo vs Shinigami) */}
      <div className="flex-1 flex flex-col justify-center items-center my-6 gap-6 relative">
        {/* Visual do Inimigo */}
        <div className="w-full max-w-md bg-black/50 p-4 rounded-xl border border-red-500/30 shadow-inner flex flex-col items-center">
          <div className="flex justify-between w-full mb-1 items-center">
            <span className={`font-bold ${currentEnemy?.isBoss ? 'text-amber-400 text-base' : 'text-red-400 text-sm'}`}>
              {currentEnemy?.name}
            </span>
            <span className="text-xs font-mono text-gray-400">
              {currentEnemy?.currentHp} / {currentEnemy?.maxHp} HP
            </span>
          </div>
          {/* Barra de Vida Inimigo */}
          <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden border border-red-900/50 p-0.5">
            <div
              className="bg-gradient-to-r from-red-700 to-red-500 h-full rounded-full transition-all duration-200"
              style={{ width: `${enemyHpPct}%` }}
            />
          </div>
          <div className="flex gap-4 text-xs text-gray-400 mt-2">
            <span className="flex items-center gap-1"><Zap size={12} className="text-amber-400" /> ATK: {currentEnemy?.atk}</span>
            <span className="flex items-center gap-1"><Shield size={12} className="text-blue-400" /> DEF: {currentEnemy?.def}</span>
          </div>
        </div>

        {/* VS Central Indicator */}
        <div className="text-amber-400 font-extrabold text-lg tracking-widest bg-black/60 px-4 py-1 rounded-full border border-amber-500/30">
          ⚔️ COMBATE AUTÔNOMO ⚔️
        </div>

        {/* Visual do Shinigami (Player) */}
        <div className="w-full max-w-md bg-black/50 p-4 rounded-xl border border-cyan-500/30 shadow-inner flex flex-col items-center">
          <div className="flex justify-between w-full mb-1 items-center">
            <span className="font-bold text-cyan-300 text-sm flex items-center gap-1">
              <Sparkles size={16} className="text-cyan-400" /> Shinigami Substituto
            </span>
            <span className="text-xs font-mono text-cyan-200">
              {playerCurrentHp} / {playerMaxHp} HP
            </span>
          </div>
          {/* Barra de Vida Player */}
          <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden border border-cyan-900/50 p-0.5">
            <div
              className="bg-gradient-to-r from-cyan-600 to-teal-400 h-full rounded-full transition-all duration-200"
              style={{ width: `${playerHpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Slots de Habilidade e Cooldown Visual */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Slot 1 Skill */}
        <div className="bg-black/60 p-2.5 rounded-lg border border-purple-500/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-purple-400 uppercase font-semibold">Slot 1: Habilidade</div>
            <div className="text-xs font-bold text-white truncate max-w-[120px]">
              {equippedSlot1SkillId || 'Nenhuma'}
            </div>
          </div>
          {skill1Cooldown > 0 ? (
            <span className="text-xs font-mono bg-purple-950 text-purple-300 px-2 py-1 rounded border border-purple-500">
              {skill1Cooldown.toFixed(1)}s
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500">
              PRONTO
            </span>
          )}
        </div>

        {/* Slot 2 Bankai */}
        <div className="bg-black/60 p-2.5 rounded-lg border border-amber-500/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-amber-400 uppercase font-semibold">Slot 2: Bankai</div>
            <div className="text-xs font-bold text-white truncate max-w-[120px]">
              {equippedSlot2SkillId || 'Nenhuma'}
            </div>
          </div>
          {skill2Cooldown > 0 ? (
            <span className="text-xs font-mono bg-amber-950 text-amber-300 px-2 py-1 rounded border border-amber-500">
              {skill2Cooldown.toFixed(1)}s
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-1 rounded border border-amber-500 animate-pulse">
              PRONTO
            </span>
          )}
        </div>
      </div>

      {/* Log de Batalha Em Tempo Real */}
      <div className="bg-black/70 p-3 rounded-lg border border-white/10 h-32 overflow-y-auto flex flex-col-reverse text-xs font-mono gap-1">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`py-0.5 px-2 rounded ${
              log.type === 'skill'
                ? 'text-purple-300 bg-purple-950/40'
                : log.type === 'loot'
                ? 'text-amber-300 bg-amber-950/40 font-bold'
                : log.type === 'victory'
                ? 'text-emerald-300 bg-emerald-950/40 font-bold'
                : 'text-gray-300'
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
