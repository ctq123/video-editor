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
  async getExam(@Query('userId') userId) {
    const exam = await this.examService.getExam({ userId });
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

  @Post('/user-action')
  async updateUserExamAction(@Body() userAction) {
    // TODO: 处理用户考试行为
    console.log(userAction);
    return { success: true, message: 'OK', data: true };
  }

  @Post('/upload-vedio')
  async updateUserExamVedio(@Body() vedio) {
    // TODO: 上传监控录像，分析用户考试行为
    console.log(vedio);
    return { success: true, message: 'OK', data: true };
  }
}
