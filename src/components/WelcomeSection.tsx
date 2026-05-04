import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Clock, 
  Puzzle, 
  Plus,
  BookOpen,
  Gamepad2, 
  GraduationCap, 
  Heart,
  ChevronRight,
  BrainCircuit,
  ClipboardList
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, color, onClick }) => (
  <motion.button
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex flex-col items-start p-6 bg-white rounded-3xl shadow-lg border-2 border-transparent hover:border-math-primary/20 transition-all text-left group"
  >
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-inner", color)}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="font-display text-xl text-gray-800 mb-2 group-hover:text-math-primary transition-colors">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed flex-grow">{description}</p>
    <div className="mt-4 flex items-center gap-1 text-math-primary font-bold text-sm">
      Khám phá ngay <ChevronRight className="w-4 h-4" />
    </div>
  </motion.button>
);

interface WelcomeSectionProps {
  onStart: (tab: any) => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps & { age?: number }> = ({ onStart, age = 7 }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-10 md:py-20 relative overflow-hidden">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 md:w-32 md:h-32 math-gradient rounded-[32px] md:rounded-[40px] flex items-center justify-center text-white shadow-2xl mx-auto"
        >
          <BrainCircuit className="w-12 h-12 md:w-16 md:h-16" />
        </motion.div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-7xl text-gray-800 leading-tight"
          >
            Chào mừng bé đến với <br />
            <span className="text-math-primary">Math of Bơ!</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-2xl text-gray-500 max-w-2xl mx-auto font-medium"
          >
            Người bạn đồng hành thông minh giúp bé chinh phục thế giới Toán học thật vui vẻ và dễ dàng.
          </motion.p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button 
            onClick={() => onStart('practice')}
            className="px-10 py-5 bg-math-primary text-white font-black rounded-3xl shadow-xl shadow-math-primary/30 hover:scale-105 active:scale-95 transition-all text-xl flex items-center gap-3"
          >
            HỌC NGAY THÔI <Sparkles className="w-6 h-6" />
          </button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="space-y-10 px-4">
        <div className="text-center space-y-2">
          <h2 className="font-display text-3xl text-gray-800">Bé có thể làm gì nhỉ?</h2>
          <p className="text-gray-500">Khám phá các tính năng thú vị được thiết kế riêng cho bé</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Plus}
            color="bg-indigo-500"
            title="Cộng Trừ Siêu Tốc"
            description="Rèn luyện kỹ năng tính nhẩm cộng và trừ trong nhiều phạm vi khác nhau với các bài tập sinh động."
            onClick={() => onStart('operations')}
          />
          <FeatureCard 
            icon={BookOpen}
            color="bg-orange-400"
            title="Bảng Nhân Chia"
            description="Làm chủ bảng cửu chương nháy mắt bằng các mẹo ghi nhớ cực hay và các bài ôn tập vui vẻ."
            onClick={() => onStart('table')}
          />
          <FeatureCard 
            icon={Clock}
            color="bg-math-secondary"
            title="Học Xem Đồng Hồ"
            description="Bé sẽ biết cách nhìn giờ, phút và làm quen với thời gian qua mô hình đồng hồ thực tế."
            onClick={() => onStart('clock')}
          />
          <FeatureCard 
            icon={ClipboardList}
            color="bg-orange-500"
            title="Luyện Đề Thi"
            description="Các đề kiểm tra bám sát chương trình Kết Nối Tri Thức với đầy đủ trắc nghiệm và tự luận."
            onClick={() => onStart('exam')}
          />
          <FeatureCard 
            icon={GraduationCap}
            color="bg-emerald-500"
            title="Luyện Tập & Đố Vui"
            description="Tổng hợp các kiến thức toán học đa dạng và thử thách tư duy logic với những bài đố vui hình ảnh hấp dẫn."
            onClick={() => onStart('practice')}
          />
          <FeatureCard 
            icon={Gamepad2}
            color="bg-pink-500"
            title="Trò Chơi Vui Nhộn"
            description="Học mà chơi, chơi mà học! Những trò chơi toán học giúp bé tăng tốc độ tính nhẩm và sự phản xạ."
            onClick={() => onStart('fun')}
          />
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-xl border-2 border-gray-50 flex flex-col md:flex-row items-center gap-10">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-math-secondary/10 flex items-center justify-center shrink-0">
          <Heart className="w-16 h-16 md:w-24 md:h-24 text-math-secondary animate-pulse" />
        </div>
        <div className="space-y-6">
          <h2 className="font-display text-3xl md:text-4xl text-gray-800 leading-tight">
            Sứ mệnh của <span className="text-math-secondary">Math of Bơ</span>
          </h2>
          <div className="space-y-4 text-gray-600 text-lg">
            <p>
              Chúng mình tin rằng Toán học là một ngôn ngữ tuyệt vời của vũ trụ, và mỗi bé đều có khả năng trở thành một "nhà toán học nhỏ tuổi".
            </p>
            <p>
              Math of Bơ ra đời để xóa bỏ rào cản sợ hãi, biến những con số khô khan thành những người bạn, giúp bé xây dựng nền tảng tư duy vững chắc và niềm đam mê học hỏi suốt đời.
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <div className="px-4 py-2 bg-gray-100 rounded-full text-sm font-bold text-gray-500">#HocToanVuiVe</div>
            <div className="px-4 py-2 bg-gray-100 rounded-full text-sm font-bold text-gray-500">#TuDuyLogic</div>
          </div>
        </div>
      </section>
    </div>
  );
};
