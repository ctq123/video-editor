/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Constants } from "./Constant";

export class Utils {
  
  /**
   * 设置本地数据
   * @param key 
   * @param value 
   * @param ttl 过期时间，单位秒，默认不过期
   */
  static setLocalStorage(key: string, value: any, ttl?: number) {
    try {
      const item = {
        value,
        expire: ttl ? Date.now() + ttl * 1000 : 0,
      };

      localStorage.setItem(key, JSON.stringify(item))
      return true
    } catch (e) {
        console.error(e)
    }
    return false
  }
  
  /**
   * 获取本地数据
   * @param key 
   */
  static getLocalStorage(key: string) {
    try {
      const itemStr = localStorage.getItem(key)
      if (!itemStr) {
          return null;
      }

      const item = JSON.parse(itemStr)
      // 检查是否过期
      if (item.expire !== 0 && Date.now() > item.expire) {
        // 过期，删除该 item 并返回 null
        localStorage.removeItem(key)
        return null
      }

      return item.value
    } catch(e) {
      console.error(e)
    }
    return null
  }

}