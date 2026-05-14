import { useState, useRef, useEffect, useCallback } from 'react';
import { aiApi } from '../../services/apiServices';
import { ChatMessage } from '../../types';
import { Send, Mic, Square, Volume2, Sparkles, Trash2, Languages, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

const TONES = [
  { id: 'friendly', label: 'Thân thiện', icon: '😊' },
  { id: 'professional', label: 'Chuyên nghiệp', icon: '💼' },
  { id: 'academic', label: 'Học thuật', icon: '🎓' },
  { id: 'casual', label: 'Bình dân', icon: '👋' },
];

export default function AiChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState('friendly');
  const messagesEnd = useRef<HTMLDivElement>(null);

  const { speak, stop: stopSpeaking, isSpeaking, isSupported: isTtsSupported } = useSpeechSynthesis();

  const handleSpeechResult = useCallback((text: string) => {
    setInput(prev => prev ? `${prev} ${text}` : text);
  }, []);

  const { isListening, toggleListening, stopListening, transcript, isSupported: isSttSupported } = useSpeechRecognition(handleSpeechResult);

  useEffect(() => {
    const saved = localStorage.getItem('enova_ai_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch {
        localStorage.removeItem('enova_ai_chat_history');
      }
    } else {
      setMessages([{
        id: '0',
        role: 'ai',
        content: "Chào bạn! Tôi là trợ lý tiếng Anh AI của bạn. Bạn muốn trò chuyện về chủ đề gì hôm nay? Tôi có thể giúp bạn sửa lỗi ngữ pháp, luyện giao tiếp hoặc giải thích từ vựng.",
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('enova_ai_chat_history', JSON.stringify(messages));
    }
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript]);

  const sendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || loading) return;

    if (isListening) stopListening();
    if (isSpeaking) stopSpeaking();

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.chat({
        message: textToSend,
        context: 'General English conversation partner and tutor.',
        tone: tone
      });
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: res.data.data.reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
      speak(aiMsg.content);
    } catch (err: any) {
      toast.error('AI đang bận, vui lòng thử lại sau.');
    }
    setLoading(false);
  };

  const clearChat = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?')) {
      setMessages([{
        id: '0',
        role: 'ai',
        content: "Chào bạn! Tôi đã sẵn sàng cho một cuộc trò chuyện mới.",
        timestamp: new Date()
      }]);
      localStorage.removeItem('enova_ai_chat_history');
      stopSpeaking();
    }
  };

  const displayValue = isListening ? (input ? `${input} ${transcript}` : transcript) : input;

  return (
    <div className="ai-chatbot-page">
      <div className="page-header flex justify-between items-center">
        <div>
          <div className="page-title flex items-center gap-12">
            <Sparkles className="text-accent-orange" /> AI Conversation Partner
          </div>
          <div className="page-subtitle">Trò chuyện tự do với AI để nâng cao phản xạ tiếng Anh</div>
        </div>
        <button className="btn btn-ghost text-danger" onClick={clearChat} title="Xóa lịch sử">
          <Trash2 size={20} />
        </button>
      </div>

      <div className="chatbot-layout">
        {/* Sidebar: Settings/Tones */}
        <div className="chatbot-sidebar">
          <div className="card">
            <div className="section-title flex items-center gap-8 mb-16" style={{ fontSize: 14 }}>
              <Languages size={16} /> Phong cách trò chuyện
            </div>
            <div className="tone-grid">
              {TONES.map(t => (
                <button
                  key={t.id}
                  className={`tone-card ${tone === t.id ? 'active' : ''}`}
                  onClick={() => setTone(t.id)}
                >
                  <span className="tone-icon">{t.icon}</span>
                  <span className="tone-label">{t.label}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-24">
              <div className="section-title flex items-center gap-8 mb-12" style={{ fontSize: 14 }}>
                <MessageSquare size={16} /> Gợi ý chủ đề
              </div>
              <div className="flex flex-col gap-8">
                {["Luyện phỏng vấn", "Kể về một ngày của bạn", "Sửa lỗi ngữ pháp", "Học từ vựng mới"].map(topic => (
                  <button 
                    key={topic} 
                    className="btn btn-sm btn-secondary" 
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => setInput(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main: Chat Area */}
        <div className="chatbot-main">
          <div className="chat-window">
            <div className="chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-message-wrapper ${msg.role} animate-in`}>
                  <div className={`chat-bubble ${msg.role}`}>
                    {msg.content}
                    {msg.role === 'ai' && isTtsSupported && (
                      <button 
                        className="btn-speak"
                        onClick={() => speak(msg.content)}
                        title="Nghe lại"
                      >
                        <Volume2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="chat-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="chat-message-wrapper ai">
                  <div className="chat-bubble ai thinking">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            <div className="chat-input-container">
              {isListening && (
                <div className="listening-indicator">
                  <div className="pulse-dot" /> AI đang lắng nghe...
                </div>
              )}
              
              <div className="flex gap-12 items-center">
                {isSttSupported && (
                  <button 
                    className={`voice-btn ${isListening ? 'active' : ''}`}
                    onClick={toggleListening}
                  >
                    {isListening ? <Square size={20} /> : <Mic size={20} />}
                  </button>
                )}

                <input 
                  className="chat-input-field" 
                  placeholder={isListening ? "Hãy nói điều gì đó..." : "Nhập tin nhắn..."}
                  value={displayValue} 
                  onChange={e => !isListening && setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const text = displayValue;
                      if (isListening) stopListening();
                      sendMessage(text);
                    }
                  }} 
                />
                
                <button 
                  className="send-btn" 
                  onClick={() => {
                    const text = displayValue;
                    if (isListening) stopListening();
                    sendMessage(text);
                  }} 
                  disabled={loading || !displayValue.trim()}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ai-chatbot-page {
          height: calc(100vh - 120px);
          display: flex;
          flex-direction: column;
        }
        .chatbot-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          flex: 1;
          margin-top: 24px;
          min-height: 0;
        }
        .chatbot-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .chatbot-main {
          background: var(--bg-secondary);
          border-radius: 20px;
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .chat-window {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .chat-message-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }
        .chat-message-wrapper.user {
          align-self: flex-end;
        }
        .chat-message-wrapper.ai {
          align-self: flex-start;
        }
        .chat-bubble {
          padding: 14px 20px;
          border-radius: 20px;
          font-size: 15px;
          line-height: 1.6;
          position: relative;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .chat-bubble.user {
          background: linear-gradient(135deg, var(--primary), var(--primary-light));
          color: white;
          border-bottom-right-radius: 4px;
        }
        .chat-bubble.ai {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
          border: 1px solid var(--border);
        }
        .chat-bubble.thinking {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 10px 18px;
        }
        .animate-in {
          animation: slideIn 0.3s ease-out forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .chat-input-container {
          padding: 24px;
          background: var(--bg-tertiary);
          border-top: 1px solid var(--border);
          position: relative;
        }
        .chat-input-field {
          flex: 1;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 16px;
          color: var(--text-primary);
          outline: none;
          transition: all 0.2s;
        }
        .chat-input-field:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
        }
        
        .voice-btn {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: none;
          background: var(--bg-secondary);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid var(--border);
        }
        .voice-btn.active {
          background: var(--accent-orange);
          color: white;
          animation: pulse 1.5s infinite;
        }
        .send-btn {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          border: none;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        
        .tone-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .tone-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s;
        }
        .tone-card:hover {
          background: var(--bg-tertiary);
        }
        .tone-card.active {
          border-color: var(--primary);
          background: rgba(108, 92, 231, 0.05);
        }
        .tone-icon { font-size: 20px; }
        .tone-label { font-size: 12px; font-weight: 500; }
        
        .btn-speak {
          position: absolute;
          right: -32px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .chat-bubble.ai:hover .btn-speak {
          opacity: 1;
        }
        
        .listening-indicator {
          position: absolute;
          top: -32px;
          left: 24px;
          font-size: 12px;
          color: var(--accent-orange);
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-tertiary);
          padding: 4px 12px;
          border-radius: 10px 10px 0 0;
          border: 1px solid var(--border);
          border-bottom: none;
        }
        .pulse-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-orange);
          border-radius: 50%;
          animation: blink 1s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 126, 95, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255, 126, 95, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 126, 95, 0); }
        }
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        
        .thinking span {
          animation: think 1.4s infinite both;
          font-size: 24px;
          line-height: 0;
        }
        .thinking span:nth-child(2) { animation-delay: 0.2s; }
        .thinking span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes think {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
