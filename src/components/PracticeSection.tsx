import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ChevronRight, Loader2, Sparkles, Trophy, BarChart3, WifiOff, Star } from 'lucide-react';
import { mathService } from '../services/mathService';
import { RewardService } from '../services/rewardService';
import { ProgressService } from '../services/progressService';
import { soundService } from '../services/soundService';

const FALLBACK_PROBLEMS: Problem[] = [
  {
    id: 1,
    category: "Cộng trừ",
    question: "15 + 27 bằng bao nhiêu?",
    options: ["32", "42", "52", "45"],
    answer: "42",
    hint: "Hãy thử cộng hàng đơn vị 5 + 7 trước xem sao!",
    explanation: "Ta lấy 15 + 27 = 42. Bạn có thể cộng hàng đơn vị trước: 5 + 7 = 12, viết 2 nhớ 1. Sau đó cộng hàng chục: 1 + 2 + 1 (nhớ) = 4."
  },
  {
    id: 2,
    category: "So sánh",
    question: "Số nào lớn hơn: 125 hay 152?",
    options: ["125", "152", "Bằng nhau"],
    answer: "152",
    hint: "Hãy nhìn vào chữ số hàng chục nhé!",
    explanation: "So sánh hàng trăm (đều là 1), sau đó so sánh hàng chục: 5 chục lớn hơn 2 chục, nên 152 > 125."
  },
  {
    id: 3,
    category: "Hình học",
    question: "Hình nào có 3 cạnh?",
    options: ["Hình vuông", "Hình tròn", "Hình tam giác", "Hình chữ nhật"],
    answer: "Hình tam giác",
    hint: "Bé có nhớ hình nào trông giống mái nhà không?",
    explanation: "Hình tam giác là hình có 3 cạnh và 3 góc."
  }
];

