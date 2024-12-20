# 项目介绍
这是一个 Web 视频剪辑器，用于在线编辑视频。系统包括以下功能：
- 视频上传功能，支持拖拽上传和点击上传
- 视频分辨率、视频裁剪、视频音效、视频字幕、视频水印、视频滤镜（视频亮度、模糊度）、视频转码、视频压缩、视频分割、视频合并、视频导出等功能

<img width="1425" alt="image" src="https://github.com/user-attachments/assets/efacc2b1-57f9-4cef-8052-e08749a4f377">

## 环境要求
- Node.js 20.0.0 或更高版本

## 技术栈
前端：React + TypeScript + Vite + Axios + Ant Design + React Hooks

后端：Node.js + ffmpeg + midwayjs


## 项目启动

```bash
yarn
```

### 启动后端

```bash
cd server
yarn dev
```

`每隔10分钟，后端 upload 文件自动超时无效`

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

## 下一步计划
1）优化界面，支持多轨道，参考剪映APP
2）加入web worker和webassembly，本地处理视频，减少服务器压力
3）加入更多特效功能

