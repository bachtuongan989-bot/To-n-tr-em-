
export interface Question {
  id: string;
  type: 'multiple-choice' | 'text';
  text: string;
  options?: { value: string; label: string }[];
  correctAnswer: string;
  points: number;
  image?: string;
  explanation?: string;
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
  const typeR = randInt(1, 11);
  let text = '';
  let correct: string | number = 0;
  let explanation = '';
  let customOptions: { value: string; label: string }[] | undefined = undefined;
  
  const subjects = ['học sinh', 'quyển vở', 'chiếc bút', 'quả táo', 'viên bi'];
  const subject = subjects[randInt(0, subjects.length - 1)];

  if (typeR === 1) {
    const a = randInt(isHard ? 50 : 10, isHard ? 99 : 50);
    const isTruoc = randInt(0, 1) === 0;
    text = `Số liền ${isTruoc ? 'trước' : 'sau'} của số ${a} là:`;
    correct = isTruoc ? a - 1 : a + 1;
    explanation = isTruoc ? `Số liền trước của ${a} là số nhỏ hơn ${a} một đơn vị, tức là ${a} - 1 = ${correct}.` : `Số liền sau của ${a} là số lớn hơn ${a} một đơn vị, tức là ${a} + 1 = ${correct}.`;
  } else if (typeR === 2) {
    const a = randInt(1, 9);
    const b = randInt(0, 9);
    text = `Số gồm ${a} chục và ${b} đơn vị là:`;
    correct = a * 10 + b;
    explanation = `${a} chục là ${a * 10}, cộng thêm ${b} đơn vị ta được ${a * 10 + b}.`;
  } else if (typeR === 3) {
    const a = randInt(10, isHard ? 90 : 50);
    const b = randInt(5, isHard ? 50 : 20);
    text = `Tính kết quả: ${a} + ${b} = ?`;
    correct = a + b;
    explanation = `Ta thực hiện phép tính cộng: ${a} + ${b} = ${correct}.`;
  } else if (typeR === 4) {
    const a = randInt(isHard ? 50 : 20, isHard ? 100 : 50);
    const b = randInt(5, a - 5);
    text = `Tính kết quả: ${a} - ${b} = ?`;
    correct = a - b;
    explanation = `Ta thực hiện phép tính trừ: ${a} - ${b} = ${correct}.`;
  } else if (typeR === 5) {
    const a = randInt(isHard ? 20 : 10, isHard ? 50 : 30);
    const b = randInt(2, isHard ? 10 : 5);
    const names1 = ['Hà', 'Lan', 'Minh', 'Tuấn', 'Lớp 2A'];
    const names2 = ['An', 'Bình', 'Hùng', 'Nam', 'Lớp 2B'];
    const idx = randInt(0, 4);
    text = `${names1[idx]} có ${a} ${subject}, ${names2[idx]} nhiều hơn ${names1[idx]} là ${b} ${subject}. Hỏi ${names2[idx]} có bao nhiêu ${subject}?`;
    correct = a + b;
    explanation = `Vì nhiều hơn nên ta làm phép cộng: ${a} + ${b} = ${correct} ${subject}.`;
  } else if (typeR === 6) {
    const a = randInt(15, 40);
    const b = randInt(3, 10);
    text = `Trong giỏ có tất cả ${a + b} quả cam và táo. Biết số quả cam là ${a}. Hỏi có mấy quả táo?`;
    correct = b;
    explanation = `Số quả táo = Tổng số quả - số quả cam = ${a + b} - ${a} = ${correct} quả.`;
  } else if (typeR === 7) {
    const a = randInt(1, 5) * 10;
    const b = randInt(1, 4) * 10;
    const items = ['Bao gạo', 'Bao cát', 'Bao ngô'];
    const item = items[randInt(0, 2)];
    text = `${item} thứ nhất nặng ${a}kg. ${item} thứ hai nặng ${b}kg. Cả hai bao nặng là:`;
    correct = a + b;
    explanation = `Ta làm phép cộng để tính tổng 2 bao: ${a}kg + ${b}kg = ${correct}kg.`;
  } else if (typeR === 8) {
    const a = randInt(2, 5);
    const b = randInt(2, 9);
    text = `Mỗi bạn có ${a} ${subject}. Hỏi ${b} bạn có tất cả bao nhiêu ${subject}?`;
    correct = a * b;
    explanation = `Ta lấy số ${subject} của mỗi bạn nhân với số bạn: ${a} x ${b} = ${correct}.`;
  } else if (typeR === 9) {
    const b = randInt(10, 50);
    const res = randInt(20, 90);
    text = `Tìm x biết: x - ${b} = ${res}`;
    correct = res + b;
    explanation = `Để tìm số bị trừ (x), ta lấy hiệu cộng với số trừ: ${res} + ${b} = ${correct}.`;
  } else if (typeR === 10) {
    const a = randInt(1, 9) * 10;
    const b = randInt(1, 9) * 10 + randInt(1, 9);
    const sign = a > b ? '>' : '<';
    text = `Điền dấu thích hợp: ${a} ... ${b}`;
    correct = sign;
    explanation = `Vì ${a} ${sign} ${b} nên ta điền dấu ${sign}.`;
    customOptions = [
      { value: 'A', label: '>' },
      { value: 'B', label: '<' },
      { value: 'C', label: '=' }
    ];
  } else {
    text = `Hình tam giác có mấy cạnh?`;
    correct = 3;
    explanation = `Đặc điểm của hình tam giác là có 3 cạnh.`;
  }
  
