import { useState, useEffect } from 'react';
import { contentApi } from '../../services/apiServices';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Quiz {
  id: number;
  contentId: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer?: string;
  explanation?: string;
  userAnswered?: boolean;
  userCorrect?: boolean;
}

export default function ContentQuiz({ contentId }: { contentId: number }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    loadQuizzes();
  }, [contentId]);

  const loadQuizzes = () => {
    contentApi.getQuizzes(contentId).then(res => setQuizzes(res.data.data));
  };

  const handleSubmit = async (quizId: number) => {
    const answer = selectedAnswers[quizId];
    if (!answer) {
      toast.error('Vui lòng chọn đáp án');
      return;
    }
    try {
      const res = await contentApi.submitQuizAnswer({ quizId, answer });
      const result = res.data.data;
      setQuizzes(prev => prev.map(q => q.id === quizId ? result : q));
      if (result.userCorrect) {
        toast.success('Chính xác! 🎉');
      } else {
        toast.error('Sai rồi, thử lại nhé!');
      }
    } catch {
      toast.error('Lỗi khi gửi câu trả lời');
    }
  };

  const getOptionLabel = (opt: string) => {
    return { A: 'A', B: 'B', C: 'C', D: 'D' }[opt] || opt;
  };

  return (
    <div className="card">
      <div className="card-title mb-16">🧠 Quiz kiểm tra</div>

      {quizzes.length === 0 ? (
        <div className="text-center text-muted" style={{ padding: 24 }}>Chưa có quiz nào cho nội dung này</div>
      ) : (
        <div className="flex flex-col gap-16">
          {quizzes.map((quiz, idx) => (
            <div key={quiz.id} className="card" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="flex items-start gap-12 mb-12">
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>#{idx + 1}</div>
                <div className="flex-1">
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>{quiz.question}</div>
                  
                  <div className="flex flex-col gap-8">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const optionText = quiz[`option${opt}` as keyof Quiz] as string;
                      const isSelected = selectedAnswers[quiz.id] === opt;
                      const isCorrect = quiz.correctAnswer === opt;
                      const showResult = quiz.userAnswered;

                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-8 p-12 rounded-lg cursor-pointer transition-all ${
                            showResult
                              ? isCorrect
                                ? 'bg-green-500/20 border-2 border-green-500'
                                : isSelected
                                ? 'bg-red-500/20 border-2 border-red-500'
                                : 'bg-gray-500/10'
                              : isSelected
                              ? 'bg-primary/20 border-2 border-primary'
                              : 'bg-gray-500/10 hover:bg-gray-500/20'
                          }`}
                          style={{ border: showResult || isSelected ? undefined : '1px solid var(--border)' }}
                        >
                          <input
                            type="radio"
                            name={`quiz-${quiz.id}`}
                            value={opt}
                            checked={isSelected}
                            onChange={() => setSelectedAnswers(prev => ({ ...prev, [quiz.id]: opt }))}
                            disabled={quiz.userAnswered}
                            style={{ accentColor: 'var(--primary)' }}
                          />
                          <span className="flex-1">{getOptionLabel(opt)}. {optionText}</span>
                          {showResult && isCorrect && <CheckCircle size={18} color="green" />}
                          {showResult && isSelected && !isCorrect && <XCircle size={18} color="red" />}
                        </label>
                      );
                    })}
                  </div>

                  {quiz.userAnswered && quiz.explanation && (
                    <div className="mt-12 p-12 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>💡 Giải thích:</div>
                      <div className="text-sm text-muted">{quiz.explanation}</div>
                    </div>
                  )}

                  {!quiz.userAnswered && (
                    <button
                      className="btn btn-sm btn-primary mt-12"
                      onClick={() => handleSubmit(quiz.id)}
                    >
                      Gửi câu trả lời
                    </button>
                  )}

                  {quiz.userAnswered && (
                    <div className="mt-12 flex items-center gap-8">
                      {quiz.userCorrect ? (
                        <span className="badge badge-green">✓ Đúng</span>
                      ) : (
                        <span className="badge badge-red">✗ Sai</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
