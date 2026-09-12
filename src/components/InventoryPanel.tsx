import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { RARITY_COLORS } from '../data/gameCatalog';
import { Sword, Trash2, CheckCircle } from 'lucide-react';

export const InventoryPanel: React.FC = () => {
  const { equippedWeapon, inventory, equipItem, unequipSlot, sellItem } = useGameStore();

  return (
    <div className="bg-slate-900/90 text-white p-4 rounded-xl border border-slate-800 flex flex-col gap-4 shadow-xl">
      <h3 className="text-base font-bold flex items-center gap-2 text-amber-400">
        <Sword size={18} /> Equipamentos & Inventário de Zanpakuto
      </h3>

      {/* Item Equipado no momento */}
      <div className="bg-black/50 p-3 rounded-lg border border-amber-500/40">
        <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2">Zanpakuto Equipada</div>
        {equippedWeapon ? (
          <div className="flex justify-between items-center bg-slate-950 p-3 rounded border border-slate-800">
            <div>
              <div className={`font-bold text-sm ${RARITY_COLORS[equippedWeapon.rarity].text}`}>
                {equippedWeapon.name}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                ATK: <span className="text-red-400 font-bold">+{equippedWeapon.atk}</span> | Crit: <span className="text-amber-400 font-bold">+{(equippedWeapon.critChance * 100).toFixed(0)}%</span>
              </div>
            </div>
            <button
              onClick={() => unequipSlot('weapon')}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded border border-gray-600 transition"
            >
              Desequipar
            </button>
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic p-3 text-center bg-slate-950/50 rounded border border-dashed border-gray-800">
            Nenhuma Zanpakuto equipada no momento.
          </div>
        )}
      </div>

      {/* Grade de Inventário (Loot de Equipamentos) */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-gray-400">
            Inventário ({inventory.length} itens)
          </span>
        </div>

        {inventory.length === 0 ? (
          <div className="text-xs text-gray-500 italic text-center p-6 bg-black/30 rounded-lg border border-white/5">
            Seu inventário está vazio. Derrote Hollows e Bosses para encontrar loots épicos e transcendentes!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
            {inventory.map((item) => {
              const rarityStyle = RARITY_COLORS[item.rarity];
              return (
                <div
                  key={item.instanceId}
                  className={`flex justify-between items-center p-3 rounded-lg border ${rarityStyle.bg} ${rarityStyle.border} transition hover:scale-[1.01]`}
                >
                  <div>
                    <div className={`font-bold text-sm ${rarityStyle.text}`}>{item.name}</div>
                    <div className="text-xs text-gray-300 mt-0.5 flex gap-3">
                      <span>ATK: <strong className="text-red-400">+{item.atk}</strong></span>
                      <span>Valor: <strong className="text-amber-400">{item.sellPrice} Reiryoku</strong></span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => equipItem(item)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded shadow transition flex items-center gap-1"
                    >
                      <CheckCircle size={12} /> Equipar
                    </button>
                    <button
                      onClick={() => sellItem(item.instanceId)}
                      className="p-1.5 bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-800 rounded transition"
                      title="Vender Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
