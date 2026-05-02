import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Trophy, RefreshCw, Zap, Brain, ChevronRight, Hash, ArrowLeftRight, Settings2, Apple, Star, Dog as Puppy, Calculator } from 'lucide-react';
import { RewardService } from '../services/rewardService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type GameMode = 'speed' | 'compare' | 'missing';
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

export const MathGames = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'settings' | 'finished'>('idle');
  const [gameMode, setGameMode] = useState<GameMode>('speed');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  
  // Custom Settings
  const [selectedOps, setSelectedOps] = useState<string[]>(['+', '-']);
  const [maxRange, setMaxRange] = useState(20);
  
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentProblem, setCurrentProblem] = useState<any>({ a: 0, b: 0, op: '+', answer: 0, question: '' });
  const [options, setOptions] = useState<any[]>([]);

  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const generateProblem = useCallback(() => {
    let a, b, answer, op, question, newOptions: any[] = [];
    const ops = selectedOps.length > 0 ? selectedOps : ['+'];
    op = ops[Math.floor(Math.random() * ops.length)];
    
    // Adjust range based on difficulty
    let range = 20;
    if (difficulty === 'easy') range = 10;
    else if (difficulty === 'hard') range = 100;

    if (gameMode === 'speed') {
      if (op === '+') {
        a = Math.floor(Math.random() * range) + 1;
        b = Math.floor(Math.random() * range) + 1;
        answer = a + b;
      } else if (op === '-') {
        // Ensure non-negative answer and reasonable range
        a = Math.floor(Math.random() * (range * 1.2)) + 5;
        b = Math.floor(Math.random() * (a - 1)) + 1;
        answer = a - b;
      } else if (op === '*') {
        const multLimit = difficulty === 'hard' ? 12 : (difficulty === 'easy' ? 6 : 9);
        a = Math.floor(Math.random() * multLimit) + 2;
        b = Math.floor(Math.random() * multLimit) + 2;
        answer = a * b;
      } else if (op === '/') {
        const divLimit = difficulty === 'hard' ? 12 : (difficulty === 'easy' ? 6 : 9);
        b = Math.floor(Math.random() * divLimit) + 2;
        answer = Math.floor(Math.random() * divLimit) + 2;
        a = b * answer;
      } else {
        // Fallback for division if op is unexpectedly something else but division was intended
        b = 5;
        answer = 5;
        a = 25;
      }
      question = `${a} ${op === '*' ? '×' : op === '/' ? '÷' : op} ${b} = ?`;
      newOptions = [answer];
      while (newOptions.length < 4) {
        const offset = Math.floor(Math.random() * 10) - 5;
        const wrong = Math.abs(answer + (offset === 0 ? 1 : offset));
        if (wrong !== answer && !newOptions.includes(wrong)) newOptions.push(wrong);
      }
    } else if (gameMode === 'compare') {
      a = Math.floor(Math.random() * range) + 1;
      b = Math.floor(Math.random() * range) + 1;
      while (a === b) b = Math.floor(Math.random() * range) + 1;
      const type = Math.random() > 0.5 ? 'lớn hơn' : 'nhỏ hơn';
      question = `Số nào ${type}: ${a} hay ${b}?`;
      answer = type === 'lớn hơn' ? Math.max(a, b) : Math.min(a, b);
      newOptions = [a, b];
    } else if (gameMode === 'missing') {
      // Range adjustment for missing number
      const mRange = difficulty === 'hard' ? 100 : (difficulty === 'easy' ? 10 : 20);
      
      if (op === '+') {
        a = Math.floor(Math.random() * mRange) + 1;
        const missing = Math.floor(Math.random() * mRange) + 1;
        b = a + missing;
        answer = missing;
        question = `${a} + ? = ${b}`;
      } else if (op === '-') {
        const full = Math.floor(Math.random() * mRange) + mRange;
        const sub = Math.floor(Math.random() * mRange) + 1;
        answer = sub;
        question = `${full} - ? = ${full - sub}`;
      } else if (op === '*') {
        a = Math.floor(Math.random() * 9) + 2;
        answer = Math.floor(Math.random() * 9) + 2;
        b = a * answer;
        question = `${a} × ? = ${b}`;
      } else {
        a = 10;
        answer = 5;
        question = `10 + ? = 15`;
      }
      newOptions = [answer];
      while (newOptions.length < 4) {
        const wrong = Math.max(1, answer + (Math.floor(Math.random() * 10) - 5));
        if (wrong !== answer && !newOptions.includes(wrong)) newOptions.push(wrong);
      }
    }
    
    setCurrentProblem({ a, b, op, answer, question });
    setOptions(newOptions.sort(() => Math.random() - 0.5));
  }, [gameMode, selectedOps, difficulty]);

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setTimeLeft(30);
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
      
      // Award Stars
      const baseStars = Math.floor(score / 10);
      let bonusStars = 0;
      if (score >= 100) bonusStars += 10;
      if (score >= 200) bonusStars += 30;
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
    if (choice === currentProblem.answer) {
      setScore(s => s + 10);
      setCorrectCount(c => c + 1);
      playSound(CORRECT_SOUND);
      generateProblem();
    } else {
      setScore(s => Math.max(0, s - 5));
      setIncorrectCount(i => i + 1);
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
                  <h2 className="font-display text-3xl text-gray-800">Chọn Trò Chơi</h2>
                  <p className="text-gray-500">Rèn luyện phản xạ toán học cùng Math Buddy!</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button 
                  onClick={() => startGame('compare')}
                  className="p-6 bg-blue-50 hover:bg-blue-100 rounded-2xl border-2 border-blue-100 transition-all group text-left"
                >
                  <ArrowLeftRight className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-800">So Sánh Nhanh</h3>
                  <p className="text-xs text-gray-500">Tìm số lớn hơn hoặc nhỏ hơn</p>
                </button>

                <button 
                  onClick={() => startGame('speed')}
                  className="p-6 bg-green-50 hover:bg-green-100 rounded-2xl border-2 border-green-100 transition-all group text-left"
                >
                  <Zap className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-800">Toán Tốc Độ</h3>
                  <p className="text-xs text-gray-500">Giải toán siêu nhanh trong 30s</p>
                </button>

                <button 
                  onClick={() => startGame('missing')}
                  className="p-6 bg-purple-50 hover:bg-purple-100 rounded-2xl border-2 border-purple-100 transition-all group text-left"
                >
                  <Hash className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-gray-800">Số Còn Thiếu</h3>
                  <p className="text-xs text-gray-500">Điền số còn thiếu vào phép tính</p>
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
                  * Độ khó ảnh hưởng đến phạm vi số và các phép tính (Dễ: 1-10, Vừa: 1-20, Khó: 1-100)
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
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
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
                <p className="text-gray-400 font-bold mb-4 uppercase tracking-widest text-xs">
                  Hãy giải phép tính này
                </p>
                
                <div className="text-4xl sm:text-6xl font-display text-gray-800 min-h-[120px] flex items-center justify-center">
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
                      "py-6 bg-gray-50 hover:bg-math-primary hover:text-white rounded-2xl text-2xl sm:text-3xl font-bold text-gray-700 transition-all border-2 border-gray-100",
                      typeof opt === 'string' && opt.length > 5 ? "text-lg sm:text-xl" : ""
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

