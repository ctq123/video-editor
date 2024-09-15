import axios from 'axios';

// 创建一个 axios 实例
const axiosInstance = axios.create({
  baseURL: '/', // 设置基础的请求 URL
  headers: {
    'Content-Type': 'application/json', // 设置默认的请求头
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 在请求发送之前做一些处理
    // 比如添加认证 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    return response.data; // 直接返回数据，简化调用
  },
  (error) => {
    // 对响应错误做点什么
    if (error.response) {
      // 请求已发出，但服务器响应状态码不在 2xx 范围内
      switch (error.response.status) {
        case 401:
          // 未授权
          console.error('Unauthorized, please log in again');
          break;
        case 403:
          // 拒绝访问
          console.error('Forbidden, you do not have permission');
          break;
        case 404:
          // 未找到
          console.error('Not Found');
          break;
        case 500:
          // 服务器错误
          console.error('Server Error');
          break;
        default:
          console.error('Error', error.response.status);
      }
    } else {
      // 请求未发出
      console.error('Network Error');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