  const isText = randInt(0, 1) === 0 && !customOptions;
  const options = customOptions ? customOptions : generateOptions(correct as number, isText);
  let correctAnswerStr = '';
  if (customOptions) {
    const opt = customOptions.find(o => o.label === correct.toString());
    correctAnswerStr = opt ? opt.value : 'A';
  } else {
    correctAnswerStr = getCorrectOption(options, correct as number);
  }
  
  return {
    id: `g2q-${Date.now()}-${index}`,
    type: isText ? 'text' : 'multiple-choice',
    text,
    options,
    correctAnswer: correctAnswerStr,
    points: isHard ? 2 : 1,
    explanation
  };
}

function generateGrade3Question(diff: string, index: number): Question {
  const isHard = diff === 'hard';
  const typeR = randInt(1, 13);
  let text = '';
  let correct: string | number = 0;
  let explanation = '';
  let customOptions: { value: string; label: string }[] | undefined = undefined;
  
  if (typeR === 1) {
    const a = randInt(isHard ? 10 : 2, isHard ? 20 : 9);
    const b = randInt(isHard ? 10 : 2, isHard ? 20 : 9);
    text = `Giá trị của phép tính: ${a} x ${b} là:`;
    correct = a * b;
    explanation = `${a} nhân ${b} bằng ${a * b}.`;
  } else if (typeR === 2) {
    const b = randInt(2, 9);
    const res = randInt(3, isHard ? 20 : 10);
    const a = res * b;
    text = `Tìm x biết: x : ${b} = ${res}`;
    correct = a;
    explanation = `Để tìm số bị chia (x), ta lấy thương nhân với số chia: ${res} x ${b} = ${a}.`;
  } else if (typeR === 3) {
    const a = randInt(20, 100) * 10;
    const b = randInt(10, 50) * 10;
    text = `Tính: ${a} + ${b} = ?`;
    correct = a + b;
    explanation = `Thực hiện phép tính cộng: ${a} + ${b} = ${correct}.`;
  } else if (typeR === 4) {
    const a = randInt(isHard ? 50 : 10, 100);
    text = `Chu vi hình vuông có cạnh ${a}cm là:`;
    correct = a * 4;
    explanation = `Chu vi hình vuông = cạnh x 4. Vậy chu vi là ${a} x 4 = ${correct}cm.`;
  } else if (typeR === 5) {
    const a = randInt(isHard ? 500 : 100, isHard ? 900 : 500);
    const b = randInt(isHard ? 100 : 50, a - 10);
    text = `Tính: ${a} - ${b} = ?`;
    correct = a - b;
    explanation = `Thực hiện phép tính trừ: ${a} - ${b} = ${correct}.`;
  } else if (typeR === 6) {
    const a = randInt(5, 12);
    const b = randInt(3, 8);
    text = `Một hình chữ nhật có chiều dài ${a}cm, chiều rộng ${b}cm. Diện tích là:`;
    correct = a * b;
    explanation = `Diện tích hình chữ nhật = chiều dài x chiều rộng = ${a} x ${b} = ${correct} cm².`;
  } else if (typeR === 7) {
    const a = randInt(10, 30);
    const b = randInt(3, 6);
    const liquids = ['lít dầu', 'lít nước', 'lít mắm'];
    const l = liquids[randInt(0, 2)];
    text = `Mỗi thùng có ${a} ${l}. Hỏi ${b} thùng như thế có tất cả bao nhiêu ${l}?`;
    correct = a * b;
    explanation = `Ta lấy số lượng ở một thùng nhân với số thùng: ${a} x ${b} = ${correct}.`;
  } else if (typeR === 8) {
    const b = randInt(2, 9);
    const res = randInt(5, 15);
    const a = res * b;
    text = `Một sợi dây dài ${a}cm được cắt thành các đoạn bằng nhau, mỗi đoạn dài ${b}cm. Hỏi được mấy đoạn?`;
    correct = res;
    explanation = `Ta thực hiện phép chia tổng chiều dài cho chiều dài mỗi đoạn: ${a} : ${b} = ${res} đoạn.`;
  } else if (typeR === 9) {
    const a = randInt(2, 9);
    const res = randInt(10, 50);
    const x = a * res;
    text = `Tìm x biết: x : ${a} = ${res}`;
    correct = x;
    explanation = `Tìm số bị chia ta lấy thương nhân với số chia: ${res} x ${a} = ${correct}.`;
  } else if (typeR === 10) {
    const a = randInt(1, 9) * 100 + randInt(1, 9) * 10;
    const b = randInt(1, 9) * 100 + randInt(1, 9) * 10 + randInt(1, 9);
    const sign = a > b ? '>' : '<';
    text = `Điền dấu thích hợp: ${a} ... ${b}`;
    correct = sign;
    explanation = `Vì ${a} ${sign} ${b} nên ta điền dấu ${sign}.`;
    customOptions = [
      { value: 'A', label: '>' },
      { value: 'B', label: '<' },
      { value: 'C', label: '=' }
    ];
  } else if (typeR === 11) {
    // Geomatry
    const a = randInt(4, 10);
    const b = randInt(2, 5);
    text = `Chu vi hình chữ nhật có chiều dài ${a}cm và chiều rộng ${b}cm là:`;
    correct = (a + b) * 2;
    explanation = `Chu vi hình chữ nhật = (chiều dài + chiều rộng) x 2 = (${a} + ${b}) x 2 = ${correct}cm.`;
  } else if (typeR === 12) {
    const a = randInt(10, 99);
    const b = randInt(2, 9);
    text = `Kết quả của phép đặt tính: ${a} x ${b} bằng bao nhiêu?`;
    correct = a * b;
    explanation = `Ta đặt tính rồi nhân lần lượt từ phải sang trái: ${a} x ${b} = ${correct}.`;
  } else {
    text = `Sắp xếp que diêm: Để xếp 2 hình vuông nằm cạch nhau (chung 1 cạnh), em cần sử dụng ít nhất bao nhiêu que diêm?`;
    correct = 7;
    explanation = `Một hình vuông cần 4 que. Thêm một hình vuông chung 1 cạnh chỉ cần thêm 3 que. Vậy cần 4 + 3 = 7 que diêm.`;
  }

  const isText = randInt(0, 1) === 0 && !customOptions;
  const options = customOptions ? customOptions : generateOptions(correct as number, isText);
  let correctAnswerStr = '';
  if (customOptions) {
    const opt = customOptions.find(o => o.label === correct.toString());
    correctAnswerStr = opt ? opt.value : 'A';
  } else {
    correctAnswerStr = getCorrectOption(options, correct as number);
  }
  
  return {
    id: `g3q-${Date.now()}-${index}`,
    type: isText ? 'text' : 'multiple-choice',
    text,
    options,
    correctAnswer: correctAnswerStr,
    points: isHard ? 2 : 1,
    explanation
  };
}

