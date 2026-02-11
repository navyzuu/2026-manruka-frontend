import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useLoading } from '../../context/LoadingContext';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import AdminBookingForm from '../../components/AdminBookingForm';

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

interface Room { 
    id: number; 
    name: string; 
    capacity: number; 
    description?: string; // Field deskripsi
}

export default function AdminDashboard() {
    const { navigateWithDelay } = useLoading();
    
    // State Data
    const [rooms, setRooms] = useState<Room[]>([]);
    const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
    const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
    const [rejectedBookings, setRejectedBookings] = useState<Booking[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Stats & UI State
    const [stats, setStats] = useState({ totalPending: 0, todayApproved: 0, totalRejected: 0 });
    const [currentTab, setCurrentTab] = useState('active');
    const [isModalOpen, setIsModalOpen] = useState(false); // State Modal

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user || JSON.parse(user).role !== 'Admin') { navigateWithDelay('/login'); return; }
        fetchData();
    }, []);

    // Time Logic
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
        } catch (e) { return false; }
    };

    const fetchData = async () => {
        try {
            // Fetch Bookings AND Rooms
            const [resBookings, resRooms] = await Promise.all([
                api.get('/bookings'),
                api.get('/rooms')
            ]);
            
            setRooms(resRooms.data); // Simpan data ruangan
            const allData: Booking[] = resBookings.data;

            setActiveBookings(allData.filter(b => b.status === 'Pending' || (b.status === 'Approved' && !isExpired(b.date, b.endTime, b.time))));
            setHistoryBookings(allData.filter(b => b.status === 'Approved' && isExpired(b.date, b.endTime, b.time)));
            setRejectedBookings(allData.filter(b => b.status === 'Rejected'));

            const todayStr = new Date().toISOString().split('T')[0];
            setStats({
                totalPending: allData.filter((b: any) => b.status === 'Pending').length,
                todayApproved: allData.filter((b: any) => b.status === 'Approved' && b.date === todayStr).length,
                totalRejected: allData.filter((b: any) => b.status === 'Rejected').length
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

    const TabButton = ({ id, label, count }: any) => (
        <button onClick={() => setCurrentTab(id)} className={`px-8 py-4 font-bold text-sm transition-colors border-b-2 ${currentTab === id ? 'border-primary-600 text-primary-700 bg-primary-50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {label} ({count})
        </button>
    );

    const filterData = (data: Booking[]) => {
        if (!searchQuery) return data;
        const q = searchQuery.toLowerCase();
        return data.filter(b => {
            if (b.borrowerName.toLowerCase().includes(q) || b.roomName.toLowerCase().includes(q)) return true;
            const [year, month, day] = b.date.split('-');
            const formats = [b.date, `${day}/${month}/${year}`, `${day}-${month}-${year}`, `${month}/${year}`, year, month, day];
            return formats.some(f => f.includes(q));
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-10">
            {/* NAVBAR */}
            <nav className="bg-slate-900 text-white px-8 py-4 sticky top-0 z-50 shadow-md flex justify-between items-center">
                <span className="text-xl font-bold tracking-tight">Manruka<span className="text-primary-400">Admin</span></span>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg text-sm font-bold transition shadow-lg">Logout</button>
            </nav>

            {/* CONTAINER 95% Width */}
            <main className="w-[95%] max-w-[2400px] mx-auto mt-8">
                
                {/* HEADER */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Admin Control Panel</h1>
                        <p className="text-slate-500">Kelola persetujuan dan data ruangan.</p>
                    </div>
                    {/* BUTTON MODAL */}
                    <button onClick={() => setIsModalOpen(true)} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2">
                        ⚡ Admin Quick Booking
                    </button>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-yellow-100 text-yellow-600 rounded-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Menunggu</p>
                            <h3 className="text-4xl font-extrabold text-slate-800">{stats.totalPending}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-green-100 text-green-600 rounded-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Terpakai Hari Ini</p>
                            <h3 className="text-4xl font-extrabold text-slate-800">{stats.todayApproved}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                        <div className="p-4 bg-red-100 text-red-600 rounded-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-wide">Total Ditolak</p>
                            <h3 className="text-4xl font-extrabold text-slate-800">{stats.totalRejected}</h3>
                        </div>
                    </div>
                     <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-sm text-white flex items-center justify-between">
                        <div>
                            <p className="text-slate-300 text-sm font-medium">System Status</p>
                            <h3 className="text-2xl font-bold mt-1">Online 🟢</h3>
                        </div>
                        <div className="text-right">
                             <p className="text-xs text-slate-400">Ver 1.3.0</p>
                        </div>
                    </div>
                </div>

                {/* INFO RUANGAN GRID (ADMIN VIEW) */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">Daftar Ruangan</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-5">
                        {rooms.map(room => (
                            <div key={room.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 border border-slate-200 px-2 py-1 rounded">Cap: {room.capacity}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-md">{room.name}</h4>
                                {/* DESKRIPSI DINAMIS */}
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed flex-grow">
                                    {room.description || "Deskripsi belum diatur."}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* MAIN TABLE SECTION */}
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden min-h-[500px]">
                    <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <div className="w-full max-w-lg">
                             <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari Nama Peminjam, Ruangan, atau Tanggal..." />
                        </div>
                    </div>
                    <div className="flex border-b border-slate-200 bg-white">
                        <TabButton id="active" label="Request & Jadwal Aktif" count={filterData(activeBookings).length} />
                        <TabButton id="history" label="Arsip Riwayat (Selesai)" count={filterData(historyBookings).length} />
                        <TabButton id="rejected" label="Ditolak" count={filterData(rejectedBookings).length} />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 border-b uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-8 py-4">Peminjam</th>
                                    <th className="px-8 py-4">Ruangan & Waktu</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filterData(currentTab === 'active' ? activeBookings : currentTab === 'history' ? historyBookings : rejectedBookings).map(b => (
                                    <tr key={b.id} className={`hover:bg-slate-50 transition-colors ${currentTab !== 'active' ? 'opacity-80' : ''}`}>
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-800 text-base">{b.borrowerName}</div>
                                            <div className="text-xs text-slate-500">Mahasiswa</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-medium text-slate-700">{b.roomName}</div>
                                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                <span>📅 {b.date}</span>
                                                <span>⏰ {b.time}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                                                b.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                b.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                                {b.status === 'Approved' && isExpired(b.date, b.endTime, b.time) ? 'Selesai' : b.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            {currentTab === 'active' && b.status === 'Pending' && (
                                                <div className="flex justify-center gap-3">
                                                    <button onClick={() => updateStatus(b.id, 'Approved')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition text-xs font-bold">Approve</button>
                                                    <button onClick={() => updateStatus(b.id, 'Rejected')} className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded shadow-sm transition text-xs font-bold">Reject</button>
                                                </div>
                                            )}
                                            {currentTab !== 'active' && <span className="text-slate-300 text-xl">•</span>}
                                        </td>
                                    </tr>
                                ))}
                                {filterData(currentTab === 'active' ? activeBookings : currentTab === 'history' ? historyBookings : rejectedBookings).length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-12 text-slate-400 italic">Tidak ada data yang cocok dengan filter.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>

            {/* MODAL ADMIN BOOKING */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="⚡ Admin Quick Booking">
                <AdminBookingForm 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={() => fetchData()} 
                />
            </Modal>
        </div>
    );
}