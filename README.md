# Team Task Manager

## Live Application
- Frontend: [Will be deployed on Railway]
- Backend API: [Will be deployed on Railway]

## GitHub Repository
- https://github.com/Tushar-error/team-task-manager

## Tech Stack
- Frontend: React.js (Vite, TailwindCSS, Lucide)
- Backend: Node.js / Express.js
- Database: MongoDB (In-memory server by default, customizable via `MONGO_URI`)
- Authentication: JWT
- Deployment: Railway

## Setup Instructions (Local)
1. Clone the repository
2. Install dependencies: `npm install` (in both `/client` and `/server`)
3. Create a `.env` file in `/server` with required variables (e.g., `JWT_SECRET`, `PORT`). If `MONGO_URI` is omitted, it will automatically spin up an in-memory MongoDB for local testing.
4. Run backend: `npm run dev` (in `/server`)
5. Run frontend: `npm run dev` (in `/client`)

## Deployment Steps
The application is pre-configured for deployment on Railway:
1. Push this repository to GitHub.
2. In Railway, deploy two separate services from this repo.
3. For the **Backend Service**:
   - Set Root Directory to `/server`
   - Start Command: `npm start`
   - Add Env Vars: `PORT`, `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`.
4. For the **Frontend Service**:
   - Set Root Directory to `/client`
   - Build Command: `npm run build`
   - Start Command: `npx serve -s dist`
   - Add Env Var: `VITE_API_URL` (pointing to your Railway Backend URL).
5. Update the Backend's `CLIENT_URL` environment variable to match your Railway Frontend URL to allow CORS.

## Features
- User Authentication (Signup/Login with JWT)
- Project Management (Create, Assign Members)
- Task Management (Create, Assign, Update Status & Priority via Kanban)
- Role-Based Access (Admin & Member views completely isolated)
- Dashboard with live task statistics
