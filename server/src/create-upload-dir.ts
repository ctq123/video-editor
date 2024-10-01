import * as fs from 'fs';
import * as path from 'path';

const uploadDir = path.join(__dirname, 'upload');

// 检查并创建 upload 文件夹
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('Upload folder created at:', uploadDir);
} else {
  console.log('Upload folder already exists.');
}
