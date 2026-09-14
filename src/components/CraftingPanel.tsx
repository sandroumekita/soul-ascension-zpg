import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { CRAFTING_RECIPES_CATALOG, RARITY_COLORS } from '../data/gameCatalog';
import { GAME_THEME } from '../config/themeConfig';
import type { Rarity } from '../types/game';
import { Hammer, Flame } from 'lucide-react';

export const CraftingPanel: React.FC = () => {
  const { craftingMaterials, gold, craftRecipe } = useGameStore(
    useShallow((state) => ({
      craftingMaterials: state.craftingMaterials,
      gold: state.stats.gold,
      craftRecipe: state.craftRecipe,
    }))
  );
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<Rarity | 'all'>('all');

  const filteredRecipes = CRAFTING_RECIPES_CATALOG.filter(
    (recipe) => selectedRarityFilter === 'all' || recipe.resultRarity === selectedRarityFilter
  );

  return (
    <div className="bg-slate-900/90 text-white p-2.5 sm:p-5 rounded-2xl border border-slate-800 flex flex-col gap-2.5 sm:gap-5 shadow-2xl backdrop-blur-md min-w-0 max-w-full">
      {/* Header do Sistema de Forja */}
      <div className="flex justify-between items-center bg-black/60 p-2.5 sm:p-4 rounded-xl border border-amber-500/30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-3 bg-amber-950/80 rounded-lg sm:rounded-xl border border-amber-500/60 text-amber-400 shadow-lg animate-pulse shrink-0">
            <Hammer size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold text-amber-400 truncate">
              Forja
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-400 truncate">Crie {GAME_THEME.weaponTerm}s usando seus materiais.</p>
          </div>
        </div>
      </div>

      {/* Painel de Materiais do Jogador */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
        <div className="bg-black/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-cyan-500/30 flex flex-col items-center text-center min-w-0">
          <span className="text-[9px] sm:text-[10px] text-cyan-400 font-bold uppercase tracking-wider truncate w-full">{GAME_THEME.material1Name}</span>
          <span className="text-xs sm:text-lg font-mono font-extrabold text-cyan-300 mt-0.5 truncate">
            {GAME_THEME.material1Icon} {craftingMaterials.material1}
          </span>
        </div>

        <div className="bg-black/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-amber-500/30 flex flex-col items-center text-center min-w-0">
          <span className="text-[9px] sm:text-[10px] text-amber-400 font-bold uppercase tracking-wider truncate w-full">{GAME_THEME.material2Name}</span>
          <span className="text-xs sm:text-lg font-mono font-extrabold text-amber-300 mt-0.5 truncate">
            {GAME_THEME.material2Icon} {craftingMaterials.material2}
          </span>
        </div>

        <div className="bg-black/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-purple-500/30 flex flex-col items-center text-center min-w-0">
          <span className="text-[9px] sm:text-[10px] text-purple-400 font-bold uppercase tracking-wider truncate w-full">{GAME_THEME.material3Name}</span>
          <span className="text-xs sm:text-lg font-mono font-extrabold text-purple-300 mt-0.5 truncate">
            {GAME_THEME.material3Icon} {craftingMaterials.material3}
          </span>
        </div>
      </div>

      {/* Filtros por Raridade */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
        <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Flame size={13} className="text-amber-400 shrink-0" /> Receitas ({filteredRecipes.length}):
        </div>

        <div className="flex gap-1 overflow-x-auto max-w-full pb-1">
          {(['all', 'rare', 'epic', 'legendary', 'transcendent'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRarityFilter(r)}
              className={`text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg font-bold border uppercase transition cursor-pointer shrink-0 ${
                selectedRarityFilter === r
                  ? 'bg-amber-500 text-black border-amber-300 shadow-md font-extrabold scale-105'
                  : 'bg-black/40 text-gray-400 border-white/10 hover:text-white'
              }`}
            >
              {r === 'all' ? 'Todas' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Receitas Desbloqueadas */}
      <div>
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          {filteredRecipes.map((recipe) => {
            const rarityStyle = RARITY_COLORS[recipe.resultRarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.normal;
            const canCraft =
              craftingMaterials.material1 >= recipe.requiredMaterial1 &&
              craftingMaterials.material2 >= recipe.requiredMaterial2 &&
              craftingMaterials.material3 >= recipe.requiredMaterial3 &&
              gold >= recipe.goldCost;

            return (
              <div
                key={recipe.id}
                className={`p-2.5 sm:p-4 rounded-xl border ${rarityStyle.bg} ${rarityStyle.border} backdrop-blur-md flex flex-col sm:flex-row justify-between sm:items-center gap-2.5 sm:gap-4 transition hover:scale-[1.01] shadow-lg`}
              >
                <div className="flex-1 min-w-0">
                  <div className={`font-extrabold text-xs sm:text-sm ${rarityStyle.text} flex items-center gap-1.5 mb-1 flex-wrap`}>
                    <span className="truncate">{recipe.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/60 border border-white/10 uppercase font-mono font-bold">
                      {recipe.resultRarity}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-300 mb-2 line-clamp-2 sm:line-clamp-none">{recipe.description}</p>

                  {/* Custo de Recursos da Receita */}
                  <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded border ${
                        craftingMaterials.material1 >= recipe.requiredMaterial1
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                          : 'bg-red-950/60 border-red-500/50 text-red-400'
                      }`}
                    >
                      {GAME_THEME.material1Name}: {craftingMaterials.material1}/{recipe.requiredMaterial1}
                    </span>

                    <span
                      className={`px-1.5 py-0.5 rounded border ${
                        craftingMaterials.material2 >= recipe.requiredMaterial2
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                          : 'bg-red-950/60 border-red-500/50 text-red-400'
                      }`}
                    >
                      {GAME_THEME.material2Name}: {craftingMaterials.material2}/{recipe.requiredMaterial2}
                    </span>

                    {recipe.requiredMaterial3 > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded border ${
                          craftingMaterials.material3 >= recipe.requiredMaterial3
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                            : 'bg-red-950/60 border-red-500/50 text-red-400'
                        }`}
                      >
                        {GAME_THEME.material3Name}: {craftingMaterials.material3}/{recipe.requiredMaterial3}
                      </span>
                    )}

                    <span
                      className={`px-1.5 py-0.5 rounded border ${
                        gold >= recipe.goldCost
                          ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                          : 'bg-red-950/60 border-red-500/50 text-red-400'
                      }`}
                    >
                      {GAME_THEME.currencyName}: {recipe.goldCost}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => craftRecipe(recipe.id)}
                  disabled={!canCraft}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap self-stretch sm:self-auto ${
                    canCraft
                      ? 'bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white hover:scale-105 active:scale-95'
                      : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Hammer size={14} /> Forjar
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
