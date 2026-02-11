import { useState } from 'react';
import { api } from '../api/axios';
import { useLoading } from '../context/LoadingContext';
import { Link } from 'react-router-dom';

export default function LoginPage() {
    const { navigateWithDelay, setLoadingManual } = useLoading();
    const [nrp, setNrp] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingManual(true);
        try {
            const res = await api.post('/auth/login', { nrp, password });
            localStorage.setItem('user', JSON.stringify(res.data));
            
            setTimeout(() => {
                setLoadingManual(false);
                if (res.data.role === 'Admin') navigateWithDelay('/admin-dashboard');
                else navigateWithDelay('/user-dashboard');
            }, 800);
        } catch (error: any) {
            setLoadingManual(false);
            alert("Login Gagal: NRP atau Password salah.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                {/* Kiri: Branding */}
                <div className="md:w-1/2 bg-primary-700 p-10 flex flex-col justify-center text-white relative">
                    <div className="absolute inset-0 bg-primary-800 opacity-50"></div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold mb-4">Manruka.</h1>
                        <p className="text-primary-100 text-lg mb-8">Sistem Manajemen Ruangan Kampus Terintegrasi.</p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3"><span className="bg-primary-500 p-1 rounded-full text-xs">✓</span> Realtime Schedule</div>
                            <div className="flex items-center gap-3"><span className="bg-primary-500 p-1 rounded-full text-xs">✓</span> Easy Booking</div>
                        </div>
                    </div>
                </div>
                {/* Kanan: Form */}
                <div className="md:w-1/2 p-10 flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Login Portal</h2>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">NRP / Username</label>
                            <input type="text" value={nrp} onChange={e => setNrp(e.target.value)} className="placeholder-gray-500 placeholder-opacity-50 w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none transition" placeholder="Masukkan NRP" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="placeholder-gray-500 placeholder-opacity-50 w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none transition" placeholder="password" required />
                        </div>
                        <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95">Masuk</button>
                    </form>
                    <p className="mt-6 text-center text-sm text-slate-500">Mahasiswa baru? <Link to="/register" className="text-primary-600 font-bold hover:underline">Daftar Akun</Link></p>
                </div>
            </div>
        </div>
    );
}