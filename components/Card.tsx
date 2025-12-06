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
        `}
      >
        {/* Back of Card */}
        <div className={`absolute w-full h-full backface-hidden rounded-lg overflow-hidden border-2 border-slate-700 bg-slate-900`}>
          <img
            src="/card-back.png"
            alt="Card Back"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Front of Card */}
        <div
          className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-lg overflow-hidden bg-slate-200 border-2 border-amber-500`}
        >
          <div className={`w-full h-full relative ${isReversed ? 'rotate-180' : ''}`}>
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
    </div>
  );
};

export default Card;
