import React from 'react';

interface TripyfyLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const TripyfyLogo: React.FC<TripyfyLogoProps> = ({ size = 'md', showText = true }) => {
  const badgeDimensions =
    size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-xl' : 'w-10 h-10 text-base';

  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';

  return (
    <div className="flex items-center space-x-3 group cursor-pointer select-none">
      {/* Classy Sage & Slate Monogram Logo Badge */}
      <div
        className={`${badgeDimensions} rounded-2xl bg-gradient-to-br from-emerald-800 via-stone-800 to-zinc-900 text-stone-100 font-bold flex items-center justify-center shadow-sm border border-emerald-700/30 group-hover:border-emerald-500/50 transition duration-300 relative overflow-hidden`}
      >
        <span className="font-serif italic font-bold tracking-tighter text-emerald-200 transform -rotate-3">
          T
        </span>
        <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition duration-300" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`${textSize} font-serif italic font-bold text-stone-900 tracking-tight leading-none group-hover:text-emerald-800 transition`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Tripyfy
          </span>
          <span className="text-[9px] text-stone-400 font-bold tracking-widest uppercase mt-0.5 font-sans">
            Curated Travel
          </span>
        </div>
      )}
    </div>
  );
};
