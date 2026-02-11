import { useState } from 'react';
import { api } from '../api/axios';
import { useLoading } from '../context/LoadingContext';
import { DEPARTMENTS } from '../data/departments';

interface RegisterFormProps {
    onSwitch: () => void; // Fungsi untuk geser ke Login
}

export default function RegisterForm({ onSwitch }: RegisterFormProps) {
    const { navigateWithDelay, setLoadingManual } = useLoading();
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('');
    const [formData, setFormData] = useState({
        name: '', nrp: '', yearEntry: 2024, password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingManual(true);
        try {
            await api.post('/auth/register', { ...formData, department: selectedDept, major: selectedMajor });
            setTimeout(() => {
                setLoadingManual(false);
                alert("Registrasi Berhasil! Silakan Login.");
                onSwitch(); // Otomatis geser ke Login setelah sukses
            }, 800);
        } catch (error: any) {
            setLoadingManual(false);
            alert("Gagal: " + (error.response?.data || error.message));
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-full px-10 text-center overflow-y-auto custom-scrollbar py-10">
            <h1 className="text-3xl font-bold mb-2 text-slate-800">Create Account</h1>
            <p className="text-slate-400 text-sm mb-6">Gunakan data akademik yang valid.</p>
            
            <form onSubmit={handleSubmit} className="w-full space-y-3 text-left">
                <input placeholder="Nama Lengkap" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-100 border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary-500" required />
                <input placeholder="NRP" onChange={e => setFormData({...formData, nrp: e.target.value})} className="w-full bg-slate-100 border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary-500" required />
                
                <select value={selectedDept} onChange={e => { setSelectedDept(e.target.value); setSelectedMajor(''); }} className="w-full bg-slate-100 border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary-500" required>
                    <option value="">Pilih Departemen</option>
                    {Object.keys(DEPARTMENTS).map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select value={selectedMajor} onChange={e => setSelectedMajor(e.target.value)} disabled={!selectedDept} className="w-full bg-slate-100 border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50" required>
                    <option value="">Pilih Prodi</option>
                    {selectedDept && DEPARTMENTS[selectedDept].map(m => <option key={m} value={m}>{m}</option>)}
                </select>

                <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Angkatan" value={formData.yearEntry} onChange={e => setFormData({...formData, yearEntry: parseInt(e.target.value)})} className="w-full bg-slate-100 border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary-500" required />
                    <input type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-100 border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary-500" required />
                </div>

                <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-transform active:scale-95 shadow-md mt-2">
                    Sign Up
                </button>
            </form>

            <div className="mt-4 md:hidden">
                <p className="text-sm text-slate-500">Sudah punya akun?</p>
                <button onClick={onSwitch} className="text-primary-600 font-bold text-sm hover:underline">Login disini</button>
            </div>
        </div>
    );
}