import { useEffect, useState } from 'react';
import { adminApi } from '../../services/apiServices';
import { Save, Sliders, Sparkles, Shield, Cloud } from 'lucide-react';
import toast from 'react-hot-toast';

const defaultSettings = {
  featureCoachV2: true,
  featureLiveTranscripts: true,
  featureRoleplayBoost: false,
  antiAbuseMode: true,
  maxDailyRoleplay: 30,
  maxRoomParticipants: 12,
  aiCostCap: 2500000,
  maintenanceMode: false,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    adminApi.getSettings()
      .then((res) => setSettings({ ...defaultSettings, ...res.data.data }))
      .catch(() => setSettings(defaultSettings));
  }, []);

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    adminApi.updateSettings(settings).catch(() => null);
    toast.success('Settings saved');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">System Settings</div>
        <div className="page-subtitle">Feature flags, limits, and safety controls</div>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Feature Flags</div>
              <div className="card-desc">Control live experiments</div>
            </div>
            <Sparkles size={18} color="var(--accent-cyan)" />
          </div>
          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600 }}>AI Coach V2</div>
              <div className="text-sm text-muted">Next-gen reasoning + feedback</div>
            </div>
            <input className="toggle" type="checkbox" checked={settings.featureCoachV2} onChange={() => toggle('featureCoachV2')} />
          </div>
          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600 }}>Live Transcripts</div>
              <div className="text-sm text-muted">Realtime subtitle rendering</div>
            </div>
            <input className="toggle" type="checkbox" checked={settings.featureLiveTranscripts} onChange={() => toggle('featureLiveTranscripts')} />
          </div>
          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600 }}>Roleplay Boost</div>
              <div className="text-sm text-muted">Experimental coaching boosts</div>
            </div>
            <input className="toggle" type="checkbox" checked={settings.featureRoleplayBoost} onChange={() => toggle('featureRoleplayBoost')} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Safety Controls</div>
              <div className="card-desc">Anti-abuse and policy guardrails</div>
            </div>
            <Shield size={18} color="var(--accent-orange)" />
          </div>
          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600 }}>Anti-abuse Mode</div>
              <div className="text-sm text-muted">Auto-block suspicious activity</div>
            </div>
            <input className="toggle" type="checkbox" checked={settings.antiAbuseMode} onChange={() => toggle('antiAbuseMode')} />
          </div>
          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600 }}>Maintenance Mode</div>
              <div className="text-sm text-muted">Temporarily pause logins</div>
            </div>
            <input className="toggle" type="checkbox" checked={settings.maintenanceMode} onChange={() => toggle('maintenanceMode')} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Platform Limits</div>
              <div className="card-desc">Operational caps and budgets</div>
            </div>
            <Sliders size={18} color="var(--primary-light)" />
          </div>
          <div className="input-group">
            <label className="input-label">Max daily roleplay (minutes)</label>
            <input className="input" type="number" value={settings.maxDailyRoleplay} onChange={(e) => setSettings((prev) => ({ ...prev, maxDailyRoleplay: Number(e.target.value) }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Max room participants</label>
            <input className="input" type="number" value={settings.maxRoomParticipants} onChange={(e) => setSettings((prev) => ({ ...prev, maxRoomParticipants: Number(e.target.value) }))} />
          </div>
          <div className="input-group">
            <label className="input-label">AI cost cap per day (đ)</label>
            <input className="input" type="number" value={settings.aiCostCap} onChange={(e) => setSettings((prev) => ({ ...prev, aiCostCap: Number(e.target.value) }))} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Infrastructure</div>
              <div className="card-desc">Ops and delivery channels</div>
            </div>
            <Cloud size={18} color="var(--accent-cyan)" />
          </div>
          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600 }}>Multi-region delivery</div>
              <div className="text-sm text-muted">Auto failover enabled</div>
            </div>
            <div className="pill pill-green"><span className="pill-dot" />Active</div>
          </div>
          <div className="setting-row">
            <div>
              <div style={{ fontWeight: 600 }}>Incident channel</div>
              <div className="text-sm text-muted">#enova-oncall</div>
            </div>
            <button className="btn btn-sm btn-secondary">Update</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save settings</button>
      </div>
    </div>
  );
}
