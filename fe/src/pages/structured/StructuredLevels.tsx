import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { structuredLessonApi } from '../../services/apiServices';
import { StructuredLevel } from '../../types';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export default function StructuredLevels() {
  const [levels, setLevels] = useState<StructuredLevel[]>([]);
  const [seeding, setSeeding] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = (user?.role || '').toUpperCase().includes('ADMIN');

  useEffect(() => {
    structuredLessonApi.getLevels().then(res => setLevels(res.data.data || []));
  }, []);

  const handleSeed = async (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setSeeding(code);
      await structuredLessonApi.seedLevel(code);
      toast.success(`Seeding lessons for ${code}. Reload in 1-2 minutes.`);
    } catch {
      toast.error('Failed to seed lessons');
    } finally {
      setSeeding(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📚 Structured Lessons (A1–C2)</div>
        <div className="page-subtitle">Lộ trình học có cấu trúc từ cơ bản đến nâng cao theo CEFR</div>
      </div>

      <div className="card-grid">
        {levels.map((level, i) => (
          <div
            key={level.code}
            className="card animate-in"
            style={{ cursor: 'pointer', animationDelay: `${i * 0.05}s`, position: 'relative' }}
            onClick={() => navigate(`/app/levels/${level.code}`)}
          >
            {isAdmin && (
              <button
                className="btn btn-sm"
                style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: 'rgba(108, 92, 231, 0.1)', color: 'var(--primary)' }}
                onClick={(e) => handleSeed(level.code, e)}
                title="Seed structured lessons"
                disabled={seeding === level.code}
              >
                <Sparkles size={12} /> {seeding === level.code ? 'Seeding...' : 'Seed'}
              </button>
            )}

            <div className="feature-icon" style={{ background: 'var(--bg-tertiary)', marginBottom: 16 }}>{level.code}</div>
            <div className="card-title" style={{ marginBottom: 8 }}>{level.title}</div>
            <div className="card-desc" style={{ marginBottom: 16 }}>{level.description}</div>
            <div className="flex justify-between items-center">
              <div className="flex gap-16">
                <span className="flex items-center gap-8 text-sm text-muted">
                  <BookOpen size={14} /> {level.completedLessons}/{level.totalLessons} lessons
                </span>
              </div>
              <ArrowRight size={18} color="var(--primary)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
