import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import CreateBookingPage from './pages/CreateBookingPage';

// Placeholder Dashboard (Kita buat di Issue selanjutnya)
const AdminDashboard = () => <h2>Selamat Datang di Dashboard Admin <button onClick={() => {localStorage.clear(); window.location.href='/login'}}>Logout</button></h2>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root ke Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Halaman Dashboard Sementara */}
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/user-dashboard/create-booking" element={<CreateBookingPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;