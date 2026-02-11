import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useNavigate } from 'react-router-dom';

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
    const [myBookings, setMyBookings] = useState<Booking[]>([]);
    const [allSchedule, setAllSchedule] = useState<Booking[]>([]);

    useEffect(() => {
        // 1. Cek Login
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        fetchBookings(parsedUser.name);
    }, []);

    const fetchBookings = async (userName: string) => {
        try {
            const res = await api.get('/bookings');
            const allData: Booking[] = res.data;

            // Filter 1: Booking Saya (Semua Status)
            setMyBookings(allData.filter(b => b.borrowerName === userName));

            // Filter 2: Jadwal Ruangan (Hanya yang Approved agar user tahu jadwal pasti)
            // Atau tampilkan semua biar transparan, tapi biasanya Approved yang penting.
            setAllSchedule(allData.filter(b => b.status === 'Approved' || b.status === 'Pending')); 
        } catch (err) {
            console.error("Gagal ambil booking", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, borderBottom: '1px solid #eee', paddingBottom: 20 }}>
                <div>
                    <h1 style={{ margin: 0 }}>👋 Halo, {user?.name}</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>Lihat jadwal ruangan dan kelola peminjamanmu.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button 
                        onClick={() => navigate('/create-booking')} 
                        style={{ padding: '10px 20px', background: '#0275d8', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4, fontWeight: 'bold' }}>
                        + Tambah Booking Baru
                    </button>
                    <button 
                        onClick={handleLogout} 
                        style={{ padding: '10px 20px', background: '#d9534f', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4 }}>
                        Logout
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                
                {/* TABEL KIRI: JADWAL SELURUH RUANGAN */}
                <div>
                    <h3 style={{ borderLeft: '4px solid #0275d8', paddingLeft: 10 }}>📅 Jadwal Seluruh Ruangan (Publik)</h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>Daftar ruangan yang sedang/akan digunakan oleh Civitas Akademika.</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', fontSize: '14px' }}>
                        <thead style={{ background: '#f1f1f1' }}>
                            <tr>
                                <th style={{ padding: 10, textAlign: 'left' }}>Ruangan</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>Tanggal & Jam</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>Peminjam</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allSchedule.length === 0 ? (
                                <tr><td colSpan={4} align="center" style={{ padding: 20 }}>Belum ada jadwal aktif.</td></tr>
                            ) : (
                                allSchedule.map(b => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: 10, fontWeight: 'bold' }}>{b.roomName}</td>
                                        <td style={{ padding: 10 }}>
                                            {b.date}<br/>
                                            <span style={{color: '#666'}}>{b.time}</span>
                                        </td>
                                        <td style={{ padding: 10 }}>{b.borrowerName}</td>
                                        <td style={{ padding: 10 }}>
                                            <span style={{ 
                                                padding: '4px 8px', borderRadius: 4, fontSize: '12px',
                                                background: b.status === 'Approved' ? '#d4edda' : '#fff3cd',
                                                color: b.status === 'Approved' ? '#155724' : '#856404'
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

                {/* TABEL KANAN: BOOKING SAYA */}
                <div>
                    <h3 style={{ borderLeft: '4px solid #5cb85c', paddingLeft: 10 }}>👤 Booking Saya</h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>Riwayat pengajuan peminjaman yang Anda lakukan.</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', fontSize: '14px' }}>
                        <thead style={{ background: '#f1f1f1' }}>
                            <tr>
                                <th style={{ padding: 10, textAlign: 'left' }}>Ruangan</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>Waktu</th>
                                <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myBookings.length === 0 ? (
                                <tr><td colSpan={3} align="center" style={{ padding: 20 }}>Anda belum pernah meminjam.</td></tr>
                            ) : (
                                myBookings.map(b => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: 10 }}>{b.roomName}</td>
                                        <td style={{ padding: 10 }}>{b.date} ({b.time})</td>
                                        <td style={{ padding: 10 }}>
                                            <span style={{ 
                                                padding: '4px 8px', borderRadius: 4, fontSize: '12px', color: 'white', fontWeight: 'bold',
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