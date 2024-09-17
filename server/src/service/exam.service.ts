import { Provide } from '@midwayjs/core';
import {
  IExamGetOptions,
  IAnswerOptions,
  IQuestion,
  IExamOptions,
} from '../interface';

const questions: IQuestion[] = [
  {
    id: 1,
    type: 'choice',
    questionText: `Which hook is used to manage state in a functional React component?
    `,
    options: ['useEffect', 'useContext', 'useState', 'useReducer'],
    answer: 'useReducer',
  },
  {
    id: 2,
    type: 'multiple-choice',
    questionText: `以下代码，执行后输出的会是什么?
      function fn(n, o) {
        console.log(o);

        return {
          fn(m) {
            return fn(m, n);
          },
        };
      }

      var b = fn(0).fn(1).fn(2).fn(3);`,
    options: ['0', '1', '2', '3'],
    answer: '0 1 2',
  },
  {
    id: 3,
    type: 'short-answer',
    questionText: `What is the output of the following code?
      function Foo() {
        function a() {
          console.log(1);
        }

        this.a = function () {
          console.log(2);
        };
      }

      Foo.prototype.a = function () {
        console.log(3);
      };

      Foo.a = function () {
        console.log(4);
      };

      Foo.a();
      let foo = new Foo();
      foo.a();
      Foo.a();`,
    answer: '4 2 4',
  },
  {
    id: 4,
    type: 'coding',
    questionText: `##### 给出一个组乱序的数字，其中元素有正有负，求三个数的最大乘积.

      示例 1：

      输入：nums = [-10, -10, 1, 3, 2]
      输出：300

      示例 2：

      输入：nums = [-4, -10, -1, -3, -2, -5, -8]
      输出：-6
      
    `,
    answer: '',
  },
];

@Provide()
export class ExamService {
  async getExam(options: IExamGetOptions) {
    // TODO: 为用户创建一份试卷（已存在则忽略）
    // 绑定试卷内容
    return {
      userId: options.userId,
      id: 23,
      timeLimit: 3600,
      name: 'Test Exam',
      description: 'This is a test exam',
      questions: questions.map((item: IQuestion) => ({ ...item, answer: '' })),
    };
  }

  async update(options: IExamOptions) {
    // TODO: Save the code to the database
    // 更新考试数据
    return {
      examId: options.id,
    };
  }

  async updateLimitTime(options: IExamOptions) {
    // TODO: Save the code to the database
    // 更新考试数据
    const exam = await this.getExam(options);
    // 更新数据
    exam.timeLimit = options.timeLimit;
    // console.log(exam);
    const result = await this.update(exam);
    return result;
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
