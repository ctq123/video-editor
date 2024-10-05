const express = require('express');
const cors = require('cors'); // 引入 CORS
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();

// // 设置 multer 存储选项
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // 确保 uploads 目录存在
//   },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname); // 使用原始文件名
//     },
// });

// 创建 multer 实例
const upload = multer({ dest: 'uploads/' });

// 使用 CORS 中间件
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post(
  '/api/replace-face',
  upload.fields([{ name: 'video' }, { name: 'face' }]),
  (req, res) => {
    console.log(req.files);
    const videoPath = req.files['video'][0].path;
    const facePath = req.files['face'][0].path;
    const outputPath = 'output/output.mp4';

    const outputDir = 'output/';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // 使用 FFmpeg 进行人脸替换
    const command = `ffmpeg -i ${videoPath} -i ${facePath} -filter_complex "[0:v][1:v] overlay=10:10" ${outputPath}`;

    exec(command, error => {
      // 清理上传文件
      fs.unlinkSync(videoPath);
      fs.unlinkSync(facePath);

      if (error) {
        console.error(`执行错误: ${error}`);
        return res.status(500).send('人脸替换失败');
      }

      res.download(outputPath, err => {
        if (err) {
          console.error(err);
        }
        fs.unlinkSync(outputPath); // 清理输出文件
      });
    });
  }
);

app.listen(3000, () => {
  console.log('服务器已启动，端口：3000');
});
