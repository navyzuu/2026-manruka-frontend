import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useLoading } from '../../context/LoadingContext';

// Interface disesuaikan agar aman jika ada field yang null
interface Booking { 
    id: number; 
    roomName: string; 
    date: string; 
    time: string;       // Contoh: "08:00 - 10:00"
    startTime?: string; // Opsional
    endTime?: string;   // Opsional (Contoh: "10:00")
    status: string; 
    borrowerName: string; 
}

export default function UserDashboard() {
    const { navigateWithDelay } = useLoading();
    const [user, setUser] = useState<any>(null);
    
    // State Data Terpisah
    const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
    const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
    const [rejectedBookings, setRejectedBookings] = useState<Booking[]>([]);
    
    // State Tab Aktif ('active' | 'history' | 'rejected')
    const [currentTab, setCurrentTab] = useState('active');

    // Public Schedule (Tetap menampilkan yang aktif saja)
    const [publicSchedule, setPublicSchedule] = useState<Booking[]>([]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) { navigateWithDelay('/login'); return; }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchBookings(parsedUser.name);
    }, []);

    // --- FIX: Logic Anti-Crash untuk Cek Kadaluarsa ---
    const isExpired = (dateStr: string, endTimeStr?: string, timeRangeStr?: string) => {
        if (!dateStr) return false;

        // 1. Cari Jam Selesai yang valid
        let finalTime = endTimeStr;
        
        // Jika endTime kosong, coba ambil dari string range "08:00 - 10:00"
        if (!finalTime && timeRangeStr && timeRangeStr.includes(' - ')) {
            const parts = timeRangeStr.split(' - ');
            if (parts.length === 2) finalTime = parts[1]; // Ambil "10:00"
        }

        // Jika masih tidak ketemu, anggap data tidak valid/belum expired
        if (!finalTime) return false;

        try {
            const now = new Date();
            
            // 2. Parsing Tanggal (YYYY-MM-DD)
            // Menggunakan split untuk menghindari masalah zona waktu browser
            const cleanDate = dateStr.split('T')[0];
            const [year, month, day] = cleanDate.split('-').map(Number);
            
            // 3. Parsing Waktu (HH:mm)
            const [hours, minutes] = finalTime.split(':').map(Number);

            // 4. Buat Tanggal Javascript (Bulan dikurang 1 karena index 0-11)
            const bookingEnd = new Date(year, month - 1, day, hours, minutes);

            // 5. Bandingkan dengan Waktu Sekarang
            return now > bookingEnd;
        } catch (e) {
            console.error("Gagal parse waktu:", dateStr, finalTime);
            return false;
        }
    };

    const fetchBookings = async (userName: string) => {
        try {
            const res = await api.get('/bookings');
            const allData: Booking[] = res.data;

            // 1. Filter Global: Public Schedule (Hanya yang Aktif & Belum Expired)
            setPublicSchedule(allData.filter(b => 
                (b.status === 'Approved' || b.status === 'Pending') && 
                !isExpired(b.date, b.endTime, b.time)
            ));

            // 2. Filter Personal: Data Saya
            const myData = allData.filter(b => b.borrowerName === userName);

            // A. Booking Aktif Saya (Pending ATAU (Approved & Belum Expired))
            setActiveBookings(myData.filter(b => 
                b.status === 'Pending' || 
                (b.status === 'Approved' && !isExpired(b.date, b.endTime, b.time))
            ));

            // B. Riwayat Selesai (Approved & Sudah Expired)
            setHistoryBookings(myData.filter(b => 
                b.status === 'Approved' && isExpired(b.date, b.endTime, b.time)
            ));

            // C. Ditolak
            setRejectedBookings(myData.filter(b => b.status === 'Rejected'));

        } catch (err) { console.error("Gagal load booking:", err); }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigateWithDelay('/login');
    };

    // Helper UI untuk Tab Button
    const TabButton = ({ id, label, count, colorClass }: any) => (
        <button 
            onClick={() => setCurrentTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                currentTab === id 
                ? `border-primary-600 text-primary-700 bg-primary-50` 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
        >
            {label}
            {count > 0 && <span className={`text-xs px-2 py-0.5 rounded-full text-white ${colorClass}`}>{count}</span>}
        </button>
    );

    // Helper UI untuk Tabel
    const BookingTable = ({ data, emptyMsg }: { data: Booking[], emptyMsg: string }) => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 border-b">
                    <tr>
                        <th className="px-6 py-3">Ruangan</th>
                        <th className="px-6 py-3">Waktu</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.length === 0 ? (
                        <tr><td colSpan={3} className="text-center py-6 text-slate-500">{emptyMsg}</td></tr>
                    ) : (
                        data.map(b => (
                            <tr key={b.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-700">{b.roomName}</td>
                                <td className="px-6 py-4">{b.date}<br/><span className="text-xs text-slate-400">{b.time}</span></td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        b.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                        b.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {/* Cek expired lagi di sini untuk label UI */}
                                        {b.status === 'Approved' && isExpired(b.date, b.endTime, b.time) ? 'Selesai' : b.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40 shadow-sm flex justify-between items-center">
                <span className="text-xl font-bold text-slate-800">Manruka<span className="text-primary-600">User</span></span>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 hidden md:block">Halo, <b>{user?.name}</b></span>
                    <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded transition">Logout</button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 lg:p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
                        <p className="text-slate-500">Kelola peminjaman ruangan Anda.</p>
                    </div>
                    <button onClick={() => navigateWithDelay('/user-dashboard/create-booking')} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all flex items-center gap-2">
                        + Booking Baru
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* KIRI: JADWAL PUBLIK (Hanya Aktif) */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700 flex justify-between items-center">
                            <span>📅 Jadwal Ruangan Aktif</span>
                            <span className="text-xs font-normal text-slate-400">Realtime Update</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 border-b">
                                    <tr>
                                        <th className="px-6 py-3">Ruangan</th>
                                        <th className="px-6 py-3">Waktu</th>
                                        <th className="px-6 py-3">Peminjam</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {publicSchedule.length === 0 ? (
                                        <tr><td colSpan={4} className="text-center py-6 text-slate-500">Tidak ada jadwal aktif saat ini.</td></tr>
                                    ) : (
                                        publicSchedule.map(b => (
                                            <tr key={b.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium">{b.roomName}</td>
                                                <td className="px-6 py-4">{b.date}<br/><span className="text-xs text-slate-400">{b.time}</span></td>
                                                <td className="px-6 py-4">{b.borrowerName}</td>
                                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${b.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* KANAN: DATA SAYA (DENGAN TABS) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-fit min-h-[400px]">
                        
                        {/* TAB NAVIGATION */}
                        <div className="flex border-b border-slate-200 px-2 pt-2 gap-1 overflow-x-auto">
                            <TabButton id="active" label="Aktif" count={activeBookings.length} colorClass="bg-blue-500" />
                            <TabButton id="history" label="Riwayat" count={historyBookings.length} colorClass="bg-slate-500" />
                            <TabButton id="rejected" label="Ditolak" count={rejectedBookings.length} colorClass="bg-red-500" />
                        </div>

                        {/* TAB CONTENT */}
                        <div className="p-0">
                            {currentTab === 'active' && <BookingTable data={activeBookings} emptyMsg="Tidak ada booking aktif." />}
                            {currentTab === 'history' && <BookingTable data={historyBookings} emptyMsg="Belum ada riwayat selesai." />}
                            {currentTab === 'rejected' && <BookingTable data={rejectedBookings} emptyMsg="Bersih! Tidak ada penolakan." />}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}