import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';

const pageTitles = {
  '/admin/dashboard': 'Overview',
  '/admin/projects': 'Projects',
  '/admin/tasks': 'All Tasks',
  '/admin/team': 'Team & Admins',
};

const AdminNavbar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const title =
    pageTitles[pathname] ||
    (pathname.startsWith('/admin/projects/') ? 'Project Board' : 'Admin Panel');

  return (
    <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-10 glass border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-slate-800/50 border border-slate-700/50 text-slate-200 text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-violet-500 transition-colors w-48"
            />
          </div>
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full border border-slate-900"></span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-700 hidden md:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-200">{user?.name || 'Admin'}</p>
            <p className="text-[11px] text-violet-400 uppercase tracking-wider font-bold">Admin</p>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg glow-violet cursor-pointer hover:scale-105 transition-transform"
               style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}>
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
