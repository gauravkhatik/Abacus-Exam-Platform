// Question Generator Service
// Generates questions based on rules and creates distractors

class QuestionGenerator {
  // Generate random number with specified digits
  generateNumber(digits, allowNegative = false) {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    let num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (allowNegative && Math.random() > 0.5) {
      num = -num;
    }
    return num;
  }

  // Generate Addition + Subtraction question
  generateAdditionSubtraction(numDigits, numRows) {
    let numbers = [];
    let result = 0;
    let attempts = 0;
    const maxAttempts = 100;

    // Generate numbers until we get a positive result
    while (result <= 0 && attempts < maxAttempts) {
      numbers = [];
      result = 0;
      for (let i = 0; i < numRows; i++) {
        const num = this.generateNumber(numDigits, true);
        numbers.push(num);
        result += num;
      }
      attempts++;
    }

    // If still negative, force positive by adjusting
    if (result <= 0) {
      const positiveSum = numbers.filter(n => n > 0).reduce((a, b) => a + b, 0);
      const negativeSum = numbers.filter(n => n < 0).reduce((a, b) => a + b, 0);
      if (positiveSum + negativeSum <= 0) {
        // Make the last number positive and large enough
        numbers[numbers.length - 1] = Math.abs(negativeSum) + this.generateNumber(numDigits, false);
        result = numbers.reduce((a, b) => a + b, 0);
      }
    }

    const question = {
      type: 'addition_subtraction',
      numbers,
      correctAnswer: result,
      display: numbers.map(n => n >= 0 ? `+${n}` : `${n}`).join('\n')
    };

    return {
      ...question,
      options: this.generateOptions(result, numDigits)
    };
  }

  // Generate Multiplication question
  generateMultiplication(xDigits, yDigits) {
    const num1 = this.generateNumber(xDigits, false);
    const num2 = this.generateNumber(yDigits, false);
    const result = num1 * num2;

    return {
      type: 'multiplication',
      num1,
      num2,
      correctAnswer: result,
      display: `${num1} × ${num2}`,
      options: this.generateOptions(result, xDigits + yDigits)
    };
  }

  // Generate Division question
  generateDivision(xDigits, yDigits) {
    const divisor = this.generateNumber(yDigits, false);
    const quotient = this.generateNumber(xDigits - yDigits + 1, false);
    const dividend = divisor * quotient; // Ensure clean division

    return {
      type: 'division',
      dividend,
      divisor,
      correctAnswer: quotient,
      display: `${dividend} ÷ ${divisor}`,
      options: this.generateOptions(quotient, xDigits - yDigits + 1)
    };
  }

  // Generate 4 options (1 correct + 3 distractors)
  generateOptions(correctAnswer, digits) {
    const options = [correctAnswer];
    const range = Math.pow(10, Math.max(1, digits - 1));

    // Generate 3 distractors
    while (options.length < 4) {
      let distractor;
      const variation = Math.floor(Math.random() * 3);
      
      switch (variation) {
        case 0:
          // Close to correct answer
          distractor = correctAnswer + Math.floor(Math.random() * range) - Math.floor(range / 2);
          break;
        case 1:
          // Off by one digit manipulation
          distractor = correctAnswer + Math.pow(10, Math.floor(Math.random() * digits));
          break;
        case 2:
          // Random in similar range
          distractor = correctAnswer + Math.floor(Math.random() * range * 2) - range;
          break;
        default:
          distractor = correctAnswer + Math.floor(Math.random() * range);
      }

      // Ensure distractor is positive and different
      if (distractor > 0 && !options.includes(distractor)) {
        options.push(distractor);
      }
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return options.map((opt, index) => ({
      label: String.fromCharCode(65 + index), // A, B, C, D
      value: opt
    }));
  }

  // Generate all questions for an exam
  generateExamQuestions(examConfig) {
    const questions = [];
    const {
      additionSubtractionCount,
      additionSubtractionDigits,
      additionSubtractionRows,
      multiplicationCount,
      multiplicationXDigits,
      multiplicationYDigits,
      divisionCount,
      divisionXDigits,
      divisionYDigits
    } = examConfig;

    // Generate Addition + Subtraction questions
    for (let i = 0; i < additionSubtractionCount; i++) {
      const q = this.generateAdditionSubtraction(additionSubtractionDigits, additionSubtractionRows);
      questions.push(q);
    }

    // Generate Multiplication questions
    for (let i = 0; i < multiplicationCount; i++) {
      const q = this.generateMultiplication(multiplicationXDigits, multiplicationYDigits);
      questions.push(q);
    }

    // Generate Division questions
    for (let i = 0; i < divisionCount; i++) {
      const q = this.generateDivision(divisionXDigits, divisionYDigits);
      questions.push(q);
    }

    // Shuffle questions
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    // Add correct answer index to each question
    return questions.map(q => {
      const correctOption = q.options.find(opt => opt.value === q.correctAnswer);
      return {
        ...q,
        correctAnswer: correctOption ? correctOption.label : 'A'
      };
    });
  }
}

export const questionGenerator = new QuestionGenerator();

