import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CodingPage, { CodingPageHandle} from './CodingPage';
import QuestionPage, { QuestionPageHandle} from './QuestionPage';

interface Question {
    id: string;
    type: 'choice' | 'multiple-choice' | 'short-answer' | 'coding';
    questionText: string;
    options?: string[]; // For choice and multiple-choice questions
}

const ExamPage: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [codingQuestions, setCodingQuestions] = useState<Question[]>([]);
    const [codingQuestion, setCodingQuestion] = useState<Question | null>(null);
    const [showCoding, setShowCoding] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(3600); // Time in seconds (e.g., 1 hour)
    const codingRef = useRef<CodingPageHandle | null>(null);
    const questionRef = useRef<QuestionPageHandle | null>(null);

    useEffect(() => {
        fetchQuestions();
        fetchExamTime();

        // Set up timer
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    // 自动提交
                    if (showCoding) {
                        if (codingRef.current) {
                            codingRef.current.handleSubmit(true);
                        }
                    } else {
                        if (questionRef.current) {
                            questionRef.current.handleSubmit(true);
                        }
                    }
                    // 结束考试
                    handleFinish();
                    
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get('/api/exam/questions');
            const data = response.data;
            if (!Array.isArray(data)) return;
            setQuestions(data.filter((question: Question) => question.type !== 'coding'));
            setCodingQuestions(data.filter((question: Question) => question.type === 'coding'));
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    const fetchExamTime = async () => {
        try {
            const response = await axios.get('/api/exam/time');
            const data = response.data;
            if (!Number.isInteger(data)) return;
            setTimeLeft(data);
        } catch (error) {
            console.error('Error fetching exam time:', error);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const handleQustionSubmitCB = () => {
        // Update after submitting question
        if (codingQuestions.length) {
            setShowCoding(true);
            setCodingQuestion(codingQuestions[0]);
            setCodingQuestions(codingQuestions.slice(1));
        } else {
            // 结束考试
            handleFinish();
        }
    }

    const handleFinish = () => {
        // 结束考试
        console.log('Exam finished');
        // alert('考试结束，感谢您的参与！');
    }

    return (
        <div>
            <div>Time Left: {formatTime(timeLeft)}</div>
            { !showCoding && <QuestionPage ref={questionRef} questions={questions} submitSuccessCB={handleQustionSubmitCB} /> }
            { showCoding && <CodingPage ref={codingRef} question={codingQuestion} submitSuccessCB={handleQustionSubmitCB} /> }
        </div>
    );
};

export default ExamPage;
