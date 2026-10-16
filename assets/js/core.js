// --- GLOBAL CONFIG & STATES ---
    const adminPin = "0107";
    let packagesList = {};     // Map: packageId -> questionObject
    let studentAnswers = {};   // Map: packageId -> { text: '', html: '' }
    let packageStatus = {};    // Map: packageId -> 'belum_mulai' | 'selesai' | 'sedang_mengerjakan'
    let gradesLedger = [];     // Array of grade submission logs
    let activePackageId = 1;
    let timeRemaining = 600;
    let totalExamDuration = 600;
    let timerInterval = null;
    let chatHistories = {};

    // --- FLOATING MASCOT ("MIKO") CONFIG & STATES ---
    let activeMascotState = 'home';
    let mascotTimeout = null;

    const mascotDialogueMap = {
      home: [
        "Sugeng rawuh! Pilih paket esai di atas untuk memulai simulasi ya.",
        "Butuh panduan? Klik saja aku untuk memunculkan petuah bimbingan!",
        "Tenang wae, persiapan matang bakal buat kamu lolos seleksi UNDIP!",
        "Sampun siap nulis? Pilih materi wawasan kebangsaan kesukaanmu!"
      ],
      exam: [
        "Fokus nulis ya! Tak kancani neng kene.",
        "Waktu simulasi hanya 10 menit. Atur waktu penulisan sebaik mungkin!",
        "Tulis gagasanmu yang paling logis, kritis, dan solutif ya!",
        "Ojo lali moco draf esaimu dhisik sakdurunge dikirim!"
      ],
      eval: [
        "Luar biasa! Hasil evaluasimu sudah selesai dianalisis bimbingan AI.",
        "Coba dibaca rincian kelebihan dan celah argumenmu di sebelah kiri.",
        "Mari asah lagi kemampuan analisismu dengan mencoba paket esai lainnya!",
        "Matur nuwun sudah berjuang sungguh-sungguh hari ini!"
      ]
    };

    const defaultAiPrompt = `Anda adalah penguji dan evaluator ujian masuk akademis profesional tingkat tinggi dari Universitas Diponegoro (UNDIP).
Tugas Anda adalah memeriksa jawaban esai siswa secara ketat, kritis, objektif, namun tetap mendidik.
Berikan respons HANYA dalam format JSON valid dengan struktur kunci berikut (tanpa tambahan markdown pembungkus di luar json):
{
  "score": <angka antara 0 hingga 100 berdasarkan kualitas konten>,
  "kelebihan": "<kelebihan analitis dan kekuatan argumen jawaban esai siswa>",
  "kekurangan": "<aspek-aspek kognitif penting yang terlewat atau dangkal dari jawaban siswa>",
  "koreksi": "<berikan naskah tulisan/paragraf perbaikan atau instruksi terstruktur untuk menyempurnakan tulisan tersebut>",
  "ideal": "<poin-poin rujukan ideal yang seharusnya dijawab dalam ujian sesuai kriteria kelayakan tinggi>"
}`;

    // --- INITIALIZATION ---
    function initializeNulisApp() {
      loadConfigurations();
      loadStoredAnswers();
      loadStoredStatus();
      loadStoredPackages();
      loadGradesLedger();
      initParticles();
      animateParticles();

      if (Object.keys(packagesList).length === 0) {
        loadDefaultPackages();
      } else {
        renderAdminPackages();
        renderPackagesLandingGrid();
        renderGradesLedgerTable();
      }

      showNotification('success', 'Nulis Esai by Parthoo', 'Siapkan diri Anda untuk ujian masuk esai berkualitas tinggi. Sukses untuk simulasi Anda!');
      updateMascotCompanion('home');
    }
    document.addEventListener('app:modules-loaded', initializeNulisApp, { once: true });

    // --- BACKGROUND PARTICLE ENGINE ---
    let particlesArray = [];
    const canvas = document.getElementById('bg-particles');
    const ctx = canvas.getContext('2d');

    function initParticles() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesArray = [];
      const particleCount = window.innerWidth < 768 ? 20 : 40; // Kurangi partikel di mobile
      for (let i = 0; i < particleCount; i++) {
        let size = Math.random() * 3 + 1;
        let x = Math.random() * (innerWidth - size * 2) + size;
        let y = Math.random() * (innerHeight - size * 2) + size;
        let directionX = (Math.random() * 0.4) - 0.2;
        let directionY = (Math.random() * 0.4) - 0.2;
        let color = 'rgba(212, 175, 55, 0.4)'; // Gold/Amber Batik
        particlesArray.push({x, y, directionX, directionY, size, color});
      }
    }

    function animateParticles() {
      requestAnimationFrame(animateParticles);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = 0; i < particlesArray.length; i++) {
        let p = particlesArray[i];
        p.x += p.directionX;
        p.y += p.directionY;
        
        // Bounce off edges
        if (p.x > innerWidth || p.x < 0) p.directionX = -p.directionX;
        if (p.y > innerHeight || p.y < 0) p.directionY = -p.directionY;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
    }
    window.addEventListener('resize', initParticles);
