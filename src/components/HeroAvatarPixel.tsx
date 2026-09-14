import React from 'react';

interface HeroAvatarPixelProps {
  size?: 'sm' | 'md' | 'lg';
  isAttacking?: boolean;
}

const HeroAvatarPixelInner: React.FC<HeroAvatarPixelProps> = ({
  size = 'md',
  isAttacking = false,
}) => {
  const dimensionClass =
    size === 'sm' ? 'w-24 h-24' : size === 'lg' ? 'w-56 h-56' : 'w-40 h-40';

  return (
    <div className={`relative inline-block select-none ${dimensionClass}`}>
      <div className="w-full h-full flex items-center justify-center relative">
        <img
          src="/ichigo_hd_transparent.png"
          alt="Ichigo Kurosaki HD Pixel Art"
          className={`w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(249,115,22,0.5)] transition-transform duration-200 ${
            isAttacking ? 'scale-110 -rotate-3' : ''
          }`}
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Efeito de Corte de Energia de Espada (Reiatsu Slash) quando atacando */}
        {isAttacking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rotate-45 animate-ping opacity-90" />
          </div>
        )}
      </div>
    </div>
  );
};

export const HeroAvatarPixel = React.memo(HeroAvatarPixelInner);
