import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, RefreshCcw, Star, Trophy, Sparkles, Clock, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Question {
  hour: number;
  minute: number;
  options: string[];
  correctAnswer: string;
}

const CORRECT_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';
const WRONG_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3';

export const ClockPractice: React.FC = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const [totalInRound] = useState(15);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');

  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const generateQuestion = () => {
    if (currentCount >= totalInRound) {
      setGameState('finished');
      return;
    }

    const isAfternoon = Math.random() > 0.5;
    const hour = Math.floor(Math.random() * 12) + (isAfternoon ? 12 : 1);
    const displayHour = hour > 12 ? hour - 12 : hour;
    const minute = Math.floor(Math.random() * 12) * 5;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Generate 3 wrong options
    const options = [timeStr];
    while (options.length < 4) {
      const h = Math.floor(Math.random() * 24);
      const m = Math.floor(Math.random() * 12) * 5;
      const opt = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      if (!options.includes(opt)) options.push(opt);
    }
    
    setQuestion({
      hour: displayHour,
      minute,
      options: options.sort(() => Math.random() - 0.5),
      correctAnswer: timeStr
    });
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    const correct = answer === question?.correctAnswer;
    setIsCorrect(correct);
    setCurrentCount(prev => prev + 1);
    
    if (correct) {
      setScore(s => s + 1);
      playSound(CORRECT_SOUND);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D']
      });
    } else {
      playSound(WRONG_SOUND);
    }
  };

  const restartGame = () => {
    setScore(0);
    setCurrentCount(0);
    setGameState('playing');
    generateQuestion();
  };

  if (gameState === 'finished') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[40px] shadow-2xl border-4 border-math-primary/20 space-y-6"
        >
          <div className="w-24 h-24 bg-math-accent/20 rounded-full flex items-center justify-center mx-auto text-orange-500">
            <Trophy className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-4xl text-gray-800">Hoàn thành thử thách!</h2>
            <p className="text-xl text-gray-500">Bé đã trả lời đúng {score} trên tổng số {totalInRound} câu hỏi.</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(score / totalInRound) * 100}%` }}
                className="h-full bg-math-primary"
              />
            </div>
            <p className="font-bold text-math-primary">
              {score === totalInRound ? 'Xuất sắc quá! Tuyệt đỉnh luôn bé ơi!' : score >= totalInRound/2 ? 'Bé làm rất tốt, cố gắng chút nữa nhé!' : 'Hãy cùng luyện tập thêm để giỏi hơn nhé!'}
            </p>
          </div>

          <button 
            onClick={restartGame}
            className="w-full py-4 math-gradient text-white font-bold rounded-2xl shadow-lg hover:brightness-105 transition-all text-xl"
          >
            Làm lại từ đầu
          </button>
        </motion.div>
      </div>
    );
  }

  if (!question) return null;

  const hourDegrees = (question.hour % 12) * 30 + question.minute * 0.5;
  const minuteDegrees = question.minute * 6;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Câu số</p>
                <div className="flex items-center gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={currentCount}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      className="text-xl font-display font-bold text-gray-800"
                    >
                      {currentCount + 1}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-xl font-display font-bold text-gray-300">/{totalInRound}</span>
                </div>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-100 hidden sm:block" />
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Đã đúng</p>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={score}
                  initial={{ scale: 1.5, color: '#10b981' }}
                  animate={{ scale: 1, color: '#059669' }}
                  className="text-xl font-display font-bold"
                >
                  {score}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        <button 
          onClick={restartGame}
          className="text-gray-400 hover:text-math-primary transition-colors p-2"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-3xl shadow-xl border-2 border-gray-50">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 rounded-full border-8 border-gray-100 bg-gray-50/30 flex items-center justify-center">
              <div className="relative w-full h-full rounded-full p-4">
                {[...Array(12)].map((_, i) => {
                  const angle = (i + 1) * 30;
                  const x = 50 + 40 * Math.sin((angle * Math.PI) / 180);
                  const y = 50 - 40 * Math.cos((angle * Math.PI) / 180);
                  return (
                    <div 
                      key={i} 
                      className="absolute font-display text-lg font-bold text-gray-400"
                      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      {i + 1}
                    </div>
                  );
                })}
                
                <motion.div 
                  className="absolute left-1/2 bottom-1/2 w-2 h-16 bg-math-primary rounded-full origin-bottom"
                  style={{ x: '-50%' }}
                  animate={{ rotate: hourDegrees }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
                <motion.div 
                  className="absolute left-1/2 bottom-1/2 w-1.5 h-24 bg-math-secondary rounded-full origin-bottom"
                  style={{ x: '-50%' }}
                  animate={{ rotate: minuteDegrees }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
                
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gray-800 rounded-full -translate-x-1/2 -translate-y-1/2 z-10" />
              </div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-display text-2xl text-gray-800">Đồng hồ đang chỉ mấy giờ thế nhỉ?</h3>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence mode="wait">
            {question.options.map((option) => (
              <motion.button
                key={option}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
                className={cn(
                  "p-6 rounded-2xl text-2xl font-display font-bold border-2 transition-all",
                  selectedAnswer === option
                    ? isCorrect 
                      ? "bg-green-500 border-green-600 text-white shadow-lg shadow-green-200"
                      : "bg-red-500 border-red-600 text-white shadow-lg shadow-red-200"
                    : selectedAnswer !== null && option === question.correctAnswer
                      ? "border-green-500 text-green-600 bg-green-50"
                      : "bg-white border-gray-100 text-gray-600 hover:border-math-secondary hover:text-math-secondary shadow-sm"
                )}
              >
                {option}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Feedback Message */}
      <AnimatePresence>
        {isCorrect !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className={cn(
              "p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden",
              isCorrect ? "bg-white border-4 border-green-500" : "bg-white border-4 border-red-500"
            )}
          >
            {/* Visual background sparkle for correct answer */}
            {isCorrect && (
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -right-20 -top-20 w-64 h-64 bg-green-50 rounded-full blur-3xl -z-10"
              />
            )}
            
            <div className="flex items-center gap-6">
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
                  isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                )}
              >
                {isCorrect ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              </motion.div>
              <div>
                <motion.p 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={cn("font-display text-2xl font-bold", isCorrect ? "text-green-600" : "text-red-600")}
                >
                  {isCorrect ? 'Tuyệt vời quá bé ơi! ⭐' : 'Ồ, nhầm một chút rồi!'}
                </motion.p>
                <motion.p 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-500 font-medium"
                >
                  {isCorrect ? 'Bé thật thông minh, cùng sang câu tiếp theo nhé.' : `Đừng buồn, đáp án đúng là ${question.correctAnswer} đó.`}
                </motion.p>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateQuestion}
              className={cn(
                "px-8 py-4 rounded-2xl font-black text-white shadow-xl flex items-center gap-3 text-lg group overflow-hidden relative",
                isCorrect ? "bg-green-500" : "bg-red-500"
              )}
            >
              <span className="relative z-10">CÂU TIẾP THEO</span>
              <Sparkles className="w-5 h-5 relative z-10 animate-pulse" />
              <motion.div 
                className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500"
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
