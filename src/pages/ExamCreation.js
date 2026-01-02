import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { questionGenerator } from '../services/questionGenerator';
import './ExamCreation.css';

const ExamCreation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    examName: '',
    level: 1,
    totalQuestions: 10,
    marksPerQuestion: 1,
    duration: 30,
    // Question type counts
    additionSubtractionCount: 0,
    multiplicationCount: 0,
    divisionCount: 0,
    // Addition + Subtraction config
    additionSubtractionDigits: 2,
    additionSubtractionRows: 2,
    // Multiplication config
    multiplicationXDigits: 2,
    multiplicationYDigits: 1,
    // Division config
    divisionXDigits: 2,
    divisionYDigits: 1
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes('Count') || name.includes('Digits') || name.includes('Rows') || name === 'level' || name === 'totalQuestions' || name === 'marksPerQuestion' || name === 'duration'
        ? parseInt(value) || 0
        : value
    });
  };

  const validateForm = () => {
    const total = formData.additionSubtractionCount + formData.multiplicationCount + formData.divisionCount;
    if (total !== formData.totalQuestions) {
      setError(`Total question count (${total}) must match specified total questions (${formData.totalQuestions})`);
      return false;
    }
    if (total === 0) {
      setError('At least one question type must have a count greater than 0');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    // Generate questions
    const questions = questionGenerator.generateExamQuestions({
      additionSubtractionCount: formData.additionSubtractionCount,
      additionSubtractionDigits: formData.additionSubtractionDigits,
      additionSubtractionRows: formData.additionSubtractionRows,
      multiplicationCount: formData.multiplicationCount,
      multiplicationXDigits: formData.multiplicationXDigits,
      multiplicationYDigits: formData.multiplicationYDigits,
      divisionCount: formData.divisionCount,
      divisionXDigits: formData.divisionXDigits,
      divisionYDigits: formData.divisionYDigits
    });

    const exam = dataService.createExam({
      name: formData.examName,
      level: formData.level,
      totalQuestions: formData.totalQuestions,
      marksPerQuestion: formData.marksPerQuestion,
      duration: formData.duration,
      questions
    });

    alert('Exam created successfully! You can now publish it from the exam list.');
    navigate('/admin/exams');
  };

  return (
    <div className="exam-creation">
      <header className="page-header">
        <button onClick={() => navigate('/admin/dashboard')} className="btn-back">
          ← Back
        </button>
        <h1>Create Exam</h1>
      </header>
      <div className="content">
        <form onSubmit={handleSubmit} className="exam-form">
          <div className="form-section">
            <h2>Basic Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Exam Name</label>
                <input
                  type="text"
                  name="examName"
                  value={formData.examName}
                  onChange={handleChange}
                  required
                  placeholder="Enter exam name"
                />
              </div>
              <div className="form-group">
                <label>Level</label>
                <input
                  type="number"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Total Questions</label>
                <input
                  type="number"
                  name="totalQuestions"
                  value={formData.totalQuestions}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Marks per Question</label>
                <input
                  type="number"
                  name="marksPerQuestion"
                  value={formData.marksPerQuestion}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Question Types Configuration</h2>
            
            <div className="question-type-section">
              <h3>Addition + Subtraction</h3>
              <div className="question-type-grid">
                <div className="form-group">
                  <label>Number of Questions</label>
                  <input
                    type="number"
                    name="additionSubtractionCount"
                    value={formData.additionSubtractionCount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Number of Digits</label>
                  <input
                    type="number"
                    name="additionSubtractionDigits"
                    value={formData.additionSubtractionDigits}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Number of Rows</label>
                  <input
                    type="number"
                    name="additionSubtractionRows"
                    value={formData.additionSubtractionRows}
                    onChange={handleChange}
                    min="2"
                  />
                </div>
              </div>
              <p className="help-text">Example: 3 digits, 3 rows → 234 + 456 - 543</p>
            </div>

            <div className="question-type-section">
              <h3>Multiplication</h3>
              <div className="question-type-grid">
                <div className="form-group">
                  <label>Number of Questions</label>
                  <input
                    type="number"
                    name="multiplicationCount"
                    value={formData.multiplicationCount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>X Digits</label>
                  <input
                    type="number"
                    name="multiplicationXDigits"
                    value={formData.multiplicationXDigits}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Y Digits</label>
                  <input
                    type="number"
                    name="multiplicationYDigits"
                    value={formData.multiplicationYDigits}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
              </div>
              <p className="help-text">Example: 2 digits × 1 digit → 234 × 76</p>
            </div>

            <div className="question-type-section">
              <h3>Division</h3>
              <div className="question-type-grid">
                <div className="form-group">
                  <label>Number of Questions</label>
                  <input
                    type="number"
                    name="divisionCount"
                    value={formData.divisionCount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>X Digits</label>
                  <input
                    type="number"
                    name="divisionXDigits"
                    value={formData.divisionXDigits}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Y Digits</label>
                  <input
                    type="number"
                    name="divisionYDigits"
                    value={formData.divisionYDigits}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
              </div>
              <p className="help-text">Example: 2 digits ÷ 1 digit → 234 ÷ 76</p>
            </div>

            <div className="total-summary">
              <strong>Total Questions: {formData.additionSubtractionCount + formData.multiplicationCount + formData.divisionCount} / {formData.totalQuestions}</strong>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/admin/exams')} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamCreation;

