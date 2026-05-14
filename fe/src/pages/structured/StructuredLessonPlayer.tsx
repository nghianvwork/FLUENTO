import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { structuredLessonApi } from '../../services/apiServices';
import { StructuredLesson } from '../../types';
import { ArrowLeft, Mic, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface LessonBlock {
  type: 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING';
  prompt: string;
  options?: string[];
  answer: string;
  audioText?: string;
}

export default function StructuredLessonPlayer() {
  const { lessonId, levelCode } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<StructuredLesson | null>(null);
  const [blocks, setBlocks] = useState<LessonBlock[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!lessonId) return;
    structuredLessonApi.getLessonDetail(Number(lessonId))
      .then(res => {
        const data = res.data.data as StructuredLesson;
        setLesson(data);
        if (data.contentJson) {
          try {
            setBlocks(JSON.parse(data.contentJson));
          } catch {
            setBlocks([]);
            toast.error('Bai hoc bi loi du lieu');
          }
        }
      })
      .catch(() => toast.error('Không tải được bài học'))
      .finally(() => setLoading(false));

    structuredLessonApi.startLesson(Number(lessonId)).catch(() => {});

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputVal(transcript);
        setIsRecording(false);
        checkAnswer(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        toast.error('Could not recognize speech. Please try again.');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [lessonId]);

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Your browser does not support Speech Recognition.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInputVal('');
      setIsCorrect(null);
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const checkAnswer = (valueToCheck: string = inputVal) => {
    const currentBlock = blocks[current];
    if (!valueToCheck && !selected) return;

    let correct = false;
    const cleanAnswer = currentBlock.answer.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

    if (currentBlock.type === 'READING') {
      correct = selected === currentBlock.answer;
    } else {
      const cleanInput = valueToCheck.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      correct = cleanInput === cleanAnswer;
    }

    setIsCorrect(correct);
    if (correct) {
      toast.success('Excellent!', { icon: '🌟' });
    } else {
      toast.error(`Expected: ${currentBlock.answer}`, { duration: 3000 });
    }
  };

  const nextQuestion = () => {
    if (current < blocks.length - 1) {
      setCurrent(current + 1);
      setSelected('');
      setInputVal('');
      setIsCorrect(null);
    } else {
      structuredLessonApi.completeLesson(Number(lessonId), 100).catch(() => {});
      toast.success('Lesson Completed! +50 XP 🏆');
      navigate(`/app/levels/${levelCode}`);
    }
  };

  if (loading) return <div className="text-center" style={{ padding: 100 }}>Loading lesson...</div>;
  if (!blocks.length) return <div className="text-center" style={{ padding: 100 }}>No lesson data available.</div>;

  const currentBlock = blocks[current];
  const progressPercent = (current / blocks.length) * 100;

  return (
    <div>
      <div className="flex items-center gap-16 mb-24">
        <button className="btn btn-ghost" onClick={() => navigate(`/app/levels/${levelCode}`)}><ArrowLeft size={20} /></button>
        <div className="progress-bar" style={{ flex: 1, height: 12 }}>
          <div className="progress-fill" style={{ width: `${progressPercent}%`, background: 'var(--accent-green)' }} />
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640, margin: '0 auto', padding: 40 }}>
        <div className="flex justify-between items-center mb-24">
          <div className="badge badge-primary">{currentBlock.type}</div>
        </div>

        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 32 }}>
          {currentBlock.prompt}
        </div>

        {currentBlock.type === 'READING' && currentBlock.options && (
          <div className="flex flex-col gap-12">
            {currentBlock.options.map((opt, i) => (
              <button
                key={i}
                className={`btn ${selected === opt ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start', padding: 16, fontSize: 16 }}
                onClick={() => setSelected(opt)}
                disabled={isCorrect !== null}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {currentBlock.type === 'LISTENING' && (
          <div className="text-center mb-24">
            <button className="btn btn-primary" style={{ padding: 24, borderRadius: '50%' }} onClick={() => speakText(currentBlock.audioText || currentBlock.answer)}>
              <Volume2 size={32} />
            </button>
            <textarea
              className="input mt-24"
              placeholder="Type what you hear..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              disabled={isCorrect !== null}
              rows={3}
            />
          </div>
        )}

        {currentBlock.type === 'WRITING' && (
          <div className="mb-24">
            <textarea
              className="input"
              placeholder="Type your answer here..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              disabled={isCorrect !== null}
              rows={3}
            />
          </div>
        )}

        {currentBlock.type === 'SPEAKING' && (
          <div className="text-center mb-24">
            <div style={{ fontSize: 24, fontStyle: 'italic', marginBottom: 32, color: 'var(--primary)' }}>
              "{currentBlock.answer}"
            </div>
            <button
              className={`btn ${isRecording ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: 24, borderRadius: '50%', animation: isRecording ? 'pulse 1.5s infinite' : 'none', background: isRecording ? 'var(--accent-red)' : '' }}
              onClick={toggleRecording}
              disabled={isCorrect !== null}
            >
              <Mic size={32} />
            </button>
            <div className="text-sm text-muted mt-16">
              {isRecording ? 'Listening...' : 'Click the mic to speak'}
            </div>
            {inputVal && (
              <div className="mt-16 text-sm">
                You said: <strong>{inputVal}</strong>
              </div>
            )}
          </div>
        )}

        <div className="mt-32 pt-24" style={{ borderTop: '1px solid var(--border)' }}>
          {isCorrect === null ? (
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => checkAnswer()}
              disabled={!selected && !inputVal && currentBlock.type !== 'SPEAKING'}
            >
              Check Answer
            </button>
          ) : (
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={nextQuestion}>
              {current < blocks.length - 1 ? 'Next' : 'Finish Lesson'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
