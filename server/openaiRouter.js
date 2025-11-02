// server/openaiRouter.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();
const VALID_MODELS = new Set(["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"]);

router.post("/feedback", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res
        .status(500)
        .json({ error: "Missing OPENAI_API_KEY on server." });
    }

    let {
      model = "gpt-4o-mini",
      messages,
      max_tokens = 800,
      temperature = 0.3,
    } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: "Missing 'messages' array in request body." });
    }
    if (!VALID_MODELS.has(model)) model = "gpt-4o-mini";

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model, messages, max_tokens, temperature }),
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      let msg = `Upstream ${upstream.status}`;
      try {
        msg = JSON.parse(text)?.error?.message || msg;
      } catch {}
      return res.status(upstream.status).json({ error: msg });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: "Failed to parse OpenAI response.",
        snippet: text.slice(0, 300),
      });
    }

    // Keep the same response shape so the client can parse payload.content
    return res.json({ content: data?.choices?.[0]?.message?.content ?? "" });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

export default router;
