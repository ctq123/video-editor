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
    const { startTime, endTime } = fields;
    const videoFile = files.video;

    if (!videoFile) {
      return { success: false, message: '视频文件不存在' };
    }

    try {
      // 调用服务层处理视频
      const outputVideo = await this.videoService.processVideo(
        videoFile.filepath,
        Number(startTime),
        Number(endTime)
      );

      const videoUrl = `/outputs/${path.basename(outputVideo)}`;
      return { success: true, data: videoUrl, message: '视频处理成功' }; // 返回视频的URL
    } catch (error) {
      console.error(error);
      return { success: false, data: null, message: '视频处理失败' };
    }
  }
}
