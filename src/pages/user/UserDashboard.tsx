import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useLoading } from '../../context/LoadingContext';

interface Booking { id: number; roomName: string; date: string; time: string; status: string; borrowerName: string; }

export default function UserDashboard() {
    const { navigateWithDelay } = useLoading();
    const [user, setUser] = useState<any>(null);
    const [myBookings, setMyBookings] = useState<Booking[]>([]);
    const [allSchedule, setAllSchedule] = useState<Booking[]>([]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) { navigateWithDelay('/login'); return; }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchBookings(parsedUser.name);
    }, []);

    const fetchBookings = async (userName: string) => {
        try {
            const res = await api.get('/bookings');
            setMyBookings(res.data.filter((b: any) => b.borrowerName === userName));
            setAllSchedule(res.data.filter((b: any) => b.status === 'Approved' || b.status === 'Pending'));
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigateWithDelay('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-800">Manruka<span className="text-primary-600">User</span></span>
                </div>
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
                    <button onClick={() => navigateWithDelay('/user-dashboard/create-booking')} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-primary-500/30 transition-all flex items-center gap-2">
                        + Booking Baru
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Jadwal Publik */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700">📅 Jadwal Ruangan Aktif</div>
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
                                    {allSchedule.map(b => (
                                        <tr key={b.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium">{b.roomName}</td>
                                            <td className="px-6 py-4">{b.date}<br/><span className="text-xs text-slate-400">{b.time}</span></td>
                                            <td className="px-6 py-4">{b.borrowerName}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${b.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* History Saya */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
                        <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Riwayat Saya</h3>
                        <div className="space-y-4">
                            {myBookings.map(b => (
                                <div key={b.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-primary-200 transition-all">
                                    <div className="flex justify-between mb-2">
                                        <h4 className="font-bold text-slate-700">{b.roomName}</h4>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${b.status === 'Approved' ? 'bg-green-100 text-green-700' : b.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">{b.date} • {b.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}