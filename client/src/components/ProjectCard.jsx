import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Users, Calendar, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

/**
 * Displays a single project summary.
 */
const ProjectCard = ({ project, isAdmin, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="card-hover relative group flex flex-col h-full bg-slate-900/50">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg"
               style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
            {project.title.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <Link to={isAdmin ? `/admin/projects/${project._id}` : `/member/projects/${project._id}`} className="hover:text-violet-400 transition-colors">
              <h3 className="font-bold text-slate-100 text-base leading-snug truncate">
                {project.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-medium">
              <Calendar size={12} />
              <span>{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Admin Menu */}
        {isAdmin && (
          <div className="relative flex-shrink-0 z-10" ref={menuRef}>
            <button 
              onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 w-32 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 overflow-hidden">
                <button
                  onClick={(e) => { e.preventDefault(); setShowMenu(false); onEdit(project); }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); setShowMenu(false); onDelete(project._id); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 mt-2 mb-6 line-clamp-2 leading-relaxed flex-1">
        {project.description || <span className="italic opacity-50">No description provided.</span>}
      </p>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
          <Users size={16} className="text-slate-500" />
          <span>{project.members?.length || 0} Member{project.members?.length !== 1 ? 's' : ''}</span>
        </div>
        <Link 
          to={isAdmin ? `/admin/projects/${project._id}` : `/member/projects/${project._id}`}
          className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
        >
          View Board →
        </Link>
      </div>
      
      {/* Invisible link overlay for entire card clickability (except buttons) */}
      <Link to={isAdmin ? `/admin/projects/${project._id}` : `/member/projects/${project._id}`} className="absolute inset-0 z-0" aria-label="View Project"></Link>
    </div>
  );
};

export default ProjectCard;
