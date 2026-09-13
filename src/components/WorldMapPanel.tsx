import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { BIOMES_CATALOG } from '../data/gameCatalog';
import type { Difficulty } from '../types/game';
import { MapPin, Lock, CheckCircle2, Trophy, ShieldAlert } from 'lucide-react';

export const WorldMapPanel: React.FC = () => {
  const {
    currentBiomeId,
    difficulty,
    biomeStage,
    unlockedBiomes,
    unlockedDifficulties,
    changeBiome,
    changeDifficulty,
  } = useGameStore();

  const difficultiesList: { id: Difficulty; name: string; mult: string; color: string }[] = [
    { id: 'normal', name: 'Normal', mult: '1.0x Dano/HP', color: 'border-gray-600 bg-gray-900/60 text-gray-300' },
    { id: 'hard', name: 'Hard', mult: '3.5x Dano/HP', color: 'border-blue-500 bg-blue-950/60 text-blue-300' },
    { id: 'nightmare', name: 'Nightmare', mult: '12.0x Dano/HP', color: 'border-purple-500 bg-purple-950/60 text-purple-300' },
    { id: 'hell', name: 'Hell (Transcendente)', mult: '50.0x Dano/HP', color: 'border-red-500 bg-red-950/80 text-red-400 font-bold' },
  ];

  return (
    <div className="bg-slate-900/90 text-white p-5 rounded-2xl border border-slate-800 flex flex-col gap-6 shadow-2xl backdrop-blur-md">
      {/* Header do Mapa */}
      <div className="flex justify-between items-center bg-black/50 p-4 rounded-xl border border-amber-500/30">
        <div>
          <h3 className="text-lg font-extrabold text-amber-400 flex items-center gap-2">
            <MapPin size={20} /> Mapa do Mundo Espiritual (World Map)
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Avance pelas 10 fases de cada bioma. Derrote o Boss no Estágio 10 para desbloquear o próximo mundo!
          </p>
        </div>
        <div className="text-right font-mono text-xs text-gray-300 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-500/40">
          Dificuldade Ativa: <span className="text-amber-400 font-bold uppercase">{difficulty}</span>
        </div>
      </div>

      {/* Seleção de Dificuldade com Trava de Progresso */}
      <div>
        <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Trophy size={14} className="text-amber-400" /> Dificuldades Globais (Derrote o Aizen para Liberar a Próxima)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {difficultiesList.map((diff) => {
            const isUnlocked = unlockedDifficulties.includes(diff.id);
            const isSelected = difficulty === diff.id;
            return (
              <button
                key={diff.id}
                onClick={() => isUnlocked && changeDifficulty(diff.id)}
                disabled={!isUnlocked}
                className={`p-3 rounded-xl border text-xs font-semibold text-center transition flex flex-col items-center justify-center gap-1 relative ${
                  isSelected
                    ? 'ring-2 ring-amber-400 shadow-xl border-amber-400 bg-amber-950/60'
                    : isUnlocked
                    ? `${diff.color} hover:scale-[1.02] cursor-pointer`
                    : 'bg-black/40 border-gray-800 text-gray-600 opacity-50 cursor-not-allowed'
                }`}
              >
                {!isUnlocked && <Lock size={14} className="text-gray-500 absolute top-2 right-2" />}
                <div className="font-extrabold">{diff.name}</div>
                <div className="text-[10px] opacity-80">{diff.mult}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Linha do Tempo / Trilho dos Biomas */}
      <div>
        <h4 className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-3">
          Trilha de Progresso dos Biomas (10 Fases por Mundo)
        </h4>

        <div className="flex flex-col gap-4">
          {BIOMES_CATALOG.map((biome) => {
            const isUnlocked = unlockedBiomes.includes(biome.id);
            const isCurrent = currentBiomeId === biome.id;

            return (
              <div
                key={biome.id}
                onClick={() => isUnlocked && changeBiome(biome.id)}
                className={`p-4 rounded-2xl border transition relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r ${biome.bgGradient} ${
                  isCurrent
                    ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-2xl'
                    : isUnlocked
                    ? 'border-white/10 hover:border-white/30 cursor-pointer opacity-90'
                    : 'border-slate-800 opacity-40 grayscale cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-4 z-10">
                  {/* Ícone de Estado */}
                  <div className={`p-3 rounded-xl border ${isCurrent ? 'bg-amber-500 text-black border-amber-300' : isUnlocked ? 'bg-slate-900 text-cyan-400 border-cyan-500/40' : 'bg-black text-gray-600 border-gray-800'}`}>
                    {isCurrent ? <CheckCircle2 size={24} /> : isUnlocked ? <MapPin size={24} /> : <Lock size={24} />}
                  </div>

                  <div>
                    <span className="text-[10px] text-amber-300 font-mono font-bold uppercase tracking-widest block">{biome.japaneseName}</span>
                    <h4 className="text-base font-extrabold text-white">{biome.name}</h4>
                    <p className="text-xs text-gray-300 max-w-sm mt-0.5">{biome.description}</p>
                  </div>
                </div>

                {/* Status da Fases / Botão de Acesso */}
                <div className="z-10 flex flex-col items-end gap-2 w-full sm:w-auto">
                  {isUnlocked ? (
                    <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-xs w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-gray-400">Progresso de Fases:</span>
                      <span className="text-amber-400 font-bold font-mono">
                        {isCurrent ? `${biomeStage} / 10` : '10 / 10 (Concluído)'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold bg-red-950/60 px-3 py-1 rounded border border-red-800/50">
                      <ShieldAlert size={14} /> Bioma Bloqueado
                    </div>
                  )}

                  {isCurrent && (
                    <span className="text-[11px] font-extrabold px-3 py-0.5 bg-amber-400 text-slate-950 rounded-full uppercase shadow">
                      Mundo Ativo
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
