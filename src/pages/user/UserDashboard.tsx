import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useLoading } from '../../context/LoadingContext';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import UserBookingForm from '../../components/UserBookingForm';

// --- Interfaces ---
interface Booking { 
    id: number; 
    roomName: string; 
    date: string; 
    time: string;       
    startTime?: string; 
    endTime?: string;   
    status: string; 
    borrowerName: string; 
}

interface Room {
    id: number;
    name: string;
    capacity: number;
    description?: string; // Field deskripsi dari database
}

export default function UserDashboard() {
    const { navigateWithDelay } = useLoading();
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
    const [isModalOpen, setIsModalOpen] = useState(false); // State untuk Modal

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) { navigateWithDelay('/login'); return; }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        loadInitialData(parsedUser.name);
    }, []);

    // --- Logic Time Helper ---
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

    // --- Fetch Data ---
    const loadInitialData = async (userName: string) => {
        try {
            const [resBookings, resRooms] = await Promise.all([
                api.get('/bookings'),
                api.get('/rooms')
            ]);

            setRooms(resRooms.data); // Simpan data ruangan

            const allData: Booking[] = resBookings.data;
            const myData = allData.filter(b => b.borrowerName === userName);

            // Filter Global
            setPublicSchedule(allData.filter(b => 
                (b.status === 'Approved' || b.status === 'Pending') && 
                !isExpired(b.date, b.endTime, b.time)
            ));

            // Filter Personal
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

    // --- Filter Helper ---
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
    
    // --- Components Kecil ---
    const TabButton = ({ id, label, count, colorClass }: any) => (
        <button onClick={() => setCurrentTab(id)} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${currentTab === id ? `border-primary-600 text-primary-700 bg-primary-50` : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
            {label} {count > 0 && <span className={`ml-2 text-xs px-2 py-0.5 rounded-full text-white ${colorClass}`}>{count}</span>}
        </button>
    );

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
                        <tr><td colSpan={3} className="text-center py-8 text-slate-400 italic">{emptyMsg}</td></tr>
                    ) : (
                        data.map(b => (
                            <tr key={b.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-slate-700">{b.roomName}</td>
                                <td className="px-6 py-4">{b.date}<br/><span className="text-xs text-slate-400">{b.time}</span></td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${b.status === 'Approved' ? 'bg-green-100 text-green-700' : b.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-10">
            {/* NAVBAR */}
            <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50 shadow-sm flex justify-between items-center">
                <span className="text-xl font-bold text-slate-800 tracking-tight">Manruka<span className="text-primary-600">User</span></span>
                <div className="flex items-center gap-6">
                    <span className="text-sm text-slate-500 hidden md:block">Login sebagai: <b>{user?.name}</b></span>
                    <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition">Logout</button>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="w-[95%] max-w-[2400px] mx-auto mt-8">
                
                {/* HEADER */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Dashboard Mahasiswa</h1>
                        <p className="text-slate-500 mt-1">Pantau jadwal dan kelola peminjaman ruangan.</p>
                    </div>
                    {/* BUTTON BUKA MODAL */}
                    <button onClick={() => setIsModalOpen(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-primary-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-1">
                        <span className="text-xl">+</span> Buat Peminjaman
                    </button>
                </div>

                {/* SECTION 1: ROOM GRID */}
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
                                {/* DESKRIPSI DINAMIS */}
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed flex-grow">
                                    {room.description || "Fasilitas lengkap untuk kegiatan akademik."}
                                </p>
                            </div>
                        ))}
                        {rooms.length === 0 && <div className="col-span-full text-slate-400 text-sm italic">Memuat data ruangan...</div>}
                    </div>
                </div>

                {/* SECTION 2: SPLIT LAYOUT (3:1) */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    
                    {/* KOLOM KIRI (75%): JADWAL PUBLIK */}
                    <div className="xl:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-700">📅 Jadwal Ruangan Aktif (Publik)</h3>
                                <p className="text-xs text-slate-500">Realtime Update - Semua Peminjaman</p>
                            </div>
                            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">Live</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 border-b">
                                    <tr>
                                        <th className="px-6 py-4">Ruangan</th>
                                        <th className="px-6 py-4">Waktu</th>
                                        <th className="px-6 py-4">Peminjam</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filterData(publicSchedule).length === 0 ? (
                                        <tr><td colSpan={4} className="text-center py-10 text-slate-400">Tidak ada jadwal aktif saat ini.</td></tr>
                                    ) : (
                                        filterData(publicSchedule).map(b => (
                                            <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-700">{b.roomName}</td>
                                                <td className="px-6 py-4">{b.date}<br/><span className="text-xs text-slate-400">{b.time}</span></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                            {b.borrowerName.charAt(0)}
                                                        </div>
                                                        {b.borrowerName}
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
                    <div className="xl:col-span-1 h-fit sticky top-24 space-y-6">
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[600px] 2xl:h-[700px]">
                            <div className="p-5 border-b border-slate-100 bg-slate-50">
                                <h3 className="font-bold text-slate-800 mb-3">📂 Data Saya</h3>
                                <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Cari Ruangan / Tanggal..." />
                            </div>
                            <div className="flex border-b border-slate-200 bg-white">
                                <TabButton id="active" label="Aktif" count={filterData(activeBookings).length} colorClass="bg-blue-500" />
                                <TabButton id="history" label="Riwayat" count={filterData(historyBookings).length} colorClass="bg-slate-500" />
                                <TabButton id="rejected" label="Ditolak" count={filterData(rejectedBookings).length} colorClass="bg-red-500" />
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                                {currentTab === 'active' && <BookingTable data={filterData(activeBookings)} emptyMsg="Tidak ada booking aktif." />}
                                {currentTab === 'history' && <BookingTable data={filterData(historyBookings)} emptyMsg="Belum ada riwayat." />}
                                {currentTab === 'rejected' && <BookingTable data={filterData(rejectedBookings)} emptyMsg="Bersih! Tidak ada penolakan." />}
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* MODAL USER BOOKING */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Form Peminjaman Ruangan">
                <UserBookingForm 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={() => {
                        if (user) loadInitialData(user.name);
                    }} 
                />
            </Modal>
        </div>
    );
}