# Team Task Manager

A full-stack Team Task Management Web Application built as part of a Full-Stack Coding Assignment. Think of it as a simplified version of tools like Trello or Asana, where multiple users can manage tasks efficiently within teams and projects.

---

## 🌐 Live Application

| Service  | URL |
|----------|-----|
| Frontend | https://frontend-production-81af.up.railway.app |
| Backend API | https://backend-production-d55e.up.railway.app |
| Health Check | https://backend-production-d55e.up.railway.app/api/health |

---

## 🔐 Demo Credentials

### Admin Account
| Field    | Value |
|----------|-------|
| Email    | admin@demo.com |
| Password | Admin@1234 |

### Member Accounts
| Field    | Account 1 | Account 2 |
|----------|-----------|-----------|
| Email    | david.lee@email.com | emma.wilson@email.com |
| Password | Password123 | Password123 |

---

## 📌 Features

### User Authentication
- Signup with Name, Email, and Password
- Secure login using JWT (JSON Web Token)
- Role-based access control (Admin / Member)

### Project Management
- Admin can create projects
- Admin can add and remove members from projects
- Members can view their assigned projects only
- One member can be assigned to one project at a time

### Task Management
- Create tasks with Title, Description, Due Date, and Priority
- Assign tasks to project members
- Update task status: To Do / In Progress / Done
- Update task priority: Low / Medium / High
- Tasks are managed inside each project via Kanban Board

### Dashboard
- Total task count
- Tasks grouped by status
- Tasks per user overview
- Overdue tasks highlighted

### Role-Based Access
| Feature                  | Admin | Member |
|--------------------------|-------|--------|
| Create Projects          | ✅    | ❌     |
| Add/Remove Members       | ✅    | ❌     |
| Create/Edit/Delete Tasks | ✅    | ❌     |
| Assign Tasks             | ✅    | ❌     |
| View Assigned Projects   | ✅    | ✅     |
| Update Task Status       | ✅    | ✅     |
| View Dashboard           | ✅    | ✅     |

---

## 🛠️ Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React.js, Tailwind CSS |
| Backend    | Node.js, Express.js |
| Database   | MongoDB (MongoDB Atlas) |
| Auth       | JWT (JSON Web Tokens) |
| Deployment | Railway |

---

## 🗂️ Project Structure
```text
team-task-manager/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/            # Axios configuration
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin pages
│   │   │   └── member/     # Member pages
│   │   └── context/        # Global state management
│   └── package.json
├── server/                 # Node.js Backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   └── index.js            # Server entry point
└── README.md
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js v18 or above
- MongoDB Atlas account or local MongoDB
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Tushar-error/team-task-manager.git
cd team-task-manager
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create a `.env` file inside the `/server` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Start the backend:
```bash
npm start
```

### 3. Setup Frontend
```bash
cd client
npm install
```

Create a `.env` file inside the `/client` folder:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

### 4. Open the App
Frontend: http://localhost:5173
Backend:  http://localhost:5000
Health:   http://localhost:5000/api/health
---

## 🚀 Deployment (Railway)

This application is deployed on Railway.

### Backend Deployment
1. Create a new Railway project.
2. Add a new service → Deploy from GitHub.
3. Select the repository and set root to `/server`.
4. Add the following environment variables:
   - MONGO_URI
   - JWT_SECRET
   - NODE_ENV=production
   - PORT=5000
5. Deploy and copy the backend URL.

### Frontend Deployment
1. Add a new service in the same Railway project.
2. Select the same repository and set root to `/client`.
3. Add environment variable:
   - VITE_API_URL=https://[your-backend].up.railway.app
4. Set build command: `npm run build`
5. Set start command: `npx serve -s dist`
6. Deploy and copy the frontend URL.

### MongoDB Atlas Setup
1. Create a free cluster on MongoDB Atlas.
2. Go to Network Access → Add IP → Allow 0.0.0.0/0
3. Copy the connection string and add it as MONGO_URI in Railway backend environment variables.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint          | Description      | Access |
|--------|-------------------|------------------|--------|
| POST   | /api/auth/signup  | Register user    | Public |
| POST   | /api/auth/login   | Login user       | Public |

### Projects
| Method | Endpoint               | Description          | Access |
|--------|------------------------|----------------------|--------|
| GET    | /api/projects          | Get all projects     | Admin  |
| POST   | /api/projects          | Create project       | Admin  |
| GET    | /api/projects/:id      | Get project by ID    | Both   |
| DELETE | /api/projects/:id      | Delete project       | Admin  |

### Tasks
| Method | Endpoint          | Description       | Access |
|--------|-------------------|-------------------|--------|
| GET    | /api/tasks        | Get all tasks     | Admin  |
| POST   | /api/tasks        | Create task       | Admin  |
| PUT    | /api/tasks/:id    | Update task       | Both   |
| DELETE | /api/tasks/:id    | Delete task       | Admin  |

### Users
| Method | Endpoint          | Description        | Access |
|--------|-------------------|--------------------|--------|
| GET    | /api/admin/users  | Get all members    | Admin  |
| DELETE | /api/admin/users/:id | Remove member   | Admin  |

### Health
| Method | Endpoint      | Description         | Access |
|--------|---------------|---------------------|--------|
| GET    | /api/health   | Server health check | Public |

---

## 🔒 Environment Variables

### Backend (.env)
| Variable    | Description                    | Required |
|-------------|--------------------------------|----------|
| PORT        | Server port (default: 5000)    | ✅       |
| MONGO_URI   | MongoDB connection string      | ✅       |
| JWT_SECRET  | Secret key for JWT signing     | ✅       |
| NODE_ENV    | Environment (production)       | ✅       |

### Frontend (.env)
| Variable       | Description              | Required |
|----------------|--------------------------|----------|
| VITE_API_URL   | Backend API base URL     | ✅       |

---

## 📝 Submission Requirements

- ✅ Live Application URL (Railway)
- ✅ GitHub Repository
- ✅ README with setup and deployment steps
- ⬜ 2-5 minute demo video (to be added)

---

## 👨💻 Author

- GitHub: https://github.com/Tushar-error
