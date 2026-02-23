
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card as CardComponent } from './components/Card';
import { SuitSelector } from './components/SuitSelector';
import { RulesModal } from './components/RulesModal';
import { Card, GameState, Suit, Rank, Difficulty } from './types';
import { createDeck, isValidMove, SUITS, SUIT_NAMES } from './constants';
import { Trophy, RotateCcw, Info, User, Cpu, BrainCircuit, Volume2, VolumeX } from 'lucide-react';
import { audioService } from './services/audioService';

const INITIAL_HAND_SIZE = 8;

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    currentSuit: 'hearts',
    currentRank: 'A',
    turn: 'player',
    status: 'menu',
    difficulty: 'medium',
    winner: null,
    message: '欢迎来到疯狂 8 点！',
  });

  const [pendingEight, setPendingEight] = useState<Card | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize Game
  const initGame = useCallback((difficulty: Difficulty = 'medium') => {
    if (soundEnabled) audioService.playPlay();
    setIsAiThinking(false);
    const deck = createDeck();
    
    // Find a non-8 starting card
    let firstCardIndex = 0;
    while (deck[firstCardIndex].rank === '8') {
      firstCardIndex++;
    }
    const startingCard = deck.splice(firstCardIndex, 1)[0];

    setGameState({
      deck,
      playerHand: [],
      aiHand: [],
      discardPile: [startingCard],
      currentSuit: startingCard.suit,
      currentRank: startingCard.rank,
      turn: 'player',
      status: 'dealing',
      difficulty,
      winner: null,
      message: "正在发牌...",
      lastPlayBy: null,
    });
  }, [soundEnabled]);

  // Dealing Animation Logic
  useEffect(() => {
    if (gameState.status === 'dealing') {
      const totalToDeal = INITIAL_HAND_SIZE * 2;
      const currentDealt = gameState.playerHand.length + gameState.aiHand.length;

      if (currentDealt < totalToDeal) {
        const timer = setTimeout(() => {
          const [card, ...remainingDeck] = gameState.deck;
          const isPlayerTurnToReceive = currentDealt % 2 === 0;

          if (soundEnabled) audioService.playDraw();

          setGameState(prev => ({
            ...prev,
            deck: remainingDeck,
            playerHand: isPlayerTurnToReceive ? [...prev.playerHand, card] : prev.playerHand,
            aiHand: !isPlayerTurnToReceive ? [...prev.aiHand, card] : prev.aiHand,
          }));
        }, 150);
        return () => clearTimeout(timer);
      } else {
        setGameState(prev => ({
          ...prev,
          status: 'playing',
          message: "轮到你了！请出相同花色或点数的牌。",
        }));
      }
    }
  }, [gameState.status, gameState.playerHand.length, gameState.aiHand.length, soundEnabled]);

  useEffect(() => {
    // Only auto-start if we're in menu and haven't started yet
    // But actually, it's better to let the user click start.
    // However, to keep the initial behavior of starting on mount:
    const hasStarted = sessionStorage.getItem('crazy8s_started');
    if (!hasStarted) {
      initGame();
      sessionStorage.setItem('crazy8s_started', 'true');
    }
  }, []); // Empty dependency array to run only once on mount

  // AI Logic
  useEffect(() => {
    if (gameState.turn === 'ai' && gameState.status === 'playing') {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        aiTurn();
        setIsAiThinking(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.turn, gameState.status]);

  const aiTurn = () => {
    const { aiHand, currentSuit, currentRank, deck, difficulty } = gameState;
    
    // Find playable cards
    const playableCards = aiHand.filter(card => isValidMove(card, currentSuit, currentRank));

    if (playableCards.length > 0) {
      let cardToPlay: Card;

      if (difficulty === 'easy') {
        // Easy: 50% chance to just pick a random playable card
        if (Math.random() > 0.5) {
          cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
        } else {
          const nonEight = playableCards.find(c => c.rank !== '8');
          cardToPlay = nonEight || playableCards[0];
        }
      } else if (difficulty === 'hard') {
        // Hard: 
        // 1. Try to save 8s
        const nonEights = playableCards.filter(c => c.rank !== '8');
        if (nonEights.length > 0) {
          // 2. Pick the card that matches the suit AI has the most of (to set up future moves)
          const suitCounts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
          aiHand.forEach(c => suitCounts[c.suit]++);
          
          cardToPlay = nonEights.reduce((prev, curr) => {
            return suitCounts[curr.suit] > suitCounts[prev.suit] ? curr : prev;
          });
        } else {
          cardToPlay = playableCards[0]; // Must be an 8
        }
      } else {
        // Medium: Prefer non-8s
        const nonEight = playableCards.find(c => c.rank !== '8');
        cardToPlay = nonEight || playableCards[0];
      }
      
      const newAiHand = aiHand.filter(c => c.id !== cardToPlay.id);
      
      if (newAiHand.length === 0) {
        if (soundEnabled) audioService.playLose();
        setGameState(prev => ({
          ...prev,
          aiHand: newAiHand,
          discardPile: [cardToPlay, ...prev.discardPile],
          status: 'lost',
          winner: 'ai',
          message: 'AI 获胜！下次好运。',
          lastPlayBy: 'ai',
        }));
        return;
      }

      if (soundEnabled) audioService.playPlay();

      if (cardToPlay.rank === '8') {
        let bestSuit: Suit;
        if (difficulty === 'easy') {
          bestSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
        } else {
          // AI chooses most frequent suit in its hand
          const suitCounts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
          newAiHand.forEach(c => suitCounts[c.suit]++);
          bestSuit = (Object.keys(suitCounts) as Suit[]).reduce((a, b) => suitCounts[a] > suitCounts[b] ? a : b);
        }

        setGameState(prev => ({
          ...prev,
          aiHand: newAiHand,
          discardPile: [cardToPlay, ...prev.discardPile],
          currentSuit: bestSuit,
          currentRank: '8',
          turn: 'player',
          message: `AI 出了 8 并选择了 ${SUIT_NAMES[bestSuit]}！轮到你了。`,
          lastPlayBy: 'ai',
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          aiHand: newAiHand,
          discardPile: [cardToPlay, ...prev.discardPile],
          currentSuit: cardToPlay.suit,
          currentRank: cardToPlay.rank,
          turn: 'player',
          message: `AI 出了 ${SUIT_NAMES[cardToPlay.suit]} ${cardToPlay.rank}。轮到你了。`,
          lastPlayBy: 'ai',
        }));
      }
    } else if (deck.length > 0) {
      // AI draws
      if (soundEnabled) audioService.playDraw();
      const [drawnCard, ...remainingDeck] = deck;
      setGameState(prev => ({
        ...prev,
        deck: remainingDeck,
        aiHand: [...prev.aiHand, drawnCard],
        message: 'AI 无牌可出，摸了一张牌。',
      }));
      // After drawing, AI checks if it can play the drawn card
      // For simplicity, we'll just end AI turn here or let it try again?
      // Standard rules: draw once, if still can't play, end turn.
      setGameState(prev => ({ ...prev, turn: 'player' }));
    } else {
      // Deck empty, skip
      setGameState(prev => ({
        ...prev,
        turn: 'player',
        message: 'AI 跳过了回合（摸牌堆已空）。',
      }));
    }
  };

  const handlePlayerPlay = (card: Card) => {
    if (gameState.turn !== 'player' || gameState.status !== 'playing') return;
    if (!isValidMove(card, gameState.currentSuit, gameState.currentRank)) return;

    if (card.rank === '8') {
      if (soundEnabled) audioService.playPlay();
      setPendingEight(card);
      const newHand = gameState.playerHand.filter(c => c.id !== card.id);
      
      if (newHand.length === 0) {
        if (soundEnabled) audioService.playWin();
        setGameState(prev => ({
          ...prev,
          playerHand: newHand,
          discardPile: [card, ...prev.discardPile],
          status: 'won',
          winner: 'player',
          message: '恭喜！你赢了！',
          lastPlayBy: 'player',
        }));
      } else {
        if (soundEnabled) audioService.playPlay();
        setGameState(prev => ({ 
          ...prev, 
          playerHand: newHand,
          discardPile: [card, ...prev.discardPile],
          status: 'choosing_suit',
          message: '你打出了万能 8！请选择一个新花色。',
          lastPlayBy: 'player',
        }));
      }
    } else {
      const newHand = gameState.playerHand.filter(c => c.id !== card.id);
      if (newHand.length === 0) {
        if (soundEnabled) audioService.playWin();
        setGameState(prev => ({
          ...prev,
          playerHand: newHand,
          discardPile: [card, ...prev.discardPile],
          status: 'won',
          winner: 'player',
          message: '恭喜！你赢了！',
          lastPlayBy: 'player',
        }));
      } else {
        if (soundEnabled) audioService.playPlay();
        setGameState(prev => ({
          ...prev,
          playerHand: newHand,
          discardPile: [card, ...prev.discardPile],
          currentSuit: card.suit,
          currentRank: card.rank,
          turn: 'ai',
          message: '漂亮！AI 正在思考...',
          lastPlayBy: 'player',
        }));
      }
    }
  };

  const handleSuitSelect = (suit: Suit) => {
    if (soundEnabled) audioService.playPlay();
    setGameState(prev => ({
      ...prev,
      currentSuit: suit,
      currentRank: '8',
      turn: 'ai',
      status: 'playing',
      message: `你选择了 ${SUIT_NAMES[suit]}。AI 正在思考...`,
    }));
    setPendingEight(null);
  };

  const handleDraw = () => {
    if (gameState.turn !== 'player' || gameState.status !== 'playing') return;
    
    if (gameState.deck.length > 0) {
      if (soundEnabled) audioService.playDraw();
      const [drawnCard, ...remainingDeck] = gameState.deck;
      const canPlayDrawn = isValidMove(drawnCard, gameState.currentSuit, gameState.currentRank);
      
      setGameState(prev => ({
        ...prev,
        deck: remainingDeck,
        playerHand: [...prev.playerHand, drawnCard],
        message: canPlayDrawn ? '你摸到了一张可以出的牌！' : '运气不佳，轮到 AI 了。',
        turn: canPlayDrawn ? 'player' : 'ai',
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        turn: 'ai',
        message: '摸牌堆已空！跳过到 AI。',
      }));
    }
  };

  return (
    <div className="h-screen w-full flex flex-col felt-texture overflow-hidden p-4 sm:p-8">
      <AnimatePresence mode="wait">
        {gameState.status === 'menu' ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="flex-grow flex flex-col items-center justify-center text-center z-10"
          >
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", ease: "easeInOut" }}
              className="w-32 h-32 sm:w-40 sm:h-40 bg-yellow-500 rounded-3xl flex items-center justify-center shadow-2xl mb-8 rotate-12"
            >
              <span className="text-7xl sm:text-8xl font-bold text-slate-900">8</span>
            </motion.div>
            
            <h1 className="text-5xl sm:text-7xl font-serif font-bold italic tracking-tighter mb-4 drop-shadow-lg">
              疯狂 8 点
            </h1>
            <p className="text-white/60 font-mono uppercase tracking-[0.3em] text-sm mb-12">
              Crazy Eights • 经典纸牌游戏
            </p>

            <div className="flex flex-col gap-4 w-full max-w-xs">
              <div className="grid grid-cols-3 gap-2 mb-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setGameState(prev => ({ ...prev, difficulty: d }))}
                    className={`
                      py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                      ${gameState.difficulty === d 
                        ? 'bg-yellow-500 text-slate-900 shadow-lg scale-105' 
                        : 'bg-white/5 text-white/40 hover:bg-white/10'}
                    `}
                  >
                    {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => initGame(gameState.difficulty)}
                className="group relative px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-xl shadow-xl hover:bg-yellow-400 transition-all active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  开始游戏 <Trophy size={20} />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowRules(true)}
                  className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors text-left"
                >
                  <div className="text-xs text-white/40 mb-1 uppercase font-mono">规则</div>
                  <div className="text-sm font-medium">52张标准牌</div>
                </button>
                <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="text-xs text-white/40 mb-1 uppercase font-mono">难度</div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    <BrainCircuit size={14} className="text-yellow-500" />
                    {gameState.difficulty === 'easy' ? '简单' : gameState.difficulty === 'medium' ? '中等' : '困难'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-grow flex flex-col"
          >
            {/* Header */}
            <header className="flex justify-between items-center mb-4">
              <div className="flex items-baseline gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-slate-900">8</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold italic tracking-tight">
                    疯狂 8 点
                  </h1>
                </div>
                <span className="hidden sm:inline text-xs font-mono text-white/40 uppercase tracking-widest">
                  52张标准牌 / {gameState.difficulty === 'easy' ? '简单' : gameState.difficulty === 'medium' ? '中等' : '困难'} AI
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  title={soundEnabled ? "关闭声音" : "开启声音"}
                >
                  {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </button>
                <button 
                  onClick={() => setGameState(prev => ({ ...prev, status: 'menu' }))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  title="返回主菜单"
                >
                  <RotateCcw size={24} />
                </button>
              </div>
            </header>

            {/* Main Game Area */}
            <main className="flex-grow flex flex-col justify-between relative">
              
              {/* AI Hand */}
              <div className="flex flex-col items-center gap-2 pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-white/60 text-xs font-mono uppercase tracking-widest">
                    AI 对手 ({gameState.aiHand.length})
                  </div>
                  <AnimatePresence>
                    {isAiThinking && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full"
                      >
                        <span className="flex gap-1">
                          <motion.span
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                            className="w-1 h-1 bg-yellow-500 rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="w-1 h-1 bg-yellow-500 rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="w-1 h-1 bg-yellow-500 rounded-full"
                          />
                        </span>
                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-tighter">思考中</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex justify-center -space-x-12 sm:-space-x-16 h-32 sm:h-40">
                  <AnimatePresence>
                    {gameState.aiHand.map((card, idx) => (
                      <CardComponent 
                        key={card.id} 
                        card={card} 
                        isFaceUp={false} 
                        className="scale-90 opacity-80" 
                        initialY={300}
                        exitY={400}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Center: Deck and Discard */}
              <div className="flex justify-center items-center gap-8 sm:gap-16 my-4">
                {/* Deck */}
                <div className="flex flex-col items-center gap-2">
                  <div 
                    onClick={handleDraw}
                    className={`
                      relative w-20 h-28 sm:w-24 sm:h-36 rounded-lg card-shadow cursor-pointer
                      bg-blue-900 border-2 border-white/20 flex items-center justify-center
                      ${gameState.turn === 'player' && gameState.status === 'playing' ? 'hover:ring-4 ring-yellow-400' : 'opacity-50'}
                    `}
                  >
                    {gameState.deck.length > 0 ? (
                      <div className="text-white/40 font-serif italic text-xl">
                        {gameState.deck.length}
                      </div>
                    ) : (
                      <div className="text-white/20 text-xs text-center px-2">Empty</div>
                    )}
                  </div>
                  <span className="text-xs font-mono text-white/40 uppercase">摸牌堆</span>
                </div>

                {/* Discard Pile */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-20 h-28 sm:w-24 sm:h-36">
                     <AnimatePresence mode="popLayout">
                      {gameState.discardPile.length > 0 && (
                        <CardComponent 
                          key={gameState.discardPile[0].id} 
                          card={gameState.discardPile[0]} 
                          className="absolute inset-0"
                          initialY={gameState.lastPlayBy === 'player' ? 400 : gameState.lastPlayBy === 'ai' ? -400 : 0}
                        />
                      )}
                     </AnimatePresence>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-mono text-white/40 uppercase">弃牌堆</span>
                    {gameState.currentRank === '8' && (
                      <span className="text-xs font-bold text-yellow-400 uppercase mt-1">
                        花色: {SUIT_NAMES[gameState.currentSuit]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Player Hand */}
              <div className="flex flex-col items-center gap-4 pb-8">
                <div className="bg-black/20 px-4 py-2 rounded-full text-sm font-medium text-white/80 animate-pulse">
                  {gameState.message}
                </div>

                <div className="flex justify-center -space-x-8 sm:-space-x-12 h-40 sm:h-48 pb-4 overflow-x-auto max-w-full px-8">
                  <AnimatePresence>
                    {gameState.playerHand.map((card) => (
                      <CardComponent 
                        key={card.id} 
                        card={card} 
                        isPlayable={gameState.turn === 'player' && gameState.status === 'playing' && isValidMove(card, gameState.currentSuit, gameState.currentRank)}
                        onClick={() => handlePlayerPlay(card)}
                        initialY={-300}
                        exitY={-400}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-xs font-mono uppercase tracking-widest">
                  你 ({gameState.playerHand.length})
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence>
        {showRules && (
          <RulesModal onClose={() => setShowRules(false)} />
        )}
        {gameState.status === 'choosing_suit' && (
          <SuitSelector onSelect={handleSuitSelect} />
        )}

        {(gameState.status === 'won' || gameState.status === 'lost') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4"
            >
              <div className={`
                w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center
                ${gameState.status === 'won' ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-600'}
              `}>
                {gameState.status === 'won' ? <Trophy size={40} /> : <Info size={40} />}
              </div>
              <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2 italic">
                {gameState.status === 'won' ? '胜利！' : '游戏结束'}
              </h2>
              <p className="text-slate-500 mb-8">
                {gameState.message}
              </p>
              <button
                onClick={initGame}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} /> 再玩一局
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Accents */}
      <div className="fixed top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
