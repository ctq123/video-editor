import { Provide } from '@midwayjs/core';
import { IUploadOptions } from '../interface';

@Provide()
export class UploadService {
  async uploadVideo(options: IUploadOptions) {
    const { file, userId } = options;
    const { filename, filepath } = file;
    // proc
    // TODO: 另外一个服务，分析video

    return {
      userId,
      filename,
      filepath,
    };
  }
}
