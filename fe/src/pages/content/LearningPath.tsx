import { useState, useEffect } from 'react';
import { contentApi } from '../../services/apiServices';
import { ContentItem } from '../../types';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, TrendingUp, Target } from 'lucide-react';

export default function LearningPath() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<ContentItem[]>([]);

  useEffect(() => {
    loadProgress();
    loadRecommended();
  }, []);

  const loadProgress = () => {
    contentApi.getProgress().then(res => setProgress(res.data.data));
  };

  const loadRecommended = () => {
    // Load recommended content based on user's progress and interests
    contentApi.getAll().then(res => {
      const items = res.data.data;
      // Simple recommendation: show items user hasn't completed
      const completedIds = new Set(progress.filter(p => p.status === 'COMPLETED').map(p => p.contentId));
      const notCompleted = items.filter((i: ContentItem) => !completedIds.has(i.id));
      setRecommended(notCompleted.slice(0, 6));
    });
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)} phút`;

  const completedCount = progress.filter(p => p.status === 'COMPLETED').length;
  const inProgressCount = progress.filter(p => p.status === 'IN_PROGRESS').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🎯 Lộ trình học tập</div>
        <div className="page-subtitle">Gợi ý nội dung phù hợp với trình độ của bạn</div>
      </div>

      <div className="grid grid-cols-3 gap-16 mb-24">
        <div className="card">
          <div className="flex items-center gap-12 mb-8">
            <Target size={24} style={{ color: 'var(--primary)' }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>Đang học</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{inProgressCount}</div>
          <div className="text-sm text-muted">nội dung</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-12 mb-8">
            <TrendingUp size={24} style={{ color: 'var(--success)' }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>Hoàn thành</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{completedCount}</div>
          <div className="text-sm text-muted">nội dung</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-12 mb-8">
            <Clock size={24} style={{ color: 'var(--warning)' }} />
            <div style={{ fontWeight: 700, fontSize: 18 }}>Tổng thời gian</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            {Math.floor(progress.reduce((sum, p) => sum + (p.durationSeconds || 0), 0) / 60)}
          </div>
          <div className="text-sm text-muted">phút</div>
        </div>
      </div>

      <div className="card mb-24">
        <div className="card-title mb-16">🎯 Gợi ý cho bạn</div>
        <div className="card-desc mb-16">
          Dựa trên tiến độ và sở thích của bạn, chúng tôi gợi ý những nội dung sau:
        </div>

        {recommended.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: 40 }}>
            Chưa có gợi ý nào. Hãy bắt đầu học để nhận gợi ý!
          </div>
        ) : (
          <div className="card-grid">
            {recommended.map(item => (
              <div key={item.id} className="card" style={{ background: 'var(--bg-tertiary)', cursor: 'pointer' }}
                onClick={() => navigate(`/app/content/${item.id}`)}>
                <div className="flex justify-between items-center mb-12">
                  <span className="badge badge-primary">{item.sourceType}</span>
                  <span className={`badge ${item.difficulty === 'BEGINNER' ? 'badge-green' : item.difficulty === 'INTERMEDIATE' ? 'badge-orange' : 'badge-red'}`}>
                    {item.difficulty}
                  </span>
                </div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{item.title}</div>
                <div className="text-sm text-muted mb-12">{item.summary}</div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted">
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {formatDuration(item.durationSeconds)}
                  </span>
                  <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); navigate(`/app/content/${item.id}`); }}>
                    <Play size={12} /> Học
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title mb-16">📊 Tiến độ của bạn</div>
        {progress.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: 40 }}>
            Chưa có tiến độ nào. Bắt đầu học ngay!
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {progress.map((p, idx) => (
              <div key={idx} className="card" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Content #{p.contentId}</div>
                    <div className="text-xs text-muted">
                      Bắt đầu: {new Date(p.startedAt).toLocaleDateString('vi-VN')}
                      {p.completedAt && ` • Hoàn thành: ${new Date(p.completedAt).toLocaleDateString('vi-VN')}`}
                    </div>
                  </div>
                  <span className={`badge ${p.status === 'COMPLETED' ? 'badge-green' : 'badge-orange'}`}>
                    {p.status === 'COMPLETED' ? '✓ Hoàn thành' : '⏳ Đang học'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
