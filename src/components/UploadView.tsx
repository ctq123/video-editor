import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Upload, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import http from '../utils/http.ts';
import { ResponseData, VideoData } from '../interface.ts';
// import { Utils } from '../utils/Utils.ts';

interface UploadViewProps {
  successCallback: (data: VideoData) => void;
}

const UploadView: React.FC<UploadViewProps> = ({ successCallback }) => {
  const [fileList, setFileList] = useState<File[]>([]);
  // const [file1, setFile1] = useState(null);
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileChange = (info: any) => {
    console.log('handleFileChange', info);
    setFileList((prev) => [...prev, info.file]);
  };

  // const handleRemove = (file: File) => {
  //   setFileList(prev => prev.filter(item => item !== file));
  // };

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
        // Utils.setLocalStorage('processData', data.data, 60 * 60);
        // 这里可以添加合并后视频预览逻辑
        // navigate('/process', { state: { data: data.data } });

        successCallback(data.data);
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

  // console.log('fileList', fileList);

  return (
    <>
      <div className='flex-between w-100'>
        <div className='block-title'>本地</div>
        <Button
          type="dashed" 
          danger
          size='small'
          onClick={handleUpload}
          loading={loading}
          disabled={loading || !fileList.length}
        >
          上传
        </Button>
      </div>
      
      <div className='block-content upload-content'>
      <Upload
        accept="video/*"
        showUploadList={false}
        onChange={handleFileChange}
        beforeUpload={() => false} // 禁止自动上传，改为手动处理
      >
        <Button type="primary" shape="circle" icon={<PlusOutlined />} />
        <span style={{ marginLeft: 8 }}>导入</span>
        <div className='block-desc'>支持多个视频</div>
      </Upload>

      <div className="flex mt-2">
        {fileList.map((file, index) => (
          <video
            key={index}
            controls
            style={{ width: 200, maxHeight: 200, marginRight: 8 }}
          >
            <source src={URL.createObjectURL(file)} type={file.type} />
            您的浏览器不支持视频标签。
          </video>
        ))}
      </div>
      </div>
    </>
  );
};

export default UploadView;
