import { useEffect, useState } from 'react';
import { adminApi } from '../../services/apiServices';
import { AdminTicket } from '../../types';
import { Flag, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const fallbackTickets: AdminTicket[] = [
  { id: 1, type: 'CONTENT', priority: 'HIGH', subject: 'Inappropriate language in roleplay', status: 'OPEN', reporter: 'ai-guard', createdAt: '12m ago' },
  { id: 2, type: 'USER', priority: 'MEDIUM', subject: 'Spam invitations in speaking rooms', status: 'INVESTIGATING', reporter: 'community', createdAt: '2h ago' },
  { id: 3, type: 'BUG', priority: 'LOW', subject: 'Audio latency in room 204', status: 'OPEN', reporter: 'coach-team', createdAt: '1d ago' },
];

export default function AdminModeration() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);

  useEffect(() => {
    adminApi.getTickets()
      .then((res) => setTickets(res.data.data))
      .catch(() => setTickets(fallbackTickets));
  }, []);

  const updateTicket = (id: number, status: string, message: string) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success(message);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Moderation Center</div>
        <div className="page-subtitle">Resolve safety issues and community signals fast</div>
      </div>

      <div className="card admin-hero" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700 }}>Priority Queue</div>
            <div className="text-sm text-muted">3 open tickets need action</div>
          </div>
          <div className="pill pill-red"><span className="pill-dot" />High risk: 1</div>
        </div>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Priority</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Reporter</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td className="flex items-center gap-8"><Flag size={14} /> {t.type}</td>
                <td><span className={`pill ${t.priority === 'HIGH' ? 'pill-red' : t.priority === 'MEDIUM' ? 'pill-orange' : 'pill-cyan'}`}>{t.priority}</span></td>
                <td style={{ fontWeight: 600 }}>{t.subject}</td>
                <td><span className={`pill ${t.status === 'OPEN' ? 'pill-orange' : 'pill-cyan'}`}>{t.status}</span></td>
                <td>{t.reporter}</td>
                <td>{t.createdAt}</td>
                <td>
                  <div className="flex gap-8">
                    <button className="btn btn-sm btn-secondary" onClick={() => updateTicket(t.id, 'INVESTIGATING', 'Marked as investigating')}>
                      <ShieldAlert size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => updateTicket(t.id, 'RESOLVED', 'Ticket resolved')}>
                      <CheckCircle2 size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => updateTicket(t.id, 'DISMISSED', 'Ticket dismissed')}>
                      <XCircle size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
