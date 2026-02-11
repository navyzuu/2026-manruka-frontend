import { useState } from 'react';
import { api } from '../api/axios';
import { useLoading } from '../context/LoadingContext';

interface LoginFormProps { onSwitch: () => void; }

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
        <form onSubmit={handleLogin} className="space-y-4 w-full">
            <input 
                type="text" 
                placeholder="NRP / Username" 
                value={nrp}
                onChange={(e) => setNrp(e.target.value)}
                className="w-full placeholder-gray-500 placeholder-opacity-50 bg-slate-100 border border-transparent rounded-lg px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                required
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full placeholder-gray-500 placeholder-opacity-50 bg-slate-100 border border-transparent rounded-lg px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                required
            />
            <button 
                type="submit" 
                className="w-full placeholder-gray-500 placeholder-opacity-50 bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-transform active:scale-95 shadow-md"
            >
                Masuk
            </button>
        </form>
    );
}