/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: number;
}

/**
 * @description Exam-Service parameters
 */
export interface IExamGetOptions {
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

export interface IExamOptions extends IExam {
  uid?: number;
  userId: number;
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

export interface IUploadOptions {
  userId?: number | string;
  filename?: string;
  filepath?: string;
  data?: any;
  file: any;
}

export interface TranscodeOptions {
  videoBitrate?: string; // 视频比特率
  resolution?: string; // 视频分辨率
  audioBitrate?: string; // 音频比特率
}
