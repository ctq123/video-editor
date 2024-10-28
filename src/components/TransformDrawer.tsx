import React from 'react';
import { Button, Col, Drawer, Form, Row, Select, message } from 'antd';
import type { FormProps } from 'antd';
import http from '../utils/http.ts';
import { ResponseData } from '../interface.ts';
import { Utils } from '../utils/Utils.ts';

interface IProps {
  videoUrl: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

type FieldType = {
  format?: string;
  videoBitrate?: string;
  resolution?: string;
  audioBitrate?: string;
};

const { Option } = Select;

const TransformDrawer: React.FC<IProps> = ({ videoUrl, isOpen, setIsOpen }) => {
  const [loading, setLoading] = React.useState(false);

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    console.log('参数:', values);
    handleTransformCode(values);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const handleTransformCode = async (values: FieldType) => {
    // console.log('数据帧', frames);
    const formData = new FormData();
    // if (videoFile) formData.append('video', videoFile);
    formData.append('videoPath', String(videoUrl));
    formData.append('format', String(values.format));

    if (values.videoBitrate) {
      formData.append('videoBitrate', String(values.videoBitrate));
    }
    if (values.videoBitrate) {
      formData.append('resolution', String(values.resolution));
    }
    if (values.videoBitrate) {
      formData.append('audioBitrate', String(values.audioBitrate));
    }

    try {
      setLoading(true);
      const data: ResponseData = await http.post('/api/video/trans', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        message.success('视频处理成功');
        // 这里可以添加视频预览逻辑
        const { fileName } = data.data;
        // setVideoUrl(videoUrl);
        console.log('视频处理成功', fileName);

        handleDownload(fileName); // 下载视频
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

  const handleDownload = (fileName: string) => {
    if (!fileName) return;
    http.get(`/api/video/${fileName}`, { responseType: 'blob' })
      .then(response => {
        console.log('文件数据:', response); // 这里是完整的 response 对象
        const videoURL = URL.createObjectURL(response.data);
        Utils.DownloadFile(videoURL, fileName);

        setIsOpen(false); // 关闭抽屉
      })
      .catch(error => {
        console.error(error);
        message.error('视频下载失败');
      });
  }

  return (
    <>
      <Drawer
        title="转换视频编码"
        width={400}
        onClose={onClose}
        open={isOpen}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
      >
        <Form layout="vertical"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 400 }}
          onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="format"
                label="转换格式"
                rules={[{ required: true, message: '请选择格式' }]}
              >
                <Select placeholder="请选择格式">
                  <Option value="mp4">mp4</Option>
                  <Option value="mkv">mkv</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="videoBitrate"
                label="视频比特率"
                rules={[{ required: false, message: '请选择视频比特率' }]}
              >
                <Select placeholder="请选择视频比特率" allowClear>
                  <Option value="1000k">1000k</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="resolution"
                label="视频分辨率"
                rules={[{ required: false, message: '请选择视频分辨率' }]}
              >
                <Select placeholder="请选择视频分辨率" allowClear>
                  <Option value="1280x720">1280 x 720</Option>
                  <Option value="960x640">960 x 640</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="audioBitrate"
                label="音频比特率"
                rules={[{ required: false, message: '请选择音频比特率' }]}
              >
                <Select placeholder="请选择音频比特率" allowClear>
                  <Option value="128k">128k</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  开始转换
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
};

export default TransformDrawer;