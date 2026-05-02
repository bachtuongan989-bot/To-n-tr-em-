import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, BookOpen, Target, TrendingUp, Award, Clock } from 'lucide-react';
import { ProgressService } from '../services/progressService';
import { MATH_TOPICS } from '../services/mathService';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LearningJourney: React.FC = () => {
  const progress = ProgressService.getProgress();

  const examData = useMemo(() => {
    return progress.examScores.slice(-7).map((e, i) => ({
      name: i + 1,
      score: e.score,
      topic: MATH_TOPICS.find(t => t.id === e.topic)?.name || 'Tổng hợp'
    }));
  }, [progress.examScores]);

  const topicCompletionData = useMemo(() => {
    return MATH_TOPICS.map(topic => {
      const isCompleted = progress.completedTopics.includes(topic.id);
      return {
        name: topic.name,
        completed: isCompleted ? 100 : 0
      };
    });
  }, [progress.completedTopics]);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="font-display text-4xl text-gray-800">Hành Trình Học Tập</h2>
        <p className="text-gray-500 text-lg">Cùng nhìn lại những nỗ lực và thành quả của bé nhé!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-math-primary/10 flex items-center gap-4">
          <div className="w-14 h-14 bg-math-primary/10 rounded-2xl flex items-center justify-center text-math-primary">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase">Chủ đề hoàn thành</p>
            <p className="text-3xl font-black text-gray-800">{progress.completedTopics.length}/{MATH_TOPICS.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-math-secondary/10 flex items-center gap-4">
          <div className="w-14 h-14 bg-math-secondary/10 rounded-2xl flex items-center justify-center text-math-secondary">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase">Bài thi đã làm</p>
            <p className="text-3xl font-black text-gray-800">{progress.examScores.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-math-accent/30 flex items-center gap-4">
          <div className="w-14 h-14 bg-math-accent/20 rounded-2xl flex items-center justify-center text-orange-500">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase">Luyện tập</p>
            <p className="text-3xl font-black text-gray-800">{progress.practiceStats.length} lần</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Trend */}
        <div className="bg-white p-8 rounded-[40px] shadow-xl border-2 border-gray-50 space-y-6">
          <h3 className="font-display text-2xl text-gray-800 flex items-center gap-3">
            <Target className="w-6 h-6 text-math-primary" />
            Biểu Đồ Điểm Thi (7 bài gần nhất)
          </h3>
          <div className="h-[300px] w-full">
            {examData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={examData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" label={{ value: 'Bài thi', position: 'insideBottom', offset: -10 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value: number, name: string, props: any) => [`${value} điểm`, `Chủ đề: ${props.payload.topic}`]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#FF6B6B" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#FF6B6B', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic">
                Chưa có dữ liệu bài thi. Hãy thử sức ngay nào!
              </div>
            )}
          </div>
        </div>

        {/* Topics Progress */}
        <div className="bg-white p-8 rounded-[40px] shadow-xl border-2 border-gray-50 space-y-6">
          <h3 className="font-display text-2xl text-gray-800 flex items-center gap-3">
            <Award className="w-6 h-6 text-math-secondary" />
            Tiến Độ Theo Chủ Đề
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {MATH_TOPICS.map(topic => {
              const isCompleted = progress.completedTopics.includes(topic.id);
              const stats = progress.practiceStats.filter(s => s.topic === topic.id);
              const totalCorrect = stats.reduce((acc, s) => acc + s.correct, 0);
              const totalQuestions = stats.reduce((acc, s) => acc + s.total, 0);
              const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

              return (
                <div key={topic.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{topic.icon}</span>
                    <div>
                      <p className="font-bold text-gray-700">{topic.name}</p>
                      <p className="text-xs text-gray-400">Độ chính xác: {accuracy}%</p>
                    </div>
                  </div>
                  {isCompleted ? (
                    <div className="flex items-center gap-1.5 text-green-500 font-bold text-sm bg-green-50 px-3 py-1 rounded-full border border-green-100">
                      <Star className="w-4 h-4 fill-green-500" />
                      Hoàn thành
                    </div>
                  ) : accuracy > 0 ? (
                    <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-math-secondary h-full" 
                        style={{ width: `${accuracy}%` }} 
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300 italic">Chưa luyện tập</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Areas needing practice */}
      <div className="bg-white p-8 rounded-[40px] shadow-xl border-2 border-gray-50">
        <h3 className="font-display text-2xl text-gray-800 mb-6 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-math-accent" />
          Kế Hoạch Học Tập & Lời Khuyên
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MATH_TOPICS.map(topic => {
            const stats = progress.practiceStats.filter(s => s.topic === topic.id);
            const totalCorrect = stats.reduce((acc, s) => acc + s.correct, 0);
            const totalQuestions = stats.reduce((acc, s) => acc + s.total, 0);
            const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : null;
            const isCompleted = progress.completedTopics.includes(topic.id);
            
            // Show if not completed OR if accuracy is low
            if (isCompleted && (accuracy === null || accuracy >= 70)) return null;

            return (
              <div key={topic.id} className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group",
                accuracy !== null && accuracy < 60 
                  ? "border-red-100 bg-red-50/30 hover:border-red-200" 
                  : "border-dashed border-gray-200 hover:border-math-primary/30"
              )}>
                <div className={cn(
                  "text-3xl transition-all",
                  accuracy !== null && accuracy < 60 ? "grayscale-0" : "grayscale group-hover:grayscale-0"
                )}>
                  {topic.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-700">{topic.name}</p>
                  <p className="text-xs text-gray-500">
                    {accuracy !== null && accuracy < 60 
                      ? "Bé cần ôn lại phần này nhiều hơn một chút nhé!" 
                      : "Chủ đề thú vị đang chờ bé khám phá đấy!"}
                  </p>
                </div>
                {accuracy !== null && accuracy < 60 && (
                  <div className="text-red-500 bg-white p-2 rounded-lg shadow-sm">
                    <Target className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          }).filter(Boolean).slice(0, 4)}
          {progress.completedTopics.length === MATH_TOPICS.length && (
            <div className="col-span-full py-8 text-center space-y-4">
              <Trophy className="w-16 h-16 text-orange-500 mx-auto" />
              <p className="text-xl font-bold text-gray-600">Chúc mừng! Bé đã chinh phục tất cả các thử thách!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
