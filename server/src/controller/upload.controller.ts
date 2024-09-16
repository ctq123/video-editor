import { Controller, Post, Inject, Files, Fields } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UploadService } from '../service/upload.service';
import { VideoService } from '../service/video.service';

@Controller('/api/upload')
export class UploadController {
  @Inject()
  ctx: Context;

  @Inject()
  uploadService: UploadService;

  @Inject()
  videoService: VideoService;

  @Post('/video')
  async uploadVideo(@Files() files, @Fields() fields) {
    console.log('Files:', files);
    console.log('fields:', fields);

    if (!files || files.length === 0) {
      return {
        success: true,
        message: 'No file uploaded',
        data: {},
      };
    }

    const file = files[0]; // 获取上传的文件
    const userId = fields.userId; // 获取额外的字段，比如用户ID

    const result = await this.uploadService.uploadVideo({ file, userId });

    console.log('Upload file:', file);
    // 测试-临时保存变量
    await this.videoService.setUserVideoFilePath(userId, file.data);

    // 在这里处理文件和用户ID，比如保存到数据库或移动到另一个目录
    return {
      success: true,
      message: 'OK',
      data: {
        ...result,
      },
    };
  }
}
