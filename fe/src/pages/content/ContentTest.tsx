import { useState, useEffect } from 'react';
import { ClipboardCheck, Clock, Award, ChevronRight } from 'lucide-react';

interface TestQuestion {
  id: number;
  question: string;
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

  useEffect(() => {
    loadTests();
  }, [contentId]);

  useEffect(() => {
    if (selectedTest && timeLeft > 0) {
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
  }, [selectedTest, timeLeft]);

  const loadTests = async () => {
    try {
      const response = await fetch(`/api/content/${contentId}/tests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setTests(data.data);
    } catch (error) {
      console.error('Failed to load tests:', error);
    }
  };

  const startTest = async (test: Test) => {
    setSelectedTest(test);
    setAnswers({});
    setResult(null);
    setTimeLeft(test.timeLimit * 60);
    setStartTime(Date.now());
    
    try {
      const response = await fetch(`/api/content/tests/${test.id}/attempts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) setAttempts(data.data);
    } catch (error) {
      console.error('Failed to load attempts:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTest || isSubmitting) return;
    
    setIsSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      const response = await fetch(`/api/content/tests/${selectedTest.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answers, timeSpent })
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        setTimeLeft(0);
      }
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setIsSubmitting(false);
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
            result.passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Award className={`w-10 h-10 ${result.passed ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {result.passed ? 'You passed the test!' : 'You need more practice.'}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{result.score}%</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{result.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-gray-600">{formatTime(result.timeSpent)}</div>
              <div className="text-sm text-gray-600">Time</div>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedTest(null);
              setResult(null);
              loadTests();
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Tests
          </button>
        </div>

        {attempts.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Previous Attempts</h3>
            <div className="space-y-2">
              {attempts.map((attempt) => (
                <div key={attempt.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">
                    {new Date(attempt.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`font-semibold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {attempt.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (selectedTest) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{selectedTest.title}</h2>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="w-5 h-5" />
              <span className={timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {selectedTest.questions.map((question, index) => {
              const options = parseOptions(question.options);
              return (
                <div key={question.id} className="border-b pb-6">
                  <div className="font-semibold mb-3">
                    {index + 1}. {question.question}
                  </div>
                  <div className="space-y-2">
                    {options.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={String.fromCharCode(65 + optIndex)}
                          checked={answers[question.id] === String.fromCharCode(65 + optIndex)}
                          onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                          className="w-4 h-4"
                        />
                        <span>{String.fromCharCode(65 + optIndex)}. {option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(answers).length < selectedTest.questions.length}
            className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {tests.map((test) => (
        <div key={test.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold">{test.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{test.description}</p>
              
              <div className="flex gap-4 text-sm text-gray-600">
                <span>📝 {test.questions.length} questions</span>
                <span>⏱️ {test.timeLimit} minutes</span>
                <span>🎯 Pass: {test.passingScore}%</span>
              </div>
            </div>
            
            <button
              onClick={() => startTest(test)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Test
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
