# Abacus Online Exam Platform

A comprehensive online examination platform built with React for managing and conducting Abacus exams with role-based access control.

## Features

### Authentication & Access Control
- **Admin Role (Role = 1)**: Full access to all features
- **Student Role (Role = 2)**: Limited access to exams and reports
- Sign Up page accessible only to Admin
- Login page accessible to both Admin and Students
- Default admin credentials: `admin@abacus.com` / `admin123`

### Admin Panel Features

#### Student Management
- Create student accounts with Name, Email, Password, and Level
- Enable/Disable student login
- Change student level anytime
- Copy email/password to clipboard
- Disabled students cannot login or attempt exams

#### Exam Creation
- Create exams with custom configurations:
  - Exam Name, Level, Number of Questions, Marks per Question, Duration
- Three question types:
  - **Addition + Subtraction**: Configurable digits and rows (can have negative digits, but final answer must be positive)
  - **Multiplication**: x Digits × y Digits (only positive)
  - **Division**: x Digits ÷ y Digits (only positive)
- Auto-generated 4 options (1 correct + 3 distractors)
- Publish/Unpublish exams
- Exams visible to students only after publishing

#### Exam Visibility
- Exams are visible only after Admin publishes them
- Visibility based on student level (Exam Level = X, Students with Level = X can see)

#### Admin Reports
- View list of students who appeared for each exam
- Overall statistics: Attempted Questions, Correct vs Wrong (Pie Chart), Marks Obtained, Average Time per Question
- Click on any student to view detailed report (same as student report)

### Student Features

#### Exam Console
- Card layout for exam list showing:
  - Exam Name, Level, Duration, Total Questions, Status Badge
  - Status: Not Started → Start Exam button
  - Status: Completed → View Report button
- Timer starts immediately on clicking Start Exam
- Question Navigation Panel on right side with circular indicators (1 to Total Questions)
- Color indications:
  - **Green**: Current Question
  - **Light Blue**: Attempted Questions
  - **Grey**: Unattempted Questions
- Mobile-friendly question frame displaying one question at a time
- Submit button: Locks answer, becomes disabled, text changes to "Submitted"
- Next button: Moves to next question
- Rules:
  - Once submitted, question's option cannot be changed
  - Attempted answers persist when navigating
  - Students can switch questions using circular indicators
- Submit Exam button at bottom-right with confirmation popup
- Auto-submit when time ends

#### Student Report
- Overview:
  - Total Questions
  - Attempted Questions
  - Correct vs Wrong (Pie Chart)
  - Marks Obtained
  - Average Time per Question
- Question-wise Review:
  - Question number
  - Student's selected option
  - Correct option
  - Time taken
  - Result (Correct / Wrong)
- Strength vs Weakness Summary:
  - Auto-generated accuracy by question type
  - Addition/Subtraction → X% accuracy
  - Multiplication → X% accuracy
  - Division → X% accuracy
- Report remains accessible from My Exams section

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Default Credentials

**Admin:**
- Email: `admin@abacus.com`
- Password: `admin123`

## Technology Stack

- React 18.2.0
- React Router DOM 6.20.0
- Recharts 2.10.3 (for charts)
- LocalStorage (for data persistence)

## Project Structure

```
src/
├── context/
│   └── AuthContext.js       # Authentication context
├── services/
│   ├── dataService.js       # Data management service
│   └── questionGenerator.js # Question generation logic
├── pages/
│   ├── Login.js             # Login page
│   ├── SignUp.js            # Student creation (Admin only)
│   ├── AdminDashboard.js    # Admin dashboard
│   ├── StudentManagement.js # Student management
│   ├── ExamCreation.js      # Exam creation form
│   ├── ExamList.js          # Exam list and management
│   ├── AdminReport.js       # Admin report view
│   ├── StudentDashboard.js  # Student dashboard
│   ├── ExamConsole.js       # Exam taking interface
│   └── StudentReport.js     # Student report view
└── App.js                   # Main app component with routing
```

## Data Persistence

All data is stored in browser's LocalStorage:
- Users (including admin and students)
- Exams (with questions and configurations)
- Exam Attempts (student answers and results)

## Notes

- The platform uses LocalStorage for data persistence, so data will persist across browser sessions
- Admin account is pre-created in the database
- Students must be created by Admin
- Exams must be published by Admin before students can see them
- Exam visibility is based on matching student level with exam level

# Abacus-Exam-Platform
