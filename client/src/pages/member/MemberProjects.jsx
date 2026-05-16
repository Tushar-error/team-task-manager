import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Folder } from 'lucide-react';
import { Link } from 'react-router-dom';

const MemberProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('projects');
        // Filter projects where user is a member
        const myProjects = data.filter(p => p.members.some(m => m._id === user._id) || p.createdBy === user._id);
        setProjects(myProjects);
      } catch (err) {
        console.error('Failed to load member projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user._id]);

  if (loading) {
    return <div className="p-8 max-w-5xl mx-auto"><div className="h-64 skeleton bg-slate-200"></div></div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 font-medium bg-white rounded-2xl border border-slate-200">
            You are not part of any projects yet.
          </div>
        ) : projects.map(project => (
          <Link to={`/member/projects/${project._id}`} key={project._id} className="block">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Folder size={20} />
                </div>
                <h3 className="font-bold text-slate-800 hover:text-emerald-600 transition-colors">{project.title}</h3>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">{project.description || 'No description.'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MemberProjects;
