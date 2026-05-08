import { useEffect, useMemo, useState } from 'react';
import { adminApi, contentApi } from '../../services/apiServices';
import { AdminContentItem } from '../../types';
import { Archive, Filter, Plus, Pencil, Trash2, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

interface TestQuestion {
  id?: number;
  question: string;
  options: string;
  correctAnswer: string;
  explanation: string;
  points: number;
  orderIndex: number;
}

interface ContentTest {
  id: number;
  contentId: number;
  title: string;
  description: string;
  type: string;
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
  questions?: TestQuestion[];
}

export default function AdminTests() {
  const [tests, setTests] = useState<ContentTest[]>([]);
  const [contents, setContents] = useState<AdminContentItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContentTest | null>(null);
  const [editTarget, setEditTarget] = useState<ContentTest | null>(null);
  
  const [form, setForm] = useState<Partial<ContentTest>>({
    title: '',
    description: '',
    type: 'MULTIPLE_CHOICE',
    timeLimit: 30,
    passingScore: 70,
    isActive: true,
    questions: [],
    contentId: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [testsRes, contentsRes] = await Promise.all([
        adminApi.getTests(),
        adminApi.getContent()
      ]);
      setTests(testsRes.data.data || []);
      setContents(contentsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load tests', error);
      toast.error('Failed to load test data');
    }
  };

  const openCreate = () => {
    setForm({
      title: '',
      description: '',
      type: 'MULTIPLE_CHOICE',
      timeLimit: 30,
      passingScore: 70,
      isActive: true,
      questions: [],
      contentId: contents.length > 0 ? contents[0].id : 0,
    });
    setIsCreateOpen(true);
  };

  const openEdit = (test: ContentTest) => {
    setEditTarget(test);
    setForm({
      ...test,
    });
    setIsEditOpen(true);
  };

  const handleAddQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [
        ...(prev.questions || []),
        {
          question: '',
          options: '{"A":"", "B":"", "C":"", "D":""}',
          correctAnswer: 'A',
          explanation: '',
          points: 1,
          orderIndex: (prev.questions?.length || 0),
        }
      ]
    }));
  };

  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    setForm(prev => {
      const qs = [...(prev.questions || [])];
      qs[index] = { ...qs[index], [field]: value };
      return { ...prev, questions: qs };
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setForm(prev => {
      const qs = [...(prev.questions || [])];
      qs.splice(index, 1);
      return { ...prev, questions: qs };
    });
  };

  const handleCreate = async () => {
    if (!form.title || !form.contentId) return toast.error('Title and Content are required');
    try {
      const res = await adminApi.createTest(form);
      setTests(prev => [res.data.data, ...prev]);
      setIsCreateOpen(false);
      toast.success('Test created successfully');
    } catch (e) {
      toast.error('Failed to create test');
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    try {
      const res = await adminApi.updateTest(editTarget.id, form);
      setTests(prev => prev.map(t => t.id === editTarget.id ? res.data.data : t));
      setIsEditOpen(false);
      setEditTarget(null);
      toast.success('Test updated successfully');
    } catch (e) {
      toast.error('Failed to update test');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteTest(deleteTarget.id);
      setTests(prev => prev.filter(t => t.id !== deleteTarget.id));
      toast.success('Test deleted');
    } catch {
      toast.error('Failed to delete test');
    }
    setDeleteTarget(null);
  };

  const renderForm = () => (
    <>
      <div className="input-group">
        <label className="input-label">Content</label>
        <select className="input" value={form.contentId} onChange={(e) => setForm({ ...form, contentId: Number(e.target.value) })}>
          <option value={0}>Select Content</option>
          {contents.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>
      <div className="input-group">
        <label className="input-label">Title</label>
        <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="input-group">
        <label className="input-label">Description</label>
        <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="input-group">
          <label className="input-label">Type</label>
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
            <option value="TRUE_FALSE">True/False</option>
            <option value="MIXED">Mixed</option>
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Time Limit (mins)</label>
          <input type="number" className="input" value={form.timeLimit} onChange={(e) => setForm({ ...form, timeLimit: Number(e.target.value) })} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="input-group">
          <label className="input-label">Passing Score (%)</label>
          <input type="number" className="input" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: Number(e.target.value) })} />
        </div>
        <div className="input-group" style={{ display: 'flex', alignItems: 'center', paddingTop: 30 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <span>Active Test</span>
          </label>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h4 style={{ fontWeight: 600 }}>Questions ({form.questions?.length || 0})</h4>
          <button className="btn btn-sm btn-secondary" onClick={handleAddQuestion}>
            <Plus size={14} /> Add Question
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
          {form.questions?.map((q, idx) => (
            <div key={idx} style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 600 }}>Question {idx + 1}</span>
                <button className="icon-button" onClick={() => handleRemoveQuestion(idx)}><Trash2 size={14} style={{ color: 'var(--accent-red)' }} /></button>
              </div>
              <input className="input" style={{ marginBottom: 12 }} placeholder="Question text" value={q.question} onChange={e => handleUpdateQuestion(idx, 'question', e.target.value)} />
              
              <textarea className="input" style={{ marginBottom: 12, height: 80, fontFamily: 'monospace', fontSize: 12 }} placeholder='{"A":"Option 1", "B":"Option 2"}' value={q.options} onChange={e => handleUpdateQuestion(idx, 'options', e.target.value)} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="input-label" style={{ fontSize: 12 }}>Correct Answer (A, B, C, D)</label>
                  <input className="input" value={q.correctAnswer} onChange={e => handleUpdateQuestion(idx, 'correctAnswer', e.target.value)} />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: 12 }}>Points</label>
                  <input type="number" className="input" value={q.points} onChange={e => handleUpdateQuestion(idx, 'points', Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="input-label" style={{ fontSize: 12 }}>Explanation</label>
                <input className="input" value={q.explanation} onChange={e => handleUpdateQuestion(idx, 'explanation', e.target.value)} />
              </div>
            </div>
          ))}
          {form.questions?.length === 0 && (
            <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
              No questions added yet.
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Test Management</div>
        <div className="page-subtitle">Create and manage content assessments and quizzes</div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="flex items-center gap-12">
            <Filter size={16} />
            <span style={{ color: 'var(--text-muted)' }}>{tests.length} Total Tests</span>
          </div>
          <div className="flex gap-8">
            <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New Test</button>
          </div>
        </div>
      </div>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Test Title</th>
              <th>Content</th>
              <th>Type</th>
              <th>Questions</th>
              <th>Time Limit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((item) => {
              const contentName = contents.find(c => c.id === item.contentId)?.title || 'Unknown Content';
              return (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.title}</td>
                  <td>{contentName}</td>
                  <td><span className="pill pill-cyan">{item.type}</span></td>
                  <td>{item.questions?.length || 0}</td>
                  <td>{item.timeLimit}m</td>
                  <td><span className={`pill ${item.isActive ? 'pill-green' : 'pill-red'}`}>{item.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(item)}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setDeleteTarget(item)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {tests.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No tests found. Click "New Test" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isCreateOpen && (
        <Modal
          open={isCreateOpen}
          title="Create Test"
          subtitle="Add a new test to a content item"
          onClose={() => setIsCreateOpen(false)}
          footer={(
            <>
              <button className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate}>Create</button>
            </>
          )}
        >
          {renderForm()}
        </Modal>
      )}

      {isEditOpen && (
        <Modal
          open={isEditOpen}
          title="Edit Test"
          subtitle="Update test details and questions"
          onClose={() => { setIsEditOpen(false); setEditTarget(null); }}
          footer={(
            <>
              <button className="btn btn-secondary" onClick={() => { setIsEditOpen(false); setEditTarget(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEdit}>Save changes</button>
            </>
          )}
        >
          {renderForm()}
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          open={!!deleteTarget}
          title="Delete Test"
          subtitle="This action cannot be undone"
          onClose={() => setDeleteTarget(null)}
          footer={(
            <>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleDelete}>Delete</button>
            </>
          )}
        >
          <div className="text-sm text-muted">Delete test "{deleteTarget?.title}"? All associated questions and user attempts will be permanently deleted.</div>
        </Modal>
      )}
    </div>
  );
}
