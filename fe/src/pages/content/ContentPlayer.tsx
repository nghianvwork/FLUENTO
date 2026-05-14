import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { contentApi } from '../../services/apiServices';
import { ContentItem } from '../../types';
import { ArrowLeft, Bookmark, BookmarkCheck, FileText, BookOpen, Brain, CheckCircle, Languages, ClipboardCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import ContentNotes from './ContentNotes';
import ContentVocabulary from './ContentVocabulary';
import ContentQuiz from './ContentQuiz';
import ContentTranslation from './ContentTranslation';
import ContentTest from './ContentTest';

export default function ContentPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'notes' | 'vocab' | 'quiz' | 'translate' | 'test'>('player');

  useEffect(() => {
    if (id) {
      contentApi.getById(Number(id)).then(res => {
        setContent(res.data.data);
        contentApi.start(Number(id));
      });
      contentApi.getBookmarkStatus(Number(id)).then(res => setIsBookmarked(res.data.data));
    }
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'test') setActiveTab('test');
    if (tab === 'quiz') setActiveTab('quiz');
    if (tab === 'notes') setActiveTab('notes');
    if (tab === 'vocab') setActiveTab('vocab');
    if (tab === 'translate') setActiveTab('translate');
    if (tab === 'player') setActiveTab('player');
  }, [location.search]);

  const toggleBookmark = async () => {
    if (!id) return;
    await contentApi.toggleBookmark(Number(id));
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Đã bỏ bookmark' : 'Đã bookmark');
  };

  const markComplete = async () => {
    if (!id) return;
    await contentApi.complete(Number(id));
    toast.success('Đã hoàn thành!');
  };

  if (!content) return <div className="text-center" style={{ padding: 40 }}>Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-16 mb-24">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/content')}>
          <ArrowLeft size={16} /> Quay lại
        </button>
        <div className="flex-1">
          <div className="page-title" style={{ marginBottom: 4 }}>{content.title}</div>
          <div className="text-sm text-muted">{content.topic} • {content.difficulty}</div>
        </div>
        <button className="btn btn-secondary" onClick={toggleBookmark}>
          {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
        <button className="btn btn-primary" onClick={markComplete}>
          <CheckCircle size={18} /> Hoàn thành
        </button>
      </div>

      <div className="flex gap-8 mb-16">
        <button className={`btn btn-sm ${activeTab === 'player' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('player')}>📺 Nội dung</button>
        <button className={`btn btn-sm ${activeTab === 'notes' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('notes')}><FileText size={14} /> Ghi chú</button>
        <button className={`btn btn-sm ${activeTab === 'vocab' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('vocab')}><BookOpen size={14} /> Từ vựng</button>
        <button className={`btn btn-sm ${activeTab === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('quiz')}><Brain size={14} /> Quiz</button>
        <button className={`btn btn-sm ${activeTab === 'translate' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('translate')}><Languages size={14} /> Dịch</button>
        <button className={`btn btn-sm ${activeTab === 'test' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('test')}><ClipboardCheck size={14} /> Bài test</button>
      </div>

      {activeTab === 'player' && (
        <div className="card">
          <div style={{ background: '#000', borderRadius: 'var(--radius-md)', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            {content.sourceType === 'YOUTUBE' && content.sourceUrl ? (
              <iframe
                width="100%"
                height="400"
                src={content.sourceUrl.replace('watch?v=', 'embed/')}
                title={content.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-white text-center">
                <div style={{ fontSize: 48, marginBottom: 16 }}>
                  {content.sourceType === 'PODCAST' ? '🎧' : content.sourceType === 'ARTICLE' ? '📰' : '📄'}
                </div>
                <div>Mở link để xem nội dung</div>
                {content.sourceUrl && (
                  <a href={content.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: 16 }}>
                    Mở link
                  </a>
                )}
              </div>
            )}
          </div>
          {content.summary && (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Tóm tắt</div>
              <div className="text-sm text-muted">{content.summary}</div>
            </div>
          )}
          {content.transcript && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Transcript</div>
              <div className="text-sm text-muted" style={{ whiteSpace: 'pre-wrap' }}>{content.transcript}</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && <ContentNotes contentId={Number(id)} />}
      {activeTab === 'vocab' && <ContentVocabulary contentId={Number(id)} />}
      {activeTab === 'quiz' && <ContentQuiz contentId={Number(id)} />}
      {activeTab === 'translate' && <ContentTranslation contentId={Number(id)} />}
      {activeTab === 'test' && <ContentTest contentId={Number(id)} />}
    </div>
  );
}
