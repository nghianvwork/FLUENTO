import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { careerApi } from '../../services/apiServices';
import { CareerPath } from '../../types';
import { Clock, BookOpen, ArrowRight, Sparkles, BookMarked } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export default function CareerSetup() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = (user?.role || '').toUpperCase().includes('ADMIN');

  useEffect(() => {
    careerApi.getPaths().then(res => setPaths(res.data.data)).catch(() => {
      setPaths([
        { id: 1, name: 'Information Technology', description: 'Master English for software development and IT', icon: '💻', estimatedWeeks: 12, vocabularyCount: 500 },
        { id: 2, name: 'Marketing & Advertising', description: 'Learn marketing terminology for digital campaigns', icon: '📊', estimatedWeeks: 10, vocabularyCount: 400 },
        { id: 3, name: 'Finance & Banking', description: 'Financial English for banking and investment', icon: '💰', estimatedWeeks: 14, vocabularyCount: 550 },
        { id: 4, name: 'Healthcare & Medicine', description: 'Medical English for healthcare professionals', icon: '🏥', estimatedWeeks: 16, vocabularyCount: 600 },
        { id: 5, name: 'Education & Teaching', description: 'Academic English for educators', icon: '📚', estimatedWeeks: 8, vocabularyCount: 350 },
        { id: 6, name: 'Hospitality & Tourism', description: 'Service English for hospitality industry', icon: '✈️', estimatedWeeks: 8, vocabularyCount: 300 },
        { id: 7, name: 'Legal & Law', description: 'Legal English for law professionals', icon: '⚖️', estimatedWeeks: 14, vocabularyCount: 500 },
        { id: 8, name: 'Engineering', description: 'Technical English for engineers', icon: '🔧', estimatedWeeks: 12, vocabularyCount: 450 },
        { id: 9, name: 'Human Resources', description: 'HR English for recruitment and training', icon: '👥', estimatedWeeks: 10, vocabularyCount: 350 },
        { id: 10, name: 'E-commerce & Retail', description: 'Business English for online selling', icon: '🛒', estimatedWeeks: 8, vocabularyCount: 300 },
      ]);
    });
  }, []);

  const handleSeed = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await careerApi.seedVocabulary(id);
      toast.success('Đang khởi tạo từ vựng AI cho ngành này. Vui lòng quay lại sau ít phút!', { duration: 5000 });
    } catch (err) {
      toast.error('Không thể khởi tạo từ vựng. Vui lòng kiểm tra API Key.');
    }
  };

  const handleSeedLessons = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await careerApi.seedLessons(id);
      toast.success('Đang khởi tạo bài học & bài tập AI cho ngành này. Vui lòng quay lại sau ít phút!', { duration: 5000 });
    } catch (err) {
      toast.error('Không thể khởi tạo bài học. Vui lòng kiểm tra API Key.');
    }
  };

  const handleSeedDictionary = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await careerApi.seedDictionary(id);
      toast.success('📖 Đang tạo nhiều từ vựng có audio/phonetics/synonyms. Quay lại sau 2-3 phút!', { duration: 6000 });
    } catch (err) {
      toast.error('Không thể khởi tạo từ điển. Vui lòng kiểm tra kết nối.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">💼 Career English Engine</div>
        <div className="page-subtitle">Chọn ngành nghề để nhận lộ trình học từ vựng chuyên ngành phù hợp</div>
      </div>

      <div className="card-grid">
        {paths.map((path, i) => (
          <div key={path.id} className="card animate-in" style={{ cursor: 'pointer', animationDelay: `${i * 0.05}s`, position: 'relative' }}
            onClick={() => navigate(`/app/career/${path.id}/vocab`)}>
            
            {isAdmin && (
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4, zIndex: 10 }}>
                <button 
                  className="btn btn-sm" 
                  style={{ background: 'rgba(108, 92, 231, 0.1)', color: 'var(--primary)', border: '1px solid var(--border)', fontSize: '10px', padding: '4px 8px' }}
                  onClick={(e) => handleSeed(e, path.id)}
                  title="Seed AI Vocabulary"
                >
                  <Sparkles size={10} /> AI
                </button>
                <button 
                  className="btn btn-sm" 
                  style={{ background: 'rgba(0, 206, 209, 0.1)', color: 'var(--accent-cyan)', border: '1px solid var(--border)', fontSize: '10px', padding: '4px 8px' }}
                  onClick={(e) => handleSeedDictionary(e, path.id)}
                  title="Nhiều từ vựng + audio/phonetics/synonyms (seed-dictionary)"
                >
                  <BookMarked size={10} /> Dict
                </button>
                <button 
                  className="btn btn-sm" 
                  style={{ background: 'rgba(0, 184, 148, 0.1)', color: 'var(--accent-green)', border: '1px solid var(--border)', fontSize: '10px', padding: '4px 8px' }}
                  onClick={(e) => handleSeedLessons(e, path.id)}
                  title="Seed AI Lessons/Tests"
                >
                  <Sparkles size={10} /> Tests
                </button>
              </div>
            )}

            <div className="feature-icon" style={{ background: 'var(--bg-tertiary)', marginBottom: 16 }}>{path.icon}</div>
            <div className="card-title" style={{ marginBottom: 8 }}>{path.name}</div>
            <div className="card-desc" style={{ marginBottom: 16 }}>{path.description}</div>
            <div className="flex justify-between items-center">
              <div className="flex gap-16">
                <span className="flex items-center gap-8 text-sm text-muted"><Clock size={14} /> {path.estimatedWeeks} tuần</span>
                <span className="flex items-center gap-8 text-sm text-muted"><BookOpen size={14} /> {path.vocabularyCount || (path as any).vocabulary_count} từ</span>
              </div>
              <ArrowRight size={18} color="var(--primary)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
