import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examApi } from '../../services/apiServices';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Flag, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface Question {
  id: number;
  questionText: string;
  optionsJson: string; // JSON string
  correctAnswer: string;
  explanation: string;
  section: string;
}

interface Exam {
  id: number;
  title: string;
  durationMinutes: number;
  questions: Question[];
}

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchExam();
    return () => clearInterval(timerRef.current);
  }, [id]);

  const fetchExam = async () => {
    try {
      const res = await examApi.getExam(Number(id));
      const examData = res.data.data;
      setExam(examData);
      setTimeLeft(examData.durationMinutes * 60);
      startTimer();
    } catch {
      toast.error('Failed to load exam');
      navigate('/app/exams');
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!exam) return;
    clearInterval(timerRef.current);
    
    let score = 0;
    exam.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });

    try {
      const res = await examApi.submitAttempt(exam.id, {
        score,
        total: exam.questions.length,
        timeSpent: exam.durationMinutes * 60 - timeLeft,
        answersJson: JSON.stringify(answers)
      });
      setResult(res.data.data);
      setIsFinished(true);
      toast.success('Test submitted successfully!');
    } catch {
      toast.error('Submission failed');
    }
  };

  if (!exam) return <div className="text-center py-100">Loading exam content...</div>;

  if (isFinished) {
    return (
      <div className="max-w-800 mx-auto py-40">
        <div className="card text-center">
          <div className="flex justify-center mb-24">
             <div className="stat-circle" style={{ width: 120, height: 120, fontSize: 32, borderColor: 'var(--accent-green)' }}>
               {Math.round((result.score / result.totalPossible) * 100)}%
             </div>
          </div>
          <div className="page-title mb-8">Test Completed!</div>
          <div className="text-muted mb-24">
            You scored {result.score} out of {result.totalPossible} questions.
          </div>
          <div className="card-grid mb-32" style={{ textAlign: 'left' }}>
            <div className="stat-card">
              <div className="stat-value">{Math.floor(result.timeSpentSeconds / 60)}m</div>
              <div className="stat-label">Time Spent</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{result.score}</div>
              <div className="stat-label">Correct Answers</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/app/exams')}>Back to Exams</button>
        </div>
      </div>
    );
  }

  const currentQ = exam.questions[currentIdx];
  const options = JSON.parse(currentQ.optionsJson || '[]');

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <button className="btn btn-ghost" onClick={() => navigate('/app/exams')}><ChevronLeft size={20} /> Quit</button>
        <div className="flex items-center gap-12 pill pill-cyan">
          <Clock size={16} />
          <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="max-w-800 mx-auto">
        <div className="flex items-center justify-between mb-16">
          <div className="text-sm text-muted">Question {currentIdx + 1} of {exam.questions.length}</div>
          <span className="pill pill-orange">{currentQ.section}</span>
        </div>

        <div className="card mb-24">
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>{currentQ.questionText}</div>
          <div className="flex flex-col gap-12">
            {options.map((opt: string, i: number) => (
              <button
                key={i}
                className={`btn btn-full text-left ${answers[currentQ.id] === opt ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))}
                style={{ justifyContent: 'flex-start', padding: '16px 20px', fontWeight: 500 }}
              >
                <span style={{ marginRight: 12, opacity: 0.5 }}>{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            className="btn btn-secondary"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
          >
            <ChevronLeft size={18} /> Previous
          </button>
          
          {currentIdx === exam.questions.length - 1 ? (
            <button className="btn btn-primary" onClick={handleSubmit} style={{ gap: 8 }}>
              Submit Test <Send size={18} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setCurrentIdx(prev => prev + 1)}>
              Next <ChevronRight size={18} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-8 mt-40">
           {exam.questions.map((q, i) => (
             <div
               key={q.id}
               className={`q-nav-pill ${currentIdx === i ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
               onClick={() => setCurrentIdx(i)}
             >
               {i + 1}
             </div>
           ))}
        </div>
      </div>

      <style>{`
        .q-nav-pill {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-muted);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          border: 1px solid var(--border-color);
        }
        .q-nav-pill.active {
          border-color: var(--primary);
          color: var(--primary);
        }
        .q-nav-pill.answered {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}
