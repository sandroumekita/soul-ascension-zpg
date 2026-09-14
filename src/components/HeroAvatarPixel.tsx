import React from 'react';

interface HeroAvatarPixelProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'responsive';
  isAttacking?: boolean;
  isDead?: boolean;
  isBankai?: boolean;
}

const HeroAvatarPixelInner: React.FC<HeroAvatarPixelProps> = ({
  size = 'md',
  isAttacking = false,
  isDead = false,
  isBankai = false,
}) => {
  const dimensionClass =
    size === 'xs'
      ? 'w-16 h-16 sm:w-20 sm:h-20'
      : size === 'sm'
      ? 'w-20 h-20 sm:w-28 sm:h-28'
      : size === 'responsive'
      ? 'w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36'
      : size === 'lg'
      ? 'w-56 h-56'
      : 'w-40 h-40';

  return (
    <div className={`relative inline-block select-none ${dimensionClass}`}>
      <div className="w-full h-full flex items-center justify-center relative">
        {/* Aura de Bankai quando ativa */}
        {isBankai && !isDead && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-red-600/30 via-amber-500/20 to-transparent blur-xl animate-pulse pointer-events-none" />
        )}

        <img
          src={`${import.meta.env.BASE_URL}ichigo_hd_transparent.png`}
          alt="Ichigo Kurosaki HD Pixel Art"
          className={`w-full h-full object-contain transition-all duration-300 ${
            isDead
              ? 'grayscale opacity-35 scale-90 -rotate-6'
              : isBankai
              ? 'drop-shadow-[0_0_25px_rgba(251,191,36,0.9)] drop-shadow-[0_0_10px_rgba(239,68,68,0.7)] scale-105'
              : 'drop-shadow-[0_8px_16px_rgba(249,115,22,0.5)]'
          } ${isAttacking && !isDead ? 'scale-110 -rotate-3' : ''}`}
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
};

export const HeroAvatarPixel = React.memo(HeroAvatarPixelInner);
