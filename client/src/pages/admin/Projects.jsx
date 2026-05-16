import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import ProjectCard from '../../components/ProjectCard';
import Modal from '../../components/Modal';
import { Plus, Search, FolderKanban } from 'lucide-react';

/**
 * Projects list page.
 */
const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal & form
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const openCreate = () => {
    setEditingProject(null);
    setForm({ title: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setForm({ title: project.title, description: project.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProject) {
        const { data } = await api.put(`/projects/${editingProject._id}`, form);
        setProjects((p) => p.map((proj) => (proj._id === data._id ? data : proj)));
        toast.success('Project updated');
      } else {
        const { data } = await api.post('/projects', form);
        setProjects((p) => [data, ...p]);
        toast.success('Project created');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This will delete all its tasks too.')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((p) => p.filter((proj) => proj._id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Projects</h2>
          <p className="text-slate-400 mt-2 font-medium">
            {projects.length} active project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="card !p-4 flex gap-4 items-center">
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-11 !rounded-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-40 skeleton"></div>)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card text-center py-20 border-dashed border-slate-700">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderKanban size={24} className="text-slate-500" />
          </div>
          <p className="text-slate-300 font-semibold text-lg">No projects found</p>
          <p className="text-slate-500 text-sm mt-2">Create a project to start collaborating with your team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProject ? 'Edit Project' : 'Create Project'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Title *</label>
            <input type="text" className="input" placeholder="e.g. Website Redesign" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </div>
          <div>
            <label>Description</label>
            <textarea rows={3} className="input resize-none" placeholder="Project details..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
