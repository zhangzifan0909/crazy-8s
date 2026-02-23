
import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';

interface CardProps {
  card: CardType;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
  initialY?: number;
  exitY?: number;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  isFaceUp = true, 
  onClick, 
  isPlayable = false,
  className = "",
  initialY = 50,
  exitY = -100
}) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: initialY }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ 
        scale: 0.5, 
        opacity: 0, 
        y: exitY,
        rotate: 15,
        transition: { duration: 0.3 } 
      }}
      whileHover={isPlayable ? { y: -20, scale: 1.05 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-20 h-28 sm:w-24 sm:h-36 rounded-lg card-shadow cursor-pointer transition-shadow
        ${isFaceUp ? 'bg-white' : 'bg-blue-800'}
        ${isPlayable ? 'ring-4 ring-yellow-400 shadow-xl' : ''}
        ${className}
      `}
    >
      {isFaceUp ? (
        <div className={`flex flex-col h-full p-2 ${SUIT_COLORS[card.suit]}`}>
          <div className="flex justify-between items-start">
            <span className="text-lg sm:text-xl font-bold leading-none">{card.rank}</span>
            <span className="text-sm sm:text-base">{SUIT_SYMBOLS[card.suit]}</span>
          </div>
          <div className="flex-grow flex items-center justify-center text-3xl sm:text-4xl">
            {SUIT_SYMBOLS[card.suit]}
          </div>
          <div className="flex justify-between items-end rotate-180">
            <span className="text-lg sm:text-xl font-bold leading-none">{card.rank}</span>
            <span className="text-sm sm:text-base">{SUIT_SYMBOLS[card.suit]}</span>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center border-4 border-white/20 rounded-lg">
          <div className="w-12 h-16 sm:w-16 sm:h-24 border-2 border-white/10 rounded flex items-center justify-center">
             <div className="text-white/20 text-2xl font-serif italic">T</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
