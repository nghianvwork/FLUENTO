import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Award, Clock, TrendingUp, Calendar, Target, BarChart3, RefreshCw } from 'lucide-react';
import { contentApi } from '../../services/apiServices';
import toast from 'react-hot-toast';

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

interface AvailableTest {
  id: number;
  contentId: number;
  contentTitle?: string;
  title: string;
  description?: string;
  type: string;
  timeLimit: number;
  passingScore: number;
}

export default function MyTests() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [availableTests, setAvailableTests] = useState<AvailableTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAttempts();
    loadAvailableTests();
  }, []);

  const loadAttempts = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await contentApi.getMyTestAttempts();
      const data = res.data;
      if (data.success) setAttempts(data.data || []);
    } catch (error) {
      console.error('Failed to load test attempts:', error);
      toast.error('Failed to load test history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAvailableTests = async () => {
    try {
      const res = await contentApi.getActiveTests();
      const data = res.data;
      if (data.success) setAvailableTests(data.data || []);
    } catch (error) {
      console.error('Failed to load available tests:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
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
    failed: attempts.filter(a => !a.passed).length,
    avgScore: attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
      : 0,
    bestScore: attempts.length > 0
      ? Math.max(...attempts.map(a => a.score))
      : 0,
    totalTime: attempts.reduce((sum, a) => sum + a.timeSpent, 0),
    passRate: attempts.length > 0
      ? Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100)
      : 0,
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--accent-green)';
    if (score >= 60) return 'var(--accent-orange)';
    return 'var(--accent-red)';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
            animation: 'spin 1s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading test history...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 24px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(0,206,201,0.15))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ClipboardCheck size={24} style={{ color: 'var(--primary-light)' }} />
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>My Tests</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Track your test performance and progress</p>
          </div>
        </div>
        <button
          onClick={() => loadAttempts(true)}
          disabled={refreshing}
          className="btn btn-sm btn-secondary"
          style={{ opacity: refreshing ? 0.5 : 1 }}
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Available Tests */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Available Tests</div>
          <button
            onClick={loadAvailableTests}
            className="btn btn-sm btn-secondary"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        {availableTests.length === 0 ? (
          <div className="text-muted" style={{ fontSize: 14 }}>
            No active tests available yet.
          </div>
        ) : (
          <div className="card-grid">
            {availableTests.map(test => (
              <div key={test.id} className="card" style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{test.title}</div>
                <div className="text-muted" style={{ fontSize: 12, marginBottom: 8 }}>
                  {test.contentTitle || `Content #${test.contentId}`}
                </div>
                {test.description && (
                  <div className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
                    {test.description}
                  </div>
                )}
                <div className="text-sm text-muted" style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <span>⏱ {test.timeLimit}m</span>
                  <span>🎯 {test.passingScore}%</span>
                </div>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => navigate(`/app/content/${test.contentId}?tab=test`)}
                >
                  Start Test
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <ClipboardCheck size={18} style={{ color: 'var(--primary-light)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Tests</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary-light)' }}>{stats.total}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Award size={18} style={{ color: 'var(--accent-green)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Passed</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{stats.passed}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avg Score</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{stats.avgScore}%</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <Clock size={18} style={{ color: 'var(--accent-orange)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Time</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-orange)', fontSize: 24 }}>{formatTime(stats.totalTime)}</div>
        </div>
      </div>

      {/* Pass Rate Progress Bar */}
      {stats.total > 0 && (
        <div className="card" style={{ marginBottom: 24, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={16} style={{ color: 'var(--primary-light)' }} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Overall Pass Rate</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: getScoreColor(stats.passRate) }}>
              {stats.passRate}%
            </span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div
              className="progress-fill"
              style={{
                width: `${stats.passRate}%`,
                background: `linear-gradient(90deg, ${getScoreColor(stats.passRate)}, var(--accent-cyan))`,
                transition: 'width 1s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
            <span style={{ color: 'var(--accent-green)' }}>{stats.passed} passed</span>
            <span style={{ color: 'var(--accent-red)' }}>{stats.failed} failed</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['all', 'passed', 'failed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f === 'all' && <ClipboardCheck size={14} />}
            {f === 'passed' && <Award size={14} />}
            {f === 'failed' && <Target size={14} />}
            {f === 'all' ? `All Tests (${stats.total})` : f === 'passed' ? `Passed (${stats.passed})` : `Failed (${stats.failed})`}
          </button>
        ))}
      </div>

      {/* Attempts List */}
      {filteredAttempts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 'var(--radius-lg)', margin: '0 auto 16px',
            background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ClipboardCheck size={36} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            {filter !== 'all' ? `No ${filter} tests` : 'No test attempts yet'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {filter !== 'all'
              ? 'Try selecting a different filter'
              : 'Take a test from Content Hub to see your results here'
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredAttempts.map(attempt => (
            <div key={attempt.id} className="card" style={{ transition: 'all 0.3s ease' }}>
              {/* Attempt Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{attempt.testTitle}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(attempt.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className={`badge ${attempt.passed ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 12, fontWeight: 700 }}>
                  {attempt.passed ? '✓ PASSED' : '✗ FAILED'}
                </span>
              </div>

              {/* Score Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <div style={{
                  textAlign: 'center', padding: 14, background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: getScoreColor(attempt.score), marginBottom: 4 }}>
                    {attempt.score}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Score</div>
                </div>
                <div style={{
                  textAlign: 'center', padding: 14, background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-green)', marginBottom: 4 }}>
                    {attempt.correctAnswers}/{attempt.totalQuestions}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Correct</div>
                </div>
                <div style={{
                  textAlign: 'center', padding: 14, background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-orange)', marginBottom: 4 }}>
                    {formatTime(attempt.timeSpent)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</div>
                </div>
                <div style={{
                  textAlign: 'center', padding: 14, background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: 4 }}>
                    {Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100)}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accuracy</div>
                </div>
              </div>

              {/* Score Progress */}
              <div style={{ marginTop: 14 }}>
                <div className="progress-bar" style={{ height: 6 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${attempt.score}%`,
                      background: `linear-gradient(90deg, ${getScoreColor(attempt.score)}, var(--accent-cyan))`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
