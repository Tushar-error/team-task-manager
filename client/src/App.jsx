import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Guards
import AdminRoute from './components/AdminRoute';
import MemberRoute from './components/MemberRoute';

// Layout components
import AdminSidebar from './components/AdminSidebar';
import AdminNavbar from './components/AdminNavbar';
import MemberSidebar from './components/MemberSidebar';
import MemberNavbar from './components/MemberNavbar';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Projects from './pages/admin/Projects';
import ProjectDetail from './pages/admin/ProjectDetail';
import Tasks from './pages/admin/Tasks';
import AdminTeam from './pages/admin/AdminTeam';

// Member pages
import MemberDashboard from './pages/member/MemberDashboard';
import MemberTasks from './pages/member/MemberTasks';
import MemberProjects from './pages/member/MemberProjects';

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'} replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'} replace /> : <Signup />}
      />

      {/* Admin Route Group */}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <div className="flex min-h-screen bg-slate-950">
              <AdminSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <AdminNavbar />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projects/:id" element={<ProjectDetail />} />
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="team" element={<AdminTeam />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          </AdminRoute>
        }
      />

      {/* Member Route Group */}
      <Route
        path="/member/*"
        element={
          <MemberRoute>
            <div className="flex min-h-screen bg-slate-50">
              <MemberSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <MemberNavbar />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="dashboard" element={<MemberDashboard />} />
                    <Route path="tasks" element={<MemberTasks />} />
                    <Route path="projects" element={<MemberProjects />} />
                    <Route path="projects/:id" element={<ProjectDetail />} />
                    <Route path="*" element={<Navigate to="/member/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </div>
          </MemberRoute>
        }
      />

      {/* Root Fallback */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default App;
