import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Shield, Zap, Heart, Activity, PlusCircle, Coins, Gem, Sparkles } from 'lucide-react';

export const StatsPanel: React.FC = () => {
  const { stats, allocateStatPoint } = useGameStore();

  return (
    <div className="bg-slate-900/90 text-white p-4 rounded-xl border border-slate-800 flex flex-col gap-4 shadow-xl">
      {/* Header do Shinigami */}
      <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/10">
        <div>
          <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Shinigami Substituto</div>
          <div className="text-xl font-bold flex items-center gap-2">
            Nível {stats.level}
            <span className="text-xs text-gray-400 font-normal">
              ({stats.exp} / {stats.nextLevelExp} EXP)
            </span>
          </div>
        </div>
        <div className="flex gap-3 text-right">
          <div className="bg-amber-950/60 px-3 py-1 rounded border border-amber-500/40 text-amber-300 font-mono text-xs flex items-center gap-1">
            <Coins size={14} className="text-amber-400" /> {stats.reiryoku}
          </div>
          <div className="bg-purple-950/60 px-3 py-1 rounded border border-purple-500/40 text-purple-300 font-mono text-xs flex items-center gap-1">
            <Gem size={14} className="text-purple-400" /> {stats.soulOrbs}
          </div>
        </div>
      </div>

      {/* Pontos de Atributos Disponíveis */}
      <div className="flex justify-between items-center bg-gradient-to-r from-amber-950/50 to-red-950/50 p-3 rounded-lg border border-amber-500/30">
        <span className="text-sm font-semibold text-amber-200 flex items-center gap-1">
          <Sparkles size={16} className="text-amber-400" /> Pontos de Atributo Disponíveis:
        </span>
        <span className="text-lg font-bold font-mono text-amber-400 bg-black/60 px-3 py-0.5 rounded border border-amber-500/50">
          {stats.statPoints}
        </span>
      </div>

      {/* Lista de Atributos para Upgrade */}
      <div className="grid grid-cols-1 gap-3">
        {/* ATK */}
        <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-950/80 rounded border border-red-500 text-red-400">
              <Zap size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-200">Reiatsu / ATK</div>
              <div className="text-xs text-gray-400">Dano base por ataque automático: <span className="text-red-400 font-bold">{stats.baseAtk}</span></div>
            </div>
          </div>
          <button
            onClick={() => allocateStatPoint('atk')}
            disabled={stats.statPoints <= 0}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs rounded transition flex items-center gap-1"
          >
            <PlusCircle size={14} /> +4 ATK
          </button>
        </div>

        {/* DEF */}
        <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-950/80 rounded border border-blue-500 text-blue-400">
              <Shield size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-200">Defesa Espiritual</div>
              <div className="text-xs text-gray-400">Redução de dano sofrido: <span className="text-blue-400 font-bold">{stats.baseDef}</span></div>
            </div>
          </div>
          <button
            onClick={() => allocateStatPoint('def')}
            disabled={stats.statPoints <= 0}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded transition flex items-center gap-1"
          >
            <PlusCircle size={14} /> +2 DEF
          </button>
        </div>

        {/* HP */}
        <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950/80 rounded border border-emerald-500 text-emerald-400">
              <Heart size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-200">Vitalidade (HP Máximo)</div>
              <div className="text-xs text-gray-400">Pontos de vida máximo: <span className="text-emerald-400 font-bold">{stats.baseHp}</span></div>
            </div>
          </div>
          <button
            onClick={() => allocateStatPoint('hp')}
            disabled={stats.statPoints <= 0}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded transition flex items-center gap-1"
          >
            <PlusCircle size={14} /> +25 HP
          </button>
        </div>

        {/* SPD */}
        <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-950/80 rounded border border-amber-500 text-amber-400">
              <Activity size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-200">Velocidade de Ataque (SPD)</div>
              <div className="text-xs text-gray-400">Ataques automáticos por seg: <span className="text-amber-400 font-bold">{stats.baseSpd.toFixed(2)}/s</span></div>
            </div>
          </div>
          <button
            onClick={() => allocateStatPoint('spd')}
            disabled={stats.statPoints <= 0}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs rounded transition flex items-center gap-1"
          >
            <PlusCircle size={14} /> +0.05 SPD
          </button>
        </div>
      </div>
    </div>
  );
};
