import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Trophy, RefreshCw, Zap, Brain, ChevronRight, Hash, ArrowLeftRight, Settings2, Apple, Star, Dog as Puppy, Calculator } from 'lucide-react';
import { RewardService } from '../services/rewardService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type GameMode = 'speed' | 'thinking' | 'word_problems' | 'logic_math';
type Difficulty = 'easy' | 'medium' | 'hard';

const CORRECT_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';
const WRONG_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3';
const START_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3';
const FINISH_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3';

const VISUAL_ICONS = [
  { icon: Apple, color: 'text-red-500', name: 'quả táo' },
  { icon: Star, color: 'text-yellow-500', name: 'ngôi sao' },
  { icon: Puppy, color: 'text-amber-600', name: 'bạn cún' },
];

interface MathGamesProps {
  age?: number;
}

export const MathGames: React.FC<MathGamesProps> = ({ age = 7 }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'settings' | 'finished'>('idle');
  const [gameMode, setGameMode] = useState<GameMode>('speed');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  useEffect(() => {
    // Set difficulty based on age
    if (age <= 7) setDifficulty('easy');
    else if (age <= 10) setDifficulty('medium');
    else setDifficulty('hard');
  }, [age]);
  
  // Custom Settings
  const [selectedOps, setSelectedOps] = useState<string[]>(age >= 8 ? ['*', '/', '+', '-'] : ['+', '-']);
  const [maxRange, setMaxRange] = useState(age >= 8 ? 50 : 20);
  
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentProblem, setCurrentProblem] = useState<any>({ a: 0, b: 0, op: '+', answer: 0, question: '' });
  const [options, setOptions] = useState<any[]>([]);
  const [lastProblemTime, setLastProblemTime] = useState<number>(Date.now());
  const [adaptiveMessage, setAdaptiveMessage] = useState<string | null>(null);

  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const generateProblem = useCallback(() => {
    let a, b, answer, op, question, newOptions: any[] = [];
    const ops = selectedOps.length > 0 ? selectedOps : ['+'];
    op = ops[Math.floor(Math.random() * ops.length)];
    
    // Adjust range and complexity based on difficulty
    let range = 20;
    let factorLimit = 9;
    
    if (difficulty === 'easy') {
      range = 10;
      factorLimit = 5;
    } else if (difficulty === 'medium') {
      range = 30;
      factorLimit = 10;
    } else if (difficulty === 'hard') {
      range = 100;
      factorLimit = 15;
    }

    if (gameMode === 'speed') {
      if (op === '+') {
        a = Math.floor(Math.random() * range) + 1;
        b = Math.floor(Math.random() * range) + 1;
        
        // For hard mode, occasionally add a third number
        if (difficulty === 'hard' && Math.random() > 0.6) {
          const c = Math.floor(Math.random() * 20) + 1;
          answer = a + b + c;
          question = `${a} + ${b} + ${c} = ?`;
        } else {
          answer = a + b;
          question = `${a} + ${b} = ?`;
        }
      } else if (op === '-') {
        if (difficulty === 'hard') {
          a = Math.floor(Math.random() * 100) + 20;
          b = Math.floor(Math.random() * (a - 10)) + 5;
        } else {
          a = Math.floor(Math.random() * range) + 5;
          b = Math.floor(Math.random() * (a - 1)) + 1;
        }
        answer = a - b;
        question = `${a} - ${b} = ?`;
      } else if (op === '*') {
        a = Math.floor(Math.random() * (factorLimit - 1)) + 2;
        b = Math.floor(Math.random() * (factorLimit - 1)) + 2;
        answer = a * b;
        question = `${a} × ${b} = ?`;
      } else if (op === '/') {
        b = Math.floor(Math.random() * (factorLimit - 1)) + 2;
        const tempAnswer = Math.floor(Math.random() * (factorLimit - 1)) + 1;
        a = b * tempAnswer;
        answer = tempAnswer;
        question = `${a} ÷ ${b} = ?`;
      } else {
        a = 2; b = 2; answer = 4; question = "2 + 2 = ?";
      }
      
      newOptions = [answer];
      while (newOptions.length < 4) {
        const offset = Math.floor(Math.random() * 10) - 5;
        const wrong = Math.abs(answer + (offset === 0 ? 1 : offset));
        if (wrong !== answer && !newOptions.includes(wrong)) newOptions.push(wrong);
      }
    } else if (gameMode === 'thinking') {
      // Merge Compare and Missing
      const isCompare = Math.random() > 0.5;
      if (isCompare) {
        if (difficulty === 'hard') {
          // Compare expressions in hard mode
          const v1 = Math.floor(Math.random() * 20) + 5;
          const v2 = Math.floor(Math.random() * 20) + 5;
          const v3 = Math.floor(Math.random() * 40) + 10;
          const val1 = v1 + v2;
          const val2 = v3;
          
          if (Math.random() > 0.5) {
            question = `Bên nào lớn hơn: ${v1}+${v2} hay ${v3}?`;
            answer = val1 >= val2 ? `${v1}+${v2}` : `${v3}`;
            newOptions = [`${v1}+${v2}`, `${v3}`];
          } else {
            question = `Bên nào nhỏ hơn: ${v1}+${v2} hay ${v3}?`;
            answer = val1 <= val2 ? `${v1}+${v2}` : `${v3}`;
            newOptions = [`${v1}+${v2}`, `${v3}`];
          }
        } else {
          a = Math.floor(Math.random() * range) + 1;
          b = Math.floor(Math.random() * range) + 1;
          while (a === b) b = Math.floor(Math.random() * range) + 1;
          const type = Math.random() > 0.5 ? 'lớn hơn' : 'nhỏ hơn';
          question = `Số nào ${type}: ${a} hay ${b}?`;
          answer = type === 'lớn hơn' ? Math.max(a, b) : Math.min(a, b);
          newOptions = [a, b];
        }
      } else {
        // Missing Number
        const mRange = difficulty === 'hard' ? 80 : (difficulty === 'easy' ? 10 : 30);
        if (op === '+') {
          a = Math.floor(Math.random() * mRange) + 1;
          const missing = Math.floor(Math.random() * mRange) + 1;
          const resVal = a + missing;
          answer = missing;
          question = `${a} + ? = ${resVal}`;
        } else {
          const result = Math.floor(Math.random() * mRange) + 1;
          const missing = Math.floor(Math.random() * mRange) + 1;
          const full = result + missing;
          answer = missing;
          question = `${full} - ? = ${result}`;
        }
        newOptions = [answer];
        while (newOptions.length < 4) {
          const wrong = Math.max(1, (answer as number) + (Math.floor(Math.random() * 10) - 5));
          if (wrong !== (answer as number) && !newOptions.includes(wrong)) newOptions.push(wrong);
        }
      }
    } else if (gameMode === 'word_problems') {
      // Basic word problems
      const problems = [
        { q: `Mẹ có {a} quả táo, mẹ cho bé {b} quả. Mẹ còn bao nhiêu quả táo?`, op: '-', res: (a: number, b: number) => a - b },
        { q: `Trong rổ có {a} quả cam, bé bỏ thêm {b} quả vào. Có tất cả mấy quả cam?`, op: '+', res: (a: number, b: number) => a + b },
        { q: `Bé có {a} cái kẹo, chị có nhiều hơn bé {b} cái. Hỏi chị có bao nhiêu cái kẹo?`, op: '+', res: (a: number, b: number) => a + b },
        { q: `Một cành cây có {a} con chim, {b} con bay đi. Còn lại bao nhiêu con chim?`, op: '-', res: (a: number, b: number) => a - b },
      ];
      const p = problems[Math.floor(Math.random() * problems.length)];
      a = Math.floor(Math.random() * range) + 10;
      b = Math.floor(Math.random() * 9) + 1;
      answer = p.res(a, b);
      question = p.q.replace('{a}', a.toString()).replace('{b}', b.toString());
      newOptions = [answer];
      while (newOptions.length < 4) {
        const wrong = Math.max(1, answer + (Math.floor(Math.random() * 10) - 5));
        if (wrong !== answer && !newOptions.includes(wrong)) newOptions.push(wrong);
      }
    } else if (gameMode === 'logic_math') {
      const logicSet = [
        { q: `Số lẻ tiếp theo sau {a} là số nào?`, fn: (a: number) => a + 2, range: 20 },
        { q: `Số chẵn đứng trước {a} là số nào?`, fn: (a: number) => a - 2, range: 20 },
        { q: `Dãy số: 2, 4, 6, ... Số tiếp theo là?`, fn: () => 8, fixed: true },
        { q: `Dãy số: 5, 10, 15, ... Số tiếp theo là?`, fn: () => 20, fixed: true },
      ];
      const l = logicSet[Math.floor(Math.random() * logicSet.length)];
      if (l.fixed) {
        answer = (l as any).fn();
      } else {
        a = (Math.floor(Math.random() * 10) * 2) + (l.q.includes('lẻ') ? 1 : 2);
        answer = (l as any).fn(a);
      }
      question = l.q.replace('{a}', a?.toString() || '');
      newOptions = [answer];
      while (newOptions.length < 4) {
        const wrong = Math.max(1, answer as number + (Math.floor(Math.random() * 6) - 3));
        if (wrong !== answer && !newOptions.includes(wrong)) newOptions.push(wrong);
      }
    }
    
    setCurrentProblem({ a, b, op, answer, question });
    setOptions(newOptions.sort(() => Math.random() - 0.5));
    setLastProblemTime(Date.now());
  }, [gameMode, selectedOps, difficulty]);

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    
    // Set time based on difficulty
    let time = 30;
    if (difficulty === 'easy') time = 45;
    else if (difficulty === 'hard') time = 60;
    
    setTimeLeft(time);
    setGameState('playing');
    playSound(START_SOUND);
    setTimeout(() => generateProblem(), 0);
  };

  useEffect(() => {
    let timer: any;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
      playSound(FINISH_SOUND);
      
      // Award Stars with difficulty multiplier
      const multiplier = difficulty === 'hard' ? 2 : (difficulty === 'medium' ? 1.5 : 1);
      const baseStars = Math.floor((score / 10) * multiplier);
      let bonusStars = 0;
      if (score >= 100) bonusStars += Math.floor(10 * multiplier);
      if (score >= 200) bonusStars += Math.floor(30 * multiplier);
      RewardService.addStars(baseStars + bonusStars);

      if (score >= 200) {
        RewardService.unlockAchievement(
          'flash_math',
          'Tốc Độ Ánh Sáng',
          'Đạt trên 200 điểm trong một ván chơi tốc độ.',
          '⚡'
        );
      }
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleAnswer = (choice: any) => {
    const timeTaken = Date.now() - lastProblemTime;
    const isCorrect = choice === currentProblem.answer;

    if (isCorrect) {
      setScore(s => s + 10);
      setCorrectCount(c => {
        const newCount = c + 1;
        // Adaptive level up: 5 correct answers in a row OR fast answer (under 2s) 3 times
        if (newCount % 5 === 0 && difficulty !== 'hard') {
          setDifficulty(prev => prev === 'easy' ? 'medium' : 'hard');
          setAdaptiveMessage("Độ khó đã tăng! Bé làm nhanh quá! 🌟");
          setTimeout(() => setAdaptiveMessage(null), 3000);
        }
        return newCount;
      });
      playSound(CORRECT_SOUND);
      generateProblem();
    } else {
      setScore(s => Math.max(0, s - 5));
      setIncorrectCount(i => {
        const newCount = i + 1;
        // Adaptive level down: 2 wrong answers
        if (newCount % 2 === 0 && difficulty !== 'easy') {
          setDifficulty(prev => prev === 'hard' ? 'medium' : 'easy');
          setAdaptiveMessage("Đang ôn tập lại các số nhỏ hơn nhé! ❤️");
          setTimeout(() => setAdaptiveMessage(null), 3000);
        }
        return newCount;
      });
      playSound(WRONG_SOUND);
      generateProblem();
    }
  };

  const toggleOp = (op: string) => {
    setSelectedOps(prev => 
      prev.includes(op) ? prev.filter(o => o !== op) : [...prev, op]
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-2">
      <AnimatePresence mode="wait">
        {gameState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-3xl shadow-xl space-y-8 border-4 border-math-secondary/20 relative">
              <button 
                onClick={() => setGameState('settings')}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-math-primary transition-colors"
                title="Cài đặt"
              >
                <Settings2 className="w-6 h-6" />
              </button>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-math-secondary/10 rounded-full flex items-center justify-center mx-auto text-math-secondary">
                  <Brain className="w-8 h-8 fill-current" />
                </div>
                <div>
                  <h2 className="font-display text-3xl text-gray-800">
                    {age >= 9 ? 'Thử Thách Toán Học' : 'Chọn Trò Chơi'}
                  </h2>
                  <p className="text-gray-500">
                    {age >= 9 ? 'Rèn luyện tư duy và tốc độ tính toán siêu hạng!' : 'Rèn luyện phản xạ toán học cùng Math of Bơ!'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => startGame('speed')}
                  className="p-6 bg-green-50 hover:bg-green-100 rounded-2xl border-2 border-green-100 transition-all group text-left"
                >
                  <Zap className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-800">Toán Tốc Độ</h3>
                  <p className="text-xs text-gray-500">Giải toán siêu nhanh trong thời gian giới hạn</p>
                </button>

                <button 
                  onClick={() => startGame('thinking')}
                  className="p-6 bg-blue-50 hover:bg-blue-100 rounded-2xl border-2 border-blue-100 transition-all group text-left"
                >
                  <Brain className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-800">Tư Duy Nhanh</h3>
                  <p className="text-xs text-gray-500">So sánh và tìm số còn thiếu</p>
                </button>

                <button 
                  onClick={() => startGame('word_problems')}
                  className="p-6 bg-purple-50 hover:bg-purple-100 rounded-2xl border-2 border-purple-100 transition-all group text-left"
                >
                  <Calculator className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-800">Giải Toán Giải</h3>
                  <p className="text-xs text-gray-500">Đọc lời văn và tìm đáp án đúng</p>
                </button>

                <button 
                  onClick={() => startGame('logic_math')}
                  className="p-6 bg-orange-50 hover:bg-orange-100 rounded-2xl border-2 border-orange-100 transition-all group text-left"
                >
                  <Star className="w-8 h-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-800">Toán Logic</h3>
                  <p className="text-xs text-gray-500">Quy luật số và tư duy logic</p>
                </button>
              </div>

              {/* Difficulty Selection */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Settings2 className="w-4 h-4 text-math-secondary" />
                  <span className="font-bold text-gray-700">Mức độ thử thách:</span>
                </div>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "flex-1 py-3 rounded-2xl text-sm font-bold transition-all border-2",
                        difficulty === d
                          ? "bg-math-secondary border-math-secondary text-white shadow-lg scale-105"
                          : "bg-white border-gray-100 text-gray-400 hover:border-math-secondary/30 hover:text-math-secondary"
                      )}
                    >
                      {d === 'easy' ? 'Dễ' : d === 'medium' ? 'Vừa' : 'Khó'}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-4 text-center">
                  * Độ khó ảnh hưởng đến thời gian, phạm vi số và phép tính (Dễ: 45s/1-10, Vừa: 30s/1-30, Khó: 60s/1-100)
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-3xl shadow-xl space-y-8 border-4 border-math-primary/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <Settings2 className="w-6 h-6 text-math-primary" />
              <h2 className="font-display text-2xl text-gray-800">Cài đặt thử thách</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">Phép tính</label>
                <div className="grid grid-cols-4 gap-2">
                  {['+', '-', '*', '/'].map(op => (
                    <button
                      key={op}
                      onClick={() => toggleOp(op)}
                      className={cn(
                        "py-3 rounded-xl font-bold border-2 transition-all",
                        selectedOps.includes(op) 
                          ? "bg-math-primary border-math-primary text-white shadow-md" 
                          : "bg-gray-50 border-gray-100 text-gray-400 hover:border-math-primary/30"
                      )}
                    >
                      {op === '*' ? '×' : op === '/' ? '÷' : op}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">Phạm vi số</label>
                  <span className="text-math-primary font-bold">1 - {maxRange}</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  step="10"
                  value={maxRange}
                  onChange={(e) => setMaxRange(Number(e.target.value))}
                  className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-math-primary"
                />
                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                  <span>10</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setGameState('idle')}
              className="w-full py-4 bg-math-secondary text-white font-bold rounded-2xl shadow-lg hover:brightness-105 transition-all text-xl"
            >
              Lưu & Quay lại
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm relative">
              <AnimatePresence>
                {adaptiveMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-10 inset-x-0 mx-auto w-fit bg-math-accent text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg z-50 pointer-events-none"
                  >
                    {adaptiveMessage}
                  </motion.div>
                )}
              </AnimatePresence>
              <button 
                onClick={() => setGameState('idle')}
                className="text-gray-400 hover:text-gray-600 font-medium flex items-center gap-1"
              >
                <ArrowLeftRight className="w-4 h-4 rotate-180" /> Thoát
              </button>
              <div className="flex items-center gap-4 sm:gap-8">
                <div className="hidden sm:flex items-center gap-4 text-sm font-bold uppercase tracking-wider">
                  <span className="text-green-500">Đúng: {correctCount}</span>
                  <span className="text-red-500">Sai: {incorrectCount}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-math-primary font-bold">
                    <Timer className="w-6 h-6" />
                    <span className="text-2xl">{timeLeft}s</span>
                  </div>
                  <div className="flex items-center gap-2 text-math-secondary font-bold">
                    <Trophy className="w-6 h-6" />
                    <span className="text-2xl">{score}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl text-center border-4 border-math-primary/10">
              <div className="mb-12">
                <p className="text-gray-500 font-black mb-4 uppercase tracking-[0.2em] text-xs">
                  HÃY GIẢI PHÉP TÍNH NÀY
                </p>
                
                <div className="text-4xl sm:text-7xl font-display text-gray-900 min-h-[140px] flex items-center justify-center drop-shadow-sm font-black">
                  {currentProblem.question}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAnswer(opt)}
                    className={cn(
                      "py-6 bg-white hover:bg-math-primary hover:text-white rounded-[32px] text-3xl sm:text-5xl font-display font-black text-gray-900 transition-all border-4 border-gray-100 shadow-md hover:shadow-xl active:scale-95",
                      typeof opt === 'string' && opt.length > 5 ? "text-xl sm:text-2xl" : ""
                    )}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-10 rounded-3xl shadow-xl text-center space-y-6 border-4 border-math-accent/30"
          >
            <Trophy className="w-20 h-20 text-orange-500 mx-auto" />
            <h2 className="font-display text-4xl text-gray-800">Hết giờ!</h2>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-100">
                <div className="text-green-600 text-sm font-bold uppercase">Đúng</div>
                <div className="text-3xl font-display text-green-700">{correctCount}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border-2 border-red-100">
                <div className="text-red-600 text-sm font-bold uppercase">Sai</div>
                <div className="text-3xl font-display text-red-700">{incorrectCount}</div>
              </div>
            </div>
            <p className="text-2xl text-gray-600">Tổng điểm: <span className="text-math-primary font-bold">{score}</span></p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => startGame(gameMode)}
                className="w-full py-4 bg-math-primary text-white font-bold rounded-2xl hover:bg-math-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 text-xl"
              >
                <RefreshCw className="w-6 h-6" /> Chơi lại
              </button>
              <button
                onClick={() => setGameState('idle')}
                className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all text-xl"
              >
                Chọn trò chơi khác
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

