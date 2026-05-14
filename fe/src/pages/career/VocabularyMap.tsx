import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { careerApi } from '../../services/apiServices';
import { Vocabulary } from '../../types';
import { ArrowLeft, Volume2, CheckCircle, XCircle, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

const POS_TABS = [
  { key: 'all', label: 'Tất cả', color: 'var(--primary)' },
  { key: 'noun', label: 'Noun', color: '#3b82f6' },
  { key: 'verb', label: 'Verb', color: '#ef4444' },
  { key: 'adjective', label: 'Adjective', color: '#a855f7' },
  { key: 'adverb', label: 'Adverb', color: '#f97316' },
  { key: 'other', label: 'Khác', color: '#6b7280' },
];

function getPosColor(pos?: string) {
  if (!pos) return '#6b7280';
  const p = pos.toLowerCase();
  if (p === 'noun') return '#3b82f6';
  if (p === 'verb') return '#ef4444';
  if (p.startsWith('adj')) return '#a855f7';
  if (p.startsWith('adv')) return '#f97316';
  return '#6b7280';
}

function parseJson(str?: string): string[] {
  if (!str) return [];
  try { const arr = JSON.parse(str); return Array.isArray(arr) ? arr : []; } catch { return []; }
}

export default function VocabularyMap() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allVocabs, setAllVocabs] = useState<Vocabulary[]>([]);
  const [vocabs, setVocabs] = useState<Vocabulary[]>([]);
  const [current, setCurrent] = useState(0);
  const [showDef, setShowDef] = useState(false);
  const [mode, setMode] = useState<'browse' | 'review'>('browse');
  const [activePos, setActivePos] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<Record<string, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    careerApi.getVocabulary(Number(id)).then(res => {
      const data: Vocabulary[] = res.data.data || [];
      setAllVocabs(data);
      setVocabs(data);
      computeStats(data);
    }).catch(() => {
      const mock: Vocabulary[] = [
        { id: 1, word: 'deploy', definition: 'To release software to production', phonetic: '/dɪˈplɔɪ/', partOfSpeech: 'verb', exampleSentences: '["We need to deploy by Friday."]', difficulty: 'BEGINNER', frequencyRank: 1 },
        { id: 2, word: 'scalability', definition: 'Ability to handle growing workload', phonetic: '/ˌskeɪləˈbɪlɪti/', partOfSpeech: 'noun', exampleSentences: '["Consider scalability in design."]', difficulty: 'INTERMEDIATE', frequencyRank: 2 },
        { id: 3, word: 'robust', definition: 'Strong and effective in all conditions', phonetic: '/roʊˈbʌst/', partOfSpeech: 'adjective', exampleSentences: '["Build a robust system."]', difficulty: 'INTERMEDIATE', frequencyRank: 3 },
        { id: 4, word: 'efficiently', definition: 'In a way that achieves maximum productivity', phonetic: '/ɪˈfɪʃəntli/', partOfSpeech: 'adverb', exampleSentences: '["The code runs efficiently."]', difficulty: 'BEGINNER', frequencyRank: 4 },
        { id: 5, word: 'API', definition: 'Application Programming Interface', phonetic: '/ˌeɪpiːˈaɪ/', partOfSpeech: 'noun', exampleSentences: '["The REST API handles data."]', difficulty: 'BEGINNER', frequencyRank: 5 },
      ];
      setAllVocabs(mock);
      setVocabs(mock);
      computeStats(mock);
    });
  }, [id]);

  const computeStats = (data: Vocabulary[]) => {
    const s: Record<string, number> = { all: data.length };
    data.forEach(v => {
      const pos = (v.partOfSpeech || 'other').toLowerCase();
      s[pos] = (s[pos] || 0) + 1;
    });
    setStats(s);
  };

  useEffect(() => {
    let filtered = allVocabs;
    if (activePos !== 'all') {
      if (activePos === 'other') {
        filtered = filtered.filter(v => {
          const p = (v.partOfSpeech || '').toLowerCase();
          return !['noun', 'verb', 'adjective', 'adverb'].includes(p);
        });
      } else {
        filtered = filtered.filter(v => (v.partOfSpeech || '').toLowerCase() === activePos);
      }
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(v => v.word.toLowerCase().includes(q) || (v.definition || '').toLowerCase().includes(q));
    }
    setVocabs(filtered);
    setCurrent(0);
    setShowDef(false);
  }, [activePos, searchTerm, allVocabs]);

  const playAudio = (url?: string) => {
    if (!url) { toast.error('Không có audio'); return; }
    if (audioRef.current) { audioRef.current.pause(); }
    const a = new Audio(url);
    audioRef.current = a;
    a.play().catch(() => toast.error('Không phát được audio'));
  };

  const handleReview = async (correct: boolean) => {
    if (vocabs[current]) {
      try { await careerApi.reviewVocab(vocabs[current].id, correct); } catch {}
      toast(correct ? '✅ Correct!' : '❌ Review again later', { duration: 1000 });
    }
    setShowDef(false);
    if (current < vocabs.length - 1) setCurrent(current + 1);
    else { toast.success('Hoàn thành review! 🎉'); setCurrent(0); }
  };

  const vocab = vocabs[current];

  // Shared card style
  const cardStyle = { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-16 mb-16" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/app/career')}><ArrowLeft size={20} /></button>
        <div className="page-title" style={{ fontSize: 20 }}>📖 Vocabulary</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['browse', 'review'] as const).map(m => (
            <button key={m} className={`btn btn-sm ${mode === m ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode(m)}>
              {m === 'browse' ? 'Browse' : 'Flashcard'}
            </button>
          ))}
          <button className="btn btn-sm" style={{ background: 'var(--accent-green)', color: '#fff' }} onClick={() => navigate(`/app/career/${id}/lesson`)}>Start Lesson</button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {POS_TABS.map(t => {
          const count = t.key === 'all' ? stats.all || 0 : t.key === 'other'
            ? (stats.all || 0) - (stats.noun || 0) - (stats.verb || 0) - (stats.adjective || 0) - (stats.adverb || 0)
            : stats[t.key] || 0;
          return (
            <button key={t.key} onClick={() => setActivePos(t.key)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
                background: activePos === t.key ? t.color : 'var(--bg-tertiary)',
                color: activePos === t.key ? '#fff' : 'var(--text-secondary)',
                border: activePos === t.key ? 'none' : '1px solid var(--border)',
              }}>
              {t.label} <span style={{ opacity: .7, marginLeft: 4 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      {mode === 'browse' && (
        <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tìm từ vựng..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14 }} />
          {searchTerm && <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>}
        </div>
      )}

      {/* BROWSE MODE */}
      {mode === 'browse' && (
        <div className="card-grid">
          {vocabs.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Không có từ vựng nào. Hãy dùng nút Seed để thêm từ.</div>}
          {vocabs.map(v => {
            const synonyms = parseJson(v.synonyms);
            const antonyms = parseJson(v.antonyms);
            const examples = parseJson(v.exampleSentences);
            const posColor = getPosColor(v.partOfSpeech);
            return (
              <div key={v.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                {/* POS indicator bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: posColor }} />

                <div className="flex justify-between items-center mb-8" style={{ marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 800 }}>{v.word}</span>
                    {v.audioUrl && (
                      <button onClick={() => playAudio(v.audioUrl)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex', padding: 4 }} title="Phát âm">
                        <Volume2 size={16} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {v.partOfSpeech && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: posColor + '22', color: posColor }}>
                        {v.partOfSpeech}
                      </span>
                    )}
                    <span className={`badge ${v.difficulty === 'BEGINNER' ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: 10 }}>{v.difficulty}</span>
                  </div>
                </div>

                <div className="text-sm text-muted mb-8">{v.phonetic || v.pronunciationIpa}</div>
                {v.meaningVi && <div style={{ fontSize: 13, color: 'var(--accent-cyan)', marginBottom: 8 }}>🇻🇳 {v.meaningVi}</div>}
                <div style={{ marginBottom: 10, fontSize: 14, lineHeight: 1.5 }}>{v.definition}</div>

                {examples.length > 0 && (
                  <div className="text-sm" style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 8 }}>
                    💬 {examples[0]}
                  </div>
                )}

                {(synonyms.length > 0 || antonyms.length > 0) && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8 }}>
                    {synonyms.length > 0 && (
                      <div style={{ fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Synonyms: </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{synonyms.slice(0, 5).join(', ')}</span>
                      </div>
                    )}
                    {antonyms.length > 0 && (
                      <div style={{ fontSize: 12 }}>
                        <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>Antonyms: </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{antonyms.slice(0, 5).join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}

                {v.source && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, textAlign: 'right' }}>
                    {v.source === 'DICTIONARY_API' ? '📖 Dictionary API' : v.source === 'GEMINI_AI' ? '✨ AI Generated' : '✏️ Manual'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FLASHCARD MODE */}
      {mode === 'review' && vocab ? (
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="text-center text-sm text-muted mb-16">{current + 1} / {vocabs.length}</div>
          <div className="progress-bar mb-24"><div className="progress-fill" style={{ width: `${((current + 1) / vocabs.length) * 100}%` }} /></div>
          <div style={{ ...cardStyle, textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 4 }}>{vocab.word}</div>
            {vocab.partOfSpeech && (
              <span style={{ fontSize: 13, fontWeight: 700, padding: '2px 12px', borderRadius: 12, background: getPosColor(vocab.partOfSpeech) + '22', color: getPosColor(vocab.partOfSpeech), display: 'inline-block', marginBottom: 8 }}>
                {vocab.partOfSpeech}
              </span>
            )}
            <div className="text-muted mb-8">{vocab.phonetic || vocab.pronunciationIpa}</div>
            {vocab.audioUrl && (
              <button onClick={() => playAudio(vocab.audioUrl)} className="btn btn-sm btn-secondary" style={{ marginBottom: 16 }}>
                <Volume2 size={14} /> Phát âm
              </button>
            )}

            {showDef ? (
              <div className="animate-in">
                {vocab.meaningVi && <div style={{ fontSize: 15, color: 'var(--accent-cyan)', marginBottom: 12 }}>🇻🇳 {vocab.meaningVi}</div>}
                <div style={{ fontSize: 16, marginBottom: 16, lineHeight: 1.6 }}>{vocab.definition}</div>
                {parseJson(vocab.exampleSentences)[0] && (
                  <div className="text-sm" style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 8 }}>💬 {parseJson(vocab.exampleSentences)[0]}</div>
                )}
                {parseJson(vocab.synonyms).length > 0 && (
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: 'var(--accent-green)' }}>Synonyms:</span> {parseJson(vocab.synonyms).slice(0, 4).join(', ')}
                  </div>
                )}
                <div className="flex gap-16 justify-center" style={{ marginTop: 24 }}>
                  <button className="btn btn-sm" style={{ background: 'rgba(255,107,107,0.15)', color: 'var(--accent-red)' }} onClick={() => handleReview(false)}>
                    <XCircle size={16} /> Chưa nhớ
                  </button>
                  <button className="btn btn-sm" style={{ background: 'rgba(0,184,148,0.15)', color: 'var(--accent-green)' }} onClick={() => handleReview(true)}>
                    <CheckCircle size={16} /> Đã nhớ
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowDef(true)}>Xem nghĩa</button>
            )}
          </div>
        </div>
      ) : mode === 'review' && !vocab ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Không có từ vựng để review</div>
      ) : null}
    </div>
  );
}
