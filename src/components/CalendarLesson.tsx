import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

const LESSON_STEPS = [
  {
    title: 'Một tuần có bao nhiêu ngày?',
    content: 'Một tuần lễ có 7 ngày:\nThứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6, Thứ 7 và Chủ Nhật.',
    interactive: 'week'
  },
  {
    title: 'Một tháng có bao nhiêu ngày?',
    content: 'Một tháng có thể có 30 hoặc 31 ngày. Riêng tháng 2 chỉ có 28 hoặc 29 ngày!',
    interactive: 'month'
  },
  {
    title: 'Cùng xem lịch cả năm nhé!',
    content: 'Đây là lịch rực rỡ của cả năm.\nCột dọc (màu xanh/đỏ) chỉ các ngày trong tuần (Thứ).\nHàng ngang (màu cam) là các Tuần trong tháng.',
    interactive: 'full_calendar'
  },
  {
    title: 'Cùng làm quen với Lịch Âm!',
    content: 'Trên tờ lịch thường có hai loại ngày: ngày Dương lịch để tính lịch đi học, đi làm, và ngày Âm lịch để xem ngày lễ Tết truyền thống (như Tết Trung Thu, Tết Nguyên Đán).',
    interactive: 'lunar'
  },
  {
    title: 'Thực hành xem lịch',
    content: 'Bé hãy đọc kỹ câu hỏi và tính nhẩm rồi chọn đáp án hoặc nhấn vào ngày đúng trên lịch nhé!',
    interactive: 'practice'
  }
];

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  return { startOffset, daysInMonth };
}

interface CalendarQuestion {
  id: string;
  type: 'calculate_days' | 'select_date';
  text: string;
  today?: number;
  targetDates?: number[];
  options?: number[];
  correctAnswer: number | number[]; 
  explanation: string;
}

const PRACTICE_QUESTIONS: CalendarQuestion[] = [
  {
    id: 'pq1',
    type: 'calculate_days',
    text: 'Hôm nay là ngày 13, sinh nhật mẹ là ngày 19. Hỏi còn bao nhiêu ngày nữa là đến sinh nhật mẹ?',
    today: 13,
    targetDates: [19],
    options: [5, 6, 7],
    correctAnswer: 6,
    explanation: 'Từ ngày 13 đến ngày 19 đếm thêm 6 ngày nữa (19 - 13 = 6). Chúc mừng bé!'
  },
  {
    id: 'pq2',
    type: 'calculate_days',
    text: 'Hôm nay là ngày 8. Đúng 1 tuần sau trường bé tổ chức đi dã ngoại. Hỏi buổi dã ngoại vào ngày mấy?',
    today: 8,
    options: [14, 15, 16],
    correctAnswer: 15,
    explanation: 'Đúng 1 tuần sau thì cộng thêm 7 ngày. 8 + 7 = 15. Đó là ngày 15!'
  },
  {
    id: 'pq3',
    type: 'calculate_days',
    text: 'Bé mượn sách thư viện, phải trả vào ngày 27. Hôm nay là ngày 24, bé còn mấy ngày nữa để đọc?',
    today: 24,
    targetDates: [27],
    options: [2, 3, 4],
    correctAnswer: 3,
    explanation: 'Từ ngày 24 thêm 3 ngày nữa là đến ngày 27 (27 - 24 = 3). Đúng rồi!'
  },
  {
    id: 'pq4',
    type: 'calculate_days',
    text: 'Ngày đầu tiên của tháng là thứ Tư (ngày 1). Hỏi thứ Tư tuần sau là ngày mấy?',
    options: [6, 7, 8],
    correctAnswer: 8,
    explanation: 'Một tuần có 7 ngày. Ta lấy 1 + 7 = 8. Đó là ngày 8. Chúc mừng bé!'
  }
];

