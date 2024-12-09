import React, { useRef, useState, useEffect } from 'react';
import './ProcessVideo.css'


// TODO: 添加本地化web worker处理视频剪辑
const VideoEditor: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState<{ time: number; image: string }[]>([]);
  const [cutPoints, setCutPoints] = useState<{ time: number; cutLine: HTMLDivElement }[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const frameRate = 1; // 每秒提取一帧

  // 上传视频并初始化时间轴
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 清空时间轴和帧数据
      if (timelineRef.current) {
        timelineRef.current.innerHTML = '';
      }
      setFrames([]);
      setCutPoints([]);
      setVideoFile(file); // 保存当前视频文件

      const videoURL = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = videoURL;
        videoRef.current.load();
      }
    }
  };

  // 提取视频帧
  const extractFrames = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const totalFrames = Math.floor(video.duration * frameRate); // 总帧数
    let currentFrame = 0;

    const frameInterval = setInterval(() => {
      if (currentFrame < totalFrames) {
        const time = currentFrame / frameRate;
        video.currentTime = time;

        // 等待当前时间帧加载
        video.addEventListener('seeked', () => {
          if (ctx) {
            // 绘制当前帧到canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // 获取当前帧的图像数据
            const frameImage = canvas.toDataURL();
            setFrames(prevFrames => [
              ...prevFrames,
              { time: time, image: frameImage }
            ]);

            // 添加帧到时间轴
            const frameElement = document.createElement('img');
            frameElement.src = frameImage;
            frameElement.style.width = `${Math.max(50, 600 / totalFrames)}px`;
            frameElement.className = 'video-frame';
            frameElement.dataset.time = time.toString();
            frameElement.onclick = () => addOrUpdateCutLine(time, frameElement);

            if (timelineRef.current) {
              timelineRef.current.appendChild(frameElement);
            }
          }
        }, { once: true }); // 只监听一次，避免重复执行

        currentFrame++;
      } else {
        clearInterval(frameInterval);
      }
    }, 1000 / frameRate); // 每秒提取一帧
  };

  const addOrUpdateCutLine = (time: number, frameElement: HTMLImageElement) => {
    setCutPoints((prevCutPoints) => {
      const updatedCutPoints = [...prevCutPoints];
      // const updatedCutPoints = [...cutPoints];

      if (updatedCutPoints.length === 2) {
        const [start, end] = updatedCutPoints;
        const closestPoint = Math.abs(time - start.time) < Math.abs(time - end.time) ? start : end;
        closestPoint.time = time; // 更新时间
        closestPoint.cutLine.style.left = frameElement.offsetLeft + 'px'; // 更新切割线位置
      } else {
        // 如果少于两个切割点，直接添加新点
        const cutLine = document.createElement('div');
        cutLine.className = 'cut-line';
        cutLine.style.left = frameElement.offsetLeft + 'px'; // 设置切割线位置
        frameElement.parentElement?.appendChild(cutLine); // 在轨道上显示切割线
        updatedCutPoints.push({ time, cutLine }); // 存储切割点信息
      }

      // setCutPoints(updatedCutPoints);
      console.log('当前切割点：', updatedCutPoints.map(p => p.time));
      return updatedCutPoints;
    });
  };

  const cutVideo = () => {
    console.log('数据帧', frames);
    if (cutPoints.length === 2) {
      const [start, end] = cutPoints;
      console.log('开始时间：', start.time);
      console.log('结束时间：', end.time);
      // 在这里可以根据开始和结束点进行裁剪，使用 MediaSource API 或其他方式
    } else {
      console.log('请确保选择了开始点和结束点');
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // 监听视频元数据加载
  useEffect(() => {
    if (videoRef.current) {
      const handleLoadedMetadata = () => {
        if (canvasRef.current) {
          canvasRef.current.width = videoRef.current?.videoWidth || 0;
          canvasRef.current.height = videoRef.current?.videoHeight || 0;
        }
        extractFrames(); // 提取帧
      };

      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [videoFile]);

  return (
    <div className="container">
      {/* 本地视频上传控件 */}
      <input type="file" accept="video/*" onChange={handleVideoUpload} />

      {/* 视频展示区 */}
      <video ref={videoRef} controls />

      {/* 时间轴轨道 */}
      <div ref={timelineRef} className="timeline"></div>

      {/* 操作控制区 */}
      <div className="controls">
        <button onClick={cutVideo}>裁剪</button>
        <button onClick={() => changeSpeed(2)}>2x 速度</button>
        <button onClick={() => changeSpeed(1)}>正常速度</button>
      </div>

      {/* 隐藏canvas用于绘制帧 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default VideoEditor;
