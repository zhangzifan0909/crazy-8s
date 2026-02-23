
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Suit } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS, SUITS, SUIT_NAMES } from '../constants';

interface SuitSelectorProps {
  onSelect: (suit: Suit) => void;
}

export const SuitSelector: React.FC<SuitSelectorProps> = ({ onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 text-center italic">
          选择一个新花色
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {SUITS.map((suit) => (
            <button
              key={suit}
              onClick={() => onSelect(suit)}
              className={`
                flex flex-col items-center justify-center p-6 rounded-xl border-2 border-slate-100
                hover:border-yellow-400 hover:bg-yellow-50 transition-all group
              `}
            >
              <span className={`text-5xl mb-2 ${SUIT_COLORS[suit]}`}>
                {SUIT_SYMBOLS[suit]}
              </span>
              <span className="text-slate-600 font-medium capitalize group-hover:text-slate-900">
                {SUIT_NAMES[suit]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
