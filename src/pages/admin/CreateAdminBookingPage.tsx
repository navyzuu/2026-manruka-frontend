import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useLoading } from '../../context/LoadingContext';

interface Room { id: number; name: string; capacity: number; }
interface User { id: number; name: string; nrp: string; department: string; major: string; }

export default function CreateAdminBookingPage() {
    const { navigateWithDelay, setLoadingManual } = useLoading();
    const [rooms, setRooms] = useState<Room[]>([]);
    
    // Data Users untuk Auto-fill
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [targetUser, setTargetUser] = useState<User | null>(null);

    // Form State (Input Pencarian)
    const [inputNrp, setInputNrp] = useState('');
    const [inputName, setInputName] = useState('');

    // Form Booking
    const [selectedRoom, setSelectedRoom] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('10:00');
    const [purpose, setPurpose] = useState('Kegiatan Akademik / Admin');

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user || JSON.parse(user).role !== 'Admin') { navigateWithDelay('/login'); return; }
        
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            // Fetch Rooms & Users (Parallel)
            // NOTE: Pastikan Backend punya endpoint GET /users yang mengembalikan semua user
            const [resRooms, resUsers] = await Promise.all([
                api.get('/rooms'),
                api.get('/users') 
            ]);

            setRooms(resRooms.data);
            setAllUsers(resUsers.data);

            if(resRooms.data.length > 0) setSelectedRoom(resRooms.data[0].id.toString());
        } catch (err) {
            console.error("Gagal load data:", err);
            // Fallback jika /users error (misal belum diimplementasi di backend)
            api.get('/rooms').then(res => setRooms(res.data));
        }
    };

    // LOGIKA AUTO-FILL SAAT KETIK NRP
    const handleNrpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputNrp(val);
        
        // Cari user yang NRP-nya cocok persis
        const found = allUsers.find(u => u.nrp === val);
        if (found) {
            setTargetUser(found);
            setInputName(found.name); // Auto-fill Nama
        } else {
            setTargetUser(null);
            if(inputName && allUsers.find(u => u.name === inputName)?.nrp !== val) {
                 // Jangan clear nama jika user sedang mengetik manual (opsional logic)
            }
        }
    };

    // LOGIKA AUTO-FILL SAAT KETIK NAMA
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputName(val);

        // Cari user by Name (Case insensitive)
        const found = allUsers.find(u => u.name.toLowerCase() === val.toLowerCase());
        if (found) {
            setTargetUser(found);
            setInputNrp(found.nrp); // Auto-fill NRP
        } else {
            setTargetUser(null);
        }
    };

    const handleAdminBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validasi: User harus ditemukan di database
        if (!targetUser) {
            alert("User tidak ditemukan! Pastikan NRP/Nama sesuai data mahasiswa terdaftar.");
            return;
        }

        setLoadingManual(true);
        try {
            // 1. Create Booking (Atas nama Target User, bukan Admin)
            await api.post('/bookings', {
                userId: targetUser.id, // ID Mahasiswa yang dipinjamkan
                roomId: parseInt(selectedRoom),
                bookingDate: date,
                startTime, endTime, purpose
            });

            // 2. Auto Approve Logic (Cari booking pending mahasiswa tersebut)
            const res = await api.get('/bookings');
            const bookingToApprove = res.data
                .filter((b: any) => b.borrowerName === targetUser.name && b.status === 'Pending')
                .sort((a: any, b: any) => b.id - a.id)[0];

            if (bookingToApprove) {
                await api.put(`/bookings/${bookingToApprove.id}/status`, "Approved", { headers: { 'Content-Type': 'application/json' } });
            }

            setTimeout(() => {
                setLoadingManual(false);
                alert(`Booking untuk ${targetUser.name} Berhasil & Disetujui!`);
                navigateWithDelay('/admin-dashboard');
            }, 800);

        } catch (error: any) {
            setLoadingManual(false);
            alert("Gagal Booking: " + (error.response?.data || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
                
                <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200 shadow-sm">
                    ⚡ Auto-Approve Mode
                </div>

                <div className="p-8 border-b border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-800">Admin Quick Booking</h2>
                    <p className="text-slate-500 mt-1">Booking atas nama Mahasiswa (Otomatis Disetujui).</p>
                </div>
                
                <form onSubmit={handleAdminBooking} className="p-8 space-y-6">
                    
                    {/* SECTION: DATA MAHASISWA (AUTO-FILL) */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                        <h3 className="text-sm font-bold text-primary-700 uppercase tracking-wide">Data Peminjam</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cari NRP</label>
                                <input 
                                    list="nrp-list"
                                    value={inputNrp} 
                                    onChange={handleNrpChange}
                                    placeholder="Ketik NRP..." 
                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                                    required 
                                />
                                <datalist id="nrp-list">
                                    {allUsers.map(u => <option key={u.id} value={u.nrp}>{u.name}</option>)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cari Nama</label>
                                <input 
                                    list="name-list"
                                    value={inputName}
                                    onChange={handleNameChange}
                                    placeholder="Ketik Nama..." 
                                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                                    required 
                                />
                                <datalist id="name-list">
                                    {allUsers.map(u => <option key={u.id} value={u.name}>{u.nrp}</option>)}
                                </datalist>
                            </div>
                        </div>

                        {/* READ ONLY FIELDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Departemen (Otomatis)</label>
                                <input 
                                    value={targetUser?.department || '-'} 
                                    readOnly 
                                    className="w-full px-4 py-2 bg-slate-200 border border-slate-300 rounded-lg text-slate-600 font-medium cursor-not-allowed" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Jurusan (Otomatis)</label>
                                <input 
                                    value={targetUser?.major || '-'} 
                                    readOnly 
                                    className="w-full px-4 py-2 bg-slate-200 border border-slate-300 rounded-lg text-slate-600 font-medium cursor-not-allowed" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: DETAIL BOOKING */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-primary-700 uppercase tracking-wide">Detail Peminjaman</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Ruangan</label>
                            <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition">
                                {rooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} (Kapasitas: {r.capacity})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mulai</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Selesai</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Keperluan</label>
                            <input value={purpose} onChange={e => setPurpose(e.target.value)} required className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition" />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => navigateWithDelay('/admin-dashboard')} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-lg transition-colors">
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={!targetUser} // Cegah submit jika user tidak valid
                            className={`flex-[2] text-white font-bold py-3 rounded-lg shadow-lg transition-all flex justify-center items-center gap-2
                                ${!targetUser ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-900 hover:shadow-xl transform active:scale-[0.98]'}
                            `}
                        >
                            <span>Booking & Approve</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}