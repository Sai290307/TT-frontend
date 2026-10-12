import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buildingApi, unitApi, announcementApi, issueApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

// One small number card. Clicking it opens the matching page.
function Stat({ label, value, to }) {
  const inner = (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function Dashboard() {
  const { hasRole, user } = useAuth();
  const isStaff = hasRole(['ADMIN', 'MANAGER']);
  const [stats, setStats] = useState({ buildings: 0, units: 0, openIssues: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [b, u, i, an] = await Promise.all([
        buildingApi.getAll().catch(() => ({ data: [] })),
        unitApi.getAll().catch(() => ({ data: [] })),
        issueApi.getAll().catch(() => ({ data: [] })),
        announcementApi.getActive().catch(() => ({ data: [] })),
      ]);
      setStats({
        buildings: b.data.length,
        units: u.data.length,
        openIssues: i.data.filter((x) => x.status === 'OPEN' || x.status === 'IN_PROGRESS').length,
      });
      setAnnouncements(an.data.slice(0, 3));
      setIssues(i.data.filter((x) => x.status === 'OPEN' || x.status === 'IN_PROGRESS').slice(0, 5));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Home</h1>
          <p className="page-subtitle">
            {isStaff ? 'Your community at a glance' : `Welcome, ${user?.username || 'resident'}`}
          </p>
        </div>
      </div>

      <div className="grid grid-3 gap-6">
        {isStaff && <Stat label="Buildings" value={stats.buildings} to="/buildings" />}
        {isStaff && <Stat label="Units" value={stats.units} to="/units" />}
        <Stat label="Open complaints" value={stats.openIssues} to="/issues" />
        <Stat label="Notices" value={announcements.length} to="/announcements" />
      </div>

      <div className="grid grid-2 gap-6 mt-4">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">Latest notices</h3>
            <Link to="/announcements" className="text-sm text-blue-600">View all</Link>
          </div>
          <div className="card-body">
            {announcements.length === 0 ? <p className="text-sm text-gray-500">No notices right now.</p> :
              announcements.map((a) => (
                <div key={a.id} className="mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-gray-500">{a.content?.slice(0, 90)}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">Open complaints</h3>
            <Link to="/issues" className="text-sm text-blue-600">View all</Link>
          </div>
          <div className="card-body">
            {issues.length === 0 ? <p className="text-sm text-gray-500">Nothing needs attention.</p> :
              issues.map((i) => (
                <div key={i.id} className="flex justify-between items-center mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                  <div>
                    <p className="font-medium">{i.title}</p>
                    <p className="text-sm text-gray-500">{i.unitNumber || ''} · {i.priority}</p>
                  </div>
                  <span className="badge badge-warning">{i.status?.replace('_', ' ')}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}