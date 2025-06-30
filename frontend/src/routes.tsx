import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import UploadPreview from './pages/UploadPreview'
import Checkout from './pages/Checkout'
import OrderStatus from './pages/OrderStatus'
import NotFound from './pages/NotFound'
import Cart from './pages/Cart'
import OrderSummary from './pages/OrderSummary'
import OrderHistory from './pages/OrderHistory'
import OrderDetail from './pages/OrderDetail'
import Login from './pages/login'
import Signup from './pages/Signup'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import FrameDebug from './pages/FrameDebug'
import useAuthStore from './store/authStore'
import MainLayout from './components/layouts/MainLayout'
import AuthLayout from './components/layouts/AuthLayout'

function RequireAuth({ children }: { children: JSX.Element }) {
  const isLoggedIn = useAuthStore((state: { isLoggedIn: boolean }) => state.isLoggedIn)
  const location = useLocation()
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes - No Header/Footer */}
      <Route path="/login" element={
        <AuthLayout>
          <Login />
        </AuthLayout>
      } />
      <Route path="/signup" element={
        <AuthLayout>
          <Signup />
        </AuthLayout>
      } />
      <Route path="/register" element={
        <AuthLayout>
          <Register />
        </AuthLayout>
      } />
      <Route path="/forgot-password" element={
        <AuthLayout>
          <ForgotPassword />
        </AuthLayout>
      } />
      <Route path="/reset-password/:token" element={
        <AuthLayout>
          <ResetPassword />
        </AuthLayout>
      } />

      {/* Debug/Development Routes - Hidden from UI but still accessible */}
      <Route path="/_debug_/frames" element={
        <MainLayout>
          <FrameDebug />
        </MainLayout>
      } />

      {/* Public Routes - With Header/Footer */}
      <Route path="/" element={
        <MainLayout>
          <Home />
        </MainLayout>
      } />
      <Route path="/catalog" element={
        <MainLayout>
          <Catalog />
        </MainLayout>
      } />
      <Route path="/upload-preview" element={
        <MainLayout>
          <UploadPreview />
        </MainLayout>
      } />
      <Route path="/cart" element={
        <MainLayout>
          <Cart />
        </MainLayout>
      } />
      <Route path="/order-status" element={
        <MainLayout>
          <OrderStatus />
        </MainLayout>
      } />

      {/* Protected Routes - With Header/Footer */}
      <Route path="/checkout" element={
        <RequireAuth>
          <MainLayout>
          <Checkout />
          </MainLayout>
        </RequireAuth>
      } />
      <Route path="/order-history" element={
        <RequireAuth>
          <MainLayout>
          <OrderHistory />
          </MainLayout>
        </RequireAuth>
      } />
      <Route path="/order/:id" element={
        <RequireAuth>
          <MainLayout>
            <OrderDetail />
          </MainLayout>
        </RequireAuth>
      } />
      <Route path="/profile" element={
        <RequireAuth>
          <MainLayout>
          <Profile />
          </MainLayout>
        </RequireAuth>
      } />

      {/* Catch all route */}
      <Route path="*" element={
        <MainLayout>
          <NotFound />
        </MainLayout>
      } />
    </Routes>
  )
}

export default AppRoutes 