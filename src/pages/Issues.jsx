import { useState, useEffect } from 'react';
import { issueApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

function AlertIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
}

function PlusIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
}

function DeleteIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
}

const statusBadge = (s) => ({
  OPEN: 'badge-danger', IN_PROGRESS: 'badge-warning', RESOLVED: 'badge-success', CLOSED: 'badge-gray',
}[s] || 'badge-gray');

const priorityBadge = (p) => ({
  LOW: 'badge-gray', MEDIUM: 'badge-info', HIGH: 'badge-warning', URGENT: 'badge-danger',
}[p] || 'badge-gray');

export default function Issues() {
  const { hasRole } = useAuth();
  const canManage = hasRole(['ADMIN', 'MANAGER']);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState('all'); // all | my | assigned
  const [formData, setFormData] = useState({ title: '', description: '', unitNumber: '', priority: 'MEDIUM' });
  const [assignData, setAssignData] = useState({ issueId: null, technicianId: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchIssues(); }, []);

  const fetchIssues = async (v = view) => {
    setLoading(true);
    try {
      let res;
      if (v === 'my') res = await issueApi.getMyIssues();
      else if (v === 'assigned') res = await issueApi.getAssigned();
      else res = await issueApi.getAll();
      setIssues(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const switchView = (v) => { setView(v); fetchIssues(v); };
  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await issueApi.create(formData);
      setFormData({ title: '', description: '', unitNumber: '', priority: 'MEDIUM' });
      closeModal();
      fetchIssues();
    } catch (e) { alert(e.response?.data?.message || 'Failed to report issue'); }
    finally { setSubmitting(false); }
  };

  const handleStatus = async (id, status) => {
    try { await issueApi.updateStatus(id, status); fetchIssues(); }
    catch (e) { alert('Failed to update status'); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await issueApi.assign(assignData.issueId, assignData.technicianId);
      setAssignData({ issueId: null, technicianId: '' });
      fetchIssues();
    } catch (e) { alert(e.response?.data?.message || 'Failed to assign'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this issue?')) return;
    try { await issueApi.delete(id); fetchIssues(); }
    catch (e) { alert('Failed to delete'); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" /></div>;
  }

  return (
    <div>
      <div className="page-header flex justify-between items-end">
        <div>
          <h1 className="page-title">Issues</h1>
          <p className="page-subtitle">Report problems and track fixes</p>
        </div>
        <div className="flex items-center gap-4">
          <button className={`btn ${view === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => switchView('all')}>All</button>
          <button className={`btn ${view === 'my' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => switchView('my')}>Mine</button>
          <button className={`btn ${view === 'assigned' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => switchView('assigned')}>Assigned</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><PlusIcon className="w-4 h-4" />Report</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th><th>Unit</th><th>Priority</th><th>Status</th><th>Reported by</th><th>Assigned to</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-500">
                    <AlertIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" /><p>No issues</p>
                  </td></tr>
                ) : issues.map((i) => (
                  <tr key={i.id}>
                    <td className="font-medium">{i.title}<div className="text-sm text-gray-500">{i.description?.slice(0, 60)}</div></td>
                    <td>{i.unitNumber || '-'}</td>
                    <td><span className={`badge ${priorityBadge(i.priority)}`}>{i.priority}</span></td>
                    <td><span className={`badge ${statusBadge(i.status)}`}>{i.status?.replace('_', ' ')}</span></td>
                    <td className="text-sm">{i.reportedByName || `User ${i.reportedById}`}</td>
                    <td className="text-sm">{i.assignedToName || '-'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <select value={i.status} onChange={(e) => handleStatus(i.id, e.target.value)} className="text-sm border rounded px-2 py-1">
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                        {canManage && (
                          <>
                            <button onClick={() => setAssignData({ issueId: i.id, technicianId: '' })} className="btn btn-secondary btn-sm">Assign</button>
                            <button onClick={() => handleDelete(i.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><DeleteIcon className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {assignData.issueId && (
        <div className="modal-overlay" onClick={() => setAssignData({ issueId: null, technicianId: '' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3 className="font-semibold text-lg">Assign technician</h3></div>
            <form onSubmit={handleAssign}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Technician user ID *</label>
                  <input type="number" className="form-input" value={assignData.technicianId} onChange={(e) => setAssignData({ ...assignData, technicianId: e.target.value })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAssignData({ issueId: null, technicianId: '' })}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold text-lg">Report an issue</h3>
              <button onClick={closeModal} className="p-1 text-gray-500 hover:text-gray-700">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Leaking pipe" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Unit number</label>
                    <input className="form-input" value={formData.unitNumber} onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })} placeholder="A-101" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-input" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Report'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}