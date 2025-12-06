import React, { useState, useEffect } from 'react';
import { DECK, SPREADS } from './constants';
import { DrawnCard, SpreadConfig, AppPhase, CardData } from './types';
import SpreadLayout from './components/SpreadLayout';
import Card from './components/Card';
import ReadingModal from './components/ReadingModal';
import HistoryModal from './components/HistoryModal';
import { Shuffle, RotateCcw, BookOpen, Stars, History } from 'lucide-react';
import { ReadingHistoryItem } from './types';

const App: React.FC = () => {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.Selection);
  const [selectedSpread, setSelectedSpread] = useState<SpreadConfig>(SPREADS[0]);
  const [deck, setDeck] = useState<CardData[]>([]);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [restoredReading, setRestoredReading] = useState<ReadingHistoryItem | null>(null);

  // Initialize deck on load
  useEffect(() => {
    setDeck([...DECK]);
  }, []);

  // --- Actions ---

  const handleSpreadSelect = (spread: SpreadConfig) => {
    setSelectedSpread(spread);
    // Reset state
    setDrawnCards([]);
    setRestoredReading(null);
    setPhase(AppPhase.Selection);
  };

  const startShuffle = () => {
    setPhase(AppPhase.Shuffling);
    setRestoredReading(null);
    // Visual timeout for shuffle animation
    setTimeout(() => {
      setPhase(AppPhase.Drawing);
      performDraw();
    }, 2000);
  };

  const performDraw = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    const count = selectedSpread.positions.length;

    const selection = shuffled.slice(0, count).map(card => ({
      card,
      isReversed: Math.random() > 0.8, // 20% chance of reversal
      isRevealed: false
    }));

    setDrawnCards(selection);
  };

  const handleCardClick = (index: number) => {
    if (phase !== AppPhase.Reading && phase !== AppPhase.Drawing) return;

    const newDrawn = [...drawnCards];
    if (!newDrawn[index].isRevealed) {
      // Reveal Logic
      newDrawn[index].isRevealed = true;
      setDrawnCards(newDrawn);

      // If all revealed, switch phase
      if (newDrawn.every(c => c.isRevealed)) {
        setPhase(AppPhase.Reading);
      }
    } else {
      // View Detail Logic
      setActiveCardIndex(index);
      setModalOpen(true);
    }
  };

  const revealAll = () => {
    const newDrawn = drawnCards.map(c => ({ ...c, isRevealed: true }));
    setDrawnCards(newDrawn);
    setPhase(AppPhase.Reading);
  };

  const resetApp = () => {
    setPhase(AppPhase.Selection);
    setDrawnCards([]);
    setActiveCardIndex(null);
    setModalOpen(false);
    setRestoredReading(null);
  };

  const handleRestoreReading = (reading: ReadingHistoryItem) => {
    const spread = SPREADS.find(s => s.id === reading.spreadId);
    if (spread) {
      setSelectedSpread(spread);
      setDrawnCards(reading.drawnCards);
      setRestoredReading(reading);
      setPhase(AppPhase.Reading);
      setHistoryOpen(false);

      // Open modal in full reading mode
      setActiveCardIndex(null);
      setModalOpen(true);
    }
  };

  const openFullReading = () => {
    setActiveCardIndex(null); // Indicates full reading mode
    setModalOpen(true);
  };

  // --- Render Helpers ---

  return (
    <div className="min-h-screen bg-slate-950 text-amber-100 overflow-x-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1e1b4b_0%,_#020617_100%)] -z-10"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 -z-10 animate-pulse"></div>

      {/* Navbar */}
      <nav className="p-4 sm:p-6 border-b border-amber-900/30 flex justify-between items-center backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Stars className="text-amber-400 w-6 h-6" />
          <h1 className="text-xl sm:text-2xl font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 font-bold">
            MYSTIC TAROT
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-amber-200 transition-colors"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>

          {phase !== AppPhase.Selection && (
            <button
              onClick={resetApp}
              className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-amber-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Start Over</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container mx-auto p-4 flex flex-col min-h-[85vh]">

        {/* Phase 1: Spread Selection */}
        {phase === AppPhase.Selection && (
          <div className="flex-1 flex flex-col items-center justify-center animate-fadeIn">
            <h2 className="text-2xl font-serif mb-8 text-amber-100/80">Choose Your Spread</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
              {SPREADS.map(spread => (
                <button
                  key={spread.id}
                  onClick={() => handleSpreadSelect(spread)}
                  className={`relative p-6 rounded-xl border transition-all duration-300 group
                    ${selectedSpread.id === spread.id
                      ? 'bg-amber-900/30 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900/50 border-slate-700 hover:border-amber-500/50 hover:bg-slate-800'
                    }`}
                >
                  <h3 className="text-xl font-serif mb-2 text-amber-200 group-hover:text-amber-100">{spread.name}</h3>
                  <p className="text-sm text-slate-400 group-hover:text-slate-300">{spread.description}</p>
                  <div className="mt-4 text-xs text-amber-600 font-mono">{spread.positions.length} Cards</div>
                </button>
              ))}
            </div>

            <div className="mt-12">
              <button
                onClick={startShuffle}
                className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-serif font-medium tracking-tighter text-white bg-slate-900 rounded-lg group"
              >
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-amber-600 rounded-full group-hover:w-56 group-hover:h-56"></span>
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                <span className="relative flex items-center gap-2">
                  <Shuffle className="w-4 h-4" /> Begin Reading
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Shuffling Animation */}
        {phase === AppPhase.Shuffling && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-40 h-64">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-lg border-2 border-slate-600 bg-slate-800"
                  style={{
                    animation: `shuffle ${0.5 + Math.random() * 0.5}s infinite alternate`,
                    transform: `rotate(${Math.random() * 10 - 5}deg) translate(${Math.random() * 5}px, ${Math.random() * 5}px)`,
                    zIndex: i
                  }}
                >
                  {/* Back Pattern */}
                  <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 to-black opacity-80"></div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-amber-200/50 font-serif animate-pulse text-lg">Shuffling the Deck...</p>
          </div>
        )}

        {/* Phase 3 & 4: Drawing and Reading */}
        {(phase === AppPhase.Drawing || phase === AppPhase.Reading) && (
          <div className="flex-1 flex flex-col">
            {/* Controls */}
            <div className="flex justify-center mb-6 gap-4">
              {phase === AppPhase.Drawing && !drawnCards.every(c => c.isRevealed) && (
                <button
                  onClick={revealAll}
                  className="px-4 py-2 text-sm border border-amber-500/30 rounded-full text-amber-200 hover:bg-amber-900/20 transition-colors"
                >
                  Reveal All Cards
                </button>
              )}
              {phase === AppPhase.Reading && (
                <button
                  onClick={openFullReading}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-700 to-amber-600 text-white rounded-full shadow-lg hover:shadow-amber-500/20 transition-transform hover:-translate-y-0.5"
                >
                  <BookOpen className="w-4 h-4" /> AI Interpretation
                </button>
              )}
            </div>

            {/* Spread Area */}
            <div className="flex-1">
              <SpreadLayout
                spreadId={selectedSpread.id}
                positions={selectedSpread.positions}
                drawnCards={drawnCards}
                onCardClick={handleCardClick}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ReadingModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); }}
        drawnCards={drawnCards}
        spread={selectedSpread}
        activeIndex={activeCardIndex}
        restoredReading={restoredReading}
      />

      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleRestoreReading}
      />

      {/* Footer */}
      <footer className="text-center p-4 text-xs text-slate-600 border-t border-slate-900 mt-auto">
        <p>Mystic Tarot © 2023. Powered by Gemini API.</p>
        <p className="mt-1 opacity-50">Images courtesy of Wikimedia Commons (Rider-Waite-Smith Public Domain)</p>
      </footer>

      {/* Simple inline styles for shuffle animation since Tailwind doesn't support custom keyframes easily in CDN mode without config */}
      <style>{`
        @keyframes shuffle {
          0% { transform: translateX(0) rotate(0deg); }
          50% { transform: translateX(-20px) rotate(-5deg); }
          100% { transform: translateX(20px) rotate(5deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;