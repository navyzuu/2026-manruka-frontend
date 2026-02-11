import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

export default function AuthPage() {
    // State: false = Login Mode, true = Register Mode
    const [isRegisterActive, setIsRegisterActive] = useState(false);

    const handleSwitch = () => {
        setIsRegisterActive(!isRegisterActive);
    };

    return (
        <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4 font-sans overflow-hidden">
            {/* MAIN CONTAINER */}
            <div className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-[900px] min-h-[600px] flex transition-all duration-900`}>

                {/* --- FORM SECTION --- */}
                
                {/* 1. Sign Up Container (Posisi Kiri, tapi opacity 0 saat mode Login) */}
                <div className={`absolute top-0 h-full transition-all duration-1000 ease-in-out left-0 w-full md:w-1/2 ${isRegisterActive ? 'opacity-100 z-20 translate-x-0' : 'opacity-0 z-0 translate-x-full'}`}>
                    <RegisterForm onSwitch={handleSwitch} />
                </div>

                {/* 2. Sign In Container (Posisi Kanan, opacity 1 saat mode Login) */}
                <div className={`absolute top-0 h-full transition-all duration-1000 ease-in-out left-0 w-full md:w-1/2 ${isRegisterActive ? 'opacity-0 z-0 -translate-x-full' : 'opacity-100 z-20 md:translate-x-[100%]'}`}>
                    <LoginForm onSwitch={handleSwitch} />
                </div>

                {/* --- OVERLAY / BANNER SECTION (Desktop Only) --- */}
                <div className={`hidden md:block absolute top-0 left-0 h-full w-1/2 overflow-hidden transition-transform duration-700 ease-in-out z-50 ${isRegisterActive ? 'translate-x-[100%]' : 'translate-x-0'}`}>
                    
                    {/* Background Gradient & Content */}
                    <div className={`bg-gradient-to-r from-primary-700 to-primary-900 text-white h-full w-[200%] absolute transition-transform duration-700 ease-in-out flex items-center justify-center ${isRegisterActive ? 'translate-x-[-50%]' : 'translate-x-0'}`}>
                        
                        {/* Panel Kiri (Muncul saat mode Login - Mengajak Register) */}
                        <div className="w-1/2 h-full flex flex-col items-center justify-center px-10 text-center">
                            <h1 className="text-4xl font-bold mb-4">Halo, Mahasiswa!</h1>
                            <p className="mb-8 text-primary-100">Daftarkan diri Anda untuk mulai menggunakan fasilitas ruangan kampus secara online.</p>
                            <button 
                                onClick={handleSwitch} 
                                className="border-2 border-white text-white font-bold py-2 px-10 rounded-full hover:bg-white hover:text-primary-800 transition-all uppercase tracking-wider text-sm"
                            >
                                Daftar Akun
                            </button>
                        </div>

                        {/* Panel Kanan (Muncul saat mode Register - Mengajak Login) */}
                        <div className="w-1/2 h-full flex flex-col items-center justify-center px-10 text-center">
                            <h1 className="text-4xl font-bold mb-4">Selamat Datang!</h1>
                            <p className="mb-8 text-primary-100">Sudah memiliki akun? Silakan masuk untuk melihat jadwal dan riwayat peminjaman.</p>
                            <button 
                                onClick={handleSwitch} 
                                className="border-2 border-white text-white font-bold py-2 px-10 rounded-full hover:bg-white hover:text-primary-800 transition-all uppercase tracking-wider text-sm"
                            >
                                Masuk Disini
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}