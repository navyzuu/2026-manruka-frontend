import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useLoading } from '../context/LoadingContext';

interface UserBookingFormProps {
    onClose: () => void;
    onSuccess: () => void; // Untuk refresh data dashboard
}

interface Room { id: number; name: string; capacity: number; }

export default function UserBookingForm({ onClose, onSuccess }: UserBookingFormProps) {
    const { setLoadingManual } = useLoading();
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
        if (userData) setUser(JSON.parse(userData));

        api.get('/rooms').then(res => {
            setRooms(res.data);
            if (res.data.length > 0) setSelectedRoom(res.data[0].id.toString());
        }).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingManual(true);
        try {
            await api.post('/bookings', {
                userId: user.id,
                roomId: parseInt(selectedRoom),
                bookingDate: date,
                startTime, endTime, purpose
            });
            
            setLoadingManual(false);
            alert("Pengajuan Berhasil!");
            onSuccess(); // Refresh dashboard
            onClose();   // Tutup modal
        } catch (error: any) {
            setLoadingManual(false);
            alert("Gagal: " + (error.response?.data || error.message));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Ruangan</label>
                    <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                        {rooms.map(r => (
                            <option key={r.id} value={r.id}>{r.name} (Kapasitas: {r.capacity})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Jam Mulai</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Jam Selesai</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keperluan</label>
                <textarea value={purpose} onChange={e => setPurpose(e.target.value)} rows={3} placeholder="Contoh: Sidang Tugas Akhir..." required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"></textarea>
            </div>

            <div className="flex gap-4 pt-2">
                <button type="button" onClick={onClose} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-lg transition">Batal</button>
                <button type="submit" className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition">Kirim Pengajuan</button>
            </div>
        </form>
    );
}