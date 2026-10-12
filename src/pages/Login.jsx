import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">SmartConnect</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your community</p>
        </div>
        <div className="card"><div className="card-body">
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" required disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required disabled={loading} />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            No account? <Link to="/register" className="text-blue-600 font-medium">Sign up</Link>
          </p>
          <div className="auth-demo">
            Demo — admin / admin123 · manager / manager123 · resident / resident123 · technician / technician123
          </div>
        </div></div>
      </div>
    </div>
  );
}