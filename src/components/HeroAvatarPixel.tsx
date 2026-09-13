import React from 'react';

interface HeroAvatarPixelProps {
  size?: 'sm' | 'md' | 'lg';
  isAttacking?: boolean;
}

export const HeroAvatarPixel: React.FC<HeroAvatarPixelProps> = ({
  size = 'md',
  isAttacking = false,
}) => {
  const dimensionClass =
    size === 'sm' ? 'w-20 h-20' : size === 'lg' ? 'w-48 h-48' : 'w-32 h-32';

  return (
    <div
      className={`relative inline-block select-none ${dimensionClass} ${
        isAttacking ? 'animate-bounce scale-105' : 'animate-pulse'
      }`}
    >
      <div className="w-full h-full rounded-2xl overflow-hidden p-1 bg-black/60 border border-amber-500/40 shadow-2xl backdrop-blur-md flex items-center justify-center relative">
        <img
          src="/ichigo_pixel_hero.jpg"
          alt="Shinigami Substituto Pixel Art"
          className="w-full h-full object-contain rounded-xl"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Glow Místico de Reiatsu em Pixel Art */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-cyan-500/30 to-purple-500/30 rounded-2xl blur-md -z-10 animate-pulse pointer-events-none" />
    </div>
  );
};
