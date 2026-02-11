import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/user/UserDashboard';
import CreateBookingPage from './pages/user/CreateBookingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateAdminBookingPage from './pages/admin/CreateAdminBookingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root ke Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Halaman Dashboard User */}
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/user-dashboard/create-booking" element={<CreateBookingPage />} />

        {/* Halaman Dashboard Admin */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-dashboard/create-booking" element={<CreateAdminBookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;