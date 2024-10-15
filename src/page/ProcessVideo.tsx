import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Button, Slider, Select, message, Spin, Input } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import http from '../utils/http.ts';
import { ResponseData } from '../interface.ts';
// import Constants from '../utils/Constants.ts';
import { Utils } from '../utils/Utils.ts';
import './ProcessVideo.css';

const { Option } = Select;
const { TextArea } = Input;
const ProcessVideo: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 10]); // 使用双滑块控制时间范围
  const [fps, setFPS] = useState<string>('16');
  const [volume, setVolume] = useState<number>(1); // 默认音量
  const [brightness, setBrightness] = useState<number>(0); // 默认亮度
  const [blur, setBlur] = useState<number>(0); // 默认模糊
  const [watermarkText, setWatermarkText] = useState<string>('@author');
  const [videoWH, setVideoWH] = useState<string>('1280x720');
  const [crfValue, setCRFValue] = useState<number>(23); // 默认crf值
  // const [videoHeight, setVideoHeight] = useState<number>(720);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState<{ time: number; image: string }[]>([]);// 本地保存数据帧，方便操作
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [cutPoints, setCutPoints] = useState<{ time: number; cutLine: HTMLDivElement }[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const frameRate = 1; // 每秒提取一帧
  const frameWidth = 600;// 视频轨道宽度

  useEffect(() => {
    const { data } = location.state || {};
    console.log('路由传递参数：', location, data);
    const pdata = Utils.getLocalStorage('processData');
    // 路由中的参数不会过期，所以优先使用Utils.LocalStorage的参数;
    const { videoUrl, fileName, totalDuration } = pdata || {};
    console.log('videoUrl:', videoUrl, totalDuration);
    if (!fileName) {
      goHomePage();
      return;
    };

    setVideoUrl(videoUrl);
    setTimeRange([0, totalDuration]);

    getRemoteVideo(fileName); // 初始化
  }, []);

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

  const getRemoteVideo = async (fileName: string) => {
    if (!fileName) return;
    // 清空时间轴和帧数据
    if (timelineRef.current) {
      timelineRef.current.innerHTML = '';
    }
    setFrames([]);
    setCutPoints([]);

    getVideo(fileName);
  }

  const goHomePage = () => {
    navigate('/');
  }

  const getVideo = (fileName: string) => {
    if (!fileName) return;
    http.get(`/api/video/${fileName}`, { responseType: 'blob' })
      .then(response => {
        console.log('文件数据:', response); // 这里是完整的 response 对象
        // const blob = await response.blob(); // 获取视频的 Blob 对象
        // const videoURL = URL.createObjectURL(blob); // 创建 URL
        const videoURL = URL.createObjectURL(response.data);
        setVideoFile(response.data);
        // 你可以使用 videoURL 来展示文件，例如视频或图片
        if (videoRef.current) {
          videoRef.current.src = videoURL;
          videoRef.current.load();
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  // 提取视频帧
  const extractFrames = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    // video.crossOrigin = "anonymous"; // 设置跨域
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
            // frameElement.crossOrigin = "anonymous";
            frameElement.style.width = `${Math.max(50, frameWidth / totalFrames)}px`;
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

  // const cutVideo = () => {
  //   console.log('数据帧', frames);
  //   if (cutPoints.length === 2) {
  //     const [start, end] = cutPoints;
  //     console.log('开始时间：', start.time);
  //     console.log('结束时间：', end.time);
  //     // 在这里可以根据开始和结束点进行裁剪，使用 MediaSource API 或其他方式
  //   } else {
  //     console.log('请确保选择了开始点和结束点');
  //   }
  // };

  // const changeSpeed = (speed: number) => {
  //   if (videoRef.current) {
  //     videoRef.current.playbackRate = speed;
  //   }
  // };

  const handleProcessVideo = async () => {
    console.log('数据帧', frames);
    const formData = new FormData();
    // if (videoFile) formData.append('video', videoFile);
    const [videoWidth, videoHeight] = videoWH.split('x');
    if (audioFile) formData.append('audio', audioFile);
    if (subtitleFile) formData.append('subtitle', subtitleFile);
    if (cutPoints.length === 2) {
      const [start, end] = cutPoints;
      formData.append('startTime', String(start.time));
      formData.append('endTime', String(end.time));
    } else {
      formData.append('startTime', String(timeRange[0]));
      formData.append('endTime', String(timeRange[1]));
    }

    formData.append('videoPath', String(videoUrl));
    formData.append('fps', fps);
    formData.append('volume', String(volume));
    formData.append('brightness', String(brightness));
    formData.append('blur', String(blur));
    formData.append('watermarkText', watermarkText);
    formData.append('videoWidth', videoWidth);
    formData.append('videoHeight', videoHeight);
    formData.append('crfValue', String(crfValue));

    try {
      setLoading(true);
      const data: ResponseData = await http.post('/api/video/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        message.success('视频处理成功');
        // 这里可以添加视频预览逻辑
        const { fileName, totalDuration } = data.data;
        // setVideoUrl(videoUrl);
        getRemoteVideo(fileName);
        setTimeRange([0, Math.floor(totalDuration)]);
      } else {
        message.error(data.message || '视频处理失败');
      }
    } catch (error) {
      console.error(error);
      message.error('请求出错');
    } finally {
      setLoading(false);
    }
  };

  const beforeSubtitleUpload = (file: File) => {
    const isSubtitle = file.type === 'text/plain' || file.name.endsWith('.srt') || file.name.endsWith('.vtt') || file.name.endsWith('.ass');
    if (!isSubtitle) {
      message.error('只能上传 SRT 、ASS 或 VTT 格式的字幕文件！');
    } else {
      setSubtitleFile(file);
    }

    return false
  }


  return (
    <div className="container">
      <h2>视频编辑器</h2>
      {/* 处理后的视频预览 */}

      {/* 视频展示区 */}
      <video ref={videoRef} controls />

      {/* 时间轴轨道 */}
      <div ref={timelineRef} className="timeline"></div>

      {/* 操作控制区 */}
      {/* <div className="controls">
          <button onClick={cutVideo}>裁剪</button>
          <button onClick={() => changeSpeed(2)}>2x 速度</button>
          <button onClick={() => changeSpeed(1)}>正常速度</button>
      </div> */}

      {/* 隐藏canvas用于绘制帧 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* <Upload beforeUpload={(file) => { setVideoFile(file); return false; }} accept="video/*">
        <Button icon={<UploadOutlined />}>选择视频文件</Button>
      </Upload> */}
      <div className='video-control'>
        <div style={{ marginBottom: 20 }}>
          <div>字幕轨道: </div>
          <Upload beforeUpload={beforeSubtitleUpload} onRemove={() => setSubtitleFile(null)} accept=".srt,.vtt,.ass">
            <Button icon={<UploadOutlined />}>上传字幕文件</Button>
          </Upload>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div>音频轨道: </div>
          <Upload beforeUpload={(file) => { setAudioFile(file); return false; }} onRemove={() => setAudioFile(null)} accept="audio/*">
            <Button icon={<UploadOutlined />}>选择音频文件</Button>
          </Upload>
        </div>

        {/* 时间范围选择器 (双滑块) */}
        {/* <div style={{ marginBottom: 20 }}>
        <span>时间轨道（视频分割）: </span>
        <Slider
          range
          min={0}
          max={60} // 假设最大时间为60秒
          step={1}
          value={timeRange}
          onChange={(value) => setTimeRange(value as [number, number])}
        />
      </div> */}

        <div style={{ marginBottom: 20 }}>
          <span>视频质量: </span>
          {/* 选择帧率 */}
          <Select placeholder="选择视频质量" value={fps} onChange={setFPS} style={{ width: 120, marginBottom: 20 }}>
            <Option value="16">16 FPS</Option>
            <Option value="32">32 FPS</Option>
            <Option value="64">64 FPS</Option>
          </Select>
        </div>

        {/* 音量调节 (单滑块) */}
        <div style={{ marginBottom: 20 }}>
          <span>音量: </span>
          <Slider
            min={0}
            max={10}
            step={0.1}
            value={volume}
            onChange={(value) => setVolume(value)}
          />
        </div>

        {/* 亮度调节 (单滑块) */}
        <div style={{ marginBottom: 20 }}>
          <span>亮度: </span>
          <Slider
            min={-1}
            max={1}
            step={0.1}
            value={brightness}
            onChange={(value) => setBrightness(value)}
          />
        </div>

        {/* 模糊调节 (单滑块) */}
        <div style={{ marginBottom: 20 }}>
          <span>模糊: </span>
          <Slider
            min={0}
            max={10}
            step={0.1}
            value={blur}
            onChange={(value) => setBlur(value)}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <span>水印: </span>
          <TextArea placeholder="Autosize height based on content lines" autoSize value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <span>视频尺寸: </span>
          <Select placeholder="选择视频尺寸" value={videoWH} onChange={setVideoWH} style={{ width: 120, marginBottom: 20 }}>
            <Option value="640x480">640 x 480</Option>
            <Option value="1280x720">1280 x 720</Option>
            <Option value="1920x1080">1920 x 1080</Option>
          </Select>
        </div>

        <div style={{ marginBottom: 100 }}>
          <span>视频压缩率（范围 0-51，值越低质量越高）: </span>
          <Slider
            min={0}
            max={51}
            step={1}
            value={crfValue}
            onChange={(value) => setCRFValue(value)}
          />
        </div>
      </div>

      <div className='bottom-fixed flex-center'>
        <Button
          type="primary"
          onClick={handleProcessVideo}
          disabled={loading || !videoUrl}
        >
          {loading ? <Spin /> : '处理视频'}
        </Button>

        <Button style={{ marginLeft: '20px' }} onClick={goHomePage}>返回</Button>
      </div>
    </div>
  );
};

export default ProcessVideo;
