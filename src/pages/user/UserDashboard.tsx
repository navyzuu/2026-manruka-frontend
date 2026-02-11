import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useLoading } from '../../context/LoadingContext';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import UserBookingForm from '../../components/UserBookingForm';

interface Booking { 
    id: number; 
    roomId: number;
    roomName: string; 
    date: string; 
    time: string;       
    startTime?: string; 
    endTime?: string;   
    status: string; 
    borrowerName: string;
    purpose?: string;
}

interface Room {
    id: number;
    name: string;
    capacity: number;
    description?: string;
}

export default function UserDashboard() {
    const { navigateWithDelay, setLoadingManual } = useLoading();
    const [user, setUser] = useState<any>(null);
    
    // State Data
    const [rooms, setRooms] = useState<Room[]>([]);
    const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
    const [historyBookings, setHistoryBookings] = useState<Booking[]>([]);
    const [rejectedBookings, setRejectedBookings] = useState<Booking[]>([]);
    const [publicSchedule, setPublicSchedule] = useState<Booking[]>([]);

    // State UI
    const [currentTab, setCurrentTab] = useState('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState<Booking | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) { navigateWithDelay('/login'); return; }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        loadInitialData(parsedUser.name);
    }, []);

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

    const loadInitialData = async (userName: string) => {
        try {
            const [resBookings, resRooms] = await Promise.all([
                api.get('/bookings'),
                api.get('/rooms')
            ]);

            setRooms(resRooms.data);
            const allData: Booking[] = resBookings.data;
            const myData = allData.filter(b => b.borrowerName === userName);

            setPublicSchedule(allData.filter(b => 
                (b.status === 'Approved' || b.status === 'Pending') && 
                !isExpired(b.date, b.endTime, b.time)
            ));

            setActiveBookings(myData.filter(b => 
                b.status === 'Pending' || 
                (b.status === 'Approved' && !isExpired(b.date, b.endTime, b.time))
            ));
            setHistoryBookings(myData.filter(b => 
                b.status === 'Approved' && isExpired(b.date, b.endTime, b.time)
            ));
            setRejectedBookings(myData.filter(b => b.status === 'Rejected'));

        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin membatalkan peminjaman ini?")) return;
        setLoadingManual(true);
        try {
            await api.delete(`/bookings/${id}`);
            alert("Booking berhasil dibatalkan.");
            if (user) loadInitialData(user.name);
        } catch (error: any) {
            alert("Gagal membatalkan: " + (error.response?.data || error.message));
        } finally {
            setLoadingManual(false);
        }
    };

    const handleEdit = (booking: Booking) => {
        setEditingData(booking); 
        setIsModalOpen(true);    
    };

    const handleCreateNew = () => {
        setEditingData(null);    
        setIsModalOpen(true);    
    };

    const filterData = (data: Booking[]) => {
        if (!searchQuery) return data;
        const q = searchQuery.toLowerCase();
        return data.filter(b => {
            if (b.roomName.toLowerCase().includes(q)) return true;
            const [year, month, day] = b.date.split('-');
            const formats = [b.date, `${day}/${month}/${year}`, `${day}-${month}-${year}`, `${month}/${year}`, year, month, day];
            return formats.some(f => f.includes(q));
        });
    };

    const handleLogout = () => { localStorage.removeItem('user'); navigateWithDelay('/login'); };
    
    const TabButton = ({ id, label, count, colorClass }: any) => (
        <button onClick={() => setCurrentTab(id)} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${currentTab === id ? `border-primary-600 text-primary-700 bg-primary-50` : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
            {label} {count > 0 && <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full text-white ${colorClass}`}>{count}</span>}
        </button>
    );

    // --- TABLE COMPONENT (Sidebar Version - Lebih Ringkas) ---
    const BookingTableCompact = ({ data, emptyMsg }: { data: Booking[], emptyMsg: string }) => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 border-b text-xs">
                    <tr>
                        <th className="px-4 py-2">Ruang & Waktu</th>
                        <th className="px-4 py-2 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.length === 0 ? (
                        <tr><td colSpan={2} className="text-center py-6 text-slate-400 italic text-xs">{emptyMsg}</td></tr>
                    ) : (
                        data.map(b => (
                            <tr key={b.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <div className="font-bold text-slate-700 text-xs">{b.roomName}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">{b.date} • {b.time}</div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.status === 'Approved' ? 'bg-green-100 text-green-700' : b.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {b.status === 'Approved' && isExpired(b.date, b.endTime, b.time) ? 'Selesai' : b.status}
                                        </span>
                                        {/* Action Buttons (Compact) */}
                                        {currentTab === 'active' && b.status === 'Pending' && (
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEdit(b)} className="text-blue-600 hover:text-blue-800" title="Edit">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                </button>
                                                <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:text-red-800" title="Cancel">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
            <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50 shadow-sm flex justify-between items-center">
                <span className="text-xl font-bold text-slate-800 tracking-tight">Manruka<span className="text-primary-600">User</span></span>
                <div className="flex items-center gap-6">
                    <span className="text-sm text-slate-500 hidden md:block">Login sebagai: <b>{user?.name}</b></span>
                    <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition">Logout</button>
                </div>
            </nav>

            <main className="w-[95%] max-w-[2400px] mx-auto mt-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Dashboard Mahasiswa</h1>
                        <p className="text-slate-500 mt-1">Pantau jadwal dan kelola peminjaman ruangan.</p>
                    </div>
                    <button onClick={handleCreateNew} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-primary-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-1">
                        <span className="text-xl">+</span> Buat Peminjaman
                    </button>
                </div>

                {/* INFO RUANGAN GRID */}
                <div className="mb-10">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <span className="w-2 h-8 bg-primary-500 rounded-full"></span>
                        Info Ruangan
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-5">
                        {rooms.map(room => (
                            <div key={room.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group cursor-default flex flex-col h-full">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="bg-blue-50 group-hover:bg-blue-100 p-2.5 rounded-lg text-blue-600 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Kaps: {room.capacity}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg">{room.name}</h4>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed flex-grow">
                                    {room.description || "Fasilitas lengkap untuk kegiatan akademik."}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- FIX LAYOUT: Gunakan min-w-0 agar tidak overflow --- */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
                    
                    {/* KOLOM KIRI (75%): JADWAL PUBLIK */}
                    {/* min-w-0 SANGAT PENTING DISINI */}
                    <div className="xl:col-span-3 min-w-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-700">📅 Jadwal Ruangan Aktif (Publik)</h3>
                                <p className="text-xs text-slate-500">Realtime Update - Semua Peminjaman</p>
                            </div>
                            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">Live</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left table-fixed"> {/* table-fixed membantu layout */}
                                <thead className="bg-slate-50 text-slate-500 border-b">
                                    <tr>
                                        <th className="w-1/4 px-6 py-4">Ruangan</th>
                                        <th className="w-1/4 px-6 py-4">Waktu</th>
                                        <th className="w-1/4 px-6 py-4">Peminjam</th>
                                        <th className="w-1/4 px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filterData(publicSchedule).length === 0 ? (
                                        <tr><td colSpan={4} className="text-center py-10 text-slate-400">Tidak ada jadwal aktif saat ini.</td></tr>
                                    ) : (
                                        filterData(publicSchedule).map(b => (
                                            <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-700 truncate">{b.roomName}</td>
                                                <td className="px-6 py-4 truncate">{b.date}<br/><span className="text-xs text-slate-400">{b.time}</span></td>
                                                <td className="px-6 py-4 truncate">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                                                            {b.borrowerName.charAt(0)}
                                                        </div>
                                                        <span className="truncate">{b.borrowerName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${b.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* KOLOM KANAN (25%): SIDEBAR */}
                    {/* min-w-0 SANGAT PENTING DISINI */}
                    <div className="xl:col-span-1 min-w-0 h-fit sticky top-24 space-y-6">
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[600px] 2xl:h-[700px]">
                            <div className="p-4 border-b border-slate-100 bg-slate-50">
                                <h3 className="font-bold text-slate-800 mb-3 text-sm">📂 Data Saya</h3>
                                <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari..." />
                            </div>
                            <div className="flex border-b border-slate-200 bg-white">
                                <TabButton id="active" label="Aktif" count={filterData(activeBookings).length} colorClass="bg-blue-500" />
                                <TabButton id="history" label="Riwayat" count={filterData(historyBookings).length} colorClass="bg-slate-500" />
                                <TabButton id="rejected" label="Tolak" count={filterData(rejectedBookings).length} colorClass="bg-red-500" />
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                                {/* Gunakan Tabel Compact agar muat di sidebar */}
                                {currentTab === 'active' && <BookingTableCompact data={filterData(activeBookings)} emptyMsg="Kosong." />}
                                {currentTab === 'history' && <BookingTableCompact data={filterData(historyBookings)} emptyMsg="Kosong." />}
                                {currentTab === 'rejected' && <BookingTableCompact data={filterData(rejectedBookings)} emptyMsg="Kosong." />}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingData ? "Edit Peminjaman" : "Form Peminjaman Baru"}>
                <UserBookingForm 
                    initialData={editingData} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={() => { if (user) loadInitialData(user.name); }} 
                />
            </Modal>
        </div>
    );
}