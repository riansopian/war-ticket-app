# Rusuh Booking Tiket

> **Status: DRAFT v0.1 — menunggu review.** Belum ada kode yang diimplementasikan.
> Seluruh keputusan teknis di dokumen ini masih berupa **usulan**. Item bertanda ❓ perlu dikonfirmasi sebelum development dimulai.

Sistem pemesanan tiket konser online untuk **PT. Tiga Sekawan Angin Ribut**. Sistem ini dirancang untuk menangani lonjakan trafik ekstrem (*flash crowd*) saat penjualan dibuka. Project ini dikerjakan sebagai bagian dari **Evaluasi Expertise Solution Development 2026 H2**.

Sumber requirement: [`Tender Rusuh Booking Ticket/`](./Tender%20Rusuh%20Booking%20Ticket/) (19 halaman).

---

## 1. Prinsip Kunci

| # | Prinsip | Arti dalam desain |
|---|---|---|
| 1 | **Jaga user experience** apa pun kondisi sistem di belakang | Waiting room menjadi *shock absorber*. Halaman statis/cached. Degradasi tetap *graceful*, tidak muncul error mentah. |
| 2 | **Jangan PHP** (Pemberi Harapan Palsu) | User yang sudah mendapat slot atau sudah booking **dijamin** bisa menyelesaikan journey selama TTL masih berlaku. Stok tidak boleh oversell. |

## 2. Halaman Utama

| Halaman | Fungsi | Requirement |
|---|---|---|
| Home Page | Daftar event dan status ketersediaan | FR-01 – FR-05 |
| Waiting Room | Antrian virtual dengan posisi real-time | FR-06 – FR-10 |
| Detail Ticket Page | Input NIK, pilih kategori dan jumlah (maks. 3), TTL booking 5 menit | FR-11 – FR-19 |
| Payment Page | Pembayaran dengan TTL 10 menit. Satu halaman web yang bisa dipakai ulang di mobile lewat WebView | FR-20 – FR-25 |

## 3. Ruang Lingkup

**In scope:** daftar event, virtual waiting room, pemilihan kategori dengan limit 3 tiket/NIK, hold stok dan pelepasan otomatis, payment dengan timeout 10 menit, email e-tiket/expired, shared payment API untuk web dan mobile.

**Out of scope:** back-office manajemen event, implementasi internal payment gateway (menggunakan pihak ketiga/sandbox), loyalti/diskon/voucher.

## 4. Tim (5 orang)

| Role | Jumlah | Fokus utama (usulan) |
|---|---|---|
| Backend Dev | 2 | BE-1: Queue & Admission Service · BE-2: Booking, Payment, Notification |
| Web Dev | 2 | FE-1: Home & Waiting Room · FE-2: Detail Ticket & Payment Page (reusable) |
| Mobile Dev | 1 | App shell, Home/Waiting Room, integrasi Payment WebView |

Pembagian detail tersedia di [SPEC §12](./docs/SPEC.md#12-pembagian-kerja--milestone).

## 5. Tech Stack (usulan ❓)

> Brief mewajibkan stack mengikuti **tech radar perusahaan**. Stack di bawah ini adalah usulan awal dan harus divalidasi terhadap tech radar tersebut.

| Layer | Usulan | Alternatif |
|---|---|---|
| Backend | Go (Gin/Fiber) | Java Spring Boot, NestJS |
| Database | PostgreSQL | — |
| Cache / Queue state | Redis | — |
| Message broker | RabbitMQ | Kafka |
| Web | Next.js (React, TypeScript) | Vue/Nuxt |
| Mobile | Flutter | React Native, Native (Kotlin/Swift) |
| Payment | Midtrans Sandbox (atau mock gateway) | Xendit |
| Email | SMTP via Mailpit (dev) / provider (prod) | — |
| Infra lokal | Docker Compose | — |
| Load test | k6 | Locust |

## 6. Struktur Repository (usulan)

```
war-ticket-app/
├── README.md                 ← dokumen ini
├── docs/
│   ├── SPEC.md               ← technical specification (draft)
│   ├── adr/                  ← Architecture Decision Records (setelah review)
│   └── ai/                   ← steering & log penggunaan AI (wajib dipertahankan)
├── backend/                  ← (belum dibuat)
├── web/                      ← (belum dibuat)
├── mobile/                   ← (belum dibuat)
├── infra/                    ← docker-compose, k6 scripts (belum dibuat)
└── Tender Rusuh Booking Ticket/  ← dokumen tender asli
```

## 7. Dokumentasi

| Dokumen | Isi | Status |
|---|---|---|
| [docs/SPEC.md](./docs/SPEC.md) | Arsitektur, data model, API contract, alur antrian/booking/payment, NFR, testing, pembagian kerja | Draft v0.1 |
| `docs/adr/` | Keputusan arsitektur final | Belum dibuat (menunggu review) |

## 8. Penggunaan AI

Sesuai aturan #5 brief, **seluruh steering, prompt, dan dokumentasi penggunaan AI tidak boleh dihapus**. Draft README dan SPEC ini disusun dengan bantuan AI coding assistant berdasarkan dokumen tender, lalu direview oleh tim. Log penggunaan AI akan disimpan di `docs/ai/`.

## 9. Langkah Selanjutnya

1. ✅ Draft README dan SPEC (dokumen ini)
2. ⏳ **Review tim**: jawab *Open Questions* di [SPEC §14](./docs/SPEC.md#14-open-questions--keputusan-yang-perlu-direview)
3. ⏳ Finalisasi keputusan menjadi ADR
4. ⏳ Scaffold repository (backend/web/mobile/infra)
5. ⏳ Implementasi per milestone
