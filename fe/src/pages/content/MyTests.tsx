import { useState, useEffect } from 'react';
import { ClipboardCheck, Award, Clock, TrendingUp, Calendar } from 'lucide-react';

interface TestAttempt {
  id: number;
  testId: number;
  testTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  passed: boolean;
  createdAt: string;
}

export default function MyTests() {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const response = await fetch('/api/content/tests/attempts/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setAttempts(data.data);
    } catch (error) {
      console.error('Failed to load test attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const filteredAttempts = attempts.filter(attempt => {
    if (filter === 'passed') return attempt.passed;
    if (filter === 'failed') return !attempt.passed;
    return true;
  });

  const stats = {
    total: attempts.length,
    passed: attempts.filter(a => a.passed).length,
    avgScore: attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : 0,
    totalTime: attempts.reduce((sum, a) => sum + a.timeSpent, 0)
  };

  if (loading) {
    return <div className="text-center py-12">Loading test history...</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-3 mb-4">
          <ClipboardCheck className="w-8 h-8" style={{ color: 'var(--primary)' }} />
          <h1 className="page-title" style={{ marginBottom: 0 }}>My Tests</h1>
        </div>
        <p className="text-muted">Track your test performance and progress</p>
      </div>

      <div className="card-grid" style={{ marginBottom: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="flex items-center justify-center gap-8 mb-8">
            <ClipboardCheck className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <span className="text-sm text-muted">Total Tests</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.total}</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="flex items-center justify-center gap-8 mb-8">
            <Award className="w-5 h-5" style={{ color: 'var(--success)' }} />
            <span className="text-sm text-muted">Passed</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--success)' }}>{stats.passed}</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="flex items-center justify-center gap-8 mb-8">
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <span className="text-sm text-muted">Avg Score</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)' }}>{stats.avgScore}%</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="flex items-center justify-center gap-8 mb-8">
            <Clock className="w-5 h-5" style={{ color: 'var(--warning)' }} />
            <span className="text-sm text-muted">Total Time</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--warning)' }}>{formatTime(stats.totalTime)}</div>
        </div>
      </div>

      <div className="flex gap-8 mb-24">
        <button
          onClick={() => setFilter('all')}
          className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Tests
        </button>
        <button
          onClick={() => setFilter('passed')}
          className={`btn btn-sm ${filter === 'passed' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Passed
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`btn btn-sm ${filter === 'failed' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Failed
        </button>
      </div>

      {filteredAttempts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <ClipboardCheck className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-tertiary)', width: 64, height: 64 }} />
          <p className="text-muted">No test attempts yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredAttempts.map((attempt) => (
            <div key={attempt.id} className="card">
              <div className="flex items-start justify-between mb-16">
                <div>
                  <h3 className="card-title" style={{ marginBottom: 4 }}>{attempt.testTitle}</h3>
                  <div className="flex items-center gap-8 text-sm text-muted">
                    <Calendar className="w-4 h-4" />
                    {new Date(attempt.createdAt).toLocaleString()}
                  </div>
                </div>
                <span className={`badge ${attempt.passed ? 'badge-green' : 'badge-red'}`}>
                  {attempt.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                <div style={{ textAlign: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{attempt.score}%</div>
                  <div className="text-sm text-muted">Score</div>
                </div>
                <div style={{ textAlign: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>
                    {attempt.correctAnswers}/{attempt.totalQuestions}
                  </div>
                  <div className="text-sm text-muted">Correct</div>
                </div>
                <div style={{ textAlign: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning)' }}>
                    {formatTime(attempt.timeSpent)}
                  </div>
                  <div className="text-sm text-muted">Time</div>
                </div>
                <div style={{ textAlign: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>
                    {Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100)}%
                  </div>
                  <div className="text-sm text-muted">Accuracy</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
