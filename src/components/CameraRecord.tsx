import { useState, useEffect, useRef } from 'react'
import './CameraRecord.css'

const CameraRecord: React.FC = () => {
  const [startDisabled, setStartDisabled] = useState(false);
  const [stopDisabled, setStopDisabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('无法访问摄像头:', error);
    }
  }

  const handleStart = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      setStartDisabled(true);
      setStopDisabled(false);
    }
  }

  const handleStop = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setStartDisabled(false);
      setStopDisabled(true);
    }
  }

  const startRecording = () => {
    startCamera().then((stream: MediaStream | undefined) => {
      if (!stream) return;
      mediaRecorderRef.current = new MediaRecorder(stream);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chunks: any = [];
  
      mediaRecorderRef.current.ondataavailable = event => {
        chunks.push(event.data);
      };
  
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        if (!downloadLinkRef.current) return;
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.style.display = 'block';
      };
    });
  }

  useEffect(() => {
    startRecording();
  }, []);

  return (
    <div className='camera-record'>
      <video id="video" ref={videoRef} autoPlay playsInline></video>
      <button className='button' onClick={handleStart} disabled={startDisabled}>开始录制</button>
      <button className='button' onClick={handleStop} disabled={stopDisabled}>停止录制</button>
      <a ref={downloadLinkRef} download="recording.webm">下载录制</a>
    </div>
  )
}

export default CameraRecord;

