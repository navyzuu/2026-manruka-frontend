import { useState } from 'react';
import { api } from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    const [nrp, setNrp] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { nrp, password });
            
            // SIMPAN DATA USER KE LOCALSTORAGE
            localStorage.setItem('user', JSON.stringify(res.data));
            
            alert(`Login Berhasil! Selamat datang, ${res.data.name}`);

            // Redirect berdasarkan Role
            if (res.data.role === 'Admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/user-dashboard');
            }
        } catch (error: any) {
            alert("Login Gagal: NRP atau Password salah.");
        }
    };

    return (
        <div style={{ padding: 20, maxWidth: 400, margin: 'auto' }}>
            <h2>Login Manruka</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input placeholder="NRP (Mahasiswa) / Username (Admin)" value={nrp} onChange={e => setNrp(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit">Masuk</button>
            </form>
            <p>Belum punya akun? <Link to="/register">Daftar Mahasiswa</Link></p>
        </div>
    );
}