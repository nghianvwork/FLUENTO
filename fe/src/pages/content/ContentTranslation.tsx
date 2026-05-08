import { useState, useEffect } from 'react';
import { Trash2, Languages, Copy, Check, Loader2, Mic, Keyboard, FileText, Image, Globe, ArrowLeftRight, ChevronDown } from 'lucide-react';
import { contentApi } from '../../services/apiServices';
import toast from 'react-hot-toast';

interface Translation {
  id: number;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestampSeconds: number;
  createdAt: string;
}

interface ContentTranslationProps {
  contentId: number;
}

const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'vi', label: 'Vietnamese', flag: '🇻🇳' },
  { value: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { value: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { value: 'ko', label: 'Korean', flag: '🇰🇷' },
  { value: 'es', label: 'Spanish', flag: '🇪🇸' },
  { value: 'fr', label: 'French', flag: '🇫🇷' },
];

export default function ContentTranslation({ contentId }: ContentTranslationProps) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('vi');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadTranslations();
  }, [contentId]);

  const loadTranslations = async () => {
    try {
      const res = await contentApi.getTranslations(contentId);
      const data = res.data;
      if (data.success) setTranslations(data.data || []);
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  };

  const handleTranslate = async () => {
    if (!selectedText.trim()) return;

    setLoading(true);
    try {
      const res = await contentApi.createTranslation(contentId, {
        originalText: selectedText,
        sourceLanguage,
        targetLanguage,
      });
      const data = res.data;
      if (data.success) {
        setTranslations([data.data, ...translations]);
        setSelectedText('');
        toast.success('Translation saved!');
      }
    } catch (error) {
      console.error('Translation failed:', error);
      toast.error('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await contentApi.deleteTranslation(id);
      setTranslations(translations.filter(t => t.id !== id));
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
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  };

  const selectedTargetLang = LANGUAGES.find(l => l.value === targetLanguage);

  const [translatedResult, setTranslatedResult] = useState('');

  const handleTranslateText = async (text: string) => {
    if (!text.trim()) {
      setTranslatedResult('');
      return;
    }
    setLoading(true);
    try {
      const res = await contentApi.createTranslation(contentId, {
        originalText: text,
        sourceLanguage,
        targetLanguage,
      });
      if (res.data.success) {
        setTranslatedResult(res.data.data.translatedText);
        setTranslations([res.data.data, ...translations]);
      }
    } catch (e) {
      toast.error('Translation failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedText) handleTranslateText(selectedText);
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedText, sourceLanguage, targetLanguage]);

  return (
    <div className="translate-container">
      {/* Top Tabs */}
      <div className="translate-tabs">
        <button className="translate-tab active">
          <Languages size={18} />
          <span>Văn bản</span>
        </button>
        <button className="translate-tab">
          <Image size={18} />
          <span>Hình ảnh</span>
        </button>
        <button className="translate-tab">
          <FileText size={18} />
          <span>Tài liệu</span>
        </button>
        <button className="translate-tab">
          <Globe size={18} />
          <span>Trang web</span>
        </button>
      </div>

      <div className="translate-main-card">
        {/* Language Selectors Header */}
        <div className="translate-header">
          <div className="language-selector-group">
            <button className="lang-tab">Phát hiện ngôn ngữ</button>
            {LANGUAGES.slice(0, 3).map(lang => (
              <button 
                key={lang.value} 
                className={`lang-tab ${sourceLanguage === lang.value ? 'active' : ''}`}
                onClick={() => setSourceLanguage(lang.value)}
              >
                {lang.label}
              </button>
            ))}
            <button className="lang-tab icon-tab"><ChevronDown size={16} /></button>
          </div>

          <button className="swap-btn" onClick={handleSwapLanguages}>
            <ArrowLeftRight size={18} />
          </button>

          <div className="language-selector-group">
            {LANGUAGES.slice(0, 3).map(lang => (
              <button 
                key={lang.value} 
                className={`lang-tab ${targetLanguage === lang.value ? 'active' : ''}`}
                onClick={() => setTargetLanguage(lang.value)}
              >
                {lang.label}
              </button>
            ))}
            <button className="lang-tab icon-tab"><ChevronDown size={16} /></button>
          </div>
        </div>

        {/* Text Areas */}
        <div className="translate-body">
          <div className="translate-pane source-pane">
            <textarea
              className="translate-textarea"
              value={selectedText}
              onChange={(e) => setSelectedText(e.target.value)}
              placeholder="Nhập văn bản"
              maxLength={5000}
            />
            <div className="pane-footer">
              <div className="footer-left">
                <button className="icon-btn"><Mic size={18} /></button>
              </div>
              <div className="footer-right">
                <span className="char-count">{selectedText.length} / 5,000</span>
                <button className="icon-btn"><Keyboard size={18} /></button>
                <button className="icon-btn"><ChevronDown size={16} /></button>
              </div>
            </div>
          </div>

          <div className={`translate-pane target-pane ${loading ? 'loading' : ''}`}>
            {loading ? (
              <div className="loading-overlay">
                <Loader2 className="spin" size={24} />
              </div>
            ) : null}
            <div className="translated-text">
              {translatedResult || <span className="placeholder">Bản dịch</span>}
            </div>
            {translatedResult && (
              <div className="pane-footer">
                <div className="footer-right">
                  <button className="icon-btn" onClick={() => handleCopy(translatedResult, 999)}>
                    <Copy size={18} />
                  </button>
                  <button className="icon-btn"><Check size={18} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .translate-container {
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Google Sans', Roboto, Arial, sans-serif;
        }

        .translate-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .translate-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 24px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .translate-tab.active {
          background: #e8f0fe;
          color: #1a73e8;
          border-color: transparent;
        }

        .translate-main-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .translate-header {
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--border);
          padding: 0 16px;
        }

        .language-selector-group {
          display: flex;
          flex: 1;
        }

        .lang-tab {
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-muted);
          cursor: pointer;
          font-weight: 500;
          text-transform: capitalize;
        }

        .lang-tab.active {
          color: #1a73e8;
          border-bottom-color: #1a73e8;
        }

        .lang-tab:hover {
          background: var(--bg-secondary);
        }

        .swap-btn {
          padding: 8px;
          margin: 0 8px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 50%;
        }

        .swap-btn:hover {
          background: var(--bg-secondary);
        }

        .translate-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 200px;
        }

        .translate-pane {
          display: flex;
          flex-direction: column;
          padding: 16px;
          position: relative;
        }

        .source-pane {
          border-right: 1px solid var(--border);
        }

        .target-pane {
          background: var(--bg-secondary);
        }

        .translate-textarea {
          width: 100%;
          height: 120px;
          border: none;
          background: transparent;
          font-size: 20px;
          resize: none;
          color: var(--text-primary);
          outline: none;
        }

        .translated-text {
          font-size: 20px;
          color: var(--text-primary);
          white-space: pre-wrap;
        }

        .placeholder {
          color: var(--text-muted);
        }

        .pane-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
        }

        .footer-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .char-count {
          font-size: 12px;
          color: var(--text-muted);
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .translate-body {
            grid-template-columns: 1fr;
          }
          .source-pane {
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
        }
      `}</style>


      {/* Saved Translations */}
      {translations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Saved Translations ({translations.length})
          </div>
          {translations.map(translation => (
            <div key={translation.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Original ({translation.sourceLanguage.toUpperCase()})
                  </div>
                  <p style={{
                    padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                    fontSize: 14, lineHeight: 1.6, borderLeft: '3px solid var(--primary)',
                  }}>
                    {translation.originalText}
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Translation ({translation.targetLanguage.toUpperCase()})
                  </div>
                  <p style={{
                    padding: 12, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
                    fontSize: 14, lineHeight: 1.6, borderLeft: '3px solid var(--accent-cyan)',
                  }}>
                    {translation.translatedText}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(translation.createdAt).toLocaleString()}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleCopy(translation.translatedText, translation.id)}
                    className="btn btn-sm btn-ghost"
                    style={{ padding: '4px 8px' }}
                    title="Copy translation"
                  >
                    {copiedId === translation.id ? (
                      <Check size={14} style={{ color: 'var(--accent-green)' }} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(translation.id)}
                    disabled={deletingId === translation.id}
                    className="btn btn-sm btn-ghost"
                    style={{ padding: '4px 8px', opacity: deletingId === translation.id ? 0.5 : 1 }}
                    title="Delete"
                  >
                    <Trash2 size={14} style={{ color: 'var(--accent-red)' }} />
                  </button>
                </div>
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
