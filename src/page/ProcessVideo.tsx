import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Button, Slider, Select, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import http from '../utils/http.ts';
import { ResponseData } from '../interface.ts';
import Constants from '../utils/Constants.ts';

const { Option } = Select;
const ProcessVideo: React.FC = () => {
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 10]); // 使用双滑块控制时间范围
  const [filterType, setFilterType] = useState<string>('');
  const [volume, setVolume] = useState<number>(1); // 默认音量
  const [brightness, setBrightness] = useState<number>(0); // 默认亮度
  const [blur, setBlur] = useState<number>(0); // 默认模糊
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { videoUrl } = location.state || {};
    console.log('路由传递参数：', location, videoUrl);
    // handleSetTrace(data);

    setProcessedVideoUrl(videoUrl);

}, []);

const goHomePage = () => {
  navigate('/');
}

  const handleProcessVideo = async () => {
    const formData = new FormData();
    // if (videoFile) formData.append('video', videoFile);
    if (audioFile) formData.append('audio', audioFile);
    formData.append('videoPath', String(processedVideoUrl));
    formData.append('startTime', String(timeRange[0]));
    formData.append('endTime', String(timeRange[1]));
    formData.append('filterType', filterType);
    formData.append('volume', String(volume));
    formData.append('brightness', String(brightness));
    formData.append('blur', String(blur));

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
        setProcessedVideoUrl(data.data);
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

  return (
    <div style={{ padding: '30px' }}>
      <h1>视频编辑器</h1>

      {/* 处理后的视频预览 */}
      <div style={{ marginTop: '20px' }}>
        <h3>处理后的视频预览：</h3>
        {processedVideoUrl && <video controls width="600" src={Constants.BaseUrl + processedVideoUrl} /> }
      </div>

      {/* <Upload beforeUpload={(file) => { setVideoFile(file); return false; }} accept="video/*">
        <Button icon={<UploadOutlined />}>选择视频文件</Button>
      </Upload> */}
      <Upload beforeUpload={(file) => { setAudioFile(file); return false; }} accept="audio/*">
        <Button icon={<UploadOutlined />}>选择音频文件</Button>
      </Upload>

      {/* 时间范围选择器 (双滑块) */}
      <div style={{ marginBottom: 20 }}>
        <span>时间范围: </span>
        <Slider
          range
          min={0}
          max={60} // 假设最大时间为60秒
          step={1}
          value={timeRange}
          onChange={(value) => setTimeRange(value as [number, number])}
        />
      </div>

      {/* 选择滤镜类型 */}
      <Select placeholder="选择滤镜" onChange={setFilterType} style={{ width: 120, marginBottom: 20 }}>
        <Option value="lowpass">低通滤波</Option>
        <Option value="highpass">高通滤波</Option>
      </Select>

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
      
      <div className='flex'>
        <Button
          type="primary"
          onClick={handleProcessVideo}
          disabled={loading || !processedVideoUrl}
        >
          {loading ? <Spin /> : '处理视频'}
        </Button>

        <Button style={{ marginLeft: '20px' }} onClick={goHomePage}>返回</Button>
      </div>
    </div>
  );
};

export default ProcessVideo;
