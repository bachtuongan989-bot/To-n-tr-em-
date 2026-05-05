/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  GraduationCap,
  ChevronRight,
  Play,
  Pause,
  WifiOff,
  Wifi,
  Clock,
  Home,
  Plus,
  XCircle,
  Trophy,
  Star as StarIcon,
  Medal,
  Award,
  ClipboardList
} from 'lucide-react';
import { mathService, MATH_TOPICS } from './services/mathService';
import { RewardService, Achievement } from './services/rewardService';
import { MultiplicationTable } from './components/MultiplicationTable';
import { PracticeSection } from './components/PracticeSection';
import { MathGames } from './components/MathGames';
import { ClockLesson } from './components/ClockLesson';
import { ClockPractice } from './components/ClockPractice';
import { CalendarLesson } from './components/CalendarLesson';
import { WelcomeSection } from './components/WelcomeSection';
import { OperationPractice } from './components/OperationPractice';
import { MockExam } from './components/MockExam';
import { SettingsModal } from './components/SettingsModal';
import { SettingsService } from './services/settingsService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'intro' | 'table' | 'practice' | 'clock' | 'fun' | 'operations' | 'exam'>('intro');
  const [clockMode, setClockMode] = useState<'lesson' | 'practice' | 'calendar'>('lesson');
  const [age, setAge] = useState(7);
  const [selectedTopic, setSelectedTopic] = useState('general');
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState(RewardService.getStars());
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSettings, setShowSettings] = useState(false);
  const [userSettings, setUserSettings] = useState(SettingsService.getSettings());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    SettingsService.applyTheme(userSettings.theme);
  }, []);

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
            <button 
              onClick={() => setShowSettings(true)}
              className="w-10 h-10 md:w-12 md:h-12 math-gradient rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg relative group transition-transform hover:scale-105 active:scale-95"
            >
              <span className="text-2xl md:text-3xl">{userSettings.avatar}</span>
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                <Plus className="w-3 h-3 text-math-primary" />
              </div>
            </button>
            <div>
              <h1 className="font-display text-xl md:text-2xl text-math-primary leading-none">Math of Bơ</h1>
              <p className="hidden md:block text-xs text-gray-500 font-medium tracking-wide uppercase mt-1">Học Toán Vui Vẻ</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-gray-100 p-1 rounded-2xl">
            {[
              { id: 'operations', label: 'Cộng Trừ', icon: Plus },
              { id: 'table', label: 'Nhân Chia', icon: BookOpen },
              { id: 'clock', label: 'Xem Giờ', icon: Clock },
              { id: 'exam', label: 'Luyện Đề', icon: ClipboardList },
              { id: 'practice', label: 'Luyện Tập', icon: GraduationCap },
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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-math-secondary/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-math-secondary/20 group relative overflow-hidden transition-all hover:bg-math-secondary/20">
              <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-math-secondary" />
              <select 
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="font-bold text-sm md:text-base text-math-secondary bg-transparent outline-none cursor-pointer appearance-none pr-4"
              >
                {[...Array(4)].map((_, i) => {
                  const val = i + 7;
                  return <option key={val} value={val}>{val} Tuổi</option>;
                })}
              </select>
              <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-math-secondary">
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4 rotate-90" />
              </div>
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
              <WelcomeSection 
                age={age}
                onStart={(tab) => {
                  setActiveTab(tab);
                }} 
              />
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
              <MultiplicationTable age={age} />
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
                  {MATH_TOPICS.filter(t => (!t.minAge || age >= t.minAge) && (!t.maxAge || age <= t.maxAge)).map(topic => (
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
                  Ôn tập đa dạng kiến thức chuyên sâu cho từng chủ đề bé đã chọn!
                </p>
              </div>

              <div className="space-y-16">
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-math-secondary/10 flex items-center justify-center text-math-secondary">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-display text-gray-800">Bài Tập "{MATH_TOPICS.find(t => t.id === selectedTopic)?.name}"</h3>
                  </div>
                  <PracticeSection age={age} topicId={selectedTopic} />
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
              <OperationPractice age={age} />
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
              <MathGames age={age} />
            </motion.div>
          )}

          {activeTab === 'exam' && (
            <motion.div
              key="exam"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <MockExam age={age} />
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
                  {clockMode === 'lesson' ? 'Học Xem Giờ Thật Dễ' : clockMode === 'practice' ? 'Thử Thách Xem Giờ' : 'Học Xem Lịch'}
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
                  {age >= 7 && age <= 8 && (
                    <button 
                      onClick={() => setClockMode('calendar')}
                      className={cn(
                        "px-6 py-2 rounded-xl font-bold transition-all",
                        clockMode === 'calendar' ? "bg-purple-500 text-white shadow-lg" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      )}
                    >
                      Xem Lịch
                    </button>
                  )}
                </div>
              </div>
              
              {clockMode === 'lesson' ? <ClockLesson /> : clockMode === 'practice' ? <ClockPractice /> : <CalendarLesson />}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 z-50 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)] overflow-x-auto no-scrollbar">
        {[
          { id: 'operations', label: 'Tính Nhẩm', icon: Plus },
          { id: 'table', label: 'Nhân Chia', icon: BookOpen },
          { id: 'clock', label: 'Xem Giờ', icon: Clock },
          { id: 'exam', label: 'Luyện Đề', icon: ClipboardList },
          { id: 'practice', label: 'Luyện Tập', icon: GraduationCap },
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

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
