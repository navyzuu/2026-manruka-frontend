import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useLoading } from '../../context/LoadingContext';

interface Booking { 
    id: number; 
    roomName: string; 
    borrowerName: string; 
    date: string; 
    time: string; 
    startTime?: string; 
    endTime?: string; 
    status: string; 
}

export default function AdminDashboard() {
    const { navigateWithDelay } = useLoading();
    
    // State Data
    const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
    const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
    const [rejectedBookings, setRejectedBookings] = useState<Booking[]>([]);
    
    const [stats, setStats] = useState({ totalPending: 0, todayApproved: 0 });
    const [currentTab, setCurrentTab] = useState('active'); // 'active' | 'history' | 'rejected'

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user || JSON.parse(user).role !== 'Admin') { navigateWithDelay('/login'); return; }
        fetchData();
    }, []);

    // --- FIX: Logic Anti-Crash (Sama dengan UserDashboard) ---
    const isExpired = (dateStr: string, endTimeStr?: string, timeRangeStr?: string) => {
        if (!dateStr) return false;

        let finalTime = endTimeStr;
        if (!finalTime && timeRangeStr && timeRangeStr.includes(' - ')) {
            const parts = timeRangeStr.split(' - ');
            if (parts.length === 2) finalTime = parts[1];
        }

        if (!finalTime) return false;

        try {
            const now = new Date();
            const cleanDate = dateStr.split('T')[0];
            const [year, month, day] = cleanDate.split('-').map(Number);
            const [hours, minutes] = finalTime.split(':').map(Number);
            const bookingEnd = new Date(year, month - 1, day, hours, minutes);
            return now > bookingEnd;
        } catch (e) {
            return false;
        }
    };

    const fetchData = async () => {
        try {
            const res = await api.get('/bookings');
            const allData: Booking[] = res.data;

            // 1. Aktif: Pending ATAU (Approved & Belum Expired)
            setActiveBookings(allData.filter(b => 
                b.status === 'Pending' || 
                (b.status === 'Approved' && !isExpired(b.date, b.endTime, b.time))
            ));

            // 2. History: Approved & Sudah Expired
            setHistoryBookings(allData.filter(b => 
                b.status === 'Approved' && isExpired(b.date, b.endTime, b.time)
            ));

            // 3. Rejected
            setRejectedBookings(allData.filter(b => b.status === 'Rejected'));

            // Stats
            const todayStr = new Date().toISOString().split('T')[0];
            setStats({
                totalPending: allData.filter((b: any) => b.status === 'Pending').length,
                todayApproved: allData.filter((b: any) => b.status === 'Approved' && b.date === todayStr).length
            });
        } catch (err) { console.error(err); }
    };

    const updateStatus = async (id: number, newStatus: "Approved" | "Rejected") => {
        if(!confirm(`Ubah status menjadi ${newStatus}?`)) return;
        try {
            await api.put(`/bookings/${id}/status`, newStatus, { headers: { 'Content-Type': 'application/json' } });
            fetchData();
        } catch (error: any) { alert("Gagal update."); }
    };

    const handleLogout = () => { localStorage.removeItem('user'); navigateWithDelay('/login'); };

    // Helper Tab
    const TabButton = ({ id, label, count }: any) => (
        <button 
            onClick={() => setCurrentTab(id)}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                currentTab === id ? 'border-primary-600 text-primary-700 bg-primary-50' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
            {label} ({count})
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <nav className="bg-slate-900 text-white px-6 py-4 sticky top-0 z-40 shadow-md flex justify-between items-center">
                <span className="text-xl font-bold">Manruka<span className="text-primary-400">Admin</span></span>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-bold transition">Logout</button>
            </nav>

            <main className="max-w-7xl mx-auto p-6 lg:p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Admin Control</h1>
                    <button onClick={() => navigateWithDelay('/admin-dashboard/create-booking')} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all">⚡ Admin Quick Booking</button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
                        <h3 className="text-4xl font-bold text-yellow-700">{stats.totalPending}</h3>
                        <p className="text-yellow-800 font-medium">Menunggu Persetujuan</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
                        <h3 className="text-4xl font-bold text-green-700">{stats.todayApproved}</h3>
                        <p className="text-green-800 font-medium">Terpakai Hari Ini</p>
                    </div>
                </div>

                {/* TAB SECTION */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex border-b border-slate-200">
                        <TabButton id="active" label="Request & Jadwal Aktif" count={activeBookings.length} />
                        <TabButton id="history" label="Arsip Riwayat (Selesai)" count={historyBookings.length} />
                        <TabButton id="rejected" label="Ditolak" count={rejectedBookings.length} />
                    </div>

                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b">
                            <tr>
                                <th className="px-6 py-3">Peminjam</th>
                                <th className="px-6 py-3">Detail</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(currentTab === 'active' ? activeBookings : currentTab === 'history' ? historyBookings : rejectedBookings).map(b => (
                                <tr key={b.id} className={`hover:bg-slate-50 ${currentTab !== 'active' ? 'opacity-70' : ''}`}>
                                    <td className="px-6 py-4 font-bold">{b.borrowerName}</td>
                                    <td className="px-6 py-4">{b.roomName}<br/><span className="text-xs text-slate-400">{b.date} ({b.time})</span></td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            b.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                            b.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {b.status === 'Approved' && isExpired(b.date, b.endTime, b.time) ? 'Selesai' : b.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {/* Tombol Aksi HANYA muncul di Tab Active & Status Pending */}
                                        {currentTab === 'active' && b.status === 'Pending' && (
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => updateStatus(b.id, 'Approved')} className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded transition">✓</button>
                                                <button onClick={() => updateStatus(b.id, 'Rejected')} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition">✕</button>
                                            </div>
                                        )}
                                        {currentTab !== 'active' && <span className="text-slate-400 text-xs">-</span>}
                                    </td>
                                </tr>
                            ))}
                            {(currentTab === 'active' ? activeBookings : currentTab === 'history' ? historyBookings : rejectedBookings).length === 0 && (
                                <tr><td colSpan={4} className="text-center py-6 text-slate-400">Data Kosong.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}