import { Provide } from '@midwayjs/core';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';

const videoFilePathMap = {}; // 临时变量-测试使用

@Provide()
export class VideoService {
  async setUserVideoFilePath(userId: string | number, filepath: string) {
    // 测试使用
    videoFilePathMap[userId] = filepath;

    console.log('setUserVideoFilePath:', videoFilePathMap[userId]);
    return videoFilePathMap[userId];
  }

  getUserVideoFilePath(userId: string | number) {
    console.log('videoFilePathMap', videoFilePathMap);
    // 测试使用
    return videoFilePathMap[userId] || '';
  }

  // 提取关键帧的方法
  async extractKeyFrames(
    videoPath: string,
    outputDir: string,
    interval: number,
    keyFrameCount: number
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const timemarks = Array.from(
        { length: Math.ceil(60 / interval) },
        (_, i) => ((i + 1) * interval).toFixed(2)
      );

      ffmpeg(videoPath)
        .on('end', (data: any) => {
          console.log('Key frame extraction completed.', data);
          resolve(keyFrameCount);
        })
        .on('error', (err: any) => {
          console.error('Error extracting key frames:', err);
          reject(err);
        })
        .screenshots({
          count: keyFrameCount, // 提取的关键帧数量
          folder: outputDir, // 输出目录
          filename: 'keyframe-%i.png', // 输出文件名
          timemarks: timemarks, // 从开始每隔 interval 秒提取关键帧
        });
    });
  }

  async processVideo(
    inputPath: string,
    startTime: number,
    endTime: number
  ): Promise<string> {
    const outputDir = path.join(__dirname, '../upload');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `processed_${Date.now()}.mp4`);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(endTime - startTime)
        .output(outputPath)
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', err => {
          reject(err);
        })
        .run();
    });
  }
}
