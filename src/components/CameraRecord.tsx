import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import './CameraRecord.css';

interface CameraRecordProps {
    videoWidth?: number;
    videoHeight?: number;
    onRecordingError?: () => void;
    onRecordingComplete?: (blob: Blob, url: string) => void;
}

export interface CameraRecordHandle {
    startRecording: () => void;
    stopRecording: () => void;
}

const CameraRecord = forwardRef<CameraRecordHandle, CameraRecordProps>(({
    videoWidth = 200,
    videoHeight = 200,
    onRecordingError,
    onRecordingComplete
}, ref) => {
    // const [isRecording, setIsRecording] = useState<boolean>(false);
    // const [videoURL, setVideoURL] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setMediaStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            const mediaRecorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                // setVideoURL(url);
                // setIsRecording(false);

                // 调用外部函数来处理录制完成的 Blob 数据
                if (onRecordingComplete) {
                    onRecordingComplete(blob, url);
                }
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            // setIsRecording(true);
        } catch (err) {
            console.error('Error accessing media devices.', err);
            if (onRecordingError) {
                onRecordingError();
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    useImperativeHandle(ref, () => ({
        startRecording,
        stopRecording
    }));

    return (
        <div className="camera-record">
            <video
                ref={videoRef}
                width={videoWidth}
                height={videoHeight}
                autoPlay
                muted
                className="camera-record__video"
            />
        </div>
    );
});

export default CameraRecord;
