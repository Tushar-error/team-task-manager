import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { Shield, ShieldAlert, User, MoreVertical, Plus, Check } from 'lucide-react';

const AdminTeam = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async (isRetry = false) => {
    try {
      setError(false);
      setLoading(true);
      const { data } = await api.get('admin/users');
      setUsers(data);
      setRetryCount(0); // reset on success
    } catch (err) {
      console.error(err);
      if (!isRetry && retryCount === 0) {
        // Auto-retry once
        setRetryCount(1);
        setTimeout(() => fetchUsers(true), 1000);
      } else {
        setError(true);
        toast.error('Failed to load team members');
      }
    } finally {
      if (isRetry || retryCount > 0 || !error) {
        setLoading(false);
      }
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('admin/create-admin', form);
      toast.success('Admin created successfully');
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/admin/users/${userToDelete._id}`);
      toast.success('User removed from system');
      setUsers(users.filter(u => u._id !== userToDelete._id));
      setUserToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove user');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Team Management</h2>
          <p className="text-slate-400 mt-2 font-medium">Manage members and admin access.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} /> Add Admin
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-sm uppercase tracking-wider bg-slate-900/50">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-400 font-medium animate-pulse">Loading members...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <ShieldAlert size={48} className="text-red-500/50 mb-2" />
                      <p className="text-slate-300 font-semibold text-lg">Failed to load members</p>
                      <p className="text-sm text-slate-500 max-w-md mx-auto">There was a problem communicating with the server. Please check your connection and try again.</p>
                      <button onClick={() => { setRetryCount(0); fetchUsers(); }} className="btn-primary mt-4 bg-red-500 hover:bg-red-600 border-none">
                        Retry Loading Members
                      </button>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500 font-medium">No members found.</td>
                </tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                           style={{ background: u.role === 'admin' ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                        {u.name.charAt(0)}
                      </div>
                      <div className="font-semibold text-slate-200">
                        {u.name} {u._id === currentUser._id && <span className="text-xs text-slate-500 ml-2">(You)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">{u.email}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {u.isSuperAdmin ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider">
                          <ShieldAlert size={14} /> Super Admin
                        </span>
                      ) : u.role === 'admin' ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">
                          <Shield size={14} /> Admin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <User size={14} /> Member
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {!u.isSuperAdmin && u._id !== currentUser._id && (
                      <div className="flex justify-end items-center gap-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-violet-500"
                        >
                          <option value="member">Make Member</option>
                          <option value="admin">Make Admin</option>
                        </select>
                        <button 
                          onClick={() => setUserToDelete(u)}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                          title="Remove User"
                        >
                          <MoreVertical size={16} /> {/* Placeholder icon, will replace if needed, or use text */}
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Admin">
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <p className="text-sm text-slate-400 mb-4">This user will have full administrative access to the platform.</p>
          <div>
            <label>Name</label>
            <input type="text" className="input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label>Email</label>
            <input type="email" className="input" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label>Password</label>
            <input type="password" className="input" required minLength="6" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button type="button" className="btn-secondary flex-1" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 bg-violet-600 hover:bg-violet-500" disabled={saving}>
              {saving ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title="Remove User">
        <div className="space-y-4">
          <p className="text-slate-300">Are you sure you want to remove <span className="font-bold text-white">{userToDelete?.name}</span> from the system?</p>
          <p className="text-sm text-slate-400">This will unassign them from all projects and tasks. This action cannot be undone.</p>
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button className="btn-secondary flex-1" onClick={() => setUserToDelete(null)}>Cancel</button>
            <button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors" onClick={handleDeleteUser}>
              Yes, Remove User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTeam;