interface Problem {
  id: number;
  category?: string;
  question: string;
  options: string[];
  answer: string;
  hint: string;
  explanation: string;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const CORRECT_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';

export const PracticeSection = ({ age, topicId = 'general' }: { age: number; topicId?: string }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [questionCount, setQuestionCount] = useState(10);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const grade = Math.max(1, Math.min(9, Math.floor((age - 6) + 1)));

  const loadProblems = async () => {
    setLoading(true);
    setFinished(false);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
    setShowHint(false);
    try {
      if (navigator.onLine) {
        const data = await mathService.getPracticeProblems(grade, difficulty, questionCount, topicId);
        setProblems(data);
      } else {
        setProblems(FALLBACK_PROBLEMS);
      }
    } catch (error) {
      console.error(error);
      setProblems(FALLBACK_PROBLEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [grade, difficulty, questionCount, topicId]);

  const handleAnswer = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
    setShowResult(true);
    if (option === problems[currentIndex].answer) {
      setScore(s => s + 1);
      soundService.playSuccess();
    } else {
      soundService.playWarning();
    }
  };

  const nextProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setShowResult(false);
      setShowHint(false);
    } else {
      setFinished(true);
      soundService.playFanfare();
      ProgressService.savePracticeStats(topicId, score, problems.length);
      if (score / problems.length >= 0.5) ProgressService.saveTopicCompletion(topicId);
      
      // Award Stars
      const earnedStars = score;
      const bonusStars = score === problems.length ? 5 : 0;
      RewardService.addStars(earnedStars + bonusStars);

      if (score === problems.length) {
        RewardService.unlockAchievement(
          'practice_pro',
          'Chuyên Gia Luyện Tập',
          'Hoàn thành trọn vẹn một bộ câu hỏi luyện tập đa dạng.',
          '📚'
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-20 space-y-4">
        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-math-primary animate-spin" />
        <p className="text-lg sm:text-xl text-gray-500 font-medium text-center px-4">Đang chuẩn bị bài tập {difficulty} lớp {grade}...</p>
      </div>
    );
  }

  if (finished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white p-6 sm:p-12 rounded-2xl sm:rounded-3xl shadow-xl text-center space-y-6 border-2 sm:border-4 border-math-accent/30"
      >
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-math-accent/20 rounded-full flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-orange-500" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl text-gray-800">Hoàn thành thử thách!</h2>
        <p className="text-xl sm:text-2xl text-gray-600">
          Bạn đã trả lời đúng <span className="text-math-primary font-bold">{score}/{problems.length}</span> câu hỏi cấp độ {difficulty}.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4">
          <div className="bg-math-accent/10 p-4 rounded-2xl flex items-center justify-center gap-2 mb-4 w-full">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <span className="text-xl font-bold text-gray-700">+{score + (score === problems.length ? 5 : 0)} SAO</span>
          </div>
          <button 
            onClick={loadProblems}
            className="px-8 py-3 bg-math-primary text-white font-bold rounded-xl sm:rounded-2xl hover:bg-math-primary/90 transition-all shadow-lg w-full sm:w-auto"
          >
            Luyện tập tiếp
          </button>
          <button 
            onClick={() => setFinished(false)}
            className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl sm:rounded-2xl hover:bg-gray-200 transition-all w-full sm:w-auto"
          >
            Đổi cấp độ
          </button>
        </div>
      </motion.div>
    );
  }

  if (problems.length > 0 && problems[currentIndex]) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0">
        {!isOnline && (
          <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-2xl flex items-center gap-4 text-orange-700">
            <WifiOff className="w-6 h-6 shrink-0" />
            <p className="text-sm font-medium">
              Bạn đang ở chế độ ngoại tuyến. Hệ thống đang hiển thị các bài tập mẫu có sẵn. Kết nối internet để nhận thêm nhiều bài tập mới từ AI nhé!
            </p>
          </div>
        )}
        {/* Settings Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Difficulty */}
          <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 font-bold">
              <BarChart3 className="w-5 h-5 text-math-primary" />
              <span className="text-sm">Cấp độ:</span>
            </div>
            <div className="flex gap-1.5">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all capitalize ${
                    difficulty === d
                      ? 'bg-math-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {d === 'easy' ? 'Dễ' : d === 'medium' ? 'Vừa' : 'Khó'}
                </button>
              ))}
            </div>
          </div>
  
          {/* Number of Questions */}
          <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 font-bold">
              <Sparkles className="w-5 h-5 text-math-secondary" />
              <span className="text-sm">Số câu:</span>
            </div>
            <div className="flex gap-1.5">
              {[10, 20, 25].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    questionCount === n
                      ? 'bg-math-secondary text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
  
        <>
          <div className="flex items-center justify-between px-2">
            <span className="text-sm sm:text-lg font-bold text-math-secondary">Câu hỏi {currentIndex + 1}/{problems.length}</span>
            <div className="flex gap-1">
              {problems.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 sm:h-2 w-6 sm:w-8 rounded-full transition-all ${
                    i === currentIndex ? 'bg-math-primary w-8 sm:w-12' : i < currentIndex ? 'bg-math-secondary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
  
          <motion.div 
            key={`${difficulty}-${currentIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border-2 border-gray-50 space-y-6 sm:space-y-8"
          >
            {problems[currentIndex].category && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-math-primary/10 text-math-primary text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                {problems[currentIndex].category}
              </div>
            )}
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 leading-relaxed">
              {problems[currentIndex].question}
            </h3>
  
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {problems[currentIndex].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult}
                    className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl text-left text-base sm:text-lg font-medium transition-all border-2 ${
                      showResult
                        ? option === problems[currentIndex].answer
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : option === selectedOption
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'bg-gray-50 border-gray-100 text-gray-400'
                        : 'bg-white border-gray-100 hover:border-math-primary hover:bg-math-primary/5 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && option === problems[currentIndex].answer && <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />}
                      {showResult && option === selectedOption && option !== problems[currentIndex].answer && <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />}
                    </div>
                  </button>
                ))}
              </div>

              {!showResult && problems[currentIndex].hint && (
                <div className="flex justify-start">
                  <button
                    onClick={() => {
                      if (!showHint) {
                        RewardService.unlockAchievement(
                          'smart_learner',
                          'Người Học Thông Thái',
                          'Sử dụng gợi ý để tìm ra đáp án chính xác nhé!',
                          '💡'
                        );
                      }
                      setShowHint(!showHint);
                    }}
                    className="flex items-center gap-2 text-sm font-bold text-math-secondary hover:text-math-secondary/80 transition-colors"
                  >
                    <Star className={`w-4 h-4 ${showHint ? 'fill-math-secondary' : ''}`} />
                    {showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}
                  </button>
                </div>
              )}

              <AnimatePresence>
                {showHint && !showResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-math-secondary/10 p-4 rounded-xl border border-math-secondary/20 text-math-secondary text-sm font-medium italic"
                  >
                    💡 Gợi ý: {problems[currentIndex].hint}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
  
            <AnimatePresence>
              {showResult && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-math-accent/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-math-accent/30 space-y-3"
                >
                  <div className="flex items-center gap-2 text-orange-600 font-bold">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    Giải thích:
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    {problems[currentIndex].explanation}
                  </p>
                  <button 
                    onClick={nextProblem}
                    className="mt-4 w-full py-3 bg-math-primary text-white font-bold rounded-xl hover:bg-math-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    {currentIndex === problems.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      </div>
    );
  }
};
