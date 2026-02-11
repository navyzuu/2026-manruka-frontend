import { useState } from 'react';
import { api } from '../api/axios';
import { useLoading } from '../context/LoadingContext';
import { Link } from 'react-router-dom';
import { DEPARTMENTS } from '../data/departments'; // Import Data

export default function RegisterPage() {
    const { navigateWithDelay, setLoadingManual } = useLoading();
    
    // State terpisah untuk Dept & Major agar mudah di-manage dropdown-nya
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('');
    
    const [formData, setFormData] = useState({
        name: '', nrp: '', yearEntry: 2024, password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingManual(true);
        try {
            // Gabungkan Dept & Major ke payload
            const payload = {
                ...formData,
                department: selectedDept,
                major: selectedMajor
            };

            await api.post('/auth/register', payload);
            setTimeout(() => {
                setLoadingManual(false);
                alert("Registrasi Berhasil! Silakan Login.");
                navigateWithDelay('/login');
            }, 1000);
        } catch (error: any) {
            setLoadingManual(false);
            alert("Gagal Register: " + (error.response?.data || error.message));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                
                {/* Kiri: Branding */}
                <div className="md:w-1/3 bg-primary-700 p-8 flex flex-col justify-center text-white relative">
                    <div className="absolute inset-0 bg-primary-800 opacity-50"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-4">Bergabunglah.</h1>
                        <p className="text-primary-100 mb-6">Daftarkan diri Anda sesuai Program Studi yang valid.</p>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2"><span className="bg-primary-500 p-1 rounded-full text-[10px]">✓</span> Data Terintegrasi</li>
                            <li className="flex items-center gap-2"><span className="bg-primary-500 p-1 rounded-full text-[10px]">✓</span> Akses Fasilitas</li>
                        </ul>
                    </div>
                </div>

                {/* Kanan: Form */}
                <div className="md:w-2/3 p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Formulir Mahasiswa</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                                <input name="name" onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none transition" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">NRP</label>
                                <input name="nrp" onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none transition" required />
                            </div>

                            {/* DROPDOWN DEPARTEMEN */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Departemen</label>
                                <select 
                                    value={selectedDept} 
                                    onChange={(e) => {
                                        setSelectedDept(e.target.value);
                                        setSelectedMajor(''); // Reset jurusan jika ganti departemen
                                    }}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
                                    required
                                >
                                    <option value="">-- Pilih Departemen --</option>
                                    {Object.keys(DEPARTMENTS).map((dept) => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>

                            {/* DROPDOWN JURUSAN (DEPENDENT) */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Program Studi / Jurusan</label>
                                <select 
                                    value={selectedMajor} 
                                    onChange={(e) => setSelectedMajor(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition disabled:bg-slate-100 disabled:text-slate-400"
                                    required
                                    disabled={!selectedDept} // Disable jika dept belum dipilih
                                >
                                    <option value="">-- Pilih Prodi --</option>
                                    {selectedDept && DEPARTMENTS[selectedDept].map((major) => (
                                        <option key={major} value={major}>{major}</option>
                                    ))}
                                </select>
                                {!selectedDept && <p className="text-xs text-red-500 mt-1">*Pilih Departemen terlebih dahulu</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Masuk</label>
                                <input type="number" name="yearEntry" value={formData.yearEntry} onChange={(e) => setFormData({...formData, yearEntry: parseInt(e.target.value)})} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none transition" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <input type="password" name="password" onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none transition" required />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98]">
                                Daftar Sekarang
                            </button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-slate-500">
                        Sudah punya akun? <Link to="/login" className="text-primary-600 font-bold hover:underline">Login disini</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}