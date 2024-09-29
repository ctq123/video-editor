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
    console.log('upload', files, fields);

    if (!files || !files.length) {
      return { success: false, data: null, message: '视频文件不存在' };
    }

    const { startTime, endTime } = fields;
    const videoFile = files[0];

    try {
      // 调用服务层处理视频
      const outputVideo = await this.videoService.processVideo(
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
}
