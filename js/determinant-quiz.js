// js/determinant-quiz.js
document.addEventListener("DOMContentLoaded", function () {
  // Initialize OpenAI service with saved model preference (no API key in browser)
  const savedModel = localStorage.getItem("gpt_model") || "gpt-4o-mini";
  if (window.openAIService?.initialize) {
    window.openAIService.initialize(savedModel);
  }

  const elements = {
    checkButton: document.getElementById("check-answer"),
    showSolutionButton: document.getElementById("show-solution"),
    showStepsButton: document.getElementById("show-steps"),
    clearButton: document.getElementById("clear-all"),
    showHintsButton: document.getElementById("show-hints"),
    newQuestionButton: document.getElementById("new-question"),
    feedbackDiv: document.getElementById("feedback"),
    solutionDiv: document.getElementById("solution"),
    stepByStepDiv: document.getElementById("step-by-step"),
    validationAnswer: document.getElementById("validation-answer"),
    reasoningInput: document.getElementById("reasoning-input"),
    reasoningFeedback: document.getElementById("reasoning-feedback"),
    hint: document.getElementById("hint"),
    examples: document.getElementById("examples"),
    mathPreview: document.getElementById("math-preview-content"),
    aiFeedbackEnhanced: document.getElementById("ai-feedback-enhanced"),
    aiFeedbackContentEnhanced: document.getElementById(
      "ai-feedback-content-enhanced"
    ),
    matrixDisplay: document.getElementById("matrix-display"),
    questionText: document.getElementById("question-text"),
    stepsContent: document.getElementById("steps-content"),
    solutionContent: document.getElementById("solution-content"),
    userAnswerInput: document.getElementById("user-answer"),
    latexValidation: document.getElementById("latex-validation"),
    answerStatusIcon: document.getElementById("answer-status-icon"),
    reasoningStatusIcon: document.getElementById("reasoning-status-icon"),
    latexStatusIcon: document.getElementById("latex-status-icon"),
  };

  let currentQuestion = {
    matrix: [
      [2, 4, 3],
      [-3, 0, -5],
      ["k", 4, 3],
    ],
    criticalValue: 2,
    determinant: "40 - 20k",
    correctAnswer: "k < 2 or k > 2",
    alternativeAnswers: [
      "k < 2 or k > 2",
      "2 < k or k < 2",
      "k > 2 or k < 2",
      "k ≠ 2",
      "k != 2",
      "k ∈ ℝ \\ {2}",
      "(-∞, 2) ∪ (2, ∞)",
    ],
    question:
      "Find the values of k for which the determinant of the matrix is non-zero",
    topic: "determinant",
  };

  let hintsShown = false;
  let mathjaxTimeout;

  // Random matrix with 'k' in position (3,1)
  function generateRandomMatrix() {
    const r = () => Math.floor(Math.random() * 11) - 5;
    return [
      [r(), r(), r()],
      [r(), r(), r()],
      ["k", r(), r()],
    ];
  }

  // Compute determinant as constant + k*coef and its critical root
  function calculateDeterminant(matrix) {
    const [a, b, c] = matrix[0];
    const [d, e, f] = matrix[1];
    const [g, h, i] = matrix[2]; // g === 'k'

    const term1 = a * (e * i - f * h);
    // -b * (d*i - f*k)  -> constant: -b*d*i, k-coef: +b*f
    // +c * (d*h - e*k)  -> constant: +c*d*h, k-coef: -c*e
    const constantPart = term1 - b * d * i + c * d * h;
    const kCoefficient = b * f - c * e;

    const determinant = `${constantPart} + ${kCoefficient}k`;
    const criticalValue = -constantPart / kCoefficient;

    return {
      determinant,
      criticalValue,
      calculation: `${a}(${e}*${i} - ${f}*${h}) - ${b}(${d}*${i} - ${f}*k) + ${c}(${d}*${h} - ${e}*k)`,
    };
  }

  function generateCorrectAnswer(criticalValue) {
    return `k < ${criticalValue} or k > ${criticalValue}`;
  }

  function generateAlternativeAnswers(criticalValue) {
    return [
      `k < ${criticalValue} or k > ${criticalValue}`,
      `${criticalValue} < k or k < ${criticalValue}`,
      `k > ${criticalValue} or k < ${criticalValue}`,
      `k ≠ ${criticalValue}`,
      `k != ${criticalValue}`,
      `k ∈ ℝ \\ {${criticalValue}}`,
      `(-∞, ${criticalValue}) ∪ (${criticalValue}, ∞)`,
    ];
  }

  function generateNewQuestion() {
    let matrix, result;
    do {
      matrix = generateRandomMatrix();
      result = calculateDeterminant(matrix);
    } while (!Number.isFinite(result.criticalValue) || !Number.isInteger(result.criticalValue) || Math.abs(result.criticalValue) > 10 || Math.abs(result.criticalValue) < 1);

    currentQuestion = {
      matrix,
      criticalValue: result.criticalValue,
      determinant: result.determinant,
      correctAnswer: generateCorrectAnswer(result.criticalValue),
      alternativeAnswers: generateAlternativeAnswers(result.criticalValue),
      calculation: result.calculation,
      question:
        "Find the values of k for which the determinant of the matrix is non-zero",
      topic: "determinant",
    };

    updateQuestionDisplay();
    clearAll();
  }

  function updateQuestionDisplay() {
    const m = currentQuestion.matrix;
    elements.matrixDisplay.innerHTML = `\\[ \\begin{bmatrix} ${m[0][0]} & ${m[0][1]} & ${m[0][2]} \\\\ ${m[1][0]} & ${m[1][1]} & ${m[1][2]} \\\\ ${m[2][0]} & ${m[2][1]} & ${m[2][2]} \\end{bmatrix} \\]`;

    if (window.MathJax) {
      MathJax.typesetPromise([elements.matrixDisplay]).catch(console.error);
    }
  }

  // ---- Input validation & UI state ----
  function validateUserInput() {
    const v = elements.userAnswerInput.value.trim();
    const ok = v.length > 0;
    updateAnswerStatus(ok);
    return ok;
  }

  function validateReasoningInput() {
    const v = elements.reasoningInput.value.trim();
    const ok = v.length > 0;
    updateReasoningStatus(ok);
    return ok;
  }

  function updateAnswerStatus(ok) {
    elements.answerStatusIcon.textContent = ok ? "✓" : "✗";
    elements.answerStatusIcon.className = ok ? "status-check" : "status-cross";
  }

  function updateReasoningStatus(ok) {
    elements.reasoningStatusIcon.textContent = ok ? "✓" : "✗";
    elements.reasoningStatusIcon.className = ok
      ? "status-check"
      : "status-cross";
  }

  function updateLatexStatus(ok) {
    elements.latexStatusIcon.textContent = ok ? "✓" : "✗";
    elements.latexStatusIcon.className = ok ? "status-check" : "status-cross";
  }

  function updateCheckAnswerButton() {
    const a = validateUserInput();
    const r = validateReasoningInput();
    elements.checkButton.disabled = !(a && r);
  }

  // ---- LaTeX live preview (shared validator) ----
  function updateMathPreview() {
    const text = elements.reasoningInput.value;

    if (text.trim() === "") {
      elements.mathPreview.innerHTML =
        "Your mathematical notation will appear here as you type...";
      elements.latexValidation.classList.add("hidden");
      updateLatexStatus(true);
      return;
    }

    const validation = window.MathUtils.validateLatexSyntax(text);
    updateLatexStatus(validation.isValid);

    if (!validation.isValid) {
      elements.latexValidation.classList.remove("hidden");
      elements.latexValidation.className = "latex-validation latex-invalid";
      elements.latexValidation.innerHTML = `<strong>LaTeX Syntax Issues:</strong><ul>${validation.errors
        .map((e) => `<li>${e}</li>`)
        .join("")}</ul>`;
    } else {
      elements.latexValidation.classList.add("hidden");
    }

    const previewHtml = text
      .replace(/\$\$(.*?)\$\$/gs, '<div class="math-display">\\[$1\\]</div>')
      .replace(/\$(.*?)\$/gs, '<span class="math-inline">\\($1\\)</span>')
      .replace(/\n/g, "<br>");

    elements.mathPreview.innerHTML = previewHtml;

    if (mathjaxTimeout) clearTimeout(mathjaxTimeout);
    mathjaxTimeout = setTimeout(() => {
      if (window.MathJax) {
        MathJax.typesetPromise([elements.mathPreview]).catch(() => {
          elements.mathPreview.innerHTML = `<div style="color:#dc3545;"><strong>Math Rendering Error:</strong> Check for unmatched $, {, or }.</div>
             <div style="margin-top:10px;font-family:monospace;white-space:pre-wrap;">${text}</div>`;
        });
      }
    }, 400);
  }

  // ---- Answer check (string variations) ----
  function checkUserAnswer(userAnswer) {
    const normalized = userAnswer.toLowerCase().replace(/\s+/g, " ");
    for (const ans of currentQuestion.alternativeAnswers) {
      if (normalized === ans.toLowerCase().replace(/\s+/g, " ")) return true;
    }
    const k = currentQuestion.criticalValue;
    const variations = [
      `k<${k} or k>${k}`,
      `k < ${k} or k > ${k}`,
      `k>${k} or k<${k}`,
      `k > ${k} or k < ${k}`,
      `k != ${k}`,
      `k≠${k}`,
      `k <> ${k}`,
      `k not equal to ${k}`,
      `k not ${k}`,
    ];
    return variations.some(
      (v) => normalized === v.toLowerCase().replace(/\s+/g, " ")
    );
  }

  // ---- Solutions ----
  function updateSolutionSteps() {
    const { matrix, criticalValue, determinant, calculation } = currentQuestion;
    elements.stepsContent.innerHTML = `
      <div class="step">
        <div class="step-title">Step 1: Understand the Problem</div>
        <p>Find values of \\(k\\) making the determinant non-zero. First locate when it is zero, then exclude that.</p>
      </div>
      <div class="step">
        <div class="step-title">Step 2: Write the Determinant</div>
        <p>\\[ \\begin{vmatrix} ${matrix[0][0]} & ${matrix[0][1]} & ${matrix[0][2]} \\\\ ${matrix[1][0]} & ${matrix[1][1]} & ${matrix[1][2]} \\\\ ${matrix[2][0]} & ${matrix[2][1]} & ${matrix[2][2]} \\end{vmatrix} = ${calculation} \\]</p>
      </div>
      <div class="step">
        <div class="step-title">Step 3: Simplify</div>
        <p>\\[ = ${determinant} \\]</p>
      </div>
      <div class="step">
        <div class="step-title">Step 4: Set to Zero</div>
        <p>\\[ ${determinant} = 0 \\Rightarrow k = ${criticalValue} \\]</p>
      </div>
      <div class="step">
        <div class="step-title">Step 5: Non-zero Region</div>
        <p>Determinant is non-zero for all \\(k\\) except \\(${criticalValue}\\): \\(k < ${criticalValue}\\) or \\(k > ${criticalValue}\\).</p>
      </div>`;
    if (window.MathJax)
      MathJax.typesetPromise([elements.stepsContent]).catch(console.error);
  }

  function updateCompleteSolution() {
    const { matrix, criticalValue, determinant, calculation } = currentQuestion;
    elements.solutionContent.innerHTML = `
      <p>Compute the determinant and find when it is zero, then exclude that value.</p>
      <p>\\[ \\begin{vmatrix} ${matrix[0][0]} & ${matrix[0][1]} & ${matrix[0][2]} \\\\ ${matrix[1][0]} & ${matrix[1][1]} & ${matrix[1][2]} \\\\ ${matrix[2][0]} & ${matrix[2][1]} & ${matrix[2][2]} \\end{vmatrix} = ${calculation} = ${determinant} \\]</p>
      <p>Set to zero: \\[ ${determinant} = 0 \\Rightarrow k = ${criticalValue} \\]</p>
      <p>Therefore determinant is non-zero for \\(k < ${criticalValue}\\) or \\(k > ${criticalValue}\\).</p>`;
    if (window.MathJax)
      MathJax.typesetPromise([elements.solutionContent]).catch(console.error);
  }

  // ---- Events ----
  elements.showHintsButton.addEventListener("click", () => {
    elements.hint.classList.remove("hidden");
    elements.examples.classList.remove("hidden");
    hintsShown = true;
    elements.showHintsButton.style.display = "none";
    if (window.MathJax)
      MathJax.typesetPromise([elements.hint, elements.examples]).catch(
        console.error
      );
  });

  elements.newQuestionButton.addEventListener("click", generateNewQuestion);

  elements.checkButton.addEventListener("click", async () => {
    const userAnswer = elements.userAnswerInput.value.trim();

    if (!validateUserInput() || !validateReasoningInput()) {
      if (!validateUserInput())
        elements.validationAnswer.textContent =
          "Please enter your answer first.";
      if (!validateReasoningInput())
        elements.reasoningFeedback.textContent =
          "Please explain your reasoning first.";
      return;
    }

    const isCorrect = checkUserAnswer(userAnswer);

    try {
      elements.aiFeedbackContentEnhanced.innerHTML =
        "<p>Generating AI feedback...</p>";
      elements.aiFeedbackEnhanced.classList.remove("hidden");

      const aiFeedback = await window.openAIService.generateFeedback(
        currentQuestion,
        userAnswer,
        elements.reasoningInput.value,
        isCorrect
      );

      elements.aiFeedbackContentEnhanced.innerHTML =
        window.AIRender.renderCard(aiFeedback);
      if (window.MathJax) {
        MathJax.typesetPromise([elements.aiFeedbackContentEnhanced]).catch(
          console.error
        );
      }
    } catch (error) {
      elements.aiFeedbackContentEnhanced.innerHTML = `<p style="color:#dc3545;"><strong>Error:</strong> ${error.message}</p>`;
    }

    elements.feedbackDiv.classList.remove("hidden");
    if (isCorrect) {
      elements.feedbackDiv.className = "feedback correct";
      elements.feedbackDiv.textContent = "✓ Correct answer, well done.";
    } else {
      elements.feedbackDiv.className = "feedback incorrect";
      elements.feedbackDiv.textContent =
        "✗ Incorrect answer. Please review the solution steps.";
    }
  });

  elements.showSolutionButton.addEventListener("click", () => {
    elements.solutionDiv.classList.remove("hidden");
    elements.stepByStepDiv.classList.add("hidden");
    updateCompleteSolution();

    if (!hintsShown) {
      elements.hint.classList.remove("hidden");
      elements.examples.classList.remove("hidden");
      hintsShown = true;
      elements.showHintsButton.style.display = "none";
    }

    elements.userAnswerInput.value = currentQuestion.correctAnswer;
    updateCheckAnswerButton();
    elements.feedbackDiv.classList.remove("hidden");
    elements.feedbackDiv.className = "feedback correct";
    elements.feedbackDiv.textContent = "✓ Correct answer, well done.";
  });

  elements.showStepsButton.addEventListener("click", () => {
    elements.stepByStepDiv.classList.remove("hidden");
    elements.solutionDiv.classList.add("hidden");
    updateSolutionSteps();

    if (!hintsShown) {
      elements.hint.classList.remove("hidden");
      elements.examples.classList.remove("hidden");
      hintsShown = true;
      elements.showHintsButton.style.display = "none";
    }
  });

  function clearAll() {
    elements.userAnswerInput.value = "";
    elements.reasoningInput.value = "";
    elements.feedbackDiv.classList.add("hidden");
    elements.solutionDiv.classList.add("hidden");
    elements.stepByStepDiv.classList.add("hidden");
    elements.aiFeedbackEnhanced.classList.add("hidden");
    elements.latexValidation.classList.add("hidden");
    elements.hint.classList.add("hidden");
    elements.examples.classList.add("hidden");
    elements.showHintsButton.style.display = "block";
    hintsShown = false;
    elements.validationAnswer.textContent = "";
    updateCheckAnswerButton();
    updateMathPreview();
  }

  elements.clearButton.addEventListener("click", clearAll);

  elements.userAnswerInput.addEventListener("input", updateCheckAnswerButton);
  elements.reasoningInput.addEventListener("input", () => {
    updateCheckAnswerButton();
    updateMathPreview();
  });

  // ---- Init ----
  generateNewQuestion();
  updateCheckAnswerButton();
  updateMathPreview();
});
