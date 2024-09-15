import React, { useState, useRef } from 'react';
import './CameraRecord.css'; // 引入CSS文件

const CameraRecord: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 获取用户的媒体流
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = handleDataAvailable;
    recorder.onstop = handleStop;

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  // 处理录制的数据
  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      setRecordedChunks((prev) => [...prev, event.data]);
    }
  };

  // 处理停止录制事件
  const handleStop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    setVideoURL(url);
    setRecordedChunks([]);
  };

  // 停止录制
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // 下载录制的视频
  const downloadRecording = () => {
    if (videoURL) {
      const a = document.createElement('a');
      a.href = videoURL;
      a.download = 'recording.webm';
      a.click();
    }
  };

  return (
    <div className="video-container">
      <video ref={videoRef} autoPlay className="video-preview"></video>
      <div className="button-container">
        <button onClick={startRecording} disabled={isRecording}>
          开始录制
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          停止录制
        </button>
        <button onClick={downloadRecording} disabled={!videoURL}>
          下载录制
        </button>
      </div>
    </div>
  );
};

export default CameraRecord;
