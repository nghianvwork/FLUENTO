import { useState, useEffect } from 'react';
import { contentApi } from '../../services/apiServices';
import { Trash2, BookOpen, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Vocab {
  id: number;
  contentId: number;
  contentTitle: string;
  word: string;
  definition?: string;
  exampleSentence?: string;
  timestampSeconds?: number;
  createdAt: string;
}

import { useNavigate } from 'react-router-dom';

export default function MyVocabulary() {
  const navigate = useNavigate();
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadVocabs();
  }, []);

  const loadVocabs = () => {
    contentApi.getVocabulary().then(res => setVocabs(res.data.data));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa từ vựng này?')) return;
    await contentApi.deleteVocabulary(id);
    toast.success('Đã xóa');
    loadVocabs();
  };

  const filteredVocabs = vocabs.filter(v =>
    v.word.toLowerCase().includes(search.toLowerCase()) ||
    v.contentTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header flex justify-between items-start">
        <div>
          <div className="page-title">📚 Từ vựng của tôi</div>
          <div className="page-subtitle">Tất cả từ vựng đã lưu từ Content Hub</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/app/content/srs')}>
          <BookOpen size={16} /> Review Flashcards
        </button>
      </div>

      <div className="card mb-24">
        <div className="flex items-center gap-12">
          <Search size={18} className="text-muted" />
          <input
            type="text"
            className="input"
            placeholder="Tìm kiếm từ vựng hoặc nội dung..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-16">
        <div className="text-sm text-muted">
          <BookOpen size={14} style={{ display: 'inline', marginRight: 4 }} />
          {filteredVocabs.length} từ vựng
        </div>
      </div>

      {filteredVocabs.length === 0 ? (
        <div className="card text-center" style={{ padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <div className="text-muted">
            {search ? 'Không tìm thấy từ vựng nào' : 'Chưa có từ vựng nào. Hãy bắt đầu học từ Content Hub!'}
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {filteredVocabs.map(vocab => (
            <div key={vocab.id} className="card">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{vocab.word}</div>
                  <div className="text-xs text-muted">{vocab.contentTitle}</div>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(vocab.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
              
              {vocab.definition && (
                <div className="mb-8">
                  <div className="text-xs text-muted mb-2">Định nghĩa:</div>
                  <div className="text-sm">{vocab.definition}</div>
                </div>
              )}
              
              {vocab.exampleSentence && (
                <div className="mb-8">
                  <div className="text-xs text-muted mb-2">Ví dụ:</div>
                  <div className="text-sm" style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    "{vocab.exampleSentence}"
                  </div>
                </div>
              )}
              
              <div className="text-xs text-muted mt-8">
                {new Date(vocab.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
