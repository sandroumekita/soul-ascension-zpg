import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { BIOMES_CATALOG } from '../data/gameCatalog';
import type { Difficulty } from '../types/game';
import { MapPin, Flame } from 'lucide-react';

export const BiomeSelectorPanel: React.FC = () => {
  const { currentBiomeId, difficulty, changeBiome, changeDifficulty } = useGameStore();

  const difficulties: { id: Difficulty; name: string; mult: string; color: string }[] = [
    { id: 'normal', name: 'Normal', mult: '1.0x Status', color: 'bg-gray-800 text-gray-300 border-gray-600' },
    { id: 'hard', name: 'Hard', mult: '3.5x Status', color: 'bg-blue-950 text-blue-300 border-blue-500' },
    { id: 'nightmare', name: 'Nightmare', mult: '12.0x Status', color: 'bg-purple-950 text-purple-300 border-purple-500' },
    { id: 'hell', name: 'Hell (Transcendent)', mult: '50.0x Status', color: 'bg-red-950 text-red-400 border-red-500 font-bold' },
  ];

  return (
    <div className="bg-slate-900/90 text-white p-4 rounded-xl border border-slate-800 flex flex-col gap-4 shadow-xl">
      {/* Seleção de Dificuldade */}
      <div>
        <h4 className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
          <Flame size={14} /> Seleção de Dificuldade do Bioma
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {difficulties.map((diff) => (
            <button
              key={diff.id}
              onClick={() => changeDifficulty(diff.id)}
              className={`p-2.5 rounded-lg border text-xs text-center transition ${diff.color} ${
                difficulty === diff.id ? 'ring-2 ring-amber-400 shadow-lg scale-[1.02]' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className="font-bold">{diff.name}</div>
              <div className="text-[10px] mt-0.5 opacity-80">{diff.mult}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Seleção de Biomas */}
      <div>
        <h4 className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
          <MapPin size={14} /> Mundos & Biomas Disponíveis
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BIOMES_CATALOG.map((biome) => {
            const isSelected = currentBiomeId === biome.id;
            return (
              <div
                key={biome.id}
                onClick={() => changeBiome(biome.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex justify-between items-center bg-gradient-to-r ${biome.bgGradient} ${
                  isSelected ? 'border-amber-400 ring-2 ring-amber-400 shadow-xl' : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <div>
                  <span className="text-[10px] text-amber-400 font-mono block uppercase">{biome.japaneseName}</span>
                  <h5 className="font-bold text-sm text-white">{biome.name}</h5>
                  <p className="text-xs text-gray-300 mt-1 max-w-xs">{biome.description}</p>
                </div>
                {isSelected && (
                  <span className="text-xs font-bold px-2 py-1 bg-amber-500 text-black rounded uppercase">
                    Atual
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
