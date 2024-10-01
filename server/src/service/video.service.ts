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

  private getVideoDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const duration = metadata.format.duration; // 获取视频时长（秒）
          resolve(duration);
        }
      });
    });
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

  async uploadVideo(
    inputPath: string,
    startTime: number,
    endTime: number
  ): Promise<string> {
    const outputDir = path.join(__dirname, '../upload');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `upload_${Date.now()}.mp4`);

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

  async mergeVideos(
    videoPaths: string[]
  ): Promise<{ outputPath: string; totalDuration: number }> {
    const outputDir = path.join(__dirname, '../upload');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `merged_${Date.now()}.mp4`);

    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      videoPaths.forEach(videoPath => {
        command.input(videoPath);
      });

      command
        .on('end', async () => {
          // 获取视频时长
          try {
            const totalDuration = await this.getVideoDuration(outputPath);
            resolve({ outputPath, totalDuration });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err: Error) => {
          reject(err);
        })
        .mergeToFile(outputPath);
    });
  }

  async processVideo(
    inputPath: string,
    audioPath: string,
    startTime: number,
    endTime: number,
    filterType: string,
    volume: number,
    brightness: number,
    blur: number
  ): Promise<{ outputPath: string; totalDuration: number }> {
    const outputDir = path.join(__dirname, '../upload');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `processed_${Date.now()}.mp4`);

    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(endTime - startTime)
        .output(outputPath);

      // 添加视频滤镜
      const videoFilters = [];

      if (filterType === 'lowpass') {
        videoFilters.push('lowpass=f=3000');
      } else if (filterType === 'highpass') {
        videoFilters.push('highpass=f=300');
      }

      // 添加亮度调节
      if (brightness !== 0) {
        videoFilters.push(`eq=brightness=${brightness}`);
      }

      // 添加模糊调节
      if (blur > 0) {
        videoFilters.push(`boxblur=${blur}`);
      }

      // 应用所有视频滤镜
      if (videoFilters.length > 0) {
        command.videoFilter(videoFilters.join(','));
      }

      // 添加背景音乐和音量
      command
        .addInput(audioPath)
        .audioFilter(`volume=${volume}`) // 设置音量
        .on('end', async () => {
          // 获取视频时长
          try {
            const totalDuration = await this.getVideoDuration(outputPath);
            resolve({ outputPath, totalDuration });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', err => {
          reject(err);
        })
        .mergeToFile(outputPath);
    });
  }
}
