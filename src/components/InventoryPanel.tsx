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
    <div className="bg-slate-900/90 text-white p-5 rounded-2xl border border-slate-800 flex flex-col gap-5 shadow-2xl backdrop-blur-md">
      {/* Header com Título e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-black/60 p-4 rounded-xl border border-amber-500/30 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-950/80 rounded-xl border border-amber-500/60 text-amber-400 shadow-lg animate-pulse">
            <Sword size={22} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
              Arsenal Espiritual & Inventário
            </h3>
            <p className="text-xs text-gray-400">Gerencie suas {GAME_THEME.weaponTerm}s, equipe o melhor item e recicle sobras.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasNormalItems && (
            <button
              onClick={salvageAllNormalItems}
              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 font-bold text-xs rounded-xl shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-1 cursor-pointer"
              title="Desmontar todos os itens de raridade Normal de uma só vez"
            >
              ♻️ Desmontar Comuns
            </button>
          )}
          {inventory.length > 0 && (
            <button
              onClick={autoEquipBestWeapon}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={15} /> Auto-Equipar Melhor
            </button>
          )}
        </div>
      </div>

      {/* Hero Display do Item Equipado com Visual de Slot Lendário */}
      <div className="bg-gradient-to-r from-slate-950 via-amber-950/30 to-slate-950 p-5 rounded-2xl border border-amber-500/50 shadow-xl relative overflow-hidden">
        <div className="text-xs text-amber-400 font-extrabold uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <PackageCheck size={16} /> {GAME_THEME.weaponTerm} Equipada no Encaixe Principal
        </div>

        {equippedWeapon ? (
          <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-black/60 p-4 rounded-xl border border-amber-500/40 gap-4 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-black text-lg ${RARITY_COLORS[equippedWeapon.rarity].text}`}>
                  {equippedWeapon.name}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded bg-black border border-white/10 uppercase font-mono font-bold text-gray-300">
                  {equippedWeapon.rarity}
                </span>
              </div>
              <div className="text-xs text-gray-300 flex flex-wrap gap-4 font-mono mt-2">
                <span className="flex items-center gap-1">
                  ATK Bônus: <strong className="text-red-400 font-extrabold text-sm">+{equippedWeapon.atk}</strong>
                </span>
                <span className="flex items-center gap-1">
                  Crítico: <strong className="text-amber-400 font-extrabold text-sm">+{(equippedWeapon.critChance * 100).toFixed(0)}%</strong>
                </span>
                <span className="flex items-center gap-1">
                  Valor Venda: <strong className="text-emerald-400 font-extrabold text-sm">{equippedWeapon.sellPrice} {GAME_THEME.currencyName}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => unequipSlot('weapon')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-200 font-bold text-xs rounded-xl border border-gray-600 transition hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Desequipar Arma
            </button>
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic p-6 text-center bg-slate-950/60 rounded-xl border border-dashed border-gray-800">
            Nenhuma {GAME_THEME.weaponTerm} equipada no momento. Abra o inventário abaixo e clique em Equipar!
          </div>
        )}
      </div>

      {/* Barra de Filtro de Raridades do Inventário */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Filter size={14} className="text-amber-400" /> Itens no Inventário ({filteredInventory.length} / {inventory.length}):
        </span>

        <div className="flex gap-1.5">
          {(['all', 'normal', 'rare', 'epic', 'legendary', 'transcendent'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedFilter(r)}
              className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border uppercase transition cursor-pointer ${
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
        <div className="text-xs text-gray-500 italic text-center p-8 bg-black/40 rounded-xl border border-white/5">
          Nenhum item encontrado nesta categoria. Derrote inimigos nas batalhas ou abra o Gacha para conseguir novas armas!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-1">
          {filteredInventory.map((item) => {
            const rarityStyle = RARITY_COLORS[item.rarity];
            const equippedAtk = equippedWeapon ? equippedWeapon.atk : 0;
            const atkDiff = item.atk - equippedAtk;

            return (
              <div
                key={item.instanceId}
                className={`p-4 rounded-xl border ${rarityStyle.bg} ${rarityStyle.border} backdrop-blur-md flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition hover:scale-[1.01] shadow-lg`}
              >
                <div>
                  <div className={`font-extrabold text-sm ${rarityStyle.text} flex items-center gap-2 mb-1`}>
                    {item.name}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 border border-white/10 uppercase font-mono font-bold text-gray-300">
                      {item.rarity}
                    </span>
                    {atkDiff > 0 && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/60 px-2.5 py-0.5 rounded-full font-extrabold animate-pulse">
                        🟢 +{atkDiff} ATK Que Equipada
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-300 flex flex-wrap gap-4 font-mono mt-1">
                    <span>ATK: <strong className="text-red-400">+{item.atk}</strong></span>
                    <span>Crítico: <strong className="text-amber-400">+{(item.critChance * 100).toFixed(0)}%</strong></span>
                    <span>Valor: <strong className="text-emerald-400">{item.sellPrice} {GAME_THEME.currencyName}</strong></span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => equipItem(item)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <CheckCircle size={14} /> Equipar
                  </button>
                  <button
                    onClick={() => salvageItem(item.instanceId)}
                    className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
                    title="Desmontar para obter matérias-primas de forja"
                  >
                    ♻️ Desmontar
                  </button>
                  <button
                    onClick={() => sellItem(item.instanceId)}
                    className="p-2 bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-800 rounded-xl transition cursor-pointer hover:scale-105 active:scale-95"
                    title="Vender por Moedas"
                  >
                    <Trash2 size={15} />
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
