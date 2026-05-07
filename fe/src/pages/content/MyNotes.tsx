import { useState, useEffect } from 'react';
import { contentApi } from '../../services/apiServices';
import { Trash2, FileText, Search, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Note {
  id: number;
  contentId: number;
  noteText: string;
  timestampSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

export default function MyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    contentApi.getNotes().then(res => setNotes(res.data.data));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa ghi chú này?')) return;
    await contentApi.deleteNote(id);
    toast.success('Đã xóa');
    loadNotes();
  };

  const filteredNotes = notes.filter(n =>
    n.noteText.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📝 Ghi chú của tôi</div>
        <div className="page-subtitle">Tất cả ghi chú từ Content Hub</div>
      </div>

      <div className="card mb-24">
        <div className="flex items-center gap-12">
          <Search size={18} className="text-muted" />
          <input
            type="text"
            className="input"
            placeholder="Tìm kiếm ghi chú..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-16">
        <div className="text-sm text-muted">
          <FileText size={14} style={{ display: 'inline', marginRight: 4 }} />
          {filteredNotes.length} ghi chú
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="card text-center" style={{ padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
          <div className="text-muted">
            {search ? 'Không tìm thấy ghi chú nào' : 'Chưa có ghi chú nào'}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-16">
          {filteredNotes.map(note => (
            <div key={note.id} className="card">
              <div className="flex justify-between items-start mb-12">
                <div className="text-sm text-muted">
                  {note.timestampSeconds && `⏱️ ${Math.floor(note.timestampSeconds / 60)}:${(note.timestampSeconds % 60).toString().padStart(2, '0')} • `}
                  {new Date(note.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(note.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{note.noteText}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
