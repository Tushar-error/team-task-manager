import { format, isPast } from 'date-fns';
import { Calendar, User, Folder, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const statusConfig = {
  todo: { label: 'Todo', className: 'badge-todo' },
  'in-progress': { label: 'In Progress', className: 'badge-in-progress' },
  done: { label: 'Done', className: 'badge-done' },
};

const priorityConfig = {
  low: { label: 'Low', className: 'badge-low' },
  medium: { label: 'Medium', className: 'badge-medium' },
  high: { label: 'High', className: 'badge-high' },
};

/**
 * Displays a single task as a card.
 * Supports status updates for members, and full actions for admins.
 */
const TaskCard = ({ task, onStatusChange, onPriorityChange, onEdit, onDelete, isAdmin }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  const status = statusConfig[task.status] || statusConfig.todo;
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  
  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    isPast(new Date(task.dueDate));

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
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 items-center mb-1.5 flex-wrap">
            <span className={status.className}>{status.label}</span>
            {task.priority && (
              isAdmin && onPriorityChange ? (
                <select
                  value={task.priority}
                  onChange={(e) => {
                    e.stopPropagation();
                    onPriorityChange(task._id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-violet-500
                    ${task.priority === 'high' ? 'bg-red-500/10 text-red-400' : task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}
                >
                  <option value="low" className="bg-slate-800 text-slate-200">Low</option>
                  <option value="medium" className="bg-slate-800 text-slate-200">Medium</option>
                  <option value="high" className="bg-slate-800 text-slate-200">High</option>
                </select>
              ) : (
                <span className={priority.className}>{priority.label}</span>
              )
            )}
            {isOverdue && (
              <span className="badge-overdue">Overdue</span>
            )}
          </div>
          <h3 className="font-semibold text-slate-100 text-base leading-snug line-clamp-2 pr-4" title={task.title}>
            {task.title}
          </h3>
        </div>

        {/* Admin Menu */}
        {isAdmin && (
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 w-32 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 py-1 overflow-hidden">
                <button
                  onClick={() => { setShowMenu(false); onEdit(task); }}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => { setShowMenu(false); onDelete(task._id); }}
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
      {task.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed flex-1">{task.description}</p>
      )}

      {/* Meta Footer */}
      <div className="mt-auto pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          {task.project && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Folder size={12} />
              <span className="truncate max-w-[120px]">{task.project.title}</span>
            </div>
          )}
          {task.dueDate && (
            <div className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
              <Calendar size={12} />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status Select for quick update */}
          <select
            value={task.status}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(task._id, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5
                       text-slate-300 font-medium focus:outline-none focus:border-violet-500 cursor-pointer transition-colors"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {/* Assignee Avatar */}
          {task.assignedTo ? (
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
              title={task.assignedTo.name}
            >
              {task.assignedTo.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 border-dashed flex items-center justify-center text-slate-500 ring-2 ring-slate-900" title="Unassigned">
              <User size={12} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
