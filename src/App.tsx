import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { GAME_THEME } from './config/themeConfig';
import { BattleScreen } from './components/BattleScreen';
import { StatsPanel } from './components/StatsPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { CraftingPanel } from './components/CraftingPanel';
import { SkillsPanel } from './components/SkillsPanel';
import { GachaShopPanel } from './components/GachaShopPanel';
import { WorldMapPanel } from './components/WorldMapPanel';
import { Swords, Shield, ShoppingBag, Sparkles, MapPin, RefreshCw, Hammer } from 'lucide-react';

type Tab = 'battle' | 'stats' | 'inventory' | 'crafting' | 'skills' | 'shop' | 'biomes';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('battle');
  const tick = useGameStore((state) => state.tick);
  const resetSave = useGameStore((state) => state.resetProgressSave);

  // Optimized boolean selectors — prevents re-rendering App when gold/exp changes
  const hasStatPoints = useGameStore((state) => state.stats.statPoints > 0);
  const hasBetterWeapon = useGameStore((state) =>
    state.inventory.some((i) => i.slot === 'weapon' && (!state.equippedWeapon || i.atk > state.equippedWeapon.atk))
  );

  // Controlled Game Loop: 100ms ticks (10 ticks/s) for balanced, readable ZPG combat
  useEffect(() => {
    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const rawDelta = (now - lastTime) / 1000;
      lastTime = now;
      // Cap delta time to prevent massive jumps when switching tabs
      const deltaSec = Math.min(rawDelta, 0.25);
      if (deltaSec > 0) {
        tick(deltaSec);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-4xl mx-auto font-sans shadow-2xl border-x border-slate-800/80 w-full overflow-x-hidden">
      {/* Header Principal da Aplicação com Efeito Glassmorphism */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 py-2 px-3 sm:p-4 flex justify-between items-center shadow-lg sticky top-0 z-50 w-full">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2.5 bg-gradient-to-tr from-red-600 to-amber-500 rounded-lg sm:rounded-xl shadow-lg text-white font-extrabold text-base sm:text-xl animate-pulse leading-none shrink-0">
            🗡️
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-extrabold bg-gradient-to-r from-red-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent leading-tight truncate">
              {GAME_THEME.gameTitle}
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-400 font-mono hidden sm:block">{GAME_THEME.subTitle}</p>
          </div>
        </div>

        <button
          onClick={resetSave}
          className="text-[10px] sm:text-xs text-gray-400 hover:text-red-400 transition flex items-center gap-1 bg-black/40 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/10 hover:border-red-500/50 cursor-pointer shrink-0"
          title={GAME_THEME.resetSaveText}
        >
          <RefreshCw size={11} /> <span className="hidden xs:inline">{GAME_THEME.resetSaveText}</span><span className="xs:hidden">Reset</span>
        </button>
      </header>

      {/* Área de Conteúdo Ativo com Transições Fluidas */}
      <main className="flex-1 p-2 sm:p-4 overflow-y-auto flex flex-col gap-2 sm:gap-4 w-full">
        {activeTab === 'battle' && <BattleScreen />}
        {activeTab === 'stats' && <StatsPanel />}
        {activeTab === 'inventory' && <InventoryPanel />}
        {activeTab === 'crafting' && <CraftingPanel />}
        {activeTab === 'skills' && <SkillsPanel />}
        {activeTab === 'shop' && <GachaShopPanel />}
        {activeTab === 'biomes' && <WorldMapPanel />}
      </main>

      {/* Navegação por Abas Inferiores com Badges (Red Dots) */}
      <nav className="bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 py-1.5 px-1 sm:p-2 sticky bottom-0 z-50 w-full">
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 max-w-2xl mx-auto w-full">
          <button
            onClick={() => setActiveTab('battle')}
            className={`flex flex-col items-center justify-center py-1 sm:py-2 px-0.5 sm:px-1 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer min-w-0 ${
              activeTab === 'battle' ? 'bg-red-950 text-red-400 border border-red-500/60 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Swords size={15} className="sm:w-[18px] sm:h-[18px] shrink-0" />
            <span className="truncate w-full text-center block">Batalha</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center py-1 sm:py-2 px-0.5 sm:px-1 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer relative min-w-0 ${
              activeTab === 'stats' ? 'bg-blue-950 text-blue-400 border border-blue-500/60 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            {hasStatPoints && (
              <span className="absolute top-0.5 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
            {hasStatPoints && (
              <span className="absolute top-0.5 right-1 w-2 h-2 bg-red-500 rounded-full border border-white text-[9px] flex items-center justify-center font-bold" />
            )}
            <Shield size={15} className="sm:w-[18px] sm:h-[18px] shrink-0" />
            <span className="truncate w-full text-center block">Status</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center justify-center py-1 sm:py-2 px-0.5 sm:px-1 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer relative min-w-0 ${
              activeTab === 'inventory' ? 'bg-amber-950 text-amber-400 border border-amber-500/60 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            {hasBetterWeapon && (
              <span className="absolute top-0.5 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
            )}
            <Shield size={15} className="sm:w-[18px] sm:h-[18px] shrink-0" />
            <span className="truncate w-full text-center block">Itens</span>
          </button>

          <button
            onClick={() => setActiveTab('crafting')}
            className={`flex flex-col items-center justify-center py-1 sm:py-2 px-0.5 sm:px-1 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer min-w-0 ${
              activeTab === 'crafting' ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Hammer size={15} className="sm:w-[18px] sm:h-[18px] shrink-0" />
            <span className="truncate w-full text-center block">Forja</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`flex flex-col items-center justify-center py-1 sm:py-2 px-0.5 sm:px-1 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer min-w-0 ${
              activeTab === 'skills' ? 'bg-purple-950 text-purple-400 border border-purple-500/60 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles size={15} className="sm:w-[18px] sm:h-[18px] shrink-0" />
            <span className="truncate w-full text-center block">Bankai</span>
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            className={`flex flex-col items-center justify-center py-1 sm:py-2 px-0.5 sm:px-1 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer min-w-0 ${
              activeTab === 'shop' ? 'bg-purple-950 text-purple-300 border border-purple-500/60 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingBag size={15} className="sm:w-[18px] sm:h-[18px] shrink-0" />
            <span className="truncate w-full text-center block">Gacha</span>
          </button>

          <button
            onClick={() => setActiveTab('biomes')}
            className={`flex flex-col items-center justify-center py-1 sm:py-2 px-0.5 sm:px-1 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer min-w-0 ${
              activeTab === 'biomes' ? 'bg-teal-950 text-teal-400 border border-teal-500/60 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <MapPin size={15} className="sm:w-[18px] sm:h-[18px] shrink-0" />
            <span className="truncate w-full text-center block">Mapa</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
