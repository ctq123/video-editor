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
    // 提取关键帧
    const count = await this.videoService.extractKeyFrames(
      filePath,
      outputDir,
      1,
      5
    );

    try {
      const files = fs.readdirSync(outputDir);
      const images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
      return {
        success: true,
        message: '',
        data: {
          images,
          count,
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

  @Post('/analysis')
  async analyAction(@Body() actionBody) {
    const { userId, keyFrameCount } = actionBody;
    // 分析用户考试行为
    const filePath = this.videoService.getUserVideoFilePath(userId);
    const outputDir = path.join(__dirname, '../output');

    if (!filePath) {
      return {
        success: true,
        message: 'No video file Found.',
        data: {},
      };
    }

    const files = fs.readdirSync(outputDir);
    const images = files.filter(file => /\.(png)$/i.test(file));

    const detectionList = [];
    let count = keyFrameCount || 5;
    count = Math.min(count, images.length);
    // 处理每个关键帧
    for (let i = 1; i <= count; i++) {
      const framePath = path.join(outputDir, `keyframe-${i}.png`);
      const detections = await this.videoService.detectFaces(framePath);
      console.log(`Detected faces in frame ${i}:`, detections);
      detectionList.push(detections);
    }

    // 人脸检测、识别和匹配维度
    // TODO: 根据阀值和位置在关键帧上打标

    return {
      success: true,
      message: 'OK',
      data: {
        detectionList,
      },
    };
  }
}
