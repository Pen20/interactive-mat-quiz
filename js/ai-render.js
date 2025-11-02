// js/ai-render.js
(function () {
  // ---------- Shared LaTeX validator ----------
  const MathUtils = window.MathUtils || {};
  MathUtils.validateLatexSyntax = function (input) {
    const errors = [];
    const s = String(input ?? "");

    const open = (s.match(/(?<!\\){/g) || []).length;
    const close = (s.match(/(?<!\\)}/g) || []).length;
    if (open !== close)
      errors.push(`Unbalanced braces: ${open} “{” vs ${close} “}”.`);

    const noDisplay = s.replace(/\$\$[\s\S]*?\$\$/g, "");
    const singles = (noDisplay.match(/(?<!\\)\$/g) || []).length;
    if (singles % 2) errors.push("Unbalanced $ delimiters.");

    const lSq = (s.match(/(?<!\\)\\\[/g) || []).length;
    const rSq = (s.match(/(?<!\\)\\\]/g) || []).length;
    if (lSq !== rSq) errors.push("Unbalanced \\[ \\] delimiters.");

    const lPar = (s.match(/(?<!\\)\\\(/g) || []).length;
    const rPar = (s.match(/(?<!\\)\\\)/g) || []).length;
    if (lPar !== rPar) errors.push("Unbalanced \\( \\) delimiters.");

    const fracAll = s.match(/\\frac/g) || [];
    const fracOk = s.match(/\\frac\{[^{}]+\}\{[^{}]+\}/g) || [];
    if (fracAll.length !== fracOk.length)
      errors.push("Each \\frac must be \\frac{num}{den}.");

    return { isValid: errors.length === 0, errors };
  };
  window.MathUtils = MathUtils;

  // ---------- Shared AI feedback renderer ----------
  function badge(text, kind = "neutral") {
    const cls =
      kind === "good"
        ? "badge-good"
        : kind === "bad"
        ? "badge-bad"
        : kind === "warn"
        ? "badge-warn"
        : "badge";
    return `<span class="${cls}">${text}</span>`;
  }

  function list(items) {
    if (!items || !items.length) return "<em>—</em>";
    return `<ul class="ai-list">${items
      .map((i) => `<li>${i}</li>`)
      .join("")}</ul>`;
  }

  function renderCard(data) {
    const d =
      typeof data === "object" && data ? data : { summary: String(data || "") };
    const tag =
      d.correctness === "correct"
        ? badge("Correct", "good")
        : d.correctness === "partially-correct"
        ? badge("Partially correct", "warn")
        : d.correctness === "incorrect"
        ? badge("Incorrect", "bad")
        : badge("Feedback");

    const math = d.math_highlight
      ? `<div class="ai-section"><div class="ai-math">\\(${String(
          d.math_highlight
        ).replace(/^\\\(|\\\)$/g, "")}\\)</div></div>`
      : "";

    return `
      <div class="ai-card">
        <div class="ai-card-header">
          <span>🤖 AI Feedback</span>
          <span>${tag}</span>
        </div>

        <div class="ai-section"><p class="ai-summary">${
          d.summary || ""
        }</p></div>
        ${math}

        <div class="ai-grid">
          <div class="ai-col">
            <h4>Strengths</h4>
            ${list(d.strengths)}
          </div>
          <div class="ai-col">
            <h4>Issues</h4>
            ${list(d.issues)}
          </div>
        </div>

        <div class="ai-section">
          <h4>Next Steps</h4>
          ${list(d.next_steps)}
        </div>

        <div class="ai-section ai-tags">
          ${(d.key_concepts || [])
            .map((k) => `<span class="chip">${k}</span>`)
            .join("")}
        </div>
      </div>
    `;
  }

  window.AIRender = { renderCard };
})();
