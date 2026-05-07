import { useState, useEffect } from 'react';
import { Languages, Trash2, Copy, Check, ExternalLink } from 'lucide-react';

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

export default function MyTranslations() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    try {
      const response = await fetch('/api/content/translations/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setTranslations(data.data);
    } catch (error) {
      console.error('Failed to load translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/content/translations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTranslations(translations.filter(t => t.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTranslations = filterLanguage === 'all'
    ? translations
    : translations.filter(t => t.targetLanguage === filterLanguage);

  const uniqueLanguages = Array.from(new Set(translations.map(t => t.targetLanguage)));

  if (loading) {
    return <div className="text-center py-12">Loading translations...</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-3 mb-4">
          <Languages className="w-8 h-8" style={{ color: 'var(--primary)' }} />
          <h1 className="page-title" style={{ marginBottom: 0 }}>My Translations</h1>
        </div>
        <p className="text-muted">All your saved translations from content</p>
      </div>

      <div className="flex gap-8 mb-24" style={{ flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterLanguage('all')}
          className={`btn btn-sm ${filterLanguage === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Languages
        </button>
        {uniqueLanguages.map(lang => (
          <button
            key={lang}
            onClick={() => setFilterLanguage(lang)}
            className={`btn btn-sm ${filterLanguage === lang ? 'btn-primary' : 'btn-secondary'}`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {filteredTranslations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <Languages className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-tertiary)', width: 64, height: 64 }} />
          <p className="text-muted">No translations yet</p>
        </div>
      ) : (
        <div className="card-grid">
          {filteredTranslations.map((translation) => (
            <div key={translation.id} className="card">
              <div className="flex items-start justify-between mb-16">
                <div>
                  <h3 className="card-title" style={{ marginBottom: 4 }}>{translation.contentTitle}</h3>
                  <span className="text-sm text-muted">
                    {new Date(translation.createdAt).toLocaleString()}
                  </span>
                </div>
                <a
                  href={`/app/content/${translation.contentId}`}
                  className="btn btn-sm btn-secondary"
                  title="View content"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div className="text-sm text-muted" style={{ marginBottom: 8 }}>
                  Original ({translation.sourceLanguage.toUpperCase()})
                </div>
                <p style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                  {translation.originalText}
                </p>
                
                <div className="text-sm" style={{ marginBottom: 8, color: 'var(--primary)' }}>
                  Translation ({translation.targetLanguage.toUpperCase()})
                </div>
                <p style={{ padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  {translation.translatedText}
                </p>
              </div>

              <div className="flex justify-end gap-8">
                <button
                  onClick={() => handleCopy(translation.translatedText, translation.id)}
                  className="btn btn-sm btn-secondary"
                  title="Copy translation"
                >
                  {copiedId === translation.id ? (
                    <Check className="w-4 h-4" style={{ color: 'var(--success)' }} />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(translation.id)}
                  className="btn btn-sm btn-secondary"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
