import { Inject, Controller, Get, Post, Query, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import * as path from 'path';
import * as fs from 'fs';
import { ExamService } from '../service/exam.service';
import { VideoService } from '../service/video.service';
import { ExamDTO } from '../dto/exam';

@Controller('/api/exam')
export class ExamController {
  // 这里是装饰器，定义一个路由
  @Inject()
  ctx: Context;

  @Inject()
  examService: ExamService;

  @Inject()
  videoService: VideoService;

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

  @Post('/time')
  async updateLimitTime(@Body() exam) {
    const result = await this.examService.updateLimitTime(exam);
    return { success: true, message: 'OK', data: result };
  }

  @Post('/user-action')
  async updateUserExamAction(@Body() userAction) {
    // TODO: 处理用户考试行为
    console.log(userAction);
    return { success: true, message: 'OK', data: true };
  }

  @Post('/keyframes')
  async getKeyframes(@Body() body) {
    const { userId } = body;
    const filePath = this.videoService.getUserVideoFilePath(userId);
    const outputDir = path.join(__dirname, '../output');

    if (!filePath) {
      return {
        success: true,
        message: 'No video file Found.',
        data: null,
      };
    }

    try {
      const files = fs.readdirSync(outputDir);
      const images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
      return {
        success: true,
        message: '',
        data: {
          images,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to read output directory',
        data: null,
      };
    }
  }
}
