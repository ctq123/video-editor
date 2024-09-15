/* eslint-disable @typescript-eslint/no-explicit-any */
import './OnlineWrite.css'
import Question from '../components/Question';

const OnlineWrite: React.FC = () => {
  return (
    <>
      <p>
        <span className="tooltip">拷贝文字试试？</span>
      </p>
      <Question />
    </>
  )
}

export default OnlineWrite
