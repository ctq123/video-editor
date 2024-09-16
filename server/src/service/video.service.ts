import { Provide } from '@midwayjs/core';
import * as ffmpeg from 'fluent-ffmpeg';
import * as faceapi from 'face-api.js';
// import * as canvas from 'canvas';
import * as path from 'path';
// import { Canvas, Image, ImageData } from 'canvas';
import { Canvas, loadImage, Image, ImageData } from 'canvas';

// faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
// 设定 canvas 和 face-api.js 环境
faceapi.env.monkeyPatch({
  Canvas: Canvas as any,
  Image: Image as any,
  ImageData: ImageData as any,
});

const videoFilePathMap = {}; // 临时变量-测试使用

@Provide()
export class VideoService {
  private modelsLoaded = false;

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

  // 加载模型
  async loadModels() {
    if (!this.modelsLoaded) {
      const modelPath = path.join(__dirname, '../models'); // 模型路径
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
      this.modelsLoaded = true;
    }
  }

  // 检测人脸
  async detectFaces(imagePath: string) {
    await this.loadModels();
    const image = await loadImage(imagePath);

    const detections = await faceapi
      .detectAllFaces(image as any)
      .withFaceLandmarks()
      .withFaceDescriptors();
    return detections;
  }
}
