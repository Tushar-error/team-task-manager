import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';

const pageTitles = {
  '/member/dashboard': 'My Workspace',
  '/member/tasks': 'My Tasks',
};

const MemberNavbar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const title = pageTitles[pathname] || 'Workspace';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
      
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-slate-50">
          <Bell size={18} />
        </button>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.name || 'Member'}</p>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
               style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            {user?.name?.charAt(0).toUpperCase() || 'M'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MemberNavbar;
