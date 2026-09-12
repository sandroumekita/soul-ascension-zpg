import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { BattleScreen } from './components/BattleScreen';
import { StatsPanel } from './components/StatsPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { SkillsPanel } from './components/SkillsPanel';
import { GachaShopPanel } from './components/GachaShopPanel';
import { BiomeSelectorPanel } from './components/BiomeSelectorPanel';
import { Swords, Shield, ShoppingBag, Sparkles, Map, RefreshCw } from 'lucide-react';

type Tab = 'battle' | 'stats' | 'inventory' | 'skills' | 'shop' | 'biomes';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('battle');
  const tick = useGameStore((state) => state.tick);
  const resetSave = useGameStore((state) => state.resetProgressSave);

  // Gameloop continuous Ticker (60 FPS / Delta Time)
  useEffect(() => {
    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;
      tick(deltaSec);
    }, 100); // 10 ticks por segundo para simulação suave e leve

    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-4xl mx-auto font-sans shadow-2xl">
      {/* Header Principal da Aplicação */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-red-600 to-amber-500 rounded-lg shadow-md text-white font-extrabold text-lg">
            🗡️
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-red-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
              Soul Ascension
            </h1>
            <p className="text-xs text-gray-400 font-mono">Bleach Idle Auto-RPG (ZPG)</p>
          </div>
        </div>

        <button
          onClick={resetSave}
          className="text-xs text-gray-500 hover:text-red-400 transition flex items-center gap-1 bg-black/40 px-2.5 py-1.5 rounded border border-white/5"
          title="Reiniciar Progresso"
        >
          <RefreshCw size={12} /> Reset Save
        </button>
      </header>

      {/* Área de Conteúdo Ativo */}
      <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {/* Tela de Batalha (Sempre visível no topo ou na aba) */}
        {activeTab === 'battle' && <BattleScreen />}
        {activeTab === 'stats' && <StatsPanel />}
        {activeTab === 'inventory' && <InventoryPanel />}
        {activeTab === 'skills' && <SkillsPanel />}
        {activeTab === 'shop' && <GachaShopPanel />}
        {activeTab === 'biomes' && <BiomeSelectorPanel />}
      </main>

      {/* Navegação por Abas Inferiores (Mobile First / HUD Taskbar) */}
      <nav className="bg-slate-900 border-t border-slate-800 p-2 sticky bottom-0 z-50">
        <div className="grid grid-cols-6 gap-1 max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('battle')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'battle' ? 'bg-red-950 text-red-400 border border-red-500/50' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Swords size={18} />
            <span>Batalha</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'stats' ? 'bg-blue-950 text-blue-400 border border-blue-500/50' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield size={18} />
            <span>Status</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'inventory' ? 'bg-amber-950 text-amber-400 border border-amber-500/50' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield size={18} />
            <span>Itens</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'skills' ? 'bg-purple-950 text-purple-400 border border-purple-500/50' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles size={18} />
            <span>Bankai</span>
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'shop' ? 'bg-purple-950 text-purple-300 border border-purple-500/50' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingBag size={18} />
            <span>Gacha</span>
          </button>

          <button
            onClick={() => setActiveTab('biomes')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'biomes' ? 'bg-teal-950 text-teal-400 border border-teal-500/50' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Map size={18} />
            <span>Mundus</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
