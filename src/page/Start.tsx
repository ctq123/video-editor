/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import OnlineWrite from './OnlineWrite';
import CameraRecord from '../components/CameraRecord';
import './Start.css'

const Start: React.FC = () => {
  const [isStart, setIsStart] = useState(false);

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

      alert('用户切屏');
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
  }, [])


  return (
    <div className='container flex flex-column center'>
      <h1>在线笔试</h1>
      <CameraRecord />
      {isStart ?
        <OnlineWrite />
        : 
        <div className='center'>
          <button className='button' onClick={openFullscreen}>开始考试</button>
        </div> 
      }
    </div>
  )
}

export default Start
