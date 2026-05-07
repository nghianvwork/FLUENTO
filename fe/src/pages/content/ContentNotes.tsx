import { useState, useEffect } from 'react';
import { contentApi } from '../../services/apiServices';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Note {
  id: number;
  contentId: number;
  noteText: string;
  timestampSeconds?: number;
  createdAt: string;
}

export default function ContentNotes({ contentId }: { contentId: number }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    loadNotes();
  }, [contentId]);

  const loadNotes = () => {
    contentApi.getNotes(contentId).then(res => setNotes(res.data.data));
  };

  const handleSave = async () => {
    try {
      const payload = {
        contentId,
        noteText,
        timestampSeconds: timestamp ? parseInt(timestamp) : undefined,
      };
      if (editingId) {
        await contentApi.updateNote(editingId, payload);
        toast.success('Đã cập nhật ghi chú');
      } else {
        await contentApi.createNote(payload);
        toast.success('Đã thêm ghi chú');
      }
      setNoteText('');
      setTimestamp('');
      setIsAdding(false);
      setEditingId(null);
      loadNotes();
    } catch {
      toast.error('Lỗi khi lưu ghi chú');
    }
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setNoteText(note.noteText);
    setTimestamp(note.timestampSeconds?.toString() || '');
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa ghi chú này?')) return;
    await contentApi.deleteNote(id);
    toast.success('Đã xóa');
    loadNotes();
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNoteText('');
    setTimestamp('');
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-16">
        <div className="card-title">📝 Ghi chú của bạn</div>
        {!isAdding && (
          <button className="btn btn-sm btn-primary" onClick={() => setIsAdding(true)}>
            <Plus size={14} /> Thêm ghi chú
          </button>
        )}
      </div>

      {isAdding && (
        <div className="card" style={{ marginBottom: 16, background: 'var(--bg-tertiary)' }}>
          <textarea
            className="input"
            placeholder="Nhập ghi chú..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            rows={4}
            style={{ marginBottom: 8 }}
          />
          <input
            type="number"
            className="input"
            placeholder="Timestamp (giây, tùy chọn)"
            value={timestamp}
            onChange={e => setTimestamp(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <div className="flex gap-8">
            <button className="btn btn-sm btn-primary" onClick={handleSave}>
              <Save size={14} /> Lưu
            </button>
            <button className="btn btn-sm btn-secondary" onClick={handleCancel}>
              <X size={14} /> Hủy
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-12">
        {notes.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: 24 }}>Chưa có ghi chú nào</div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="card" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="flex justify-between items-start mb-8">
                <div className="text-sm text-muted">
                  {note.timestampSeconds && `⏱️ ${Math.floor(note.timestampSeconds / 60)}:${(note.timestampSeconds % 60).toString().padStart(2, '0')} • `}
                  {new Date(note.createdAt).toLocaleDateString('vi-VN')}
                </div>
                <div className="flex gap-8">
                  <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(note)}>
                    <Edit2 size={12} />
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(note.id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{note.noteText}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
