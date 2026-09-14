import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { SKILLS_CATALOG, RARITY_COLORS } from '../data/gameCatalog';
import { GAME_THEME } from '../config/themeConfig';
import { Check, Zap, Flame, Filter } from 'lucide-react';

export const SkillsPanel: React.FC = () => {
  const { ownedSkills, equippedSlot1SkillId, equippedSlot2SkillId, equipSkill } = useGameStore();
  const [filterSlot, setFilterSlot] = useState<0 | 1 | 2>(0); // 0 = Todos, 1 = Slot 1, 2 = Slot 2

  const equippedSkill1 = SKILLS_CATALOG.find((s) => s.id === equippedSlot1SkillId);
  const equippedSkill2 = SKILLS_CATALOG.find((s) => s.id === equippedSlot2SkillId);

  const filteredSkills = SKILLS_CATALOG.filter((s) => filterSlot === 0 || s.slotType === filterSlot);

  return (
    <div className="bg-slate-900/90 text-white p-2.5 sm:p-5 rounded-2xl border border-slate-800 flex flex-col gap-2.5 sm:gap-5 shadow-2xl backdrop-blur-md min-w-0 max-w-full">
      {/* Header do Painel de Habilidades com Efeito Glow */}
      <div className="flex justify-between items-center bg-black/60 p-2.5 sm:p-4 rounded-xl border border-purple-500/30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-3 bg-purple-950/80 rounded-lg sm:rounded-xl border border-purple-500/60 text-purple-400 shadow-lg animate-pulse shrink-0">
            <Zap size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold text-purple-400 truncate">
              Grimório de Habilidades Espirituais
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-400 truncate">Equipe técnicas ativas e transformações supremas.</p>
          </div>
        </div>
      </div>

      {/* Hero Visual Display dos Slots Equipados (2 colunas no mobile para caber na primeira dobra) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {/* Card Slot 1 (Ativa) */}
        <div className={`p-2.5 sm:p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between transition relative overflow-hidden ${equippedSkill1 ? 'bg-gradient-to-r from-purple-950/70 to-slate-950 border-purple-500/60 shadow-lg' : 'bg-black/40 border-dashed border-gray-800'}`}>
          <div className="flex justify-between items-center mb-1 sm:mb-2 min-w-0 gap-1">
            <span className="text-[9px] sm:text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1 min-w-0">
              <Zap size={12} className="shrink-0" />
              <span className="truncate hidden sm:inline">{GAME_THEME.skillSlot1Label}</span>
              <span className="truncate sm:hidden">Slot 1 (Ativa)</span>
            </span>
            {equippedSkill1 && (
              <span className="text-[8px] sm:text-[10px] bg-purple-900/80 border border-purple-500 text-purple-200 px-1.5 py-0.2 rounded font-mono font-bold shrink-0">
                EQUIPADA
              </span>
            )}
          </div>

          {equippedSkill1 ? (
            <div>
              <div className="text-xs sm:text-base font-extrabold text-white mb-0.5 flex items-center gap-1 flex-wrap">
                <span className="truncate">{equippedSkill1.name}</span>
                {equippedSkill1.isAoE && (
                  <span className="text-[8px] bg-red-950 border border-red-500 text-amber-300 px-1 py-0.2 rounded font-bold">
                    AoE
                  </span>
                )}
              </div>
              <p className="hidden sm:block text-xs text-gray-300 mb-2">{equippedSkill1.description}</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-3 text-[9px] sm:text-[11px] font-mono text-purple-300 bg-black/40 p-1.5 sm:p-2 rounded-lg border border-white/5">
                <span>Dano: <strong>{(equippedSkill1.damageMultiplier * 100).toFixed(0)}%</strong></span>
                <span>CD: <strong>{equippedSkill1.cooldownSec}s</strong></span>
              </div>
            </div>
          ) : (
            <div className="text-[10px] sm:text-xs text-gray-500 italic py-2 sm:py-4 text-center">
              Slot 1 vazio.
            </div>
          )}
        </div>

        {/* Card Slot 2 (Ultimate / Bankai) */}
        <div className={`p-2.5 sm:p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between transition relative overflow-hidden ${equippedSkill2 ? 'bg-gradient-to-r from-amber-950/70 to-slate-950 border-amber-500/60 shadow-lg' : 'bg-black/40 border-dashed border-gray-800'}`}>
          <div className="flex justify-between items-center mb-1 sm:mb-2 min-w-0 gap-1">
            <span className="text-[9px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 min-w-0">
              <Flame size={12} className="shrink-0" />
              <span className="truncate hidden sm:inline">{GAME_THEME.skillSlot2Label}</span>
              <span className="truncate sm:hidden">Slot 2 (Bankai)</span>
            </span>
            {equippedSkill2 && (
              <span className="text-[8px] sm:text-[10px] bg-amber-900/80 border border-amber-500 text-amber-200 px-1.5 py-0.2 rounded font-mono font-bold shrink-0">
                EQUIPADA
              </span>
            )}
          </div>

          {equippedSkill2 ? (
            <div>
              <div className="text-xs sm:text-base font-extrabold text-white mb-0.5 flex items-center gap-1 flex-wrap">
                <span className="truncate">{equippedSkill2.name}</span>
                {equippedSkill2.isAoE && (
                  <span className="text-[8px] bg-red-950 border border-red-500 text-amber-300 px-1 py-0.2 rounded font-bold">
                    AoE
                  </span>
                )}
              </div>
              <p className="hidden sm:block text-xs text-gray-300 mb-2">{equippedSkill2.description}</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-3 text-[9px] sm:text-[11px] font-mono text-amber-300 bg-black/40 p-1.5 sm:p-2 rounded-lg border border-white/5">
                <span>Dano: <strong>{(equippedSkill2.damageMultiplier * 100).toFixed(0)}%</strong></span>
                <span>CD: <strong>{equippedSkill2.cooldownSec}s</strong></span>
                {equippedSkill2.durationSec && <span>Dur: <strong>{equippedSkill2.durationSec}s</strong></span>}
              </div>
            </div>
          ) : (
            <div className="text-[10px] sm:text-xs text-gray-500 italic py-2 sm:py-4 text-center">
              Slot 2 vazio.
            </div>
          )}
        </div>
      </div>

      {/* Barra de Filtros de Categoria */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
        <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Filter size={13} className="text-purple-400 shrink-0" /> Catálogo ({filteredSkills.length}):
        </div>

        <div className="flex gap-1 overflow-x-auto max-w-full pb-1">
          <button
            onClick={() => setFilterSlot(0)}
            className={`text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg font-bold border uppercase transition cursor-pointer shrink-0 ${
              filterSlot === 0
                ? 'bg-purple-600 text-white border-purple-400 shadow-md font-extrabold scale-105'
                : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterSlot(1)}
            className={`text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg font-bold border uppercase transition cursor-pointer shrink-0 ${
              filterSlot === 1
                ? 'bg-purple-600 text-white border-purple-400 shadow-md font-extrabold scale-105'
                : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            Slot 1 (Ativa)
          </button>
          <button
            onClick={() => setFilterSlot(2)}
            className={`text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg font-bold border uppercase transition cursor-pointer shrink-0 ${
              filterSlot === 2
                ? 'bg-amber-600 text-white border-amber-400 shadow-md font-extrabold scale-105'
                : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            Slot 2 (Bankai)
          </button>
        </div>
      </div>

      {/* Lista Estilizada de Habilidades em Cards */}
      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        {filteredSkills.map((skill) => {
          const owned = ownedSkills[skill.id];
          const level = owned ? owned.level : 1;
          const effectiveDmgMult = skill.damageMultiplier * (1 + (level - 1) * 0.15);
          const isEquippedSlot1 = equippedSlot1SkillId === skill.id;
          const isEquippedSlot2 = equippedSlot2SkillId === skill.id;
          const rarityStyle = RARITY_COLORS[skill.rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.normal;

          return (
            <div
              key={skill.id}
              className={`p-2.5 sm:p-4 rounded-xl border backdrop-blur-md flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-3 transition hover:scale-[1.01] ${
                owned
                  ? `${rarityStyle.bg} ${rarityStyle.border} shadow-md`
                  : 'bg-black/30 border-gray-800 opacity-50 grayscale'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className={`font-extrabold text-xs sm:text-sm ${owned ? rarityStyle.text : 'text-gray-500'} truncate`}>
                    {skill.name}
                  </span>

                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/60 border border-white/10 uppercase font-mono font-bold text-gray-300">
                    {skill.rarity}
                  </span>

                  {owned && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-purple-950 text-purple-300 rounded font-mono border border-purple-500/50 font-extrabold">
                      Nível {owned.level}
                    </span>
                  )}

                  {skill.isAoE && (
                    <span className="text-[8px] bg-red-950/80 border border-red-500/60 text-amber-300 px-1 py-0.2 rounded font-bold">
                      💥 AoE
                    </span>
                  )}
                </div>

                <p className="text-[10px] sm:text-xs text-gray-300 mb-1.5 line-clamp-2 sm:line-clamp-none">{skill.description}</p>

                <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono text-gray-300">
                  <span>
                    Dano: <strong className="text-purple-300">{(effectiveDmgMult * 100).toFixed(0)}%</strong>{' '}
                    {level > 1 && <span className="text-emerald-400 text-[9px]">(+{((level - 1) * 15)}%)</span>}
                  </span>
                  <span>CD: <strong className="text-amber-300">{skill.cooldownSec}s</strong></span>
                  {skill.durationSec && <span>Dur: <strong className="text-teal-300">{skill.durationSec}s</strong></span>}
                </div>
              </div>

              {/* Botões de Ação de Encaixe nos Slots */}
              {owned ? (
                <div className="flex gap-1.5 justify-end shrink-0">
                  {skill.slotType === 1 && (
                    <button
                      onClick={() => equipSkill(skill.id, 1)}
                      className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition flex items-center gap-1 cursor-pointer shadow ${
                        isEquippedSlot1
                          ? 'bg-purple-600 text-white shadow-purple-900/50'
                          : 'bg-slate-800 hover:bg-purple-950 text-purple-300 border border-purple-500/50 hover:scale-105'
                      }`}
                    >
                      {isEquippedSlot1 ? <Check size={13} /> : null} {isEquippedSlot1 ? 'Slot 1 Ativo' : 'Equipar Slot 1'}
                    </button>
                  )}

                  {skill.slotType === 2 && (
                    <button
                      onClick={() => equipSkill(skill.id, 2)}
                      className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition flex items-center gap-1 cursor-pointer shadow ${
                        isEquippedSlot2
                          ? 'bg-amber-600 text-white shadow-amber-900/50'
                          : 'bg-slate-800 hover:bg-amber-950 text-amber-300 border border-amber-500/50 hover:scale-105'
                      }`}
                    >
                      {isEquippedSlot2 ? <Check size={13} /> : null} {isEquippedSlot2 ? 'Bankai Ativa' : 'Equipar Slot 2'}
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-gray-600 italic font-mono bg-black/40 px-2 py-0.5 rounded border border-gray-800 self-start sm:self-auto">
                  🔒 Bloqueada
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
