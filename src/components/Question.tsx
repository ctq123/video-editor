import React, { useState } from 'react';
import './Question.css';

const Question: React.FC = () => {
  // 使用 useState 管理题目的状态
  const [q1Answer, setQ1Answer] = useState<string | null>(null);
  const [q2Answer, setQ2Answer] = useState<string>('');
  const [result, setResult] = useState<string>('');

  // 检查答案函数
  const checkAnswers = () => {
    let feedback: string = '';
    let correct: boolean = true;

    // 检查第一题答案
    if (q1Answer !== 'useState') {
      correct = false;
      feedback += '<span style="color:red">Question 1 is incorrect. The correct answer is "useState".</span><br>';
    } else {
      feedback += 'Question 1 is correct!<br>';
    }

    // 检查第二题答案
    if (q2Answer.trim() !== '0') {
      correct = false;
      feedback += '<span style="color:red">Question 2 is incorrect. The correct answer is "0".</span>';
    } else {
      feedback += 'Question 2 is correct!';
    }

    if (correct) {
      // proc
      
    }

    setResult(feedback);
  };

  return (
    <div>
      {/* 单项选择题 */}
      <div className="question">
        <h3>1. Which hook is used to manage state in a functional React component?</h3>
        <div>
          <input
            type="radio"
            id="q1a1"
            name="q1"
            value="useEffect"
            onChange={(e) => setQ1Answer(e.target.value)}
          />
          <label htmlFor="q1a1">useEffect</label>
        </div>
        <div>
          <input
            type="radio"
            id="q1a2"
            name="q1"
            value="useContext"
            onChange={(e) => setQ1Answer(e.target.value)}
          />
          <label htmlFor="q1a2">useContext</label>
        </div>
        <div>
          <input
            type="radio"
            id="q1a3"
            name="q1"
            value="useState"
            onChange={(e) => setQ1Answer(e.target.value)}
          />
          <label htmlFor="q1a3">useState</label>
        </div>
        <div>
          <input
            type="radio"
            id="q1a4"
            name="q1"
            value="useReducer"
            onChange={(e) => setQ1Answer(e.target.value)}
          />
          <label htmlFor="q1a4">useReducer</label>
        </div>
      </div>

      {/* 看代码输出题 */}
      <div className="question">
        <h3>2. What is the output of the following code?</h3>
        <pre>
          {`
function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount((prevCount) => prevCount + 1);
  }, []);

  console.log(count);
  return <div>{count}</div>;
}
          `}
        </pre>
        <label htmlFor="q2">Your answer:</label>
        <input
          type="text"
          id="q2"
          value={q2Answer}
          onChange={(e) => setQ2Answer(e.target.value)}
        />
      </div>

      <button onClick={checkAnswers}>Submit Answers</button>

      {/* 结果展示 */}
      <div
        id="result"
        className="result"
        dangerouslySetInnerHTML={{ __html: result }}
      ></div>
    </div>
  );
};

export default Question;
