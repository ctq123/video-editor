import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Button, Slider, Select, message, Spin, Input } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import http from '../utils/http.ts';
import { ResponseData } from '../interface.ts';
import Constants from '../utils/Constants.ts';
import { Utils } from '../utils/Utils.ts';

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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data } = location.state || {};
    console.log('路由传递参数：', location, data);
    const pdata = Utils.getLocalStorage('processData');
    // 路由中的参数不会过期，所以优先使用Utils.LocalStorage的参数;
    const { videoUrl, totalDuration } = pdata || {};
    console.log('videoUrl:', videoUrl, totalDuration);
    if (!videoUrl) {
      goHomePage();
      return;
    };

    setVideoUrl(videoUrl);
    setTimeRange([0, Math.floor(totalDuration)]);
  }, []);

  const goHomePage = () => {
    navigate('/');
  }

  const handleProcessVideo = async () => {
    const formData = new FormData();
    // if (videoFile) formData.append('video', videoFile);
    const [videoWidth, videoHeight] = videoWH.split('x');
    if (audioFile) formData.append('audio', audioFile);
    if (subtitleFile) formData.append('subtitle', subtitleFile);
    formData.append('videoPath', String(videoUrl));
    formData.append('startTime', String(timeRange[0]));
    formData.append('endTime', String(timeRange[1]));
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
        const { videoUrl, totalDuration } = data.data;
        setVideoUrl(videoUrl);
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
    <div style={{ padding: '30px' }}>
      <h1>视频编辑器</h1>

      {/* 处理后的视频预览 */}
      <div style={{ marginTop: '20px' }}>
        <h3>处理后的视频预览：</h3>
        {videoUrl && <video controls width="600" src={Constants.BaseUrl + videoUrl} />}
      </div>

      {/* <Upload beforeUpload={(file) => { setVideoFile(file); return false; }} accept="video/*">
        <Button icon={<UploadOutlined />}>选择视频文件</Button>
      </Upload> */}
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
      <div style={{ marginBottom: 20 }}>
        <span>时间轨道（视频分割）: </span>
        <Slider
          range
          min={0}
          max={60} // 假设最大时间为60秒
          step={1}
          value={timeRange}
          onChange={(value) => setTimeRange(value as [number, number])}
        />
      </div>

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

      <div style={{ marginBottom: 20 }}>
        <span>视频压缩率（范围 0-51，值越低质量越高）: </span>
        <Slider
          min={0}
          max={51}
          step={1}
          value={crfValue}
          onChange={(value) => setCRFValue(value)}
        />
      </div>

      <div className='flex'>
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
