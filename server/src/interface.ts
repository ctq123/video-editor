/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: number;
}

/**
 * @description Exam-Service parameters
 */
export interface IExamOptions {
  uid?: number;
  userId: number;
}

export interface IAnswerOptions {
  examId: number;
  answers: IAnswer[];
}

export interface IExam {
  id: number;
  name: string;
  description: string;
  timeLimit: number;
  questions: IQuestion[];
}

export interface IQuestion {
  id: number;
  type: IQuestionType;
  questionText: string;
  options?: string[];
  answer?: string;
  userAnswer?: string;
}

export interface IAnswer {
  questionId: number;
  answer: string;
}

export type IQuestionType =
  | 'choice'
  | 'multiple-choice'
  | 'short-answer'
  | 'coding';

export interface IExamResult {
  examId: number;
  userId: number;
  score: number;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
}
