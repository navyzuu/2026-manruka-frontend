# 🏛️ Manruka System - Frontend Client

**Manruka (Manajemen Ruangan Kampus)** adalah antarmuka web modern untuk sistem peminjaman ruangan kampus. Aplikasi ini dibangun dengan **React (Vite)** dan dirancang untuk terhubung dengan **Backend .NET API**.

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## ⚠️ Prasyarat Utama (PENTING)

Frontend ini **TIDAK BISA BERJALAN SENDIRI**. Ia membutuhkan Backend API yang aktif untuk mengambil data user, ruangan, dan booking.

1.  Pastikan Anda memiliki repositori **Backend Manruka**.
2.  Pastikan Backend (.NET) sedang berjalan (biasanya di `http://localhost:5432`).
3.  Pastikan konfigurasi CORS di Backend mengizinkan Frontend ini (`http://localhost:5173`).

---

## 🚀 Panduan Instalasi & Koneksi

Ikuti langkah ini untuk menghubungkan Frontend ke Backend:

### 1. Clone & Install
```bash
# Clone repo ini
git clone https://github.com/navyzuu/2026-manruka-frontend.git
cd manruka-frontend

# Install dependencies
npm install
```

### 2. Koneksi dengan backend
Pastikan untuk mengclone dan build backend terlebih dahulu.
Repo untuk backend : 
[Manruka Backend](https://github.com/navyzuu/2026-manruka-backend)

### 3. Jalankan Aplikasi
```bash
npm run dev
```
Buka browser di http://localhost:5173

---
## 📂Struktur Project
```bash
src/
├── api/             # Konfigurasi Axios (Terhubung ke .env)
├── components/      # Komponen UI (LoginForm, BookingModal, dll)
├── context/         # State Management (Auth & Loading)
├── pages/           # Halaman Utama
│   ├── AuthPage.tsx        # Login/Register Split Screen
│   ├── UserDashboard.tsx   # Dashboard Peminjaman Mahasiswa
│   └── AdminDashboard.tsx  # Dashboard Approval Admin
└── styles/          # Konfigurasi Tailwind CSS
```
---
## ✨ Fitur Frontend
* **Modern Auth UI :**  Halaman Login/Register dengan animasi sliding overlay dan layout split screen.
* **Dashboard Interaktif :**
  - **User :** Grid view ruangan, formulir booking via modal, dan tabel riwayat.
  - **Admin :** Statistik harian, tabel approval dengan fitur quick action.
* **Real-time Feedback :** Notifikasi loading, sukses, atau error dari API backend.
* **Responsive Design :** Tampilan optimal di Desktop (Widescreen)
---
## ❓ Troubleshooting Koneksi
* **Masalah :** Login gagal terus atau data ruangan tidak muncul
**Solusi :**
  1. Cek apakah Backend menyala (dotnet run di repo sebelah).
  2. Cek Console Browser (F12) > Network Tab. Apakah request ke localhost:5234 merah (gagal)?
  3. Jika error CORS, pastikan di Program.cs backend sudah ada AllowReactApp untuk port 5173.
