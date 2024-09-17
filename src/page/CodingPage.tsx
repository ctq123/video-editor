import React, { useState, forwardRef, useRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeEditor, { CodeEditorHandle } from '../components/CodeEditor';
import http from '../utils/http';
import './CodingPage.css';

interface Question {
  id: string;
  type: 'choice' | 'multiple-choice' | 'short-answer' | 'coding';
  questionText: string;
  options?: string[];
}

interface IProps {
  examId: number;
  question: Question | null;
  submitSuccessCB?: () => void;
}

export interface CodingPageHandle {
  handleSubmit: (e: boolean) => void;
}

const CodingPage = forwardRef<CodingPageHandle, IProps>(({
  examId,
  question,
  submitSuccessCB
}, ref) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const codeEditorRef = useRef<CodeEditorHandle>(null);

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!question || !question.id || isSubmitting || !codeEditorRef.current || !codeEditorRef.current.getCode()) return;

    setIsSubmitting(true);
    try {
      const formData = {
        userId: 1, // TODO: 获取用户ID,
        examId,
        answers: [
          {
            questionId: question.id,
            answer: codeEditorRef.current.getCode(),
          }
        ]
      };

      await http.post('/api/exam/submit-coding', formData);
      // alert('Code submitted successfully!');
      if (!isAutoSubmit && submitSuccessCB) {
        submitSuccessCB();
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      // 自动提交
      if (!isAutoSubmit) {
        alert('提交失败，请重新尝试！');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="coding-page">
      <div className="coding-question">
        <div className="question-description">
          <ReactMarkdown>{question?.questionText}</ReactMarkdown>
        </div>
        <div className="code-content">
          <CodeEditor ref={codeEditorRef} />
        </div>
      </div>
      <div className="bottom-fixed flex-center">
        <button onClick={() => handleSubmit()} disabled={isSubmitting}>
          提交代码
        </button>
      </div>
    </div>
  );
});

export default CodingPage;
