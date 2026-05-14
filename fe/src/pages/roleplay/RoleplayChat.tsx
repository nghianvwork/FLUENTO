import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roleplayApi, aiApi } from '../../services/apiServices';
import { ChatMessage } from '../../types';
import { Send, ArrowLeft, CheckCircle, AlertCircle, Mic, Square, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

export default function RoleplayChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [emotion, setEmotion] = useState<{ label: string; tone: string } | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const { speak, stop: stopSpeaking, isSpeaking, isSupported: isTtsSupported } = useSpeechSynthesis();

  const handleSpeechResult = useCallback((text: string) => {
    // Append to existing input, or replace if we prefer. Replacing is cleaner for Click-to-Talk.
    setInput(prev => {
      const newText = prev ? `${prev} ${text}` : text;
      return newText;
    });
  }, []);

  const { isListening, toggleListening, stopListening, transcript, isSupported: isSttSupported } = useSpeechRecognition(handleSpeechResult);

  useEffect(() => {
    const initialMsg = "Hello! I'm ready to start our roleplay session. Let's begin — please introduce yourself and tell me why you're here today.";
    setMessages([{ id: '0', role: 'ai', content: initialMsg, timestamp: new Date() }]);
    
    // Auto-speak first message if TTS supported
    const timer = setTimeout(() => {
      speak(initialMsg);
    }, 1000);
    return () => clearTimeout(timer);
  }, [id, speak]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, transcript]);

  const sendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || loading) return;
    
    if (isListening) stopListening();
    if (isSpeaking) stopSpeaking();

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    aiApi.emotion({ text: textToSend, context: 'Roleplay coaching' })
      .then((res) => setEmotion({ label: res.data.data.emotion, tone: res.data.data.coachingTone }))
      .catch(() => setEmotion(null));

    try {
      const res = await roleplayApi.sendMessage({ sessionId: sessionId || undefined, scenarioId: Number(id), userMessage: textToSend });
      const data = res.data.data;
      if (data.sessionId) setSessionId(data.sessionId);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), role: 'ai', content: data.aiResponse,
        timestamp: new Date(), errors: data.errors, tips: data.tips
      };
      setMessages(prev => [...prev, aiMsg]);
      
      // Auto-speak AI response
      speak(data.aiResponse);

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể gửi tin nhắn');
    }
    setLoading(false);
  };

  const completeSession = async () => {
    stopSpeaking();
    stopListening();
    if (sessionId) {
      try { await roleplayApi.completeSession(sessionId); } catch {}
    }
    toast.success('Session completed! Great job! 🎉');
    navigate('/app/roleplay');
  };

  // Combine typed input with live transcript
  const displayValue = isListening ? (input ? `${input} ${transcript}` : transcript) : input;

  return (
    <div>
      <div className="flex items-center gap-16 mb-24">
        <button className="btn btn-ghost" onClick={() => navigate('/app/roleplay')}><ArrowLeft size={20} /></button>
        <div>
          <div className="page-title" style={{ fontSize: 20 }}>🎭 Roleplay Session</div>
          <div className="text-sm text-muted">{messages.length - 1} exchanges</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          {isSpeaking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-cyan)', fontSize: 13, background: 'rgba(0,206,209,0.1)', padding: '6px 12px', borderRadius: 20 }}>
              <Volume2 size={16} className="pulse-anim" /> AI is speaking...
            </div>
          )}
          <button className="btn btn-sm btn-accent" onClick={completeSession}>
            <CheckCircle size={16} /> Kết thúc session
          </button>
        </div>
      </div>
      
      {emotion && (
        <div className="pill pill-cyan" style={{ marginBottom: 16 }}>
          Emotion: {emotion.label} · Tone: {emotion.tone}
        </div>
      )}

      <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <div key={msg.id}>
              <div className={`chat-message ${msg.role}`} style={{ position: 'relative' }}>
                {msg.content}
                {msg.role === 'ai' && isTtsSupported && (
                  <button 
                    onClick={() => speak(msg.content)}
                    style={{ position: 'absolute', right: -30, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                    title="Phát lại audio"
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>
              {msg.errors && msg.errors.length > 0 && (
                <div style={{ maxWidth: '75%', padding: '8px 12px', fontSize: 12, color: 'var(--accent-orange)', marginTop: 4 }}>
                  {msg.errors.map((e, i) => <div key={i} className="flex items-center gap-8"><AlertCircle size={12} /> {e}</div>)}
                </div>
              )}
              {msg.tips && msg.tips.length > 0 && (
                <div style={{ maxWidth: '75%', padding: '8px 12px', fontSize: 12, color: 'var(--accent-green)', marginTop: 4 }}>
                  {msg.tips.map((t, i) => <div key={i}>💡 {t}</div>)}
                </div>
              )}
            </div>
          ))}
          {loading && <div className="chat-message ai" style={{ opacity: 0.6 }}>Thinking...</div>}
          <div ref={messagesEnd} />
        </div>

        <div className="chat-input-area" style={{ position: 'relative', marginTop: 16 }}>
          {isListening && (
            <div style={{ position: 'absolute', top: -36, left: 24, fontSize: 13, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '12px 12px 0 0', border: '1px solid var(--border)', borderBottom: 'none' }}>
              <div className="recording-dot" /> Đang nghe...
            </div>
          )}
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: '100%' }}>
            {isSttSupported && (
              <button 
                className={`btn ${isListening ? 'btn-danger' : 'btn-secondary'}`}
                onClick={toggleListening}
                style={{ 
                  width: 48, height: 48, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: isListening ? '0 0 0 4px rgba(255,107,107,0.2)' : 'none',
                  transition: 'all 0.2s'
                }}
                title={isListening ? "Dừng ghi âm" : "Bắt đầu nói"}
              >
                {isListening ? <Square size={20} /> : <Mic size={20} />}
              </button>
            )}

            <input 
              className="chat-input" 
              placeholder={isListening ? "Cứ nói đi, tôi đang nghe..." : "Gõ câu trả lời hoặc bấm Mic để nói..."}
              value={displayValue} 
              onChange={e => {
                if (!isListening) setInput(e.target.value);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const text = displayValue;
                  if (isListening) stopListening();
                  setInput('');
                  sendMessage(text);
                }
              }} 
              style={{ 
                flex: 1, 
                border: isListening ? '1px solid var(--accent-green)' : '1px solid var(--border)',
                background: isListening ? 'rgba(0,184,148,0.05)' : 'var(--bg-secondary)',
                transition: 'all 0.3s'
              }}
            />
            
            <button className="btn btn-primary" 
              onClick={() => {
                const text = displayValue;
                if (isListening) stopListening();
                setInput('');
                sendMessage(text);
              }} 
              disabled={loading || !displayValue.trim()}
              style={{ width: 48, height: 48, borderRadius: 12, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .pulse-anim { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.5; } }
        .recording-dot { width: 8px; height: 8px; background: var(--accent-green); border-radius: 50%; animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}
