# 🎯 Interactive Math Quiz

An interactive web platform to **practice and master mathematical concepts** — powered by **OpenAI feedback**.  
Learners can solve algebra equations, system of equations, and matrix determinants with instant AI feedback and step-by-step hints.

![App Preview](assets\background_image.png)

---

## 🧩 Features

- 🧠 **AI-Powered Feedback** — Uses OpenAI GPT models for personalized explanations.
- 🧮 **Math Rendering with MathJax** — Supports LaTeX notation for clean mathematical formatting.
- ✍️ **Reasoning Input** — Users can describe their solution process and receive AI feedback.
- 📈 **Dynamic Quiz Types:**
  - Algebra Quiz
  - System of Equations Quiz
  - Matrix Determinant Quiz
- ⚡ **Live Preview** — See rendered LaTeX expressions in real time.
- 🔒 **Secure Server** — Configured with Helmet, Rate Limiting, and CORS policies.

---

## 🗂 Project Structure

```
interactive-math-quiz/
│
├── index.html
├── html/
│ ├── algebra-quiz.html
│ ├── equations-quiz.html
│ └── determinant-quiz.html
│
├── js/
│ ├── app.js
│ ├── openai-service.js
│ ├── algebra-quiz.js
│ ├── equations-quiz.js
│ └── determinant-quiz.js
│
├── css/
│ ├── style.css
│ └── quiz-common.css
│
├── assets/
│ └── 43be24d2-9dda-46ef-8ec7-35a9cebf36a1.png
│
└── server/
├── index.js
├── openaiRouter.js
├── package.json
├── .env (not committed)
└── node_modules/
```

---

## ⚙️ Local Setup

### 1. Clone this repository

```bash
git clone https://github.com/yourusername/interactive-math-quiz.git
cd interactive-math-quiz/server
```

2. Install dependencies

```
npm install
```

3. Create a .env file inside the server/ folder

```
OPENAI_API_KEY=sk-your-real-key-here
PORT=3080
FRONTEND_ORIGIN=http://localhost:3080
NODE_ENV=development
```

4. Start the server

```.
npm start
```

Then open:
👉 http://localhost:3080/

🌍 Deployment Guide (Free)
🟣 Option 1: Deploy on Render

Go to Render.com

Click New + → Web Service

Connect your GitHub repo

Choose:

Root Directory: /server

Build Command: npm install

Start Command: npm start

Add these Environment Variables in the Render dashboard:
OPENAI_API_KEY=sk-your-key
NODE_ENV=production
FRONTEND_ORIGIN=https://your-app-name.onrender.com

Click Deploy 🚀

Once deployed, visit:
https://your-app-name.onrender.com

🟢 Option 2: Deploy on Railway

Go to Railway.app

Click New Project → Deploy from GitHub

Choose this repository

Add environment variables under “Variables”:
OPENAI_API_KEY=sk-your-key
NODE_ENV=production
FRONTEND_ORIGIN=https://your-app-name.up.railway.app

Deploy and access your app:
https://your-app-name.up.railway.app

📱 Mobile Access
Once deployed on Render or Railway:

Your app will be accessible on mobile via HTTPS (e.g., https://your-app-name.onrender.com).

Ensure CORS and FRONTEND_ORIGIN match your live domain.

MathJax and OpenAI requests work seamlessly on mobile browsers.

🛡️ Security Notes

The OpenAI API key is stored only on the server (never exposed to users).

The client communicates securely via /api/openai.

Helmet and Rate Limiting prevent abuse or excessive requests.

🧩 Future Enhancements

Add quiz progress tracking per user

Integrate voice-based AI tutor

Expand quiz topics (Calculus, Probability, Geometry)

Multi-language support (English, French, Italian)

🧑‍💻 Author
Dogbalou Motognon Wastalas d’Assise
PhD Candidate in Applied Data Science & AI, University of Trieste
📧 wastalasdassise@gmail.com

🪪 License
This project is open-source under the MIT License.

---

🚀 3. How to Deploy with render.yaml

Push everything (including render.yaml) to your GitHub repository.

Go to Render.com
.

Click “New + → Blueprint”.

Choose your repository.

Render reads the render.yaml automatically and starts deployment.

When prompted, add your OpenAI API Key under:
Dashboard → Environment → Add Environment Variable

OPENAI_API_KEY=sk-your-real-key

Wait for deployment → Render gives you a public URL like
https://interactive-math-quiz.onrender.com

✅ 4. After Deployment

Visit your app at that Render URL.

Test from your mobile phone too — it works automatically via HTTPS.

Confirm the AI Feedback loads (if not, check your .env and API key).
