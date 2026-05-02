/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { 
  Calculator, 
  BookOpen, 
  Music, 
  Sparkles, 
  Send, 
  Loader2, 
  Volume2, 
  Image as ImageIcon,
  BrainCircuit,
  GraduationCap,
  ChevronRight,
  Play,
  Pause,
  WifiOff,
  Wifi,
  Clock,
  Puzzle,
  Home,
  Plus,
  ClipboardList,
  TrendingUp,
  XCircle,
  Trophy,
  Star as StarIcon,
  Medal,
  Award,
  Camera,
  Upload
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { mathService, MATH_TOPICS } from './services/mathService';
import { RewardService, Achievement } from './services/rewardService';
import { MultiplicationTable } from './components/MultiplicationTable';
import { PracticeSection } from './components/PracticeSection';
import { MathGames } from './components/MathGames';
import { ClockLesson } from './components/ClockLesson';
import { ClockPractice } from './components/ClockPractice';
import { MathPuzzles } from './components/MathPuzzles';
import { WelcomeSection } from './components/WelcomeSection';
import { OperationPractice } from './components/OperationPractice';
import { ExamPrepSection } from './components/ExamPrepSection';
import { LearningJourney } from './components/LearningJourney';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'intro' | 'solve' | 'table' | 'practice' | 'clock' | 'fun' | 'operations' | 'exams' | 'journey'>('intro');
  const [clockMode, setClockMode] = useState<'lesson' | 'practice'>('lesson');
  const [problem, setProblem] = useState('');
  const [age, setAge] = useState(7);
  const [selectedTopic, setSelectedTopic] = useState('general');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [stars, setStars] = useState(RewardService.getStars());
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [illustration, setIllustration] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CurrentAvatarIcon = BrainCircuit;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleStars = (e: any) => setStars(e.detail);
    const handleAchievement = (e: any) => {
      setCurrentAchievement(e.detail);
      setTimeout(() => setCurrentAchievement(null), 5000);
    };

    window.addEventListener('stars-updated', handleStars);
    window.addEventListener('achievement-unlocked', handleAchievement);
    return () => {
      window.removeEventListener('stars-updated', handleStars);
      window.removeEventListener('achievement-unlocked', handleAchievement);
    };
  }, []);

  const handleSolve = async (imageData?: string) => {
    if (!problem.trim() && !imageData) return;
    setLoading(true);
    setExplanation(null);
    setIllustration(null);
    setAudioUrl(null);

    try {
      if (imageData) {
        const base64Data = imageData.split(',')[1];
        const mimeType = imageData.split(',')[0].split(':')[1].split(';')[0];
        const exp = await mathService.analyzeImageProblem(base64Data, mimeType, age);
        setExplanation(exp || "Xin lỗi, mình không phân tích được hình ảnh này.");
        // Try to generate an illustration based on the extracted text if possible, 
        // but for now, image analysis is the main focus.
      } else {
        const [exp, prompt] = await Promise.all([
          mathService.solveAndExplain(problem, age),
          mathService.generateIllustrationPrompt(problem)
        ]);
        setExplanation(exp || "Xin lỗi, mình không giải được bài này.");
        
        const img = await mathService.generateImage(prompt || problem);
        setIllustration(img);
      }
    } catch (error) {
      console.error(error);
      setExplanation("Có lỗi xảy ra rồi, bạn thử lại nhé!");
    } finally {
      setLoading(false);
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        handleSolve(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpeak = async (text: string) => {
    if (audioUrl) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
      return;
    }

    setLoading(true);
    const url = await mathService.speakText(text);
    if (url) {
      setAudioUrl(url);
      setIsPlaying(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
    }
  }, [audioUrl]);

  const tabVariants: Variants = {
    initial: { opacity: 0, x: 20, y: 10, scale: 0.98 },
    animate: { 
      opacity: 1, 
      x: 0, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      x: -20, 
      y: -10, 
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-math-primary/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        {!isOnline && (
          <div className="bg-red-500 text-white text-[10px] md:text-xs py-1 text-center font-bold flex items-center justify-center gap-2">
            <WifiOff className="w-3 h-3" /> CHẾ ĐỘ NGOẠI TUYẾN - Một số tính năng AI sẽ bị hạn chế
          </div>
        )}
        <div className="max-w-6xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 math-gradient rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg">
              <CurrentAvatarIcon className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl text-math-primary leading-none">Math Buddy</h1>
              <p className="hidden md:block text-xs text-gray-500 font-medium tracking-wide uppercase mt-1">Học Toán Vui Vẻ</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-gray-100 p-1 rounded-2xl">
            {[
              { id: 'solve', label: 'Giải Toán', icon: Calculator },
              { id: 'operations', label: 'Cộng Trừ', icon: Plus },
              { id: 'table', label: 'Nhân Chia', icon: BookOpen },
              { id: 'clock', label: 'Xem Giờ', icon: Clock },
              { id: 'practice', label: 'Luyện Tập', icon: GraduationCap },
              { id: 'exams', label: 'Thi Thử', icon: ClipboardList },
              { id: 'journey', label: 'Hành Trình', icon: TrendingUp },
              { id: 'fun', label: 'Game Vui', icon: Sparkles },
            ].map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2",
                  activeTab === tab.id 
                    ? "bg-white text-math-primary shadow-sm" 
                    : "text-gray-500 hover:text-math-primary hover:bg-white/50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-math-secondary/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-math-secondary/20">
              <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-math-secondary" />
              <span className="font-bold text-sm md:text-base text-math-secondary">{age} tuổi</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 pb-24 md:pb-12">
        <AnimatePresence mode="wait">
          {activeTab === 'intro' && (
            <motion.div
              key="intro"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <WelcomeSection onStart={(tab) => {
                setActiveTab(tab);
              }} />
            </motion.div>
          )}

          {activeTab === 'solve' && (
            <motion.div
              key="solve"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              {!isOnline ? (
                <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl shadow-xl text-center space-y-6 border-4 border-gray-100">
                  <WifiOff className="w-20 h-20 text-gray-300 mx-auto" />
                  <h2 className="font-display text-3xl text-gray-800">Bạn đang ngoại tuyến</h2>
                  <p className="text-gray-500 text-lg">
                    Tính năng giải toán bằng AI cần kết nối internet. Bạn có thể học bảng cửu chương hoặc chơi trò chơi trong lúc chờ kết nối lại nhé!
                  </p>
                  <button 
                    onClick={() => setActiveTab('table')}
                    className="px-8 py-4 bg-math-primary text-white font-bold rounded-2xl hover:bg-math-primary/90 transition-all shadow-lg"
                  >
                    Học Bảng Cửu Chương
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-4 mb-8 md:mb-12">
                    <h2 className="font-display text-3xl md:text-5xl text-gray-800">Bạn cần giải bài toán nào?</h2>
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
                      Nhập bài toán của bạn vào đây, mình sẽ giải thích thật dễ hiểu kèm theo hình ảnh minh họa nhé!
                    </p>
                  </div>

                  <div className="max-w-3xl mx-auto">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-math-primary to-math-secondary rounded-2xl md:rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden flex items-center p-1.5 md:p-2 border-2 border-gray-100">
                        <input
                          type="text"
                          value={problem}
                          onChange={(e) => setProblem(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
                          placeholder="Ví dụ: 15 + 27 bằng bao nhiêu?"
                          className="flex-1 px-4 md:px-6 py-3 md:py-4 text-lg md:text-xl outline-none placeholder:text-gray-300 min-w-0"
                        />
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageCapture}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading}
                            title="Chụp ảnh bài toán"
                            className="p-3 md:p-4 rounded-xl md:rounded-2xl text-gray-400 hover:text-math-secondary hover:bg-math-secondary/10 transition-all shrink-0"
                          >
                            <Camera className="w-5 h-5 md:w-6 md:h-6" />
                          </button>
                          <button
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e: any) => handleImageCapture(e);
                              input.click();
                            }}
                            disabled={loading}
                            title="Tải ảnh lên"
                            className="p-3 md:p-4 rounded-xl md:rounded-2xl text-gray-400 hover:text-math-primary hover:bg-math-primary/10 transition-all shrink-0"
                          >
                            <Upload className="w-5 h-5 md:w-6 md:h-6" />
                          </button>
                          <button
                            onClick={() => handleSolve()}
                            disabled={loading || !problem.trim()}
                            className="bg-math-primary text-white p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-math-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-math-primary/20 shrink-0"
                          >
                            {loading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <Send className="w-5 h-5 md:w-6 md:h-6" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {explanation && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 space-y-6"
                      >
                        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl border-2 border-gray-50 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-3 md:p-4">
                            <button 
                              onClick={() => handleSpeak(explanation)}
                              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-math-secondary/10 text-math-secondary flex items-center justify-center hover:bg-math-secondary hover:text-white transition-all"
                            >
                              {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
                            </button>
                          </div>
                          <div className="markdown-body prose prose-sm md:prose-lg max-w-none">
                            <ReactMarkdown>{explanation}</ReactMarkdown>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                      >
                        <div className="bg-white p-4 rounded-3xl shadow-xl border-2 border-gray-50">
                          <div className="aspect-square rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center relative group">
                            {illustration ? (
                              <img 
                                src={illustration} 
                                alt="Minh họa bài toán" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="text-center p-8 space-y-4">
                                <ImageIcon className="w-16 h-16 text-gray-200 mx-auto" />
                                <p className="text-gray-400 font-medium">Đang vẽ hình minh họa...</p>
                              </div>
                            )}
                          </div>
                          <p className="mt-4 text-sm text-gray-400 text-center italic">
                            Hình ảnh minh họa giúp bạn dễ hình dung hơn
                          </p>
                        </div>

                        <div className="bg-math-primary/5 p-6 rounded-3xl border-2 border-math-primary/10">
                          <h4 className="font-bold text-math-primary mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Bạn có biết?
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            Toán học không chỉ là những con số, nó là ngôn ngữ của vũ trụ đấy! Càng học bạn sẽ càng thấy thú vị.
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'table' && (
            <motion.div
              key="table"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="text-center space-y-4 mb-8 md:mb-12">
                <h2 className="font-display text-3xl md:text-5xl text-gray-800">Bảng Cửu Chương Thần Kỳ</h2>
                <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
                  Học bảng cửu chương chưa bao giờ dễ dàng đến thế với các mẹo ghi nhớ vui nhộn.
                </p>
              </div>
              <MultiplicationTable />
            </motion.div>
          )}

          {activeTab === 'practice' && (
            <motion.div
              key="practice"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-12"
            >
              <div className="text-center space-y-4 mb-8">
                <h2 className="font-display text-3xl md:text-5xl text-gray-800">Thử Thách Luyện Tập</h2>
                <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-4xl mx-auto">
                  {MATH_TOPICS.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-2",
                        selectedTopic === topic.id 
                          ? "bg-math-secondary border-math-secondary text-white shadow-md scale-105" 
                          : "bg-white border-gray-100 text-gray-400 hover:border-math-secondary/30 hover:text-math-secondary"
                      )}
                    >
                      <span>{topic.icon}</span>
                      <span>{topic.name}</span>
                    </button>
                  ))}
                </div>
                <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mt-6">
                  Ôn tập đa dạng kiến thức và thử thách tư duy logic với các bài đố vui hình ảnh!
                </p>
              </div>

              <div className="space-y-16">
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-math-secondary/10 flex items-center justify-center text-math-secondary">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-display text-gray-800">Bài Tập Tổng Hợp</h3>
                  </div>
                  <PracticeSection age={age} topicId={selectedTopic} />
                </section>

                <section className="pt-12 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-math-primary/10 flex items-center justify-center text-math-primary">
                      <Puzzle className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-display text-gray-800">Đố Vui Logic</h3>
                  </div>
                  <MathPuzzles initialAge={age} />
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'operations' && (
            <motion.div
              key="operations"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="text-center space-y-4 mb-8 md:mb-12">
                <h2 className="font-display text-3xl md:text-5xl text-gray-800">Luyện Tính Cộng Trừ</h2>
                <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
                  Rèn luyện kỹ năng tính toán nhanh nhẹn với các phép toán cộng và trừ theo phạm vi bé chọn.
                </p>
              </div>
              <OperationPractice />
            </motion.div>
          )}

          {activeTab === 'exams' && (
            <motion.div
              key="exams"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="text-center space-y-4 mb-8 md:mb-12">
                <h2 className="font-display text-3xl md:text-5xl text-gray-800">Ôn Thi Học Kì</h2>
                {activeTab === 'exams' && (
                  <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-4xl mx-auto">
                    {MATH_TOPICS.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic.id)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-2",
                          selectedTopic === topic.id 
                            ? "bg-math-primary border-math-primary text-white shadow-md scale-105" 
                            : "bg-white border-gray-100 text-gray-400 hover:border-math-primary/30 hover:text-math-primary"
                        )}
                      >
                        <span>{topic.icon}</span>
                        <span>{topic.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mt-6">
                  Tham gia các đề thi thử như trên lớp để tự tin hơn cho các kỳ thi thật nhé.
                </p>
              </div>
              <ExamPrepSection topicId={selectedTopic} age={age} />
            </motion.div>
          )}

          {activeTab === 'fun' && (
            <motion.div
              key="fun"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="text-center space-y-4 mb-8 md:mb-12">
                <h2 className="font-display text-3xl md:text-5xl text-gray-800">Trò Chơi Toán Học</h2>
                <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
                  Rèn luyện phản xạ và tư duy nhanh nhạy với các trò chơi vui nhộn!
                </p>
              </div>
              <MathGames />
            </motion.div>
          )}

          {activeTab === 'clock' && (
            <motion.div
              key="clock"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              <div className="text-center space-y-4 mb-8 md:mb-12">
                <h2 className="font-display text-3xl md:text-5xl text-gray-800">
                  {clockMode === 'lesson' ? 'Học Xem Giờ Thật Dễ' : 'Thử Thách Xem Giờ'}
                </h2>
                <div className="flex justify-center gap-4 mt-6">
                  <button 
                    onClick={() => setClockMode('lesson')}
                    className={cn(
                      "px-6 py-2 rounded-xl font-bold transition-all",
                      clockMode === 'lesson' ? "bg-math-primary text-white shadow-lg" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                  >
                    Bài Học
                  </button>
                  <button 
                    onClick={() => setClockMode('practice')}
                    className={cn(
                      "px-6 py-2 rounded-xl font-bold transition-all",
                      clockMode === 'practice' ? "bg-math-secondary text-white shadow-lg" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                  >
                    Luyện Tập
                  </button>
                </div>
              </div>
              
              {clockMode === 'lesson' ? <ClockLesson /> : <ClockPractice />}
            </motion.div>
          )}

          {activeTab === 'journey' && (
            <motion.div
              key="journey"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <LearningJourney />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 z-50 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)] overflow-x-auto no-scrollbar">
        {[
          { id: 'solve', label: 'Giải Toán', icon: Calculator },
          { id: 'operations', label: 'Tính Nhẩm', icon: Plus },
          { id: 'table', label: 'Nhân Chia', icon: BookOpen },
          { id: 'clock', label: 'Xem Giờ', icon: Clock },
          { id: 'practice', label: 'Luyện Tập', icon: GraduationCap },
          { id: 'exams', label: 'Thi Thử', icon: ClipboardList },
          { id: 'journey', label: 'Hành Trình', icon: TrendingUp },
          { id: 'fun', label: 'Game Vui', icon: Sparkles },
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all shrink-0",
              activeTab === tab.id 
                ? "text-math-primary" 
                : "text-gray-400"
            )}
          >
            <tab.icon className={cn("w-5 h-5", activeTab === tab.id && "animate-bounce-subtle")} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Audio Player (Hidden) */}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onEnded={() => setIsPlaying(false)}
          className="hidden" 
        />
      )}

      {/* Achievement Notification */}
      <AnimatePresence>
        {currentAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: '-50%' }}
            animate={{ opacity: 1, y: -100, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.5, x: '-50%' }}
            className="fixed bottom-0 left-1/2 z-[100] bg-white rounded-[32px] p-6 shadow-2xl border-4 border-math-primary flex items-center gap-6 min-w-[320px] md:min-w-[400px]"
          >
            <div className="w-16 h-16 bg-math-primary/10 rounded-2xl flex items-center justify-center text-math-primary shrink-0 animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>
            <div>
              <p className="text-xs font-black text-math-primary uppercase tracking-widest mb-1">Thành tựu mới!</p>
              <h4 className="text-xl font-display font-bold text-gray-800">{currentAchievement.title}</h4>
              <p className="text-sm text-gray-500">{currentAchievement.description}</p>
            </div>
            <div className="absolute -top-4 -right-4 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-spin-slow">
              <StarIcon className="w-6 h-6 text-white fill-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
