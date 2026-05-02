import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Clock, Info, ArrowRight, Star, Sparkles, Volume2, Pointer, Lock, Unlock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ClockLesson: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [manualTime, setManualTime] = useState({ hour: 10, minute: 10, second: 0 });
  const [mode, setMode] = useState<'watch' | 'learn'>('watch');
  const clockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'watch') {
      const timer = setInterval(() => {
        setTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode]);

  const displayTime = mode === 'watch' 
    ? { hour: time.getHours(), minute: time.getMinutes(), second: time.getSeconds() }
    : manualTime;

  const hourDegrees = (displayTime.hour % 12) * 30 + displayTime.minute * 0.5;
  const minuteDegrees = displayTime.minute * 6;
  const secondDegrees = displayTime.second * 6;

  const handleDrag = (event: any, info: any, type: 'hour' | 'minute') => {
    if (!clockRef.current) return;
    
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle from center to pointer
    const angleRad = Math.atan2(info.point.y - centerY, info.point.x - centerX);
    let angleDeg = (angleRad * 180) / Math.PI + 90;
    if (angleDeg < 0) angleDeg += 360;

    if (type === 'minute') {
      const minute = Math.round(angleDeg / 6) % 60;
      setManualTime(prev => ({ ...prev, minute }));
    } else {
      const hour = Math.round(angleDeg / 30) % 12;
      setManualTime(prev => ({ ...prev, hour: hour === 0 ? 12 : hour }));
    }
  };

  const hands = [
    { 
      id: 'hour', 
      label: 'Kim Giờ', 
      desc: 'Ngắn nhất và mập nhất. Kim này chạy chậm nhất để chỉ Giờ.', 
      color: 'bg-math-primary',
      degrees: hourDegrees,
      width: 'w-2.5',
      height: 'h-16',
      tip: 'Chỉ số nào là đang ở giờ đó!'
    },
    { 
      id: 'minute', 
      label: 'Kim Phút', 
      desc: 'Dài hơn kim giờ. Kim này chỉ Phút, mỗi số lớn tương ứng với 5 phút.', 
      color: 'bg-math-secondary',
      degrees: minuteDegrees,
      width: 'w-2',
      height: 'h-24',
      tip: 'Số 1 là 5 phút, Số 2 là 10 phút...'
    },
    { 
      id: 'second', 
      label: 'Kim Giây', 
      desc: 'Mỏng nhất và chạy nhanh nhất. Kim này chỉ Giây, đếm từng nhịp tắc kè.', 
      color: 'bg-amber-400',
      degrees: secondDegrees,
      width: 'w-1',
      height: 'h-28',
      tip: 'Chạy một vòng là được 1 phút đó!'
    }
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Clock Visualization */}
        <div className="flex flex-col items-center justify-center space-y-8">
          <div ref={clockRef} className="relative w-72 h-72 md:w-96 md:h-96">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-[12px] border-white shadow-2xl bg-white flex items-center justify-center">
              {/* Clock Face */}
              <div className="relative w-full h-full rounded-full bg-gray-50/50 border border-gray-100 p-4">
                {/* Numbers */}
                {[...Array(12)].map((_, i) => {
                  const angle = (i + 1) * 30;
                  const x = 50 + 40 * Math.sin((angle * Math.PI) / 180);
                  const y = 50 - 40 * Math.cos((angle * Math.PI) / 180);
                  return (
                    <div 
                      key={i} 
                      className="absolute font-display text-xl md:text-2xl font-bold text-gray-700 select-none"
                      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      {i + 1}
                    </div>
                  );
                })}

                {/* Ticks */}
                {[...Array(60)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute inset-0 pointer-events-none"
                    style={{ transform: `rotate(${i * 6}deg)` }}
                  >
                    <div className={cn(
                      "mx-auto rounded-full",
                      i % 5 === 0 ? "w-1 h-4 bg-gray-300" : "w-0.5 h-2 bg-gray-200"
                    )} />
                  </div>
                ))}

                {/* Center Point */}
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-gray-800 rounded-full -translate-x-1/2 -translate-y-1/2 z-50 shadow-md" />

                {/* Hands */}
                {hands.map((hand, idx) => (
                  <motion.div
                    key={hand.id}
                    drag={mode === 'learn' && hand.id !== 'second'}
                    dragConstraints={clockRef}
                    onDrag={(e, info) => hand.id !== 'second' && handleDrag(e, info, hand.id as any)}
                    dragElastic={0}
                    dragMomentum={false}
                    whileTap={mode === 'learn' ? { scale: 1.1 } : {}}
                    className={cn(
                      "absolute left-1/2 bottom-1/2 rounded-full origin-bottom",
                      mode === 'learn' ? "cursor-grab active:cursor-grabbing" : "cursor-default",
                      hand.color,
                      hand.width
                    )}
                    style={{ 
                      height: hand.height === 'h-16' ? '25%' : hand.height === 'h-24' ? '35%' : '42%',
                      zIndex: 10 + idx,
                      x: '-50%'
                    }}
                    animate={{ rotate: hand.degrees }}
                    transition={mode === 'watch' && hand.id === 'second' ? { type: 'spring', damping: 12, stiffness: 200 } : { type: 'spring', damping: 20, stiffness: 300 }}
                  >
                    {/* Invisible touch target area for easier dragging */}
                    {mode === 'learn' && hand.id !== 'second' && (
                      <div className="absolute -inset-x-4 -top-8 h-[calc(100%+32px)] opacity-0" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Glowing effect around the clock */}
            <div className="absolute -inset-4 math-gradient opacity-10 rounded-full blur-3xl -z-10" />
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setMode('watch')}
              className={cn(
                "px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2",
                mode === 'watch' ? "bg-math-primary text-white shadow-lg" : "bg-white text-gray-500 border border-gray-100 shadow-sm"
              )}
            >
              <Clock className="w-4 h-4" />
              Giờ Hệ Thống
            </button>
            <button 
              onClick={() => setMode('learn')}
              className={cn(
                "px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2",
                mode === 'learn' ? "bg-math-secondary text-white shadow-lg" : "bg-white text-gray-500 border border-gray-100 shadow-sm"
              )}
            >
              <Pointer className="w-4 h-4" />
              Tự Chỉnh Giờ
            </button>
          </div>

          {mode === 'learn' && (
            <div className={cn(
              "w-full max-w-sm space-y-4 bg-white p-6 rounded-2xl shadow-xl border-2 border-math-secondary/20 transition-colors animate-in fade-in slide-in-from-bottom-4"
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">Bảng điều khiển</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-math-secondary uppercase">Đang ở chế độ đố vui</span>
                  </div>
                </div>
              </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold text-math-primary uppercase">
                    <span>Di chuyển kim giờ</span>
                    <span className="text-math-primary">{manualTime.hour} giờ</span>
                  </div>
                  <div className="relative pt-1 px-1">
                    <input 
                      type="range" min="1" max="12" step="1" value={manualTime.hour} 
                      onChange={(e) => setManualTime({...manualTime, hour: parseInt(e.target.value)})}
                      className="w-full accent-math-primary h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between px-1 mt-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                        <div key={h} className="flex flex-col items-center">
                          <div className={cn("w-0.5 h-1.5 rounded-full mb-1", manualTime.hour === h ? "bg-math-primary" : "bg-gray-200")} />
                          <span className={cn("text-[8px] font-bold", manualTime.hour === h ? "text-math-primary" : "text-gray-300")}>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold text-math-secondary uppercase">
                    <span>Di chuyển kim phút</span>
                    <span className="text-math-secondary">{manualTime.minute} phút</span>
                  </div>
                  <div className="relative pt-1 px-1">
                    <input 
                      type="range" min="0" max="55" step="5" value={Math.floor(manualTime.minute / 5) * 5} 
                      onChange={(e) => setManualTime({...manualTime, minute: parseInt(e.target.value)})}
                      className="w-full accent-math-secondary h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between px-1 mt-1">
                      {[0, 10, 20, 30, 40, 50].map(m => (
                        <div key={m} className="flex flex-col items-center">
                          <div className={cn("w-0.5 h-1.5 rounded-full mb-1", manualTime.minute >= m && manualTime.minute < m + 10 ? "bg-math-secondary" : "bg-gray-200")} />
                          <span className={cn("text-[8px] font-bold", manualTime.minute >= m && manualTime.minute < m + 10 ? "text-math-secondary" : "text-gray-300")}>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              <p className="text-[10px] text-gray-400 text-center italic mt-4">
                Bé hãy chỉnh kim đồng hồ theo yêu cầu của bố mẹ, thầy cô nhé!
              </p>
            </div>
          )}
        </div>

        {/* Lesson Details */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-gray-50 space-y-8">
            <div className="flex items-center gap-3 text-math-primary">
              <div className="w-10 h-10 rounded-xl bg-math-primary/10 flex items-center justify-center">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl">Bí quyết xem giờ dễ nhất</h3>
            </div>

            <div className="space-y-6">
              {hands.map((hand) => (
                <div key={hand.id} className="flex gap-4 group">
                  <div className={cn("w-1 mx-2 rounded-full transition-all group-hover:scale-y-110", hand.color)} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg text-gray-800">{hand.label}</h4>
                      <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white", hand.color)}>
                        {hand.id === 'hour' ? 'Chậm' : hand.id === 'minute' ? 'Vừa' : 'Nhanh'}
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{hand.desc}</p>
                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-center gap-2 mt-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <p className="text-xs font-bold text-gray-600">{hand.tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-math-primary" />
                Mẹo nhỏ cho bé:
              </h4>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 font-bold text-[10px]">1</div>
                  <span>Kim ngắn chỉ vào đâu, đọc số đó (Giờ).</span>
                </li>
                <li className="flex gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-[10px]">2</div>
                  <span>Kim dài chỉ vào số nào, lấy số đó <strong>nhân 5</strong> (Phút).</span>
                </li>
                <li className="flex gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-[10px]">3</div>
                  <span>Kim dài nhất chạy xong 1 vòng là bé được thêm 1 phút!</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-math-secondary/10 p-6 rounded-3xl border-2 border-math-secondary/20 flex items-center gap-4 animate-pulse-soft">
            <div className="w-12 h-12 rounded-full bg-math-secondary text-white flex items-center justify-center shadow-lg shrink-0">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="font-bold text-math-secondary">Bé hãy thử chỉnh giờ xem!</p>
              <p className="text-sm text-gray-600">Dùng tay kéo kim hoặc dùng thanh trượt để luyện tập nhé.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