function generateGrade4PlusQuestion(diff: string, index: number): Question {
  const isHard = diff === 'hard';
  const typeR = randInt(1, 13);
  let text = '';
  let correct: string | number = 0;
  let explanation = '';
  let customOptions: { value: string; label: string }[] | undefined = undefined;
  
  if (typeR === 1) {
    const a = randInt(10, 50);
    const b = randInt(5, 20);
    const c = randInt(2, 10);
    text = `Tính: ${a} x ${b} + ${c} = ?`;
    correct = a * b + c;
    explanation = `Theo thứ tự thực hiện phép tính (Nhân chia trước, cộng trừ sau): ${a} x ${b} = ${a*b}, sau đó ${a*b} + ${c} = ${correct}.`;
  } else if (typeR === 2) {
    const a = randInt(20, 100);
    const b = randInt(5, 20);
    text = `Diện tích hình chữ nhật có chiều dài ${a}cm, chiều rộng ${b}cm là:`;
    correct = a * b;
    explanation = `Diện tích = chiều dài x chiều rộng = ${a} x ${b} = ${correct} cm².`;
  } else if (typeR === 3) {
    const a = randInt(5, 20);
    const b = randInt(10, 30);
    const c = randInt(15, 40);
    const sum = a + b + c;
    if (sum % 3 === 0) {
      text = `Trung bình cộng của 3 số: ${a}, ${b} và ${c} là:`;
      correct = sum / 3;
      explanation = `Trung bình cộng = Tổng các số chia cho số các số = (${a} + ${b} + ${c}) : 3 = ${sum} : 3 = ${correct}.`;
    } else {
      text = `Tính giá trị biểu thức: ${a} + ${b} + ${c} = ?`;
      correct = sum;
      explanation = `Ta cộng lần lượt các số: ${a} + ${b} + ${c} = ${correct}.`;
    }
  } else if (typeR === 4) {
    const a = randInt(isHard ? 100 : 50, 500);
    const b = randInt(isHard ? 20 : 5, 50);
    const items = ['gạo', 'đường', 'ngô'];
    const it = items[randInt(0, 2)];
    text = `Một cửa hàng có ${a}kg ${it}. Đã bán đi ${b}kg. Còn lại bao nhiêu kg ${it}?`;
    correct = a - b;
    explanation = `Số ${it} còn lại = Số ${it} ban đầu - Số ${it} đã bán = ${a} - ${b} = ${correct} kg.`;
  } else if (typeR === 5) {
    const a = randInt(5, 15);
    text = `Tìm diện tích hình vuông có chu vi là ${a * 4}cm.`;
    correct = a * a;
    explanation = `Cạnh hình vuông là ${a*4} : 4 = ${a}cm. Diện tích là ${a} x ${a} = ${correct} cm².`;
  } else if (typeR === 6) {
    const sum = randInt(isHard ? 50 : 20, isHard ? 100 : 50);
    const diff_val = randInt(2, 15);
    let tempSum = sum;
    if ((tempSum + diff_val) % 2 !== 0) {
      tempSum += 1;
    }
    const larger = (tempSum + diff_val) / 2;
    text = `Tổng hai số là ${tempSum}, hiệu hai số là ${diff_val}. Số lớn là:`;
    correct = larger;
    explanation = `Số lớn = (Tổng + Hiệu) : 2 = (${tempSum} + ${diff_val}) : 2 = ${correct}.`;
  } else if (typeR === 7) {
    const a = randInt(isHard ? 500 : 100, isHard ? 999 : 500);
    const b = randInt(10, 99);
    text = `Kết quả của phép cộng: ${a} + ${b} là:`;
    correct = a + b;
    explanation = `Thực hiện phép cộng: ${a} + ${b} = ${correct}.`;
  } else if (typeR === 8) {
    const b = randInt(10, 30);
    const factor = randInt(3, 8);
    const a = b * factor;
    text = `Một mảnh vải dài ${a}m được cắt thành các mảnh nhỏ, mỗi mảnh dài ${b}m. Hỏi cắt được bao nhiêu mảnh?`;
    correct = factor;
    explanation = `Ta thực hiện phép chia tổng chiều dài cho chiều dài mỗi mảnh: ${a} : ${b} = ${factor} mảnh.`;
  } else if (typeR === 9) {
    const sum = randInt(isHard ? 50 : 20, isHard ? 100 : 50);
    const diff_val = randInt(2, 15);
    let tempSum = sum;
    if ((tempSum - diff_val) % 2 !== 0) {
      tempSum += 1;
    }
    const smaller = (tempSum - diff_val) / 2;
    text = `Tổng hai số là ${tempSum}, hiệu hai số là ${diff_val}. Số bé là:`;
    correct = smaller;
    explanation = `Số bé = (Tổng - Hiệu) : 2 = (${tempSum} - ${diff_val}) : 2 = ${correct}.`;
  } else if (typeR === 10) {
    const a = randInt(100, 500);
    const b = randInt(100, 500) + randInt(1, 50);
    const sign = a > b ? '>' : '<';
    text = `So sánh: ${a} ... ${b}`;
    correct = sign;
    explanation = `Vì ${a} ${sign} ${b} nên ta điền dấu ${sign}.`;
    customOptions = [
      { value: 'A', label: '>' },
      { value: 'B', label: '<' },
      { value: 'C', label: '=' }
    ];
  } else if (typeR === 11) {
    const a = randInt(100, 999);
    const b = randInt(10, 99);
    text = `Tính nâng cao: Kết quả của phép nhân ${a} x ${b} là:`;
    correct = a * b;
    explanation = `Ta tiến hành đặt tính nhân từ phải sang trái: ${a} x ${b} = ${correct}.`;
  } else if (typeR === 12) {
    const b = randInt(11, 99);
    const res = randInt(11, 99);
    const a = b * res;
    text = `Tính nâng cao: Kết quả của phép chia ${a} : ${b} là:`;
    correct = res;
    explanation = `Ta thực hiện phép tính chia: ${a} : ${b} = ${res}.`;
  } else {
    text = `Sắp xếp que diêm: Phương đang có một số que diêm. Bạn ấy xếp được đúng 3 hình vuông rời nhau thì vừa hết số diêm. Hỏi Phương có bao nhiêu que diêm?`;
    correct = 12;
    explanation = `Mỗi hình vuông độc lập (rời nhau) cần 4 que diêm. Do đó 3 hình vuông cần: 4 x 3 = 12 que diêm.`;
  }

  const isText = randInt(0, 1) === 0 && !customOptions;
  const options = customOptions ? customOptions : generateOptions(correct as number, isText);
  let correctAnswerStr = '';
  if (customOptions) {
    const opt = customOptions.find(o => o.label === correct.toString());
    correctAnswerStr = opt ? opt.value : 'A';
  } else {
    correctAnswerStr = getCorrectOption(options, correct as number);
  }
  
  return {
    id: `g4q-${Date.now()}-${index}`,
    type: isText ? 'text' : 'multiple-choice',
    text,
    options,
    correctAnswer: correctAnswerStr,
    points: isHard ? 2 : 1,
    explanation
  };
}

export const ExamService = {
  getExamsByAge(age: number, difficulty: 'medium' | 'hard' = 'medium', length: 10 | 15 = 10): Exam[] {
    const grade = Math.max(1, age - 5);
    const result: Exam[] = [];
    const timeLimit = length === 10 ? 900 : 1800; // 15 mins for 10q, 30 mins for 15q

    for (let eIndex = 0; eIndex < 3; eIndex++) {
      const examQuestions: Question[] = [];
      for (let i = 0; i < length; i++) {
        if (age <= 7) {
          examQuestions.push(generateGrade2Question(difficulty, i + eIndex * 100));
        } else if (age === 8) {
          examQuestions.push(generateGrade3Question(difficulty, i + eIndex * 100));
        } else {
          examQuestions.push(generateGrade4PlusQuestion(difficulty, i + eIndex * 100));
        }
      }

      result.push({
        id: `exam-dynamic-${Date.now()}-${eIndex}`,
        title: `Đề Thi Đánh Giá Năng Lực Lớp ${grade} - Số ${eIndex + 1}`,
        grade,
        difficulty,
        timeLimit: difficulty === 'hard' ? timeLimit + 300 : timeLimit,
        questions: examQuestions
      });
    }

    return result;
  }
};
