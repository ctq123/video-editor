import { Inject, Controller, Get, Post, Query, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ExamService } from '../service/exam.service';
import { ExamDTO } from '../dto/exam';

@Controller('/api/exam')
export class ExamController {
  // 这里是装饰器，定义一个路由
  @Inject()
  ctx: Context;

  @Inject()
  examService: ExamService;

  @Get('/')
  async getHello(): Promise<string> {
    // 这里是 http 的返回，可以直接返回字符串，数字，JSON，Buffer 等
    return 'Hello Weather!';
  }

  @Get('/get')
  async getExam(@Query('uid') uid) {
    const exam = await this.examService.getExam({ uid });
    return { success: true, message: 'OK', data: exam };
  }

  @Post('/submit')
  async updateAnswer(@Body() exam: ExamDTO) {
    const result = await this.examService.updateAnswer(exam);
    return { success: true, message: 'OK', data: result };
  }

  @Post('/test')
  async testCode(@Body() exam: ExamDTO) {
    const result = await this.examService.testCode(exam);
    return { success: true, message: 'OK', data: result };
  }

  @Post('/submit-coding')
  async submitCode(@Body() exam: ExamDTO) {
    const result = await this.examService.submitCode(exam);
    return { success: true, message: 'OK', data: result };
  }
}
