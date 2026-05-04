
export interface Question {
  id: string;
  type: 'multiple-choice' | 'text';
  text: string;
  options?: { value: string; label: string }[];
  correctAnswer: string;
  points: number;
  image?: string;
}

export interface Exam {
  id: string;
  title: string;
  grade: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  timeLimit: number; // in seconds
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function generateOptions(correctAnswer: number, isText: boolean = false): { value: string; label: string }[] | undefined {
  if (isText) return undefined;
  let falseOuts = new Set<number>();
  while(falseOuts.size < 3) {
    let offset = randInt(-5, 5);
    if(offset === 0) continue;
    let wrong = correctAnswer + offset;
    if(wrong >= 0) falseOuts.add(wrong);
  }
  let opts = [{ value: 'A', label: '' }, { value: 'B', label: '' }, { value: 'C', label: '' }, { value: 'D', label: '' }];
  let values = shuffle([correctAnswer, ...Array.from(falseOuts)]);
  return opts.map((opt, idx) => ({ ...opt, label: values[idx].toString() }));
}

function getCorrectOption(options: { value: string; label: string }[] | undefined, correctAnswer: number): string {
  if (!options) return correctAnswer.toString();
  const opt = options.find(o => o.label === correctAnswer.toString());
  return opt ? opt.value : 'A';
}

function generateGrade2Question(diff: string, index: number): Question {
  const isHard = diff === 'hard';
  const typeR = randInt(1, 5);
  let text = '';
  let correct = 0;
  
  if (typeR === 1) {
    const a = randInt(isHard ? 50 : 10, isHard ? 100 : 50);
    text = `Số liền ${randInt(0, 1) === 0 ? 'trước' : 'sau'} của số ${a} là:`;
    correct = text.includes('trước') ? a - 1 : a + 1;
  } else if (typeR === 2) {
    const a = randInt(1, 9);
    const b = randInt(0, 9);
    text = `Số gồm ${a} chục và ${b} đơn vị là:`;
    correct = a * 10 + b;
  } else if (typeR === 3) {
    const a = randInt(10, isHard ? 90 : 50);
    const b = randInt(5, isHard ? 50 : 20);
    text = `Tính kết quả: ${a} + ${b} = ?`;
    correct = a + b;
  } else if (typeR === 4) {
    const a = randInt(isHard ? 50 : 20, isHard ? 100 : 50);
    const b = randInt(5, a - 5);
    text = `Tính kết quả: ${a} - ${b} = ?`;
    correct = a - b;
  } else {
    const a = randInt(isHard ? 20 : 10, isHard ? 50 : 30);
    const b = randInt(2, isHard ? 10 : 5);
    text = `Lớp 2A có ${a} học sinh, lớp 2B nhiều hơn 2A là ${b} học sinh. Hỏi lớp 2B có bao nhiêu học sinh?`;
    correct = a + b;
  }
  
  const isText = randInt(0, 1) === 0;
  const options = generateOptions(correct, isText);
  
  return {
    id: `g2q-${Date.now()}-${index}`,
    type: isText ? 'text' : 'multiple-choice',
    text,
    options,
    correctAnswer: getCorrectOption(options, correct),
    points: isHard ? 2 : 1
  };
}

function generateGrade3Question(diff: string, index: number): Question {
  const isHard = diff === 'hard';
  const typeR = randInt(1, 5);
  let text = '';
  let correct = 0;
  
  if (typeR === 1) {
    const a = randInt(isHard ? 10 : 2, isHard ? 20 : 9);
    const b = randInt(isHard ? 10 : 2, isHard ? 20 : 9);
    text = `Giá trị của phép tính: ${a} x ${b} là:`;
    correct = a * b;
  } else if (typeR === 2) {
    const b = randInt(2, 9);
    const res = randInt(3, isHard ? 20 : 10);
    const a = res * b;
    text = `Tìm x biết: x : ${b} = ${res}`;
    correct = a;
  } else if (typeR === 3) {
    const a = randInt(20, 100) * 10;
    const b = randInt(10, 50) * 10;
    text = `Tính: ${a} + ${b} = ?`;
    correct = a + b;
  } else if (typeR === 4) {
    const a = randInt(isHard ? 50 : 10, 100);
    const b = randInt(2, 9);
    text = `Chu vi hình vuông có cạnh ${a}cm là:`;
    correct = a * 4;
  } else {
    const a = randInt(isHard ? 500 : 100, isHard ? 900 : 500);
    const b = randInt(isHard ? 100 : 50, a - 10);
    text = `Tính: ${a} - ${b} = ?`;
    correct = a - b;
  }

  const isText = randInt(0, 1) === 0;
  const options = generateOptions(correct, isText);
  
  return {
    id: `g3q-${Date.now()}-${index}`,
    type: isText ? 'text' : 'multiple-choice',
    text,
    options,
    correctAnswer: getCorrectOption(options, correct),
    points: isHard ? 2 : 1
  };
}

function generateGrade4PlusQuestion(diff: string, index: number): Question {
  const isHard = diff === 'hard';
  const typeR = randInt(1, 5);
  let text = '';
  let correct = 0;
  
  if (typeR === 1) {
    const a = randInt(10, 50);
    const b = randInt(5, 20);
    const c = randInt(2, 10);
    text = `Tính: ${a} x ${b} + ${c} = ?`;
    correct = a * b + c;
  } else if (typeR === 2) {
    const a = randInt(20, 100);
    const b = randInt(5, 20);
    text = `Diện tích hình chữ nhật có chiều dài ${a}cm, chiều rộng ${b}cm là:`;
    correct = a * b;
  } else if (typeR === 3) {
    const a = randInt(5, 20);
    const b = randInt(10, 30);
    const c = randInt(15, 40);
    text = `Trung bình cộng của 3 số: ${a}, ${b} và ${c} là:`;
    correct = (a + b + c) / 3;
    // ensure integer
    if ((a+b+c)%3 !== 0) {
        text = `Tính: ${a} + ${b} + ${c} = ?`;
        correct = a + b + c;
    }
  } else if (typeR === 4) {
    const a = randInt(isHard ? 100 : 50, 500);
    const b = randInt(isHard ? 20 : 5, 50);
    text = `Một cửa hàng có ${a}kg gạo. Đã bán đi ${b}kg. Còn lại bao nhiêu kg gạo?`;
    correct = a - b;
  } else {
    const a = randInt(5, 15);
    text = `Tìm diện tích hình vuông có chu vi là ${a * 4}cm.`;
    correct = a * a;
  }

  const isText = randInt(0, 1) === 0;
  const options = generateOptions(correct, isText);
  
  return {
    id: `g4q-${Date.now()}-${index}`,
    type: isText ? 'text' : 'multiple-choice',
    text,
    options,
    correctAnswer: getCorrectOption(options, correct),
    points: isHard ? 2 : 1
  };
}

export const ExamService = {
  getExamsByAge(age: number, difficulty: 'medium' | 'hard' = 'medium', length: 10 | 15 = 10): Exam[] {
    const grade = Math.max(1, age - 5);
    const examQuestions: Question[] = [];
    
    for (let i = 0; i < length; i++) {
        if (age <= 7) {
            examQuestions.push(generateGrade2Question(difficulty, i));
        } else if (age === 8) {
            examQuestions.push(generateGrade3Question(difficulty, i));
        } else {
            examQuestions.push(generateGrade4PlusQuestion(difficulty, i));
        }
    }

    const timeLimit = length === 10 ? 900 : 1800; // 15 mins for 10q, 30 mins for 15q

    return [
      {
        id: `exam-dynamic-${Date.now()}`,
        title: `Đề Luyện Tập Lớp ${grade}`,
        grade,
        difficulty,
        timeLimit: difficulty === 'hard' ? timeLimit + 300 : timeLimit,
        questions: examQuestions
      }
    ];
  }
};
