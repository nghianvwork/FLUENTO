import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roleplayApi, aiApi } from '../../services/apiServices';
import { ChatMessage } from '../../types';
import { Send, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoleplayChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [emotion, setEmotion] = useState<{ label: string; tone: string } | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{
      id: '0', role: 'ai', content: "Hello! I'm ready to start our roleplay session. Let's begin — please introduce yourself and tell me why you're here today.",
      timestamp: new Date()
    }]);
  }, [id]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    aiApi.emotion({ text: input, context: 'Roleplay coaching' })
      .then((res) => setEmotion({ label: res.data.data.emotion, tone: res.data.data.coachingTone }))
      .catch(() => setEmotion(null));

    try {
      const res = await roleplayApi.sendMessage({ sessionId: sessionId || undefined, scenarioId: Number(id), userMessage: input });
      const data = res.data.data;
      if (data.sessionId) setSessionId(data.sessionId);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), role: 'ai', content: data.aiResponse,
        timestamp: new Date(), errors: data.errors, tips: data.tips
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const fallbackResponses = [
        "That's a great point! Could you elaborate on your experience with that?",
        "Interesting perspective. How would you handle a more challenging scenario?",
        "Thank you for sharing. Let me ask you about your approach to teamwork.",
        "Good answer! Now let's discuss your long-term career goals.",
      ];
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), role: 'ai',
        content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        timestamp: new Date(), errors: input.length < 20 ? ['Try to provide more detailed responses.'] : [],
        tips: ['Use specific examples from your experience.']
      };
      setMessages(prev => [...prev, aiMsg]);
    }
    setLoading(false);
  };

  const completeSession = async () => {
    if (sessionId) {
      try { await roleplayApi.completeSession(sessionId); } catch {}
    }
    toast.success('Session completed! Great job! 🎉');
    navigate('/app/roleplay');
  };

  return (
    <div>
      <div className="flex items-center gap-16 mb-24">
        <button className="btn btn-ghost" onClick={() => navigate('/app/roleplay')}><ArrowLeft size={20} /></button>
        <div>
          <div className="page-title" style={{ fontSize: 20 }}>🎭 Roleplay Session</div>
          <div className="text-sm text-muted">{messages.length - 1} exchanges</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
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

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id}>
              <div className={`chat-message ${msg.role}`}>{msg.content}</div>
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
          {loading && <div className="chat-message ai" style={{ opacity: 0.6 }}>Typing...</div>}
          <div ref={messagesEnd} />
        </div>
        <div className="chat-input-area">
          <input className="chat-input" placeholder="Type your response in English..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()} />
          <button className="btn btn-primary" onClick={sendMessage} disabled={loading}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
