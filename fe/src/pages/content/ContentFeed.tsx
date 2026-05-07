import { useState, useEffect } from 'react';
import { contentApi, contentAiApi } from '../../services/apiServices';
import { ContentItem } from '../../types';
import { Play, Clock, Sparkles, Bookmark, BookmarkCheck, BookOpen, FileText, TrendingUp, Languages, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const topics = ['ALL', 'TECHNOLOGY', 'BUSINESS', 'FINANCE', 'PERSONAL_DEVELOPMENT', 'EDUCATION'];
const topicLabels: Record<string, string> = { ALL: '🌍 Tất cả', TECHNOLOGY: '💻 Công nghệ', BUSINESS: '📈 Kinh doanh', FINANCE: '💰 Tài chính', PERSONAL_DEVELOPMENT: '🧠 Phát triển', EDUCATION: '📚 Giáo dục' };
const typeIcons: Record<string, string> = { YOUTUBE: '🎬', PODCAST: '🎧', ARTICLE: '📰', LINKEDIN: '💼' };

export default function ContentFeed() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'all' | 'bookmarked'>('all');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<{ title: string; summary: string; vocab: string[]; questions: string[] } | null>(null);

  useEffect(() => {
    loadContent();
    loadBookmarks();
  }, [filter, viewMode]);

  const loadContent = () => {
    if (viewMode === 'bookmarked') {
      contentApi.getBookmarks().then(res => {
        const bookmarkedItems = res.data.data.map((b: any) => b.content);
        setItems(filter === 'ALL' ? bookmarkedItems : bookmarkedItems.filter((i: ContentItem) => i.topic === filter));
      });
    } else {
      contentApi.getAll(filter === 'ALL' ? undefined : filter).then(res => setItems(res.data.data)).catch(() => {
        setItems([
          { id: 1, title: 'How to Ace Your Tech Interview', sourceUrl: '#', sourceType: 'YOUTUBE', thumbnailUrl: '', durationSeconds: 720, difficulty: 'INTERMEDIATE', topic: 'TECHNOLOGY', summary: 'Tips for technical interviews at top companies', tags: 'interview,tech' },
          { id: 2, title: 'The Future of Remote Work', sourceUrl: '#', sourceType: 'YOUTUBE', thumbnailUrl: '', durationSeconds: 540, difficulty: 'INTERMEDIATE', topic: 'BUSINESS', summary: 'How remote work shapes business', tags: 'remote,work' },
          { id: 3, title: 'TED Talk: The Power of Vulnerability', sourceUrl: '#', sourceType: 'YOUTUBE', thumbnailUrl: '', durationSeconds: 1200, difficulty: 'ADVANCED', topic: 'PERSONAL_DEVELOPMENT', summary: 'Why vulnerability is courage', tags: 'ted,growth' },
          { id: 4, title: 'BBC: Global Economy Update 2026', sourceUrl: '#', sourceType: 'ARTICLE', thumbnailUrl: '', durationSeconds: 300, difficulty: 'ADVANCED', topic: 'FINANCE', summary: 'Global economic trends analysis', tags: 'economy,finance' },
          { id: 5, title: 'English Learning Tips Podcast', sourceUrl: '#', sourceType: 'PODCAST', thumbnailUrl: '', durationSeconds: 1800, difficulty: 'BEGINNER', topic: 'EDUCATION', summary: 'Practical tips for daily English', tags: 'podcast,tips' },
        ]);
      });
    }
  };

  const loadBookmarks = () => {
    contentApi.getBookmarks().then(res => {
      const ids = new Set<number>(res.data.data.map((b: any) => b.content.id));
      setBookmarks(ids);
    });
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)} phút`;

  const fetchSummary = async (item: ContentItem) => {
    setSummaryLoading(true);
    setSummaryOpen(true);
    try {
      const res = await contentAiApi.summary({ contentId: item.id, focus: item.topic });
      const data = res.data.data;
      setSummaryData({
        title: item.title,
        summary: data.summary || 'No summary provided',
        vocab: data.keyVocabulary || [],
        questions: data.discussionQuestions || [],
      });
    } catch {
      toast.error('AI summary unavailable');
      setSummaryData({ title: item.title, summary: item.summary || '', vocab: [], questions: [] });
    } finally {
      setSummaryLoading(false);
    }
  };

  const toggleBookmark = async (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    await contentApi.toggleBookmark(itemId);
    loadBookmarks();
    toast.success(bookmarks.has(itemId) ? 'Đã bỏ bookmark' : 'Đã bookmark');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📱 Content Immersion</div>
        <div className="page-subtitle">Học qua nội dung thực từ YouTube, podcast, và báo chí</div>
      </div>

      <div className="flex gap-8 mb-16">
        <button className={`btn btn-sm ${viewMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('all')}>Tất cả</button>
        <button className={`btn btn-sm ${viewMode === 'bookmarked' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('bookmarked')}><Bookmark size={14} /> Đã lưu</button>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/app/content/learning-path')}>
          <TrendingUp size={14} /> Lộ trình học
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/app/content/my-vocabulary')}>
          <BookOpen size={14} /> Từ vựng
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/app/content/my-notes')}>
          <FileText size={14} /> Ghi chú
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/app/content/my-translations')}>
          <Languages size={14} /> Dịch
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => navigate('/app/content/my-tests')}>
          <ClipboardCheck size={14} /> Bài test
        </button>
      </div>

      <div className="flex gap-8 mb-24" style={{ flexWrap: 'wrap' }}>
        {topics.map(t => (
          <button key={t} className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(t)}>{topicLabels[t]}</button>
        ))}
      </div>

      <div className="card-grid">
        {items.map(item => (
          <div key={item.id} className="card" style={{ cursor: 'pointer', position: 'relative' }}>
            <button
              className="btn btn-sm btn-secondary"
              style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
              onClick={(e) => toggleBookmark(e, item.id)}
            >
              {bookmarks.has(item.id) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 48 }}>
              {typeIcons[item.sourceType] || '📄'}
            </div>
            <div className="flex justify-between items-center mb-16">
              <span className="badge badge-primary">{item.sourceType}</span>
              <span className={`badge ${item.difficulty === 'BEGINNER' ? 'badge-green' : item.difficulty === 'INTERMEDIATE' ? 'badge-orange' : 'badge-red'}`}>
                {item.difficulty}
              </span>
            </div>
            <div className="card-title" style={{ marginBottom: 8, fontSize: 16 }}>{item.title}</div>
            <div className="card-desc" style={{ marginBottom: 12 }}>{item.summary}</div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-8 text-sm text-muted"><Clock size={14} /> {formatDuration(item.durationSeconds)}</span>
              <div className="flex gap-8">
                <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); fetchSummary(item); }}><Sparkles size={14} /> AI</button>
                <button className="btn btn-sm btn-primary" onClick={() => navigate(`/content/${item.id}`)}><Play size={14} /> Học</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={summaryOpen}
        title={summaryData?.title || 'AI Summary'}
        subtitle="Highlights and vocabulary"
        onClose={() => setSummaryOpen(false)}
        footer={(
          <button className="btn btn-secondary" onClick={() => setSummaryOpen(false)}>Close</button>
        )}
      >
        {summaryLoading ? (
          <div className="text-center text-muted" style={{ padding: 40 }}>Generating...</div>
        ) : summaryData ? (
          <div className="flex flex-col gap-16">
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Summary</div>
              <div className="text-sm text-muted">{summaryData.summary}</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Key Vocabulary</div>
              <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                {summaryData.vocab.length === 0 ? <span className="text-sm text-muted">No vocab</span> : summaryData.vocab.map((v) => (
                  <span key={v} className="pill pill-cyan">{v}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Discussion Questions</div>
              {summaryData.questions.length === 0 ? (
                <div className="text-sm text-muted">No questions</div>
              ) : (
                <div className="flex flex-col gap-8">
                  {summaryData.questions.map((q, idx) => (
                    <div key={idx} className="text-sm">• {q}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
