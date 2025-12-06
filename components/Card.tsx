import React from 'react';
import { CardData } from '../types';

interface CardProps {
  data?: CardData;
  isBack?: boolean;
  isReversed?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  data, 
  isBack = false, 
  isReversed = false, 
  isRevealed = false, 
  onClick,
  className = ""
}) => {
  return (
    <div 
      className={`group relative cursor-pointer perspective-1000 ${className}`}
      onClick={onClick}
    >
      <div 
        className={`w-full h-full duration-700 transform-style-3d transition-transform shadow-xl rounded-lg
          ${isRevealed ? 'rotate-y-180' : ''}
          ${(!isRevealed && !isBack) ? 'rotate-y-180' : ''} 
        `}
      >
        {/* Back of Card */}
        <div className={`absolute w-full h-full backface-hidden rounded-lg overflow-hidden border-2 border-slate-700 bg-slate-900`}>
             {/* Simple Geometric Pattern for Card Back */}
             <div className="w-full h-full opacity-60 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black">
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-amber-600 rotate-45"></div>
                    <div className="absolute w-12 h-12 border-2 border-amber-600 rotate-0"></div>
                </div>
             </div>
             <div className="absolute inset-2 border border-amber-900/50 rounded"></div>
        </div>

        {/* Front of Card */}
        <div 
          className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-lg overflow-hidden bg-slate-200 border-2 border-amber-500
          ${isReversed ? 'rotate-180' : ''}`}
        >
          {data ? (
             <>
                <img 
                  src={data.imgUrl} 
                  alt={data.name} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-0 w-full bg-black/70 text-amber-100 text-xs text-center py-1 font-serif">
                    {data.name_cn}
                </div>
             </>
          ) : (
            <div className="flex items-center justify-center h-full text-black">Unknown</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
