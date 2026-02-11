import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useNavigate } from 'react-router-dom';

// Tipe Data
interface Room {
    id: number;
    name: string;
    capacity: number;
}

interface Booking {
    id: number;
    roomName: string;
    date: string;
    time: string;
    status: string;
    borrowerName: string; 
}

export default function UserDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    
    // Form State
    const [selectedRoom, setSelectedRoom] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('10:00');
    const [purpose, setPurpose] = useState('');

    useEffect(() => {
        // 1. Cek Login & Ambil User dari LocalStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // 2. Load Data Awal
        fetchRooms();
        fetchMyBookings(parsedUser.name);
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

    const fetchMyBookings = async (userName: string) => {
        try {
            const res = await api.get('/bookings');
            // Filter Client-Side: Hanya tampilkan milik user yang sedang login
            const myData = res.data.filter((b: any) => b.borrowerName === userName);
            setBookings(myData);
        } catch (err) {
            console.error("Gagal ambil booking", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
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
            fetchMyBookings(user.name); // Refresh tabel
            setPurpose(''); 
        } catch (error: any) {
            alert("Gagal: " + (error.response?.data || error.message));
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>
                <h2>👋 Halo, {user?.name}</h2>
                <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#d9534f', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4 }}>Logout</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
                
                {/* KOLOM KIRI: FORM PENGAJUAN */}
                <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginTop: 0 }}>📅 Ajukan Peminjaman</h3>
                    <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                        <div>
                            <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Pilih Ruangan</label>
                            <select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} style={{ padding: 8, width: '100%' }}>
                                {rooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} (Kap: {r.capacity})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Tanggal</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ padding: 8, width: '93%' }} />
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Jam Mulai</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required style={{ width: '85%', padding: 8 }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Jam Selesai</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required style={{ width: '85%', padding: 8 }} />
                            </div>
                        </div>

                        <div>
                            <label style={{fontWeight: 'bold', display: 'block', marginBottom: 5}}>Keperluan</label>
                            <textarea value={purpose} onChange={e => setPurpose(e.target.value)} required rows={3} placeholder="Contoh: Sidang TA" style={{ padding: 8, width: '93%' }} />
                        </div>

                        <button type="submit" style={{ padding: 12, background: '#0275d8', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4, fontWeight: 'bold' }}>
                            Ajukan Peminjaman
                        </button>
                    </form>
                </div>

                {/* KOLOM KANAN: TABEL RIWAYAT */}
                <div>
                    <h3 style={{ marginTop: 0 }}>📂 Riwayat Peminjaman Saya</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                        <thead>
                            <tr style={{ background: '#e9ecef', textAlign: 'left' }}>
                                <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Ruangan</th>
                                <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Tanggal</th>
                                <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Jam</th>
                                <th style={{ padding: 10, borderBottom: '2px solid #ddd' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr><td colSpan={4} align="center" style={{ padding: 20, color: '#666' }}>Belum ada peminjaman.</td></tr>
                            ) : (
                                bookings.map(b => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: 10 }}>{b.roomName}</td>
                                        <td style={{ padding: 10 }}>{b.date}</td>
                                        <td style={{ padding: 10 }}>{b.time}</td>
                                        <td style={{ padding: 10 }}>
                                            <span style={{ 
                                                padding: '5px 10px', borderRadius: 15, color: 'white', fontSize: '12px', fontWeight: 'bold',
                                                background: b.status === 'Approved' ? '#28a745' : 
                                                            b.status === 'Rejected' ? '#dc3545' : '#ffc107',
                                                color: b.status === 'Pending' ? '#333' : 'white'
                                            }}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}