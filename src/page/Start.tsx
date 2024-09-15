/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react'
import ExamPage from './ExamPage';
import Draggable from '../components/Draggable';
import CameraRecord, { CameraRecordHandle } from '../components/CameraRecord';
import debounce from 'lodash/debounce';
import http from '../utils/http';
import './Start.css'

/** 用户考试行为 */
interface UserExamAction {
  /** 考试中断次数 */
  examInterruptCount: number;
  /** 切屏次数 */
  screenChangeCount: number;
  /** 拷贝次数 */
  copyCount: number;
  /** 剪切次数 */
  cutCount: number;
  /** 粘贴次数 */
  pasteCount: number;
  /** 鼠标离开窗口次数 */
  mouseLeaveCount: number;
  /** 鼠标失去焦点次数 */
  mouseBlurCount: number;
}

const Start: React.FC = () => {
  const [isStart, setIsStart] = useState(false);
  const [showRecorder, setShowRecorder] = useState<boolean>(false); // 是否显示录制器
  const cameraRecordRef = useRef<CameraRecordHandle | null>(null);
  const [userAction, setUserAction] = useState<UserExamAction>({
    examInterruptCount: 0,
    screenChangeCount: 0,
    copyCount: 0,
    cutCount: 0,
    pasteCount: 0,
    mouseLeaveCount: 0,
    mouseBlurCount: 0,
  }); // 录制状态

  useEffect(() => {
    // 监听全屏
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    const winSizeChange = debounce(handleWinSizeChange, 200); // 200ms 节流时间
    // 监听窗口大小变化
    window.addEventListener('resize', winSizeChange);

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
      // 监听窗口大小变化
      window.removeEventListener('resize', winSizeChange);

      document.removeEventListener('visibilitychange', handleSwitchScreen);

      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);

      document.removeEventListener('mouseleave', handleMouseleave);
      document.removeEventListener('blur', handleBlur);
    }
  }, []);

  const openFullscreen = () => {
    try {
      const elem = document.documentElement as HTMLElement; // 选择要全屏的元素
  
      // 退出全屏模式（如果已经在全屏模式中）
      if (isFullScreen()) {
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => {
            // 退出全屏后再次尝试进入全屏
            requestFullscreen(elem);
          }).catch((err: any) => console.error('退出全屏失败:', err));
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen().then(() => {
            // 退出全屏后再次尝试进入全屏
            requestFullscreen(elem);
          }).catch((err: any) => console.error('退出全屏失败:', err));
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen().then(() => {
            // 退出全屏后再次尝试进入全屏
            requestFullscreen(elem);
          }).catch((err: any) => console.error('退出全屏失败:', err));
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen().then(() => {
            // 退出全屏后再次尝试进入全屏
            requestFullscreen(elem);
          }).catch((err: any) => console.error('退出全屏失败:', err));
        }
      } else {
        // 如果当前未全屏，直接尝试进入全屏
        requestFullscreen(elem);
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  const requestFullscreen = (elem: HTMLElement) => {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((elem as any).mozRequestFullScreen) {
      (elem as any).mozRequestFullScreen();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen();
    } else {
      alert('您的浏览器不支持全屏模式，请使用其他浏览器或手动全屏');
    }
  };
  

  const isFullScreen = () => {
    return document.fullscreenElement || 
      (document as any).mozFullScreenElement || 
      (document as any).webkitFullscreenElement || 
      (document as any).msFullscreenElement 
  }

  const handleFullscreenChange = () => {
    if (isFullScreen()) {      
      console.log('进入全屏模式');
      setIsStart(true);
    } else {
      console.log('退出全屏模式');
      if (isStart) {
        setUserAction((pre) => ({
          ...pre,
          examInterruptCount: pre.examInterruptCount + 1,
        }))
      }
      setIsStart(false);
    }
  }

  const handleWinSizeChange = () => {
    // 处理退出全屏模式无响应的补丁
    console.log('window.innerHeight', window.innerHeight, window.innerHeight === screen.height)
    if (isFullScreen() && window.innerHeight !== screen.height) {
      console.log('退出全屏模式1');
      setIsStart(false);
      setUserAction((pre) => ({
        ...pre,
        examInterruptCount: pre.examInterruptCount + 1,
      }))
    }
  }

  const handleSwitchScreen = () => {
    if (document.hidden) {
      console.log('页面不可见'); // 用户切换到了其他标签页或最小化了浏览器
      setUserAction((pre) => ({
        ...pre,
        screenChangeCount: pre.screenChangeCount + 1,
      }))
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
    setUserAction((pre) => ({
      ...pre,
      copyCount: pre.copyCount + 1,
    }))
    alert('拷贝内容：' + selection?.toString());
  }

  const handleCut = (event: ClipboardEvent) => {
    console.log('内容被剪切');
    // 获取剪切的内容（如果需要）
    const cutData = event?.clipboardData?.getData('text');
    console.log('剪切的内容:', cutData);
    setUserAction((pre) => ({
      ...pre,
      cutCount: pre.cutCount + 1,
    }))
  }

  const handlePaste = (event: ClipboardEvent) => {
    console.log('内容被粘贴');
    // 获取粘贴的内容
    const pastedData = event?.clipboardData?.getData('text');
    console.log('粘贴的内容:', pastedData);
    setUserAction((pre) => ({
      ...pre,
      pasteCount: pre.pasteCount + 1,
    }))
  }

  const handleMouseleave = () => {
    console.log('鼠标离开了视口');
    setUserAction((pre) => ({
      ...pre,
      mouseLeaveCount: pre.mouseLeaveCount + 1,
    }))
  }

  const handleBlur = () => {
    console.log('窗口失去焦点');
    setUserAction((pre) => ({
      ...pre,
      mouseBlurCount: pre.mouseBlurCount + 1,
    }))
  }

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
    // setShowRecorder(false);

    // 上传录制数据到服务器
    const formData = new FormData();
    formData.append('video', blob, 'recording.webm');

    // try {
    //   await http.post('/api/exam/upload-vedio', formData);
    // } catch (error) {
    //   console.error('Error:', error);
    // }

    // 自动下载录制文件
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recording.webm';
    a.click();
  };

  const handleSubmitUserAction = async () => {
    // 处理用户行为，例如发送到服务器或执行其他操作
    // console.log('User action:', userAction);
    try {
      const formData = {
        userId: 1, // TODO: 获取用户ID
        userAction: userAction,
      }
      await http.post('/api/exam/user-action', formData);
    } catch (error) {
      console.error('Error:', error);
    }
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
            <ExamPage finishExamCB={handleFinishCB} />
            :
            <div className='center'>
              <button className='button' onClick={() => openFullscreen()}>开始考试</button>
            </div>
          }
        </>
      )}
    </div>
  )
}

export default Start
