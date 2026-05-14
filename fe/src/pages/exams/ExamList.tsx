import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examApi } from '../../services/apiServices';
import { BookOpen, Trophy, Clock, Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface Exam {
  id: number;
  title: string;
  description: string;
  type: 'IELTS' | 'TOEIC' | 'TOEFL' | 'CEFR';
  level: string;
  durationMinutes: number;
  totalQuestions: number;
}

export default function ExamList() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [isSeeding, setIsSeeding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, [filter]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const type = filter === 'ALL' ? undefined : filter;
      const res = await examApi.getExams(type);
      const raw = res?.data?.data ?? res?.data ?? [];
      setExams(Array.isArray(raw) ? raw : []);
    } catch {
      setExams([]);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async (type: string) => {
    setIsSeeding(true);
    toast.loading(`Generating ${type} exam with AI...`, { id: 'seed' });
    try {
      await examApi.seedExam(type);
      toast.success(`${type} exam ready!`, { id: 'seed' });
      fetchExams();
    } catch {
      toast.error('AI generation failed', { id: 'seed' });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Certification Prep</div>
        <div className="page-subtitle">Master IELTS, TOEIC, and TOEFL with AI-powered mock tests</div>
      </div>

      <div className="card admin-hero mb-24">
        <div className="flex justify-between items-center flex-wrap gap-16">
          <div className="flex gap-8">
            {['ALL', 'IELTS', 'TOEIC', 'TOEFL'].map(t => (
              <button
                key={t}
                className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleSeed(filter === 'ALL' ? 'IELTS' : filter)}
            disabled={isSeeding}
          >
            <Sparkles size={16} /> Generate AI Mock Test
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-40">Loading practice tests...</div>
      ) : exams.length === 0 ? (
        <div className="card text-center py-40 text-muted">
          No {filter !== 'ALL' ? filter : ''} exams found. Click the button above to generate one!
        </div>
      ) : (
        <div className="card-grid">
          {exams.map(exam => (
            <div key={exam.id} className="card exam-card">
              <div className="flex justify-between items-start mb-12">
                <span className="pill pill-cyan">{exam.type}</span>
                <span className="text-sm text-muted">{exam.level}</span>
              </div>
              <div className="card-title mb-8">{exam.title}</div>
              <div className="card-desc mb-16">{exam.description}</div>
              <div className="flex gap-16 mb-20 text-sm text-muted">
                <div className="flex items-center gap-4"><Clock size={14} /> {exam.durationMinutes}m</div>
                <div className="flex items-center gap-4"><BookOpen size={14} /> {exam.totalQuestions} Questions</div>
              </div>
              <button className="btn btn-primary btn-full" onClick={() => navigate(`/app/exams/${exam.id}`)}>
                Start Mock Test
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
