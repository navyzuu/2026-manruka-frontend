import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoadingProvider } from './context/LoadingContext';
import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/user/UserDashboard';
import CreateBookingPage from './pages/user/CreateBookingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateAdminBookingPage from './pages/admin/CreateAdminBookingPage';

function AppRoutes() {
  return (
    <LoadingProvider>
      <Routes>
        {/* Redirect root ke /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Login & Register sekarang satu halaman */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        
        {/* Protected Routes (Tetap sama) */}
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/user-dashboard/create-booking" element={<CreateBookingPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-dashboard/create-booking" element={<CreateAdminBookingPage />} />
      </Routes>
    </LoadingProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;