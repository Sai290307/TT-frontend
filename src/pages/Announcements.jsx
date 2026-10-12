import { useState, useEffect } from 'react';
import { announcementApi, buildingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

function MegaphoneIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>;
}

function PlusIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
}

function EditIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
}

function DeleteIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
}

const typeBadge = (type) => {
  const map = {
    EMERGENCY: 'badge-danger',
    MAINTENANCE: 'badge-warning',
    EVENT: 'badge-info',
    PAYMENT_REMINDER: 'badge-warning',
    RULE_UPDATE: 'badge-info',
    GENERAL: 'badge-gray',
  };
  return map[type] || 'badge-gray';
};

export default function Announcements() {
  const { hasRole } = useAuth();
  const canManage = hasRole(['ADMIN', 'MANAGER']);
  const [announcements, setAnnouncements] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [formData, setFormData] = useState({
    title: '', content: '', buildingId: '', type: 'GENERAL', priority: 1, expiresAt: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [aRes, bRes] = await Promise.all([announcementApi.getAll(), buildingApi.getAll()]);
      setAnnouncements(aRes.data);
      setBuildings(bRes.data);
    } catch (e) { console.error('Failed to fetch announcements:', e); }
    finally { setLoading(false); }
  };

  const fetchActive = async () => {
    setLoading(true);
    try {
      const res = await announcementApi.getActive();
      setAnnouncements(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openModal = (a = null) => {
    if (a) {
      setEditing(a);
      setFormData({
        title: a.title, content: a.content || '',
        buildingId: a.buildingId?.toString() || '',
        type: a.type || 'GENERAL', priority: a.priority ?? 1,
        expiresAt: a.expiresAt ? a.expiresAt.slice(0, 16) : '',
      });
    } else {
      setEditing(null);
      setFormData({ title: '', content: '', buildingId: '', type: 'GENERAL', priority: 1, expiresAt: '' });
    }
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        title: formData.title,
        content: formData.content,
        buildingId: formData.buildingId ? parseInt(formData.buildingId) : null,
        type: formData.type,
        priority: parseInt(formData.priority),
        expiresAt: formData.expiresAt || null,
      };
      if (editing) await announcementApi.update(editing.id, data);
      else await announcementApi.create(data);
      closeModal();
      showActiveOnly ? fetchActive() : fetchData();
    } catch (e) { alert(e.response?.data?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try { await announcementApi.delete(id); showActiveOnly ? fetchActive() : fetchData(); }
    catch (e) { alert('Failed to delete'); }
  };

  const handlePublish = async (a) => {
    try {
      if (a.isPublished) await announcementApi.unpublish(a.id);
      else await announcementApi.publish(a.id);
      showActiveOnly ? fetchActive() : fetchData();
    } catch (e) { alert('Failed to update'); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" /></div>;
  }

  return (
    <div>
      <div className="page-header flex justify-between items-end">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">Notices and updates for the community</p>
        </div>
        <div className="flex items-center gap-4">
          <button className={`btn ${showActiveOnly ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setShowActiveOnly(true); fetchActive(); }}>Published</button>
          <button className={`btn ${!showActiveOnly ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setShowActiveOnly(false); setLoading(true); fetchData(); }}>All</button>
          {canManage && (
            <button className="btn btn-primary" onClick={() => openModal()}><PlusIcon className="w-4 h-4" />New</button>
          )}
        </div>
      </div>

      <div className="cards-wide">
        {announcements.length === 0 ? (
          <div className="card text-center py-12 text-gray-500" style={{ gridColumn: '1 / -1' }}>
            <MegaphoneIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p>No announcements</p>
          </div>
        ) : announcements.map((a) => (
          <div key={a.id} className="card">
            <div className="card-header flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{a.title}</h3>
                <p className="text-sm text-gray-500">{a.publishedAt ? new Date(a.publishedAt).toLocaleString() : a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</p>
              </div>
              {canManage && (
                <div className="flex items-center gap-1">
                  <button onClick={() => openModal(a)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit"><EditIcon className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><DeleteIcon className="w-4 h-4" /></button>
                </div>
              )}
            </div>
            <div className="card-body">
              <p className="text-sm text-gray-600 mb-4">{a.content}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className={`badge ${typeBadge(a.type)}`}>{a.type?.replace('_', ' ')}</span>
                {a.priority >= 3 && <span className="badge badge-danger">Priority {a.priority}</span>}
                <span className={`badge ${a.isPublished ? 'badge-success' : 'badge-gray'}`}>{a.isPublished ? 'Published' : 'Draft'}</span>
              </div>
              {canManage && (
                <button onClick={() => handlePublish(a)} className="btn btn-secondary btn-sm w-full">
                  {a.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold text-lg">{editing ? 'Edit' : 'New'} Announcement</h3>
              <button onClick={closeModal} className="p-1 text-gray-500 hover:text-gray-700">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea className="form-input" rows="4" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Building (empty = all)</label>
                  <select className="form-input" value={formData.buildingId} onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}>
                    <option value="">All buildings</option>
                    {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                      <option value="GENERAL">General</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="EVENT">Event</option>
                      <option value="EMERGENCY">Emergency</option>
                      <option value="RULE_UPDATE">Rule update</option>
                      <option value="PAYMENT_REMINDER">Payment reminder</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority (1-4)</label>
                    <input type="number" min="1" max="4" className="form-input" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Expires at</label>
                  <input type="datetime-local" className="form-input" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}