import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_THEME } from '../config/themeConfig';
import { Gem, Sparkles, Gift, Zap, RefreshCw } from 'lucide-react';
import type { Equipment } from '../types/game';

export const GachaShopPanel: React.FC = () => {
  const { stats, summonGacha } = useGameStore();
  const [lastSummonResult, setLastSummonResult] = useState<{
    skill?: string;
    item?: Equipment;
    isDuplicate?: boolean;
    bannerType?: 'skill' | 'equipment';
  } | null>(null);
  const [isSummoning, setIsSummoning] = useState<boolean>(false);

  const handleSummon = (cost: number, bannerType: 'skill' | 'equipment') => {
    if (stats.gems < cost) {
      alert(`❌ ${GAME_THEME.premiumCurrencyName} insuficientes! Derrote Bosses para obter mais!`);
      return;
    }

    setIsSummoning(true);

    setTimeout(() => {
      const res = summonGacha(cost);
      setLastSummonResult({ ...res, bannerType });
      setIsSummoning(false);
    }, 400);
  };

  return (
    <div className="bg-slate-900/90 text-white p-5 rounded-2xl border border-slate-800 flex flex-col gap-6 shadow-2xl backdrop-blur-md">
      {/* Header com Saldo de Joias Premium */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-950 to-purple-950/80 p-5 rounded-2xl border border-purple-500/40 shadow-xl flex justify-between items-center relative overflow-hidden">
        <div className="flex items-center gap-3.5 z-10">
          <div className="p-3.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl text-white shadow-lg animate-pulse">
            <Sparkles size={26} />
          </div>
          <div>
            <h3 className="text-lg font-black text-purple-300 flex items-center gap-2">
              Portal de Invocação Espiritual & Gacha
            </h3>
            <p className="text-xs text-gray-300 mt-0.5">
              Invoque Habilidades Raras e {GAME_THEME.weaponTerm}s Lendárias utilizando {GAME_THEME.premiumCurrencyName}.
            </p>
          </div>
        </div>

        <div className="bg-black/70 px-4 py-2 rounded-2xl border border-purple-400/50 text-purple-300 font-mono text-sm flex items-center gap-2 font-black shadow-inner z-10">
          <Gem size={18} className="text-purple-400 animate-bounce" /> {stats.gems} {GAME_THEME.premiumCurrencyName}
        </div>
      </div>

      {/* Modal / Card de Resultado de Invocação Recente (Estilo Gacha Showcase) */}
      {lastSummonResult && (
        <div className="bg-gradient-to-r from-slate-950 via-purple-950/90 to-slate-950 border-2 border-purple-500/80 p-5 rounded-2xl text-center shadow-2xl animate-fade-in relative overflow-hidden flex flex-col items-center gap-2">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
          <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest text-amber-400">
            ✨ RECOMPENSA OBTIDA DA INVOLUÇÃO ✨
          </span>

          {lastSummonResult.skill ? (
            <div className="flex flex-col items-center">
              <div className="text-4xl my-1 animate-bounce">⚡</div>
              <div className="text-lg font-black text-purple-300">
                {lastSummonResult.skill}
              </div>
              <span className="text-xs text-emerald-400 font-bold mt-1">
                {lastSummonResult.isDuplicate ? '🔄 Habilidade Repetida! Nível da Skill Aumentado (+15% Dano)' : '🎉 Nova Habilidade Desbloqueada no Grimório!'}
              </span>
            </div>
          ) : lastSummonResult.item ? (
            <div className="flex flex-col items-center">
              <div className="text-4xl my-1 animate-bounce">🗡️</div>
              <div className="text-lg font-black text-amber-300">
                {lastSummonResult.item.name}
              </div>
              <span className="text-xs text-cyan-300 font-mono mt-1">
                ATK: +{lastSummonResult.item.atk} | Raridade: {lastSummonResult.item.rarity.toUpperCase()}
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* Banners Principais de Gacha (Cards de Alta Densidade) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Banner 1: Invocação de Habilidades / Bankais */}
        <div className="bg-gradient-to-b from-purple-950/70 via-slate-950 to-black p-5 rounded-2xl border border-purple-500/50 shadow-xl flex flex-col justify-between items-center text-center gap-4 hover:border-purple-400 transition relative overflow-hidden group">
          <div className="absolute top-0 right-0 px-3 py-1 bg-purple-900/80 text-purple-200 text-[10px] font-extrabold font-mono rounded-bl-xl border-l border-b border-purple-500">
            SKILLS & BANKAIS
          </div>

          <div className="mt-2">
            <div className="p-4 bg-purple-900/40 rounded-full border border-purple-400/60 text-purple-300 w-fit mx-auto mb-3 shadow-lg group-hover:scale-110 transition">
              <Zap size={32} />
            </div>
            <h4 className="font-black text-base text-purple-200">Banner: Grimório dos Transcendentes</h4>
            <p className="text-xs text-gray-300 mt-1.5 max-w-xs">
              Garante a chance de invocar Habilidades Especiais, Bankais Lendárias e Hadōs Proibidos.
            </p>
          </div>

          {/* Taxas do Banner */}
          <div className="w-full bg-black/50 p-2.5 rounded-xl border border-white/5 text-[10px] font-mono text-gray-400 flex justify-around">
            <span>Rara: 35%</span>
            <span>Épica: 10%</span>
            <span className="text-amber-400 font-bold">Lendária: 2%</span>
          </div>

          <button
            onClick={() => handleSummon(50, 'skill')}
            disabled={isSummoning}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-purple-950/50"
          >
            {isSummoning ? <RefreshCw size={16} className="animate-spin" /> : <Gem size={16} />} 
            Invocar Habilidade (50 {GAME_THEME.premiumCurrencyName})
          </button>
        </div>

        {/* Banner 2: Baú Místico de Equipamentos */}
        <div className="bg-gradient-to-b from-amber-950/70 via-slate-950 to-black p-5 rounded-2xl border border-amber-500/50 shadow-xl flex flex-col justify-between items-center text-center gap-4 hover:border-amber-400 transition relative overflow-hidden group">
          <div className="absolute top-0 right-0 px-3 py-1 bg-amber-900/80 text-amber-200 text-[10px] font-extrabold font-mono rounded-bl-xl border-l border-b border-amber-500">
            {GAME_THEME.weaponTerm.toUpperCase()}S MÍSTICAS
          </div>

          <div className="mt-2">
            <div className="p-4 bg-amber-900/40 rounded-full border border-amber-400/60 text-amber-300 w-fit mx-auto mb-3 shadow-lg group-hover:scale-110 transition">
              <Gift size={32} />
            </div>
            <h4 className="font-black text-base text-amber-200">Baú Místico de {GAME_THEME.weaponTerm}</h4>
            <p className="text-xs text-gray-300 mt-1.5 max-w-xs">
              Garante 1 {GAME_THEME.weaponTerm} de alta raridade (Rara, Épica, Lendária ou Transcendente).
            </p>
          </div>

          {/* Taxas do Banner */}
          <div className="w-full bg-black/50 p-2.5 rounded-xl border border-white/5 text-[10px] font-mono text-gray-400 flex justify-around">
            <span>Rara: 35%</span>
            <span>Épica: 10%</span>
            <span className="text-red-400 font-bold">Transcendente: 0.2%</span>
          </div>

          <button
            onClick={() => handleSummon(50, 'equipment')}
            disabled={isSummoning}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-amber-950/50"
          >
            {isSummoning ? <RefreshCw size={16} className="animate-spin" /> : <Gem size={16} />} 
            Abrir Baú Místico (50 {GAME_THEME.premiumCurrencyName})
          </button>
        </div>
      </div>
    </div>
  );
};
