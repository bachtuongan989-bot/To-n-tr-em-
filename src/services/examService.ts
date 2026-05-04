
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

export const ExamService = {
  getExamsByAge(age: number, difficulty: 'medium' | 'hard' = 'medium'): Exam[] {
    const grade = Math.max(1, age - 5);
    
    if (age <= 8) {
      return [
        {
          id: 'exam-g2-01',
          title: 'Đề Kiểm Tra Định Kỳ - Lớp 2',
          grade: 2,
          difficulty: 'easy',
          timeLimit: 900, // 15 minutes
          questions: [
            {
              id: 'g2q1',
              type: 'multiple-choice',
              text: 'Số liền trước của số 80 là:',
              options: [
                { value: 'A', label: '70' }, { value: 'B', label: '81' }, 
                { value: 'C', label: '79' }, { value: 'D', label: '82' }
              ],
              correctAnswer: 'C',
              points: 1
            },
            {
              id: 'g2q2',
              type: 'multiple-choice',
              text: 'Số gồm 5 chục và 2 đơn vị là:',
              options: [
                { value: 'A', label: '502' }, { value: 'B', label: '552' }, 
                { value: 'C', label: '25' }, { value: 'D', label: '52' }
              ],
              correctAnswer: 'D',
              points: 1
            },
            {
              id: 'g2q3',
              type: 'multiple-choice',
              text: 'Số tám mươi tư viết là:',
              options: [
                { value: 'A', label: '48' }, { value: 'B', label: '804' }, 
                { value: 'C', label: '84' }, { value: 'D', label: '448' }
              ],
              correctAnswer: 'C',
              points: 1
            },
            {
              id: 'g2q4',
              type: 'multiple-choice',
              text: 'Điền dấu thích hợp vào chỗ chấm: 8 + 5 …. 15',
              options: [
                { value: 'A', label: '>' }, { value: 'B', label: '<' }, 
                { value: 'C', label: '=' }, { value: 'D', label: 'Khác' }
              ],
              correctAnswer: 'B',
              points: 1
            },
            {
              id: 'g2q5',
              type: 'multiple-choice',
              text: 'Lan có 7 cái kẹo, Mai có 8 cái kẹo. Cả hai bạn có …. cái kẹo?',
              options: [
                { value: 'A', label: '14 cái' }, { value: 'B', label: '13 cái' }, 
                { value: 'C', label: '15 cái' }, { value: 'D', label: '12 cái' }
              ],
              correctAnswer: 'C',
              points: 1
            },
            {
              id: 'g2q6',
              type: 'multiple-choice',
              text: 'Số lớn nhất có hai chữ số khác nhau là:',
              options: [
                { value: 'A', label: '99' }, { value: 'B', label: '89' }, 
                { value: 'C', label: '98' }, { value: 'D', label: '90' }
              ],
              correctAnswer: 'C',
              points: 1
            },
            {
              id: 'g2q7',
              type: 'text',
              text: 'Tính kết quả: 31 + 7 = ?',
              correctAnswer: '38',
              points: 1
            },
            {
              id: 'g2q8',
              type: 'text',
              text: 'Tính kết quả: 78 - 50 = ?',
              correctAnswer: '28',
              points: 1
            },
            {
              id: 'g2q9',
              type: 'text',
              text: 'Lớp 2A có 35 học sinh, lớp 2B có nhiều hơn lớp 2A là 3 học sinh. Hỏi lớp 2B có bao nhiêu học sinh? (Chỉ ghi số)',
              correctAnswer: '38',
              points: 1
            },
            {
              id: 'g2q10',
              type: 'multiple-choice',
              text: 'Hình tam giác có bao nhiêu cạnh?',
              options: [
                { value: 'A', label: '2' }, { value: 'B', label: '3' }, 
                { value: 'C', label: '4' }, { value: 'D', label: '5' }
              ],
              correctAnswer: 'B',
              points: 1
            }
          ]
        }
      ];
    } else {
      // Age 9-15
      if (difficulty === 'hard') {
        return [
          {
            id: 'exam-hard-01',
            title: 'Đề Khảo Sát Học Sinh Giỏi',
            grade: Math.min(9, grade),
            difficulty: 'hard',
            timeLimit: 1200, // 20 minutes
            questions: [
              {
                id: 'hq1',
                type: 'multiple-choice',
                text: 'Tìm x biết: (x + 1) + (x + 2) + ... + (x + 10) = 75',
                options: [
                  { value: 'A', label: '2' }, { value: 'B', label: '3' }, 
                  { value: 'C', label: '4' }, { value: 'D', label: '5' }
                ],
                correctAnswer: 'A',
                points: 2
              },
              {
                id: 'hq2',
                type: 'multiple-choice',
                text: 'Một hình vuông có chu vi 20cm. Nếu gấp cạnh hình vuông lên 3 lần thì diện tích thay đổi thế nào?',
                options: [
                  { value: 'A', label: 'Gấp 3 lần' }, { value: 'B', label: 'Gấp 6 lần' }, 
                  { value: 'C', label: 'Gấp 9 lần' }, { value: 'D', label: 'Gấp 12 lần' }
                ],
                correctAnswer: 'C',
                points: 2
              },
              {
                id: 'hq3',
                type: 'text',
                text: 'Tổng của hai số là 100, hiệu của hai số là 20. Số lớn là bao nhiêu?',
                correctAnswer: '60',
                points: 2
              },
              {
                id: 'hq4',
                type: 'multiple-choice',
                text: 'Trong các số sau, số nào vừa chia hết cho 2, vừa chia hết cho 5, vừa chia hết cho 9?',
                options: [
                  { value: 'A', label: '90' }, { value: 'B', label: '100' }, 
                  { value: 'C', label: '180' }, { value: 'D', label: 'Cả A và C' }
                ],
                correctAnswer: 'D',
                points: 2
              },
              {
                id: 'hq5',
                type: 'text',
                text: 'Một vòi nước chảy vào bể không có nước, mỗi giờ được 1/4 bể. Hỏi sau bao lâu thì bể đầy nước? (Ghi số giờ)',
                correctAnswer: '4',
                points: 2
              },
              {
                id: 'hq6',
                type: 'multiple-choice',
                text: 'Nếu tăng chiều dài hình chữ nhật thêm 20%, giảm chiều rộng đi 20% thì diện tích thay đổi thế nào?',
                options: [
                  { value: 'A', label: 'Không đổi' }, { value: 'B', label: 'Giảm 4%' }, 
                  { value: 'C', label: 'Tăng 4%' }, { value: 'D', label: 'Giảm 2%' }
                ],
                correctAnswer: 'B',
                points: 2
              },
              {
                id: 'hq7',
                type: 'text',
                text: 'Có 5 người làm xong một công việc trong 10 ngày. Hỏi muốn làm xong công việc đó trong 2 ngày thì cần bao nhiêu người? (Sức làm như nhau)',
                correctAnswer: '25',
                points: 2
              },
              {
                id: 'hq8',
                type: 'multiple-choice',
                text: 'Diện tích hình tròn có bán kính 2cm là (lấy pi = 3.14):',
                options: [
                  { value: 'A', label: '12.56 cm²' }, { value: 'B', label: '6.28 cm²' }, 
                  { value: 'C', label: '15.7 cm²' }, { value: 'D', label: '3.14 cm²' }
                ],
                correctAnswer: 'A',
                points: 2
              },
              {
                id: 'hq9',
                type: 'text',
                text: 'Tìm một số biết rằng 2/5 của số đó bằng 20.',
                correctAnswer: '50',
                points: 2
              },
              {
                id: 'hq10',
                type: 'multiple-choice',
                text: 'Một đội công nhân có 15 người. Dự định làm xong đoạn đường trong 20 ngày. Nếu muốn làm xong sớm 10 ngày thì cần thêm bao nhiêu người?',
                options: [
                  { value: 'A', label: '15 người' }, { value: 'B', label: '30 người' }, 
                  { value: 'C', label: '10 người' }, { value: 'D', label: '5 người' }
                ],
                correctAnswer: 'A',
                points: 2
              }
            ]
          }
        ];
      } else {
        return [
          {
            id: 'exam-med-01',
            title: 'Đề Ôn Tập Tổng Hợp',
            grade: Math.min(9, grade),
            difficulty: 'medium',
            timeLimit: 1200, // 20 minutes
            questions: [
              {
                id: 'advq1',
                type: 'multiple-choice',
                text: 'Giá trị của biểu thức 25 x 4 + 150 : 5 là:',
                options: [
                  { value: 'A', label: '130' }, { value: 'B', label: '150' }, 
                  { value: 'C', label: '120' }, { value: 'D', label: '180' }
                ],
                correctAnswer: 'A',
                points: 1
              },
              {
                id: 'advq2',
                type: 'multiple-choice',
                text: 'Một hình chữ nhật có chiều dài 12cm, chiều rộng bằng 1/3 chiều dài. Diện tích hình đó là:',
                options: [
                  { value: 'A', label: '36 cm²' }, { value: 'B', label: '48 cm²' }, 
                  { value: 'C', label: '40 cm²' }, { value: 'D', label: '144 cm²' }
                ],
                correctAnswer: 'B',
                points: 1
              },
              {
                id: 'advq3',
                type: 'multiple-choice',
                text: 'Tìm x biết: x : 4 = 25 (dư 3)',
                options: [
                  { value: 'A', label: '100' }, { value: 'B', label: '103' }, 
                  { value: 'C', label: '97' }, { value: 'D', label: '108' }
                ],
                correctAnswer: 'B',
                points: 1
              },
              {
                id: 'advq4',
                type: 'text',
                text: 'Trung bình cộng của 3 số: 15, 25 và 50 là bao nhiêu?',
                correctAnswer: '30',
                points: 1
              },
              {
                id: 'advq5',
                type: 'multiple-choice',
                text: 'Đổi 2m² 5dm² sang dm² ta được:',
                options: [
                  { value: 'A', label: '25' }, { value: 'B', label: '205' }, 
                  { value: 'C', label: '250' }, { value: 'D', label: '2005' }
                ],
                correctAnswer: 'B',
                points: 1
              },
              {
                id: 'advq6',
                type: 'text',
                text: 'Một người đi bộ trong 3 giờ được 12km. Hỏi trong 5 giờ người đó đi được bao nhiêu km? (Vận tốc không đổi)',
                correctAnswer: '20',
                points: 1
              },
              {
                id: 'advq7',
                type: 'multiple-choice',
                text: 'Phân số nào lớn nhất trong các phân số sau: 1/2, 2/3, 3/4, 4/5?',
                options: [
                  { value: 'A', label: '1/2' }, { value: 'B', label: '2/3' }, 
                  { value: 'C', label: '3/4' }, { value: 'D', label: '4/5' }
                ],
                correctAnswer: 'D',
                points: 1
              },
              {
                id: 'advq8',
                type: 'multiple-choice',
                text: 'Số nào chia hết cho cả 2, 3 và 5?',
                options: [
                  { value: 'A', label: '15' }, { value: 'B', label: '20' }, 
                  { value: 'C', label: '30' }, { value: 'D', label: '45' }
                ],
                correctAnswer: 'C',
                points: 1
              },
              {
                id: 'advq9',
                type: 'text',
                text: 'Diện tích một hình vuông là 64 cm². Chu vi hình vuông đó là bao nhiêu cm?',
                correctAnswer: '32',
                points: 2
              },
              {
                id: 'advq10',
                type: 'text',
                text: 'Một cửa hàng có 100kg gạo. Ngày đầu bán 1/4 số gạo, ngày thứ hai bán 1/5 số gạo còn lại. Hỏi sau hai ngày cửa hàng còn bao nhiêu kg gạo?',
                correctAnswer: '60',
                points: 2
              }
            ]
          }
        ];
      }
    }
  }
};
