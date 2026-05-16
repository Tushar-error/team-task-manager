import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Command, Users } from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/admin/projects', label: 'Projects', icon: <FolderKanban size={20} /> },
  { to: '/admin/tasks', label: 'All Tasks', icon: <CheckSquare size={20} /> },
  { to: '/admin/team', label: 'Team & Admins', icon: <Users size={20} /> },
];

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen border-r flex flex-col glass relative z-20" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center glow-violet" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}>
            <Command size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight tracking-wide">Enterprise</h1>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Admin Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Management</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 glow-violet"
               style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}>
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'Admin'}</p>
            <span className="text-[11px] uppercase tracking-wide font-medium text-violet-400">
              {user?.isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
