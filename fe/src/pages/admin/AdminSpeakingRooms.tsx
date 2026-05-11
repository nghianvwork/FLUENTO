import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../services/apiServices';
import { AdminRoomOverview } from '../../types';
import { Mic, PlayCircle, PauseCircle, Pencil, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const fallbackRooms: AdminRoomOverview[] = [
  { id: 1, title: 'Startup Pitch Room', topic: 'TECH', status: 'LIVE', host: 'Coach An', participants: 8, capacity: 12 },
  { id: 2, title: 'Interview Warm-up', topic: 'CAREER', status: 'SCHEDULED', host: 'AI Moderator', participants: 0, capacity: 20 },
  { id: 3, title: 'Daily Small Talk', topic: 'SOCIAL', status: 'PAUSED', host: 'Coach Linh', participants: 3, capacity: 8 },
  { id: 4, title: 'Finance Roundtable', topic: 'FINANCE', status: 'LIVE', host: 'Coach Bao', participants: 10, capacity: 10 },
];

const statuses = ['ALL', 'LIVE', 'SCHEDULED', 'PAUSED'];

export default function AdminSpeakingRooms() {
  const [rooms, setRooms] = useState<AdminRoomOverview[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminRoomOverview | null>(null);
  const [editTarget, setEditTarget] = useState<AdminRoomOverview | null>(null);
  const [form, setForm] = useState({
    title: '',
    topic: 'TECH',
    status: 'SCHEDULED',
    host: 'AI Moderator',
    capacity: 12,
  });

  useEffect(() => {
    adminApi.getSpeakingRooms()
      .then((res: any) => setRooms(res.data.data))
      .catch(() => setRooms(fallbackRooms));
  }, []);

  const filtered = useMemo(() => {
    return rooms.filter((r) => statusFilter === 'ALL' || r.status === statusFilter);
  }, [rooms, statusFilter]);

  const updateRoom = (id: number, patch: Partial<AdminRoomOverview>, message: string) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    toast.success(message);
  };

  const toRequest = (data: typeof form) => ({
    title: data.title,
    topic: data.topic,
    status: data.status,
    maxParticipants: data.capacity,
  });

  const openCreate = () => {
    setForm({ title: '', topic: 'TECH', status: 'SCHEDULED', host: 'AI Moderator', capacity: 12 });
    setIsCreateOpen(true);
  };

  const openEdit = (room: AdminRoomOverview) => {
    setEditTarget(room);
    setForm({ title: room.title, topic: room.topic, status: room.status, host: room.host, capacity: room.capacity });
    setIsEditOpen(true);
  };

  const handleCreate = async () => {
    if (!form.title) return toast.error('Room title is required');
    try {
      const res = await adminApi.createRoom(toRequest(form));
      setRooms((prev) => [res.data.data, ...prev]);
      setIsCreateOpen(false);
      toast.success('Room created');
    } catch {
      const newRoom: AdminRoomOverview = {
        id: Math.max(0, ...rooms.map((r) => r.id)) + 1,
        title: form.title,
        topic: form.topic,
        status: form.status,
        host: form.host,
        participants: 0,
        capacity: form.capacity,
      };
      setRooms((prev) => [newRoom, ...prev]);
      setIsCreateOpen(false);
      toast.success('Room created (local)');
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return toast.error('Room not found');
    try {
      const res = await adminApi.updateRoom(editTarget.id, toRequest(form));
      setRooms((prev) => prev.map((r) => (r.id === editTarget.id ? res.data.data : r)));
      toast.success('Room updated');
    } catch {
      updateRoom(editTarget.id, { ...form }, 'Room updated (local)');
    }
    setIsEditOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteRoom(deleteTarget.id);
      setRooms((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success('Room deleted');
    } catch {
      setRooms((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success('Room deleted (local)');
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Speaking Rooms Ops</div>
        <div className="page-subtitle">Keep live rooms safe, balanced, and high energy</div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="flex items-center gap-12">
            <Mic size={16} />
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 200 }}>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Launch new room</button>
        </div>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Topic</th>
              <th>Status</th>
              <th>Host</th>
              <th>Participants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.title}</td>
                <td>{r.topic}</td>
                <td><span className={`pill ${r.status === 'LIVE' ? 'pill-green' : r.status === 'SCHEDULED' ? 'pill-cyan' : 'pill-orange'}`}>{r.status}</span></td>
                <td>{r.host}</td>
                <td>{r.participants}/{r.capacity}</td>
                <td>
                  <div className="flex gap-8">
                    <button className="btn btn-sm btn-secondary" onClick={() => openEdit(r)}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={async () => {
                      try {
                        const res = await adminApi.updateRoom(r.id, { status: 'LIVE' });
                        setRooms((prev) => prev.map((row) => (row.id === r.id ? res.data.data : row)));
                        toast.success('Room is live');
                      } catch {
                        updateRoom(r.id, { status: 'LIVE' }, 'Room is live (local)');
                      }
                    }}>
                      <PlayCircle size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={async () => {
                      try {
                        const res = await adminApi.updateRoom(r.id, { status: 'PAUSED' });
                        setRooms((prev) => prev.map((row) => (row.id === r.id ? res.data.data : row)));
                        toast.success('Room paused');
                      } catch {
                        updateRoom(r.id, { status: 'PAUSED' }, 'Room paused (local)');
                      }
                    }}>
                      <PauseCircle size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setDeleteTarget(r)}>
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
        title="Launch speaking room"
        subtitle="Schedule a new live session"
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
          <label className="input-label">Topic</label>
          <input className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Status</label>
          <input className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Host</label>
          <input className="input" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Capacity</label>
          <input className="input" type="number" min={2} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
        </div>
      </Modal>

      <Modal
        open={isEditOpen}
        title="Edit room"
        subtitle="Update schedule and capacity"
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
          <label className="input-label">Topic</label>
          <input className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Status</label>
          <input className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Host</label>
          <input className="input" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Capacity</label>
          <input className="input" type="number" min={2} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        title="Delete room"
        subtitle="This will end the room immediately"
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
