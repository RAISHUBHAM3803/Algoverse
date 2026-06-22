# ⚡ AlgoVerse — AI-Powered Coding Interview Platform

> A full-stack, production-ready coding platform built as a Final Year Project. Practice data structures and algorithms in a premium in-browser IDE, get instant AI feedback, and track your progress on a public leaderboard.

---

## 🚀 Live Demo

> 🔗 Coming soon — deploying to Vercel + Render

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧑‍💻 **In-Browser IDE** | Monaco Editor (same engine as VS Code) with multi-language support |
| ⚡ **Real-Time Code Execution** | Powered by the Piston API via a BullMQ job queue |
| 🤖 **AI Interview Assistant** | Get hints, complexity analysis, and full code reviews from Google Gemini |
| 📊 **Dashboard & Analytics** | Submission heatmap, streak tracker, and performance graphs |
| 🏆 **Live Leaderboard** | Compete with other users ranked by problems solved |
| 🔐 **Secure Authentication** | JWT access tokens + refresh tokens stored in HttpOnly cookies |
| 🛡️ **Enterprise-grade Security** | Rate limiting, XSS protection, Mongo sanitization, HPP prevention |

---

## 🏗️ Tech Stack

### Frontend
- **React 19** + **Vite** — blazing-fast UI
- **Redux Toolkit** — global state management
- **Framer Motion** — animations and page transitions
- **Monaco Editor** — VS Code-grade in-browser IDE
- **TailwindCSS** — utility-first styling

### Backend
- **Node.js** + **Express.js** — REST API server
- **MongoDB** + **Mongoose** — database and ODM
- **BullMQ** + **Redis (Upstash)** — async job queue for code execution
- **JWT** — stateless authentication with refresh token rotation
- **Google Gemini API** — AI-powered hints and code reviews

---

## 📁 Project Structure

```
AlgoVerse/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/            # Axios instance & interceptors
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Redux slices (auth, problems, submissions)
│   │   ├── pages/          # Route-level page components
│   │   └── routes/         # App routing (protected + public)
│   └── ...
│
└── server/                 # Node.js + Express backend
    ├── src/
    │   ├── controllers/    # Request handlers
    │   ├── services/       # Business logic layer
    │   ├── models/         # Mongoose schemas
    │   ├── routes/         # API route definitions
    │   ├── middleware/     # Auth, error handling, rate limiting
    │   └── workers/        # BullMQ submission queue worker
    ├── scripts/            # Database seeding scripts
    └── tests/              # Integration & security test suites
```

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Redis (local or Upstash)

### 1. Clone the repository
```bash
git clone https://github.com/RAISHUBHAM3803/Algoverse.git
cd Algoverse
```

### 2. Setup the Backend
```bash
cd server
npm install
cp .env.example .env   # Fill in your environment variables
npm run dev
```

### 3. Setup the Frontend
```bash
cd client
npm install
cp .env.example .env   # Fill in VITE_API_URL
npm run dev
```

### 4. Seed the Database (Optional)
```bash
cd server
npm run seed
```

The app will be running at `http://localhost:5173`.

---

## 🔐 Environment Variables

See [`server/.env.example`](./server/.env.example) and [`client/.env.example`](./client/.env.example) for the full list of required environment variables.

---

## 🧪 Testing

The backend includes a comprehensive test suite covering authentication, code execution, and security.

```bash
cd server
npm test                  # Run all tests
npm run test:coverage     # Run tests with coverage report
npm run test:security     # Run security-specific tests
```

---

## 🚀 Deployment

| Service | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) |
| Database | [MongoDB Atlas](https://mongodb.com/atlas) |
| Redis Queue | [Upstash](https://upstash.com) |

---

## 👨‍💻 Author

**Shubham Rai**
- GitHub: [@RAISHUBHAM3803](https://github.com/RAISHUBHAM3803)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
