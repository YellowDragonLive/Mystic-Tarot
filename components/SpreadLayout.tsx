import React from 'react';
import { SpreadConfig, DrawnCard } from '../types';
import Card from './Card';

interface SpreadLayoutProps {
  spreadId: string;
  positions: SpreadConfig['positions'];
  drawnCards: DrawnCard[];
  onCardClick: (index: number) => void;
}

const SpreadLayout: React.FC<SpreadLayoutProps> = ({ spreadId, positions, drawnCards, onCardClick }) => {

  // Renders a placeholder slot if no card is drawn yet, or the card if it is
  const renderSlot = (index: number, className: string = "") => {
    const drawn = drawnCards[index];
    const positionData = positions[index];

    // Determine Card Size based on Spread Type
    // Timeflow/Daily: Large on mobile (Carousel mode), Regular on Desktop
    // Celtic: Small on mobile (Grid mode)
    let sizeClasses = "w-24 h-40 sm:w-32 sm:h-52 md:w-40 md:h-64"; // Default/Celtic Base

    if (spreadId === 'timeflow' || spreadId === 'daily') {
      // Mobile: w-64 (~256px width) for clear visibility in carousel
      // Desktop (sm+): Revert to grid sizes to fit 3 in a row
      sizeClasses = "w-64 h-96 sm:w-32 sm:h-52 md:w-48 md:h-80";
    }

    return (
      <div key={positionData.id} className={`relative flex flex-col items-center flex-shrink-0 snap-center ${className}`}>
        <div className={`relative ${sizeClasses} transition-all duration-300`}>
          {/* Placeholder Outline */}
          {!drawn && (
            <div className="absolute inset-0 border-2 border-dashed border-amber-500/30 rounded-lg flex items-center justify-center text-amber-500/30 text-xs text-center p-2">
              {positionData.name}
            </div>
          )}

          {/* The Actual Card */}
          {drawn && (
            <Card
              data={drawn.card}
              isReversed={drawn.isReversed}
              isRevealed={drawn.isRevealed}
              onClick={() => onCardClick(index)}
              className="w-full h-full animate-fadeIn shadow-2xl"
            />
          )}
        </div>
        {/* Label below card */}
        <div className="mt-4 sm:mt-2 text-sm sm:text-sm text-amber-100 font-serif text-center max-w-[200px] drop-shadow-md">
          {positionData.name}
        </div>
      </div>
    );
  };

  /* --- Layout Configurations --- */

  if (spreadId === 'daily') {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh] p-4">
        {renderSlot(0)}
      </div>
    );
  }

  if (spreadId === 'timeflow') {
    return (
      <div className="w-full h-full min-h-[50vh] flex items-center justify-center">
        {/* Mobile: Horizontal Scroll Snap Carousel */}
        {/* Desktop: Centered Flex Row */}
        <div className="
            flex flex-row 
            w-full
            overflow-x-auto 
            snap-x snap-mandatory 
            scroll-smooth 
            
            p-8 
            gap-6 
            
            sm:justify-center 
            sm:overflow-x-visible
            sm:gap-8
            
            scrollbar-none /* You might need a utility for this or just rely on default */
        ">
          {renderSlot(0)}
          {renderSlot(1, "mt-0 sm:-mt-12")} {/* Center card elevated only on desktop */}
          {renderSlot(2)}

          {/* Spacer for mobile scrolling right margin */}
          <div className="w-2 sm:hidden flex-shrink-0"></div>
        </div>
      </div>
    );
  }

  if (spreadId === 'celtic') {
    // A simplified flexible grid for Celtic Cross
    return (
      <div className="w-full max-w-4xl mx-auto p-4 overflow-x-hidden">
        <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 items-center">

          {/* Left Cluster: Cross */}
          <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[450px] flex items-center justify-center scale-90 sm:scale-100 origin-center">
            {/* 1. Center (Covered by 2) */}
            <div className="absolute z-10">{renderSlot(0)}</div>
            {/* 2. Crossing (Horizontal usually, but we rotate visual or just offset) */}
            <div className="absolute z-20 translate-x-4 translate-y-4 opacity-90">{renderSlot(1)}</div>

            {/* 3. Below (Root) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-10 sm:translate-y-0">{renderSlot(2)}</div>

            {/* 4. Left (Past) */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 sm:translate-x-0">{renderSlot(3)}</div>

            {/* 5. Above (Crown) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 sm:translate-y-0">{renderSlot(4)}</div>

            {/* 6. Right (Future) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 sm:translate-x-0">{renderSlot(5)}</div>
          </div>

          {/* Right Column: Staff */}
          <div className="flex flex-col gap-2 sm:gap-4 mt-8 md:mt-0">
            {renderSlot(9)} {/* Outcome (Top) */}
            {renderSlot(8)} {/* Hopes/Fears */}
            {renderSlot(7)} {/* Environment */}
            {renderSlot(6)} {/* Attitude (Bottom) */}
          </div>
        </div>
      </div>
    );
  }

  return <div>Unknown Spread</div>;
};

export default SpreadLayout;
