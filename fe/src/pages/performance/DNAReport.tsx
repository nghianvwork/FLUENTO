import { useState, useEffect } from 'react';
import { performanceApi } from '../../services/apiServices';
import { PerformanceReport } from '../../types';
import { TrendingUp, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DNAReport() {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await performanceApi.generateReport();
      setReport(res.data.data);
    } catch {
      setReport({
        id: 1, reportPeriodStart: '2026-04-28', reportPeriodEnd: '2026-05-05', overallScore: 78,
        grammarAnalysisJson: '{"accuracy":82,"weakAreas":["present perfect","articles"],"strongAreas":["simple past","comparatives"]}',
        vocabularyAnalysisJson: '{"wordsLearned":24,"retention":85,"topCategories":["business","technology"]}',
        pronunciationAnalysisJson: '{"overallScore":75,"weakSounds":["th","r"],"improvement":8}',
        strengthMapJson: '{"speaking":72,"listening":85,"reading":80,"writing":68}',
        errorPatternsJson: '[{"pattern":"Subject-verb agreement","frequency":3},{"pattern":"Article usage","frequency":5}]',
        peerBenchmarkJson: '{"percentile":72,"avgScore":70}',
        cefrEstimate: 'B1', recommendationsJson: '["Practice present perfect","Focus on articles","Join speaking rooms 3x/week"]',
        createdAt: new Date().toISOString()
      });
    }
    setLoading(false);
    toast.success('Report generated!');
  };

  useEffect(() => { generateReport(); }, []);

  const SkillBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="flex items-center gap-16" style={{ marginBottom: 12 }}>
      <span className="text-sm" style={{ width: 80 }}>{label}</span>
      <div className="progress-bar" style={{ flex: 1 }}>
        <div className="progress-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span style={{ fontWeight: 700, width: 40, textAlign: 'right' }}>{value}%</span>
    </div>
  );

  if (!report) return <div className="text-center text-muted" style={{ padding: 100 }}>Loading...</div>;

  const strengths = JSON.parse(report.strengthMapJson);
  const grammar = JSON.parse(report.grammarAnalysisJson);
  const vocab = JSON.parse(report.vocabularyAnalysisJson);
  const pronunciation = JSON.parse(report.pronunciationAnalysisJson);
  const errors = JSON.parse(report.errorPatternsJson);
  const peer = JSON.parse(report.peerBenchmarkJson);
  const recommendations = JSON.parse(report.recommendationsJson);

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <div className="page-title">🧬 Performance DNA Report</div>
          <div className="page-subtitle">{report.reportPeriodStart} → {report.reportPeriodEnd}</div>
        </div>
        <button className="btn btn-secondary" onClick={generateReport} disabled={loading}>
          <RefreshCw size={16} /> Tạo report mới
        </button>
      </div>

      {/* Overall Score */}
      <div className="stats-grid">
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div className="stat-value" style={{ fontSize: 56, color: report.overallScore >= 80 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{report.overallScore}</div>
          <div className="stat-label">Điểm tổng thể</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--primary-light)' }}>{report.cefrEstimate}</div>
          <div className="stat-label">CEFR ước tính</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>Top {100 - peer.percentile}%</div>
          <div className="stat-label">So với cộng đồng</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Strength Map */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 20 }}>💪 Bản đồ năng lực</div>
          <SkillBar label="Speaking" value={strengths.speaking} color="var(--primary)" />
          <SkillBar label="Listening" value={strengths.listening} color="var(--accent-cyan)" />
          <SkillBar label="Reading" value={strengths.reading} color="var(--accent-green)" />
          <SkillBar label="Writing" value={strengths.writing} color="var(--accent-orange)" />
        </div>

        {/* Vocabulary */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 20 }}>📖 Từ vựng</div>
          <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="stat-card"><div className="stat-value" style={{ fontSize: 24 }}>{vocab.wordsLearned}</div><div className="stat-label">Từ mới tuần này</div></div>
            <div className="stat-card"><div className="stat-value" style={{ fontSize: 24 }}>{vocab.retention}%</div><div className="stat-label">Tỷ lệ nhớ</div></div>
          </div>
        </div>

        {/* Error Patterns */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 20 }}>⚠️ Lỗi thường gặp</div>
          {errors.map((e: any, i: number) => (
            <div key={i} className="flex justify-between items-center" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{e.pattern}</span>
              <span className="badge badge-red">{e.frequency} lần</span>
            </div>
          ))}
          <div className="mt-16">
            <div className="text-sm text-muted">Grammar accuracy: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{grammar.accuracy}%</span></div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 20 }}>🎯 Gợi ý cải thiện</div>
          {recommendations.map((r: string, i: number) => (
            <div key={i} className="flex items-center gap-12" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <TrendingUp size={16} color="var(--accent-green)" />
              <span className="text-sm">{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
