import { Provide } from '@midwayjs/core';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { TranscodeOptions } from '../interface';

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

  /**
   * 转码视频为不同格式
   * @param {string} inputPath - 输入文件路径
   * @param {string} format - 要转码的格式列表 (如 ['mp4', 'avi', 'mkv'])
   * @param {Object} options - 转码选项
   * @param {string} [options.videoBitrate] - 视频比特率（可选）
   * @param {string} [options.resolution] - 视频分辨率（可选）
   * @param {string} [options.audioBitrate] - 音频比特率（可选）
   */
  transcodeToFormat(
    inputPath: string,
    format: string,
    options: TranscodeOptions = {}
  ): Promise<{ outputPath: string }> {
    const outputDir = path.join(__dirname, '../upload');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      // 根据格式命名输出文件
      const outputPath = path.join(outputDir, `trans_${Date.now()}.${format}`);
      const command = ffmpeg(inputPath)
        .output(outputPath)
        .on('start', () => {
          console.log(`开始转码为 ${format} 格式...`);
        })
        .on('progress', progress => {
          console.log(`转码 ${format} 进度: ${progress.percent}% done`);
        })
        .on('end', () => {
          console.log(`${format} 格式转码完成`);
          resolve({ outputPath });
        })
        .on('error', err => {
          console.error(`${format} 格式转码出错:`, err);
          reject(err);
        });

      // 设置视频编码器和格式
      if (format === 'mp4') {
        command.videoCodec('libx264').audioCodec('aac');
      } else if (format === 'avi') {
        command.videoCodec('libxvid').audioCodec('mp3');
      } else if (format === 'mkv') {
        command.videoCodec('libx264').audioCodec('aac');
      }

      // 根据用户传入的参数设置视频/音频选项
      if (options.videoBitrate) {
        command.videoBitrate(options.videoBitrate);
      }
      if (options.resolution) {
        command.size(options.resolution);
      }
      if (options.audioBitrate) {
        command.audioBitrate(options.audioBitrate);
      }

      // 执行转码
      command.run();
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
    audioPath: string | null, // 允许 audioPath 为 null
    subtitlePath: string | null,
    startTime: number,
    endTime: number,
    fps: number,
    volume: number,
    brightness: number,
    blur: number,
    watermarkText: string | null, // 文本水印
    videoWidth: number,
    videoHeight: number,
    crfValue: number
  ): Promise<{ outputPath: string; totalDuration: number }> {
    const outputDir = path.join(__dirname, '../upload');

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 生成唯一的输出文件路径
    const outputPath = path.join(outputDir, `processed_${Date.now()}.mp4`);
    console.log('Output path:', outputPath); // Debug output path

    return new Promise((resolve, reject) => {
      // 检查输入文件是否存在
      if (!fs.existsSync(inputPath)) {
        return reject(new Error('Input file does not exist.'));
      }

      const command = ffmpeg(inputPath);
      command.setStartTime(startTime).setDuration(endTime - startTime); // 设置开始时间和持续时间

      if (videoHeight > 0 && videoWidth > 0) {
        command.size(`${videoWidth}x${videoHeight}`).autopad(); // 设置视频尺寸
        // command.outputOptions(`-vf scale=${videoWidth}:${videoHeight}`);
      }

      // 设置压缩率
      command.outputOptions(`-crf ${crfValue}`);

      if (subtitlePath) {
        // console.log('Subtitle path:', subtitlePath); // Debug subtitle path
        command.outputOptions('-vf', `subtitles=${subtitlePath}`); // 添加字幕
      }

      if (audioPath) {
        command
          .addInput(audioPath)
          .audioFilters([
            {
              filter: 'volume',
              options: [volume || 0],
            }, // 设置音量
            {
              filter: 'silencedetect',
              options: { n: '-50dB', d: 5 },
            }, // 检测静音
          ])
          .audioCodec('aac') // 设置音频编解码器
          // .videoCodec('copy') // 保持视频编解码器
          .outputOptions('-shortest'); // 确保输出文件与最短流（视频或音频）长度相同
      }

      // 添加视频滤镜
      const videoFilters: string[] = [];

      // 添加亮度调节
      videoFilters.push(`eq=brightness=${brightness || 0}`);

      // 添加模糊调节
      videoFilters.push(`boxblur=${blur || 0}`);

      // 添加文本水印
      if (watermarkText) {
        console.log('watermarkText', watermarkText);
        const textFilter = `drawtext=text='${watermarkText}':fontcolor=white:fontsize=${24}:x=(W-w)/2:y=(H-h)/2`;
        videoFilters.push(textFilter);
      }

      // 应用所有视频滤镜
      if (videoFilters.length > 0) {
        command
          .videoCodec('libx264') // 设置视频编解码器
          .videoFilter(videoFilters.join(','));
      }

      command.fps(fps); // 设置帧率

      command
        .on('end', async () => {
          console.log('视频处理完成！');
          // 获取视频时长
          try {
            const totalDuration = await this.getVideoDuration(outputPath);
            resolve({ outputPath, totalDuration });
          } catch (error) {
            console.error('获取视频时长失败：', error);
            reject(error);
          }
        })
        .on('error', err => {
          console.error('发生错误：', err);
          reject(err);
        })
        .save(outputPath);
    });
  }
}
