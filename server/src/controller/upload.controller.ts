import { Controller, Post, Inject, Files, Body, Get } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/api/upload')
export class UploadController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home(): Promise<string> {
    return 'Hello Midwayjs!';
  }

  @Post('/video')
  async uploadVideo(@Files() files, @Body() body) {
    console.log('Files:', files);
    console.log('Body:', body);

    if (!files || files.length === 0) {
      return {
        success: true,
        message: 'No file uploaded',
        data: {},
      };
    }

    const file = files[0]; // 获取上传的文件
    const userId = body.userId; // 获取额外的字段，比如用户ID

    if (file) {
      const { filename, filepath } = file;

      // 在这里处理文件和用户ID，比如保存到数据库或移动到另一个目录
      return {
        success: true,
        message: 'OK',
        data: {
          filename,
          filepath,
          userId, // 返回用户ID
        },
      };
    } else {
      return {
        success: true,
        message: 'No file uploaded',
        data: {},
      };
    }
  }
}
