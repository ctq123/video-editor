import { Provide } from '@midwayjs/core';
import { IUploadOptions } from '../interface';

@Provide()
export class UploadService {
  async uploadVideo(options: IUploadOptions) {
    const { file, userId } = options;
    const { filename, filepath } = file;
    // proc
    // TODO: 将用户与文件进行绑定，存入数据库，目的是可以根据用户ID找到监控文件
    // TODO: 另外一个服务，分析video，提取关键帧，分析用户行为

    return {
      userId,
      filename,
      filepath,
    };
  }
}
