import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { RARITY_COLORS } from '../data/gameCatalog';
import { GAME_THEME } from '../config/themeConfig';
import type { Rarity } from '../types/game';
import { Sword, Trash2, CheckCircle, Sparkles, Filter, PackageCheck } from 'lucide-react';

export const InventoryPanel: React.FC = () => {
  const { equippedWeapon, inventory, equipItem, unequipSlot, sellItem, salvageItem, salvageAllNormalItems, autoEquipBestWeapon } = useGameStore();
  const [selectedFilter, setSelectedFilter] = useState<Rarity | 'all'>('all');

  const hasNormalItems = inventory.some((i) => i.rarity === 'normal');

  const filteredInventory = inventory.filter(
    (item) => selectedFilter === 'all' || item.rarity === selectedFilter
  );

  return (
    <div className="bg-slate-900/90 text-white p-2.5 sm:p-5 rounded-2xl border border-slate-800 flex flex-col gap-2.5 sm:gap-5 shadow-2xl backdrop-blur-md min-w-0 max-w-full">
      {/* Header com Título e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-black/60 p-2.5 sm:p-4 rounded-xl border border-amber-500/30 gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-3 bg-amber-950/80 rounded-lg sm:rounded-xl border border-amber-500/60 text-amber-400 shadow-lg animate-pulse shrink-0">
            <Sword size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold text-amber-400 truncate">
              Arsenal Espiritual & Inventário
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-400 truncate">Gerencie {GAME_THEME.weaponTerm}s e recicle sobras.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 shrink-0">
          {hasNormalItems && (
            <button
              onClick={salvageAllNormalItems}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-1 cursor-pointer"
              title="Desmontar todos os itens de raridade Normal"
            >
              ♻️ Desmontar Comuns
            </button>
          )}
          {inventory.length > 0 && (
            <button
              onClick={autoEquipBestWeapon}
              className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={13} /> Auto-Equipar Melhor
            </button>
          )}
        </div>
      </div>

      {/* Hero Display do Item Equipado com Visual de Slot Lendário */}
      <div className="bg-gradient-to-r from-slate-950 via-amber-950/30 to-slate-950 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-amber-500/50 shadow-xl relative overflow-hidden">
        <div className="text-[10px] sm:text-xs text-amber-400 font-extrabold uppercase tracking-widest mb-2 sm:mb-3 flex items-center gap-1.5">
          <PackageCheck size={14} className="shrink-0" /> {GAME_THEME.weaponTerm} Equipada no Encaixe Principal
        </div>

        {equippedWeapon ? (
          <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-black/60 p-2.5 sm:p-4 rounded-xl border border-amber-500/40 gap-2.5 sm:gap-4 backdrop-blur-md">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                <span className={`font-black text-sm sm:text-lg ${RARITY_COLORS[equippedWeapon.rarity].text} truncate`}>
                  {equippedWeapon.name}
                </span>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded bg-black border border-white/10 uppercase font-mono font-bold text-gray-300">
                  {equippedWeapon.rarity}
                </span>
              </div>
              <div className="text-[10px] sm:text-xs text-gray-300 flex flex-wrap gap-2 sm:gap-4 font-mono mt-1">
                <span>ATK Bônus: <strong className="text-red-400 font-extrabold">+{equippedWeapon.atk}</strong></span>
                <span>Crítico: <strong className="text-amber-400 font-extrabold">+{(equippedWeapon.critChance * 100).toFixed(0)}%</strong></span>
                <span>Valor: <strong className="text-emerald-400 font-extrabold">{equippedWeapon.sellPrice}</strong></span>
              </div>
            </div>

            <button
              onClick={() => unequipSlot('weapon')}
              className="px-3 py-1 sm:px-4 sm:py-2 bg-slate-800 hover:bg-slate-700 text-gray-200 font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl border border-gray-600 transition hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              Desequipar Arma
            </button>
          </div>
        ) : (
          <div className="text-[11px] sm:text-xs text-gray-500 italic p-4 sm:p-6 text-center bg-slate-950/60 rounded-xl border border-dashed border-gray-800">
            Nenhuma {GAME_THEME.weaponTerm} equipada no momento. Selecione uma abaixo!
          </div>
        )}
      </div>

      {/* Barra de Filtro de Raridades do Inventário */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
        <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Filter size={13} className="text-amber-400 shrink-0" /> Itens ({filteredInventory.length}/{inventory.length}):
        </span>

        <div className="flex gap-1 overflow-x-auto max-w-full pb-1">
          {(['all', 'normal', 'rare', 'epic', 'legendary', 'transcendent'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedFilter(r)}
              className={`text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg font-bold border uppercase transition cursor-pointer shrink-0 ${
                selectedFilter === r
                  ? 'bg-amber-500 text-black border-amber-300 shadow-md font-extrabold scale-105'
                  : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
              }`}
            >
              {r === 'all' ? 'Todos' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Grade de Itens em Cards Ricos */}
      {filteredInventory.length === 0 ? (
        <div className="text-xs text-gray-500 italic text-center p-6 bg-black/40 rounded-xl border border-white/5">
          Nenhum item encontrado nesta categoria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:gap-3 max-h-72 sm:max-h-96 overflow-y-auto pr-1">
          {filteredInventory.map((item) => {
            const rarityStyle = RARITY_COLORS[item.rarity];
            const equippedAtk = equippedWeapon ? equippedWeapon.atk : 0;
            const atkDiff = item.atk - equippedAtk;

            return (
              <div
                key={item.instanceId}
                className={`p-2.5 sm:p-4 rounded-xl border ${rarityStyle.bg} ${rarityStyle.border} backdrop-blur-md flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-3 transition hover:scale-[1.01] shadow-lg`}
              >
                <div className="min-w-0">
                  <div className={`font-extrabold text-xs sm:text-sm ${rarityStyle.text} flex items-center gap-1.5 mb-0.5 flex-wrap`}>
                    <span className="truncate">{item.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/60 border border-white/10 uppercase font-mono font-bold text-gray-300">
                      {item.rarity}
                    </span>
                    {atkDiff > 0 && (
                      <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/60 px-2 py-0.2 rounded-full font-extrabold animate-pulse">
                        🟢 +{atkDiff} ATK
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-300 flex flex-wrap gap-2.5 sm:gap-4 font-mono mt-0.5">
                    <span>ATK: <strong className="text-red-400">+{item.atk}</strong></span>
                    <span>Crit: <strong className="text-amber-400">+{(item.critChance * 100).toFixed(0)}%</strong></span>
                    <span>Valor: <strong className="text-emerald-400">{item.sellPrice}</strong></span>
                  </div>
                </div>

                <div className="flex gap-1.5 justify-end shrink-0">
                  <button
                    onClick={() => equipItem(item)}
                    className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow transition flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <CheckCircle size={13} /> Equipar
                  </button>
                  <button
                    onClick={() => salvageItem(item.instanceId)}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
                    title="Desmontar para obter matérias-primas"
                  >
                    ♻️
                  </button>
                  <button
                    onClick={() => sellItem(item.instanceId)}
                    className="p-1.5 sm:p-2 bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-800 rounded-lg sm:rounded-xl transition cursor-pointer hover:scale-105 active:scale-95"
                    title="Vender por Moedas"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
