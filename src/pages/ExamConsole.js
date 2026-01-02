import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import './ExamConsole.css';

const ExamConsole = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submittedQuestions, setSubmittedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState({});
  const intervalRef = useRef(null);
  const questionTimeRef = useRef({});

  useEffect(() => {
    loadExam();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [examId]);

  useEffect(() => {
    if (attempt && !attempt.submitted) {
      startTimer();
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [attempt]);

  useEffect(() => {
    if (attempt && !attempt.submitted) {
      const now = Date.now();
      if (!questionTimeRef.current[currentQuestionIndex]) {
        questionTimeRef.current[currentQuestionIndex] = now;
      }
    }
  }, [currentQuestionIndex, attempt]);

  const loadExam = () => {
    const examData = dataService.getExamById(examId);
    if (!examData) {
      alert('Exam not found');
      navigate('/student/dashboard');
      return;
    }

    setExam(examData);

    // Check for existing attempt
    let existingAttempt = dataService.getAttemptByStudentAndExam(user.id, examId);
    
    if (!existingAttempt) {
      // Create new attempt
      const newAttempt = dataService.createExamAttempt({
        studentId: user.id,
        examId: parseInt(examId),
        questions: examData.questions,
        answers: {}
      });
      existingAttempt = newAttempt;
    }

    setAttempt(existingAttempt);
    setAnswers(existingAttempt.answers || {});
    const submittedSet = Array.isArray(existingAttempt.submittedQuestions) 
      ? new Set(existingAttempt.submittedQuestions) 
      : new Set();
    setSubmittedQuestions(submittedSet);
    
    if (existingAttempt.startedAt) {
      const elapsed = Math.floor((Date.now() - new Date(existingAttempt.startedAt).getTime()) / 1000);
      const remaining = (examData.duration * 60) - elapsed;
      setTimeRemaining(Math.max(0, remaining));
    } else {
      setTimeRemaining(examData.duration * 60);
    }
  };

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex, option) => {
    if (submittedQuestions.has(questionIndex)) return;
    setAnswers({ ...answers, [questionIndex]: option });
  };

  const handleSubmitQuestion = () => {
    if (!answers[currentQuestionIndex]) {
      alert('Please select an answer');
      return;
    }

    const now = Date.now();
    const startTime = questionTimeRef.current[currentQuestionIndex] || now;
    const timeTaken = Math.floor((now - startTime) / 1000);

    const newSubmitted = new Set(submittedQuestions);
    newSubmitted.add(currentQuestionIndex);
    setSubmittedQuestions(newSubmitted);

    // Update attempt
    const updatedAnswers = { ...answers };
    const updatedSubmitted = Array.from(newSubmitted);
    
    const updatedAttempt = dataService.updateExamAttempt(attempt.id, {
      answers: updatedAnswers,
      submittedQuestions: updatedSubmitted
    });
    
    setAttempt(updatedAttempt);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleAutoSubmit = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    submitExam();
  };

  const handleSubmitExam = () => {
    if (window.confirm('Are you sure you want to submit the exam? You cannot change your answers after submission.')) {
      submitExam();
    }
  };

  const submitExam = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Calculate time taken for each question
    const timeTaken = exam.questions.map((_, index) => {
      const startTime = questionTimeRef.current[index] || Date.now();
      const endTime = Date.now();
      return Math.floor((endTime - startTime) / 1000);
    });

    // Convert answers to array format
    const answersArray = exam.questions.map((_, index) => answers[index] || null);

    // Submit attempt
    const submittedAttempt = dataService.submitExamAttempt(
      attempt.id,
      answersArray,
      timeTaken
    );

    navigate(`/student/exam/${examId}/report`);
  };

  if (!exam || !attempt) {
    return <div className="loading">Loading exam...</div>;
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const isCurrentSubmitted = submittedQuestions.has(currentQuestionIndex);
  const hasAnswer = answers[currentQuestionIndex] !== undefined;

  return (
    <div className="exam-console">
      <header className="exam-header">
        <div className="exam-title">
          <h2>{exam.name}</h2>
          <span className="timer">Time Remaining: {formatTime(timeRemaining)}</span>
        </div>
      </header>
      <div className="exam-content">
        <div className="question-area">
          <div className="question-frame">
            <div className="question-number">
              Question {currentQuestionIndex + 1} of {exam.questions.length}
            </div>
            <div className="question-display">
              {currentQuestion.type === 'addition_subtraction' && (
                <div className="math-display">
                  {currentQuestion.numbers.map((num, idx) => (
                    <div key={idx} className="math-row">
                      {idx === 0 ? '+' : num >= 0 ? '+' : ''}{num}
                    </div>
                  ))}
                  <div className="math-divider">━━━━━━</div>
                </div>
              )}
              {currentQuestion.type === 'multiplication' && (
                <div className="math-display">
                  <div className="math-row">{currentQuestion.num1}</div>
                  <div className="math-row">× {currentQuestion.num2}</div>
                  <div className="math-divider">━━━━━━</div>
                </div>
              )}
              {currentQuestion.type === 'division' && (
                <div className="math-display">
                  <div className="math-row">{currentQuestion.dividend}</div>
                  <div className="math-row">÷ {currentQuestion.divisor}</div>
                  <div className="math-divider">━━━━━━</div>
                </div>
              )}
            </div>
            <div className="options">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.label}
                  className={`option-btn ${
                    answers[currentQuestionIndex] === option.label ? 'selected' : ''
                  } ${isCurrentSubmitted ? 'disabled' : ''}`}
                  onClick={() => handleAnswerSelect(currentQuestionIndex, option.label)}
                  disabled={isCurrentSubmitted}
                >
                  <span className="option-label">{option.label}</span>
                  <span className="option-value">{option.value}</span>
                </button>
              ))}
            </div>
            <div className="question-actions">
              <button
                className={`btn-submit ${isCurrentSubmitted ? 'submitted' : ''}`}
                onClick={handleSubmitQuestion}
                disabled={isCurrentSubmitted || !hasAnswer}
              >
                {isCurrentSubmitted ? 'Submitted' : 'Submit'}
              </button>
              {currentQuestionIndex < exam.questions.length - 1 && (
                <button
                  className="btn-next"
                  onClick={handleNextQuestion}
                  disabled={!isCurrentSubmitted}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="navigation-panel">
          <h3>Questions</h3>
          <div className="question-indicators">
            {exam.questions.map((_, index) => {
              const isCurrent = index === currentQuestionIndex;
              const isAttempted = submittedQuestions.has(index);
              const hasAnswer = answers[index] !== undefined;

              let indicatorClass = 'indicator';
              if (isCurrent) {
                indicatorClass += ' current';
              } else if (isAttempted) {
                indicatorClass += ' attempted';
              } else if (hasAnswer) {
                indicatorClass += ' answered';
              } else {
                indicatorClass += ' unattempted';
              }

              return (
                <button
                  key={index}
                  className={indicatorClass}
                  onClick={() => handleQuestionNavigation(index)}
                  title={`Question ${index + 1}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="legend">
            <div className="legend-item">
              <span className="legend-color current"></span>
              <span>Current</span>
            </div>
            <div className="legend-item">
              <span className="legend-color attempted"></span>
              <span>Attempted</span>
            </div>
            <div className="legend-item">
              <span className="legend-color unattempted"></span>
              <span>Unattempted</span>
            </div>
          </div>
        </div>
      </div>
      <div className="exam-footer">
        <button className="btn-submit-exam" onClick={handleSubmitExam}>
          Submit Exam
        </button>
      </div>
    </div>
  );
};

export default ExamConsole;

