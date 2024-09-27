// import { useState, useRef } from 'react'
// import { useNavigate } from 'react-router-dom';
// import Draggable from '../components/Draggable';
// import useUserRecordHook, { UserRecordHookRef } from '../hooks/useUserRecordHook';
// import http from '../utils/http';
// import { AxiosRequestConfig } from 'axios';
// import './Start.css'

// const Start: React.FC = () => {
//   const [isStart, setIsStart] = useState(false);
//   const userRecordHookRef = useRef<UserRecordHookRef>(null);
//   // 使用自定义 Hook
//   const { getUserAction } = useUserRecordHook(userRecordHookRef, isStart, () => handleStartExam(), () => handleQuitExam());
//   const navigate = useNavigate();

//   const handleSubmitUserAction = async () => {
//     // 处理用户行为，例如发送到服务器或执行其他操作
//     // console.log('User action:', userActionRef.current);
//     try {
//       const formData = {
//         userId: 1, // TODO: 获取用户ID
//         userAction: getUserAction(),
//       }
//       await http.post('/api/exam/user-action', formData);
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   }

//   const goDetectPage = (url: string) => {
//     const confirmed = window.confirm('考试已结束，选择是否查看监控数据?');
//     if (confirmed) {
//       // 用户点击了“确定”
//       console.log('User confirmed');

//       const data = getUserAction();
//       console.log('userActionRef.current: ', data)
//       navigate('/detect', { state: { data } });

//     } else {
//       // 用户点击了“取消”
//       console.log('User canceled');
//     }
//   }

//   return (
//     <div className='container flex center flex-column'>
      
//     </div>
//   )
// }

// export default Start
