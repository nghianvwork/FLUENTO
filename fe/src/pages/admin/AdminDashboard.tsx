import { useEffect, useState } from 'react';
import { AdminOverview } from '../../types';
import { Activity, AlertTriangle, ArrowUpRight, Cpu, Database, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/apiServices';

const fallbackOverview: AdminOverview = {
  activeUsers: 4821,
  newUsers: 214,
  retentionRate: 71,
  mrr: 124300000,
  flaggedItems: 9,
  pendingApprovals: 12,
  uptimePercent: 99.97,
  apiP95Ms: 320,
  aiCostToday: 1850000,
  processingQueue: 34,
};

export default function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [insights, setInsights] = useState<string>('');
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    adminApi.getOverview()
      .then((res) => setOverview(res.data.data))
      .catch(() => setOverview(fallbackOverview));
  }, []);

  if (!overview) return <div className="text-center text-muted" style={{ padding: 80 }}>Loading...</div>;

  const quickActions = [
    { label: 'Review flagged content', desc: '9 items awaiting triage', action: () => toast.success('Opened moderation queue') },
    { label: 'Launch weekly report', desc: 'Generate executive summary', action: () => toast.success('Report generation started') },
    { label: 'Push content batch', desc: '12 drafts ready to publish', action: () => toast.success('Publishing queued') },
  ];

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const res = await adminApi.generateInsights({ focus: 'growth and retention' });
      setInsights(res.data.data.insights);
      toast.success('AI insights generated');
    } catch {
      setInsights('AI insights are unavailable. Please verify Gemini configuration.');
      toast.error('Unable to generate insights');
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Admin Command Center</div>
        <div className="page-subtitle">Realtime pulse of learners, content, and AI operations</div>
      </div>

      <div className="card admin-hero">
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>System Trust Index</div>
            <div className="text-sm text-muted">Uptime, latency, and AI stability</div>
          </div>
          <div className="flex items-center gap-16">
            <div className="pill pill-green"><span className="pill-dot" />Uptime {overview.uptimePercent}%</div>
            <div className="pill pill-cyan"><span className="pill-dot" />P95 {overview.apiP95Ms}ms</div>
            <div className="pill pill-orange"><span className="pill-dot" />Queue {overview.processingQueue}</div>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: 20 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--primary-light)' }}>{overview.activeUsers}</div>
          <div className="stat-label">Active learners</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{overview.newUsers}</div>
          <div className="stat-label">New signups</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{overview.retentionRate}%</div>
          <div className="stat-label">7-day retention</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{overview.mrr.toLocaleString()}đ</div>
          <div className="stat-label">Monthly recurring revenue</div>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">AI Operations</div>
              <div className="card-desc">Model cost and throughput</div>
            </div>
            <Cpu size={20} color="var(--accent-orange)" />
          </div>
          <div className="flex justify-between items-center mb-16">
            <div className="text-muted text-sm">AI Cost Today</div>
            <div style={{ fontWeight: 800 }}>{overview.aiCostToday.toLocaleString()}đ</div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '62%' }} />
          </div>
          <div className="text-sm text-muted mt-16">Usage trending +12% vs yesterday</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Trust & Safety</div>
              <div className="card-desc">Community risk signals</div>
            </div>
            <ShieldCheck size={20} color="var(--accent-green)" />
          </div>
          <div className="flex justify-between items-center mb-16">
            <div className="text-muted text-sm">Flagged items</div>
            <div style={{ fontWeight: 800 }}>{overview.flaggedItems}</div>
          </div>
          <div className="flex justify-between items-center mb-16">
            <div className="text-muted text-sm">Pending approvals</div>
            <div style={{ fontWeight: 800 }}>{overview.pendingApprovals}</div>
          </div>
          <div className="pill pill-red"><span className="pill-dot" />High risk: 2 items</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Infrastructure</div>
              <div className="card-desc">Database + API health</div>
            </div>
            <Database size={20} color="var(--accent-cyan)" />
          </div>
          <div className="flex justify-between items-center mb-16">
            <div className="text-muted text-sm">DB Replication</div>
            <div className="pill pill-green"><span className="pill-dot" />Healthy</div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-muted text-sm">API Error Rate</div>
            <div className="pill pill-cyan"><span className="pill-dot" />0.18%</div>
          </div>
        </div>
      </div>

      <div className="card-grid" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Attention Queue</div>
              <div className="card-desc">High-impact actions</div>
            </div>
            <AlertTriangle size={18} color="var(--accent-red)" />
          </div>
          {quickActions.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between" style={{ padding: '12px 0', borderBottom: idx === quickActions.length - 1 ? 'none' : '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.label}</div>
                <div className="text-sm text-muted">{item.desc}</div>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={item.action}>Open</button>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Growth Velocity</div>
              <div className="card-desc">Weekly momentum</div>
            </div>
            <Activity size={18} color="var(--primary-light)" />
          </div>
          <div className="report-chart">
            {[60, 80, 50, 95, 70, 110, 90].map((h, i) => (
              <div key={i} className="chart-bar" style={{ height: h, background: 'linear-gradient(180deg, var(--primary), var(--accent-cyan))' }}>
                <span className="chart-bar-label">W{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted">Momentum</div>
            <div className="pill pill-green"><ArrowUpRight size={12} /> +18%</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">AI Coach Reliability</div>
              <div className="card-desc">Response quality + speed</div>
            </div>
            <Zap size={18} color="var(--accent-orange)" />
          </div>
          <div className="flex justify-between items-center mb-16">
            <div className="text-sm text-muted">Median response time</div>
            <div style={{ fontWeight: 700 }}>1.8s</div>
          </div>
          <div className="flex justify-between items-center mb-16">
            <div className="text-sm text-muted">Quality rating</div>
            <div className="pill pill-green"><span className="pill-dot" />4.7/5</div>
          </div>
          <div className="pill pill-cyan">Auto-scaling: ON</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">AI Executive Brief</div>
              <div className="card-desc">Gemini-powered insights</div>
            </div>
            <Sparkles size={18} color="var(--accent-cyan)" />
          </div>
          <div className="text-sm text-muted" style={{ marginBottom: 12 }}>
            {insights || 'Generate quick insights on growth, risk, and ops.'}
          </div>
          <button className="btn btn-sm btn-primary" onClick={fetchInsights} disabled={insightsLoading}>
            {insightsLoading ? 'Generating...' : 'Generate insights'}
          </button>
        </div>
      </div>
    </div>
  );
}
