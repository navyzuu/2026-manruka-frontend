import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Placeholder Dashboard (Kita buat di Issue selanjutnya)
const UserDashboard = () => <h2>Selamat Datang di Dashboard Mahasiswa <button onClick={() => {localStorage.clear(); window.location.href='/login'}}>Logout</button></h2>;
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
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;