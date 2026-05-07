import { useState } from 'react';
import { BookOpen, PenTool } from 'lucide-react';
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
  const [entries, setEntries] = useState<JournalEntry[]>([
    { id: 1, title: 'Confidence Boost', content: 'Roleplay felt smooth today. I used new negotiation phrases.', createdAt: 'Today 08:40' },
    { id: 2, title: 'Accent Notes', content: 'Need to soften the R sound in American accent.', createdAt: 'Yesterday 21:10' },
  ]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const addEntry = () => {
    if (!title || !content) return toast.error('Please add a title and reflection');
    const newEntry = { id: Date.now(), title, content, createdAt: 'Just now' };
    setEntries((prev) => [newEntry, ...prev]);
    setTitle('');
    setContent('');
    toast.success('Entry added');
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
            <div key={idx} className="plan-block" style={{ borderLeftColor: 'var(--accent-cyan)' }}>
              <div style={{ fontWeight: 600 }}>{p}</div>
              <div className="text-sm text-muted">Tap to copy into your entry</div>
            </div>
          ))}
        </div>
      </div>

      <div className="page-title" style={{ fontSize: 20, marginTop: 32, marginBottom: 16 }}>Recent Entries</div>
      <div className="card-grid">
        {entries.map((entry) => (
          <div key={entry.id} className="card">
            <div className="card-title">{entry.title}</div>
            <div className="text-sm text-muted" style={{ marginBottom: 12 }}>{entry.createdAt}</div>
            <div className="card-desc">{entry.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
