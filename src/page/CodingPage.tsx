import React, { useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { createTheme } from '@uiw/codemirror-themes';
import { javascript } from '@codemirror/lang-javascript';
import { tags as t } from '@lezer/highlight';
import './CodingPage.css';

interface Question {
  id: string;
  type: 'choice' | 'multiple-choice' | 'short-answer' | 'coding';
  questionText: string;
  options?: string[];
}

interface IProps {
  question: Question | null;
  submitSuccessCB?: () => void;
}

export interface CodingPageHandle {
  handleSubmit: (e: boolean) => void;
}

const myTheme = createTheme({
  theme: 'light',
  settings: {
    background: '#ffffff',
    backgroundImage: '',
    foreground: '#75baff',
    caret: '#5d00ff',
    selection: '#036dd626',
    selectionMatch: '#036dd626',
    lineHighlight: '#8a91991a',
    gutterBackground: '#fff',
    gutterForeground: '#8a919966',
  },
  styles: [
    { tag: t.comment, color: '#787b8099' },
    { tag: t.variableName, color: '#0080ff' },
    { tag: [t.string, t.special(t.brace)], color: '#5c6166' },
    { tag: t.number, color: '#5c6166' },
    { tag: t.bool, color: '#5c6166' },
    { tag: t.null, color: '#5c6166' },
    { tag: t.keyword, color: '#5c6166' },
    { tag: t.operator, color: '#5c6166' },
    { tag: t.className, color: '#5c6166' },
    { tag: t.definition(t.typeName), color: '#5c6166' },
    { tag: t.typeName, color: '#5c6166' },
    { tag: t.angleBracket, color: '#5c6166' },
    { tag: t.tagName, color: '#5c6166' },
    { tag: t.attributeName, color: '#5c6166' },
  ],
});

const CodingPage = forwardRef<CodingPageHandle, IProps>(({
  question, submitSuccessCB
}, ref) => {
  const [code, setCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const extensions = [javascript({ jsx: true })];

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  /** 运行测试用例 */
  const handleTest = async () => {
    try {
      const response = await axios.post('/api/exam/test', { code });
      setTestResult(response.data.result);
    } catch (error) {
      console.error('Error testing code:', error);
      setTestResult('Error testing code.');
    }
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!question || !question.id || isSubmitting || !code) return;

    setIsSubmitting(true);
    try {
      await axios.post('/api/exam/submit-coding', { questionId: question.id, answer: code });
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

  const onChange = React.useCallback((value: string) => {
    console.log('value:', value);
    setCode(value);
  }, []);

  return (
    <div className="coding-question">
      <div className="question-description">
        <h2>{question?.questionText}</h2>
      </div>
      <div className="code-editor">
        <CodeMirror
          value="console.log('hello world!');"
          height="200px"
          theme={myTheme}
          extensions={extensions}
          onChange={onChange}
        />
      </div>
      <div className="actions">
        <button onClick={handleTest}>Test Code</button>
        <button onClick={() => handleSubmit()} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Code'}
        </button>
        {testResult && <div>Test Result: {testResult}</div>}
      </div>
    </div>
  );
});

export default CodingPage;
