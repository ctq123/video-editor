import {
  Controller,
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
      const videoUrl = `/upload/${path.basename(outputPath)}`;
      return {
        success: true,
        data: { videoUrl, totalDuration },
        message: '视频合并成功',
      };
    } catch (error) {
      console.error(error);
      return { success: false, data: null, message: '视频合并失败' };
    }
  }

  // @Post('/process', { middleware: [UploadMiddleware] })
  @Post('/process')
  async processVideo(@Files() files, @Fields() fields) {
    // const videoFile = files.video;
    // const audioFile = files[0];
    const audioFilePath = files.length ? files[0]?.data : null;
    const {
      startTime,
      endTime,
      filterType,
      volume,
      brightness,
      blur,
      videoPath,
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
          Number(startTime),
          Number(endTime),
          filterType,
          Number(volume),
          Number(brightness),
          Number(blur)
        );

      const videoUrl = `/upload/${path.basename(outputPath)}`;
      return {
        success: true,
        data: { videoUrl, totalDuration },
        message: '处理成功',
      };
    } catch (error) {
      console.error(error);
      return { success: false, data: null, message: '处理失败' };
    }
  }
}
