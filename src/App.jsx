import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Buildings from './pages/Buildings';
import Units from './pages/Units';
import Announcements from './pages/Announcements';
import Issues from './pages/Issues';

// Pages only logged-in users can see. Optionally limited to certain roles.
function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Login/register pages: if already logged in, go straight to dashboard.
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="buildings" element={
          <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}>
            <Buildings />
          </PrivateRoute>
        } />
        <Route path="units" element={
          <PrivateRoute allowedRoles={['ADMIN', 'MANAGER']}>
            <Units />
          </PrivateRoute>
        } />
        <Route path="announcements" element={<Announcements />} />
        <Route path="issues" element={<Issues />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}