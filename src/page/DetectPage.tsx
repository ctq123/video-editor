import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import http from '../utils/http';
import { IObject } from '../utils/types.ts';
import throttle from 'lodash/throttle';
import './DetectPage.css';


const DetectPage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [keyframes, setKeyframes] = useState<string[]>([]);
    const [aLoading, setALoading] = useState<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [info, setInfo] = useState<any>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [userTrace, setUserTrace] = useState<IObject>({});
    const timeRef = useRef(0);
    const controllerRef = useRef<IObject>({});
    const controller = new AbortController();
    controllerRef.current = controller;

    useEffect(() => {
        const { data } = location.state || {};
        handleSetTrace(data);

        // 请求后端数据
        fetchKeyframes();
    }, []);

    // TODO：待修复，目前没什么用，不会执行中断操作，即便重新刷新浏览器服务端接口依然运行
    useEffect(() => {
        const handleBeforeUnload = () => {
          cancelRequest();
        };
    
        // 添加事件监听器
        window.addEventListener('beforeunload', handleBeforeUnload);
    
        // 监听路由变化
        console.log('Route changed to:', location.pathname);
    
        // 清理函数
        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
          console.log('卸载组件');
        };
      }, [location]);

    const fetchKeyframes = throttle(async () => {
        if (loading || timeRef.current) return;
        setLoading(true);
        try {
            // 请求后端数据
            const result = await http.post('/api/exam/keyframes', { userId: 1 }, {
                signal: controller.signal, // 将 signal 传递给 axios 请求
            });

            console.log('关键帧信息:', result);

            const { images = [], count } = result.data;

            setKeyframes(images);

            fetchAnalysis(count); // 获取分析结果

        } catch (e) {
            console.error('Error fetching Keyframes:', e);
        }
        setLoading(false);
    }, 5000);

    const fetchAnalysis = async (keyFrameCount: number) => {
        if (aLoading || timeRef.current) return;
        setALoading(true);
        try {
            timeRef.current = 1;
            // 请求后端数据
            const result = await http.post('/api/exam/analysis', {
                userId: 1, keyFrameCount
            }, {
                signal: controller.signal, // 将 signal 传递给 axios 请求
            });

            console.log('人脸检测信息:', result);

            const { detectionList } = result.data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const detections = detectionList.map((item: any) => {
                if (Array.isArray(item) && item.length) {
                    return Object.entries(item[0]).reduce((acc: IObject, [key, value]) => {
                        acc[key] = typeof value === 'object' ? '...' : value;
                        return acc;
                    }, {});
                } else {
                    return {};
                }
            })
            setInfo(detections);

        } catch (e) {
            console.error('Error fetching analysis:', e);
        }
        setALoading(false);
    }

    const cancelRequest = () => {
    if (controllerRef.current) {
        controllerRef.current.abort(); // 中断请求
        console.log('Request aborted');
    }
    };

    const handleSetTrace = (userAction: IObject) => {
        const obj: IObject = {};
        Object.entries(userAction).map(([key, value]) => {
            switch(key) {
                case 'examInterruptCount':
                    obj['考试中断次数'] = value;
                    break;
                case 'screenChangeCount':
                    obj['切屏次数'] = value;
                    break;
                case 'copyCount':
                case 'cutCount':
                    obj['拷贝次数'] = value;
                    break;
                case 'pasteCount':
                    obj['粘贴次数'] = value;
                    break;
                case 'mouseLeaveCount':
                case 'mouseBlurCount':
                    obj['离屏次数'] = value;
                    break;
                default:
                    break;
            }
        });
        setUserTrace(obj);
    }

    const goHomePage = () => {
        navigate('/');
    }

    const loadingDom = (text: string) => (
        <div className="loading">
            {text.split('').map((char, index) => (
                <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                    {char}
                </span>
            ))}
        </div>
    )

    const baseUrl = 'http://localhost:7001';

    return (
        <div className='container flex flex-column center'>
            <h1>xxx公司在线笔试</h1>
        <div className="flex center flex-column detect-page">
            <h2>监控录像分析报告</h2>
            <div className='mt-2'>
                <h4>当前单次考试行为如下：</h4>
                <div>
                    { Object.entries(userTrace).map(([key, value]) => (<div key={key}>{key}: {value}</div>)) }
                </div>
            </div>
            
            <div className='mt-2'>
                {loading ? (
                    loadingDom('正在提取关键帧，请稍后……')
                ) : (
                    <div className="keyframes-container">
                        {keyframes.map((keyframe, index) => (
                            <img key={index} src={`${baseUrl}/images/${keyframe}`} alt={keyframe} />
                        ))}
                    </div>
                )}
            </div>

            <div className='mt-2'>
                {aLoading && <div>温馨提示：该请求耗时较长，会占满后端服务，需要耐心等几分钟。</div>}
                {aLoading ? (
                    loadingDom('正在检测人脸数据，请稍后……')
                ) : (
                    <pre className='info'>{JSON.stringify(info, null, 10)}</pre>
                )}
            </div>

            <div className='mt-2'>
                <button className='button' onClick={goHomePage}>
                    返回主页
                </button>
            </div>
        </div>
        </div>
    );
}

export default DetectPage;
