import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { SKILLS_CATALOG, RARITY_COLORS } from '../data/gameCatalog';
import { Sparkles, Check } from 'lucide-react';

export const SkillsPanel: React.FC = () => {
  const { ownedSkills, equippedSlot1SkillId, equippedSlot2SkillId, equipSkill } = useGameStore();

  return (
    <div className="bg-slate-900/90 text-white p-4 rounded-xl border border-slate-800 flex flex-col gap-4 shadow-xl">
      <h3 className="text-base font-bold flex items-center gap-2 text-purple-400">
        <Sparkles size={18} /> Coleção de Habilidades & Bankai
      </h3>

      {/* Slots Ativos Atualmente Equipados */}
      <div className="grid grid-cols-2 gap-3 bg-black/40 p-3 rounded-lg border border-purple-500/30">
        {/* Slot 1 */}
        <div className="bg-slate-950 p-2.5 rounded border border-purple-500/40">
          <div className="text-[10px] text-purple-400 font-semibold uppercase">Slot 1: Habilidade Ativa</div>
          <div className="text-xs font-bold text-white mt-1">
            {equippedSlot1SkillId
              ? SKILLS_CATALOG.find((s) => s.id === equippedSlot1SkillId)?.name
              : 'Nenhuma equipada'}
          </div>
        </div>

        {/* Slot 2 */}
        <div className="bg-slate-950 p-2.5 rounded border border-amber-500/40">
          <div className="text-[10px] text-amber-400 font-semibold uppercase">Slot 2: Modo Bankai</div>
          <div className="text-xs font-bold text-white mt-1">
            {equippedSlot2SkillId
              ? SKILLS_CATALOG.find((s) => s.id === equippedSlot2SkillId)?.name
              : 'Nenhuma equipada'}
          </div>
        </div>
      </div>

      {/* Catálogo Geral de Habilidades Desbloqueadas */}
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
        {SKILLS_CATALOG.map((skill) => {
          const owned = ownedSkills[skill.id];
          const isEquippedSlot1 = equippedSlot1SkillId === skill.id;
          const isEquippedSlot2 = equippedSlot2SkillId === skill.id;
          const rarityStyle = RARITY_COLORS[skill.rarity];

          return (
            <div
              key={skill.id}
              className={`p-3 rounded-lg border flex justify-between items-center transition ${
                owned ? `${rarityStyle.bg} ${rarityStyle.border}` : 'bg-black/20 border-gray-800 opacity-50'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${owned ? rarityStyle.text : 'text-gray-500'}`}>
                    {skill.name}
                  </span>
                  {owned && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-purple-950 text-purple-300 rounded font-mono border border-purple-500/40">
                      Nv. {owned.level}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 max-w-xs">{skill.description}</div>
                <div className="text-[10px] text-gray-500 mt-1 flex gap-3">
                  <span>Dano: <strong className="text-purple-300">{(skill.damageMultiplier * 100).toFixed(0)}%</strong></span>
                  <span>Cooldown: <strong className="text-amber-300">{skill.cooldownSec}s</strong></span>
                </div>
              </div>

              {owned ? (
                <div className="flex gap-2">
                  {skill.slotType === 1 && (
                    <button
                      onClick={() => equipSkill(skill.id, 1)}
                      className={`px-2.5 py-1 text-xs font-bold rounded transition flex items-center gap-1 ${
                        isEquippedSlot1
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 hover:bg-purple-950 text-purple-300 border border-purple-500/50'
                      }`}
                    >
                      {isEquippedSlot1 ? <Check size={12} /> : null} Slot 1
                    </button>
                  )}
                  {skill.slotType === 2 && (
                    <button
                      onClick={() => equipSkill(skill.id, 2)}
                      className={`px-2.5 py-1 text-xs font-bold rounded transition flex items-center gap-1 ${
                        isEquippedSlot2
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 hover:bg-amber-950 text-amber-300 border border-amber-500/50'
                      }`}
                    >
                      {isEquippedSlot2 ? <Check size={12} /> : null} Bankai
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-600 italic">Bloqueada (Gacha / Boss)</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
