import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Settings from './pages/admin/Settings';
import AdminPanel from './pages/admin/AdminPanel';
import OrderManagement from './pages/admin/OrderManagement';
import ArtworkUpload from './pages/admin/ArtworkUpload';

function RequireAuth({ children }: { children: JSX.Element }) {
  const isAdmin = localStorage.getItem('isAdmin');
  const adminToken = localStorage.getItem('adminToken');
  const location = useLocation();

  if (!isAdmin || !adminToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
}

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Admin Public Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
        <Route path="frames" element={<AdminPanel />} />
        <Route path="order-management" element={<OrderManagement />} />
        <Route path="artworks" element={<ArtworkUpload />} />
      </Route>

      {/* Admin Catch all route */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes; 