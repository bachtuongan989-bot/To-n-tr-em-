import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Lightbulb, Trophy, ArrowRight, RefreshCw, BrainCircuit, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Mode = 'learn' | 'quiz' | 'matrix';
type TableType = 'multiplication' | 'division';

interface MultiplicationTableProps {
  age?: number;
}

export const MultiplicationTable: React.FC<MultiplicationTableProps> = ({ age = 7 }) => {
  const [mode, setMode] = useState<Mode>('learn');
  const [tableType, setTableType] = useState<TableType>('multiplication');
  const [selectedNum, setSelectedNum] = useState<number>(2);

  useEffect(() => {
    // Select appropriate table based on age
    if (age <= 7) setSelectedNum(2);
    else if (age === 8) setSelectedNum(5);
    else if (age === 9) setSelectedNum(8);
    else if (age >= 10) setSelectedNum(9);
  }, [age]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{r: number, c: number} | null>(null);

  // Quiz state
  const [quizType, setQuizType] = useState<'random' | 'specific'>('random');
  const [quizQuestion, setQuizQuestion] = useState<{a: number, b: number} | null>(null);
  const [quizInput, setQuizInput] = useState('');
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const numbers = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  const tableRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  useEffect(() => {
    if (mode === 'learn') {
      setUserAnswers({});
      setIsComplete(false);
    } else if (mode === 'quiz') {
      setQuizType('random');
      startNewQuiz();
    } else {
      startNewQuiz();
    }
  }, [selectedNum, mode]);

  const startNewQuiz = () => {
    setQuizScore(0);
    setQuizCount(0);
    setQuizFinished(false);
    generateQuizQuestion();
  };

  const generateQuizQuestion = () => {
    const a = quizType === 'specific' ? selectedNum : Math.floor(Math.random() * 9) + 2;
    const b = Math.floor(Math.random() * 10) + 1;
    setQuizQuestion({ a, b });
    setQuizInput('');
    setQuizFeedback(null);
  };

  const handleInputChange = (i: number, value: string) => {
    const newAnswers = { ...userAnswers, [i]: value };
    setUserAnswers(newAnswers);

    // Check if all are correct
    const allCorrect = tableRows.every(row => {
      const ans = newAnswers[row];
      const correctVal = tableType === 'multiplication' ? (selectedNum * row) : row;
      return ans && parseInt(ans) === correctVal;
    });

    if (allCorrect && !isComplete) {
      setIsComplete(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C']
      });
    }
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizQuestion || quizFinished) return;

    const correctAns = quizQuestion.a * quizQuestion.b;
    const isCorrect = parseInt(quizInput) === correctAns;
    
    if (isCorrect) {
      setQuizFeedback('correct');
      setQuizScore(prev => prev + 1);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 }
      });
    } else {
      setQuizFeedback('incorrect');
    }

    const nextCount = quizCount + 1;
    setQuizCount(nextCount);

    setTimeout(() => {
      if (nextCount >= 10) {
        setQuizFinished(true);
        if (quizScore + (isCorrect ? 1 : 0) === 10) {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.5 }
          });
        }
      } else {
        generateQuizQuestion();
      }
    }, 1000);
  };

  const nextTable = () => {
    if (selectedNum && selectedNum < 10) {
      setSelectedNum(selectedNum + 1);
    } else {
      setSelectedNum(2);
    }
  };

  const getTip = (num: number) => {
    const tips: Record<number, string> = {
      2: "Số chẵn: 2, 4, 6, 8, 0. Cứ cộng thêm 2 thôi!",
      5: "Kết thúc bằng 0 hoặc 5. Giống như đếm ngón tay vậy!",
      9: "Mẹo ngón tay: Gập ngón tay thứ n, bên trái là hàng chục, bên phải là hàng đơn vị!",
      10: "Chỉ cần thêm số 0 vào sau số đó. Dễ ợt!",
      3: "Tổng các chữ số chia hết cho 3. Thử xem!",
      4: "Gấp đôi của gấp đôi. Ví dụ: 4x3 = (2x3)x2 = 6x2 = 12!",
    };
    return tips[num] || "Luyện tập thường xuyên sẽ nhớ ngay thôi!";
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Mode Switcher */}
      <div className="flex justify-center gap-2 sm:gap-4 mb-8 flex-wrap">
        <button
          onClick={() => setMode('learn')}
          className={cn(
            "flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full font-display text-base sm:text-lg transition-all",
            mode === 'learn' 
              ? "bg-math-primary text-white shadow-lg scale-105" 
              : "bg-white text-math-primary border-2 border-math-primary/20 hover:border-math-primary"
          )}
        >
          <Calculator className="w-5 h-5" />
          Học Bảng
        </button>
        <button
          onClick={() => setMode('matrix')}
          className={cn(
            "flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full font-display text-base sm:text-lg transition-all",
            mode === 'matrix' 
              ? "bg-math-accent text-white shadow-lg scale-105" 
              : "bg-white text-math-accent border-2 border-math-accent/20 hover:border-math-accent"
          )}
        >
          <Sparkles className="w-5 h-5" />
          Ma Trận
        </button>
        <button
          onClick={() => setMode('quiz')}
          className={cn(
            "flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full font-display text-base sm:text-lg transition-all",
            mode === 'quiz' 
              ? "bg-math-secondary text-white shadow-lg scale-105" 
              : "bg-white text-math-secondary border-2 border-math-secondary/20 hover:border-math-secondary"
          )}
        >
          <BrainCircuit className="w-5 h-5" />
          Đố Vui
        </button>
      </div>

      {mode === 'learn' && (
        <>
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setTableType('multiplication')}
              className={cn(
                "px-8 py-3 rounded-2xl font-black transition-all border-4 shadow-sm",
                tableType === 'multiplication' ? "bg-math-primary border-math-primary text-white shadow-lg" : "bg-white border-gray-100 text-gray-400"
              )}
            >
              BẢNG NHÂN
            </button>
            <button
              onClick={() => setTableType('division')}
              className={cn(
                "px-8 py-3 rounded-2xl font-black transition-all border-4 shadow-sm",
                tableType === 'division' ? "bg-math-primary border-math-primary text-white shadow-lg" : "bg-white border-gray-100 text-gray-400"
              )}
            >
              BẢNG CHIA
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {numbers.map((num) => (
              <motion.button
                key={num}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedNum(num)}
                className={cn(
                  "w-14 h-14 sm:w-16 sm:h-16 rounded-3xl font-display text-2xl sm:text-3xl transition-all flex items-center justify-center border-4 shadow-sm",
                  selectedNum === num 
                    ? 'bg-math-primary border-math-primary text-white shadow-xl scale-110 z-10' 
                    : 'bg-white border-gray-100 text-math-primary hover:border-math-primary/30'
                )}
              >
                {num}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedNum}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-4 sm:p-8 rounded-3xl border-4 border-math-primary/10 shadow-2xl relative overflow-hidden"
            >
              {isComplete && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <Trophy className="w-24 h-24 text-yellow-500 mb-4" />
                  </motion.div>
                  <h3 className="font-display text-4xl text-math-primary mb-2">Chúc Mừng!</h3>
                  <p className="text-xl text-gray-600 mb-8 max-w-md">
                    Bạn đã xuất sắc hoàn thành {tableType === 'multiplication' ? `bảng nhân ${selectedNum}` : `bảng chia ${selectedNum}`}. Tiếp tục phát huy nhé!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        setIsComplete(false);
                        setUserAnswers({});
                      }}
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-display text-lg hover:bg-gray-200 transition-all"
                    >
                      <RefreshCw className="w-5 h-5" /> Luyện lại
                    </button>
                    <button
                      onClick={nextTable}
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-math-secondary text-white rounded-2xl font-display text-xl hover:bg-math-secondary/90 transition-all shadow-lg hover:scale-105 active:scale-95"
                    >
                      Bảng tiếp theo <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-1/2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-2xl sm:text-3xl text-math-primary flex items-center gap-3">
                      <Calculator className="w-8 h-8" />
                      {tableType === 'multiplication' ? `Bảng nhân ${selectedNum}` : `Bảng chia ${selectedNum}`}
                    </h3>
                    <div className="text-math-secondary font-bold bg-math-secondary/10 px-4 py-2 rounded-full">
                      {Object.values(userAnswers).filter((v, idx) => {
                        const correctVal = tableType === 'multiplication' ? (selectedNum * (idx + 1)) : (idx + 1);
                        return parseInt(v) === correctVal;
                      }).length}/10
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {tableRows.map((i) => {
                      const correctVal = tableType === 'multiplication' ? (selectedNum * i) : i;
                      const isCorrect = userAnswers[i] && parseInt(userAnswers[i]) === correctVal;
                      return (
                        <div 
                          key={i} 
                          className={cn(
                            "flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all border-2",
                            isCorrect ? "bg-green-50 border-green-200" : "bg-gray-50 border-transparent"
                          )}
                        >
                          <span className="text-xl sm:text-2xl font-bold text-gray-700">
                            {tableType === 'multiplication' ? (
                              <>{selectedNum} <span className="text-math-secondary">×</span> {i} =</>
                            ) : (
                              <>{selectedNum * i} <span className="text-math-secondary">÷</span> {selectedNum} =</>
                            )}
                          </span>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              value={userAnswers[i] || ''}
                              onChange={(e) => handleInputChange(i, e.target.value)}
                              disabled={isComplete}
                              className={cn(
                                "w-24 sm:w-32 p-2 sm:p-3 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 focus:outline-none transition-all",
                                isCorrect 
                                  ? "bg-green-100 border-green-400 text-green-700" 
                                  : "bg-white border-math-primary/20 focus:border-math-primary text-math-primary"
                              )}
                              placeholder="?"
                            />
                            {isCorrect && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -right-10"
                              >
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="w-full lg:w-1/2 space-y-6">
                  <div className="bg-orange-50 p-6 sm:p-8 rounded-3xl border-2 border-orange-100">
                    <h4 className="font-display text-xl text-orange-600 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-6 h-6" />
                      Mẹo ghi nhớ bảng {selectedNum}
                    </h4>
                    <p className="text-lg text-gray-700 leading-relaxed italic">
                      "{getTip(selectedNum)}"
                    </p>
                  </div>

                  <div className="bg-math-secondary/5 p-6 sm:p-8 rounded-3xl border-2 border-math-secondary/10">
                    <h4 className="font-display text-xl text-math-secondary mb-4">Tiến độ học tập</h4>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(Object.values(userAnswers).filter((v, idx) => {
                          const correctVal = tableType === 'multiplication' ? (selectedNum * (idx + 1)) : (idx + 1);
                          return parseInt(v) === correctVal;
                        }).length / 10) * 100}%` }}
                        className="bg-math-secondary h-full relative"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </motion.div>
                    </div>
                    <p className="mt-4 text-center text-lg font-medium text-math-secondary">
                      Bạn đã thuộc được <span className="text-2xl font-bold">{(Object.values(userAnswers).filter((v, idx) => {
                        const correctVal = tableType === 'multiplication' ? (selectedNum * (idx + 1)) : (idx + 1);
                        return parseInt(v) === correctVal;
                      }).length / 10) * 100}%</span> bảng này rồi!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {mode === 'matrix' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 sm:p-8 rounded-3xl border-4 border-math-accent/20 shadow-2xl overflow-hidden"
        >
          <div className="text-center mb-8">
            <h3 className="font-display text-3xl text-math-primary mb-2">Bảng Ma Trận Thông Minh</h3>
            <p className="text-gray-500">Di chuyển chuột để xem kết quả các phép tính!</p>
          </div>
          
          <div className="overflow-x-auto pb-4">
            <div className="inline-grid grid-cols-11 gap-1 p-4 bg-gray-50 rounded-3xl border-2 border-gray-100 min-w-max mx-auto">
              <div className="w-12 h-12 flex items-center justify-center font-bold text-gray-400 text-lg">×</div>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <div key={n} className="w-12 h-12 flex items-center justify-center font-bold text-math-primary bg-math-primary/10 rounded-xl text-lg">{n}</div>
              ))}
              {[1,2,3,4,5,6,7,8,9,10].map(r => (
                <React.Fragment key={r}>
                  <div className="w-12 h-12 flex items-center justify-center font-bold text-math-secondary bg-math-secondary/10 rounded-xl text-lg">{r}</div>
                  {[1,2,3,4,5,6,7,8,9,10].map(c => (
                    <div
                      key={`${r}-${c}`}
                      onMouseEnter={() => setHoveredCell({r, c})}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-xl transition-all text-lg font-medium cursor-default",
                        "bg-white text-gray-600 border border-gray-100",
                        (hoveredCell?.r === r || hoveredCell?.c === c) && "bg-math-accent/20 text-math-primary border-math-accent/50",
                        (hoveredCell?.r === r && hoveredCell?.c === c) && "bg-math-accent text-math-primary shadow-lg scale-110 z-10 border-math-primary/30"
                      )}
                    >
                      {r * c}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {hoveredCell && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-math-accent/10 rounded-2xl border-2 border-math-accent/20 text-center"
            >
              <div className="text-4xl font-display text-math-primary">
                {hoveredCell.r} <span className="text-math-secondary">×</span> {hoveredCell.c} = <span className="text-math-primary font-bold">{hoveredCell.r * hoveredCell.c}</span>
              </div>
              <div className="text-xl text-math-secondary mt-2">
                {hoveredCell.r * hoveredCell.c} <span className="text-math-secondary">÷</span> {hoveredCell.r} = {hoveredCell.c}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {mode === 'quiz' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 sm:p-12 rounded-3xl border-4 border-math-secondary/20 shadow-2xl max-w-3xl mx-auto text-center relative overflow-hidden"
        >
          {quizFinished ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 space-y-8"
            >
              {quizScore === 10 ? (
                <div className="space-y-6">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-32 h-32 mx-auto bg-yellow-100 rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-lg"
                  >
                    <div className="relative">
                      <Sparkles className="w-20 h-20 text-yellow-500" />
                      <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-yellow-700">10</span>
                    </div>
                  </motion.div>
                  <h3 className="font-display text-4xl text-math-primary">Bông Hoa Điểm 10!</h3>
                  <p className="text-xl text-gray-600">Bạn thật tuyệt vời! Bạn đã trả lời đúng tất cả 10 câu hỏi.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-24 h-24 mx-auto bg-math-secondary/10 rounded-full flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-math-secondary" />
                  </div>
                  <h3 className="font-display text-3xl text-gray-800">Cố lên bạn ơi!</h3>
                  <p className="text-xl text-gray-600">
                    Bạn đã đạt được <span className="text-math-secondary font-bold">{quizScore}/10</span> câu đúng. Hãy luyện tập thêm để nhận bông hoa điểm 10 nhé!
                  </p>
                </div>
              )}
              
              <button
                onClick={startNewQuiz}
                className="px-12 py-4 bg-math-secondary text-white rounded-2xl font-display text-xl hover:bg-math-secondary/90 transition-all shadow-lg flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-6 h-6" /> Thử thách lại
              </button>
            </motion.div>
          ) : (
            <>
              <div className="mb-12">
                <h3 className="font-display text-4xl text-math-secondary mb-6 font-black drop-shadow-sm">Thử Thách Random</h3>
                <div className="flex justify-center gap-12 text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Đúng: {quizScore}</span>
                  <span className="flex items-center gap-2"><XCircle className="w-5 h-5 text-red-500" /> Câu hỏi: {quizCount}/10</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-12 px-4">
                <div className="bg-math-secondary/10 px-6 py-3 rounded-2xl">
                  <span className="block text-xs text-math-secondary uppercase font-bold tracking-wider mb-1">Điểm số</span>
                  <span className="text-3xl font-display text-math-secondary">{quizScore}</span>
                </div>
                <div className="text-gray-400 font-bold text-xl">
                  Câu hỏi: {quizCount + 1}/10
                </div>
              </div>

              <AnimatePresence mode="wait">
                {quizQuestion && (
                  <motion.div
                    key={`${quizQuestion.a}-${quizQuestion.b}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-10"
                  >
                    <div className="text-7xl sm:text-9xl font-display text-math-primary flex items-center justify-center gap-6">
                      <span>{quizQuestion.a}</span>
                      <span className="text-math-secondary">×</span>
                      <span>{quizQuestion.b}</span>
                    </div>

                    <form onSubmit={handleQuizSubmit} className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <input
                          type="number"
                          autoFocus
                          value={quizInput}
                          onChange={(e) => setQuizInput(e.target.value)}
                          className={cn(
                            "w-56 p-6 text-center text-5xl font-display rounded-3xl border-4 focus:outline-none transition-all shadow-inner",
                            quizFeedback === 'correct' ? "border-green-400 bg-green-50 text-green-600" :
                            quizFeedback === 'incorrect' ? "border-red-400 bg-red-50 text-red-600 animate-shake" :
                            "border-math-secondary/20 focus:border-math-secondary"
                          )}
                          placeholder="?"
                        />
                        <AnimatePresence>
                          {quizFeedback === 'correct' && (
                            <motion.div 
                              initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
                              className="absolute -right-16 top-1/2 -translate-y-1/2"
                            >
                              <CheckCircle2 className="w-14 h-14 text-green-500" />
                            </motion.div>
                          )}
                          {quizFeedback === 'incorrect' && (
                            <motion.div 
                              initial={{ scale: 0, rotate: 45 }} animate={{ scale: 1, rotate: 0 }}
                              className="absolute -right-16 top-1/2 -translate-y-1/2"
                            >
                              <XCircle className="w-14 h-14 text-red-500" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={quizFeedback !== null}
                        className="px-16 py-5 bg-math-secondary text-white rounded-2xl font-display text-2xl hover:bg-math-secondary/90 transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        Kiểm tra
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={generateQuizQuestion}
                className="mt-16 text-gray-400 hover:text-math-secondary flex items-center gap-2 mx-auto transition-colors font-medium"
              >
                <RefreshCw className="w-5 h-5" /> Đổi câu hỏi khác
              </button>
            </>
          )}
        </motion.div>
      )}

    </div>
  );
};

