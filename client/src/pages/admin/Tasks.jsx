import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import TaskCard from '../../components/TaskCard';
import Modal from '../../components/Modal';
import { Plus, Search, Filter } from 'lucide-react';

const STATUS_FILTERS = ['all', 'todo', 'in-progress', 'done'];
const PRIORITY_FILTERS = ['all', 'high', 'medium', 'low'];

/**
 * Global tasks page — view all tasks with filtering by status and priority.
 */
const Tasks = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assignedTo: '', project: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (searchQuery) params.append('search', searchQuery);

      const [tasksRes, projRes, usersRes] = await Promise.all([
        api.get(`tasks?${params.toString()}`),
        api.get('projects'),
        isAdmin ? api.get('users') : Promise.resolve({ data: [] }),
      ]);
      setTasks(tasksRes.data);
      setProjects(projRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => fetchAll(), 300);
    return () => clearTimeout(timeout);
  }, [statusFilter, priorityFilter, searchQuery]);

  const openCreate = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assignedTo: '', project: '' });
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo?._id || '',
      project: task.project?._id || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.project) { toast.error('Please select a project'); return; }
    setSaving(true);
    try {
      if (editingTask) {
        const { data } = await api.put(`tasks/${editingTask._id}`, taskForm);
        setTasks((t) => t.map((task) => (task._id === data._id ? data : task)));
        toast.success('Task updated!');
      } else {
        const { data } = await api.post('tasks', taskForm);
        setTasks((t) => [data, ...t]);
        toast.success('Task created!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    const originalTask = tasks.find((t) => t._id === taskId);
    if (!originalTask) return;

    try {
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
      const { data } = await api.put(`tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
      setTasks((prev) => prev.map((t) => (t._id === taskId ? originalTask : t)));
    }
  };

  const handlePriorityChange = async (taskId, priority) => {
    const originalTask = tasks.find((t) => t._id === taskId);
    if (!originalTask) return;

    try {
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, priority } : t)));
      const { data } = await api.put(`tasks/${taskId}`, { priority });
      setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
      toast.success('Priority updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update priority');
      setTasks((prev) => prev.map((t) => (t._id === taskId ? originalTask : t)));
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`tasks/${taskId}`);
      setTasks((t) => t.filter((task) => task._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const selectedProject = projects.find((p) => p._id === taskForm.project);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Tasks</h2>
          <p className="text-slate-400 mt-2 font-medium">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
          </p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={18} />
            New Task
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="card !p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-11 !rounded-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <span className="text-sm font-semibold text-slate-400">Status:</span>
          </div>
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 capitalize
                  ${statusFilter === s ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
              >
                {s.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm font-semibold text-slate-400">Priority:</span>
          </div>
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            {PRIORITY_FILTERS.map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 capitalize
                  ${priorityFilter === p ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="card h-48 skeleton"></div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card text-center py-20 border-dashed border-slate-700">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-slate-500" />
          </div>
          <p className="text-slate-300 font-semibold text-lg">No tasks found</p>
          <p className="text-slate-500 text-sm mt-2">
            Try adjusting your filters or search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
              onEdit={openEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Task Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Title *</label>
            <input type="text" className="input" placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label>Project *</label>
            <select className="input" value={taskForm.project} onChange={(e) => setTaskForm((f) => ({ ...f, project: e.target.value, assignedTo: '' }))} required>
              <option value="">— Select project —</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label>Description</label>
            <textarea rows={3} className="input resize-none" placeholder="Task details..." value={taskForm.description} onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Status</label>
              <select className="input" value={taskForm.status} onChange={(e) => setTaskForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label>Priority</label>
              <select className="input" value={taskForm.priority} onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Due Date</label>
              <input type="date" className="input" value={taskForm.dueDate} onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label>Assign To</label>
              <select className="input" value={taskForm.assignedTo} onChange={(e) => setTaskForm((f) => ({ ...f, assignedTo: e.target.value }))}>
                <option value="">— Unassigned —</option>
                {(selectedProject?.members || allUsers).map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
