# Nulis Esai by Parthoo

Aplikasi latihan esai dengan simulasi ujian, histori jawaban, panel admin, AI Essay Coach real-time, dan evaluasi akhir.

## Struktur kode
- `index.html`: shell aplikasi
- `components/*.html`: header, admin, paket soal, workspace, evaluasi, maskot, dan modal
- `assets/css/styles.css`: entry stylesheet; gaya dipisah menurut tanggung jawab
- `assets/js/*.js`: modul JS berurutan agar fitur lama kompatibel
- `api/essay-review.js`: endpoint server-side untuk evaluasi dan chat AI

## Aktifkan AI di Vercel
1. Import repo ini sebagai project Vercel.
2. Di **Settings → Environment Variables**, tambahkan `GEMINI_API_KEY` dengan API key milikmu dari Google AI Studio. Opsional: `GEMINI_MODEL=gemini-3.8-flash`.
3. Redeploy setelah environment variable ditambahkan.
4. Jangan menaruh API key di source code, HTML, atau localStorage.

AI live review memberi umpan balik setelah 30 kata dan membatasi frekuensi request. Jika AI server belum dikonfigurasi, evaluasi akhir tetap memiliki fallback lokal.

## Pengembangan
Komponen HTML diletakkan di `components/`. Letakkan CSS baru di stylesheet sesuai perannya. Logika aplikasi dibagi berdasarkan fitur dan dimuat oleh `assets/js/components-loader.js`.
