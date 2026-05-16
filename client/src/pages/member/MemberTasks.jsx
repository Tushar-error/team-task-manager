import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { format, isPast } from 'date-fns';
import { Clock } from 'lucide-react';

const MemberTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get(`/tasks?assignedTo=${user._id}`);
        setTasks(data);
      } catch (err) {
        console.error('Failed to load member tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user._id]);

  const handleStatusChange = async (taskId, newStatus) => {
    const originalTask = tasks.find(t => t._id === taskId);
    if (!originalTask) return;

    try {
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      const { data } = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === data._id ? data : t));
    } catch (err) {
      console.error(err);
      // Revert on failure
      setTasks(tasks.map(t => t._id === taskId ? originalTask : t));
    }
  };

  if (loading) {
    return <div className="p-8 max-w-5xl mx-auto"><div className="h-96 skeleton bg-slate-200"></div></div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">All My Tasks</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {tasks.length === 0 ? (
             <li className="p-8 text-center text-slate-500 font-medium">No tasks assigned to you.</li>
          ) : tasks.map(task => (
            <li key={task._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className={`font-bold text-base ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {task.title}
                  </h4>
                  {task.priority === 'high' && <span className="bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-0.5 rounded">High Priority</span>}
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                  {task.project && <span>Project: {task.project.title}</span>}
                  {task.dueDate && (
                    <span className={`flex items-center gap-1 ${task.status !== 'done' && isPast(new Date(task.dueDate)) ? 'text-red-600' : ''}`}>
                      <Clock size={12} />
                      {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MemberTasks;
