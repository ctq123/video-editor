import {
  Controller,
  Get,
  Post,
  Inject,
  Files,
  Fields,
  Provide,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
// import { UploadMiddleware, UploadFileInfo } from '@midwayjs/busboy';
import { VideoService } from '../service/video.service';
import * as fs from 'fs';
import * as path from 'path';

@Provide()
@Controller('/api/video')
export class VideoController {
  @Inject()
  ctx: Context;

  @Inject()
  videoService: VideoService;

  // 获取视频
  @Get('/:filename')
  async getVideo(ctx) {
    const filename = ctx.params.filename;
    const videoPath = path.join(__dirname, '../upload', filename);

    console.log('Requested File Path:', videoPath);

    if (fs.existsSync(videoPath)) {
      ctx.body = fs.createReadStream(videoPath);
      ctx.type = 'video/mp4'; // 根据实际图片类型设置
      console.log('Serving File:', filename);
    } else {
      ctx.status = 404;
      ctx.body = 'File not found';
      console.log('File Not Found:', filename);
    }
  }

  // @Post('/upload', { middleware: [UploadMiddleware] })
  @Post('/upload')
  async upload(@Files() files, @Fields() fields) {
    console.log('upload', files, fields);

    if (!files || !files.length) {
      return { success: false, data: null, message: '视频文件不存在' };
    }

    const { startTime, endTime } = fields;
    const videoFile = files[0];

    try {
      // 调用服务层处理视频
      const outputVideo = await this.videoService.uploadVideo(
        videoFile.data,
        Number(startTime),
        Number(endTime)
      );

      const videoUrl = `/upload/${path.basename(outputVideo)}`;
      return { success: true, data: videoUrl, message: '视频处理成功' }; // 返回视频的URL
    } catch (error) {
      console.error(error);
      return { success: false, data: null, message: '视频处理失败' };
    }
  }

  // @Post('/merge', { middleware: [UploadMiddleware] })
  // 视频合并
  @Post('/merge')
  async merge(@Files() files, @Fields() fields) {
    console.log('merge', files, fields);
    // const videoFiles = fields?.videos;
    if (!Array.isArray(files) || files.length < 1) {
      return {
        success: false,
        data: null,
        message: '视频文件不能为空',
      };
    }

    const videoPaths = files.map(file => file.data).filter(Boolean);

    try {
      const { outputPath, totalDuration } = await this.videoService.mergeVideos(
        videoPaths
      );
      const fileName = path.basename(outputPath);
      const videoUrl = `/upload/${fileName}`;
      return {
        success: true,
        data: { videoUrl, fileName, totalDuration },
        message: '视频合并成功',
      };
    } catch (error) {
      console.error(error);
      return { success: false, data: null, message: '视频合并失败' };
    }
  }

  // @Post('/process', { middleware: [UploadMiddleware] })
  // 视频处理
  @Post('/process')
  async processVideo(@Files() files, @Fields() fields) {
    // const videoFile = files.video;
    // const audioFile = files[0];
    // console.log('processVideo', files, fields);

    const audioFilePath =
      files.filter(file => file.fieldName === 'audio')[0]?.data || null;
    const subtitlePath =
      files.filter(file => file.fieldName === 'subtitle')[0]?.data || null;
    const {
      videoPath,
      startTime,
      endTime,
      fps,
      volume,
      brightness,
      blur,
      watermarkText,
      videoWidth,
      videoHeight,
      crfValue,
    } = fields;

    const videoFilePath = path.join(__dirname, '..', videoPath);
    if (!videoPath || !fs.existsSync(videoFilePath)) {
      return { success: false, message: '视频文件不存在' };
    }

    try {
      const { outputPath, totalDuration } =
        await this.videoService.processVideo(
          videoFilePath,
          audioFilePath,
          subtitlePath,
          Number(startTime),
          Number(endTime),
          Number(fps),
          Number(volume),
          Number(brightness),
          Number(blur),
          watermarkText,
          Number(videoWidth),
          Number(videoHeight),
          Number(crfValue)
        );

      const fileName = path.basename(outputPath);
      const videoUrl = `/upload/${fileName}`;
      return {
        success: true,
        data: { videoUrl, fileName, totalDuration },
        message: '处理成功',
      };
    } catch (error) {
      console.error(error);
      return { success: false, data: null, message: '处理失败' };
    }
  }

  // 视频转码
  @Post('/trans')
  async transformVideoasync(@Files() files, @Fields() fields) {
    console.log('transformVideoasync', files, fields);
    // const videoFiles = fields?.videos;
    const { videoPath, format, videoBitrate, resolution, audioBitrate } =
      fields;

    const videoFilePath = path.join(__dirname, '..', videoPath);
    if (!videoPath || !fs.existsSync(videoFilePath)) {
      return { success: false, message: '视频文件不存在' };
    }

    if (!format) {
      return {
        success: false,
        data: null,
        message: '参数不合法',
      };
    }

    // const videoPath = files.map(file => file.data).filter(Boolean)[0];

    try {
      const { outputPath } = await this.videoService.transcodeToFormat(
        videoFilePath,
        format,
        {
          videoBitrate,
          resolution,
          audioBitrate,
        }
      );
      const fileName = path.basename(outputPath);
      const videoUrl = `/upload/${fileName}`;
      return {
        success: true,
        data: { videoUrl, fileName },
        message: '视频转码成功',
      };
    } catch (error) {
      console.error(error);
      return { success: false, data: null, message: '视频转码失败' };
    }
  }
}
