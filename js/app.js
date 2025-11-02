// js/app.js
// Lightweight UI glue for model preference only (API key is managed on the server)
class AppConfig {
  constructor() {
    this.gptModel = localStorage.getItem("gpt_model") || "gpt-4o-mini";
    this.initDOM();
    this.loadConfig();
    this.initEvents();
    // notify the OpenAI client once at startup
    if (window.openAIService?.initialize) {
      window.openAIService.initialize(this.gptModel);
    }
  }

  initDOM() {
    // cache elements if they exist on the page
    this.$model = document.getElementById("gpt-model");
    this.$key = document.getElementById("openai-key"); // legacy field (optional)
    this.$save = document.getElementById("save-config");
  }

  loadConfig() {
    // reflect stored model in the dropdown (if present)
    if (this.$model) this.$model.value = this.gptModel;

    // gracefully deprecate the old API-key textbox if it exists
    if (this.$key) {
      this.$key.value = "";
      this.$key.placeholder = "(API key is managed on the server)";
      this.$key.disabled = true;
      this.$key.style.opacity = "0.6";
      this.$key.style.cursor = "not-allowed";
      this.$key.title =
        "This project uses a backend proxy. No key is needed here.";
    }
  }

  saveConfig() {
    const selected = this.$model ? this.$model.value : this.gptModel;
    this.gptModel = selected || "gpt-4o-mini";
    localStorage.setItem("gpt_model", this.gptModel);

    // inform the OpenAI client to use the new model
    if (window.openAIService?.initialize) {
      window.openAIService.initialize(this.gptModel);
    }
    this.toast("Model preference saved.", "success");
  }

  initEvents() {
    if (this.$save)
      this.$save.addEventListener("click", () => this.saveConfig());

    // allow pressing Enter on the model select to save (handy on mobile keyboards)
    if (this.$model) {
      this.$model.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.saveConfig();
      });
    }
  }

  toast(msg, type = "success") {
    // remove existing
    document
      .querySelectorAll(".config-notification")
      .forEach((n) => n.remove());

    const el = document.createElement("div");
    el.className = `config-notification ${type}`;
    el.textContent = msg;
    el.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      padding: 12px 16px; border-radius: 8px; color: #fff; font-weight: 600;
      box-shadow: 0 2px 8px rgba(0,0,0,.15); transition: opacity .2s ease;
    `;
    el.style.background = type === "success" ? "#16a34a" : "#dc2626";
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 200);
    }, 2200);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.appConfig = new AppConfig();
});
