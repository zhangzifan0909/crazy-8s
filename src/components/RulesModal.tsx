
import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white text-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-2xl font-serif font-bold italic">游戏规则</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-6">
          <section>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-slate-900">1</span>
              基础发牌
            </h3>
            <p className="text-slate-600 leading-relaxed">
              使用标准的 52 张扑克牌（无大小王）。每位玩家初始分得 8 张牌。剩余牌堆作为摸牌堆，翻开第一张作为弃牌堆的起始牌。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-slate-900">2</span>
              出牌逻辑
            </h3>
            <p className="text-slate-600 leading-relaxed">
              玩家轮流出牌。所出的牌必须在<span className="font-bold text-slate-900">“花色”</span>或<span className="font-bold text-slate-900">“点数”</span>上与弃牌堆最顶部的牌匹配。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-slate-900">3</span>
              万能 8 点
            </h3>
            <p className="text-slate-600 leading-relaxed">
              数字<span className="font-bold text-yellow-600">“8”</span>是万用牌。玩家可以在任何时候打出 8，并随后指定一个新的花色（红心、方块、梅花或黑桃）。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-slate-900">4</span>
              摸牌规则
            </h3>
            <p className="text-slate-600 leading-relaxed">
              如果玩家无牌可出，必须从摸牌堆摸一张牌。如果摸到的牌可以立即打出，则可以出牌；否则跳过该回合。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-slate-900">5</span>
              胜利条件
            </h3>
            <p className="text-slate-600 leading-relaxed">
              最先清空所有手牌的一方获胜！
            </p>
          </section>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            我明白了
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
