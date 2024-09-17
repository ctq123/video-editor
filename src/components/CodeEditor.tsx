import React, { useState, useImperativeHandle, forwardRef } from 'react';
import CodeMirror, { Extension } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { go } from '@codemirror/lang-go';
import { oneDark } from '@codemirror/theme-one-dark';
import { lineNumbers } from '@codemirror/view';
import { autocompletion } from '@codemirror/autocomplete';
import './CodeEditor.css';

export interface CodeEditorHandle {
  getCode: () => string;
  setOutputText(text: string): void;
}

const CodeEditor = forwardRef((props, ref) => {
  const [code, setCode] = useState<string>(`function helloWorld() {\n  console.log('Hello, world!');\n  return 1 + 2;\n}`);
  const [language, setLanguage] = useState<string>('javascript');
  const [output, setOutput] = useState<string>('');

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const getExtensions = (): Extension[] => {
    switch (language) {
      case 'python':
        return [python()];
      case 'java':
        return [java()];
      case 'cpp':
        return [cpp()];
      case 'go':
        return [go()];
      case 'javascript':
      default:
        return [javascript()];
    }
  };

  const runCode = () => {
    if (language === 'javascript') {
      // console.log('Running code...', code);
      const originalConsoleLog = console.log;
      try {
        let consoleOutput = '';
        // Override console.log
        console.log = (...args) => {
          consoleOutput += args.join(' ') + '\n';
          originalConsoleLog.apply(console, args);
        };

        const result = new Function(`return ${code}`)();

        // 注意执行顺序，执行result函数，再执行console.log
        console.log('\nResult:', result());

        setOutput(`Console Output:\n${consoleOutput}`);
      } catch (error) {
        setOutput('Error: ' + error);
      }
      // Restore original console.log
      console.log = originalConsoleLog;
    } else {
      setOutput(`${language} execution not supported in this environment`);
    }
  };

  const getCode = () => {
    return code;
  }

  const setOutputText = (output: string) => {
    setOutput(output);
  }

  useImperativeHandle(ref, () => ({
    getCode,
    setOutputText,
  }));

  return (
    <div className="code-editor-container">
      <div className="controls">
        <select className="language-selector" onChange={handleLanguageChange} value={language}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="go">Go</option>
        </select>
        <button className="run-code-button" onClick={runCode}>Run Code</button>
      </div>
      <CodeMirror
        value={code}
        height="300px"
        extensions={[...getExtensions(), lineNumbers(), autocompletion()]}
        theme={oneDark}
        onChange={(value) => handleCodeChange(value)}
        className="code-mirror-wrapper"
      />
      <div className="output-section">
        <h3>Output:</h3>
        <pre className="output-display">{output}</pre>
      </div>
    </div>
  );
});

export default CodeEditor;

