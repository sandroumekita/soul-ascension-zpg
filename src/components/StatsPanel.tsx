import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_THEME } from '../config/themeConfig';
import { Shield, Zap, Heart, Activity, PlusCircle, Coins, Gem, Sparkles, Award, Swords, Flame } from 'lucide-react';

export const StatsPanel: React.FC = () => {
  const { stats, equippedWeapon, allocateStatPoint } = useGameStore();

  const expPct = Math.max(0, Math.min(100, (stats.exp / stats.nextLevelExp) * 100));

  // Atributos totais combinando base + equipamento
  const weaponAtk = equippedWeapon ? equippedWeapon.atk : 0;
  const totalAtk = stats.baseAtk + weaponAtk;
  const critPct = (equippedWeapon ? equippedWeapon.critChance * 100 : 5);
  const calculatedDps = Math.round(totalAtk * stats.baseSpd);

  return (
    <div className="bg-slate-900/90 text-white p-5 rounded-2xl border border-slate-800 flex flex-col gap-5 shadow-2xl backdrop-blur-md">
      {/* Header do Herói com Avatar / Card Estilizado */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950/40 to-slate-950 p-5 rounded-2xl border border-cyan-500/30 shadow-xl flex flex-col md:flex-row justify-between md:items-center gap-4 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="p-4 bg-gradient-to-b from-cyan-950 to-black rounded-2xl border border-cyan-500/50 text-cyan-400 shadow-2xl animate-pulse flex items-center justify-center">
            <Award size={36} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-0.5">{GAME_THEME.heroTitle}</span>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              Nível {stats.level}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500 text-cyan-300 font-mono font-bold">
                {stats.exp} / {stats.nextLevelExp} EXP
              </span>
            </h2>
            {/* Barra de Progresso de EXP */}
            <div className="w-48 sm:w-64 bg-slate-950 h-2.5 rounded-full overflow-hidden border border-cyan-900/60 p-0.5 mt-2 shadow-inner">
              <div
                className="bg-gradient-to-r from-cyan-600 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${expPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recursos do Jogador (Moedas & Joias em Cards Elegantes) */}
        <div className="flex gap-3 z-10">
          <div className="bg-black/60 p-3 rounded-xl border border-amber-500/30 flex flex-col items-center min-w-[90px]">
            <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">{GAME_THEME.currencyName}</span>
            <span className="text-sm font-mono font-extrabold text-amber-300 mt-0.5 flex items-center gap-1">
              <Coins size={14} className="text-amber-400" /> {stats.gold}
            </span>
          </div>

          <div className="bg-black/60 p-3 rounded-xl border border-purple-500/30 flex flex-col items-center min-w-[90px]">
            <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">{GAME_THEME.premiumCurrencyName}</span>
            <span className="text-sm font-mono font-extrabold text-purple-300 mt-0.5 flex items-center gap-1">
              <Gem size={14} className="text-purple-400" /> {stats.gems}
            </span>
          </div>
        </div>
      </div>

      {/* Resumo de Atributos Totais de Combate (DPS / Crítico / Equipamento) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-black/40 p-3 rounded-xl border border-red-500/30 flex flex-col">
          <span className="text-[10px] text-red-400 font-bold uppercase">DPS Estimado</span>
          <span className="text-lg font-mono font-extrabold text-white mt-1 flex items-center gap-1">
            <Flame size={16} className="text-amber-400" /> {calculatedDps}
          </span>
        </div>

        <div className="bg-black/40 p-3 rounded-xl border border-red-500/30 flex flex-col">
          <span className="text-[10px] text-red-400 font-bold uppercase">Ataque Total</span>
          <span className="text-lg font-mono font-extrabold text-red-300 mt-1 flex items-center gap-1">
            <Swords size={16} /> {totalAtk} <span className="text-[10px] text-gray-400">({stats.baseAtk} + {weaponAtk})</span>
          </span>
        </div>

        <div className="bg-black/40 p-3 rounded-xl border border-amber-500/30 flex flex-col">
          <span className="text-[10px] text-amber-400 font-bold uppercase">Chance Crítica</span>
          <span className="text-lg font-mono font-extrabold text-amber-300 mt-1">
            🎯 {critPct.toFixed(0)}%
          </span>
        </div>

        <div className="bg-black/40 p-3 rounded-xl border border-blue-500/30 flex flex-col">
          <span className="text-[10px] text-blue-400 font-bold uppercase">Ataques / Seg</span>
          <span className="text-lg font-mono font-extrabold text-blue-300 mt-1">
            ⚡ {stats.baseSpd.toFixed(2)}/s
          </span>
        </div>
      </div>

      {/* Alerta / Banner de Pontos de Atributo Disponíveis */}
      <div className={`p-4 rounded-xl border backdrop-blur-md flex justify-between items-center transition ${stats.statPoints > 0 ? 'bg-gradient-to-r from-amber-950/80 via-red-950/80 to-amber-950/80 border-amber-400 shadow-lg animate-pulse' : 'bg-black/40 border-white/10'}`}>
        <div className="flex items-center gap-2">
          <Sparkles size={20} className={stats.statPoints > 0 ? 'text-amber-300 animate-spin' : 'text-gray-500'} />
          <span className="text-sm font-bold text-amber-200">
            Pontos de Atributo Não Alocados:
          </span>
        </div>
        <span className="text-xl font-extrabold font-mono text-amber-400 bg-black/80 px-4 py-1 rounded-xl border border-amber-400/60 shadow-inner">
          {stats.statPoints}
        </span>
      </div>

      {/* Grade de Alocação de Atributos com Layout Moderno */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ATK */}
        <div className="bg-black/50 p-4 rounded-xl border border-red-500/30 hover:border-red-500 transition flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-950 rounded-xl border border-red-500 text-red-400 shadow-md">
                <Zap size={22} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Poder de Ataque (ATK)</h4>
                <p className="text-xs text-gray-400 mt-0.5">Dano base desferido nos golpes.</p>
              </div>
            </div>
            <span className="text-base font-extrabold font-mono text-red-400 bg-red-950/60 px-2.5 py-0.5 rounded border border-red-800">
              {stats.baseAtk}
            </span>
          </div>

          <button
            onClick={() => allocateStatPoint('atk')}
            disabled={stats.statPoints <= 0}
            className="w-full py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <PlusCircle size={15} /> Aumentar +4 ATK
          </button>
        </div>

        {/* DEF */}
        <div className="bg-black/50 p-4 rounded-xl border border-blue-500/30 hover:border-blue-500 transition flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-950 rounded-xl border border-blue-500 text-blue-400 shadow-md">
                <Shield size={22} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Defesa (DEF)</h4>
                <p className="text-xs text-gray-400 mt-0.5">Redução direta de dano sofrido.</p>
              </div>
            </div>
            <span className="text-base font-extrabold font-mono text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-800">
              {stats.baseDef}
            </span>
          </div>

          <button
            onClick={() => allocateStatPoint('def')}
            disabled={stats.statPoints <= 0}
            className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <PlusCircle size={15} /> Aumentar +2 DEF
          </button>
        </div>

        {/* HP */}
        <div className="bg-black/50 p-4 rounded-xl border border-emerald-500/30 hover:border-emerald-500 transition flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-950 rounded-xl border border-emerald-500 text-emerald-400 shadow-md">
                <Heart size={22} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Vitalidade (HP Máx)</h4>
                <p className="text-xs text-gray-400 mt-0.5">Capacidade máxima de vida.</p>
              </div>
            </div>
            <span className="text-base font-extrabold font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">
              {stats.baseHp}
            </span>
          </div>

          <button
            onClick={() => allocateStatPoint('hp')}
            disabled={stats.statPoints <= 0}
            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <PlusCircle size={15} /> Aumentar +25 HP
          </button>
        </div>

        {/* SPD */}
        <div className="bg-black/50 p-4 rounded-xl border border-amber-500/30 hover:border-amber-500 transition flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-950 rounded-xl border border-amber-500 text-amber-400 shadow-md">
                <Activity size={22} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Velocidade (SPD)</h4>
                <p className="text-xs text-gray-400 mt-0.5">Frequência de golpes automáticos.</p>
              </div>
            </div>
            <span className="text-base font-extrabold font-mono text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800">
              {stats.baseSpd.toFixed(2)}/s
            </span>
          </div>

          <button
            onClick={() => allocateStatPoint('spd')}
            disabled={stats.statPoints <= 0}
            className="w-full py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <PlusCircle size={15} /> Aumentar +0.05 SPD
          </button>
        </div>
      </div>
    </div>
  );
};
