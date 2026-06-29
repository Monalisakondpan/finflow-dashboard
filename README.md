# 🌸 FinFlow — AI-Powered Personal Finance Dashboard

> A full-stack personal finance platform where you track money, set budgets, chase savings goals, and chat with an AI financial advisor that actually knows your numbers.

FinFlow turns scattered spending into a clear story. Log your income and expenses, set budgets per category, define savings goals, and watch your financial health score update in real time. When you want advice, an AI advisor reads your live data and answers with real figures — not generic tips.

---

## ✨ Features

- **Smart dashboard** — total balance, monthly income vs expenses, savings rate, and a financial health score that updates as your data changes.
- **Transaction tracking** — record income and expenses by category, with a running history.
- **Budgets** — set monthly limits per category and get an email alert automatically when spending crosses a threshold.
- **Savings goals** — define targets, track progress, and see how close you are.
- **AI Financial Advisor** — an agentic chat assistant (powered by Groq) that calls live data tools to answer questions like *"Where did I overspend?"* or *"What's my savings rate this month?"* using your actual numbers.
- **Secure authentication** — register, log in, reset your password, and delete your account.
- **Polished UI** — animated page transitions, gradient backgrounds, and a clean theme.

---

## 🧠 The AI Advisor (how it works)

The advisor is not a generic chatbot. It is an **agentic tool-calling assistant**:

1. You ask a question in plain language.
2. A guardrail layer checks the message is finance-related and well-formed.
3. The model receives your name, the current date, and a set of **data tools** (expenses, budget status, financial health, income-vs-expense trends).
4. The model decides which tool(s) to call, the backend runs them against your live database, and the results are fed back to the model.
5. The model answers using your real figures — it never guesses your numbers.

The tool definitions follow an MCP-style structure for clean, extensible tool calling.

---

## 🛠️ Tech Stack

**Frontend**
- React + Vite
- React Router
- Chart.js for visualizations
- Framer Motion for animations
- Axios for API calls

**Backend**
- Node.js + Express
- MongoDB + Mongoose (MongoDB Atlas)
- JWT-based authentication
- Groq SDK for AI inference
- Nodemailer for transactional email

The app is built with security and good practices in mind, following industry-standard approaches to authentication, data handling, and input validation.

---

## 📁 Project Structure

```
finflow-dashboard/
├── finflow-backend/
│   ├── src/
│   │   ├── config/        # DB connection, email setup
│   │   ├── middleware/    # Auth guard
│   │   ├── models/        # User, Transaction, Budget, Goal
│   │   ├── routes/        # auth, transactions, budgets, goals, dashboard, chat
│   │   ├── mcp/           # AI guardrails
│   │   └── server.js      # App entry point
│   └── Dockerfile
├── finflow-frontend/
│   ├── src/
│   │   ├── pages/         # Dashboard, Transactions, Budget, Goals, Login, Register, ResetPassword
│   │   ├── components/    # Sidebar, charts, backgrounds
│   │   └── api/           # Axios instance
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- A MongoDB database (local, or a free MongoDB Atlas cluster)
- A free Groq API key from https://console.groq.com
- A Gmail account with an App Password (for sending emails)

### 1. Clone the repo
```bash
git clone https://github.com/Monalisakondpan/finflow-dashboard.git
cd finflow-dashboard
```

### 2. Set up the backend
```bash
cd finflow-backend
npm install
```

Create a `.env` file in `finflow-backend/` and add your own values: database connection string, a secret key for tokens, your Groq API key, and email credentials.

Start the backend:
```bash
npm run dev
```

### 3. Set up the frontend
```bash
cd ../finflow-frontend
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

### 4. (Optional) Run with Docker
```bash
docker-compose up --build
```

---

## 🗺️ Possible Next Steps

- Recurring transactions and scheduled bills
- Multi-currency support
- Exportable monthly reports (PDF / CSV)
- Shared household budgets
- A companion mobile app

---

## 📄 About

Built as a full-stack portfolio project — combining real-time data, secure authentication, and practical AI tool-calling into one cohesive finance dashboard.
```