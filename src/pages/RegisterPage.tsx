import { useState } from 'react';
import { api } from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        nrp: '',
        department: '',
        major: '',
        yearEntry: 2024,
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            alert("Registrasi Berhasil! Silakan Login.");
            navigate('/login'); // Pindah ke halaman login
        } catch (error: any) {
            alert("Gagal Register: " + (error.response?.data || error.message));
        }
    };

    return (
        <div style={{ padding: 20, maxWidth: 400, margin: 'auto' }}>
            <h2>Pendaftaran Mahasiswa</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input placeholder="Nama Lengkap" onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input placeholder="NRP" onChange={e => setFormData({...formData, nrp: e.target.value})} required />
                <input placeholder="Departemen" onChange={e => setFormData({...formData, department: e.target.value})} required />
                <input placeholder="Jurusan" onChange={e => setFormData({...formData, major: e.target.value})} required />
                <input type="number" placeholder="Tahun Masuk" value={formData.yearEntry} onChange={e => setFormData({...formData, yearEntry: parseInt(e.target.value)})} required />
                <input type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
                <button type="submit">Daftar Sekarang</button>
            </form>
            <p>Sudah punya akun? <Link to="/login">Login disini</Link></p>
        </div>
    );
}