import { useEffect, useState } from 'react';
import { format, isPast } from 'date-fns';
import api from '../../api/axios';
import { CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const { data } = await api.get(`/tasks?assignedTo=${user._id}`);
        setTasks(data);
      } catch (err) {
        console.error('Failed to load member tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTasks();
  }, [user._id]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');

  if (loading) {
    return <div className="p-8 max-w-5xl mx-auto"><div className="h-64 skeleton bg-slate-200"></div></div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in text-slate-800">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome, {user?.name?.split(' ')[0]}</h2>
        <p className="text-slate-500 mt-2 font-medium">You have {pendingTasks.length} tasks remaining.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-black">{completedTasks.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <PlayCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-black">{pendingTasks.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg">My Action Items</h3>
        </div>
        <div className="p-0">
          {pendingTasks.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
              <CheckCircle2 size={48} className="text-emerald-300 mb-4" />
              <p className="font-semibold text-lg text-slate-600">All caught up!</p>
              <p className="text-sm">You have no pending tasks assigned to you.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pendingTasks.map(task => (
                <li key={task._id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-base">{task.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold">
                      {task.project && (
                        <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{task.project.title}</span>
                      )}
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 ${isPast(new Date(task.dueDate)) ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50'} px-2 py-0.5 rounded-md`}>
                          <Clock size={12} />
                          {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="bg-white border-2 border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
