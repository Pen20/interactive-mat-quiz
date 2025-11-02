// interactive-math-quiz/js/openai-service.js
class OpenAIService {
  constructor() {
    this.baseURL = "/api/openai/feedback";
    this.model = localStorage.getItem("openai_model") || "gpt-4o-mini";
  }

  initialize(model = "gpt-4o-mini") {
    this.model = model;
    localStorage.setItem("openai_model", model);
  }

  #safeStr(v) {
    if (v == null) return "";
    return typeof v === "string" ? v : JSON.stringify(v);
  }

  async generateFeedback(questionData, userAnswer, reasoning, isCorrect) {
    const systemPrompt = `
    You are an intelligent math tutoring assistant.

Your task: Write a short paragraph (3–5 sentences) giving feedback to the student about their answer.

Guidelines:
1. If the student's answer is correct, say that everything is good and briefly praise the reasoning.
2. If the student made mistakes, explain clearly:
   - whether they understood the main idea or not,
   - what is wrong in their answer or steps,
   - and how to correct or improve it.
3. End with a short recommendation if needed (e.g., “Review how to simplify fractions” or “Revise the rule for differentiating exponents”).
4. Be friendly, concise, and encouraging.
5. Use LaTeX between \\( \\) for math symbols.
6. Output should be a single coherent paragraph — no JSON or lists.`;

    const userPrompt = `
QUESTION: ${JSON.stringify(questionData?.question ?? "")}
PARAMETERS: ${JSON.stringify(questionData?.parameters ?? {})}

STUDENT_ANSWER: ${JSON.stringify(userAnswer ?? "")}
STUDENT_REASONING: ${JSON.stringify(reasoning ?? "")}
IS_CORRECT: ${isCorrect ? "true" : "false"}
CORRECT_ANSWER: ${JSON.stringify(questionData?.correctAnswer ?? "")}

Write a short feedback paragraph based on these details following the system instructions.
`;

    const r = await fetch(this.baseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    const text = await r.text();
    if (!r.ok) {
      try {
        throw new Error(JSON.parse(text)?.error || `HTTP ${r.status}`);
      } catch {
        throw new Error(`HTTP ${r.status}`);
      }
    }

    // Server returns: {"content":"...model text..."}
    // Try to parse payload, then parse payload.content as JSON
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      // very unusual; treat raw as summary
      return this.#fallbackStructured(text, isCorrect);
    }

    const content = typeof payload?.content === "string" ? payload.content : "";
    if (!content) return this.#fallbackStructured("No content.", isCorrect);

    try {
      // Preferred: model followed the JSON schema
      const obj = JSON.parse(content);
      // minimal sanity shaping
      return {
        summary: obj.summary ?? "",
        correctness: obj.correctness ?? (isCorrect ? "correct" : "incorrect"),
        strengths: Array.isArray(obj.strengths) ? obj.strengths : [],
        issues: Array.isArray(obj.issues)
          ? obj.issues
          : isCorrect
          ? []
          : ["Review arithmetic and isolate x."],
        next_steps: Array.isArray(obj.next_steps) ? obj.next_steps : [],
        key_concepts: Array.isArray(obj.key_concepts) ? obj.key_concepts : [],
        math_highlight: obj.math_highlight ?? "",
      };
    } catch {
      // Fallback: model returned plain text; wrap it into our structure
      return this.#fallbackStructured(content, isCorrect);
    }
  }

  #fallbackStructured(text, isCorrect) {
    return {
      summary:
        text || (isCorrect ? "Answer is correct." : "Answer needs correction."),
      correctness: isCorrect ? "correct" : "incorrect",
      strengths: isCorrect ? ["Correct result obtained."] : [],
      issues: isCorrect ? [] : ["Check your algebraic steps."],
      next_steps: isCorrect
        ? []
        : ["Rework steps carefully.", "Verify by substitution."],
      key_concepts: isCorrect
        ? ["Linear equation", "Isolating variable"]
        : ["Balance both sides"],
      math_highlight: "",
    };
  }

  async generateQuickFeedback(question, userAnswer, isCorrect) {
    const prompt = `Question: ${this.#safeStr(question)}
Student Answer: ${this.#safeStr(userAnswer)}
Correct: ${isCorrect ? "Yes" : "No"}

Provide brief, encouraging feedback in 2–3 sentences.`;

    const r = await fetch(this.baseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const text = await r.text();
    if (!r.ok) {
      try {
        throw new Error(JSON.parse(text)?.error || `HTTP ${r.status}`);
      } catch {
        throw new Error(`HTTP ${r.status}`);
      }
    }
    const payload = JSON.parse(text);
    return payload.content || "";
  }
}

window.openAIService = new OpenAIService();
