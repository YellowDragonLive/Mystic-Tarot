import React, { useEffect, useState } from 'react';
import { DrawnCard, SpreadConfig } from '../types';
import { X, Sparkles, Loader2, Image as ImageIcon, Download, Send, MessageSquare } from 'lucide-react';
import { getTarotInterpretation, generateTarotImage, chatWithTarotReader } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, ReadingHistoryItem } from '../types';
import { saveReading } from '../utils/history';

interface ReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawnCards: DrawnCard[];
  spread: SpreadConfig;
  activeIndex: number | null; // If viewing specific card detail
  restoredReading?: ReadingHistoryItem | null;
}

const ReadingModal: React.FC<ReadingModalProps> = ({ isOpen, onClose, drawnCards, spread, activeIndex, restoredReading }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingReading, setLoadingReading] = useState(false);

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);

  const [activeTab, setActiveTab] = useState<'card' | 'reading'>('card');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [readingId, setReadingId] = useState<string>('');

  // Reset state when modal opens/closes or active index changes
  useEffect(() => {
    if (isOpen) {
      if (activeIndex === null) {
        // Full Reading Mode
        setActiveTab('reading');
        if (!aiAnalysis && !loadingReading && messages.length === 0) {
          // Only fetch if we don't have analysis/messages (restoration handles this)
          fetchAiReading();
        }
      } else {
        // Single Card Mode
        setActiveTab('card');
        // Reset generated image when switching cards
        setGeneratedImageUrl(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeIndex]);

  // Handle New Reading or Restoration
  useEffect(() => {
    if (restoredReading && JSON.stringify(restoredReading.drawnCards) === JSON.stringify(drawnCards)) {
      // Restore State
      const analysisMsg = restoredReading.chatHistory.find(m => m.role === 'assistant');
      setAiAnalysis(analysisMsg?.content || '');
      setMessages(restoredReading.chatHistory);
      setReadingId(restoredReading.id);
    } else {
      // New Reading
      setAiAnalysis('');
      setMessages([]);
      setReadingId('');
    }
  }, [drawnCards, restoredReading]);

  const saveCurrentReading = (currentMessages: ChatMessage[]) => {
    if (!readingId) return;

    saveReading({
      id: readingId,
      timestamp: Date.now(),
      spreadId: spread.id,
      drawnCards,
      chatHistory: currentMessages
    });
  };

  const fetchAiReading = async () => {
    setLoadingReading(true);
    setAiAnalysis(''); // Clear previous analysis
    const newId = Date.now().toString();
    setReadingId(newId);

    let currentAnalysis = '';
    const { analysis, systemPrompt } = await getTarotInterpretation(spread, drawnCards, (chunk) => {
      setAiAnalysis(prev => prev + chunk);
      currentAnalysis += chunk;
    });

    // Initialize chat history
    const initialMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: analysis } // Use the full returned analysis
    ];
    setMessages(initialMessages);

    // Save to history
    saveReading({
      id: newId,
      timestamp: Date.now(),
      spreadId: spread.id,
      drawnCards,
      chatHistory: initialMessages
    });

    setLoadingReading(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatting) return;

    const userMsg: ChatMessage = { role: 'user', content: chatInput };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setChatInput('');
    setIsChatting(true);

    // Add placeholder for assistant response
    const assistantMsgIndex = newMessages.length;
    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    const messagesWithAssistant = [...newMessages, assistantMsg];
    setMessages(messagesWithAssistant);

    let fullResponse = '';
    await chatWithTarotReader(newMessages, (chunk) => {
      fullResponse += chunk;
      setMessages(prev => {
        const updated = [...prev];
        if (updated[assistantMsgIndex]) {
          updated[assistantMsgIndex] = { ...updated[assistantMsgIndex], content: fullResponse };
        }
        return updated;
      });
    });

    setIsChatting(false);
    saveCurrentReading(messagesWithAssistant.map((m, i) => i === assistantMsgIndex ? { ...m, content: fullResponse } : m));
  };

  const handleGenerateImage = async () => {
    if (activeIndex === null) return;
    const cardName = drawnCards[activeIndex].card.name;

    setGeneratingImage(true);
    const result = await generateTarotImage(cardName);
    setGeneratedImageUrl(result);
    setGeneratingImage(false);
  };

  if (!isOpen) return null;

  const activeCard = activeIndex !== null ? drawnCards[activeIndex] : null;
  const activePosition = activeIndex !== null ? spread.positions[activeIndex] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/50 rounded-xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-500/20 bg-slate-950">
          <h2 className="text-xl font-serif text-amber-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            {activeTab === 'card' && activeCard ? '单牌解读' : '整体解读'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-amber-100" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-amber-500/20">
          {activeIndex !== null && (
            <button
              onClick={() => setActiveTab('card')}
              className={`flex-1 py-3 text-sm font-serif tracking-wide transition-colors ${activeTab === 'card' ? 'bg-amber-900/20 text-amber-200 border-b-2 border-amber-500' : 'text-slate-400 hover:text-amber-100'}`}
            >
              单牌详情
            </button>
          )}
          <button
            onClick={() => { setActiveTab('reading'); if (!aiAnalysis) fetchAiReading(); }}
            className={`flex-1 py-3 text-sm font-serif tracking-wide transition-colors ${activeTab === 'reading' ? 'bg-amber-900/20 text-amber-200 border-b-2 border-amber-500' : 'text-slate-400 hover:text-amber-100'}`}
          >
            整体解读
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">

          {/* Tab: Single Card Detail */}
          {activeTab === 'card' && activeCard && activePosition && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">

                {/* Card Image Area */}
                <div className="relative group shrink-0 w-40 h-64 sm:w-48 sm:h-72">
                  <div className={`w-full h-full rounded-lg overflow-hidden border-2 border-amber-500/50 shadow-lg ${activeCard.isReversed ? 'rotate-180' : ''} transition-transform duration-500`}>
                    <img
                      src={generatedImageUrl || activeCard.card.imgUrl}
                      alt={activeCard.card.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Loading Overlay */}
                  {generatingImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg backdrop-blur-sm z-10">
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-2 z-20">
                    {!generatedImageUrl ? (
                      <button
                        onClick={handleGenerateImage}
                        disabled={generatingImage}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-full shadow-lg transition-all"
                        title="Generate unique AI art for this card"
                      >
                        <ImageIcon className="w-3 h-3" />
                        {generatingImage ? '绘制中...' : '生成艺术图'}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setGeneratedImageUrl(null)}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-full shadow-lg transition-all"
                        >
                          原图
                        </button>
                        <a
                          href={generatedImageUrl}
                          download={`mystic-tarot-${activeCard.card.name.replace(/\s+/g, '-').toLowerCase()}.png`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded-full shadow-lg transition-all"
                        >
                          <Download className="w-3 h-3" /> 保存
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4 text-center sm:text-left flex-1">
                  <div>
                    <h3 className="text-3xl font-serif text-amber-100">{activeCard.card.name_cn}</h3>
                    <p className="text-slate-400 text-sm mt-1">{activeCard.card.name} ({activeCard.isReversed ? '逆位' : '正位'})</p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg border border-amber-500/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-amber-500 text-xs uppercase tracking-wider font-bold">牌阵位置</span>
                      <span className="text-slate-500 text-xs">{activePosition.id + 1}</span>
                    </div>
                    <p className="text-slate-200 font-medium font-serif text-lg">{activePosition.name}</p>
                    <p className="text-slate-400 text-sm italic">{activePosition.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {activeCard.card.keywords.map(k => (
                      <span key={k} className="px-3 py-1 bg-indigo-950/50 text-indigo-200 text-xs rounded border border-indigo-500/30">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: AI Reading */}
          {activeTab === 'reading' && (
            <div className="h-full">
              {!aiAnalysis && !loadingReading && (
                <div className="text-center py-10">
                  <p className="text-slate-400 mb-4">使用 AI 解锁牌阵的奥秘。</p>
                  <button
                    onClick={fetchAiReading}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-full font-serif transition-all shadow-lg hover:shadow-amber-500/20"
                  >
                    获取 AI 解读
                  </button>
                </div>
              )}

              {loadingReading && (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  <p className="text-amber-200/70 font-serif animate-pulse">正在连接灵性指引...</p>
                </div>
              )}

              {aiAnalysis && (
                <div className="space-y-8 pb-20">
                  <div className="prose prose-invert prose-amber max-w-none">
                    <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                  </div>

                  {/* Chat Section */}
                  <div className="border-t border-amber-500/20 pt-8 mt-8">
                    <h3 className="text-lg font-serif text-amber-200 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> 向塔罗提问
                    </h3>

                    {/* Chat History (excluding system and initial reading) */}
                    <div className="space-y-4 mb-6">
                      {messages.slice(2).map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-lg p-3 ${msg.role === 'user'
                            ? 'bg-amber-900/40 text-amber-100'
                            : 'bg-slate-800 text-slate-300'
                            }`}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="输入你的追问..."
                        disabled={isChatting}
                        className="w-full bg-slate-950/50 border border-amber-500/30 rounded-lg pl-4 pr-12 py-3 text-sm text-amber-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || isChatting}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-amber-500 hover:text-amber-300 disabled:opacity-50 disabled:hover:text-amber-500 transition-colors"
                      >
                        {isChatting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingModal;