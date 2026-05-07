import { useEffect, useState } from 'react';
import { adminApi } from '../../services/apiServices';
import { AdminReportItem } from '../../types';
import { Download, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const fallbackReports: AdminReportItem[] = [
  { id: 1, title: 'Weekly Growth Snapshot', period: 'Apr 28 - May 4', status: 'READY', generatedAt: '1h ago' },
  { id: 2, title: 'AI Coach Quality Review', period: 'Apr 21 - Apr 27', status: 'READY', generatedAt: '3d ago' },
  { id: 3, title: 'Retention Cohort Report', period: 'Apr 1 - Apr 30', status: 'GENERATING', generatedAt: 'Just now' },
];

export default function AdminReports() {
  const [reports, setReports] = useState<AdminReportItem[]>([]);

  useEffect(() => {
    adminApi.getReports()
      .then((res) => setReports(res.data.data))
      .catch(() => setReports(fallbackReports));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Analytics & Reports</div>
        <div className="page-subtitle">Business intelligence for growth, learning, and AI quality</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--primary-light)' }}>+22%</div>
          <div className="stat-label">Weekly active users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>4.7</div>
          <div className="stat-label">AI coach rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>71%</div>
          <div className="stat-label">Lesson completion</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>18%</div>
          <div className="stat-label">Upgrade conversion</div>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Growth Signals</div>
              <div className="card-desc">Acquisition + activation</div>
            </div>
            <TrendingUp size={18} color="var(--accent-green)" />
          </div>
          <div className="report-chart">
            {[30, 60, 40, 90, 70, 110, 80].map((h, i) => (
              <div key={i} className="chart-bar" style={{ height: h, background: 'linear-gradient(180deg, var(--accent-green), var(--accent-cyan))' }}>
                <span className="chart-bar-label">D{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="pill pill-green"><span className="pill-dot" />Activation +12%</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Learning Quality</div>
              <div className="card-desc">Engagement + mastery</div>
            </div>
            <Activity size={18} color="var(--primary-light)" />
          </div>
          <div className="report-chart">
            {[70, 75, 68, 82, 90, 88, 92].map((h, i) => (
              <div key={i} className="chart-bar" style={{ height: h, background: 'linear-gradient(180deg, var(--primary), var(--primary-light))' }}>
                <span className="chart-bar-label">W{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="pill pill-cyan"><span className="pill-dot" />Mastery +8%</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Health</div>
              <div className="card-desc">MRR + churn</div>
            </div>
            <BarChart3 size={18} color="var(--accent-orange)" />
          </div>
          <div className="report-chart">
            {[80, 90, 86, 95, 100, 108, 115].map((h, i) => (
              <div key={i} className="chart-bar" style={{ height: h, background: 'linear-gradient(180deg, var(--accent-orange), var(--accent-pink))' }}>
                <span className="chart-bar-label">M{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="pill pill-orange"><span className="pill-dot" />Churn 2.4%</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Exportable Reports</div>
            <div className="card-desc">Generate and share with leadership</div>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => toast.success('Generating new report')}>Generate</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Period</th>
                <th>Status</th>
                <th>Generated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td>{r.period}</td>
                  <td><span className={`pill ${r.status === 'READY' ? 'pill-green' : 'pill-orange'}`}>{r.status}</span></td>
                  <td>{r.generatedAt}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => toast.success('Download started')}>
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
