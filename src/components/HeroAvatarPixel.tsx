import React from 'react';

interface HeroAvatarPixelProps {
  size?: 'sm' | 'md' | 'lg';
  isAttacking?: boolean;
}

export const HeroAvatarPixel: React.FC<HeroAvatarPixelProps> = ({
  size = 'md',
  isAttacking = false,
}) => {
  // Matriz de Pixel Art 16x16 pura em SVG sem fundo (Fundo Transparente Real)
  // C: Cabelo Laranja, S: Pele, B: Roupa Preta/Hakama, W: Cinto Branco, R: Detalhe Vermelho, K: Zanpakuto Prata, O: Olho/Contorno
  const pixels: string[][] = [
    ['','','','C','C','C','C','C','C','','','','','','',''],
    ['','','C','C','C','C','C','C','C','C','C','','','','',''],
    ['','C','C','C','C','C','C','C','C','C','C','C','','','',''],
    ['','C','C','S','S','C','C','C','S','S','C','C','','','',''],
    ['','','C','S','O','S','S','S','O','S','C','','','','',''],
    ['','','','S','S','S','S','S','S','S','','','','','K',''],
    ['','','','','S','S','S','S','S','','','','','K','K',''],
    ['','','B','B','B','B','B','B','B','B','B','','K','K','',''],
    ['','B','B','B','R','R','B','R','R','B','B','B','K','','',''],
    ['B','B','B','B','B','B','B','B','B','B','B','B','B','','',''],
    ['','B','B','W','W','W','W','W','W','W','B','B','','','',''],
    ['','','B','B','B','B','B','B','B','B','B','','','','',''],
    ['','','B','B','B','','','','B','B','B','','','','',''],
    ['','','B','B','B','','','','B','B','B','','','','',''],
    ['','','O','O','O','','','','O','O','O','','','','',''],
    ['','','','','','','','','','','','','','','',''],
  ];

  const colorMap: Record<string, string> = {
    C: '#f97316', // Orange Hair
    S: '#fed7aa', // Skin Tone
    B: '#0f172a', // Shinigami Black Outfit
    W: '#f8fafc', // White Belt
    R: '#ef4444', // Red Inner Lining
    K: '#cbd5e1', // Silver Katana Blade
    O: '#1e293b', // Eyes & Outline
  };

  const dimensionClass =
    size === 'sm' ? 'w-20 h-20' : size === 'lg' ? 'w-48 h-48' : 'w-32 h-32';

  return (
    <div className={`relative inline-block select-none ${dimensionClass}`}>
      <div className="w-full h-full flex items-center justify-center relative">
        <svg
          viewBox="0 0 16 16"
          className={`w-full h-full drop-shadow-[0_4px_12px_rgba(249,115,22,0.4)] transition-transform duration-200 ${
            isAttacking ? 'scale-110 -rotate-6' : ''
          }`}
          style={{ shapeRendering: 'crispEdges' }}
        >
          {pixels.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              if (!cell || !colorMap[cell]) return null;
              return (
                <rect
                  key={`${rIdx}-${cIdx}`}
                  x={cIdx}
                  y={rIdx}
                  width={1}
                  height={1}
                  fill={colorMap[cell]}
                />
              );
            })
          )}
          {/* Animação do Golpe de Espada (Slash Slice Energy) quando Atacando */}
          {isAttacking && (
            <path
              d="M 10 3 L 15 12 L 13 14 L 8 5 Z"
              fill="#fbbf24"
              className="animate-ping opacity-90"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
