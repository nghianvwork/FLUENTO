import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { careerApi } from '../../services/apiServices';
import { Vocabulary } from '../../types';
import { ArrowLeft, Volume2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VocabularyMap() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vocabs, setVocabs] = useState<Vocabulary[]>([]);
  const [current, setCurrent] = useState(0);
  const [showDef, setShowDef] = useState(false);
  const [mode, setMode] = useState<'browse' | 'review'>('browse');

  useEffect(() => {
    careerApi.getVocabulary(Number(id)).then(res => setVocabs(res.data.data)).catch(() => {
      setVocabs([
        { id: 1, word: 'deploy', definition: 'To release software to production', pronunciationIpa: '/dɪˈplɔɪ/', exampleSentences: '["We need to deploy by Friday."]', difficulty: 'BEGINNER', frequencyRank: 1 },
        { id: 2, word: 'refactor', definition: 'To restructure code without changing behavior', pronunciationIpa: '/riːˈfæktər/', exampleSentences: '["Let\'s refactor this module."]', difficulty: 'INTERMEDIATE', frequencyRank: 2 },
        { id: 3, word: 'scalability', definition: 'Ability to handle growing workload', pronunciationIpa: '/ˌskeɪləˈbɪlɪti/', exampleSentences: '["Consider scalability in design."]', difficulty: 'INTERMEDIATE', frequencyRank: 3 },
        { id: 4, word: 'debugging', definition: 'Finding and fixing software errors', pronunciationIpa: '/diːˈbʌɡɪŋ/', exampleSentences: '["Debugging took hours."]', difficulty: 'BEGINNER', frequencyRank: 4 },
        { id: 5, word: 'API', definition: 'Application Programming Interface', pronunciationIpa: '/ˌeɪpiːˈaɪ/', exampleSentences: '["The REST API handles communication."]', difficulty: 'BEGINNER', frequencyRank: 5 },
      ]);
    });
  }, [id]);

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

  return (
    <div>
      <div className="flex items-center gap-16 mb-24">
        <button className="btn btn-ghost" onClick={() => navigate('/app/career')}><ArrowLeft size={20} /></button>
        <div className="page-title" style={{ fontSize: 20 }}>📖 Vocabulary</div>
        <div style={{ marginLeft: 'auto' }} className="flex gap-8">
          <button className={`btn btn-sm ${mode === 'browse' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('browse')}>Browse</button>
          <button className={`btn btn-sm ${mode === 'review' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('review')}>Flashcard</button>
          <button className="btn btn-sm" style={{ background: 'var(--accent-green)', color: '#fff' }} onClick={() => navigate(`/app/career/${id}/lesson`)}>Start Lesson</button>
        </div>
      </div>

      {mode === 'browse' ? (
        <div className="card-grid">
          {vocabs.map(v => (
            <div key={v.id} className="card">
              <div className="flex justify-between items-center mb-16">
                <span style={{ fontSize: 22, fontWeight: 800 }}>{v.word}</span>
                <span className={`badge ${v.difficulty === 'BEGINNER' ? 'badge-green' : 'badge-orange'}`}>{v.difficulty}</span>
              </div>
              <div className="text-sm text-muted mb-16">{v.pronunciationIpa}</div>
              <div style={{ marginBottom: 12 }}>{v.definition}</div>
              <div className="text-sm" style={{ color: 'var(--accent-cyan)', fontStyle: 'italic' }}>
                {JSON.parse(v.exampleSentences || '[]')[0]}
              </div>
            </div>
          ))}
        </div>
      ) : vocab ? (
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <div className="text-center text-sm text-muted mb-16">{current + 1} / {vocabs.length}</div>
          <div className="progress-bar mb-24"><div className="progress-fill" style={{ width: `${((current + 1) / vocabs.length) * 100}%` }} /></div>
          <div className="card text-center" style={{ padding: 48 }}>
            <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>{vocab.word}</div>
            <div className="text-muted mb-24">{vocab.pronunciationIpa}</div>
            {showDef ? (
              <div className="animate-in">
                <div style={{ fontSize: 16, marginBottom: 16 }}>{vocab.definition}</div>
                <div className="text-sm" style={{ color: 'var(--accent-cyan)', fontStyle: 'italic', marginBottom: 32 }}>
                  {JSON.parse(vocab.exampleSentences || '[]')[0]}
                </div>
                <div className="flex gap-16 justify-center">
                  <button className="btn btn-sm" style={{ background: 'rgba(255,107,107,0.15)', color: 'var(--accent-red)' }}
                    onClick={() => handleReview(false)}><XCircle size={16} /> Chưa nhớ</button>
                  <button className="btn btn-sm" style={{ background: 'rgba(0,184,148,0.15)', color: 'var(--accent-green)' }}
                    onClick={() => handleReview(true)}><CheckCircle size={16} /> Đã nhớ</button>
                </div>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowDef(true)}>Xem nghĩa</button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
