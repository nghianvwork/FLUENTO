import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleplayApi } from '../../services/apiServices';
import { Scenario } from '../../types';
import { Search, Filter } from 'lucide-react';

const categories = ['ALL', 'INTERVIEW', 'PRESENTATION', 'MEETING', 'CUSTOMER_SERVICE', 'NEGOTIATION', 'NETWORKING', 'EMAIL', 'HEALTHCARE', 'TRAVEL', 'WORKPLACE', 'DAILY_LIFE'];
const categoryLabels: Record<string, string> = {
  ALL: 'Tất cả', INTERVIEW: '🎤 Phỏng vấn', PRESENTATION: '📊 Thuyết trình', MEETING: '🤝 Meeting',
  CUSTOMER_SERVICE: '📞 CSKH', NEGOTIATION: '💰 Đàm phán', NETWORKING: '☕ Networking',
  EMAIL: '✉️ Email', HEALTHCARE: '🏥 Y tế', TRAVEL: '✈️ Du lịch', WORKPLACE: '🏢 Công sở', DAILY_LIFE: '🏠 Đời sống'
};
const diffColors: Record<string, string> = { BEGINNER: 'badge-green', INTERMEDIATE: 'badge-orange', ADVANCED: 'badge-red' };

export default function ScenarioList() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    roleplayApi.getScenarios(filter === 'ALL' ? undefined : filter)
      .then(res => setScenarios(res.data.data))
      .catch(() => setScenarios([
        { id: 1, title: 'Job Interview - Software Engineer', description: 'Practice a technical job interview', category: 'INTERVIEW', difficulty: 'INTERMEDIATE', aiPersonality: 'PROFESSIONAL', contextPrompt: '', tags: 'interview,tech' },
        { id: 2, title: 'Client Presentation - Product Launch', description: 'Present a new product to stakeholders', category: 'PRESENTATION', difficulty: 'ADVANCED', aiPersonality: 'FRIENDLY', contextPrompt: '', tags: 'presentation,business' },
        { id: 3, title: 'Business Meeting - Project Planning', description: 'Lead a project planning meeting', category: 'MEETING', difficulty: 'INTERMEDIATE', aiPersonality: 'FRIENDLY', contextPrompt: '', tags: 'meeting,project' },
        { id: 4, title: 'Customer Complaint Handling', description: 'Handle a frustrated customer professionally', category: 'CUSTOMER_SERVICE', difficulty: 'BEGINNER', aiPersonality: 'DIFFICULT', contextPrompt: '', tags: 'customer,service' },
        { id: 5, title: 'Salary Negotiation', description: 'Negotiate salary and benefits with HR', category: 'NEGOTIATION', difficulty: 'ADVANCED', aiPersonality: 'PROFESSIONAL', contextPrompt: '', tags: 'negotiation,salary' },
        { id: 6, title: 'Coffee Chat - Networking', description: 'Informal networking at a tech conference', category: 'NETWORKING', difficulty: 'BEGINNER', aiPersonality: 'FRIENDLY', contextPrompt: '', tags: 'networking,casual' },
      ]));
  }, [filter]);

  const filtered = scenarios.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🎭 AI Roleplay Scenarios</div>
        <div className="page-subtitle">Chọn tình huống và luyện tập hội thoại với AI</div>
      </div>

      <div className="flex gap-12 mb-24" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Tìm kiếm tình huống..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>
      </div>

      <div className="flex gap-8 mb-24" style={{ flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(c)}>{categoryLabels[c] || c}</button>
        ))}
      </div>

      <div className="card-grid">
        {filtered.map(s => (
          <div key={s.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/app/roleplay/${s.id}`)}>
            <div className="flex justify-between items-center mb-16">
              <span className={`badge ${diffColors[s.difficulty] || 'badge-primary'}`}>{s.difficulty}</span>
              <span className="text-sm text-muted">{categoryLabels[s.category]}</span>
            </div>
            <div className="card-title" style={{ marginBottom: 8 }}>{s.title}</div>
            <div className="card-desc">{s.description}</div>
            <div className="mt-16">
              <button className="btn btn-sm btn-primary">Bắt đầu luyện tập →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
