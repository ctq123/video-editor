import { Rule, RuleType } from '@midwayjs/validate';
import { IAnswer } from '../interface';

export class ExamDTO {
  @Rule(RuleType.number().required())
  examId: number;

  @Rule(RuleType.array().required())
  answers: IAnswer[];
}
