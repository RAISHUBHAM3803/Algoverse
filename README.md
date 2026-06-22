# AlgoVerse

**An AI-Powered Coding Interview Preparation Platform**

AlgoVerse is a full-stack web application where developers can practice algorithm problems in a VS Code-grade in-browser IDE, receive instant AI-powered feedback, and compete on a live leaderboard.

---

## Tech Stack

**Frontend:** React 19, Vite, Redux Toolkit, Framer Motion, TailwindCSS, Monaco Editor

**Backend:** Node.js, Express, MongoDB, BullMQ, Redis, JWT

**AI:** Google Gemini API

**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas, Upstash Redis

---

## Features

- **In-Browser IDE** — Monaco Editor with syntax highlighting and multi-language support
- **Real-Time Code Execution** — Asynchronous job queue via BullMQ + Piston API
- **AI Interview Assistant** — Hints, time/space complexity analysis, and full code reviews
- **Dashboard & Analytics** — Submission heatmap, streak tracker, and progress graphs
- **Live Leaderboard** — Users ranked by problems solved
- **Secure Auth** — JWT access + refresh token rotation with HttpOnly cookies

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/RAISHUBHAM3803/Algoverse.git
cd Algoverse

# Backend
cd server && npm install
cp .env.example .env   # Add your environment variables
npm run dev

# Frontend (new terminal)
cd client && npm install
cp .env.example .env
npm run dev
```

See [`.env.example`](./server/.env.example) for all required environment variables.

---

## Project Structure

```
AlgoVerse/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── features/    # Redux slices
│       └── pages/
└── server/          # Node.js + Express API
    └── src/
        ├── controllers/
        ├── services/
        ├── models/
        └── workers/     # BullMQ job queue
```

---

## Running Tests

```bash
cd server
npm test                 # All tests
npm run test:coverage    # With coverage report
```

---

## Author

**Shubham Rai** — [@RAISHUBHAM3803](https://github.com/RAISHUBHAM3803)
