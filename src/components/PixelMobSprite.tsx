import React from 'react';

interface PixelMobSpriteProps {
  icon: string;
  name: string;
  isBoss?: boolean;
  size?: 'sm' | 'md';
}

export const PixelMobSprite: React.FC<PixelMobSpriteProps> = ({
  icon,
  isBoss = false,
  size = 'md',
}) => {

  // Mapeamento de pixel-art SVG limpo por categoria de mob sem nenhuma caixa de fundo
  const renderMobSvg = () => {
    // Boss (Grand Fisher, Renji, Grimmjow, Aizen)
    if (isBoss || icon === '👑' || icon === '💀' || icon === '🦁' || icon === '🌌') {
      return (
        <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-[0_4px_12px_rgba(239,68,68,0.6)]" style={{ shapeRendering: 'crispEdges' }}>
          {/* Chifres / Aura de Boss */}
          <rect x="2" y="1" width="2" height="3" fill="#dc2626" />
          <rect x="12" y="1" width="2" height="3" fill="#dc2626" />
          {/* Cabeça / Máscara */}
          <rect x="4" y="3" width="8" height="6" fill="#f8fafc" />
          <rect x="5" y="5" width="2" height="2" fill="#7f1d1d" />
          <rect x="9" y="5" width="2" height="2" fill="#7f1d1d" />
          {/* Corpo Espiritual */}
          <rect x="3" y="9" width="10" height="6" fill="#0f172a" />
          <rect x="5" y="10" width="6" height="2" fill="#991b1b" />
          {/* Garras Prata */}
          <rect x="1" y="9" width="2" height="4" fill="#94a3b8" />
          <rect x="13" y="9" width="2" height="4" fill="#94a3b8" />
        </svg>
      );
    }

    // Ninja / Officers / Sternritter
    if (icon === '🥷' || icon === '⚔️' || icon === '🎖️' || icon === '🏹' || icon === '⚡') {
      return (
        <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-[0_4px_10px_rgba(14,165,233,0.5)]" style={{ shapeRendering: 'crispEdges' }}>
          {/* Cabeça Shinigami/Quincy */}
          <rect x="5" y="2" width="6" height="5" fill="#f1f5f9" />
          <rect x="6" y="4" width="1" height="1" fill="#0f172a" />
          <rect x="9" y="4" width="1" height="1" fill="#0f172a" />
          {/* Capuz / Cabelo */}
          <rect x="4" y="1" width="8" height="2" fill="#1e293b" />
          {/* Uniforme */}
          <rect x="4" y="7" width="8" height="6" fill="#0f172a" />
          <rect x="5" y="8" width="6" height="1" fill="#e2e8f0" />
          {/* Katana / Arco */}
          <rect x="2" y="6" width="2" height="8" fill="#cbd5e1" />
        </svg>
      );
    }

    // Gillian / Beast / Monster Mobs
    if (icon === '🗿' || icon === '🐺' || icon === '🧪' || icon === '👹' || icon === '🕷️') {
      return (
        <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-[0_4px_10px_rgba(168,85,247,0.5)]" style={{ shapeRendering: 'crispEdges' }}>
          {/* Monstro Hollow Gigante */}
          <rect x="3" y="2" width="10" height="9" fill="#0f172a" />
          {/* Máscara de Osso */}
          <rect x="5" y="3" width="6" height="5" fill="#f8fafc" />
          <rect x="6" y="5" width="1" height="2" fill="#581c87" />
          <rect x="9" y="5" width="1" height="2" fill="#581c87" />
          {/* Dentes */}
          <rect x="6" y="7" width="4" height="1" fill="#ef4444" />
          {/* Pernas Místicas */}
          <rect x="4" y="11" width="3" height="4" fill="#3b0764" />
          <rect x="9" y="11" width="3" height="4" fill="#3b0764" />
        </svg>
      );
    }

    // Standard Hollow (Fly Hollow / Generic)
    return (
      <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-[0_4px_10px_rgba(239,68,68,0.5)]" style={{ shapeRendering: 'crispEdges' }}>
        {/* Fantasma Hollow Volante */}
        <rect x="4" y="2" width="8" height="8" fill="#f8fafc" />
        <rect x="5" y="4" width="2" height="2" fill="#dc2626" />
        <rect x="9" y="4" width="2" height="2" fill="#dc2626" />
        {/* Cauda Espiritual */}
        <rect x="5" y="10" width="6" height="4" fill="#cbd5e1" opacity="0.8" />
        <rect x="6" y="14" width="4" height="2" fill="#94a3b8" opacity="0.5" />
      </svg>
    );
  };

  const dimClass = size === 'sm' ? 'w-8 h-8' : 'w-12 h-12';

  return (
    <div className={`relative inline-block select-none shrink-0 ${dimClass}`}>
      <div className="w-full h-full flex items-center justify-center relative">
        {renderMobSvg()}
      </div>
    </div>
  );
};
