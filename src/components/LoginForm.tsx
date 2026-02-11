import { useState } from 'react';
import { api } from '../api/axios';
import { useLoading } from '../context/LoadingContext';

interface LoginFormProps {
    onSwitch: () => void; // Fungsi untuk geser ke Register
}

export default function LoginForm({ onSwitch }: LoginFormProps) {
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
        <div className="flex flex-col justify-center items-center h-full px-10 text-center">
            <h1 className="text-3xl font-bold mb-4 text-slate-800">Sign In</h1>
            <p className="text-slate-400 text-sm mb-8">Masuk untuk mengakses layanan peminjaman ruangan.</p>
            
            <form onSubmit={handleLogin} className="w-full space-y-4">
                <input 
                    type="text" 
                    placeholder="NRP / Username" 
                    value={nrp}
                    onChange={(e) => setNrp(e.target.value)}
                    className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    required
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-100 border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    required
                />
                <button 
                    type="submit" 
                    className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-transform active:scale-95 shadow-lg"
                >
                    Sign In
                </button>
            </form>
            
            {/* Tombol Mobile Only (Jika layar kecil, tombol geser ada di bawah) */}
            <div className="mt-6 md:hidden">
                <p className="text-sm text-slate-500">Belum punya akun?</p>
                <button onClick={onSwitch} className="text-primary-600 font-bold text-sm hover:underline">Daftar Sekarang</button>
            </div>
        </div>
    );
}