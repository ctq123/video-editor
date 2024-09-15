import { Provide } from '@midwayjs/core';
import { IExamOptions, IAnswerOptions, IQuestion } from '../interface';

const questions: IQuestion[] = [
  {
    id: 1,
    type: 'choice',
    questionText: 'What is 2 + 2?',
    options: ['3', '4', '5'],
    answer: '4',
  },
  {
    id: 2,
    type: 'multiple-choice',
    questionText: 'Which of the following are fruits?',
    options: ['Apple', 'Carrot', 'Banana'],
    answer: 'Carrot',
  },
  {
    id: 3,
    type: 'short-answer',
    questionText: 'What is your name?',
    answer: 'Carrot',
  },
  {
    id: 4,
    type: 'coding',
    questionText: 'Write a function to reverse a string.',
    answer: '',
  },
];

@Provide()
export class ExamService {
  async getExam(options: IExamOptions) {
    return {
      uid: options.uid,
      id: 23,
      timeLimit: 3600,
      questions: questions.map((item: IQuestion) => ({ ...item, answer: '' })),
    };
  }

  async updateAnswer(options: IAnswerOptions) {
    // TODO: Save the answer to the database
    // 获取当前用户ID
    // 更新数据库中的答案
    return {
      examId: options.examId,
    };
  }

  async submitCode(options: IAnswerOptions) {
    // TODO: Save the code to the database
    // 获取当前用户ID
    // 运行代码并获取结果
    // 更新答案到数据库
    return {
      examId: options.examId,
    };
  }

  async testCode(options: IAnswerOptions) {
    // 运行代码并获取结果
    return {
      examId: options.examId,
      result: 'successfully.',
    };
  }
}
