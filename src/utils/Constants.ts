
/** 视图类型 */
enum ViewType {
  /** 房间初始化 */
  INIT = 'INIT',
  /** 呼叫 */
  CALL = 'CALL',
  /** 加入 */
  JOIN = 'JOIN',
}

export default class Constants {

  // room
  static ViewType = ViewType;

  // server
  static BaseUrl = 'http://localhost:7001';// 后端接口地址

}
