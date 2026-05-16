import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Clock, AlertCircle, ListTodo, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * Dashboard page — shows task statistics and recent activity.
 */
const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          api.get('/tasks/dashboard'),
          api.get('/projects'),
        ]);
        setStats(statsRes.data);
        setProjects(projectsRes.data.slice(0, 4));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="w-1/3 h-12 skeleton mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 skeleton"></div>
          <div className="h-96 skeleton"></div>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'To Do', value: stats?.pending - stats?.inProgress || 0, color: '#64748B' },
    { name: 'In Progress', value: stats?.inProgress || 0, color: '#8B5CF6' },
    { name: 'Completed', value: stats?.completed || 0, color: '#10B981' },
  ].filter(d => d.value > 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Greeting */}
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Good {getGreeting()},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
        </h2>
        <p className="text-slate-400 mt-2 font-medium">
          Here's an overview of your tasks and projects.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="stat-card bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</h3>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><ListTodo size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.total || 0}</p>
        </div>
        <div className="stat-card bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Completed</h3>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><CheckCircle2 size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.completed || 0}</p>
        </div>
        <div className="stat-card bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">In Progress</h3>
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400"><Clock size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.inProgress || 0}</p>
        </div>
        <div className="stat-card bg-slate-800/50 border-slate-700/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-4 relative">
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Overdue</h3>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><AlertCircle size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-red-400 relative">{stats?.overdue || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Task Chart */}
        <div className="card col-span-1 lg:col-span-1 flex flex-col h-full min-h-[400px]">
          <h3 className="font-semibold text-white mb-6">Task Breakdown</h3>
          <div className="flex-1 flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#F1F5F9' }}
                    itemStyle={{ color: '#F1F5F9' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-sm">No tasks to display.</p>
            )}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* My tasks */}
          <div className="card flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white">Pending Tasks</h3>
              <Link to={isAdmin ? '/admin/tasks' : '/member/tasks'} className="text-sm text-violet-400 hover:text-violet-300 font-medium flex items-center">
                View all <ChevronRight size={14} className="ml-1" />
              </Link>
            </div>
            <div className="flex-1 space-y-3">
              {stats?.myTasks?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <CheckCircle2 size={32} className="text-emerald-500/50 mb-3" />
                  <p className="text-slate-400 font-medium">All caught up!</p>
                </div>
              ) : (
                stats?.myTasks?.map((task) => (
                  <div key={task._id} className="flex flex-col p-3.5 bg-slate-800/40 rounded-xl hover:bg-slate-800/80 transition-colors border border-slate-700/30">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-200 truncate pr-3">{task.title}</p>
                      {task.dueDate && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isPast(new Date(task.dueDate)) ? 'bg-red-500/10 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                          {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                    {task.project && <p className="text-xs text-slate-500 truncate">{task.project.title}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent projects */}
          <div className="card flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white">Recent Projects</h3>
              <Link to={isAdmin ? '/admin/projects' : '/member/projects'} className="text-sm text-violet-400 hover:text-violet-300 font-medium flex items-center">
                View all <ChevronRight size={14} className="ml-1" />
              </Link>
            </div>
            <div className="flex-1 space-y-3">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <p className="text-slate-400 font-medium">No projects yet.</p>
                </div>
              ) : (
                projects.map((project) => (
                  <Link
                    key={project._id}
                    to={isAdmin ? `/admin/projects/${project._id}` : `/member/projects/${project._id}`}
                    className="flex items-center gap-3 p-3 bg-slate-800/40 hover:bg-slate-800/80 rounded-xl transition-colors border border-slate-700/30 group"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                         style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}>
                      {project.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-violet-400 transition-colors">
                        {project.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {project.members?.length} member{project.members?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-violet-400" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

export default Dashboard;
