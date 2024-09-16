import { Controller, Get } from '@midwayjs/core';
import * as path from 'path';
import * as fs from 'fs';

@Controller('/images')
export class ImagesController {
  @Get('/:filename')
  async getImage(ctx) {
    const filename = ctx.params.filename;
    const imagePath = path.join(__dirname, '../output', filename);

    console.log('Requested Image Path:', imagePath);

    if (fs.existsSync(imagePath)) {
      ctx.body = fs.createReadStream(imagePath);
      ctx.type = 'image/jpeg'; // 根据实际图片类型设置
      console.log('Serving Image:', filename);
    } else {
      ctx.status = 404;
      ctx.body = 'Image not found';
      console.log('Image Not Found:', filename);
    }
  }
}
