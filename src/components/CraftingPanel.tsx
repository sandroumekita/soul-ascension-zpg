import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { CRAFTING_RECIPES_CATALOG, RARITY_COLORS } from '../data/gameCatalog';
import { Hammer, Flame } from 'lucide-react';

export const CraftingPanel: React.FC = () => {
  const { craftingMaterials, stats, craftRecipe } = useGameStore();

  return (
    <div className="bg-slate-900/90 text-white p-5 rounded-2xl border border-slate-800 flex flex-col gap-5 shadow-2xl backdrop-blur-md">
      {/* Header do Sistema de Forja */}
      <div className="flex justify-between items-center bg-black/60 p-4 rounded-xl border border-amber-500/30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-950/80 rounded-xl border border-amber-500/60 text-amber-400 shadow-lg animate-pulse">
            <Hammer size={22} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
              Forja de Receitas Zanpakuto
            </h3>
            <p className="text-xs text-gray-400">Combine materiais de Reishi e minérios para forjar equipamentos garantidos.</p>
          </div>
        </div>
      </div>

      {/* Painel de Materiais do Jogador */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-black/50 p-3 rounded-xl border border-cyan-500/30 flex flex-col items-center">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Fragmentos Reishi</span>
          <span className="text-lg font-mono font-extrabold text-cyan-300 mt-0.5">
            💎 {craftingMaterials.reishiFragments}
          </span>
        </div>

        <div className="bg-black/50 p-3 rounded-xl border border-amber-500/30 flex flex-col items-center">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Minério de Ferro</span>
          <span className="text-lg font-mono font-extrabold text-amber-300 mt-0.5">
            🪨 {craftingMaterials.ironOre}
          </span>
        </div>

        <div className="bg-black/50 p-3 rounded-xl border border-purple-500/30 flex flex-col items-center">
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Essência Espiritual</span>
          <span className="text-lg font-mono font-extrabold text-purple-300 mt-0.5">
            🔮 {craftingMaterials.spiritEssence}
          </span>
        </div>
      </div>

      {/* Lista de Receitas Desbloqueadas */}
      <div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Flame size={14} className="text-amber-400" /> Receitas Disponíveis para Criação:
        </div>

        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-1">
          {CRAFTING_RECIPES_CATALOG.map((recipe) => {
            const rarityStyle = RARITY_COLORS[recipe.resultRarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.normal;
            const canCraft =
              craftingMaterials.reishiFragments >= recipe.requiredReishiFragments &&
              craftingMaterials.ironOre >= recipe.requiredIronOre &&
              craftingMaterials.spiritEssence >= recipe.requiredSpiritEssence &&
              stats.reiryoku >= recipe.goldCost;

            return (
              <div
                key={recipe.id}
                className={`p-4 rounded-xl border ${rarityStyle.bg} ${rarityStyle.border} backdrop-blur-md flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition hover:scale-[1.01] shadow-lg`}
              >
                <div className="flex-1">
                  <div className={`font-extrabold text-sm ${rarityStyle.text} flex items-center gap-2 mb-1`}>
                    {recipe.name}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 border border-white/10 uppercase font-mono font-bold">
                      {recipe.resultRarity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-2.5">{recipe.description}</p>

                  {/* Custo de Recursos da Receita */}
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        craftingMaterials.reishiFragments >= recipe.requiredReishiFragments
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                          : 'bg-red-950/60 border-red-500/50 text-red-400'
                      }`}
                    >
                      Reishi: {craftingMaterials.reishiFragments}/{recipe.requiredReishiFragments}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded border ${
                        craftingMaterials.ironOre >= recipe.requiredIronOre
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                          : 'bg-red-950/60 border-red-500/50 text-red-400'
                      }`}
                    >
                      Minério: {craftingMaterials.ironOre}/{recipe.requiredIronOre}
                    </span>

                    {recipe.requiredSpiritEssence > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded border ${
                          craftingMaterials.spiritEssence >= recipe.requiredSpiritEssence
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                            : 'bg-red-950/60 border-red-500/50 text-red-400'
                        }`}
                      >
                        Essência: {craftingMaterials.spiritEssence}/{recipe.requiredSpiritEssence}
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded border ${
                        stats.reiryoku >= recipe.goldCost
                          ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                          : 'bg-red-950/60 border-red-500/50 text-red-400'
                      }`}
                    >
                      Reiryoku: {recipe.goldCost}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => craftRecipe(recipe.id)}
                  disabled={!canCraft}
                  className={`px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    canCraft
                      ? 'bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white hover:scale-105 active:scale-95'
                      : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Hammer size={15} /> Forjar Item
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
