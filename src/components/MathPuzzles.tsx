import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Star, Trophy, RefreshCcw, Lightbulb, CheckCircle2, XCircle, Brain, Apple, Banana, Cherry, Carrot, Dog, Cat, Ghost, Bot as Robot } from 'lucide-react';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ICONS = [
  { icon: Apple, color: 'text-red-500' },
  { icon: Banana, color: 'text-yellow-500' },
  { icon: Cherry, color: 'text-rose-500' },
  { icon: Carrot, color: 'text-orange-500' },
  { icon: Dog, color: 'text-amber-700' },
  { icon: Cat, color: 'text-indigo-500' },
  { icon: Ghost, color: 'text-purple-400' },
  { icon: Robot, color: 'text-slate-500' },
];

interface Puzzle {
  type: 'logic' | 'sequence';
  questionNodes: React.ReactNode;
  answer: number;
  options: number[];
  hint: string;
}

interface MathPuzzlesProps {
  initialAge?: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

export const MathPuzzles: React.FC<MathPuzzlesProps> = ({ initialAge = 6 }) => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const [totalInRound, setTotalInRound] = useState(15);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [showHint, setShowHint] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  const generatePuzzle = (diff = difficulty) => {
    if (currentCount >= totalInRound) {
      setGameState('finished');
      return;
    }

    const puzzleType = Math.random() > 0.5 ? 'logic' : 'sequence';
    
    if (puzzleType === 'logic') {
      const iconIdx = Math.floor(Math.random() * ICONS.length);
      const Icon = ICONS[iconIdx].icon;
      const color = ICONS[iconIdx].color;

      let val, sum, nodes, answer, hintText;

      if (diff === 'easy') {
        val = Math.floor(Math.random() * 9) + 1;
        sum = val + val;
        answer = val;
        nodes = (
          <div className="flex items-center justify-center gap-4 text-3xl md:text-5xl font-bold">
            <Icon className={cn("w-12 h-12 md:w-16 md:h-16", color)} />
            <span>+</span>
            <Icon className={cn("w-12 h-12 md:w-16 md:h-16", color)} />
            <span>=</span>
            <span className="text-math-primary underline decoration-wavy">{sum}</span>
          </div>
        );
        hintText = `Hai đồ vật giống hệt nhau cộng lại bằng ${sum}. Bé hãy chia đôi ${sum} ra nhé!`;
      } else if (diff === 'medium') {
        const val1 = Math.floor(Math.random() * 10) + 5;
        const val2 = Math.floor(Math.random() * 10) + 2;
        sum = val1 + val2;
        answer = val1;
        nodes = (
          <div className="flex items-center justify-center gap-4 text-3xl md:text-5xl font-bold">
            <Icon className={cn("w-12 h-12 md:w-16 md:h-16", color)} />
            <span>+</span>
            <span className="text-math-secondary">{val2}</span>
            <span>=</span>
            <span className="text-math-primary underline decoration-wavy">{sum}</span>
          </div>
        );
        hintText = `Số nào cộng với ${val2} thì được ${sum} nhỉ? Bé hãy lấy ${sum} trừ đi ${val2} nhé!`;
      } else {
        val = Math.floor(Math.random() * 8) + 2;
        sum = val * val;
        answer = val;
        nodes = (
          <div className="flex items-center justify-center gap-4 text-3xl md:text-5xl font-bold">
            <Icon className={cn("w-12 h-12 md:w-16 md:h-16", color)} />
            <span>×</span>
            <Icon className={cn("w-12 h-12 md:w-16 md:h-16", color)} />
            <span>=</span>
            <span className="text-math-primary underline decoration-wavy">{sum}</span>
          </div>
        );
        hintText = `Số nào nhân với chính nó thì bằng ${sum} nhỉ? Bé hãy nhớ lại bảng cửu chương nhé!`;
      }

      const options = [answer];
      while (options.length < 4) {
        const wrong = Math.max(1, answer + Math.floor(Math.random() * 10) - 5);
        if (!options.includes(wrong)) options.push(wrong);
      }

      setPuzzle({
        type: 'logic',
        questionNodes: nodes,
        answer,
        options: options.sort(() => Math.random() - 0.5),
        hint: hintText
      });
    } else {
      // Sequence
      let start, step, seq, answer, hintText;

      if (diff === 'easy') {
        start = Math.floor(Math.random() * 10) + 1;
        step = Math.floor(Math.random() * 5) + 1;
        seq = [start, start + step, start + step * 2];
        answer = start + step * 3;
        hintText = `Số sau lớn hơn số trước ${step} đơn vị. Bé hãy lấy ${seq[2]} cộng thêm ${step} nhé!`;
      } else if (diff === 'medium') {
        start = 20 + Math.floor(Math.random() * 20);
        step = Math.floor(Math.random() * 8) + 2;
        seq = [start, start - step, start - step * 2];
        answer = start - step * 3;
        hintText = `Các con số đang nhỏ dần đi! Mỗi lần bớt đi ${step}. Bé hãy lấy ${seq[2]} trừ đi ${step} nhé!`;
      } else {
        const isGeometric = Math.random() > 0.5;
        if (isGeometric) {
          start = Math.floor(Math.random() * 3) + 2;
          step = 2;
          seq = [start, start * step, start * step * step];
          answer = start * Math.pow(step, 3);
          hintText = `Số sau gấp đôi (x2) số trước. Bé hãy lấy ${seq[2]} nhân với 2 nhé!`;
        } else {
          start = 50 + Math.floor(Math.random() * 50);
          step = Math.floor(Math.random() * 10) + 5;
          seq = [start, start - step, start - step * 2];
          answer = start - step * 3;
          hintText = `Thử thách lớn nè! Mỗi lần bớt đi ${step}. Bé hãy lấy ${seq[2]} trừ đi ${step} nhé!`;
        }
      }

      const questionNodes = (
        <div className="flex items-center justify-center gap-4 text-4xl md:text-6xl font-display font-bold text-gray-700">
          {seq.map((n, i) => (
            <React.Fragment key={i}>
              <span className="bg-white w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">{n}</span>
              <span className="text-gray-300 text-2xl">,</span>
            </React.Fragment>
          ))}
          <span className="w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-4 border-dashed border-math-secondary text-math-secondary animate-pulse">?</span>
        </div>
      );

      const options = [answer];
      while (options.length < 4) {
        const wrong = Math.max(1, answer + Math.floor(Math.random() * 10) - 5);
        if (!options.includes(wrong)) options.push(wrong);
      }

      setPuzzle({
        type: 'sequence',
        questionNodes,
        answer,
        options: options.sort(() => Math.random() - 0.5),
        hint: hintText
      });
    }

    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowHint(false);
  };

