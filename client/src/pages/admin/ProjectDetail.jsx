import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import TaskCard from '../../components/TaskCard';
import { format } from 'date-fns';
import { ChevronRight, Plus, Users, Settings, Grid, Calendar, ListTodo, CheckSquare } from 'lucide-react';

/**
 * Project detail page — shows project info, members, and Kanban board tasks.
 */
const ProjectDetail = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assignedTo: '',
  });
  const [saving, setSaving] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);

  const fetchAll = async () => {
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`),
        isAdmin ? api.get('/users') : Promise.resolve({ data: [] }),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setAllUsers(usersRes.data);
      setSelectedMembers(projRes.data.members.map((m) => m._id));
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  // ── Task actions ─────────────────────────────────────────────────────────────
  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assignedTo: '' });
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo?._id || '',
    });
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...taskForm, project: id };
      if (editingTask) {
        const { data } = await api.put(`/tasks/${editingTask._id}`, payload);
        setTasks((t) => t.map((task) => (task._id === data._id ? data : task)));
        toast.success('Task updated!');
      } else {
        const { data } = await api.post('/tasks', payload);
        setTasks((t) => [data, ...t]);
        toast.success('Task created!');
      }
      setShowTaskModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    // Store original task state for reverting
    const originalTask = tasks.find((t) => t._id === taskId);
    if (!originalTask) return;

    try {
      // Optimistic update
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
      const { data } = await api.put(`/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
      // Revert only this task
      setTasks((prev) => prev.map((t) => (t._id === taskId ? originalTask : t)));
    }
  };

  const handlePriorityChange = async (taskId, priority) => {
    // Store original task state for reverting
    const originalTask = tasks.find((t) => t._id === taskId);
    if (!originalTask) return;

    try {
      // Optimistic update
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, priority } : t)));
      const { data } = await api.put(`/tasks/${taskId}`, { priority });
      setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
      toast.success('Priority updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update priority');
      // Revert only this task
      setTasks((prev) => prev.map((t) => (t._id === taskId ? originalTask : t)));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((t) => t.filter((task) => task._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  // ── Drag and Drop ────────────────────────────────────────────────────────────
  const onDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    // Use a slight timeout to allow the drag image to generate before adding opacity
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const onDragEnd = (e) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
    setDraggedTaskId(null);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      const task = tasks.find(t => t._id === taskId);
      if (task && task.status !== newStatus) {
        handleStatusChange(taskId, newStatus);
      }
    }
  };

  // ── Member management ─────────────────────────────────────────────────────────
  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSaveMembers = async () => {
    try {
      const { data } = await api.put(`/projects/${id}/members`, { members: selectedMembers });
      setProject(data);
      setShowMembersModal(false);
      toast.success('Members updated');
    } catch (err) {
      toast.error('Failed to update members');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      const { data } = await api.delete(`/projects/${id}/members/${memberToRemove._id}`);
      setProject(data);
      setSelectedMembers(data.members.map(m => m._id));
      setMemberToRemove(null);
      // We also need to refresh tasks because tasks were unassigned!
      const tasksRes = await api.get(`/tasks?projectId=${id}`);
      setTasks(tasksRes.data);
      toast.success('Member removed and tasks unassigned');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 skeleton mb-2"></div>
        <div className="card h-32 skeleton mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-96 skeleton"></div>)}
        </div>
      </div>
    );
  }

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  const boardColumns = [
    { id: 'todo', title: 'To Do', icon: <ListTodo size={16} className="text-slate-400" />, color: 'border-t-slate-500' },
    { id: 'in-progress', title: 'In Progress', icon: <Grid size={16} className="text-violet-400" />, color: 'border-t-violet-500' },
    { id: 'done', title: 'Done', icon: <CheckSquare size={16} className="text-emerald-400" />, color: 'border-t-emerald-500' }
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Breadcrumb & Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-3">
          <Link to="/projects" className="hover:text-violet-400 transition-colors">Projects</Link>
          <ChevronRight size={14} />
          <span className="text-slate-200">{project?.title}</span>
        </div>

        <div className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 !p-5">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">{project?.title}</h2>
            {project?.description && (
              <p className="text-slate-400 mt-1.5 text-sm max-w-3xl line-clamp-2 leading-relaxed">{project.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4">
              <div className="flex items-center -space-x-2">
                {project?.members?.slice(0, 5).map((m, i) => (
                  <div key={m._id} 
                       className="w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white z-10 hover:z-20 hover:scale-110 transition-transform"
                       style={{ background: `hsl(${i * 45 + 200}, 70%, 50%)` }}
                       title={m.name}>
                    {m.name.charAt(0)}
                  </div>
                ))}
                {project?.members?.length > 5 && (
                  <div className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 z-10">
                    +{project.members.length - 5}
                  </div>
                )}
                {project?.members?.length === 0 && <span className="text-xs text-slate-500 italic ml-2">No team members</span>}
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Calendar size={14} />
                <span>Created {format(new Date(project?.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <button onClick={() => setShowMembersModal(true)} className="btn-secondary">
                <Users size={16} /> Team
              </button>
              <button onClick={openCreateTask} className="btn-primary">
                <Plus size={16} /> Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
        {boardColumns.map(col => (
          <div 
            key={col.id} 
            className={`flex flex-col min-w-[320px] max-w-[360px] bg-slate-800/30 rounded-2xl border border-slate-700/50 border-t-4 ${col.color}`}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, col.id)}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                {col.icon}
                <h3 className="font-semibold text-slate-200">{col.title}</h3>
              </div>
              <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {tasksByStatus[col.id].length}
              </span>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
              {tasksByStatus[col.id].map(task => (
                <div 
                  key={task._id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task._id)}
                  onDragEnd={onDragEnd}
                  className="cursor-grab active:cursor-grabbing transform transition-transform duration-150 hover:scale-[1.01]"
                >
                  <TaskCard
                    task={task}
                    onStatusChange={handleStatusChange}
                    onPriorityChange={handlePriorityChange}
                    onEdit={openEditTask}
                    onDelete={handleDeleteTask}
                    isAdmin={isAdmin}
                  />
                </div>
              ))}
              {tasksByStatus[col.id].length === 0 && (
                <div className="h-24 border-2 border-dashed border-slate-700/50 rounded-xl flex items-center justify-center text-slate-500 text-sm font-medium">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals remain mostly identical but use modern inputs */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title={editingTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <div>
            <label>Title *</label>
            <input type="text" className="input" placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} required />
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
                {project?.members?.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowTaskModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showMembersModal} onClose={() => setShowMembersModal(false)} title="Manage Team Members">
        <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
          {allUsers.map((u) => {
            const isMember = selectedMembers.includes(u._id);
            return (
              <div key={u._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700/50 transition-colors !mb-0">
                <div className="flex items-center gap-3">
                  {!isMember && (
                    <input type="checkbox" checked={false} onChange={() => toggleMember(u._id)} className="w-4 h-4 accent-violet-500 rounded border-slate-700 bg-slate-900 cursor-pointer" />
                  )}
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${u.role === 'admin' ? 'text-violet-400' : 'text-slate-500'}`}>{u.role}</span>
                  {isMember && (
                    <button 
                      onClick={() => setMemberToRemove(u)}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 pt-4 mt-2 border-t border-slate-800">
          <button className="btn-secondary flex-1" onClick={() => setShowMembersModal(false)}>Cancel</button>
          <button className="btn-primary flex-1" onClick={handleSaveMembers}>Save Additions</button>
        </div>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal isOpen={!!memberToRemove} onClose={() => setMemberToRemove(null)} title="Remove Member from Project">
        <div className="space-y-4">
          <p className="text-slate-300">Are you sure you want to remove <span className="font-bold text-white">{memberToRemove?.name}</span> from this project?</p>
          <p className="text-sm text-slate-400">Any tasks assigned to this member in this project will become unassigned. They will not be deleted from the system.</p>
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button className="btn-secondary flex-1" onClick={() => setMemberToRemove(null)}>Cancel</button>
            <button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors" onClick={handleRemoveMember}>
              Yes, Remove
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
