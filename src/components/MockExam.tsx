
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw,
  Trophy,
  ClipboardList,
  Timer,
  AlertCircle
} from 'lucide-react';
import { ExamService, Exam, Question } from '../services/examService';
import { cn } from '../lib/utils';

interface MockExamProps {
  age: number;
}

export const MockExam: React.FC<MockExamProps> = ({ age }) => {
  const [difficulty, setDifficulty] = useState<'medium' | 'hard'>('medium');
  const [exams, setExams] = useState<Exam[]>(() => ExamService.getExamsByAge(age, difficulty));
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const QUESTIONS_PER_PAGE = 4;

  useEffect(() => {
    setExams(ExamService.getExamsByAge(age, difficulty));
  }, [age, difficulty]);

  useEffect(() => {
    if (selectedExam && !isFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedExam, isFinished]);

  const startExam = (exam: Exam) => {
    setSelectedExam(exam);
    setCurrentPage(0);
    setUserAnswers({});
    setIsFinished(false);
    setShowResults(false);
    setTimeLeft(exam.timeLimit);
  };

  const finishExam = () => {
    setIsFinished(true);
    setShowResults(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = () => {
    if (!selectedExam) return 0;
    let score = 0;
    selectedExam.questions.forEach(q => {
      if (userAnswers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
        score += q.points;
      }
    });
    return score;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedExam) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-math-primary/10 rounded-3xl flex items-center justify-center mx-auto text-math-primary">
            <ClipboardList className="w-12 h-12" />
          </div>
          <h2 className="font-display text-4xl text-gray-800">Luyện Đề Thi</h2>
          <p className="text-gray-500 text-lg">Hệ thống đề thi chuẩn lớp {Math.max(1, age - 5)}</p>
        </div>

        {age >= 9 && (
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setDifficulty('medium')}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold transition-all",
                difficulty === 'medium' 
                  ? "bg-math-secondary text-white shadow-lg" 
                  : "bg-white text-gray-400 border-2 border-gray-100"
              )}
            >
              Mức độ Vừa
            </button>
            <button
              onClick={() => setDifficulty('hard')}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold transition-all",
                difficulty === 'hard' 
                  ? "bg-math-primary text-white shadow-lg" 
                  : "bg-white text-gray-400 border-2 border-gray-100"
              )}
            >
              Mức độ Khó
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => (
            <motion.button
              key={exam.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startExam(exam)}
              className="bg-white p-6 rounded-[32px] border-4 border-gray-100 hover:border-math-primary shadow-sm text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-math-primary rounded-2xl flex items-center justify-center text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{exam.title}</h3>
                  <p className="text-gray-400 text-sm">
                    {exam.questions.length} câu • {formatTime(exam.timeLimit)} • Độ khó: {exam.difficulty === 'hard' ? 'Khó' : 'Vừa'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-300" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const totalPoints = selectedExam.questions.reduce((acc, q) => acc + q.points, 0);
    const percentage = (score / totalPoints) * 100;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white rounded-[40px] p-10 border-4 border-math-primary shadow-2xl text-center space-y-8"
      >
        <Trophy className="w-24 h-24 text-yellow-500 mx-auto" />
        <div className="space-y-2">
          <h2 className="font-display text-4xl text-gray-800">Kết Quả</h2>
          <p className="text-gray-400">{selectedExam.title}</p>
        </div>
        <div className="flex justify-center items-end gap-2">
          <span className="text-7xl font-black text-math-primary">{score}</span>
          <span className="text-2xl font-bold text-gray-300 mb-2">/ {totalPoints} Pts</span>
        </div>
        <div className="flex gap-4 pt-4">
          <button 
            onClick={() => setSelectedExam(null)}
            className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200"
          >
            Quay Lại
          </button>
          <button 
            onClick={() => startExam(selectedExam)}
            className="flex-1 py-4 bg-math-primary text-white font-bold rounded-2xl shadow-lg hover:brightness-110"
          >
            Làm Lại
          </button>
        </div>
      </motion.div>
    );
  }

  const totalPages = Math.ceil(selectedExam.questions.length / QUESTIONS_PER_PAGE);
  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const currentQuestions = selectedExam.questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);
  const isPageComplete = currentQuestions.every(q => userAnswers[q.id]?.trim());

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="sticky top-4 z-10 flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-3xl border-2 border-gray-100 shadow-lg">
        <button 
          onClick={() => setSelectedExam(null)}
          className="text-gray-400 hover:text-math-primary flex items-center gap-2 font-bold px-4 py-2"
        >
          <ChevronLeft className="w-5 h-5" /> Thoát
        </button>
        
        <div className={cn(
          "flex items-center gap-2 px-6 py-2 rounded-2xl font-black transition-all",
          timeLeft < 60 ? "bg-red-50 text-red-500 animate-pulse" : "bg-math-primary/10 text-math-primary"
        )}>
          <Timer className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>

        <div className="text-sm font-bold text-gray-400 px-4">
          Trang {currentPage + 1} / {totalPages}
        </div>
      </div>

      <div className="space-y-8">
        {currentQuestions.map((q, idx) => (
          <motion.div 
            key={q.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[32px] p-8 shadow-md border-2 border-gray-50 space-y-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-math-primary text-white rounded-xl flex items-center justify-center font-black shrink-0">
                {startIndex + idx + 1}
              </div>
              <h3 className="text-xl font-bold text-gray-800 leading-tight pt-1">
                {q.text}
              </h3>
            </div>

            {q.type === 'multiple-choice' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-14">
                {q.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(q.id, option.value)}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 group",
                      userAnswers[q.id] === option.value
                        ? "border-math-primary bg-math-primary/5 shadow-sm"
                        : "border-gray-100 bg-white hover:border-math-primary/20"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-colors",
                      userAnswers[q.id] === option.value
                        ? "bg-math-primary text-white"
                        : "bg-gray-100 text-gray-400 group-hover:bg-math-primary/10 group-hover:text-math-primary"
                    )}>
                      {option.value}
                    </div>
                    <span className="font-bold text-gray-600">{option.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="ml-14">
                <input
                  type="text"
                  value={userAnswers[q.id] || ''}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                  placeholder="Câu trả lời của bé..."
                  className="w-full max-w-md p-4 text-lg bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-math-primary focus:bg-white outline-none transition-all"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="space-y-4 pt-8">
        {!isPageComplete && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-math-primary font-bold bg-math-primary/5 py-3 rounded-2xl border border-math-primary/10"
          >
            <AlertCircle className="w-5 h-5" />
            Bé hãy hoàn thành các câu hỏi ở trang này để tiếp tục nhé!
          </motion.div>
        )}
        
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 0}
            className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-400 font-bold rounded-2xl hover:bg-gray-50 disabled:opacity-50 transition-all font-display"
          >
            Trang Trước
          </button>
          {currentPage === totalPages - 1 ? (
            <button
              onClick={finishExam}
              disabled={!isPageComplete}
              className="flex-1 py-4 bg-math-primary text-white font-bold rounded-2xl shadow-lg hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all font-display flex items-center justify-center gap-2"
            >
              Nộp Bài Thi
              <CheckCircle2 className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!isPageComplete}
              className="flex-1 py-4 bg-math-secondary text-white font-bold rounded-2xl shadow-lg hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all font-display flex items-center justify-center gap-2"
            >
              Trang Tiếp
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

