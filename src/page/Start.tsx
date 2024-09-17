import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import ExamPage from './ExamPage';
import Draggable from '../components/Draggable';
import CameraRecord, { CameraRecordHandle } from '../components/CameraRecord';
import useUserRecordHook, { UserRecordHookRef } from '../hooks/useUserRecordHook';
import http from '../utils/http';
import { AxiosRequestConfig } from 'axios';
import './Start.css'

const Start: React.FC = () => {
  const [isStart, setIsStart] = useState(false);
  const [showRecorder, setShowRecorder] = useState<boolean>(false); // 是否显示录制器
  const cameraRecordRef = useRef<CameraRecordHandle | null>(null);
  const userRecordHookRef = useRef<UserRecordHookRef>(null);
  // 使用自定义 Hook
  const { getUserAction } = useUserRecordHook(userRecordHookRef, isStart, () => handleStartExam(), () => handleQuitExam());
  const navigate = useNavigate();

  const handleRecordingStart = () => {
    setShowRecorder(true);

    setTimeout(() => {
      if (cameraRecordRef.current) {
        cameraRecordRef.current.startRecording();
      }
    }, 100);
  };

  const handleRecordingError = () => {
    console.log('录制出现异常');
    setShowRecorder(false);
  };

  const handleRecordingComplete = async (blob: Blob, url: string) => {
    // 录制完成，处理blob对象，关闭录制器
    setShowRecorder(false);

    // 上传录制数据到服务器
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');
    formData.append('userId', '1');

    // 配置请求
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data' // 通常 axios 会自动设置
      },
    };

    try {
      const result = await http.post('/api/upload/video', formData, config);
      console.log('上传成功:', result);

      goDetectPage(url);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmitUserAction = async () => {
    // 处理用户行为，例如发送到服务器或执行其他操作
    // console.log('User action:', userActionRef.current);
    try {
      const formData = {
        userId: 1, // TODO: 获取用户ID
        userAction: getUserAction(),
      }
      await http.post('/api/exam/user-action', formData);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // 打开全屏
  const openFullscreen = () => {
    if (userRecordHookRef.current) {
      userRecordHookRef.current.openFullscreen();
    }
  }

  // 进入全屏-开始考试
  const handleStartExam = () => {
    setIsStart(true);
  }

  // 退出全屏-退出考试
  const handleQuitExam = () => {
    setIsStart(false);
    // TODO: 上传当前记录和答案
    console.log('当前用户行为记录:', getUserAction());
  }

  const handleFinishCB = () => {
    if (cameraRecordRef.current) {
      cameraRecordRef.current.stopRecording();
    }
    // 关闭录制器
    setShowRecorder(false);

    // 上传用户行为
    handleSubmitUserAction();
  };

  const goDetectPage = (url: string) => {
    const confirmed = window.confirm('考试已结束，选择是否查看监控数据?');
    if (confirmed) {
      // 用户点击了“确定”
      console.log('User confirmed');

      // 自动下载录制文件
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recording.webm';
      a.click();

      const data = getUserAction();
      console.log('userActionRef.current: ', data)
      navigate('/detect', { state: { data } });

    } else {
      // 用户点击了“取消”
      console.log('User canceled');
    }
  }

  const margin = 10;
  const width = 200; // 或自定义宽度
  return (
    <div className='container flex center flex-column'>
      <>
        {/* 外部按钮 */}
        {!showRecorder && (
          <div className='flex flex-column center'>
            <h1>xxx公司在线笔试</h1>
            <button
              className='button'
              onClick={handleRecordingStart}
            >
              开始录制
            </button>
          </div>
        )}


        {/* CameraRecord 组件 */}
        {showRecorder && (
          <>
            <Draggable
              width={width}
              height={50}
              initialX={window.innerWidth - width - margin}
              initialY={margin}
              margin={margin}>
              <CameraRecord
                ref={cameraRecordRef}
                onRecordingError={handleRecordingError}
                onRecordingComplete={handleRecordingComplete}
                videoHeight={50}
                videoWidth={100}
              />
            </Draggable>

            {/* 在线笔试页面 */}
            {isStart
              ?
              <ExamPage onFinishExam={handleFinishCB} />
              :
              <div className='flex flex-column center'>
                <h1>xxx公司在线笔试</h1>
                <button className='button' onClick={() => openFullscreen()}>开始考试</button>
              </div>
            }
          </>
        )}
      </>
    </div>
  )
}

export default Start
