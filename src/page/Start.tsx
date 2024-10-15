import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Button, message, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import http from '../utils/http';
import { ResponseData } from '../interface.ts';
import { Utils } from '../utils/Utils.ts';

const Start: React.FC = () => {
  const [fileList, setFileList] = useState<File[]>([]);
  // const [file1, setFile1] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileChange = (info: any) => {
    console.log('handleFileChange', info);
    setFileList((prev) => [...prev, info.file]);
  };

  const handleRemove = (file: File) => {
    setFileList(prev => prev.filter(item => item !== file));
  };

  // 处理视频上传及剪辑操作
  const handleUpload = async () => {

    if (!fileList || !fileList.length) {
      message.error("请选择有效的视频");
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => {
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
        // message.success('视频合并成功');
        Utils.setLocalStorage('processData', data.data, 60 * 60);
        // 这里可以添加合并后视频预览逻辑
        navigate('/process', { state: { data: data.data } });
      } else {
        message.error(data.message || '视频上传失败');
      }
    } catch (error) {
      console.log(error);
      message.error('请求出错');
    } finally {
      setLoading(false);
    }
  };

  console.log('fileList', fileList);

  return (
    <div className='container flex-container'>
      <h1>视频编辑器</h1>

      <Upload
        accept="video/*"
        showUploadList={false}
        onChange={handleFileChange}
        beforeUpload={() => false} // 禁止自动上传，改为手动处理
      >
        <button style={{ border: 0, background: 'none' }} type="button">
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>添加视频</div>
        </button>
      </Upload>

      <div className="flex mt-2">
        {fileList.map((file, index) => (
          <Card
            key={index}
            style={{
              width: 200,
              marginRight: 20,
              marginBottom: 20,
            }}
            title={`视频 ${index + 1}`}
            extra={<Button onClick={() => handleRemove(file)}>删除</Button>}
          >
            <video
              controls
              style={{ width: '100%', maxHeight: '100px' }}
            >
              <source src={URL.createObjectURL(file)} type={file.type} />
              您的浏览器不支持视频标签。
            </video>
          </Card>
        ))}
      </div>
      {/* 上传按钮 */}
      <Button
        type="primary"
        onClick={handleUpload}
        style={{ marginTop: '20px' }}
        loading={loading}
        disabled={loading || !fileList.length}
      >
        {'上传并处理视频'}
      </Button>
    </div>
  );
};

export default Start;