  useEffect(() => {
    generatePuzzle();
  }, [difficulty, totalInRound]);

  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    setScore(0);
    setCurrentCount(0);
    setGameState('playing');
  };

  const restartGame = () => {
    setScore(0);
    setCurrentCount(0);
    setGameState('playing');
    generatePuzzle();
  };

  const handleAnswer = (val: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(val);
    const correct = val === puzzle?.answer;
    setIsCorrect(correct);
    setCurrentCount(prev => prev + 1);
    
    if (correct) {
      setScore(s => s + 1);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43']
      });
    }
  };

  if (gameState === 'finished') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[40px] shadow-2xl border-4 border-math-secondary/20 space-y-6"
        >
          <div className="w-24 h-24 bg-math-secondary/10 rounded-full flex items-center justify-center mx-auto text-math-secondary">
            <Brain className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-4xl text-gray-800">Cực phẩm luôn bé ơi!</h2>
            <p className="text-xl text-gray-500">Bé đã trả lời đúng {score} trên tổng số {totalInRound} câu đố.</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(score / totalInRound) * 100}%` }}
                className="h-full bg-math-secondary"
              />
            </div>
            <p className="font-bold text-math-secondary">
              {score === totalInRound ? 'Bé là một thiên tài giải đố thực thụ!' : score >= totalInRound/2 ? 'Tư duy của bé rất tốt đấy, hãy rèn luyện thêm nhé!' : 'Đừng nản chí, mỗi câu đố đều giúp não bộ của bé thông minh hơn!'}
            </p>
          </div>

          <button 
            onClick={restartGame}
            className="w-full py-4 bg-math-secondary text-white font-bold rounded-2xl shadow-lg hover:brightness-105 transition-all text-xl"
          >
            Làm thêm câu khác nhé!
          </button>
        </motion.div>
      </div>
    );
  }

  if (!puzzle) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white/50 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-math-accent/20 flex items-center justify-center text-orange-500 shadow-inner">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiến độ</p>
              <p className="text-2xl font-display font-bold text-gray-800">{currentCount + 1}/{totalInRound}</p>
            </div>
          </div>
          <div className="w-px h-10 bg-gray-200 hidden md:block" />
          <div className="hidden md:block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đã đúng</p>
            <p className="text-2xl font-display font-bold text-green-600">{score}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button 
              key={d}
              onClick={() => handleDifficultyChange(d)}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold text-xs transition-all capitalize",
                difficulty === d 
                  ? d === 'hard' ? "bg-red-500 text-white shadow-md" : d === 'medium' ? "bg-math-secondary text-white shadow-md" : "bg-math-primary text-white shadow-md"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {d === 'easy' ? 'Dễ' : d === 'medium' ? 'Vừa' : 'Khó'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
          {[10, 15, 20, 25].map(cnt => (
            <button
              key={cnt}
              onClick={() => { setTotalInRound(cnt); restartGame(); }}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-black transition-all",
                totalInRound === cnt ? "bg-white text-math-accent shadow-sm" : "text-gray-400"
              )}
            >
              {cnt}
            </button>
          ))}
        </div>
        
        <button 
          onClick={restartGame}
          className="p-3 bg-white text-gray-400 hover:text-math-primary rounded-2xl border border-gray-100 shadow-sm transition-all active:scale-95"
        >
          <RefreshCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Main Puzzle Area */}
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-math-primary/10 via-math-secondary/10 to-math-accent/10 rounded-[40px] blur-xl opacity-50 -z-10" />
        <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-xl border-2 border-white space-y-12">
          <div className="text-center space-y-2">
            <h3 className="font-display text-3xl text-gray-800">Bé hãy giải đố nhé!</h3>
            <p className="text-gray-500 font-medium">Tìm con số bí mật đang ẩn giấu...</p>
          </div>

          <div className="py-12 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center min-h-[200px]">
            {puzzle.questionNodes}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {puzzle.options.map((option) => (
              <motion.button
                key={option}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
                className={cn(
                  "p-8 rounded-3xl text-3xl font-display font-bold border-4 transition-all shadow-lg",
                  selectedAnswer === option
                    ? isCorrect
                      ? "bg-green-500 border-green-600 text-white"
                      : "bg-red-500 border-red-600 text-white"
                    : selectedAnswer !== null && option === puzzle.answer
                      ? "border-green-500 text-green-600 bg-green-50"
                      : "bg-white border-gray-100 text-gray-700 hover:border-math-secondary hover:text-math-secondary"
                )}
              >
                {option}
              </motion.button>
            ))}
          </div>

          {/* Hint Section */}
          <div className="flex flex-col items-center gap-4">
            {!showHint ? (
              <button 
                onClick={() => setShowHint(true)}
                className="flex items-center gap-2 text-math-secondary font-bold hover:underline transition-all"
              >
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Mách nước cho bé
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-100 flex items-start gap-4 max-w-sm"
              >
                <Lightbulb className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                <p className="text-sm font-medium text-amber-800 leading-relaxed">
                  {puzzle.hint}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Result feedback */}
      <AnimatePresence>
        {isCorrect !== null && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className={cn(
              "p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl",
              isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
            )}
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                {isCorrect ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-display font-bold">
                  {isCorrect ? 'Tuyệt đỉnh luôn bé ơi!' : 'Ồ, suýt trúng rồi!'}
                </p>
                <p className="opacity-90 font-medium">
                  {isCorrect ? 'Bé giải mã cực giỏi, tiếp tục nào!' : `Kết quả chính xác phải là ${puzzle.answer} cơ.`}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => generatePuzzle()}
              className="px-10 py-4 bg-white text-gray-800 font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all text-lg"
            >
              CÂU TIẾP THEO
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
