 /** 用户考试行为 */
 export interface UserExamAction {
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

/**任意对象*/
export interface IObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}