import { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck, Clock, Award, ChevronRight, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { contentApi } from '../../services/apiServices';
import toast from 'react-hot-toast';

interface TestQuestion {
  id: number;
  question: string;
  questionType: 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'SENTENCE_ORDER';
  options: string;
  points: number;
  orderIndex: number;
}

interface Test {
  id: number;
  title: string;
  description: string;
  type: string;
  timeLimit: number;
  passingScore: number;
  questions: TestQuestion[];
}

interface TestAttempt {
  id: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  passed: boolean;
  createdAt: string;
  review?: Array<{
    questionId: number;
    question: string;
    questionType: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
    points: number;
    pointsEarned: number;
  }>;
}

interface ContentTestProps {
  contentId: number;
}

export default function ContentTest({ contentId }: ContentTestProps) {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<TestAttempt | null>(null);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, [contentId]);

  const handleSubmit = useCallback(async () => {
    if (!selectedTest || isSubmitting) return;

    setIsSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const res = await contentApi.submitTest(selectedTest.id, { answers, timeSpent });
      const data = res.data;
      if (data.success) {
        setResult(data.data);
        setTimeLeft(0);
        if (data.data.passed) {
          toast.success('Congratulations! You passed! 🎉');
        } else {
          toast('Keep practicing! You can do it! 💪', { icon: '📝' });
        }
      }
    } catch (error) {
      console.error('Submit failed:', error);
      toast.error('Failed to submit test');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTest, isSubmitting, startTime, answers]);

  useEffect(() => {
    if (selectedTest && timeLeft > 0 && !result) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [selectedTest, timeLeft, result, handleSubmit]);

  const loadTests = async () => {
    try {
      const res = await contentApi.getTests(contentId);
      const data = res.data;
      if (data.success) setTests(data.data || []);
    } catch (error) {
      console.error('Failed to load tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (test: Test) => {
    setSelectedTest(test);
    setAnswers({});
    setResult(null);
    setTimeLeft(test.timeLimit * 60);
    setStartTime(Date.now());

    try {
      const res = await contentApi.getTestAttempts(test.id);
      const data = res.data;
      if (data.success) setAttempts(data.data || []);
    } catch (error) {
      console.error('Failed to load attempts:', error);
    }
  };

  const parseOptions = (optionsJson: string): string[] => {
    try {
      const parsed = JSON.parse(optionsJson);
      return Array.isArray(parsed) ? parsed : Object.values(parsed);
    } catch {
      return [];
    }
  };

  const parseOrderAnswer = (value?: string): string[] => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--accent-green)';
    if (score >= 60) return 'var(--accent-orange)';
    return 'var(--accent-red)';
  };

  const isAnswerFilled = (question: TestQuestion, value?: string) => {
    if (!value) return false;
    const type = question.questionType || 'MULTIPLE_CHOICE';
    if (type === 'SENTENCE_ORDER') {
      return parseOrderAnswer(value).length > 0;
    }
    return value.trim().length > 0;
  };

  const answeredCount = selectedTest
    ? selectedTest.questions.filter(q => isAnswerFilled(q, answers[q.id])).length
    : 0;
  const totalQuestions = selectedTest?.questions.length || 0;

  const formatAnswer = (value?: string) => {
    if (!value) return '-';
    const parsed = parseOrderAnswer(value);
    if (parsed.length > 0) return parsed.join(' ');
    return value;
  };

  // ========== RESULT VIEW ==========
  if (result) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
            background: result.passed
              ? 'linear-gradient(135deg, rgba(0,184,148,0.2), rgba(0,206,201,0.1))'
              : 'linear-gradient(135deg, rgba(255,107,107,0.2), rgba(253,203,110,0.1))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {result.passed ? (
              <CheckCircle size={40} style={{ color: 'var(--accent-green)' }} />
            ) : (
              <XCircle size={40} style={{ color: 'var(--accent-red)' }} />
            )}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            {result.passed ? 'Congratulations! 🎉' : 'Keep Practicing! 💪'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            {result.passed ? 'You passed the test!' : 'Review the material and try again.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
            <div style={{
              padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: getScoreColor(result.score), marginBottom: 4 }}>
                {result.score}%
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Score</div>
            </div>
            <div style={{
              padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-green)', marginBottom: 4 }}>
                {result.correctAnswers}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Correct</div>
            </div>
            <div style={{
              padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-orange)', marginBottom: 4 }}>
                {formatTime(result.timeSpent)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Time</div>
            </div>
          </div>

          <div className="progress-bar" style={{ height: 8, marginBottom: 24 }}>
            <div
              className="progress-fill"
              style={{
                width: `${result.score}%`,
                background: `linear-gradient(90deg, ${getScoreColor(result.score)}, var(--accent-cyan))`,
              }}
            />
          </div>

          <button
            onClick={() => {
              setSelectedTest(null);
              setResult(null);
              loadTests();
            }}
            className="btn btn-primary"
          >
            <ArrowLeft size={16} /> Back to Tests
          </button>
        </div>

        {result.review && result.review.length > 0 && (
          <div className="card" style={{ marginTop: 16, padding: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Review & Explanations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {result.review.map((item, idx) => (
                <div key={item.questionId} style={{ padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600 }}>Q{idx + 1}. {item.question}</div>
                    <span className={`badge ${item.isCorrect ? 'badge-green' : 'badge-red'}`}>
                      {item.isCorrect ? '✓ Correct' : '✗ Wrong'}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Your answer: <strong>{formatAnswer(item.userAnswer)}</strong>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Correct answer: <strong>{formatAnswer(item.correctAnswer)}</strong>
                  </div>
                  {item.explanation && (
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      💡 {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous Attempts */}
        {attempts.length > 0 && (
          <div className="card" style={{ marginTop: 16, padding: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Previous Attempts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {attempts.map(attempt => (
                <div key={attempt.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {new Date(attempt.createdAt).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontWeight: 700, fontSize: 14,
                      color: attempt.passed ? 'var(--accent-green)' : 'var(--accent-red)',
                    }}>
                      {attempt.score}%
                    </span>
                    <span className={`badge ${attempt.passed ? 'badge-green' : 'badge-red'}`} style={{ fontSize: 10 }}>
                      {attempt.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== TAKING TEST VIEW ==========
  if (selectedTest) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Test Header with Timer */}
        <div className="card" style={{ marginBottom: 20, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{selectedTest.title}</h2>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {answeredCount}/{totalQuestions} questions answered
              </span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              background: timeLeft < 60 ? 'rgba(255,107,107,0.15)' : 'var(--bg-secondary)',
              border: `1px solid ${timeLeft < 60 ? 'rgba(255,107,107,0.3)' : 'var(--border)'}`,
            }}>
              <Clock size={16} style={{ color: timeLeft < 60 ? 'var(--accent-red)' : 'var(--accent-orange)' }} />
              <span style={{
                fontSize: 18, fontWeight: 700,
                color: timeLeft < 60 ? 'var(--accent-red)' : 'var(--text-primary)',
              }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <div className="progress-bar" style={{ height: 4, marginTop: 12 }}>
            <div className="progress-fill" style={{
              width: `${(answeredCount / totalQuestions) * 100}%`,
            }} />
          </div>
        </div>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedTest.questions.map((question, index) => {
            const questionType = question.questionType || 'MULTIPLE_CHOICE';
            const options = parseOptions(question.options);
            const selected = answers[question.id];
            const orderAnswer = parseOrderAnswer(selected);
            const remaining = questionType === 'SENTENCE_ORDER'
              ? options.filter((opt) => !orderAnswer.includes(opt))
              : [];
            return (
              <div key={question.id} className="card" style={{
                borderColor: selected ? 'var(--border-hover)' : 'var(--border)',
              }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                    background: selected
                      ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                      : 'var(--bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: selected ? 'white' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: 14, flexShrink: 0,
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.6, paddingTop: 4 }}>
                    {question.question}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 44 }}>
                  {questionType === 'FILL_BLANK' && (
                    <input
                      className="input"
                      placeholder="Type your answer"
                      value={selected || ''}
                      onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                    />
                  )}

                  {questionType === 'SENTENCE_ORDER' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {remaining.map((opt, optIndex) => (
                          <button
                            key={optIndex}
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              const next = [...orderAnswer, opt];
                              setAnswers({ ...answers, [question.id]: JSON.stringify(next) });
                            }}
                          >
                            + {opt}
                          </button>
                        ))}
                        {remaining.length === 0 && (
                          <span className="text-sm text-muted">All parts selected</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {orderAnswer.map((opt, optIndex) => (
                          <button
                            key={`${opt}-${optIndex}`}
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              const next = orderAnswer.filter((_, i) => i !== optIndex);
                              setAnswers({ ...answers, [question.id]: JSON.stringify(next) });
                            }}
                          >
                            {optIndex + 1}. {opt} ✕
                          </button>
                        ))}
                        {orderAnswer.length === 0 && (
                          <span className="text-sm text-muted">Click parts above to build the sentence</span>
                        )}
                      </div>
                    </div>
                  )}

                  {questionType === 'MULTIPLE_CHOICE' && (
                    <>
                      {options.map((option, optIndex) => {
                        const letter = String.fromCharCode(65 + optIndex);
                        const isSelected = selected === letter;
                        return (
                          <label
                            key={optIndex}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '12px 16px', borderRadius: 'var(--radius-md)',
                              border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                              background: isSelected
                                ? 'rgba(108,92,231,0.1)'
                                : 'var(--bg-secondary)',
                              cursor: 'pointer', transition: 'all 0.2s',
                            }}
                          >
                            <div style={{
                              width: 22, height: 22, borderRadius: '50%',
                              border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              {isSelected && (
                                <div style={{
                                  width: 10, height: 10, borderRadius: '50%',
                                  background: 'var(--primary)',
                                }} />
                              )}
                            </div>
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={letter}
                              checked={isSelected}
                              onChange={e => setAnswers({ ...answers, [question.id]: e.target.value })}
                              style={{ display: 'none' }}
                            />
                            <span style={{ fontSize: 14, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                              <strong>{letter}.</strong> {option}
                            </span>
                          </label>
                        );
                      })}
                    </>
                  )}
                </div>

                {question.points > 1 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, paddingLeft: 44 }}>
                    {question.points} points
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => { setSelectedTest(null); setResult(null); }}
            className="btn btn-secondary"
          >
            <ArrowLeft size={14} /> Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount < totalQuestions}
            className="btn btn-primary btn-lg"
            style={{ opacity: isSubmitting || answeredCount < totalQuestions ? 0.5 : 1 }}
          >
            {isSubmitting ? 'Submitting...' : `Submit Test (${answeredCount}/${totalQuestions})`}
          </button>
        </div>
      </div>
    );
  }

  // ========== TEST LIST VIEW ==========
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
          animation: 'spin 1s linear infinite', margin: '0 auto 12px',
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading tests...</p>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <ClipboardCheck size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No tests available for this content</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {tests.map(test => (
        <div key={test.id} className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ClipboardCheck size={18} style={{ color: 'var(--primary-light)' }} />
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{test.title}</h3>
              </div>
              {test.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12, lineHeight: 1.6 }}>
                  {test.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span className="badge badge-primary" style={{ fontSize: 12 }}>
                  📝 {test.questions.length} questions
                </span>
                <span className="badge badge-orange" style={{ fontSize: 12 }}>
                  ⏱️ {test.timeLimit} minutes
                </span>
                <span className="badge badge-cyan" style={{ fontSize: 12 }}>
                  🎯 Pass: {test.passingScore}%
                </span>
              </div>
            </div>

            <button
              onClick={() => startTest(test)}
              className="btn btn-primary"
              style={{ marginLeft: 16, flexShrink: 0 }}
            >
              Start Test <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
