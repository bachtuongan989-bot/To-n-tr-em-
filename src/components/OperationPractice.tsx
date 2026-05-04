import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Trophy, RefreshCcw, CheckCircle2, XCircle, Timer, Settings2, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RewardService } from '../services/rewardService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CORRECT_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';
const WRONG_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3';

interface Problem {
  a: number;
  b: number;
  c?: number;
  op: '+' | '-';
  op2?: '+' | '-';
  answer: number;
  hint: string;
}

interface OperationPracticeProps {
  age?: number;
}

export const OperationPractice: React.FC<OperationPracticeProps> = ({ age = 7 }) => {
  const [opType, setOpType] = useState<'+' | '-' | 'both'>('both');
  const [grade, setGrade] = useState<1 | 2 | 3 | 4 | 5>(2);

  useEffect(() => {
    // Map age to grade: 6->1, 7->2, 8->3, 9->4, 10+->5
    const calculatedGrade = Math.max(1, Math.min(5, age - 5)) as 1 | 2 | 3 | 4 | 5;
    setGrade(calculatedGrade);
  }, [age]);

  const [totalQuestions, setTotalQuestions] = useState(15);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [adaptiveLevel, setAdaptiveLevel] = useState(0); // -1 (easy), 0 (normal), 1 (hard), 2 (master)
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [levelMessage, setLevelMessage] = useState<string | null>(null);

  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const generateProblem = () => {
    let a, b, c, answer;
    let selectedOp = opType === 'both' ? (Math.random() > 0.5 ? '+' as const : '-' as const) : opType as '+' | '-';
    let selectedOp2 = Math.random() > 0.5 ? '+' as const : '-' as const;
    
    // Scale difficulty based on Grade, Age and Adaptive Level
    let aDigits = 2;
    let bDigits = 2;
    
    if (grade === 1) {
      aDigits = (Math.random() > 0.5 || adaptiveLevel > 0) ? 2 : 1;
      bDigits = adaptiveLevel > 0 ? 2 : 1;
    } else if (grade === 2) {
      const rand = Math.random();
      if (adaptiveLevel >= 1) { aDigits = 3; bDigits = 2; }
      else if (rand < 0.5) { aDigits = 2; bDigits = 2; }
      else { aDigits = 3; bDigits = 1; }
    } else if (grade === 3) {
      const rand = Math.random();
      if (adaptiveLevel >= 1) { aDigits = 3; bDigits = 3; }
      else if (rand < 0.4) { aDigits = 3; bDigits = 2; }
      else { aDigits = 3; bDigits = 3; }
    } else {
      const rand = Math.random();
      if (adaptiveLevel >= 1) { aDigits = 4; bDigits = 4; }
      else if (rand < 0.4) { aDigits = 4; bDigits = 3; }
      else { aDigits = 3; bDigits = 3; }
    }

    // Apply adaptive level adjustments to digits
    if (adaptiveLevel === -1) {
      aDigits = Math.max(1, aDigits - 1);
      bDigits = Math.max(1, bDigits - 1);
    } else if (adaptiveLevel === 2) {
      aDigits++;
      bDigits++;
    }

    const minA = Math.pow(10, aDigits - 1);
    const maxA = Math.pow(10, aDigits) - 1;
    const minB = Math.pow(10, bDigits - 1);
    const maxB = Math.pow(10, bDigits) - 1;

    // Decide if it should be a 3-number operation (A ± B ± C)
    // Only if 'both' is selected or for higher grades
    const isThreeNumbers = (opType === 'both' && grade >= 2 && Math.random() > 0.5) || (grade >= 4 && Math.random() > 0.4);

    let hint = "";
    if (isThreeNumbers) {
      hint = "Hãy thực hiện phép tính từ trái sang phải nhé!";
      a = Math.floor(Math.random() * (maxA - minA + 1)) + minA;
      b = Math.floor(Math.random() * (maxB - minB + 1)) + minB;
      c = Math.floor(Math.random() * (maxB - minB + 1)) + minB;
      
      let firstPart;
      if (selectedOp === '+') {
        firstPart = a + b;
      } else {
        a = Math.max(a, b);
        b = Math.min(a, b);
        firstPart = a - b;
      }
      
      if (selectedOp2 === '+') {
        answer = firstPart + c;
      } else {
        if (firstPart < c) {
          selectedOp2 = '+';
          answer = firstPart + c;
        } else {
          answer = firstPart - c;
        }
      }
      setProblem({ a, b, c, op: selectedOp, op2: selectedOp2, answer, hint });
    } else {
      a = Math.floor(Math.random() * (maxA - minA + 1)) + minA;
      b = Math.floor(Math.random() * (maxB - minB + 1)) + minB;

      if (selectedOp === '+') {
        if ((a % 10) + (b % 10) >= 10) {
          hint = "Cộng hàng đơn vị có nhớ nè, bé đừng quên cộng 1 sang hàng chục nhé!";
        } else {
          hint = "Cộng hàng đơn vị với hàng đơn vị, hàng chục với hàng chục là xong!";
        }
        answer = a + b;
      } else {
        if (a < b) {
          const temp = a;
          a = b;
          b = temp;
        }
        if ((a % 10) < (b % 10)) {
          hint = "Hàng đơn vị không trừ được? Bé hãy mượn 1 từ hàng chục nha.";
        } else {
          hint = "Trừ hàng đơn vị trước, sau đó tới hàng chục nè.";
        }
        answer = a - b;
      }
      setProblem({ a, b, op: selectedOp, answer, hint });
    }
    
    setUserAnswer('');
    setShowHint(false);
    setFeedback('none');
  };

  const startPractice = () => {
    setGameState('playing');
    setCurrentIdx(0);
    setScore(0);
    generateProblem();
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(prev => prev + 1);
      generateProblem();
    } else {
      setGameState('finished');
      
      // Award Stars
      const earnedStars = score;
      const bonusStars = score === totalQuestions ? 10 : 0;
      RewardService.addStars(earnedStars + bonusStars);

      if (score === totalQuestions) {
        RewardService.unlockAchievement(
          'math_master',
          'Bậc Thầy Cộng Trừ',
          'Đạt điểm tối đa trong phần luyện tập tính toán.',
          '🏆'
        );
      }

      if (score >= totalQuestions * 0.8) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem || feedback !== 'none' || !userAnswer) return;

    const isCorrect = parseInt(userAnswer) === problem.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      setScore(s => s + 1);
      setConsecutiveCorrect(c => {
        const newCount = c + 1;
        if (newCount === 3 && adaptiveLevel < 2) {
          setAdaptiveLevel(prev => prev + 1);
          setLevelMessage("Siêu nhân toán học! Độ khó đã tăng lên! 🚀");
          setTimeout(() => setLevelMessage(null), 3000);
          return 0;
        }
        return newCount;
      });
      playSound(CORRECT_SOUND);
    } else {
      setConsecutiveCorrect(0);
      if (adaptiveLevel > -1) {
        setAdaptiveLevel(prev => prev - 1);
        setLevelMessage("Đừng lo, chúng ta sẽ ôn lại cơ bản nhé! ❤️");
        setTimeout(() => setLevelMessage(null), 3000);
      }
      playSound(WRONG_SOUND);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <AnimatePresence mode="wait">
        {gameState === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-8 rounded-[32px] shadow-xl border-4 border-math-primary/10 space-y-8"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-math-primary/10 rounded-full flex items-center justify-center mx-auto text-math-primary">
                <Settings2 className="w-8 h-8" />
              </div>
              <h2 className="font-display text-3xl text-gray-800">Cài đặt luyện tập</h2>
              <p className="text-gray-500">Bé muốn thử thách với phép tính nào?</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-600 block">Lớp của bé</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(g => (
                    <button
                      key={g}
                      onClick={() => setGrade(g as any)}
                      className={cn(
                        "py-3 rounded-xl font-bold border-2 transition-all",
                        grade === g ? "bg-math-secondary border-math-secondary text-white" : "bg-gray-50 border-gray-100 text-gray-400"
                      )}
                    >
                      Lớp {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setOpType('+')}
                  className={cn(
                    "p-6 rounded-2xl border-4 transition-all flex flex-col items-center gap-2",
                    opType === '+' ? "bg-math-primary border-math-primary text-white shadow-lg" : "bg-gray-50 border-gray-100 text-gray-400 hover:border-math-primary/30"
                  )}
                >
                  <Plus className="w-8 h-8" />
                  <span className="font-bold">Cộng</span>
                </button>
                <button
                  onClick={() => setOpType('-')}
                  className={cn(
                    "p-6 rounded-2xl border-4 transition-all flex flex-col items-center gap-2",
                    opType === '-' ? "bg-math-secondary border-math-secondary text-white shadow-lg" : "bg-gray-50 border-gray-100 text-gray-400 hover:border-math-secondary/30"
                  )}
                >
                  <Minus className="w-8 h-8" />
                  <span className="font-bold">Trừ</span>
                </button>
                <button
                  onClick={() => setOpType('both')}
                  className={cn(
                    "p-6 rounded-2xl border-4 transition-all flex flex-col items-center gap-2",
                    opType === 'both' ? "bg-math-accent border-math-accent text-white shadow-lg" : "bg-gray-50 border-gray-100 text-gray-400 hover:border-math-accent/30"
                  )}
                >
                  <div className="flex gap-1">
                    <Plus className="w-4 h-4" />
                    <Minus className="w-4 h-4" />
                  </div>
                  <span className="font-bold">Cả hai</span>
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-600 block">Số lượng câu hỏi</label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 25].map(cnt => (
                    <button
                      key={cnt}
                      onClick={() => setTotalQuestions(cnt)}
                      className={cn(
                        "py-3 rounded-xl font-bold border-2 transition-all",
                        totalQuestions === cnt ? "bg-math-accent border-math-accent text-white" : "bg-gray-50 border-gray-100 text-gray-400"
                      )}
                    >
                      {cnt} câu
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={startPractice}
              className="w-full py-5 math-gradient text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-xl"
            >
              BẮT ĐẦU LUYỆN TẬP
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && problem && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative">
              <AnimatePresence>
                {levelMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-12 inset-x-0 mx-auto w-fit bg-math-accent text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg z-50 pointer-events-none"
                  >
                    {levelMessage}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tiến độ</p>
                  <p className="text-xl font-display font-bold text-gray-800">{currentIdx + 1}/{totalQuestions}</p>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đúng</p>
                  <p className="text-xl font-display font-bold text-green-500">{score}</p>
                </div>
                {adaptiveLevel !== 0 && (
                  <>
                    <div className="w-px h-8 bg-gray-100" />
                    <div className="flex items-center gap-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cấp độ</p>
                      <div className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-black uppercase text-white",
                        adaptiveLevel > 0 ? "bg-orange-500" : "bg-blue-500"
                      )}>
                        {adaptiveLevel === -1 ? 'Cơ bản' : adaptiveLevel === 1 ? 'Thách thức' : 'Bậc thầy'}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={startPractice} 
                  className="p-2 text-gray-400 hover:text-math-primary transition-colors"
                  title="Làm lại"
                >
                  <RefreshCcw className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setGameState('setup')} 
                  className="p-2 px-4 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                >
                  Thoát
                </button>
              </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border-4 border-math-primary/5 text-center space-y-8 relative overflow-hidden">
                <form 
                  onSubmit={(e) => { e.preventDefault(); if(feedback === 'none') handleAnswer(e); }}
                  className="flex flex-col items-center gap-8"
                >
                <div className="text-4xl md:text-7xl font-display font-bold text-gray-800 flex flex-wrap items-center justify-center gap-3 md:gap-6">
                  <span>{problem.a}</span>
                  <span className="text-math-primary">{problem.op}</span>
                  <span>{problem.b}</span>
                  {problem.c !== undefined && (
                    <>
                      <span className="text-math-primary">{problem.op2}</span>
                      <span>{problem.c}</span>
                    </>
                  )}
                  <span className="text-gray-300">=</span>
                  <div className="inline-block relative">
                    <input
                      autoFocus
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className={cn(
                        "w-28 md:w-56 bg-gray-50 border-4 rounded-3xl text-center focus:outline-none transition-all",
                        feedback === 'none' ? "border-gray-100 focus:border-math-primary" :
                        feedback === 'correct' ? "border-green-500 bg-green-50 text-green-600" :
                        "border-red-500 bg-red-50 text-red-600"
                      )}
                      disabled={feedback !== 'none'}
                    />
                  </div>
                </div>

                {!showHint && feedback === 'none' && (
                  <button
                    type="button"
                    onClick={() => {
                      RewardService.unlockAchievement(
                        'smart_learner',
                        'Người Học Thông Thái',
                        'Sử dụng gợi ý để tìm ra đáp án chính xác nhé!',
                        '💡'
                      );
                      setShowHint(true);
                    }}
                    className="flex items-center gap-2 text-sm font-bold text-math-secondary hover:text-math-secondary/80 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    Xem gợi ý
                  </button>
                )}

                <AnimatePresence>
                  {showHint && feedback === 'none' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-math-secondary/10 p-4 rounded-2xl border border-math-secondary/20 text-math-secondary font-medium"
                    >
                      💡 {problem.hint}
                    </motion.div>
                  )}
                </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {feedback === 'none' ? (
                      <motion.button
                        key="check-btn"
                        type="submit"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="px-12 py-4 bg-math-primary text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-xl"
                      >
                        KIỂM TRA KẾT QUẢ
                      </motion.button>
                    ) : (
                      <motion.div
                        key="feedback"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-6"
                      >
                        <div className={cn(
                          "flex items-center justify-center gap-3 font-bold text-xl",
                          feedback === 'correct' ? "text-green-600" : "text-red-600"
                        )}>
                          {feedback === 'correct' ? (
                            <>
                              <CheckCircle2 className="w-8 h-8" />
                              <span>Xuất sắc quá bé ơi!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-8 h-8" />
                              <span>Ồ! Đáp án là {problem.answer} nha.</span>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleNext}
                          className={cn(
                            "px-12 py-4 rounded-xl text-white font-black shadow-lg transition-transform hover:scale-105 active:scale-95 text-xl",
                            feedback === 'correct' ? "bg-green-500" : "bg-red-500"
                          )}
                        >
                          CÂU TIẾP THEO
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-math-primary/5 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-math-secondary/5 translate-x-1/2 translate-y-1/2 rounded-full blur-3xl -z-10" />
            </div>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-[40px] shadow-2xl border-4 border-math-primary/20 text-center space-y-8"
          >
            <div className="w-24 h-24 bg-math-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="w-12 h-12 text-math-primary" />
            </div>
            <div className="space-y-4">
              <h2 className="font-display text-4xl text-gray-800">Hoàn thành bài tập!</h2>
              <div className="py-6 bg-math-primary/5 rounded-3xl border-2 border-math-primary/10 max-w-sm mx-auto">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Kết quả</p>
                <p className="text-6xl font-display font-black text-math-primary">
                  {Math.round((score / totalQuestions) * 100)}
                  <span className="text-xl text-gray-400 ml-1">đ</span>
                </p>
                <p className="text-sm font-bold text-gray-500 mt-2">Đúng {score} / {totalQuestions} câu</p>
              </div>
            </div>

            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(score / totalQuestions) * 100}%` }}
                className="h-full math-gradient"
              />
            </div>

            <p className="font-bold text-math-primary text-xl">
              {score === totalQuestions ? 'Bé là một thiên tài toán học thực thụ! 🌟' :
               score >= totalQuestions / 2 ? 'Làm tốt lắm, bé yêu hãy cố gắng phát huy nhé! 💪' :
               'Bé hãy luyện tập thêm một chút nữa để giỏi hơn nhé! ❤️'}
            </p>

            <button
              onClick={() => setGameState('setup')}
              className="w-full py-4 bg-math-primary text-white font-black rounded-2xl shadow-xl hover:brightness-105 transition-all text-xl"
            >
              LUYỆN TẬP TIẾP NHÉ
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
