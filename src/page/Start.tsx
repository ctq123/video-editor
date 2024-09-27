import React, { useState } from 'react';
import { Upload, Button, InputNumber, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import http from '../utils/http';

const baseUrl = 'http://localhost:7001';
const Start = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 上传文件后将其存储在 state 中
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileChange = (info: any) => {
    // const { status, originFileObj } = info.file;
    console.log('handleFileChange', info);

    // if (status === 'done') {
    //   setVideoFile(originFileObj);
    //   message.success(`${info.file.name} 上传成功`);
    // } else if (status === 'error') {
    //   message.error(`${info.file.name} 上传失败`);
    // }

    if (!info.file) return;
    setVideoFile(info.file);
  };

  // 处理视频上传及剪辑操作
  const handleUpload = async () => {
    if (!videoFile || startTime >= endTime) {
      message.error("请选择有效的视频和时间段");
      return;
    }

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('startTime', startTime.toString());
    formData.append('endTime', endTime.toString());

    try {
      setLoading(true);
      const response = await http.post('/api/video/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { data } = response;
      if (data.success) {
        setProcessedVideoUrl(`${baseUrl}${data.videoUrl}`);
        message.success('视频处理成功');
      } else {
        message.error('视频处理失败');
      }
    } catch (error) {
      console.log(error);
      message.error('请求出错');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <h1>视频编辑器</h1>

      {/* 文件上传 */}
      <Upload
        beforeUpload={() => false}  // 不自动上传，先存储文件
        onChange={handleFileChange}
        accept="video/*"
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>选择视频文件</Button>
      </Upload>

      {/* 视频预览 */}
      {videoFile && (
        <div style={{ marginTop: '20px' }}>
          <h3>原视频预览：</h3>
          <video controls width="600" src={URL.createObjectURL(videoFile)} />
        </div>
      )}

      {/* 开始和结束时间选择 */}
      <div style={{ marginTop: '20px' }}>
        <InputNumber
          min={0}
          value={startTime}
          onChange={(v) => setStartTime(Number(v))}
          placeholder="开始时间"
          style={{ marginRight: '10px' }}
        />
        <InputNumber
          min={startTime || 0}
          value={endTime}
          onChange={(v) => setEndTime(Number(v))}
          placeholder="结束时间"
        />
      </div>

      {/* 上传按钮 */}
      <Button
        type="primary"
        onClick={handleUpload}
        style={{ marginTop: '20px' }}
        disabled={loading || !videoFile || startTime >= endTime}
      >
        {loading ? <Spin /> : '上传并处理视频'}
      </Button>

      {/* 处理后的视频预览 */}
      {processedVideoUrl && (
        <div style={{ marginTop: '20px' }}>
          <h3>处理后的视频预览：</h3>
          <video controls width="600" src={processedVideoUrl} />
        </div>
      )}
    </div>
  );
};

export default Start;
