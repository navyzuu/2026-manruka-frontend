import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useLoading } from '../../context/LoadingContext';

interface Room { id: number; name: string; capacity: number; }

export default function CreateBookingPage() {
    const { navigateWithDelay, setLoadingManual } = useLoading();
    const [rooms, setRooms] = useState<Room[]>([]);
    
    // Form State
    const [selectedRoom, setSelectedRoom] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('10:00');
    const [purpose, setPurpose] = useState('');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) { navigateWithDelay('/login'); return; }
        setUser(JSON.parse(userData));

        api.get('/rooms').then(res => {
            setRooms(res.data);
            if (res.data.length > 0) setSelectedRoom(res.data[0].id.toString());
        }).catch(console.error);
    }, []);

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingManual(true);
        try {
            await api.post('/bookings', {
                userId: user.id,
                roomId: parseInt(selectedRoom),
                bookingDate: date,
                startTime, endTime, purpose
            });
            setTimeout(() => {
                setLoadingManual(false);
                alert("Pengajuan Berhasil!");
                navigateWithDelay('/user-dashboard');
            }, 800);
        } catch (error: any) {
            setLoadingManual(false);
            alert("Gagal: " + (error.response?.data || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                
                {/* Header Card */}
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-xl font-bold">Ajukan Peminjaman</h2>
                        <p className="text-slate-400 text-sm">Isi detail kebutuhan ruangan Anda.</p>
                    </div>
                    <button onClick={() => navigateWithDelay('/user-dashboard')} className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition">
                        &larr; Batal
                    </button>
                </div>
                
                <form onSubmit={handleCreateBooking} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Ruangan</label>
                            <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition">
                                {rooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} (Kapasitas: {r.capacity})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Jam Mulai</label>
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Jam Selesai</label>
                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Keperluan</label>
                        <textarea value={purpose} onChange={e => setPurpose(e.target.value)} rows={3} placeholder="Contoh: Sidang Tugas Akhir, Rapat Himpunan..." required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"></textarea>
                    </div>

                    <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.98]">
                        Kirim Pengajuan
                    </button>
                </form>
            </div>
        </div>
    );
}