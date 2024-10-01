import {
  Controller,
  Post,
  Inject,
  Files,
  Fields,
  Provide,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
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

  @Post('/merge')
  async merge(@Files() files) {
    const videoFiles = files.videos;

    if (!videoFiles || videoFiles.length < 2) {
      return {
        success: false,
        data: null,
        message: '至少需要两个视频文件进行合并',
      };
    }

    const videoPaths = videoFiles.map(file => file.data);

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

  @Post('/process')
  async processVideo(@Files() files, @Fields() fields) {
    // const videoFile = files.video;
    const audioFile = files.audio;
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
          audioFile.data,
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
