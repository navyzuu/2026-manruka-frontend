import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useNavigate } from 'react-router-dom';

interface Room {
    id: number;
    name: string;
    capacity: number;
}

export default function CreateAdminBookingPage() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<Room[]>([]);
    
    // Form State
    const [selectedRoom, setSelectedRoom] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('10:00');
    const [purpose, setPurpose] = useState('Kegiatan Admin / Kampus');

    useEffect(() => {
        // Cek Admin
        const user = localStorage.getItem('user');
        if (!user || JSON.parse(user).role !== 'Admin') {
            navigate('/login');
            return;
        }
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await api.get('/rooms');
            setRooms(res.data);
            if (res.data.length > 0) setSelectedRoom(res.data[0].id.toString());
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdminBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            // 1. Buat Booking (Pending)
            await api.post('/bookings', {
                userId: user.id,
                roomId: parseInt(selectedRoom),
                bookingDate: date,
                startTime,
                endTime,
                purpose
            });

            // 2. Cari Booking Pending Terbaru milik Admin ini
            const res = await api.get('/bookings');
            const myLatestBooking = res.data
                .filter((b: any) => b.borrowerName === user.name && b.status === 'Pending')
                .sort((a: any, b: any) => b.id - a.id)[0]; // ID Terbesar

            // 3. Langsung Approve
            if (myLatestBooking) {
                await api.put(`/bookings/${myLatestBooking.id}/status`, "Approved", {
                    headers: { 'Content-Type': 'application/json' }
                });
                alert("Booking Admin Berhasil & Langsung Disetujui!");
                navigate('/admin-dashboard'); // Kembali ke Dashboard Admin
            } else {
                alert("Booking dibuat tapi gagal auto-approve. Silakan cek dashboard.");
                navigate('/admin-dashboard');
            }

        } catch (error: any) {
            alert("Gagal Booking: " + (error.response?.data || error.message));
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <button onClick={() => navigate('/admin-dashboard')} style={{ marginBottom: 20, padding: '5px 10px', cursor: 'pointer' }}>&larr; Kembali ke Dashboard Admin</button>
            
            <div style={{ background: '#e9ecef', padding: 30, borderRadius: 8, border: '1px solid #ced4da' }}>
                <h2 style={{ marginTop: 0, color: '#333' }}>⚡ Admin Quick Booking</h2>
                <p style={{ fontSize: '14px', color: '#555' }}>Peminjaman ini akan mem-bypass persetujuan dan langsung status <strong>Approved</strong>.</p>
                
                <form onSubmit={handleAdminBooking} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div>
                        <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Pilih Ruangan</label>
                        <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} style={{ padding: 10, width: '100%', borderRadius: 4 }}>
                            {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (Kap: {r.capacity})</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Tanggal</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ padding: 10, width: '95%', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ display: 'flex', gap: 15 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Jam Mulai</label>
                            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required style={{ width: '90%', padding: 10, borderRadius: 4, border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Jam Selesai</label>
                            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required style={{ width: '90%', padding: 10, borderRadius: 4, border: '1px solid #ccc' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Keperluan (Default Admin)</label>
                        <textarea value={purpose} onChange={e => setPurpose(e.target.value)} required rows={2} style={{ padding: 10, width: '95%', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>

                    <button type="submit" style={{ padding: 12, background: '#333', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4, fontWeight: 'bold', fontSize: '16px' }}>
                        Booking & Approve Sekarang
                    </button>
                </form>
            </div>
        </div>
    );
}