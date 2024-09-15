/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react'
import ExamPage from './ExamPage';
import Draggable from '../components/Draggable';
import CameraRecord, { CameraRecordHandle } from '../components/CameraRecord';
import './Start.css'

const Start: React.FC = () => {
  const [isStart, setIsStart] = useState(false);
  const [showRecorder, setShowRecorder] = useState<boolean>(false); // 是否显示录制器
  const cameraRecordRef = useRef<CameraRecordHandle | null>(null);

  useEffect(() => {
    // 监听全屏
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // 监听切屏
    document.addEventListener('visibilitychange', handleSwitchScreen);

    // 监听拷贝事件
    document.addEventListener('copy', handleCopy);
    // 监听剪切事件
    document.addEventListener('cut', handleCut);
    // 监听粘贴事件
    document.addEventListener('paste', handlePaste);

    // 监听鼠标离开视口
    document.addEventListener('mouseleave', handleMouseleave);
    // 监听窗口失去焦点
    document.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

      document.removeEventListener('visibilitychange', handleSwitchScreen);

      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);

      document.removeEventListener('mouseleave', handleMouseleave);
      document.removeEventListener('blur', handleBlur);
    }
  }, []);

  const openFullscreen = () => {
    const elem = document.documentElement as HTMLElement; // 选择要全屏的元素

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).mozRequestFullScreen) {
      // Firefox
      (elem as any).mozRequestFullScreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      // Chrome, Safari, and Opera
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) {
      // IE/Edge
      (elem as any).msRequestFullscreen();
    } else {
      alert('您的浏览器不支持全屏模式，请使用其他浏览器或手动全屏');
    }
  };

  const handleFullscreenChange = (event: Event) => {
    if (
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement || // 对应 WebKit 浏览器
      (document as any).mozFullScreenElement ||    // 对应 Firefox 浏览器
      (document as any).msFullscreenElement        // 对应 IE/Edge 浏览器
    ) {
      console.log('进入全屏');
      setIsStart(true);
    } else {
      console.log('退出全屏');
      // alert('确认退出考试？');
      // 处理退出全屏后的逻辑
      // proc
      setIsStart(false);

      // 自定义消息
      const confirmationMessage = '确认退出考试？';

      // 现代浏览器可能会忽略自定义消息
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      event.returnValue = confirmationMessage;
      return confirmationMessage;
    }
  }

  const handleSwitchScreen = () => {
    if (document.hidden) {
      console.log('页面不可见'); // 用户切换到了其他标签页或最小化了浏览器
      // proc

      // alert('用户切屏');
    } else {
      console.log('页面可见'); // 用户回到当前标签页
    }
  }

  const handleCopy = (event: ClipboardEvent) => {
    console.log('内容被拷贝', event);
    const selection: Selection | null = document.getSelection();
    // 获取拷贝的内容（有兼容性问题）
    // const copiedData = event?.clipboardData?.getData('text');
    // console.log('拷贝的内容:', copiedData);
    console.log('拷贝的内容:', selection?.toString());
    // proc

    alert('拷贝内容：' + selection?.toString());
  }

  const handleCut = (event: ClipboardEvent) => {
    console.log('内容被剪切');
    // 获取剪切的内容（如果需要）
    const cutData = event?.clipboardData?.getData('text');
    console.log('剪切的内容:', cutData);
  }

  const handlePaste = (event: ClipboardEvent) => {
    console.log('内容被粘贴');
    // 获取粘贴的内容
    const pastedData = event?.clipboardData?.getData('text');
    console.log('粘贴的内容:', pastedData);
  }

  const handleMouseleave = () => {
    console.log('鼠标离开了视口');
  }

  const handleBlur = () => {
    console.log('窗口失去焦点');
  }

  const handleRecordingStart = () => {
    setShowRecorder(true);
    if (cameraRecordRef.current) {
      cameraRecordRef.current.startRecording();
    }
  };

  const handleRecordingError = () => {
    console.log('录制出现异常');
    setShowRecorder(false);
  };

  const handleRecordingComplete = (blob: Blob, url: string) => {
    // 录制完成，处理blob对象，关闭录制器
    // setShowRecorder(false);

    // 上传录制数据到服务器
    const formData = new FormData();
    formData.append('video', blob, 'recording.webm');

    // fetch('/upload-endpoint', {
    //     method: 'POST',
    //     body: formData,
    // }).then(response => {
    //     console.log('Upload success:', response);
    // }).catch(error => {
    //     console.error('Upload error:', error);
    // });

    // 自动下载录制文件
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recording.webm';
    a.click();
  };

  const handleStopRecording = () => {
      if (cameraRecordRef.current) {
          cameraRecordRef.current.stopRecording();
      }
      // 关闭录制器
      setShowRecorder(false);
  };


  const margin = 10;
  const width = 200; // 或自定义宽度
  return (
    <div className='container flex flex-column center'>
      <h1>xxx公司在线笔试</h1>

      {/* 外部按钮 */}
      {!showRecorder && (
        <div className='center'>
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
            height={200}
            initialX={window.innerWidth - width - margin}
            initialY={margin}
            margin={margin}>
            <CameraRecord 
                ref={cameraRecordRef} 
                onRecordingError={handleRecordingError} 
                onRecordingComplete={handleRecordingComplete} 
            />
          </Draggable>

          {/* 在线笔试页面 */}
          {isStart ?
            <ExamPage />
            :
            <div className='center'>
              <button className='button' onClick={openFullscreen}>开始考试</button>
            </div>
          }
        </>
      )}
    </div>
  )
}

export default Start
