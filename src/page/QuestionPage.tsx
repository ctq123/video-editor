import React, { useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import './QuestionPage.css';

interface Question {
  id: string;
  type: 'choice' | 'multiple-choice' | 'short-answer' | 'coding';
  questionText: string;
  options?: string[];
}

interface IProps {
  questions: Question[];
  submitSuccessCB?: () => void;
}

export interface QuestionPageHandle {
  handleSubmit: (e: boolean) => void;
}

const QuestionPage = forwardRef<QuestionPageHandle, IProps>(({
  questions, submitSuccessCB
}, ref) => {
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  const handleChange = (questionId: string, value: string, isMultipleChoice: boolean) => {
    setAnswers(prevAnswers => {
      const currentAnswer = prevAnswers[questionId];
      if (isMultipleChoice) {
        if (Array.isArray(currentAnswer)) {
          if (currentAnswer.includes(value)) {
            return { ...prevAnswers, [questionId]: currentAnswer.filter(v => v !== value) };
          } else {
            return { ...prevAnswers, [questionId]: [...currentAnswer, value] };
          }
        } else {
          return { ...prevAnswers, [questionId]: [value] };
        }
      } else {
        return { ...prevAnswers, [questionId]: value };
      }
    });
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    setIsSubmitting(true);
    try {
      await axios.post('/api/exam/submit', { answers });
      // alert('successfully!');
      if (!isAutoSubmit && submitSuccessCB) {
        submitSuccessCB();
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      
      // 自动提交
      if (!isAutoSubmit) {
        alert('提交失败，请重新尝试！');
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <>
      {questions.map(question => {
        return (
          <div key={question.id} className="question">
            <h2>{question.questionText}</h2>
            {question.type === 'choice' && (
              <div>
                {question.options?.map(option => (
                  <div key={option}>
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={() => handleChange(question.id, option, false)}
                    />
                    {option}
                  </div>
                ))}
              </div>
            )}
            {question.type === 'multiple-choice' && (
              <div>
                {question.options?.map(option => (
                  <div key={option}>
                    <input
                      type="checkbox"
                      name={question.id}
                      value={option}
                      checked={(answers[question.id] as string[])?.includes(option) || false}
                      onChange={() => handleChange(question.id, option, true)}
                    />
                    {option}
                  </div>
                ))}
              </div>
            )}
            {question.type === 'short-answer' && (
              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value, false)}
              />
            )}
          </div>
        );
      })}
      <button onClick={() => handleSubmit()} disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Exam'}
      </button>
    </>
  );
});

export default QuestionPage;
