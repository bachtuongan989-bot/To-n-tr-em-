
export interface ProgressData {
  completedTopics: string[];
  examScores: { topic: string; score: number; date: string }[];
  practiceStats: { topic: string; correct: number; total: number; date: string }[];
}

const STORAGE_KEY = 'math_app_progress';

export const ProgressService = {
  getProgress(): ProgressData {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { completedTopics: [], examScores: [], practiceStats: [] };
  },

  saveTopicCompletion(topicId: string) {
    const data = this.getProgress();
    if (!data.completedTopics.includes(topicId)) {
      data.completedTopics.push(topicId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },

  saveExamScore(topicId: string, score: number) {
    const data = this.getProgress();
    data.examScores.push({ topic: topicId, score, date: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  savePracticeStats(topicId: string, correct: number, total: number) {
    const data = this.getProgress();
    data.practiceStats.push({ topic: topicId, correct, total, date: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};
