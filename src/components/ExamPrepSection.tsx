import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, Timer, Trophy, CheckCircle2, XCircle, Brain, RefreshCcw, ArrowRight, Loader2, Sparkles, Star } from 'lucide-react';
import { mathService } from '../services/mathService';
import { RewardService } from '../services/rewardService';
import { ProgressService } from '../services/progressService';
import { soundService } from '../services/soundService';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface Exam {
  examName: string;
  timeLimit: number; // minutes
  questions: ExamQuestion[];
}

export const ExamPrepSection: React.FC<{ topicId?: string; age?: number }> = ({ topicId = 'general', age: initialAge = 7 }) => {
  const [selectedAge, setSelectedAge] = useState<number>(initialAge);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [gameState, setGameState] = useState<'setup' | 'testing' | 'results'>('setup');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setSelectedAge(initialAge);
  }, [initialAge]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'testing' && timeLeft > 0 && !isPaused) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            soundService.playWarning();
            setGameState('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, isPaused]);

  const loadExam = async () => {
    setLoading(true);
    try {
      const data = await mathService.getExamPaper(selectedAge, topicId);
      setExam(data);
      setTimeLeft(data.timeLimit * 60);
      setAnswers({});
      setCurrentIdx(0);
      setGameState('testing');
      soundService.playSuccess();
    } catch (error) {
      console.error(error);
      alert('Không thể tải đề thi. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: option }));
    soundService.playSelect();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    if (!exam) return 0;
    let correct = 0;
    exam.questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) correct++;
    });
    return correct;
  };

  const finishExam = () => {
    const finalScore = calculateScore();
    setGameState('results');
    soundService.playFanfare();
    ProgressService.saveExamScore(topicId, finalScore * 10);
    if (finalScore >= 5) ProgressService.saveTopicCompletion(topicId);

    // Award Stars
    let starsToAward = 20; // Base participation
    if (finalScore >= 8) starsToAward += 30;
    if (finalScore === 10) starsToAward += 50;
    RewardService.addStars(starsToAward);

    if (finalScore === 10) {
      RewardService.unlockAchievement(
        'scholar',
        'Học Giả Tài Ba',
        'Đạt điểm tuyệt đối 100/100 trong một bài thi thử.',
        '🎓'
      );
    }

    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-math-primary animate-spin" />
          <Brain className="w-8 h-8 text-math-secondary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-display font-bold text-gray-800 animate-pulse">Đang biên soạn đề thi...</h2>
          <div className="mt-4 space-y-2">
            <p className="text-gray-500 text-sm italic">"AI đang chọn lọc những bài toán thú vị nhất cho bé."</p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 4, repeat: Infinity }}
                className="bg-math-primary h-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-8 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[40px] shadow-2xl border-4 border-math-primary/10 space-y-10"
        >
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-math-primary/10 rounded-3xl flex items-center justify-center mx-auto text-math-primary shadow-inner">
              <ClipboardList className="w-10 h-10" />
            </div>
            <h2 className="font-display text-4xl text-gray-800">Luyện Thi Học Kì</h2>
            <p className="text-gray-500 text-lg">Thử thách như đang ngồi trong lớp học thực thụ!</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-center font-bold text-gray-600">Bé đang học lớp mấy nhỉ?</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[6, 7, 8, 9, 10].map(age => (
                  <button
                    key={age}
                    onClick={() => setSelectedAge(age === 6 ? 6 : age)}
                    className={cn(
                      "py-4 rounded-2xl font-bold border-4 transition-all text-lg",
                      selectedAge === age 
                        ? "bg-math-primary border-math-primary text-white shadow-lg" 
                        : "bg-gray-50 border-gray-100 text-gray-500 hover:border-math-primary/30"
                    )}
                  >
                    Lớp {age - 5}
                    <span className="block text-xs opacity-60">({age} tuổi)</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-100 space-y-3">
              <h4 className="font-bold text-amber-800 flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Quy định phòng thi:
              </h4>
              <ul className="text-sm text-amber-700 space-y-2 font-medium">
                <li>• Đề thi gồm 10 câu hỏi bao quát kiến thức lớp {selectedAge - 5}.</li>
                <li>• Thời gian làm bài có hạn (thông thường 40 phút).</li>
                <li>• Bé hãy suy nghĩ kỹ trước khi chọn đáp án nhé!</li>
              </ul>
            </div>
          </div>

          <button
            onClick={loadExam}
            className="w-full py-5 math-gradient text-white font-black rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-2xl flex items-center justify-center gap-3"
          >
            VÀO PHÒNG THI NGAY
            <ArrowRight className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'testing' && exam) {
    if (!exam.questions || exam.questions.length === 0 || !exam.questions[currentIdx]) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-gray-100 italic text-gray-400">
          Có lỗi khi tải câu hỏi. Hãy thử lại nhé!
        </div>
      );
    }
    const currentQuestion = exam.questions[currentIdx];
    if (!currentQuestion || !currentQuestion.options) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-gray-100 space-y-4">
          <p className="italic text-gray-400 text-center">Ôi, AI đang gặp chút trục trặc nhỏ với câu hỏi này.</p>
          <button 
            onClick={() => setCurrentIdx(prev => Math.min(exam.questions.length - 1, prev + 1))}
            className="px-6 py-2 bg-math-primary text-white rounded-xl font-bold"
          >
            Bỏ qua câu này
          </button>
        </div>
      );
    }
    
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-4 px-4">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-math-primary/10 rounded-xl flex items-center justify-center text-math-primary">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-800 truncate max-w-xs">{exam.examName}</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <span>Câu {currentIdx + 1}/{exam.questions.length}</span>
                <span>•</span>
                <span>Lớp {selectedAge - 5}</span>
              </div>
            </div>
          </div>

          <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-xl border-2 transition-colors",
            timeLeft < 300 ? "bg-red-50 border-red-500 text-red-600 animate-pulse" : "bg-gray-50 border-gray-200 text-gray-700"
          )}>
            <Timer className="w-5 h-5" />
            <span className="font-mono text-2xl font-bold">{formatTime(timeLeft)}</span>
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="ml-2 text-gray-400 hover:text-math-primary"
            >
              {isPaused ? <ArrowRight className="w-5 h-5" /> : <Loader2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Question Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl border-2 border-gray-50 space-y-10"
            >
              <div className="space-y-4">
                <span className="inline-block px-4 py-1 bg-math-secondary/10 text-math-secondary rounded-full text-xs font-black uppercase tracking-widest">CÂU HỎI {currentIdx + 1}</span>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-800 leading-snug">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option)}
                    className={cn(
                      "p-6 rounded-3xl text-left border-4 transition-all text-lg font-bold flex items-center gap-4",
                      answers[currentIdx] === option
                        ? "bg-math-primary border-math-primary text-white shadow-lg"
                        : "bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <span className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2",
                      answers[currentIdx] === option ? "bg-white/20 border-white" : "bg-white border-gray-200 text-gray-400"
                    )}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => {
                setCurrentIdx(prev => Math.max(0, prev - 1));
                soundService.playSelect();
              }}
              disabled={currentIdx === 0}
              className="px-8 py-3 bg-white text-gray-500 font-bold rounded-2xl border border-gray-200 disabled:opacity-30 flex items-center gap-2"
            >
              CÂU TRƯỚC
            </button>
            
            {currentIdx < exam.questions.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentIdx(prev => Math.min(exam.questions.length - 1, prev + 1));
                  soundService.playSelect();
                }}
                className="px-10 py-3 bg-math-secondary text-white font-bold rounded-2xl shadow-lg flex items-center gap-2"
              >
                CÂU TIẾP THEO
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={finishExam}
                className="px-12 py-3 bg-green-500 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-lg"
              >
                NỘP BÀI THI
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className={cn("grid gap-2 px-2", `grid-cols-${exam.questions.length}`)} style={{ gridTemplateColumns: `repeat(${exam.questions.length}, minmax(0, 1fr))` }}>
          {exam.questions.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-2 rounded-full transition-all",
                answers[i] ? "bg-math-primary" : "bg-gray-200",
                currentIdx === i ? "scale-y-150 ring-2 ring-math-primary/30" : ""
              )} 
            />
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'results' && exam) {
    const finalScore = calculateScore();
    
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[40px] shadow-2xl border-4 border-math-primary/10 text-center space-y-8"
        >
          <div className="w-24 h-24 bg-math-accent/20 rounded-full flex items-center justify-center mx-auto text-orange-500">
            <Trophy className="w-12 h-12" />
          </div>
          
          <div className="space-y-4">
            <h2 className="font-display text-5xl text-gray-800">Kết Quả Bài Thi</h2>
            <div className="py-12 bg-math-primary/5 rounded-[48px] border-4 border-math-primary/10 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,107,107,0.05)_0%,transparent_70%)]" />
              <p className="text-xl font-bold text-gray-400 uppercase tracking-widest mb-4 relative z-10">Điểm Số Của Bé</p>
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[12rem] leading-none font-display font-black text-math-primary drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)] relative z-10"
              >
                {finalScore * 10}
              </motion.div>
              <div className="h-1 w-32 bg-math-primary/20 mx-auto my-6 rounded-full" />
              <p className="text-3xl font-display font-bold text-math-primary relative z-10">
                ⭐ Bé làm đúng {finalScore} / {exam.questions.length} câu ⭐
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 flex items-center justify-around">
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian còn lại</p>
              <p className="text-2xl font-bold text-gray-700">{formatTime(timeLeft)}</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nhận xét</p>
              <p className="font-bold text-math-secondary">
                {finalScore === 10 ? 'Tuyệt đỉnh vô đối!' : finalScore >= 8 ? 'Quá giỏi luôn!' : finalScore >= 5 ? 'Khá lắm, cố lên nhé!' : 'Hãy ôn tập kỹ hơn nha!'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setGameState('setup')}
              className="py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
            >
              THI LẠI ĐỀ KHÁC
            </button>
            <button
              onClick={() => window.location.reload()}
              className="py-4 bg-math-primary text-white font-bold rounded-2xl shadow-lg hover:brightness-105 transition-all"
            >
              VỀ TRANG CHỦ
            </button>
          </div>
        </motion.div>

        {/* Review Questions */}
        <div className="space-y-4">
          <h3 className="font-display text-2xl text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-math-accent" />
            Xem lại bài thi
          </h3>
          {exam.questions.map((q, idx) => (
            <div 
              key={idx}
              className={cn(
                "p-6 rounded-3xl border-2 bg-white transition-all",
                answers[idx] === q.answer ? "border-green-100" : "border-red-100"
              )}
            >
              <div className="flex gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-white shadow-sm",
                  answers[idx] === q.answer ? "bg-green-500" : "bg-red-500"
                )}>
                  {idx + 1}
                </div>
                <div className="space-y-4">
                  <p className="font-bold text-gray-800 text-lg leading-relaxed">{q.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium border",
                          opt === q.answer ? "bg-green-50 border-green-200 text-green-700" :
                          opt === answers[idx] ? "bg-red-50 border-red-200 text-red-700" :
                          "bg-white border-gray-100 text-gray-400"
                        )}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-sm">
                    <p className="font-black text-blue-600 uppercase text-[10px] mb-1">Giải thích:</p>
                    <p className="text-gray-600">{q.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
