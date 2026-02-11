import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoadingProvider } from './context/LoadingContext';
import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

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
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
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