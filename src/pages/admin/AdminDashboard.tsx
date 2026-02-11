import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useNavigate } from 'react-router-dom';

interface Booking {
    id: number;
    roomName: string;
    borrowerName: string;
    date: string;
    time: string;
    status: string;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState({ totalPending: 0, todayApproved: 0 });

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) { navigate('/login'); return; }
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== 'Admin') {
            alert("Akses Ditolak.");
            navigate('/user-dashboard');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/bookings');
            const allBookings: Booking[] = res.data;
            setBookings(allBookings);

            const todayStr = new Date().toISOString().split('T')[0];
            const pending = allBookings.filter(b => b.status === 'Pending').length;
            const todayAppr = allBookings.filter(b => b.status === 'Approved' && b.date === todayStr).length;
            
            setStats({ totalPending: pending, todayApproved: todayAppr });
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (id: number, newStatus: "Approved" | "Rejected") => {
        if(!confirm(`Ubah status menjadi ${newStatus}?`)) return;
        try {
            await api.put(`/bookings/${id}/status`, newStatus, { headers: { 'Content-Type': 'application/json' } });
            fetchData();
        } catch (error: any) {
            alert("Gagal update: " + (error.response?.data || error.message));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header dengan Tombol Tambah */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, borderBottom: '1px solid #333', paddingBottom: 20 }}>
                <div>
                    <h1 style={{ margin: 0 }}>🛡️ Admin Dashboard</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>Pusat Kontrol Ruangan Kampus</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    {/* TOMBOL BARU ADMIN BOOKING */}
                    <button 
                        onClick={() => navigate('/admin-dashboard/create-booking')}
                        style={{ padding: '10px 20px', background: '#333', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4, fontWeight: 'bold' }}>
                        + Booking Jalur Khusus
                    </button>
                    <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#d9534f', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 4 }}>Logout</button>
                </div>
            </div>

            {/* Statistik Cards */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
                <div style={{ flex: 1, padding: 20, background: '#fff3cd', borderRadius: 8, border: '1px solid #ffeeba' }}>
                    <h3 style={{ margin: 0, fontSize: '36px', color: '#856404' }}>{stats.totalPending}</h3>
                    <p style={{ margin: 0, color: '#856404' }}>Menunggu Persetujuan</p>
                </div>
                <div style={{ flex: 1, padding: 20, background: '#d4edda', borderRadius: 8, border: '1px solid #c3e6cb' }}>
                    <h3 style={{ margin: 0, fontSize: '36px', color: '#155724' }}>{stats.todayApproved}</h3>
                    <p style={{ margin: 0, color: '#155724' }}>Ruangan Terpakai Hari Ini</p>
                </div>
            </div>

            {/* Tabel Approval */}
            <h3>📝 Daftar Request Peminjaman</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', fontSize: '14px' }}>
                <thead style={{ background: '#f8f9fa' }}>
                    <tr>
                        <th style={{ padding: 10, textAlign: 'left' }}>Peminjam</th>
                        <th style={{ padding: 10, textAlign: 'left' }}>Detail</th>
                        <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
                        <th style={{ padding: 10, textAlign: 'center' }}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #eee', background: b.status === 'Pending' ? '#fff' : '#f9f9f9', opacity: b.status === 'Pending' ? 1 : 0.6 }}>
                            <td style={{ padding: 10 }}><strong>{b.borrowerName}</strong></td>
                            <td style={{ padding: 10 }}>{b.roomName}<br/><small>{b.date} ({b.time})</small></td>
                            <td style={{ padding: 10 }}>
                                <span style={{ 
                                    padding: '4px 8px', borderRadius: 4, fontSize: '12px', fontWeight: 'bold',
                                    background: b.status === 'Approved' ? '#28a745' : b.status === 'Rejected' ? '#dc3545' : '#ffc107',
                                    color: b.status === 'Pending' ? '#333' : 'white'
                                }}>{b.status}</span>
                            </td>
                            <td style={{ padding: 10, textAlign: 'center' }}>
                                {b.status === 'Pending' && (
                                    <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                                        <button onClick={() => updateStatus(b.id, 'Approved')} style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: 4 }}>✓</button>
                                        <button onClick={() => updateStatus(b.id, 'Rejected')} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: 4 }}>✕</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}