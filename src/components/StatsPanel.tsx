import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_THEME } from '../config/themeConfig';
import { Shield, Zap, Heart, Activity, PlusCircle, Coins, Gem, Sparkles, Award, Swords, Flame, ChevronsUp } from 'lucide-react';

export const StatsPanel: React.FC = () => {
  const { stats, equippedWeapon, allocateStatPoint } = useGameStore();
  const [allocStep, setAllocStep] = useState<number | 'MAX'>(1);

  const expPct = Math.max(0, Math.min(100, (stats.exp / stats.nextLevelExp) * 100));

  // Atributos totais combinando base + equipamento
  const weaponAtk = equippedWeapon ? equippedWeapon.atk : 0;
  const totalAtk = stats.baseAtk + weaponAtk;
  const critPct = (equippedWeapon ? equippedWeapon.critChance * 100 : 5);
  const calculatedDps = Math.round(totalAtk * stats.baseSpd);

  // Calcula a quantidade exata de pontos que serão investidos ao clicar no botão
  const getPointsToAllocate = (): number => {
    if (stats.statPoints <= 0) return 0;
    if (allocStep === 'MAX') return stats.statPoints;
    return Math.min(stats.statPoints, allocStep);
  };

  const currentPointsStep = getPointsToAllocate();

  return (
    <div className="bg-slate-900/90 text-white p-2.5 sm:p-5 rounded-2xl border border-slate-800 flex flex-col gap-2.5 sm:gap-5 shadow-2xl backdrop-blur-md min-w-0 max-w-full">
      {/* Header do Herói com Avatar / Card Estilizado */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950/40 to-slate-950 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-cyan-500/30 shadow-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 relative overflow-hidden">
        <div className="flex items-center gap-2.5 sm:gap-4 z-10">
          <div className="p-2 sm:p-4 bg-gradient-to-b from-cyan-950 to-black rounded-xl sm:rounded-2xl border border-cyan-500/50 text-cyan-400 shadow-2xl animate-pulse flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 sm:w-9 sm:h-9" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-0.5">{GAME_THEME.heroTitle}</span>
            <h2 className="text-base sm:text-2xl font-black text-white flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span>Nível {stats.level}</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500 text-cyan-300 font-mono font-bold">
                {stats.exp} / {stats.nextLevelExp} EXP
              </span>
            </h2>
            {/* Barra de Progresso de EXP */}
            <div className="w-36 sm:w-64 bg-slate-950 h-2 sm:h-2.5 rounded-full overflow-hidden border border-cyan-900/60 p-0.5 mt-1.5 shadow-inner">
              <div
                className="bg-gradient-to-r from-cyan-600 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${expPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recursos do Jogador (Moedas & Joias) */}
        <div className="flex gap-2 z-10 w-full sm:w-auto">
          <div className="bg-black/60 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-amber-500/30 flex-1 sm:flex-none flex sm:flex-col items-center justify-between sm:justify-center sm:min-w-[90px] gap-1">
            <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">{GAME_THEME.currencyName}</span>
            <span className="text-xs sm:text-sm font-mono font-extrabold text-amber-300 flex items-center gap-1">
              <Coins size={13} className="text-amber-400 shrink-0" /> {stats.gold}
            </span>
          </div>

          <div className="bg-black/60 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-purple-500/30 flex-1 sm:flex-none flex sm:flex-col items-center justify-between sm:justify-center sm:min-w-[90px] gap-1">
            <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">{GAME_THEME.premiumCurrencyName}</span>
            <span className="text-xs sm:text-sm font-mono font-extrabold text-purple-300 flex items-center gap-1">
              <Gem size={13} className="text-purple-400 shrink-0" /> {stats.gems}
            </span>
          </div>
        </div>
      </div>

      {/* Resumo de Atributos Totais de Combate (DPS / Crítico / Equipamento) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3">
        <div className="bg-black/40 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-red-500/30 flex flex-col">
          <span className="text-[9px] sm:text-[10px] text-red-400 font-bold uppercase">DPS</span>
          <span className="text-sm sm:text-lg font-mono font-extrabold text-white mt-0.5 sm:mt-1 flex items-center gap-1">
            <Flame size={14} className="text-amber-400 shrink-0" /> {calculatedDps}
          </span>
        </div>

        <div className="bg-black/40 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-red-500/30 flex flex-col">
          <span className="text-[9px] sm:text-[10px] text-red-400 font-bold uppercase">Ataque</span>
          <span className="text-sm sm:text-lg font-mono font-extrabold text-red-300 mt-0.5 sm:mt-1 flex items-center gap-1 truncate">
            <Swords size={14} className="shrink-0" /> {totalAtk} <span className="text-[9px] sm:text-[10px] text-gray-400 font-normal">({stats.baseAtk}+{weaponAtk})</span>
          </span>
        </div>

        <div className="bg-black/40 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-amber-500/30 flex flex-col">
          <span className="text-[9px] sm:text-[10px] text-amber-400 font-bold uppercase">Crítico</span>
          <span className="text-sm sm:text-lg font-mono font-extrabold text-amber-300 mt-0.5 sm:mt-1">
            🎯 {critPct.toFixed(0)}%
          </span>
        </div>

        <div className="bg-black/40 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-blue-500/30 flex flex-col">
          <span className="text-[9px] sm:text-[10px] text-blue-400 font-bold uppercase">Velocidade</span>
          <span className="text-sm sm:text-lg font-mono font-extrabold text-blue-300 mt-0.5 sm:mt-1">
            ⚡ {stats.baseSpd.toFixed(2)}/s
          </span>
        </div>
      </div>

      {/* Alerta / Banner de Pontos de Atributo Disponíveis com Seletor Multiplicador (+1, +5, +10, MAX) */}
      <div className={`p-2.5 sm:p-4 rounded-xl border backdrop-blur-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 transition ${stats.statPoints > 0 ? 'bg-gradient-to-r from-amber-950/80 via-red-950/80 to-amber-950/80 border-amber-400 shadow-lg' : 'bg-black/40 border-white/10'}`}>
        <div className="flex items-center gap-2">
          <Sparkles size={18} className={stats.statPoints > 0 ? 'text-amber-300 animate-spin' : 'text-gray-500'} />
          <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0">
            <span className="text-[10px] sm:text-xs text-amber-300/80 uppercase tracking-wider font-mono">Pontos:</span>
            <span className="text-base sm:text-2xl font-extrabold font-mono text-amber-400">
              {stats.statPoints}
            </span>
          </div>
        </div>

        {/* Seleção de Multiplicador de Adição */}
        <div className="flex items-center gap-1 sm:gap-2 bg-black/60 p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-amber-500/30 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono font-bold uppercase px-1 sm:px-2">Multiplicador:</span>
          <div className="flex gap-1">
            {([1, 5, 10, 'MAX'] as const).map((step) => {
              const isSelected = allocStep === step;
              return (
                <button
                  key={step}
                  onClick={() => setAllocStep(step)}
                  className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold font-mono transition ${
                    isSelected
                      ? 'bg-amber-400 text-black shadow-md scale-105'
                      : 'bg-slate-900 text-gray-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {step === 'MAX' ? 'MAX' : `+${step}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grade de Alocação de Atributos com 2 colunas para caber na primeira dobra */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {/* ATK */}
        <div className="bg-black/50 p-2.5 sm:p-4 rounded-xl border border-red-500/30 hover:border-red-500 transition flex flex-col justify-between gap-2 sm:gap-3">
          <div className="flex items-start justify-between gap-1">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-3 bg-red-950 rounded-lg sm:rounded-xl border border-red-500 text-red-400 shadow-md shrink-0">
                <Zap size={16} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">Ataque (ATK)</h4>
                <p className="hidden sm:block text-xs text-gray-400 mt-0.5">Dano base desferido.</p>
              </div>
            </div>
            <span className="text-xs sm:text-base font-extrabold font-mono text-red-400 bg-red-950/60 px-1.5 sm:px-2.5 py-0.5 rounded border border-red-800 shrink-0">
              {stats.baseAtk}
            </span>
          </div>

          <button
            onClick={() => allocateStatPoint('atk', currentPointsStep)}
            disabled={stats.statPoints <= 0}
            className="w-full py-1.5 sm:py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 disabled:opacity-40 text-white font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            {allocStep === 'MAX' ? <ChevronsUp size={13} /> : <PlusCircle size={13} />}
            <span className="truncate">+{currentPointsStep * 6} ATK ({currentPointsStep}pt)</span>
          </button>
        </div>

        {/* DEF */}
        <div className="bg-black/50 p-2.5 sm:p-4 rounded-xl border border-blue-500/30 hover:border-blue-500 transition flex flex-col justify-between gap-2 sm:gap-3">
          <div className="flex items-start justify-between gap-1">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-3 bg-blue-950 rounded-lg sm:rounded-xl border border-blue-500 text-blue-400 shadow-md shrink-0">
                <Shield size={16} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">Defesa (DEF)</h4>
                <p className="hidden sm:block text-xs text-gray-400 mt-0.5">Redução de dano.</p>
              </div>
            </div>
            <span className="text-xs sm:text-base font-extrabold font-mono text-blue-400 bg-blue-950/60 px-1.5 sm:px-2.5 py-0.5 rounded border border-blue-800 shrink-0">
              {stats.baseDef}
            </span>
          </div>

          <button
            onClick={() => allocateStatPoint('def', currentPointsStep)}
            disabled={stats.statPoints <= 0}
            className="w-full py-1.5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 text-white font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            {allocStep === 'MAX' ? <ChevronsUp size={13} /> : <PlusCircle size={13} />}
            <span className="truncate">+{currentPointsStep * 3} DEF ({currentPointsStep}pt)</span>
          </button>
        </div>

        {/* HP */}
        <div className="bg-black/50 p-2.5 sm:p-4 rounded-xl border border-emerald-500/30 hover:border-emerald-500 transition flex flex-col justify-between gap-2 sm:gap-3">
          <div className="flex items-start justify-between gap-1">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-3 bg-emerald-950 rounded-lg sm:rounded-xl border border-emerald-500 text-emerald-400 shadow-md shrink-0">
                <Heart size={16} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">Vida (HP)</h4>
                <p className="hidden sm:block text-xs text-gray-400 mt-0.5">Vida máxima.</p>
              </div>
            </div>
            <span className="text-xs sm:text-base font-extrabold font-mono text-emerald-400 bg-emerald-950/60 px-1.5 sm:px-2.5 py-0.5 rounded border border-emerald-800 shrink-0">
              {stats.baseHp}
            </span>
          </div>

          <button
            onClick={() => allocateStatPoint('hp', currentPointsStep)}
            disabled={stats.statPoints <= 0}
            className="w-full py-1.5 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            {allocStep === 'MAX' ? <ChevronsUp size={13} /> : <PlusCircle size={13} />}
            <span className="truncate">+{currentPointsStep * 50} HP ({currentPointsStep}pt)</span>
          </button>
        </div>

        {/* SPD */}
        <div className="bg-black/50 p-2.5 sm:p-4 rounded-xl border border-amber-500/30 hover:border-amber-500 transition flex flex-col justify-between gap-2 sm:gap-3">
          <div className="flex items-start justify-between gap-1">
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <div className="p-1.5 sm:p-3 bg-amber-950 rounded-lg sm:rounded-xl border border-amber-500 text-amber-400 shadow-md shrink-0">
                <Activity size={16} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">Velocidade (SPD)</h4>
                <p className="hidden sm:block text-xs text-gray-400 mt-0.5">Ataques por seg.</p>
              </div>
            </div>
            <span className="text-xs sm:text-base font-extrabold font-mono text-amber-400 bg-amber-950/60 px-1.5 sm:px-2.5 py-0.5 rounded border border-amber-800 shrink-0">
              {stats.baseSpd.toFixed(2)}/s
            </span>
          </div>

          <button
            onClick={() => allocateStatPoint('spd', currentPointsStep)}
            disabled={stats.statPoints <= 0}
            className="w-full py-1.5 sm:py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-40 text-white font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            {allocStep === 'MAX' ? <ChevronsUp size={13} /> : <PlusCircle size={13} />}
            <span className="truncate">+{(currentPointsStep * 0.05).toFixed(2)} SPD ({currentPointsStep}pt)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

