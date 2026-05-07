import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../services/apiServices';
import { AdminScenarioOverview } from '../../types';
import { Plus, Sparkles, Star, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const fallbackScenarios: AdminScenarioOverview[] = [
  { id: 1, title: 'Product Demo Pitch', category: 'SALES', difficulty: 'INTERMEDIATE', status: 'ACTIVE', usageCount: 1420, rating: 4.6 },
  { id: 2, title: 'Crisis Meeting', category: 'MANAGEMENT', difficulty: 'ADVANCED', status: 'ACTIVE', usageCount: 820, rating: 4.4 },
  { id: 3, title: 'Hotel Check-in', category: 'HOSPITALITY', difficulty: 'BEGINNER', status: 'DRAFT', usageCount: 120, rating: 4.1 },
  { id: 4, title: 'Investor Update', category: 'FINANCE', difficulty: 'ADVANCED', status: 'REVIEW', usageCount: 320, rating: 4.2 },
];

const statuses = ['ALL', 'ACTIVE', 'DRAFT', 'REVIEW', 'ARCHIVED'];

export default function AdminRoleplay() {
  const [scenarios, setScenarios] = useState<AdminScenarioOverview[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminScenarioOverview | null>(null);
  const [editTarget, setEditTarget] = useState<AdminScenarioOverview | null>(null);
  const [form, setForm] = useState({
    title: '',
    category: 'SALES',
    difficulty: 'INTERMEDIATE',
    status: 'DRAFT',
  });

  useEffect(() => {
    adminApi.getScenarios()
      .then((res) => setScenarios(res.data.data))
      .catch(() => setScenarios(fallbackScenarios));
  }, []);

  const filtered = useMemo(() => {
    return scenarios.filter((s) => statusFilter === 'ALL' || s.status === statusFilter);
  }, [scenarios, statusFilter]);

  const updateScenario = (id: number, patch: Partial<AdminScenarioOverview>, message: string) => {
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    toast.success(message);
  };

  const toRequest = (data: typeof form) => ({
    title: data.title,
    category: data.category,
    difficulty: data.difficulty,
    isActive: data.status === 'ACTIVE',
  });

  const openCreate = () => {
    setForm({ title: '', category: 'SALES', difficulty: 'INTERMEDIATE', status: 'DRAFT' });
    setIsCreateOpen(true);
  };

  const openEdit = (scenario: AdminScenarioOverview) => {
    setEditTarget(scenario);
    setForm({ title: scenario.title, category: scenario.category, difficulty: scenario.difficulty, status: scenario.status });
    setIsEditOpen(true);
  };

  const handleCreate = async () => {
    if (!form.title) return toast.error('Title is required');
    try {
      const res = await adminApi.createScenario(toRequest(form));
      setScenarios((prev) => [res.data.data, ...prev]);
      setIsCreateOpen(false);
      toast.success('Scenario created');
    } catch {
      const newScenario: AdminScenarioOverview = {
        id: Math.max(0, ...scenarios.map((s) => s.id)) + 1,
        title: form.title,
        category: form.category,
        difficulty: form.difficulty,
        status: form.status,
        usageCount: 0,
        rating: 0,
      };
      setScenarios((prev) => [newScenario, ...prev]);
      setIsCreateOpen(false);
      toast.success('Scenario created (local)');
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return toast.error('Scenario not found');
    try {
      const res = await adminApi.updateScenario(editTarget.id, toRequest(form));
      setScenarios((prev) => prev.map((s) => (s.id === editTarget.id ? res.data.data : s)));
      toast.success('Scenario updated');
    } catch {
      updateScenario(editTarget.id, { ...form }, 'Scenario updated (local)');
    }
    setIsEditOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteScenario(deleteTarget.id);
      setScenarios((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success('Scenario deleted');
    } catch {
      setScenarios((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success('Scenario deleted (local)');
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Roleplay Engine</div>
        <div className="page-subtitle">Design scenarios, tune AI personality, and balance difficulty</div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="flex items-center gap-12">
            <Sparkles size={16} />
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 200 }}>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New scenario</button>
        </div>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th>Usage</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.title}</td>
                <td>{s.category}</td>
                <td>{s.difficulty}</td>
                <td><span className={`pill ${s.status === 'ACTIVE' ? 'pill-green' : s.status === 'REVIEW' ? 'pill-orange' : s.status === 'ARCHIVED' ? 'pill-red' : 'pill-cyan'}`}>{s.status}</span></td>
                <td>{s.usageCount.toLocaleString()}</td>
                <td className="flex items-center gap-8"><Star size={14} color="var(--accent-orange)" /> {s.rating}</td>
                <td>
                  <div className="flex gap-8">
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(s)}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={async () => {
                      try {
                        const res = await adminApi.updateScenario(s.id, { isActive: true });
                        setScenarios((prev) => prev.map((row) => (row.id === s.id ? res.data.data : row)));
                        toast.success('Scenario activated');
                      } catch {
                        updateScenario(s.id, { status: 'ACTIVE' }, 'Scenario activated (local)');
                      }
                    }}>Activate</button>
                    <button className="btn btn-sm btn-secondary" onClick={async () => {
                      try {
                        const res = await adminApi.updateScenario(s.id, { isActive: false });
                        setScenarios((prev) => prev.map((row) => (row.id === s.id ? res.data.data : row)));
                        toast.success('Scenario archived');
                      } catch {
                        updateScenario(s.id, { status: 'ARCHIVED' }, 'Scenario archived (local)');
                      }
                    }}>Archive</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setDeleteTarget(s)}>
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
        title="Create scenario"
        subtitle="Design a new AI roleplay session"
        onClose={() => setIsCreateOpen(false)}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>Create</button>
          </>
        )}
      >
        <div className="input-group">
          <label className="input-label">Title</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Category</label>
          <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Difficulty</label>
          <input className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Status</label>
          <input className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
        </div>
      </Modal>

      <Modal
        open={isEditOpen}
        title="Edit scenario"
        subtitle="Tune the AI experience"
        onClose={() => { setIsEditOpen(false); setEditTarget(null); }}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => { setIsEditOpen(false); setEditTarget(null); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEdit}>Save changes</button>
          </>
        )}
      >
        <div className="input-group">
          <label className="input-label">Title</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Category</label>
          <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Difficulty</label>
          <input className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Status</label>
          <input className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Delete scenario"
        subtitle="This will remove the scenario from the catalog"
        onClose={() => setDeleteTarget(null)}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleDelete}>Delete</button>
          </>
        )}
      >
        <div className="text-sm text-muted">Delete {deleteTarget?.title}?</div>
      </Modal>
    </div>
  );
}
