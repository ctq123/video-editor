# 项目介绍
这是一个防作弊在线笔试系统，用于企业进行在线笔试。系统包括以下功能：
- 在线笔试功能，包括题目展示、答题、提交答案
- 防作弊功能，包括切屏、拷贝、粘贴、多屏识别、监控录屏分析等

- <img width="953" alt="image" src="https://github.com/user-attachments/assets/47da4464-4e2d-41d0-ae1a-c0ff4e30cd6e">
- <img width="958" alt="image" src="https://github.com/user-attachments/assets/ce6b7700-df80-4945-8406-7c119503e863">
- <img width="1415" alt="image" src="https://github.com/user-attachments/assets/510370d7-fac9-43cb-9aa0-630f9172c770">




## 环境要求
- Node.js 20.0.0 或更高版本

## 技术栈
前端：React + TypeScript + Vite + Axios

后端：Node.js + Tensorflow + Face-API + ffmpeg


## 项目启动

```bash
yarn
```

### 启动后端

```bash
cd server
yarn dev
```

### 启动前端

```bash
cd ..
yarn dev
```


## 项目结构

```bash
├── public
├── server // 服务端
├── src // 前端
│   ├── assets
│   ├── components
│   ├── page
│   ├── utils
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```


## 常见问题

1. 分析用户监控录像报错`Error: Cannot find ffprobe`
  - 确保你已经安装了 ffmpeg 和 ffprobe。ffprobe 通常随 ffmpeg 一起安装。
  - 你可以使用 Homebrew 安装 ffmpeg：
    ```bash
    // macOS 上安装
    brew install ffmpeg
    ```
    ```js
    // window 上安装
    到ffmpeg官网下载 Windows 版本的 ffmpeg 压缩包，然后解压，将 bin 目录配置到系统PATH 环境变量中
    ```

2. 监控录像分析报错`Error fetching analysis timeout of xxx exceeded`
  - 接口请求超时，请到src/utils/http中增大接口超时限制。
