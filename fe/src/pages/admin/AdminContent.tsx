import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../services/apiServices';
import { AdminContentItem } from '../../types';
import { Archive, Filter, Plus, Upload, Pencil, Trash2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const fallbackContent: AdminContentItem[] = [
  { id: 1, title: 'Negotiation Skills for Sales', type: 'ARTICLE', topic: 'BUSINESS', difficulty: 'INTERMEDIATE', status: 'DRAFT', owner: 'Content Team', updatedAt: '2h ago' },
  { id: 2, title: 'AI Product Demo Script', type: 'VIDEO', topic: 'TECHNOLOGY', difficulty: 'ADVANCED', status: 'PUBLISHED', owner: 'Enova Studio', updatedAt: '1d ago' },
  { id: 3, title: 'Finance English: Earnings Call', type: 'PODCAST', topic: 'FINANCE', difficulty: 'INTERMEDIATE', status: 'REVIEW', owner: 'Language Lab', updatedAt: '4h ago' },
  { id: 4, title: 'Hospitality Greetings Pack', type: 'LESSON', topic: 'CAREER', difficulty: 'BEGINNER', status: 'ARCHIVED', owner: 'Career Team', updatedAt: '3d ago' },
];

const statuses = ['ALL', 'DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'];

export default function AdminContent() {
  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminContentItem | null>(null);
  const [editTarget, setEditTarget] = useState<AdminContentItem | null>(null);
  const [form, setForm] = useState({
    title: '',
    type: 'ARTICLE',
    topic: 'BUSINESS',
    difficulty: 'INTERMEDIATE',
    status: 'DRAFT',
    owner: 'Content Team',
  });

  useEffect(() => {
    adminApi.getContent()
      .then((res) => setItems(res.data.data))
      .catch(() => setItems(fallbackContent));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => statusFilter === 'ALL' || item.status === statusFilter);
  }, [items, statusFilter]);

  const updateItem = (id: number, patch: Partial<AdminContentItem>, message: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    toast.success(message);
  };

  const toRequest = (data: typeof form) => ({
    title: data.title,
    sourceType: data.type,
    topic: data.topic,
    difficulty: data.difficulty,
    isActive: data.status === 'PUBLISHED',
  });

  const openCreate = () => {
    setForm({ title: '', type: 'ARTICLE', topic: 'BUSINESS', difficulty: 'INTERMEDIATE', status: 'DRAFT', owner: 'Content Team' });
    setIsCreateOpen(true);
  };

  const openEdit = (item: AdminContentItem) => {
    setEditTarget(item);
    setForm({
      title: item.title,
      type: item.type,
      topic: item.topic,
      difficulty: item.difficulty,
      status: item.status,
      owner: item.owner,
    });
    setIsEditOpen(true);
  };

  const handleCreate = async () => {
    if (!form.title) return toast.error('Title is required');
    try {
      const res = await adminApi.createContent(toRequest(form));
      setItems((prev) => [res.data.data, ...prev]);
      setIsCreateOpen(false);
      toast.success('Content created');
    } catch {
      const newItem: AdminContentItem = {
        id: Math.max(0, ...items.map((i) => i.id)) + 1,
        title: form.title,
        type: form.type,
        topic: form.topic,
        difficulty: form.difficulty,
        status: form.status,
        owner: form.owner,
        updatedAt: 'Just now',
      };
      setItems((prev) => [newItem, ...prev]);
      setIsCreateOpen(false);
      toast.success('Content created (local)');
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return toast.error('Content not found');
    try {
      const res = await adminApi.updateContent(editTarget.id, toRequest(form));
      setItems((prev) => prev.map((item) => (item.id === editTarget.id ? res.data.data : item)));
      toast.success('Content updated');
    } catch {
      updateItem(editTarget.id, { ...form, updatedAt: 'Just now' }, 'Content updated (local)');
    }
    setIsEditOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteContent(deleteTarget.id);
      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast.success('Content deleted');
    } catch {
      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast.success('Content deleted (local)');
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Content Studio</div>
        <div className="page-subtitle">Curate content pipelines, schedule drops, and quality control</div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="flex items-center gap-12">
            <Filter size={16} />
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 200 }}>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-8">
            <button className="btn btn-secondary"><Upload size={16} /> Import batch</button>
            <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New content</button>
          </div>
        </div>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Topic</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.title}</td>
                <td><span className="pill pill-cyan">{item.type}</span></td>
                <td>{item.topic}</td>
                <td>{item.difficulty}</td>
                <td><span className={`pill ${item.status === 'PUBLISHED' ? 'pill-green' : item.status === 'REVIEW' ? 'pill-orange' : item.status === 'ARCHIVED' ? 'pill-red' : 'pill-cyan'}`}>{item.status}</span></td>
                <td>{item.owner}</td>
                <td>{item.updatedAt}</td>
                <td>
                  <div className="flex gap-8">
                    <button className="btn btn-sm btn-secondary" onClick={async () => {
                      try {
                        await adminApi.generateQuiz(item.id);
                        toast.success('AI đang tạo câu hỏi cho nội dung này. Vui lòng kiểm tra lại sau ít phút!');
                      } catch {
                        toast.error('Không thể tạo câu hỏi tự động.');
                      }
                    }} title="Generate AI Quiz">
                      <Sparkles size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(item)}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={async () => {
                      try {
                        const res = await adminApi.updateContent(item.id, { isActive: true });
                        setItems((prev) => prev.map((row) => (row.id === item.id ? res.data.data : row)));
                        toast.success('Content published');
                      } catch {
                        updateItem(item.id, { status: 'PUBLISHED' }, 'Content published (local)');
                      }
                    }}>Publish</button>
                    <button className="btn btn-sm btn-secondary" onClick={async () => {
                      try {
                        const res = await adminApi.updateContent(item.id, { isActive: false });
                        setItems((prev) => prev.map((row) => (row.id === item.id ? res.data.data : row)));
                        toast.success('Content archived');
                      } catch {
                        updateItem(item.id, { status: 'ARCHIVED' }, 'Content archived (local)');
                      }
                    }}><Archive size={14} /></button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setDeleteTarget(item)}>
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
        title="Create content"
        subtitle="Add a new asset to the learning catalog"
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
          <label className="input-label">Type</label>
          <input className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Topic</label>
          <input className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Difficulty</label>
          <input className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Status</label>
          <input className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Owner</label>
          <input className="input" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
        </div>
      </Modal>

      <Modal
        open={isEditOpen}
        title="Edit content"
        subtitle="Update metadata and publishing state"
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
          <label className="input-label">Type</label>
          <input className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Topic</label>
          <input className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Difficulty</label>
          <input className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Status</label>
          <input className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Owner</label>
          <input className="input" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Delete content"
        subtitle="This action cannot be undone"
        onClose={() => setDeleteTarget(null)}
        footer={(
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleDelete}>Delete</button>
          </>
        )}
      >
        <div className="text-sm text-muted">Delete {deleteTarget?.title} from the catalog?</div>
      </Modal>
    </div>
  );
}
