# Rusuh Booking Tiket — Web Frontend Mockup

Mockup aplikasi web antrian & pemesanan tiket konser dengan traffic lonjakan tinggi (*war ticket*), dibangun berdasarkan dokumen spesifikasi [`docs/SPEC.md`](../docs/SPEC.md) dan set wireframe (Wireframe 9.1 sampai 9.5).

---

## 🚀 Fitur Utama & Kesesuaian Wireframe

| Wireframe | Rute Aplikasi | Fitur & Komponen Kunci |
|---|---|---|
| **9.1 Home Page** | `/` | Banner Event Konser Noah, status badge (*Open at 10am*, *Hampir Habis*, *Habis*), rincian kuota, dan seksi **"Your Queue"** untuk melanjutkan antrian yang sempat ditinggal. |
| **9.2 Waiting Room** | `/events/:id/queue` | Kartu posisi antrian (`#142`), estimasi waktu tunggu real-time, visual progress bar, tips antrian, dan **auto-redirect** begitu giliran tiba. |
| **9.3 Detail Ticket Page** | `/events/:id/booking` | Countdown batas pengisian (5 menit), input NIK 16-digit (dengan autofill & verifikasi simulasi), stepper pemilihan kategori tiket dengan batas maksimal 3 tiket/pesanan, ringkasan harga dinamis. |
| **9.4 Payment Page** | `/pay/:id` | Countdown batas pembayaran (10 menit), pilihan metode pembayaran (*Virtual Account*, *E-Wallet*, *Transfer Bank*), ringkasan order, dan tombol konfirmasi *Bayar Sekarang*. |
| **9.5 Status Pasca-Pembayaran** | `/pay/:id/result` | **Kasus A (Sukses):** E-Tiket resmi dengan barcode/QR, detail jadwal, nama pemesan, dan unduh PDF.<br>**Kasus B (Expired):** Banner pembatalan tiket otomatis karena time limit habis, opsi antri ulang. |

---

## 🏛️ Arsitektur & Prinsip Desain (SOLID)

Aplikasi dirancang dengan arsitektur bersih (*Clean/Hexagonal Architecture*) modular:

```
web/
├── src/
│   ├── domain/               # [S] Single Responsibility: Pure types & rules (no UI / side effects)
│   │   ├── types.ts          # Event, Category, Queue, Booking, ActiveSession
│   │   └── rules.ts          # Validasi NIK, Max Qty, Derivasi Stok (Habis/Hampir Habis)
│   ├── services/             # [D] Dependency Inversion & [I] Interface Segregation
│   │   ├── contracts.ts      # EventService, QueueService, BookingService, PaymentService
│   │   └── mock/             # Implementasi Mock lokal (localStorage + deterministic timer)
│   │       ├── db.ts         # Initial seed & storage wrapper
│   │       ├── derive.ts     # Derivasi status kuota, auto-sweep expired booking
│   │       └── ...
│   ├── components/
│   │   ├── ui/               # Primitives shadcn/ui (Button, Card, Badge, Input, RadioGroup)
│   │   ├── shared/           # Reusable wireframe widgets (ScreenCard, DashedPanel, CountdownPanel)
│   │   └── layout/           # AppLayout, Navbar, DevTools bar
│   ├── features/             # Modular Feature Folders (High Cohesion)
│   │   ├── events/           # HomePage, EventCard, YourQueueSection
│   │   ├── queue/            # WaitingRoomPage, QueuePositionPanel, WaitTimePanel
│   │   ├── booking/          # BookingPage, NikField, CategoryPicker
│   │   ├── payment/          # PaymentPage, PaymentResultPage, PaymentMethodSelector
│   │   └── session/          # Hook sesi aktif ("Your Queue")
│   ├── app/                  # AppRouter, ServicesContext, routes definition
│   └── styles/               # Tailwind CSS & Design tokens
```

### Penerapan Prinsip SOLID:
1. **Single Responsibility (SRP):** 
   - `rules.ts` hanya menangani kalkulasi kuota & validasi bisnis murni.
   - Komponen UI hanya bertanggung jawab menampilkan state (`Presentation`) tanpa logika mutasi data langsung.
2. **Open-Closed Principle (OCP):**
   - Komponen `ScreenCard`, `DashedPanel`, dan `CountdownPanel` mendukung varian/tone baru tanpa mengubah struktur internalnya.
3. **Liskov Substitution Principle (LSP):**
   - Mock services mengimplementasikan kontrak interface yang identik dengan API backend nyata (dapat digantikan oleh `HttpEventService`, `HttpQueueService` tanpa mengubah satupun baris kode di UI).
4. **Interface Segregation Principle (ISP):**
   - Kontrak dipecah menjadi servis-servis granular (`EventService`, `QueueService`, `BookingService`, `PaymentService`, `SessionService`).
5. **Dependency Inversion Principle (DIP):**
   - Seluruh halaman dan hooks mengakses kapabilitas backend hanya melalui `ServicesContext` (berbasis interface di `contracts.ts`), bukan mengimpor mock secara langsung.

---

## 🛠️ Menjalankan Aplikasi

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Dev Server
```bash
npm run dev
```
Buka browser pada alamat yang tertera (biasanya `http://localhost:5173`).

### 3. Mode Pengujian Cepat (Fast Mode)
Untuk menguji skenario waktu habis (countdown 5 menit booking atau 10 menit pembayaran) tanpa menunggu lama:
Tambahkan query parameter `?fast=1` pada URL, contoh:
`http://localhost:5173/?fast=1`
- Waktu tunggu antrian: ~3 detik
- Waktu limit booking: 30 detik
- Waktu limit pembayaran: 40 detik

Terdapat toolbar **DevTools** di bagian bawah layar untuk:
- Mengaktifkan/menonaktifkan Fast Mode dalam 1 klik
- Reset Mock DB (mengembalikan stok awal dan menghapus antrian yang tersimpan)
