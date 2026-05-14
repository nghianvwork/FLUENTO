import { useState, useRef } from 'react';
import { careerApi } from '../../services/apiServices';
import { Volume2, Search, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

function getPosColor(pos?: string) {
  if (!pos) return '#6b7280';
  const p = pos.toLowerCase();
  if (p === 'noun') return '#3b82f6';
  if (p === 'verb') return '#ef4444';
  if (p.startsWith('adj')) return '#a855f7';
  if (p.startsWith('adv')) return '#f97316';
  return '#6b7280';
}

export default function Dictionary() {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = (url?: string) => {
    if (!url) return;
    if (audioRef.current) audioRef.current.pause();
    const a = new Audio(url);
    audioRef.current = a;
    a.play().catch(() => toast.error('Không phát được audio'));
  };

  const handleLookup = async (searchWord?: string) => {
    const w = (searchWord || word).trim();
    if (!w) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await careerApi.lookupWord(w);
      setResult(res.data.data);
      setHistory(prev => {
        const next = [w, ...prev.filter(h => h.toLowerCase() !== w.toLowerCase())];
        return next.slice(0, 20);
      });
    } catch {
      toast.error('Không tìm thấy từ này');
    }
    setLoading(false);
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 24,
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📖 Từ Điển Anh-Việt</div>
        <div className="page-subtitle">Tra cứu từ vựng tiếng Anh với phát âm, nghĩa, ví dụ, từ đồng/trái nghĩa</div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, maxWidth: 600 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={word}
            onChange={e => setWord(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
            placeholder="Nhập từ tiếng Anh cần tra..."
            style={{
              width: '100%', padding: '14px 16px 14px 42px', borderRadius: 14,
              border: '1px solid var(--border)', background: 'var(--bg-secondary)',
              color: 'var(--text-primary)', fontSize: 16, outline: 'none',
              transition: 'border-color .2s',
            }}
          />
        </div>
        <button className="btn btn-primary" onClick={() => handleLookup()} disabled={loading}
          style={{ padding: '14px 28px', fontSize: 15, borderRadius: 14 }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite', display: 'inline-block' }} />
              Đang tra...
            </span>
          ) : '🔍 Tra từ'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Main result */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!result && !loading && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: 60 }} className="animate-in">
              <div style={{ fontSize: 56, marginBottom: 16 }}>📖</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                Tra từ điển tiếng Anh
              </div>
              <div style={{ color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
                Nhập bất kỳ từ tiếng Anh nào để xem định nghĩa, phát âm, ví dụ, từ đồng nghĩa và trái nghĩa
              </div>
            </div>
          )}

          {loading && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 16px' }} />
              <div style={{ color: 'var(--text-muted)' }}>Đang tra từ "{word}"...</div>
            </div>
          )}

          {result && result.found === false && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: 48 }} className="animate-in">
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Không tìm thấy</div>
              <div style={{ color: 'var(--text-muted)' }}>
                Từ "<strong>{result.word}</strong>" không có trong từ điển. Hãy kiểm tra lại chính tả.
              </div>
            </div>
          )}

          {result && result.word && result.meanings && (
            <div style={cardStyle} className="animate-in">
              {/* Word header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)' }}>{result.word}</span>
                {result.phonetics?.map((p: any, i: number) => p.audio ? (
                  <button key={i} onClick={() => playAudio(p.audio)}
                    style={{
                      background: 'rgba(108,92,231,.12)', border: 'none', borderRadius: 10,
                      padding: '8px 12px', cursor: 'pointer', color: 'var(--primary)',
                      display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
                      transition: 'background .2s',
                    }}>
                    <Volume2 size={16} /> {p.audio.includes('-us') ? 'US' : p.audio.includes('-uk') ? 'UK' : 'Play'}
                  </button>
                ) : null)}
              </div>
              {result.phonetic && (
                <div style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 20 }}>{result.phonetic}</div>
              )}

              {/* Meanings */}
              {result.meanings?.map((m: any, mi: number) => (
                <div key={mi} style={{
                  marginBottom: 24, paddingBottom: 20,
                  borderBottom: mi < result.meanings.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ marginBottom: 14 }}>
                    <span style={{
                      fontSize: 14, fontWeight: 700, padding: '4px 14px', borderRadius: 12,
                      background: getPosColor(m.partOfSpeech) + '22',
                      color: getPosColor(m.partOfSpeech),
                      display: 'inline-block',
                    }}>
                      {m.partOfSpeech}
                    </span>
                  </div>

                  {m.definitions?.slice(0, 5).map((d: any, di: number) => (
                    <div key={di} style={{ marginBottom: 12, paddingLeft: 16 }}>
                      <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginRight: 6 }}>{di + 1}.</span>
                        {d.definition}
                      </div>
                      {d.example && (
                        <div style={{ fontSize: 14, color: 'var(--accent-cyan)', fontStyle: 'italic', marginTop: 4, paddingLeft: 20 }}>
                          💬 "{d.example}"
                        </div>
                      )}
                    </div>
                  ))}

                  {m.synonyms?.length > 0 && (
                    <div style={{ fontSize: 13, marginTop: 8, paddingLeft: 16, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>Synonyms:</span>
                      {m.synonyms.slice(0, 8).map((s: string, si: number) => (
                        <button key={si} onClick={() => { setWord(s); handleLookup(s); }}
                          style={{
                            background: 'rgba(0,184,148,.1)', color: 'var(--accent-green)',
                            border: '1px solid rgba(0,184,148,.2)', borderRadius: 8,
                            padding: '2px 8px', fontSize: 12, cursor: 'pointer',
                            transition: 'background .2s',
                          }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {m.antonyms?.length > 0 && (
                    <div style={{ fontSize: 13, marginTop: 6, paddingLeft: 16, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>Antonyms:</span>
                      {m.antonyms.slice(0, 8).map((s: string, si: number) => (
                        <button key={si} onClick={() => { setWord(s); handleLookup(s); }}
                          style={{
                            background: 'rgba(255,107,107,.1)', color: 'var(--accent-red)',
                            border: '1px solid rgba(255,107,107,.2)', borderRadius: 8,
                            padding: '2px 8px', fontSize: 12, cursor: 'pointer',
                          }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Source */}
              {result.sourceUrls?.length > 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  📚 Source: {result.sourceUrls.map((u: string, i: number) => (
                    <a key={i} href={u} target="_blank" rel="noreferrer"
                      style={{ color: 'var(--primary)', marginRight: 10, textDecoration: 'none' }}>
                      {new URL(u).hostname}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* History sidebar */}
        {history.length > 0 && (
          <div style={{ width: 200, flexShrink: 0 }}>
            <div style={{ ...cardStyle, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={14} /> Lịch sử tra cứu
              </div>
              {history.map((h, i) => (
                <button key={i} onClick={() => { setWord(h); handleLookup(h); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '6px 10px', borderRadius: 8, border: 'none',
                    background: word.toLowerCase() === h.toLowerCase() ? 'var(--primary-alpha)' : 'transparent',
                    color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer',
                    marginBottom: 2, transition: 'background .15s',
                  }}>
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
