import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { BIOMES_CATALOG } from '../data/gameCatalog';
import { Shield, Zap, Sparkles, Skull, Crown, Activity } from 'lucide-react';

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
    <div className={`flex flex-col bg-gradient-to-b ${currentBiome.bgGradient} text-white p-5 rounded-2xl shadow-2xl border border-slate-700/60 relative overflow-hidden`}>
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
        <div className="flex sm:flex-col justify-between items-center sm:items-end">
          <div className="text-sm font-semibold text-gray-300">
            Estágio: <span className="text-amber-400 font-bold text-base">{biomeStage} / 10</span>
          </div>
          {!isFightingBoss && (
            <button
              onClick={challengeBoss}
              className="mt-1 text-xs px-4 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-lg shadow-lg transition flex items-center gap-1.5 animate-pulse cursor-pointer"
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

      {/* Arena de Batalha (Inimigo vs Shinigami) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {/* Visual do Inimigo / Hollow */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-red-500/40 shadow-xl flex flex-col items-center justify-between relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-full flex justify-between items-center mb-3">
            <span className={`font-extrabold ${currentEnemy?.isBoss ? 'text-amber-400 text-lg' : 'text-red-400 text-base'}`}>
              {currentEnemy?.name}
            </span>
            <span className="text-xs font-mono text-gray-300 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
              {currentEnemy?.currentHp} / {currentEnemy?.maxHp} HP
            </span>
          </div>

          {/* Avatar / Icon do Inimigo */}
          <div className="my-4 p-5 bg-gradient-to-b from-red-950/40 to-black rounded-full border border-red-500/30 text-red-500 shadow-2xl animate-bounce">
            <Skull size={48} />
          </div>

          {/* Barra de Vida Inimigo */}
          <div className="w-full bg-slate-900 h-5 rounded-full overflow-hidden border border-red-900/60 p-0.5 mb-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-red-700 via-red-500 to-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${enemyHpPct}%` }}
            />
          </div>

          <div className="flex gap-4 text-xs font-semibold text-gray-300 bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
            <span className="flex items-center gap-1.5"><Zap size={14} className="text-amber-400" /> ATK: {currentEnemy?.atk}</span>
            <span className="flex items-center gap-1.5"><Shield size={14} className="text-blue-400" /> DEF: {currentEnemy?.def}</span>
          </div>
        </div>

        {/* Visual do Shinigami (Player) */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-cyan-500/40 shadow-xl flex flex-col items-center justify-between relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-full flex justify-between items-center mb-3">
            <span className="font-extrabold text-cyan-300 text-base flex items-center gap-1.5">
              <Sparkles size={18} className="text-cyan-400" /> Shinigami Substituto
            </span>
            <span className="text-xs font-mono text-cyan-200 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              {playerCurrentHp} / {playerMaxHp} HP
            </span>
          </div>

          {/* Avatar / Icon do Shinigami */}
          <div className="my-4 p-5 bg-gradient-to-b from-cyan-950/40 to-black rounded-full border border-cyan-500/30 text-cyan-400 shadow-2xl">
            <Activity size={48} />
          </div>

          {/* Barra de Vida Player */}
          <div className="w-full bg-slate-900 h-5 rounded-full overflow-hidden border border-cyan-900/60 p-0.5 mb-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-cyan-600 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${playerHpPct}%` }}
            />
          </div>

          <div className="text-xs text-cyan-300 font-semibold bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
            ⚔️ Batalhando em Tempo Real (Auto-Attack)
          </div>
        </div>
      </div>

      {/* Slots de Habilidade e Cooldown Visual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Slot 1 Skill */}
        <div className="bg-black/60 p-3.5 rounded-xl border border-purple-500/40 flex items-center justify-between backdrop-blur-md">
          <div>
            <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Slot 1: Habilidade Ativa</div>
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

        {/* Slot 2 Bankai */}
        <div className="bg-black/60 p-3.5 rounded-xl border border-amber-500/40 flex items-center justify-between backdrop-blur-md">
          <div>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Slot 2: Modo Bankai</div>
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
