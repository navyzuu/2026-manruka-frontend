import { useState } from 'react';
import { api } from '../api/axios';
import { useLoading } from '../context/LoadingContext';
import { DEPARTMENTS } from '../data/departments';

interface RegisterFormProps { onSwitch: () => void; }

export default function RegisterForm({ onSwitch }: RegisterFormProps) {
    const { navigateWithDelay, setLoadingManual } = useLoading();
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('');
    const [formData, setFormData] = useState({ name: '', nrp: '', yearEntry: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingManual(true);
        try {
            await api.post('/auth/register', { ...formData, department: selectedDept, major: selectedMajor });
            setTimeout(() => {
                setLoadingManual(false);
                alert("Registrasi Berhasil! Silakan geser ke Login.");
                // Kita tidak perlu panggil onSwitch() otomatis disini, biarkan user geser sendiri atau panggil props jika mau
            }, 800);
        } catch (error: any) {
            setLoadingManual(false);
            alert("Gagal: " + (error.response?.data || error.message));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 w-full text-left">
            <input placeholder="Nama Lengkap" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full placeholder-gray-500 placeholder-opacity-50 bg-slate-100 border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary-500" required />
            <input placeholder="NRP" onChange={e => setFormData({...formData, nrp: e.target.value})} className="w-full placeholder-gray-500 placeholder-opacity-50 bg-slate-100 border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary-500" required />
            
            <div className="grid grid-cols-2 gap-2">
                <select value={selectedDept} onChange={e => { setSelectedDept(e.target.value); setSelectedMajor(''); }} className="w-full placeholder-gray-500 placeholder-opacity-50 bg-slate-100 border-none rounded-lg px-2 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary-500" required>
                    <option value="">Departemen</option>
                    {Object.keys(DEPARTMENTS).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={selectedMajor} onChange={e => setSelectedMajor(e.target.value)} disabled={!selectedDept} className="w-full placeholder-gray-500 placeholder-opacity-50 bg-slate-100 border-none rounded-lg px-2 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary-500 disabled:opacity-50" required>
                    <option value="">Prodi</option>
                    {selectedDept && DEPARTMENTS[selectedDept].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Angkatan" value={formData.yearEntry} onChange={e => setFormData({...formData, yearEntry: parseInt(e.target.value)})} className="w-full placeholder-gray-500 placeholder-opacity-50 bg-slate-100 border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary-500" required />
                <input type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} className="w-full placeholder-gray-500 placeholder-opacity-50 bg-slate-100 border-none rounded-lg px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary-500" required />
            </div>

            <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-transform active:scale-95 shadow-md mt-2">
                Daftar
            </button>
        </form>
    );
}