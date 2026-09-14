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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-4xl mx-auto font-sans shadow-2xl border-x border-slate-800/80">
      {/* Header Principal da Aplicação com Efeito Glassmorphism */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-red-600 to-amber-500 rounded-xl shadow-lg text-white font-extrabold text-xl animate-pulse">
            🗡️
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-red-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
              {GAME_THEME.gameTitle}
            </h1>
            <p className="text-xs text-gray-400 font-mono">{GAME_THEME.subTitle}</p>
          </div>
        </div>

        <button
          onClick={resetSave}
          className="text-xs text-gray-400 hover:text-red-400 transition flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-500/50 cursor-pointer"
          title={GAME_THEME.resetSaveText}
        >
          <RefreshCw size={12} /> {GAME_THEME.resetSaveText}
        </button>
      </header>

      {/* Área de Conteúdo Ativo com Transições Fluidas */}
      <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {activeTab === 'battle' && <BattleScreen />}
        {activeTab === 'stats' && <StatsPanel />}
        {activeTab === 'inventory' && <InventoryPanel />}
        {activeTab === 'crafting' && <CraftingPanel />}
        {activeTab === 'skills' && <SkillsPanel />}
        {activeTab === 'shop' && <GachaShopPanel />}
        {activeTab === 'biomes' && <WorldMapPanel />}
      </main>

      {/* Navegação por Abas Inferiores com Badges (Red Dots) */}
      <nav className="bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 p-2 sticky bottom-0 z-50">
        <div className="grid grid-cols-7 gap-1 max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('battle')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer ${
              activeTab === 'battle' ? 'bg-red-950 text-red-400 border border-red-500/60 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Swords size={18} />
            <span>Batalha</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer relative ${
              activeTab === 'stats' ? 'bg-blue-950 text-blue-400 border border-blue-500/60 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            {hasStatPoints && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
            {hasStatPoints && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white text-[9px] flex items-center justify-center font-bold" />
            )}
            <Shield size={18} />
            <span>Status</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer relative ${
              activeTab === 'inventory' ? 'bg-amber-950 text-amber-400 border border-amber-500/60 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            {hasBetterWeapon && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-bounce" />
            )}
            <Shield size={18} />
            <span>Itens</span>
          </button>

          <button
            onClick={() => setActiveTab('crafting')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer ${
              activeTab === 'crafting' ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Hammer size={18} />
            <span>Forja</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer ${
              activeTab === 'skills' ? 'bg-purple-950 text-purple-400 border border-purple-500/60 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles size={18} />
            <span>Bankai</span>
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer ${
              activeTab === 'shop' ? 'bg-purple-950 text-purple-300 border border-purple-500/60 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingBag size={18} />
            <span>Gacha</span>
          </button>

          <button
            onClick={() => setActiveTab('biomes')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer ${
              activeTab === 'biomes' ? 'bg-teal-950 text-teal-400 border border-teal-500/60 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <MapPin size={18} />
            <span>Mapa</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
