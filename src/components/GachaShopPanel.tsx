import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { GAME_THEME } from '../config/themeConfig';
import { Gem, Sparkles, Gift } from 'lucide-react';

export const GachaShopPanel: React.FC = () => {
  const { stats, summonGacha } = useGameStore();
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleSummon = (cost: number) => {
    if (stats.gems < cost) {
      setResultMessage(`❌ ${GAME_THEME.premiumCurrencyName} insuficientes! Derrote Bosses para ganhar mais!`);
      return;
    }

    const res = summonGacha(cost);
    if (res.skill) {
      setResultMessage(`🌟 INVOCAÇÃO ESPIRITUAL! Você obteve a Habilidade: ${res.skill} ${res.isDuplicate ? '(Nível Aumentado!)' : ''}`);
    } else if (res.item) {
      setResultMessage(`🎁 BAÚ MÍSTICO! Você encontrou: ${res.item.name}!`);
    }
  };

  return (
    <div className="bg-slate-900/90 text-white p-4 rounded-xl border border-slate-800 flex flex-col gap-4 shadow-xl">
      <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-purple-500/30">
        <div>
          <h3 className="text-base font-bold text-purple-400 flex items-center gap-2">
            <Sparkles size={18} /> Invocação Espiritual & Loja Gacha
          </h3>
          <p className="text-xs text-gray-400">Invoque novas Habilidades e Baús Místicos com {GAME_THEME.premiumCurrencyName}</p>
        </div>
        <div className="bg-purple-950/80 px-3 py-1.5 rounded border border-purple-500 text-purple-300 font-mono text-sm flex items-center gap-1 font-bold">
          <Gem size={16} className="text-purple-400" /> {stats.gems} {GAME_THEME.premiumCurrencyName}
        </div>
      </div>

      {resultMessage && (
        <div className="bg-purple-950/90 border border-purple-500 text-purple-200 text-xs p-3 rounded-lg animate-fade-in text-center font-bold">
          {resultMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner 1: Invocação de Bankai / Skills */}
        <div className="bg-gradient-to-b from-purple-950/60 to-black p-4 rounded-xl border border-purple-500/40 flex flex-col justify-between items-center text-center gap-3">
          <div>
            <div className="p-3 bg-purple-900/50 rounded-full border border-purple-400 text-purple-300 w-fit mx-auto mb-2">
              <Sparkles size={24} />
            </div>
            <h4 className="font-bold text-sm text-purple-300">Banner: Bankai dos 13 Esquadrões</h4>
            <p className="text-xs text-gray-400 mt-1">Garante a chance de invocar Bankais Lendários e Hadōs Proibidos!</p>
          </div>
          <button
            onClick={() => handleSummon(50)}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs rounded-lg shadow-lg transition flex items-center justify-center gap-1"
          >
            <Gem size={14} /> Invocação Single (50 Orbs)
          </button>
        </div>

        {/* Banner 2: Baú Místico de Zanpakuto */}
        <div className="bg-gradient-to-b from-amber-950/60 to-black p-4 rounded-xl border border-amber-500/40 flex flex-col justify-between items-center text-center gap-3">
          <div>
            <div className="p-3 bg-amber-900/50 rounded-full border border-amber-400 text-amber-300 w-fit mx-auto mb-2">
              <Gift size={24} />
            </div>
            <h4 className="font-bold text-sm text-amber-300">Baú Místico de Zanpakuto</h4>
            <p className="text-xs text-gray-400 mt-1">Garante 1 Zanpakuto de Tier Raro, Épico, Lendário ou Transcendente!</p>
          </div>
          <button
            onClick={() => handleSummon(50)}
            className="w-full py-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 font-bold text-xs rounded-lg shadow-lg transition flex items-center justify-center gap-1"
          >
            <Gem size={14} /> Abrir Baú Místico (50 Orbs)
          </button>
        </div>
      </div>
    </div>
  );
};
