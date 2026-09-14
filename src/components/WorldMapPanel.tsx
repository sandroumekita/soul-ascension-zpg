import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { BIOMES_CATALOG } from '../data/gameCatalog';
import type { Difficulty } from '../types/game';
import { MapPin, Lock, CheckCircle2, Trophy, ShieldAlert, Swords, Skull, Flame, Sparkles } from 'lucide-react';

const difficultiesList: { id: Difficulty; name: string; mult: string; badge: string; color: string }[] = [
  { id: 'normal', name: 'Normal', mult: '1.0x Stats Inimigos', badge: 'Iniciante (Dia 1-2)', color: 'border-slate-700 bg-slate-900/60 text-slate-300' },
  { id: 'hard', name: 'Hard', mult: '8.5x Stats Inimigos', badge: 'Intermediário (Dia 3-5)', color: 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300' },
  { id: 'nightmare', name: 'Nightmare', mult: '65.0x Stats Inimigos', badge: 'Veterano (Dia 6-9)', color: 'border-purple-500/50 bg-purple-950/60 text-purple-300' },
  { id: 'hell', name: 'Hell (Transcendente)', mult: '500.0x Stats Inimigos', badge: 'Supremo (Dia 10-14)', color: 'border-red-500/60 bg-red-950/80 text-red-400 font-bold' },
];

export const WorldMapPanel: React.FC = () => {
  const {
    currentBiomeId,
    difficulty,
    biomeStage,
    unlockedBiomes,
    unlockedDifficulties,
    changeBiome,
    changeDifficulty,
  } = useGameStore(useShallow((state) => ({
    currentBiomeId: state.currentBiomeId,
    difficulty: state.difficulty,
    biomeStage: state.biomeStage,
    unlockedBiomes: state.unlockedBiomes,
    unlockedDifficulties: state.unlockedDifficulties,
    changeBiome: state.changeBiome,
    changeDifficulty: state.changeDifficulty,
  })));

  return (
    <div className="bg-slate-950/90 text-white p-5 rounded-2xl border border-slate-800 flex flex-col gap-6 shadow-2xl backdrop-blur-md">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 p-5 rounded-xl border border-amber-500/30 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-9xl">
          🗺️
        </div>

        <div className="z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest">
              Exploração Espiritual
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Fase Ativa: <strong className="text-amber-400 font-extrabold">{biomeStage} / 10</strong>
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-white flex items-center gap-2 mt-1">
            <MapPin className="text-amber-400" size={22} /> Mapa de Mundos Espirituais
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Escolha seu campo de batalha, enfrente a horda inimiga e elimine o Boss no Estágio 10 para conquistar a vitória e avançar!
          </p>
        </div>

        <div className="z-10 text-right bg-slate-950/80 px-4 py-2.5 rounded-xl border border-amber-500/30 flex flex-col items-end">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Dificuldade Ativa</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Flame size={14} className="text-amber-400 animate-pulse" />
            <span className="text-sm font-extrabold text-amber-400 uppercase tracking-wide">{difficulty}</span>
          </div>
          <span className="text-[10px] text-amber-300/80 font-mono mt-0.5">
            {difficultiesList.find((d) => d.id === difficulty)?.mult}
          </span>
        </div>
      </div>

      {/* Difficulties Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Trophy size={15} className="text-amber-400" /> Dificuldades Globais
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">
            Derrote o Boss Supremo para desbloquear o próximo nível
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {difficultiesList.map((diff) => {
            const isUnlocked = unlockedDifficulties.includes(diff.id);
            const isSelected = difficulty === diff.id;
            return (
              <button
                key={diff.id}
                onClick={() => isUnlocked && changeDifficulty(diff.id)}
                disabled={!isUnlocked}
                className={`p-3.5 rounded-xl border text-xs font-semibold text-left transition relative flex flex-col justify-between gap-2 overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-amber-400/90 shadow-xl border-amber-400 bg-gradient-to-b from-amber-950/80 to-slate-950'
                    : isUnlocked
                    ? `${diff.color} hover:scale-[1.02] cursor-pointer hover:border-amber-400/50`
                    : 'bg-slate-950/40 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                }`}
              >
                {!isUnlocked && (
                  <div className="absolute top-2 right-2 bg-slate-900/90 p-1 rounded border border-slate-800">
                    <Lock size={13} className="text-slate-500" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-100">{diff.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {diff.badge}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-75 mt-0.5 font-mono">{diff.mult}</p>
                </div>

                {isSelected && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase mt-1">
                    <Sparkles size={12} /> Ativo Agora
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Biomes List */}
      <div>
        <h4 className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
          <Swords size={15} /> Biomas Espirituais ({BIOMES_CATALOG.length} Regiões)
        </h4>

        <div className="grid grid-cols-1 gap-4">
          {BIOMES_CATALOG.map((biome) => {
            const isUnlocked = unlockedBiomes.includes(biome.id);
            const isCurrent = currentBiomeId === biome.id;

            return (
              <div
                key={biome.id}
                onClick={() => isUnlocked && changeBiome(biome.id)}
                className={`p-5 rounded-2xl border transition relative overflow-hidden flex flex-col lg:flex-row justify-between gap-5 bg-gradient-to-r ${biome.bgGradient} ${
                  isCurrent
                    ? 'border-amber-400 ring-2 ring-amber-400/70 shadow-2xl'
                    : isUnlocked
                    ? 'border-slate-800 hover:border-slate-600 cursor-pointer opacity-90 hover:opacity-100'
                    : 'border-slate-900 opacity-40 grayscale cursor-not-allowed'
                }`}
              >
                {/* Visual Glass Overlay */}
                <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

                {/* Left Info Section */}
                <div className="flex items-start gap-4 z-10 flex-1">
                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-center shrink-0 text-2xl shadow-inner ${
                      isCurrent
                        ? 'bg-amber-500/20 text-amber-400 border-amber-400/60'
                        : isUnlocked
                        ? 'bg-slate-900/80 text-cyan-400 border-slate-700'
                        : 'bg-slate-950 text-slate-700 border-slate-800'
                    }`}
                  >
                    {isCurrent ? <CheckCircle2 size={28} className="text-amber-400" /> : isUnlocked ? <MapPin size={28} /> : <Lock size={28} />}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-amber-300 font-mono font-bold uppercase tracking-widest bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
                        {biome.japaneseName}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-full uppercase shadow">
                          Mundo Ativo
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-extrabold text-white tracking-wide">{biome.name}</h4>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">{biome.description}</p>

                    {/* Mobs Preview list */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono uppercase font-bold flex items-center gap-1">
                        <Swords size={11} /> Mobs:
                      </span>
                      {biome.enemies.map((enemy, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-slate-900/80 border border-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1"
                        >
                          <span>{enemy.avatarIcon}</span>
                          <span>{enemy.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Boss & Stage Preview */}
                <div className="z-10 flex flex-col justify-between items-start lg:items-end gap-3 min-w-[220px]">
                  {/* Boss Box */}
                  <div className="bg-slate-950/80 border border-red-500/30 p-3 rounded-xl w-full flex items-center gap-3">
                    <div className="text-2xl bg-red-950/60 p-2 rounded-lg border border-red-500/40 text-center shrink-0">
                      {biome.boss.avatarIcon}
                    </div>
                    <div>
                      <div className="text-[9px] text-red-400 font-mono uppercase tracking-wider font-bold flex items-center gap-1">
                        <Skull size={10} /> Boss Final (Estágio 10)
                      </div>
                      <div className="text-xs font-extrabold text-white">{biome.boss.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        HP: {biome.boss.hpBase.toLocaleString()} | ATK: {biome.boss.atkBase}
                      </div>
                    </div>
                  </div>

                  {/* Stage Progress */}
                  <div className="w-full flex items-center justify-between lg:justify-end gap-3 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    {isUnlocked ? (
                      <>
                        <span className="text-slate-400 font-mono">Progresso:</span>
                        <span className="text-amber-400 font-bold font-mono text-sm">
                          {isCurrent ? `Estágio ${biomeStage} / 10` : '10 / 10 (Concluído)'}
                        </span>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold w-full justify-center">
                        <ShieldAlert size={14} /> Bioma Bloqueado
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

