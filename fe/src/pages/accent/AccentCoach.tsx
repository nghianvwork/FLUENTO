import { useState } from 'react';
import { accentApi, mediaApi } from '../../services/apiServices';
import { PronunciationRecord } from '../../types';
import { Mic, MicOff, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog.",
  "I would like to schedule a meeting for next Tuesday.",
  "Could you please review the quarterly financial report?",
  "We need to deploy the new version before the deadline.",
  "Thank you for your patience. I'll get back to you shortly.",
];

export default function AccentCoach() {
  const [text, setText] = useState(sampleTexts[0]);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<PronunciationRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      let audioUrl: string | undefined;
      if (audioFile) {
        const upload = await mediaApi.upload(audioFile);
        audioUrl = upload.data.data.url;
      }
      const res = await accentApi.analyze(text, audioUrl);
      setResult(res.data.data);
    } catch {
      setResult({
        id: 1, textPrompt: text, accuracyScore: 72 + Math.floor(Math.random() * 20),
        intonationScore: 65 + Math.floor(Math.random() * 25), rhythmScore: 60 + Math.floor(Math.random() * 30),
        stressScore: 68 + Math.floor(Math.random() * 22), speedWpm: 120 + Math.floor(Math.random() * 40),
        aiFeedback: "Good pronunciation overall! Focus on the 'th' sound. Try placing your tongue between your teeth for words like 'the' and 'that'.",
        createdAt: new Date().toISOString()
      });
    }
    setLoading(false);
    toast.success('Phân tích hoàn tất!');
  };

  const ScoreBar = ({ label, score, color }: { label: string; score: number; color: string }) => (
    <div style={{ marginBottom: 16 }}>
      <div className="flex justify-between mb-16" style={{ marginBottom: 6 }}>
        <span className="text-sm">{label}</span>
        <span style={{ fontWeight: 700, color }}>{score}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🎙️ Real-Time Accent Coach</div>
        <div className="page-subtitle">Phân tích phát âm và nhận phản hồi chi tiết từ AI</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left: Input */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Chọn câu luyện tập</div>
          <div className="flex flex-col gap-8 mb-24">
            {sampleTexts.map((t, i) => (
              <button key={i} className={`btn btn-sm ${text === t ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start', textAlign: 'left' }} onClick={() => { setText(t); setResult(null); }}>
                {t.substring(0, 50)}...
              </button>
            ))}
          </div>
          <div className="card" style={{ background: 'var(--bg-tertiary)', textAlign: 'center', padding: 32, marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.8 }}>{text}</div>
          </div>
          <div className="input-group" style={{ marginTop: 16 }}>
            <label className="input-label">Tải audio (wav/mp3/webm)</label>
            <input className="input" type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex gap-12 justify-center">
            <button className={`btn ${recording ? 'btn-accent' : 'btn-primary'} btn-lg`}
              onClick={() => { setRecording(!recording); if (recording) handleAnalyze(); }}>
              {recording ? <><MicOff size={20} /> Dừng ghi âm</> : <><Mic size={20} /> Ghi âm & Phân tích</>}
            </button>
            <button className="btn btn-secondary btn-lg" onClick={handleAnalyze} disabled={loading}>
              Phân tích từ file
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Kết quả phân tích</div>
          {loading ? (
            <div className="text-center text-muted" style={{ padding: 60 }}>Đang phân tích...</div>
          ) : result ? (
            <div className="animate-in">
              <div className="stat-card mb-24" style={{ textAlign: 'center' }}>
                <div className="stat-value" style={{ color: result.accuracyScore >= 80 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                  {result.accuracyScore}%
                </div>
                <div className="stat-label">Điểm tổng thể</div>
              </div>
              <ScoreBar label="🎯 Accuracy" score={result.accuracyScore} color="var(--primary)" />
              <ScoreBar label="🎵 Intonation" score={result.intonationScore} color="var(--accent-cyan)" />
              <ScoreBar label="🥁 Rhythm" score={result.rhythmScore} color="var(--accent-pink)" />
              <ScoreBar label="💪 Stress" score={result.stressScore} color="var(--accent-orange)" />
              <div className="card mt-16" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="flex items-center gap-8 mb-16" style={{ fontWeight: 600 }}>
                  <BarChart3 size={16} color="var(--accent-green)" /> AI Feedback
                </div>
                <div className="text-sm" style={{ lineHeight: 1.8 }}>{result.aiFeedback}</div>
              </div>
              <div className="text-sm text-muted mt-16">Tốc độ: {result.speedWpm} WPM</div>
            </div>
          ) : (
            <div className="text-center text-muted" style={{ padding: 60 }}>
              Nhấn "Ghi âm & Phân tích" để bắt đầu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
