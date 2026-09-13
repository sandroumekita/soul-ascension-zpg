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
    <div className="bg-slate-900/90 text-white p-5 rounded-2xl border border-slate-800 flex flex-col gap-5 shadow-2xl backdrop-blur-md">
      {/* Header do Painel de Habilidades com Efeito Glow */}
      <div className="flex justify-between items-center bg-black/60 p-4 rounded-xl border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-950/80 rounded-xl border border-purple-500/60 text-purple-400 shadow-lg animate-pulse">
            <Zap size={22} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-purple-400 flex items-center gap-2">
              Grimório de Habilidades Espirituais
            </h3>
            <p className="text-xs text-gray-400">Equipe técnicas ativas e transformações supremas nos slots de combate.</p>
          </div>
        </div>
      </div>

      {/* Hero Visual Display dos Slots Equipados (Cards Estilizados) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Slot 1 (Ativa) */}
        <div className={`p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between transition relative overflow-hidden ${equippedSkill1 ? 'bg-gradient-to-r from-purple-950/70 to-slate-950 border-purple-500/60 shadow-lg' : 'bg-black/40 border-dashed border-gray-800'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={14} /> {GAME_THEME.skillSlot1Label}
            </span>
            {equippedSkill1 && (
              <span className="text-[10px] bg-purple-900/80 border border-purple-500 text-purple-200 px-2 py-0.5 rounded font-mono font-bold">
                EQUIPADA
              </span>
            )}
          </div>

          {equippedSkill1 ? (
            <div>
              <div className="text-base font-extrabold text-white mb-1 flex items-center gap-2">
                {equippedSkill1.name}
                {equippedSkill1.isAoE && (
                  <span className="text-[9px] bg-red-950 border border-red-500 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                    💥 AoE ({equippedSkill1.maxTargets} Mobs)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 mb-2">{equippedSkill1.description}</p>
              <div className="flex gap-3 text-[11px] font-mono text-purple-300 bg-black/40 p-2 rounded-lg border border-white/5">
                <span>Dano: <strong>{(equippedSkill1.damageMultiplier * 100).toFixed(0)}%</strong></span>
                <span>Recarga: <strong>{equippedSkill1.cooldownSec}s</strong></span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic py-4 text-center">
              Nenhuma habilidade equipada no Slot 1.
            </div>
          )}
        </div>

        {/* Card Slot 2 (Ultimate / Bankai) */}
        <div className={`p-4 rounded-xl border backdrop-blur-md flex flex-col justify-between transition relative overflow-hidden ${equippedSkill2 ? 'bg-gradient-to-r from-amber-950/70 to-slate-950 border-amber-500/60 shadow-lg' : 'bg-black/40 border-dashed border-gray-800'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame size={14} /> {GAME_THEME.skillSlot2Label}
            </span>
            {equippedSkill2 && (
              <span className="text-[10px] bg-amber-900/80 border border-amber-500 text-amber-200 px-2 py-0.5 rounded font-mono font-bold">
                EQUIPADA
              </span>
            )}
          </div>

          {equippedSkill2 ? (
            <div>
              <div className="text-base font-extrabold text-white mb-1 flex items-center gap-2">
                {equippedSkill2.name}
                {equippedSkill2.isAoE && (
                  <span className="text-[9px] bg-red-950 border border-red-500 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                    💥 AoE ({equippedSkill2.maxTargets} Mobs)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 mb-2">{equippedSkill2.description}</p>
              <div className="flex gap-3 text-[11px] font-mono text-amber-300 bg-black/40 p-2 rounded-lg border border-white/5">
                <span>Dano: <strong>{(equippedSkill2.damageMultiplier * 100).toFixed(0)}%</strong></span>
                <span>Recarga: <strong>{equippedSkill2.cooldownSec}s</strong></span>
                {equippedSkill2.durationSec && <span>Duração: <strong>{equippedSkill2.durationSec}s</strong></span>}
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic py-4 text-center">
              Nenhuma habilidade equipada no Slot 2.
            </div>
          )}
        </div>
      </div>

      {/* Barra de Filtros de Categoria */}
      <div className="flex justify-between items-center">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Filter size={14} className="text-purple-400" /> Catálogo de Habilidades ({filteredSkills.length}):
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setFilterSlot(0)}
            className={`text-[10px] px-3 py-1 rounded-lg font-bold border uppercase transition cursor-pointer ${
              filterSlot === 0
                ? 'bg-purple-600 text-white border-purple-400 shadow-md font-extrabold scale-105'
                : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterSlot(1)}
            className={`text-[10px] px-3 py-1 rounded-lg font-bold border uppercase transition cursor-pointer ${
              filterSlot === 1
                ? 'bg-purple-600 text-white border-purple-400 shadow-md font-extrabold scale-105'
                : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            Slot 1 (Ativa)
          </button>
          <button
            onClick={() => setFilterSlot(2)}
            className={`text-[10px] px-3 py-1 rounded-lg font-bold border uppercase transition cursor-pointer ${
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
      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-1">
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
              className={`p-4 rounded-xl border backdrop-blur-md flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition hover:scale-[1.01] ${
                owned
                  ? `${rarityStyle.bg} ${rarityStyle.border} shadow-md`
                  : 'bg-black/30 border-gray-800 opacity-50 grayscale'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-extrabold text-sm ${owned ? rarityStyle.text : 'text-gray-500'}`}>
                    {skill.name}
                  </span>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 border border-white/10 uppercase font-mono font-bold text-gray-300">
                    {skill.rarity}
                  </span>

                  {owned && (
                    <span className="text-[10px] px-2 py-0.5 bg-purple-950 text-purple-300 rounded font-mono border border-purple-500/50 font-extrabold">
                      Nível {owned.level}
                    </span>
                  )}

                  {skill.isAoE && (
                    <span className="text-[9px] bg-red-950/80 border border-red-500/60 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                      💥 AoE
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-300 mb-2">{skill.description}</p>

                <div className="flex flex-wrap gap-3 text-[11px] font-mono text-gray-300">
                  <span>
                    Dano Efetivo: <strong className="text-purple-300">{(effectiveDmgMult * 100).toFixed(0)}%</strong>{' '}
                    {level > 1 && <span className="text-emerald-400 text-[10px]">(+{((level - 1) * 15)}%)</span>}
                  </span>
                  <span>Recarga: <strong className="text-amber-300">{skill.cooldownSec}s</strong></span>
                  {skill.durationSec && <span>Duração: <strong className="text-teal-300">{skill.durationSec}s</strong></span>}
                </div>
              </div>

              {/* Botões de Ação de Encaixe nos Slots */}
              {owned ? (
                <div className="flex gap-2 justify-end">
                  {skill.slotType === 1 && (
                    <button
                      onClick={() => equipSkill(skill.id, 1)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow ${
                        isEquippedSlot1
                          ? 'bg-purple-600 text-white shadow-purple-900/50'
                          : 'bg-slate-800 hover:bg-purple-950 text-purple-300 border border-purple-500/50 hover:scale-105'
                      }`}
                    >
                      {isEquippedSlot1 ? <Check size={14} /> : null} {isEquippedSlot1 ? 'Equipada (Slot 1)' : 'Equipar Slot 1'}
                    </button>
                  )}

                  {skill.slotType === 2 && (
                    <button
                      onClick={() => equipSkill(skill.id, 2)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow ${
                        isEquippedSlot2
                          ? 'bg-amber-600 text-white shadow-amber-900/50'
                          : 'bg-slate-800 hover:bg-amber-950 text-amber-300 border border-amber-500/50 hover:scale-105'
                      }`}
                    >
                      {isEquippedSlot2 ? <Check size={14} /> : null} {isEquippedSlot2 ? 'Equipada (Slot 2)' : 'Equipar Slot 2'}
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-600 italic font-mono bg-black/40 px-3 py-1 rounded border border-gray-800">
                  🔒 Bloqueada (Obtenha no Gacha ou Boss)
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
