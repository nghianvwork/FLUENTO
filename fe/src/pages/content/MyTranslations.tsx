import { useState, useEffect } from 'react';
import { Languages, Trash2, Copy, Check, ExternalLink, Search, BookOpen, Calendar } from 'lucide-react';
import { contentApi } from '../../services/apiServices';
import toast from 'react-hot-toast';

interface Translation {
  id: number;
  contentId: number;
  contentTitle: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestampSeconds: number;
  createdAt: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  vi: 'Vietnamese',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  es: 'Spanish',
  fr: 'French',
  en: 'English',
};

export default function MyTranslations() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    try {
      const res = await contentApi.getMyTranslations();
      const data = res.data;
      if (data.success) setTranslations(data.data || []);
    } catch (error) {
      console.error('Failed to load translations:', error);
      toast.error('Failed to load translations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await contentApi.deleteTranslation(id);
      setTranslations(prev => prev.filter(t => t.id !== id));
      toast.success('Translation deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete translation');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTranslations = translations
    .filter(t => filterLanguage === 'all' || t.targetLanguage === filterLanguage)
    .filter(t =>
      !searchQuery ||
      t.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.translatedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.contentTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const uniqueLanguages = Array.from(new Set(translations.map(t => t.targetLanguage)));

  const stats = {
    total: translations.length,
    languages: uniqueLanguages.length,
    today: translations.filter(t => {
      const d = new Date(t.createdAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
            animation: 'spin 1s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading translations...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 24px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(0,206,201,0.15))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Languages size={24} style={{ color: 'var(--primary-light)' }} />
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>My Translations</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>All your saved translations from content</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--primary-light)' }}>{stats.total}</div>
          <div className="stat-label">Total Translations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{stats.languages}</div>
          <div className="stat-label">Languages</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{stats.today}</div>
          <div className="stat-label">Today</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Search size={16} style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }} />
          <input
            className="input"
            placeholder="Search translations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 40, height: 42 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterLanguage('all')}
            className={`btn btn-sm ${filterLanguage === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All
          </button>
          {uniqueLanguages.map(lang => (
            <button
              key={lang}
              onClick={() => setFilterLanguage(lang)}
              className={`btn btn-sm ${filterLanguage === lang ? 'btn-primary' : 'btn-secondary'}`}
            >
              {LANGUAGE_LABELS[lang] || lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Translation Cards */}
      {filteredTranslations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 'var(--radius-lg)', margin: '0 auto 16px',
            background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Languages size={36} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            {searchQuery || filterLanguage !== 'all' ? 'No matching translations' : 'No translations yet'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {searchQuery || filterLanguage !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Start translating text from any content to build your collection'
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredTranslations.map(translation => (
            <div key={translation.id} className="card" style={{ transition: 'all 0.3s ease' }}>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <BookOpen size={16} style={{ color: 'var(--primary-light)' }} />
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{translation.contentTitle || 'Untitled Content'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(translation.createdAt).toLocaleString()}
                    </span>
                    <span className="badge badge-primary" style={{ fontSize: 11 }}>
                      {(LANGUAGE_LABELS[translation.sourceLanguage] || translation.sourceLanguage || 'EN').toUpperCase()} → {(LANGUAGE_LABELS[translation.targetLanguage] || translation.targetLanguage).toUpperCase()}
                    </span>
                  </div>
                </div>
                <a
                  href={`/app/content/${translation.contentId}`}
                  className="btn btn-sm btn-secondary"
                  title="View content"
                  style={{ padding: '6px 10px' }}
                >
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Translation Content */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                    color: 'var(--text-muted)', marginBottom: 8,
                  }}>
                    Original ({(translation.sourceLanguage || 'en').toUpperCase()})
                  </div>
                  <div style={{
                    padding: 14, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                    fontSize: 14, lineHeight: 1.7, borderLeft: '3px solid var(--primary)',
                  }}>
                    {translation.originalText}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                    color: 'var(--accent-cyan)', marginBottom: 8,
                  }}>
                    Translation ({translation.targetLanguage.toUpperCase()})
                  </div>
                  <div style={{
                    padding: 14, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                    fontSize: 14, lineHeight: 1.7, borderLeft: '3px solid var(--accent-cyan)',
                  }}>
                    {translation.translatedText}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  onClick={() => handleCopy(translation.translatedText, translation.id)}
                  className="btn btn-sm btn-secondary"
                  title="Copy translation"
                  style={{ padding: '6px 12px' }}
                >
                  {copiedId === translation.id ? (
                    <><Check size={14} style={{ color: 'var(--accent-green)' }} /> Copied</>
                  ) : (
                    <><Copy size={14} /> Copy</>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(translation.id)}
                  disabled={deletingId === translation.id}
                  className="btn btn-sm btn-secondary"
                  title="Delete translation"
                  style={{
                    padding: '6px 12px',
                    opacity: deletingId === translation.id ? 0.5 : 1,
                  }}
                >
                  <Trash2 size={14} style={{ color: 'var(--accent-red)' }} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
