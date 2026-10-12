import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '', firstName: '', lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({
        username: formData.username, email: formData.email, password: formData.password,
        firstName: formData.firstName, lastName: formData.lastName,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">SmartConnect</h1>
          <p className="text-sm text-gray-500 mt-1">Create your account</p>
        </div>
        <div className="card"><div className="card-body">
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label">First name</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input name="username" value={formData.username} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" value={formData.password} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required disabled={loading} />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Have an account? <Link to="/login" className="text-blue-600 font-medium">Sign in</Link>
          </p>
        </div></div>
      </div>
    </div>
  );
}