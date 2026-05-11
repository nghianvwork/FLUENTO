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
      const industryId = Number(id);
      let mockVocabs: Vocabulary[] = [];
      
      switch(industryId) {
        case 1: // IT
          mockVocabs = [
            { id: 1, word: 'deploy', definition: 'To release software to production', pronunciationIpa: '/dɪˈplɔɪ/', exampleSentences: '["We need to deploy by Friday."]', difficulty: 'BEGINNER', frequencyRank: 1 },
            { id: 2, word: 'refactor', definition: 'To restructure code without changing behavior', pronunciationIpa: '/riːˈfæktər/', exampleSentences: '["Let\'s refactor this module."]', difficulty: 'INTERMEDIATE', frequencyRank: 2 },
            { id: 3, word: 'scalability', definition: 'Ability to handle growing workload', pronunciationIpa: '/ˌskeɪləˈbɪlɪti/', exampleSentences: '["Consider scalability in design."]', difficulty: 'INTERMEDIATE', frequencyRank: 3 },
            { id: 4, word: 'debugging', definition: 'Finding and fixing software errors', pronunciationIpa: '/diːˈbʌɡɪŋ/', exampleSentences: '["Debugging took hours."]', difficulty: 'BEGINNER', frequencyRank: 4 },
            { id: 5, word: 'API', definition: 'Application Programming Interface', pronunciationIpa: '/ˌeɪpiːˈaɪ/', exampleSentences: '["The REST API handles communication."]', difficulty: 'BEGINNER', frequencyRank: 5 },
          ];
          break;
        case 2: // Marketing
          mockVocabs = [
            { id: 201, word: 'branding', definition: 'The process of creating a unique name and image for a product', pronunciationIpa: '/ˈbrændɪŋ/', exampleSentences: '["Consistent branding is key to recognition."]', difficulty: 'BEGINNER', frequencyRank: 1 },
            { id: 202, word: 'engagement', definition: 'The level of interaction that people have with a brand', pronunciationIpa: '/ɪnˈɡeɪdʒmənt/', exampleSentences: '["Social media engagement is up by 20%."]', difficulty: 'INTERMEDIATE', frequencyRank: 2 },
            { id: 203, word: 'conversion', definition: 'The process of turning a visitor into a customer', pronunciationIpa: '/kənˈvɜːrʒn/', exampleSentences: '["Our conversion rate optimized last month."]', difficulty: 'INTERMEDIATE', frequencyRank: 3 },
            { id: 204, word: 'analytics', definition: 'The systematic computational analysis of data or statistics', pronunciationIpa: '/ˌænəˈlɪtɪks/', exampleSentences: '["Check the marketing analytics for trends."]', difficulty: 'BEGINNER', frequencyRank: 4 },
            { id: 205, word: 'SEO', definition: 'Search Engine Optimization', pronunciationIpa: '/ˌes iː ˈəʊ/', exampleSentences: '["We need to improve our SEO ranking."]', difficulty: 'BEGINNER', frequencyRank: 5 },
          ];
          break;
        case 3: // Finance
          mockVocabs = [
            { id: 301, word: 'asset', definition: 'A useful or valuable thing, person, or quality', pronunciationIpa: '/ˈæset/', exampleSentences: '["The company\'s assets include real estate."]', difficulty: 'BEGINNER', frequencyRank: 1 },
            { id: 302, word: 'liability', definition: 'The state of being responsible for something, especially by law', pronunciationIpa: '/ˌlaɪəˈbɪləti/', exampleSentences: '["Total liabilities decreased this quarter."]', difficulty: 'INTERMEDIATE', frequencyRank: 2 },
            { id: 303, word: 'liquidity', definition: 'The availability of liquid assets to a market or company', pronunciationIpa: '/lɪˈkwɪdəti/', exampleSentences: '["The bank has high liquidity."]', difficulty: 'INTERMEDIATE', frequencyRank: 3 },
            { id: 304, word: 'portfolio', definition: 'A range of investments held by a person or organization', pronunciationIpa: '/pɔːrtˈfəʊliəʊ/', exampleSentences: '["Diversify your investment portfolio."]', difficulty: 'BEGINNER', frequencyRank: 4 },
            { id: 305, word: 'dividend', definition: 'A sum of money paid regularly by a company to its shareholders', pronunciationIpa: '/ˈdɪvɪdend/', exampleSentences: '["Shareholders received a high dividend."]', difficulty: 'BEGINNER', frequencyRank: 5 },
          ];
          break;
        case 4: // Healthcare
          mockVocabs = [
            { id: 401, word: 'diagnosis', definition: 'The identification of the nature of an illness', pronunciationIpa: '/ˌdaɪəɡˈnəʊsɪs/', exampleSentences: '["The doctor confirmed the diagnosis."]', difficulty: 'BEGINNER', frequencyRank: 1 },
            { id: 402, word: 'prognosis', definition: 'The likely course of a disease or ailment', pronunciationIpa: '/prɒɡˈnəʊsɪs/', exampleSentences: '["The prognosis for recovery is good."]', difficulty: 'INTERMEDIATE', frequencyRank: 2 },
            { id: 403, word: 'treatment', definition: 'Medical care given to a patient for an illness or injury', pronunciationIpa: '/ˈtriːtmənt/', exampleSentences: '["New treatment options are available."]', difficulty: 'BEGINNER', frequencyRank: 3 },
            { id: 404, word: 'therapy', definition: 'Treatment intended to relieve or heal a disorder', pronunciationIpa: '/ˈθerəpi/', exampleSentences: '["Physical therapy helped his back pain."]', difficulty: 'BEGINNER', frequencyRank: 4 },
            { id: 405, word: 'acute', definition: 'A disease or condition with a rapid onset and short duration', pronunciationIpa: '/əˈkjuːt/', exampleSentences: '["He was diagnosed with acute pneumonia."]', difficulty: 'INTERMEDIATE', frequencyRank: 5 },
          ];
          break;
        default:
          mockVocabs = [
            { id: 991, word: 'logistics', definition: 'The detailed coordination of a complex operation', pronunciationIpa: '/ləˈdʒɪstɪks/', exampleSentences: '["The logistics of the move were complex."]', difficulty: 'BEGINNER', frequencyRank: 1 },
            { id: 992, word: 'inventory', definition: 'A complete list of items such as property, goods in stock', pronunciationIpa: '/ˈɪnvəntri/', exampleSentences: '["We need to check the inventory levels."]', difficulty: 'BEGINNER', frequencyRank: 2 },
            { id: 993, word: 'dropshipping', definition: 'A retail fulfillment method where a store doesn\'t keep products in stock', pronunciationIpa: '/ˈdrɒpʃɪpɪŋ/', exampleSentences: '["He started a dropshipping business."]', difficulty: 'INTERMEDIATE', frequencyRank: 3 },
            { id: 994, word: 'procurement', definition: 'The action of obtaining or procuring something', pronunciationIpa: '/prəˈkjʊərmənt/', exampleSentences: '["Government procurement rules are strict."]', difficulty: 'INTERMEDIATE', frequencyRank: 4 },
            { id: 995, word: 'checkout', definition: 'The place where one pays in a store', pronunciationIpa: '/ˈtʃekaʊt/', exampleSentences: '["Please proceed to the checkout."]', difficulty: 'BEGINNER', frequencyRank: 5 },
          ];
      }
      setVocabs(mockVocabs);
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
