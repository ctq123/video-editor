import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Button, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import http from '../utils/http';
import { ResponseData } from '../interface.ts';
import { Utils } from '../utils/Utils.ts';

const Start: React.FC = () => {
  const [fileList, setFileList] = useState<File[]>([]);
  // const [file1, setFile1] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 上传文件后将其存储在 state 中
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileChange = (info: any) => {
    console.log('handleFileChange', info);
    // setFileList(file?.fileList);
    // setFile1(info.file);
    if (!info.fileList || info.fileList.length === 0) { 
      setFileList([]);
    } else {
      setFileList((prev) => [...prev, info.file]);
    }
  };

  // 处理视频上传及剪辑操作
  const handleUpload = async () => {
    
    if (!fileList || !fileList.length) {
      message.error("请选择有效的视频");
      return;
    }

    const formData = new FormData();
    // formData.append(`file1`, file1);
    fileList.forEach((file) => {
      // console.log('file', i, file);
      formData.append(`videos`, file);
    });

    try {
      setLoading(true);
      const data: ResponseData = await http.post('/api/video/merge', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('data', data);

      if (data.success) {
        message.success('视频合并成功');
        Utils.setLocalStorage('processData', data, 5 * 60);
        // 这里可以添加合并后视频预览逻辑
        navigate('/process', { state: { data: data.data } });
      } else {
        message.error(data.message || '视频合并失败');
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
        multiple
        onChange={handleFileChange}
        accept="video/*"
      >
        <Button icon={<UploadOutlined />}>选择多个视频文件</Button>
      </Upload>

      {/* 上传按钮 */}
      <Button
        type="primary"
        onClick={handleUpload}
        style={{ marginTop: '20px' }}
        disabled={loading || !fileList.length}
      >
        {loading ? <Spin /> : '上传并处理视频'}
      </Button>
    </div>
  );
};

export default Start;
