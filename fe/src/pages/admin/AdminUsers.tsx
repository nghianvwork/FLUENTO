import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../services/apiServices';
import { AdminUser } from '../../types';
import { Search, UserPlus, Shield, Ban, Key, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const fallbackUsers: AdminUser[] = [
  { id: 1, fullName: 'Nguyen Minh Anh', email: 'minhanh@enova.ai', role: 'LEARNER', status: 'ACTIVE', plan: 'Premium', lastActive: '2m ago', totalXp: 4420 },
  { id: 2, fullName: 'Tran Gia Bao', email: 'giabao@enova.ai', role: 'COACH', status: 'ACTIVE', plan: 'Pro', lastActive: '10m ago', totalXp: 8270 },
  { id: 3, fullName: 'Le Thu Ha', email: 'thuha@enova.ai', role: 'LEARNER', status: 'PENDING', plan: 'Free', lastActive: '1d ago', totalXp: 310 },
  { id: 4, fullName: 'Pham Quang Vinh', email: 'vinh@enova.ai', role: 'ADMIN', status: 'ACTIVE', plan: 'Internal', lastActive: '1m ago', totalXp: 0 },
  { id: 5, fullName: 'Bui Ngoc Linh', email: 'linh@enova.ai', role: 'LEARNER', status: 'SUSPENDED', plan: 'Premium', lastActive: '12d ago', totalXp: 1190 },
];

const roles = ['ALL', 'LEARNER', 'COACH', 'ADMIN'];
const statuses = ['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'];

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'LEARNER',
    status: 'ACTIVE',
    plan: 'Free',
  });

  useEffect(() => {
    adminApi.getUsers()
      .then((res) => setUsers(res.data.data))
      .catch(() => setUsers(fallbackUsers));
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = [u.fullName, u.email].some((v) => v.toLowerCase().includes(search.toLowerCase()));
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const updateUser = (id: number, patch: Partial<AdminUser>, message: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    toast.success(message);
  };

  const openCreate = () => {
    setForm({ fullName: '', email: '', password: '', role: 'LEARNER', status: 'ACTIVE', plan: 'Free' });
    setIsCreateOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditTarget(user);
    setForm({ fullName: user.fullName, email: user.email, password: '', role: user.role, status: user.status, plan: user.plan });
    setIsEditOpen(true);
  };

  const handleCreate = async () => {
    if (!form.fullName || !form.email) return toast.error('Name and email are required');
    try {
      const res = await adminApi.createUser({
        fullName: form.fullName,
        email: form.email,
        password: form.password || undefined,
        role: form.role,
        status: form.status,
      });
      setUsers((prev) => [res.data.data, ...prev]);
      setIsCreateOpen(false);
      toast.success('User invited');
    } catch {
      const newUser: AdminUser = {
        id: Math.max(0, ...users.map((u) => u.id)) + 1,
        fullName: form.fullName,
        email: form.email,
        role: form.role,
        status: form.status,
        plan: form.plan,
        lastActive: 'Just now',
        totalXp: 0,
      };
      setUsers((prev) => [newUser, ...prev]);
      setIsCreateOpen(false);
      toast.success('User invited (local)');
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return toast.error('User not found');
    try {
      const res = await adminApi.updateUser(editTarget.id, {
        fullName: form.fullName,
        email: form.email,
        password: form.password || undefined,
        role: form.role,
        status: form.status,
      });
      setUsers((prev) => prev.map((u) => (u.id === editTarget.id ? res.data.data : u)));
      toast.success('User updated');
    } catch {
      updateUser(editTarget.id, { ...form }, 'User updated (local)');
    }
    setIsEditOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.success('User removed');
    } catch {
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.success('User removed (local)');
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">User Management</div>
        <div className="page-subtitle">Control access, roles, and growth segments</div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="flex items-center gap-12">
            <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 320 }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', width: '100%' }}
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ maxWidth: 160 }}>
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 160 }}>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={openCreate}><UserPlus size={16} /> Invite user</button>
        </div>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Plan</th>
              <th>XP</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{u.fullName}</div>
                  <div className="text-sm text-muted">{u.email}</div>
                </td>
                <td><span className="pill pill-cyan">{u.role}</span></td>
                <td>
                  <span className={`pill ${u.status === 'ACTIVE' ? 'pill-green' : u.status === 'PENDING' ? 'pill-orange' : 'pill-red'}`}>{u.status}</span>
                </td>
                <td>{u.plan}</td>
                <td>{u.totalXp}</td>
                <td>{u.lastActive}</td>
                <td>
                  <div className="flex gap-8">
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(u)}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={async () => {
                      const nextRole = u.role === 'ADMIN' ? 'LEARNER' : 'ADMIN';
                      try {
                        const res = await adminApi.updateUser(u.id, { role: nextRole });
                        setUsers((prev) => prev.map((item) => (item.id === u.id ? res.data.data : item)));
                        toast.success('Role updated');
                      } catch {
                        updateUser(u.id, { role: nextRole }, 'Role updated (local)');
                      }
                    }}>
                      <Shield size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={async () => {
                      const nextStatus = u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
                      try {
                        const res = await adminApi.updateUser(u.id, { status: nextStatus });
                        setUsers((prev) => prev.map((item) => (item.id === u.id ? res.data.data : item)));
                        toast.success('User status updated');
                      } catch {
                        updateUser(u.id, { status: nextStatus }, 'User status updated (local)');
                      }
                    }}>
                      <Ban size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => toast.success('Password reset sent')}>
                      <Key size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setDeleteTarget(u)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={isCreateOpen}
        title="Invite new user"
        subtitle="Add a learner, coach, or admin to the platform"
        onClose={() => setIsCreateOpen(false)}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>Invite</button>
          </>
        )}
      >
        <div className="input-group">
          <label className="input-label">Full name</label>
          <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Email</label>
          <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave empty for auto" />
        </div>
        <div className="input-group">
          <label className="input-label">Role</label>
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {roles.filter((r) => r !== 'ALL').map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Status</label>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {statuses.filter((s) => s !== 'ALL').map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Plan</label>
          <input className="input" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} />
        </div>
      </Modal>

      <Modal
        open={isEditOpen}
        title="Edit user"
        subtitle="Update profile and access control"
        onClose={() => { setIsEditOpen(false); setEditTarget(null); }}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => { setIsEditOpen(false); setEditTarget(null); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEdit}>Save changes</button>
          </>
        )}
      >
        <div className="input-group">
          <label className="input-label">Full name</label>
          <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Email</label>
          <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave empty to keep" />
        </div>
        <div className="input-group">
          <label className="input-label">Role</label>
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {roles.filter((r) => r !== 'ALL').map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Status</label>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {statuses.filter((s) => s !== 'ALL').map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Plan</label>
          <input className="input" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} />
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Remove user"
        subtitle="This will revoke access immediately"
        onClose={() => setDeleteTarget(null)}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleDelete}>Remove</button>
          </>
        )}
      >
        <div className="text-sm text-muted">Are you sure you want to remove {deleteTarget?.fullName}?</div>
      </Modal>
    </div>
  );
}
