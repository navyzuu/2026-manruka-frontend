import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useNavigate } from 'react-router-dom';

interface Room {
    id: number;
    name: string;
    capacity: number;
}

export default function CreateBookingPage() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<Room[]>([]);
    
    // Form State
    const [selectedRoom, setSelectedRoom] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('10:00');
    const [purpose, setPurpose] = useState('');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Cek Login
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(userData));
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await api.get('/rooms');
            setRooms(res.data);
            if (res.data.length > 0) setSelectedRoom(res.data[0].id.toString());
        } catch (err) {
            console.error("Gagal ambil data ruangan", err);
        }
    };

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRoom || !date) return alert("Lengkapi data!");

        try {
            await api.post('/bookings', {
                userId: user.id,
                roomId: parseInt(selectedRoom),
                bookingDate: date,
                startTime: startTime,
                endTime: endTime,
                purpose: purpose
            });
            alert("Pengajuan Berhasil!");
            navigate('/user-dashboard'); // Kembali ke dashboard setelah sukses
        } catch (error: any) {
            alert("Gagal: " + (error.response?.data || error.message));
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <button onClick={() => navigate('/user-dashboard')} style={{ marginBottom: 20, padding: '5px 10px', cursor: 'pointer' }}>&larr; Kembali ke Dashboard</button>
            
            <div style={{ background: '#f8f9fa', padding: 30, borderRadius: 8, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginTop: 0, color: '#333' }}>📝 Form Peminjaman Ruangan</h2>
                <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div>
                        <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Pilih Ruangan</label>
                        <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} style={{ padding: 10, width: '100%', borderRadius: 4, border: '1px solid #ddd' }}>
                            {rooms.map(r => (
                                <option key={r.id} value={r.id}>{r.name} (Kap: {r.capacity})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Tanggal</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ padding: 10, width: '95%', borderRadius: 4, border: '1px solid #ddd' }} />
                    </div>

                    <div style={{ display: 'flex', gap: 15 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Jam Mulai</label>
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required style={{ width: '90%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Jam Selesai</label>
                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required style={{ width: '90%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Keperluan</label>
                        <textarea value={purpose} onChange={e => setPurpose(e.target.value)} required rows={3} placeholder="Contoh: Sidang TA" style={{ padding: 10, width: '95%', borderRadius: 4, border: '1px solid #ddd' }} />
                    </div>

                    <button type="submit" style={{ padding: 12, background: '#0275d8', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4, fontWeight: 'bold', fontSize: '16px' }}>
                        Ajukan Peminjaman
                    </button>
                </form>
            </div>
        </div>
    );
}