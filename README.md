# 🗂️ Team Task Manager

A production-ready full-stack web application for managing projects, tasks, and teams with role-based access control.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node.js-18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-cyan) ![Railway](https://img.shields.io/badge/Deploy-Railway-purple)

---

## ✨ Features

- 🔐 **JWT Authentication** — Signup, login, logout with secure token storage
- 👥 **Role-Based Access Control** — Admin vs Member permissions enforced on both frontend and backend
- 📁 **Project Management** — Create, view, update, and delete projects with team members
- ✅ **Task Management (Kanban)** — Drag-and-drop task movement, priority flags, and status tracking
- 📊 **Dashboard** — Live stats, task breakdown charts (Recharts), overdue tracking
- 🔍 **Search & Filters** — Global task search, filter by status and priority
- 📱 **Modern UI** — Premium violet glassmorphism design using Tailwind CSS and Lucide Icons

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS      |
| Components | Lucide React, Recharts            |
| Backend    | Node.js, Express 4                |
| Security   | Helmet, Express-Rate-Limit        |
| Database   | MongoDB with Mongoose             |
| Auth       | JWT (jsonwebtoken), bcryptjs      |
| Deployment | Railway                           |

---

## 📁 Project Structure

```
team-task-manager/
├── server/                    # Express API
│   ├── config/db.js           # MongoDB connection logic (fast-fail timeout)
│   ├── controllers/           # Business logic
│   ├── middleware/            # auth.js, role.js
│   ├── models/                # User, Project, Task (w/ priorities)
│   ├── routes/                # API routes
│   ├── .env                   # Configuration
│   └── index.js               # Entry point (Helmet, Rate Limiter)
│
└── client/                    # React + Vite frontend
    ├── src/
    │   ├── api/axios.js        # Axios instance with interceptors
    │   ├── components/         # Reusable UI (Sidebar, Navbar, TaskCard)
    │   ├── context/            # AuthContext for global state
    │   ├── pages/              # Dashboard, Kanban, Tasks, etc.
    │   └── index.css           # Premium Glassmorphism Theme
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

Use the built-in NPM workspace command:

```bash
git clone <your-repo-url>
cd team-task-manager

# Install server and client dependencies simultaneously
npm run install:all
```

### 2. Configure Environment Variables

**Server** (`server/.env`):

```env
PORT=5000
MONGO_URI=<real mongodb atlas uri>
JWT_SECRET=<secure secret>
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run in Development

```bash
# Terminal 1 — Start backend
npm run dev:server

# Terminal 2 — Start frontend
npm run dev:client
```

Visit **http://localhost:5173**

---

## 🚂 Deployment on Railway

### Deploy Backend

1. Create a new Railway project
2. Add a service from your GitHub repo (set root directory to `/server`)
3. Set environment variables in Railway dashboard:
   - `MONGO_URI=<your-production-db>`
   - `JWT_SECRET=<secure-random-string>`
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-frontend.up.railway.app`

### Deploy Frontend

1. Add another Railway service (set root directory to `/client`)
2. Set Build command: `npm run build`
3. Set Start command: `npx serve dist`
4. Set environment variable:
   - `VITE_API_URL=https://your-backend.up.railway.app/api`

### MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user and copy the connection string
4. **Important**: Whitelist `0.0.0.0/0` in Network Access for Railway to connect.

---

## 📝 License

MIT
