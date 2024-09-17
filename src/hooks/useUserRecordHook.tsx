/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useImperativeHandle } from 'react'
import debounce from 'lodash/debounce';
import { UserExamAction } from '../utils/types.ts';

// 定义 Hook 返回的类型
export interface UserRecordHookRef {
  /** 打开全屏 */
  openFullscreen: () => void;
}

const useUserRecordHook = (ref: React.Ref<UserRecordHookRef>, canRecord: boolean, EnterFullScreen: () => void, quitFullSreen: () => void) => {
  /** 记录用户考试行为 */
  const userActionRef = useRef<UserExamAction>({
    examInterruptCount: 0,
    screenChangeCount: 0,
    copyCount: 0,
    cutCount: 0,
    pasteCount: 0,
    mouseLeaveCount: 0,
    mouseBlurCount: 0,
  });

  useImperativeHandle(ref, () => ({
    openFullscreen,
  }));

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
      EnterFullScreen();
    } else {
      console.log('退出全屏模式');
      if (canRecord) {
        userActionRef.current.examInterruptCount += 1;
      }

      quitFullSreen()
    }
  }

  const handleWinSizeChange = () => {
    // 处理退出全屏模式无响应的补丁
    console.log('window.innerHeight', window.innerHeight, window.innerHeight === screen.height)
    if (isFullScreen() && window.innerHeight !== screen.height) {
      console.log('退出全屏模式1');
      quitFullSreen();
      if (canRecord) {

        userActionRef.current.examInterruptCount += 1;
      }
    }
  }

  const handleSwitchScreen = () => {
    if (document.hidden) {
      console.log('页面不可见'); // 用户切换到了其他标签页或最小化了浏览器
      if (canRecord) {
        userActionRef.current.screenChangeCount += 1;
      }
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
    if (canRecord) {
      userActionRef.current.copyCount += 1;
    }
    console.log('userActionRef.current', userActionRef.current, canRecord)
    // alert('拷贝内容：' + selection?.toString());
  }

  const handleCut = (event: ClipboardEvent) => {
    console.log('内容被剪切');
    // 获取剪切的内容（如果需要）
    const cutData = event?.clipboardData?.getData('text');
    console.log('剪切的内容:', cutData);
    if (canRecord) {
      userActionRef.current.cutCount += 1;
    }
  }

  const handlePaste = (event: ClipboardEvent) => {
    console.log('内容被粘贴');
    // 获取粘贴的内容
    const pastedData = event?.clipboardData?.getData('text');
    console.log('粘贴的内容:', pastedData);
    if (canRecord) {
      userActionRef.current.pasteCount += 1;
    }
  }

  const handleMouseleave = () => {
    console.log('鼠标离开了视口');
    if (canRecord) {
      userActionRef.current.mouseLeaveCount += 1;
    }
  }

  const handleBlur = () => {
    console.log('窗口失去焦点');
    if (canRecord) {
      userActionRef.current.mouseBlurCount += 1;
    }
  }

  return {
    getUserAction: () => userActionRef.current,
  }
}

export default useUserRecordHook;
