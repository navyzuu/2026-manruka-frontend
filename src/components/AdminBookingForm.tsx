import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useLoading } from '../context/LoadingContext';

interface AdminBookingFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

interface Room { id: number; name: string; capacity: number; }
interface User { id: number; name: string; nrp: string; department: string; major: string; }

export default function AdminBookingForm({ onClose, onSuccess }: AdminBookingFormProps) {
    const { setLoadingManual } = useLoading();
    const [rooms, setRooms] = useState<Room[]>([]);
    
    // Auto-fill Data
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [targetUser, setTargetUser] = useState<User | null>(null);
    const [inputNrp, setInputNrp] = useState('');
    const [inputName, setInputName] = useState('');

    // Form Booking
    const [selectedRoom, setSelectedRoom] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('10:00');
    const [purpose, setPurpose] = useState('Kegiatan Akademik / Admin');

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [resRooms, resUsers] = await Promise.all([api.get('/rooms'), api.get('/users')]);
            setRooms(resRooms.data);
            setAllUsers(resUsers.data);
            if(resRooms.data.length > 0) setSelectedRoom(resRooms.data[0].id.toString());
        } catch (err) { console.error("Gagal load data modal", err); }
    };

    // ... LOGIKA AUTO-FILL (Copy dari kode sebelumnya) ...
    const handleNrpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value; setInputNrp(val);
        const found = allUsers.find(u => u.nrp === val);
        if (found) { setTargetUser(found); setInputName(found.name); } 
        else { setTargetUser(null); }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value; setInputName(val);
        const found = allUsers.find(u => u.name.toLowerCase() === val.toLowerCase());
        if (found) { setTargetUser(found); setInputNrp(found.nrp); } 
        else { setTargetUser(null); }
    };
    // ... END LOGIKA AUTO-FILL ...

    const handleAdminBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetUser) { alert("User tidak ditemukan!"); return; }

        setLoadingManual(true);
        try {
            // 1. Create Booking
            await api.post('/bookings', {
                userId: targetUser.id,
                roomId: parseInt(selectedRoom),
                bookingDate: date,
                startTime, endTime, purpose
            });

            // 2. Auto Approve Logic (Cari booking pending user tsb)
            const res = await api.get('/bookings');
            const bookingToApprove = res.data
                .filter((b: any) => b.borrowerName === targetUser.name && b.status === 'Pending')
                .sort((a: any, b: any) => b.id - a.id)[0]; // Ambil yg paling baru (ID terbesar)

            if (bookingToApprove) {
                await api.put(`/bookings/${bookingToApprove.id}/status`, "Approved", { headers: { 'Content-Type': 'application/json' } });
            }

            setLoadingManual(false);
            alert(`Booking untuk ${targetUser.name} Berhasil & Disetujui!`);
            onSuccess();
            onClose();

        } catch (error: any) {
            setLoadingManual(false);
            alert("Gagal Booking: " + (error.response?.data || error.message));
        }
    };

    return (
        <form onSubmit={handleAdminBooking} className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800 text-sm font-bold mb-4">
                ⚡ Auto-Approve Mode: Booking ini akan langsung disetujui.
            </div>

            {/* SECTION: DATA MAHASISWA */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cari NRP</label>
                        <input list="nrp-list" value={inputNrp} onChange={handleNrpChange} placeholder="Ketik NRP..." className="w-full px-4 py-2 border rounded-lg" required />
                        <datalist id="nrp-list">{allUsers.map(u => <option key={u.id} value={u.nrp}>{u.name}</option>)}</datalist>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cari Nama</label>
                        <input list="name-list" value={inputName} onChange={handleNameChange} placeholder="Ketik Nama..." className="w-full px-4 py-2 border rounded-lg" required />
                        <datalist id="name-list">{allUsers.map(u => <option key={u.id} value={u.name}>{u.nrp}</option>)}</datalist>
                    </div>
                </div>
            </div>

            {/* SECTION: DETAIL BOOKING */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Ruangan</label>
                    <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-xs text-slate-500">Tanggal</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required /></div>
                    <div><label className="text-xs text-slate-500">Mulai</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required /></div>
                    <div><label className="text-xs text-slate-500">Selesai</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required /></div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Keperluan</label>
                    <input value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                </div>
            </div>

            <div className="flex gap-4 pt-2">
                <button type="button" onClick={onClose} className="flex-1 bg-slate-200 hover:bg-slate-300 font-bold py-3 rounded-lg">Batal</button>
                <button type="submit" disabled={!targetUser} className={`flex-[2] text-white font-bold py-3 rounded-lg ${!targetUser ? 'bg-slate-400' : 'bg-slate-800 hover:bg-slate-900'}`}>Booking & Approve</button>
            </div>
        </form>
    );
}