import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

export default function AuthPage() {
    // State: false = Mode Login, true = Mode Register
    const [isRegister, setIsRegister] = useState(false);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 font-sans">
            
            {/* CONTAINER UTAMA (Relative untuk menampung elemen absolute) */}
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-[1000px] min-h-[600px] flex">

                {/* 1. FORM REGISTER (Posisi: Kiri) */}
                {/* Form ini "diam" di kiri. Saat overlay di kanan, dia terlihat. Saat overlay di kiri, dia tertutup. */}
                <div className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center bg-white transition-all duration-700 ease-in-out ${isRegister ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                    <div className="w-full max-w-md p-10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800">Buat Akun</h2>
                            <p className="text-slate-500 text-sm">Gunakan data akademik Anda.</p>
                        </div>
                        {/* Pass fungsi kosong karena tombol switch ada di Overlay */}
                        <RegisterForm onSwitch={() => {}} />
                    </div>
                </div>

                {/* 2. FORM LOGIN (Posisi: Kanan) */}
                {/* Form ini "diam" di kanan. Saat overlay di kiri, dia terlihat. Saat overlay di kanan, dia tertutup. */}
                <div className={`absolute top-0 right-0 h-full w-1/2 flex items-center justify-center bg-white transition-all duration-700 ease-in-out ${isRegister ? 'opacity-0 z-0' : 'opacity-100 z-10'}`}>
                    <div className="w-full max-w-md p-10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800">Sign In</h2>
                            <p className="text-slate-500 text-sm">Masuk ke akun Manruka Anda.</p>
                        </div>
                        {/* Pass fungsi kosong karena tombol switch ada di Overlay */}
                        <LoginForm onSwitch={() => {}} />
                    </div>
                </div>

                {/* 3. SLIDING OVERLAY (GAMBAR & TEKS) */}
                {/* Ini adalah panel yang bergerak Kiri <-> Kanan */}
                <div 
                    className={`absolute top-0 left-0 h-full w-1/2 z-50 overflow-hidden transition-transform duration-700 ease-in-out shadow-2xl ${isRegister ? 'translate-x-[100%]' : 'translate-x-0'}`}
                >
                    {/* Background Image & Gradient (Full Height) */}
                    <div className="absolute inset-0 bg-slate-900 text-white">
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-50"
                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1986&auto=format&fit=crop')" }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 to-slate-900/90"></div>
                        
                        {/* PANEL KONTEN DI DALAM SLIDER */}
                        {/* Kita butuh -translate-x agar teks bergerak berlawanan arah dengan panel (Efek Parallax) */}
                        <div 
                            className={`relative h-full w-[200%] transition-transform duration-700 ease-in-out flex ${isRegister ? 'translate-x-[-50%]' : 'translate-x-0'}`}
                        >
                            
                            {/* KONTEN KIRI (Muncul saat Login Mode) -> Mengajak Register */}
                            <div className="w-1/2 h-full flex flex-col items-center justify-center px-12 text-center">
                                <h1 className="text-4xl font-bold mb-4">Halo, Mahasiswa!</h1>
                                <p className="mb-8 text-slate-200 leading-relaxed">
                                    Belum memiliki akun? Daftarkan diri Anda sekarang untuk mulai meminjam ruangan secara online.
                                </p>
                                <button 
                                    onClick={() => setIsRegister(true)}
                                    className="border-2 border-white bg-transparent text-white font-bold py-3 px-10 rounded-full hover:bg-white hover:text-slate-900 transition-all uppercase tracking-wider text-sm"
                                >
                                    Daftar Disini
                                </button>
                            </div>

                            {/* KONTEN KANAN (Muncul saat Register Mode) -> Mengajak Login */}
                            <div className="w-1/2 h-full flex flex-col items-center justify-center px-12 text-center">
                                <h1 className="text-4xl font-bold mb-4">Selamat Datang!</h1>
                                <p className="mb-8 text-slate-200 leading-relaxed">
                                    Sudah memiliki akun? Silakan masuk kembali untuk melihat status peminjaman Anda.
                                </p>
                                <button 
                                    onClick={() => setIsRegister(false)}
                                    className="border-2 border-white bg-transparent text-white font-bold py-3 px-10 rounded-full hover:bg-white hover:text-slate-900 transition-all uppercase tracking-wider text-sm"
                                >
                                    Masuk Disini
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}