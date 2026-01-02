// Data Service for managing all data operations
// Uses localStorage for persistence

class DataService {
  constructor() {
    this.init();
  }

  init() {
    // Initialize with default admin if not exists
    if (!localStorage.getItem('users')) {
      const defaultAdmin = {
        id: 1,
        name: 'Admin',
        email: 'admin@abacus.com',
        password: 'admin123',
        role: 1, // 1 = Admin, 2 = Student
        enabled: true
      };
      localStorage.setItem('users', JSON.stringify([defaultAdmin]));
    }

    if (!localStorage.getItem('exams')) {
      localStorage.setItem('exams', JSON.stringify([]));
    }

    if (!localStorage.getItem('examAttempts')) {
      localStorage.setItem('examAttempts', JSON.stringify([]));
    }
  }

  // User Management
  getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  getUserById(id) {
    const users = this.getUsers();
    return users.find(u => u.id === id);
  }

  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: Date.now(),
      ...userData,
      role: 2, // Student
      enabled: true
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
      return users[index];
    }
    return null;
  }

  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password && u.enabled);
    return user ? { ...user, password: undefined } : null;
  }

  getStudents() {
    return this.getUsers().filter(u => u.role === 2);
  }

  // Exam Management
  getExams() {
    return JSON.parse(localStorage.getItem('exams') || '[]');
  }

  getExamById(id) {
    const exams = this.getExams();
    return exams.find(e => e.id === parseInt(id));
  }

  createExam(examData) {
    const exams = this.getExams();
    const newExam = {
      id: Date.now(),
      ...examData,
      published: false,
      createdAt: new Date().toISOString()
    };
    exams.push(newExam);
    localStorage.setItem('exams', JSON.stringify(exams));
    return newExam;
  }

  updateExam(id, updates) {
    const exams = this.getExams();
    const index = exams.findIndex(e => e.id === id);
    if (index !== -1) {
      exams[index] = { ...exams[index], ...updates };
      localStorage.setItem('exams', JSON.stringify(exams));
      return exams[index];
    }
    return null;
  }

  publishExam(id) {
    return this.updateExam(id, { published: true });
  }

  getPublishedExamsForLevel(level) {
    const exams = this.getExams();
    return exams.filter(e => e.published && e.level === level);
  }

  // Exam Attempts
  getExamAttempts() {
    return JSON.parse(localStorage.getItem('examAttempts') || '[]');
  }

  getAttemptByStudentAndExam(studentId, examId) {
    const attempts = this.getExamAttempts();
    return attempts.find(a => a.studentId === studentId && a.examId === parseInt(examId));
  }

  createExamAttempt(attemptData) {
    const attempts = this.getExamAttempts();
    const newAttempt = {
      id: Date.now(),
      ...attemptData,
      startedAt: new Date().toISOString(),
      submitted: false
    };
    attempts.push(newAttempt);
    localStorage.setItem('examAttempts', JSON.stringify(attempts));
    return newAttempt;
  }

  updateExamAttempt(id, updates) {
    const attempts = this.getExamAttempts();
    const index = attempts.findIndex(a => a.id === id);
    if (index !== -1) {
      attempts[index] = { ...attempts[index], ...updates };
      localStorage.setItem('examAttempts', JSON.stringify(attempts));
      return attempts[index];
    }
    return null;
  }

  submitExamAttempt(id, answers, timeTaken) {
    const attempt = this.getExamAttempts().find(a => a.id === id);
    if (!attempt) return null;

    const exam = this.getExamById(attempt.examId);
    let correctCount = 0;
    let totalMarks = 0;

    const questionResults = attempt.questions.map((q, index) => {
      const isCorrect = q.correctAnswer === answers[index];
      if (isCorrect) {
        correctCount++;
        totalMarks += exam.marksPerQuestion;
      }
      return {
        questionNumber: index + 1,
        selectedOption: answers[index],
        correctOption: q.correctAnswer,
        timeTaken: timeTaken[index] || 0,
        isCorrect
      };
    });

    const updatedAttempt = {
      ...attempt,
      answers,
      submitted: true,
      submittedAt: new Date().toISOString(),
      correctCount,
      wrongCount: attempt.questions.length - correctCount,
      marksObtained: totalMarks,
      questionResults,
      totalTime: timeTaken.reduce((a, b) => a + b, 0)
    };

    return this.updateExamAttempt(id, updatedAttempt);
  }

  getAttemptsByExam(examId) {
    const attempts = this.getExamAttempts();
    return attempts.filter(a => a.examId === parseInt(examId) && a.submitted);
  }
}

export const dataService = new DataService();

