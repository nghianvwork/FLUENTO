import { useState, useEffect } from 'react';
import { contentApi } from '../../services/apiServices';
import { Plus, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Vocab {
  id: number;
  contentId: number;
  word: string;
  definition?: string;
  exampleSentence?: string;
  timestampSeconds?: number;
  createdAt: string;
}

export default function ContentVocabulary({ contentId }: { contentId: number }) {
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');

  useEffect(() => {
    loadVocabs();
  }, [contentId]);

  const loadVocabs = () => {
    contentApi.getVocabulary(contentId).then(res => setVocabs(res.data.data));
  };

  const handleSave = async () => {
    if (!word.trim()) {
      toast.error('Vui lòng nhập từ vựng');
      return;
    }
    try {
      await contentApi.saveVocabulary({
        contentId,
        word: word.trim(),
        definition: definition.trim() || undefined,
        exampleSentence: example.trim() || undefined,
      });
      toast.success('Đã lưu từ vựng');
      setWord('');
      setDefinition('');
      setExample('');
      setIsAdding(false);
      loadVocabs();
    } catch {
      toast.error('Lỗi khi lưu từ vựng');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa từ vựng này?')) return;
    await contentApi.deleteVocabulary(id);
    toast.success('Đã xóa');
    loadVocabs();
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-16">
        <div className="card-title">📚 Từ vựng đã lưu</div>
        {!isAdding && (
          <button className="btn btn-sm btn-primary" onClick={() => setIsAdding(true)}>
            <Plus size={14} /> Thêm từ
          </button>
        )}
      </div>

      {isAdding && (
        <div className="card" style={{ marginBottom: 16, background: 'var(--bg-tertiary)' }}>
          <input
            type="text"
            className="input"
            placeholder="Từ vựng *"
            value={word}
            onChange={e => setWord(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <input
            type="text"
            className="input"
            placeholder="Định nghĩa (tùy chọn)"
            value={definition}
            onChange={e => setDefinition(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <textarea
            className="input"
            placeholder="Câu ví dụ (tùy chọn)"
            value={example}
            onChange={e => setExample(e.target.value)}
            rows={2}
            style={{ marginBottom: 8 }}
          />
          <div className="flex gap-8">
            <button className="btn btn-sm btn-primary" onClick={handleSave}>
              <Save size={14} /> Lưu
            </button>
            <button className="btn btn-sm btn-secondary" onClick={() => setIsAdding(false)}>
              <X size={14} /> Hủy
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-12">
        {vocabs.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: 24 }}>Chưa có từ vựng nào</div>
        ) : (
          vocabs.map(vocab => (
            <div key={vocab.id} className="card" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="flex justify-between items-start mb-8">
                <div style={{ fontWeight: 700, fontSize: 16 }}>{vocab.word}</div>
                <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(vocab.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
              {vocab.definition && (
                <div className="text-sm text-muted mb-4">📖 {vocab.definition}</div>
              )}
              {vocab.exampleSentence && (
                <div className="text-sm" style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  💬 "{vocab.exampleSentence}"
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
