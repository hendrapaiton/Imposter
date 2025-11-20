# Imposter DICOM Viewer - Dokumentasi Proyek

## Ringkasan Proyek

Imposter DICOM Viewer adalah implementasi sederhana dari OHIF Viewer, sebuah aplikasi web berbasis zero-footprint untuk visualisasi citra medis. Proyek ini dikembangkan sebagai alat pembelajaran untuk memahami arsitektur aplikasi pencitraan medis berbasis web.

### Tujuan Proyek
- Menyediakan fondasi pendidikan untuk memahami OHIF Viewer
- Menerapkan prinsip-prinsip arsitektur modular
- Mengimplementasikan fitur dasar visualisasi DICOM
- Menyediakan kerangka kerja untuk eksplorasi lebih lanjut

## Arsitektur Aplikasi

### Struktur Modul
```
src/
├── components/           # Komponen UI React
│   ├── Viewport/
│   ├── Toolbar/
│   ├── StudyBrowser/
│   └── FileLoader/
├── services/             # Layanan bisnis inti
│   ├── cornerstoneService.ts
│   ├── dicomLoaderService.ts
│   ├── stateService.ts
│   ├── toolService.ts
│   └── configService.ts
├── hooks/                # Custom React hooks
│   ├── useViewport.ts
│   └── useDicom.ts
├── types/                # Definisi tipe TypeScript
│   └── viewer.ts
├── utils/                # Fungsi utilitas
└── extensions/           # Sistem ekstensi (masa depan)
```

### Layanan Inti

#### CornerstoneService
- Mengelola RenderingEngine dari Cornerstone3D
- Menyediakan kontrol rendering (zoom, pan, window/level)
- Mengelola alat-alat interaktif

#### DicomLoaderService
- Memproses file DICOM dari pengguna
- Mengekstrak metadata DICOM
- Mengorganisasi data ke dalam struktur Study/Series/Instance

#### StateService (Zustand)
- Menyediakan state manajemen global
- Mengelola informasi Study, Series, dan Instance
- Mengelola viewport settings (window/level, zoom, pan)

#### ToolService
- Mengelola alat-alat interaktif (Pan, Zoom, WindowLevel, dll)
- Mengontrol status alat aktif

## Fitur Utama

### 1. Pemuatan DICOM
- Dukungan untuk file-file DICOM individual
- Parsing metadata DICOM
- Visualisasi struktur Study/Series

### 2. Tampilan Citra
- Rendering citra medis menggunakan Cornerstone3D
- Dukungan untuk window/level, zoom, dan pan
- Tampilan informasi citra (resolusi, nomor instance)

### 3. Kontrol Interaktif
- Toolbar dengan alat-alat dasar
- Kontrol viewport (reset tampilan)
- Tampilan informasi real-time

### 4. Navigasi Data
- Browser Study/Series sederhana
- Seleksi citra untuk ditampilkan
- Informasi pasien dan studi

## Teknologi yang Digunakan

### Frontend
- **React 19** - Kerangka kerja UI
- **TypeScript** - Pengetikan statis
- **Zustand** - Manajemen state
- **Tailwind CSS** - Styling

### Pemrosesan Citra Medis
- **Cornerstone3D** - Rendering citra medis
- **cornerstone-wado-image-loader** - Pemuatan DICOM
- **dcmjs** - Parsing dan manipulasi DICOM

### Build Tools
- **Vite** - Build system dan development server
- **ESLint** - Penegakan kode
- **PostCSS** - Proses CSS

## Implementasi Arsitektur OHIF

### Sistem Ekstensi (Terinspirasi)
Meskipun sederhana, struktur menyediakan fondasi untuk sistem ekstensi OHIF:
- Layanan dapat dikembangkan sebagai modul independen
- Komponen dibuat dengan antarmuka yang konsisten
- Tipe data dibuat reusable dan interoperabel

### Manajemen State Terpusat
- Zustand digunakan untuk state global
- State terdistribusi sesuai domain (DICOM, viewport, alat)
- Akses state konsisten melalui hooks

### Rendering Modular
- RenderingEngine diisolasi dalam layanan
- Viewport dikonfigurasi secara fleksibel
- Alat-alat dikelola secara terpisah dari rendering

## Penggunaan

### Instalasi
```bash
npm install
```

### Pengembangan
```bash
npm run dev
```

### Pembuatan
```bash
npm run build
```

## Struktur Tipe Data

### Study
```typescript
interface Study {
  id: string;
  patientName: string;
  patientId: string;
  studyDate: string;
  studyDescription: string;
  seriesList: Series[];
}
```

### Series
```typescript
interface Series {
  id: string;
  seriesNumber: number;
  seriesDescription: string;
  modality: string;
  instanceList: Instance[];
}
```

### Instance
```typescript
interface Instance {
  id: string;
  instanceNumber: number;
  imageId: string;  // ID untuk Cornerstone
  sopClassUid: string;
  rows: number;
  columns: number;
  bitsAllocated: number;
  // ... properti DICOM lainnya
}
```

## Prinsip Desain

### Modularitas
- Setiap komponen memiliki tanggung jawab tunggal
- Layanan dipisahkan berdasarkan domain fungsional
- Tipe data dibuat reusable dan interoperabel

### Keterbacaan Kode
- Komentar dokumentasi untuk fungsi penting
- Nama variabel dan fungsi yang deskriptif
- Struktur file yang konsisten

### Skalabilitas
- Arsitektur siap untuk ekstensi
- Antarmuka konsisten untuk integrasi
- Konfigurasi fleksibel untuk perubahan

## Pengembangan Masa Depan

### Fitur Rencana
- Dukungan multi-viewport
- Protokol tampilan kompleks
- Alat pengukuran lanjutan
- Segmentasi citra
- Integrasi DICOMWeb

### Peningkatan Arsitektur
- Sistem ekstensi penuh
- Manajemen konfigurasi yang lebih baik
- Sistem plugin yang lebih canggih
- Dukungan tema dan kustomisasi

## Kontribusi

Proyek ini disediakan untuk tujuan pendidikan. Kontribusi dalam bentuk:
- Perbaikan dokumentasi
- Optimasi performa
- Penambahan fitur pendidikan
- Perbaikan arsitektur

## Lisensi

Proyek ini dibuat untuk tujuan pendidikan dan mengikuti prinsip-prinsip OHIF Viewer yang merupakan perangkat lunak open-source.

---

**Catatan**: Proyek ini merupakan implementasi sederhana dan tidak dimaksudkan untuk digunakan dalam lingkungan produksi medis. Ini murni untuk tujuan pembelajaran dan eksplorasi arsitektur OHIF Viewer.