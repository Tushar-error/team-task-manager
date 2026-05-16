import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LayoutDashboard, CheckSquare, LogOut, Coffee } from 'lucide-react';

const navItems = [
  { to: '/member/dashboard', label: 'My Workspace', icon: <LayoutDashboard size={20} /> },
  { to: '/member/tasks', label: 'My Tasks', icon: <CheckSquare size={20} /> },
];

const MemberSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-50 border-r border-slate-200 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <Coffee size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-tight tracking-wide">Workspace</h1>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Team Member</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 bg-slate-50">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Focus</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50'}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-5 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
               style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            {user?.name?.charAt(0).toUpperCase() || 'M'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
            <span className="text-[11px] uppercase tracking-wide font-medium text-slate-500">
              MEMBER
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                     text-slate-600 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default MemberSidebar;
