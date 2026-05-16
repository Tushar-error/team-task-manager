# Team Task Manager

## Live Application
- **Frontend:** [https://frontend-production-81af.up.railway.app](https://frontend-production-81af.up.railway.app)
- **Backend API:** [https://backend-production-d55e.up.railway.app](https://backend-production-d55e.up.railway.app)

## GitHub Repository
- [https://github.com/Tushar-error/team-task-manager](https://github.com/Tushar-error/team-task-manager)

## Tech Stack
- **Frontend:** React.js (Vite, TailwindCSS, Lucide)
- **Backend:** Node.js / Express.js
- **Database:** MongoDB (In-memory server by default for this demo)
- **Authentication:** JWT
- **Deployment:** Railway

## Setup Instructions (Local)
1. Clone the repository
2. Install dependencies: `npm install` (in both `/client` and `/server`)
3. Create a `.env` file in `/server` with required variables (`JWT_SECRET`, `PORT`).
4. Run backend: `npm run dev` (in `/server`)
5. Run frontend: `npm run dev` (in `/client`)

## Features
- User Authentication (Signup/Login with JWT)
- Project Management (Create, Assign Members)
- Task Management (Create, Assign, Update Status & Priority via Kanban)
- Role-Based Access (Admin & Member views)
- Dashboard with live task statistics

## Deployment Details
- Deployed on Railway using two separate services (`backend` and `frontend`).
- Frontend build: `vite build`
- Frontend start: `npx serve -s dist`
- Backend start: `node index.js`
