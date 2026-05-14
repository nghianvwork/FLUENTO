import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { structuredLessonApi } from '../../services/apiServices';
import { StructuredLesson } from '../../types';
import { ArrowLeft, Clock, BookOpen, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StructuredLessonList() {
  const { levelCode } = useParams();
  const [lessons, setLessons] = useState<StructuredLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!levelCode) return;
    structuredLessonApi.getLessonsByLevel(levelCode)
      .then(res => setLessons(res.data.data || []))
      .catch(() => toast.error('Không tải được bài học'))
      .finally(() => setLoading(false));
  }, [levelCode]);

  if (loading) {
    return <div className="text-center" style={{ padding: 80 }}>Loading lessons...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-16 mb-24">
        <button className="btn btn-ghost" onClick={() => navigate('/app/levels')}><ArrowLeft size={20} /></button>
        <div>
          <div className="page-title">Level {levelCode}</div>
          <div className="page-subtitle">Chọn bài học để bắt đầu</div>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>Chưa có bài học cho level này.</div>
      ) : (
        <div className="flex flex-col gap-16">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <div className="badge badge-primary">{lesson.lessonType}</div>
                  {lesson.status === 'COMPLETED' && (
                    <span className="badge badge-green"><CheckCircle size={12} /> Done</span>
                  )}
                  {typeof lesson.completedBlocks === 'number' && typeof lesson.totalBlocks === 'number' && lesson.totalBlocks > 0 && (
                    <span className="badge badge-cyan">{lesson.completedBlocks}/{lesson.totalBlocks} blocks</span>
                  )}
                </div>
                <div className="card-title" style={{ marginBottom: 6 }}>{lesson.title}</div>
                {lesson.description && (
                  <div className="card-desc" style={{ marginBottom: 8 }}>{lesson.description}</div>
                )}
                <div className="flex gap-16 text-sm text-muted">
                  <span className="flex items-center gap-8"><BookOpen size={14} /> Lesson {lesson.orderIndex + 1}</span>
                  <span className="flex items-center gap-8"><Clock size={14} /> {lesson.estimatedMinutes} phút</span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => navigate(`/app/levels/${levelCode}/lesson/${lesson.id}`)}>Start</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
