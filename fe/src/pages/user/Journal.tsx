import { useState, useEffect } from 'react';
import { BookOpen, PenTool, Trash2 } from 'lucide-react';
import { learningApi } from '../../services/apiServices';
import toast from 'react-hot-toast';

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

const prompts = [
  'What phrase did you master today?',
  'Which pronunciation felt most challenging?',
  'How did you feel during speaking practice?',
];

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await learningApi.getJournal();
      setEntries(res.data.data);
    } catch {
      toast.error('Failed to load journal');
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (!title || !content) return toast.error('Please add a title and reflection');
    try {
      const res = await learningApi.addJournalEntry({ title, content });
      setEntries((prev) => [res.data.data, ...prev]);
      setTitle('');
      setContent('');
      toast.success('Entry added');
    } catch {
      toast.error('Failed to save entry');
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      await learningApi.deleteJournalEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Entry removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Learning Journal</div>
        <div className="page-subtitle">Reflect on progress and build lasting habits</div>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">New Reflection</div>
              <div className="card-desc">Capture your wins and blockers</div>
            </div>
            <PenTool size={18} color="var(--accent-pink)" />
          </div>
          <div className="input-group">
            <label className="input-label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Today's highlight" />
          </div>
          <div className="input-group">
            <label className="input-label">Reflection</label>
            <textarea className="input" rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder={prompts[0]} />
          </div>
          <button className="btn btn-primary btn-full" onClick={addEntry}><BookOpen size={16} /> Save entry</button>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Guided Prompts</div>
              <div className="card-desc">Get unstuck fast</div>
            </div>
          </div>
          {prompts.map((p, idx) => (
            <div key={idx} className="plan-block" style={{ borderLeftColor: 'var(--accent-cyan)', cursor: 'pointer' }} onClick={() => setContent(p + '\n\n')}>
              <div style={{ fontWeight: 600 }}>{p}</div>
              <div className="text-sm text-muted">Tap to use this prompt</div>
            </div>
          ))}
        </div>
      </div>

      <div className="page-title" style={{ fontSize: 20, marginTop: 32, marginBottom: 16 }}>Recent Entries</div>
      {loading ? (
        <div className="text-center py-40">Loading reflections...</div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-40 text-muted">No entries yet. Start reflecting!</div>
      ) : (
        <div className="card-grid">
          {entries.map((entry) => (
            <div key={entry.id} className="card">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="card-title">{entry.title}</div>
                  <div className="text-sm text-muted">{new Date(entry.createdAt).toLocaleDateString()}</div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => deleteEntry(entry.id)}><Trash2 size={14} /></button>
              </div>
              <div className="card-desc">{entry.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