const DAYS_OF_WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const CalendarLesson: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(3);
  
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceStatus, setPracticeStatus] = useState<null | 'correct' | 'wrong'>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const monthData = getMonthData(2024, selectedMonth);
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];
  for (let i = 0; i < monthData.startOffset; i++) {
    currentWeek.push(null);
  }
  for (let d = 1; d <= monthData.daysInMonth; d++) {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  React.useEffect(() => {
    if (LESSON_STEPS[currentStep].interactive === 'practice') {
      setSelectedMonth(3);
    }
  }, [currentStep]);

  const handleNextPractice = () => {
    if (practiceIndex < PRACTICE_QUESTIONS.length - 1) {
      setPracticeIndex(prev => prev + 1);
      setPracticeStatus(null);
      setSelectedOption(null);
      setSelectedDay(null);
    } else {
      confetti({ particleCount: 200, spread: 160, origin: { y: 0.6 } });
    }
  };

  const handleNext = () => {
    if (currentStep < LESSON_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedDay(null);
      setPracticeStatus(null);
      setSelectedOption(null);
    } else {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setSelectedDay(null);
      setPracticeStatus(null);
      setSelectedOption(null);
    }
  };

  const handleDayClick = (day: number) => {
    // Only used for interactive calendar steps if added in future
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-purple-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-display font-bold text-gray-800">
            {LESSON_STEPS[currentStep].title}
          </h3>
        </div>

        <p className="text-lg text-gray-600 mb-8 whitespace-pre-line">
          {LESSON_STEPS[currentStep].content}
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-100 mb-8 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {LESSON_STEPS[currentStep].interactive === 'week' && (
              <motion.div
                key="week"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-wrap justify-center gap-4"
              >
                {DAYS_OF_WEEK.map((day, i) => (
                  <motion.div
                    key={day}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold font-display shadow-sm",
                      day === 'CN' ? "bg-red-100 text-red-600" : "bg-white text-gray-700"
                    )}
                  >
                    {day}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {LESSON_STEPS[currentStep].interactive === 'month' && (
              <motion.div
                key="month"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-center gap-8"
              >
                <div className="text-center">
                  <div className="text-5xl font-black text-purple-600 mb-2">30</div>
                  <div className="text-gray-500 font-medium">Tháng 4, 6, 9, 11</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black text-pink-600 mb-2">31</div>
                  <div className="text-gray-500 font-medium">Tháng 1, 3, 5, 7, 8, 10, 12</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-orange-500 mb-2">28/29</div>
                  <div className="text-gray-500 font-medium">Tháng 2</div>
                </div>
              </motion.div>
            )}

            {(LESSON_STEPS[currentStep].interactive === 'full_calendar' || LESSON_STEPS[currentStep].interactive === 'practice') && (
              <motion.div
                key="interactive-calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-4xl mx-auto"
              >
                {LESSON_STEPS[currentStep].interactive === 'practice' && (
                   <div className="mb-6 p-4 md:p-6 bg-purple-50 rounded-2xl border-2 border-purple-200">
                     <h4 className="text-xl font-bold text-gray-800 mb-4">{PRACTICE_QUESTIONS[practiceIndex].text}</h4>
                     
                     {PRACTICE_QUESTIONS[practiceIndex].type === 'calculate_days' && (
                       <div className="flex gap-4 justify-center">
                         {PRACTICE_QUESTIONS[practiceIndex].options?.map(opt => (
                           <button 
                             key={opt}
                             onClick={() => {
                                if (practiceStatus === 'correct') return;
                                setSelectedOption(opt);
                                if (opt === PRACTICE_QUESTIONS[practiceIndex].correctAnswer) {
                                  setPracticeStatus('correct');
                                  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                                } else {
                                  setPracticeStatus('wrong');
                                }
                             }}
                             className={cn(
                               "w-16 h-16 rounded-xl font-bold text-2xl transition-all shadow-sm border-2",
                               selectedOption === opt 
                                 ? (opt === PRACTICE_QUESTIONS[practiceIndex].correctAnswer ? "bg-green-500 text-white border-green-500" : "bg-red-500 text-white border-red-500")
                                 : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
                             )}
                           >
                             {opt}
                           </button>
                         ))}
                       </div>
                     )}

                     {practiceStatus && (
                       <motion.div
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className={cn(
                           "mt-4 p-4 rounded-xl text-center font-medium",
                           practiceStatus === 'correct' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                         )}
                       >
                         {practiceStatus === 'correct' ? PRACTICE_QUESTIONS[practiceIndex].explanation : "Chưa đúng rồi bé ơi, bé thử nghĩ lại xem nhé!"}
                       </motion.div>
                     )}

                     {practiceStatus === 'correct' && (
                        <div className="mt-4 flex justify-center">
                          <button 
                            onClick={handleNextPractice}
                            className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition"
                          >
                            {practiceIndex < PRACTICE_QUESTIONS.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài tập!'}
                            <ChevronRight className="w-5 h-5"/>
                          </button>
                        </div>
                     )}
                   </div>
                )}

                {LESSON_STEPS[currentStep].interactive === 'full_calendar' && (
                  <div className="overflow-x-auto pb-4">
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {[...Array(12)].map((_, i) => (
                        <button 
                          key={i}
                          onClick={() => setSelectedMonth(i + 1)}
                          className={cn(
                            "px-4 py-2 rounded-xl font-bold transition-all",
                            selectedMonth === i + 1 
                              ? "bg-purple-600 text-white shadow-md transform scale-105" 
                              : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                          )}
                        >
                          Tháng {i + 1}
                        </button>
                      ))}
                    </div>

                    <div className="min-w-[600px] grid grid-cols-[100px_repeat(7,_minmax(0,_1fr))] gap-2">
                      <div className="bg-gray-100 rounded-xl flex flex-col items-center justify-center font-bold text-gray-500 text-sm">
                        <span>Tuần \ Thứ</span>
                      </div>
                      {DAYS_OF_WEEK.map((day, idx) => (
                        <div key={day} className={cn(
                          "py-3 rounded-xl text-center font-bold text-lg",
                          idx >= 5 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700" 
                        )}>
                          {day}
                        </div>
                      ))}

                      {weeks.map((week, wIdx) => (
                        <React.Fragment key={wIdx}>
                          <div className="bg-orange-100 text-orange-700 rounded-xl flex flex-col items-center justify-center font-bold px-2 text-center text-sm md:text-base">
                            Tuần {wIdx + 1}
                          </div>
                          {week.map((day, dIdx) => {
                            const isWeekend = dIdx >= 5;

                            let btnClass = "bg-white border-2 border-transparent text-gray-700 shadow-sm";
                            if (!day) btnClass = "bg-transparent shadow-none";
                            else {
                              if (isWeekend) btnClass = "bg-white text-red-500 shadow-sm border-gray-100 hover:bg-red-50";
                              else btnClass = "bg-white shadow-sm border-gray-100 hover:bg-blue-50";
                            }

                            return (
                              <div 
                                key={dIdx}
                                className={cn(
                                  "aspect-square rounded-xl flex items-center justify-center font-bold text-xl transition-all",
                                  btnClass
                                )}
                              >
                                {day || ""}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {LESSON_STEPS[currentStep].interactive === 'lunar' && (
              <motion.div
                key="lunar"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-2xl mx-auto flex flex-col md:flex-row gap-8 items-center justify-center p-6 bg-orange-50 rounded-3xl border-2 border-orange-200"
              >
                <div className="w-48 h-56 bg-white rounded-2xl shadow-xl border-t-8 border-red-500 flex flex-col items-center justify-start p-4 relative shrink-0">
                  <div className="text-gray-500 font-bold mb-2">Tháng 8</div>
                  <div className="text-6xl font-black text-gray-800 mb-4">15</div>
                  <div className="text-gray-400 font-medium text-sm">Thứ Hai</div>
                  <div className="absolute bottom-4 right-4 text-orange-500 font-bold flex flex-col items-end">
                    <span className="text-xs">Âm lịch</span>
                    <span className="text-2xl">1</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                    <p className="font-bold text-gray-800 mb-1 text-lg">Dương lịch (Số lớn)</p>
                    <p className="text-gray-600 text-sm">Dùng để xem ngày đi học, đi làm và các thứ trong tuần.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 border-l-4 border-l-orange-500">
                    <p className="font-bold text-orange-600 mb-1 text-lg">Âm lịch (Số nhỏ nhắn)</p>
                    <p className="text-gray-600 text-sm">Thời xưa ông cha ta dùng Lịch Âm theo Mặt Trăng. Lịch Âm dùng để tính các dịp lễ Tết, Rằm... nằm ở góc dưới bên phải đó bé!</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold disabled:opacity-50 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Trước
          </button>
          
          <div className="flex gap-2">
            {LESSON_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  currentStep === i ? "bg-purple-600 scale-125" : "bg-purple-200"
                )}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={LESSON_STEPS[currentStep].interactive === 'practice' && practiceIndex < PRACTICE_QUESTIONS.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
          >
            {currentStep === LESSON_STEPS.length - 1 ? 'Hoàn thành' : 'Tiếp theo'} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
