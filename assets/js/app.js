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
    window.onload = function() {
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

      showNotification('success', 'Study With Parthoo', 'Siapkan diri Anda untuk ujian masuk esai berkualitas tinggi. Sukses untuk simulasi Anda!');
      updateMascotCompanion('home');
    }

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

    // --- SETUP DEFAULTS ---
    function loadDefaultPackages() {
      // 46 Paket Soal sesuai PDF yang diberikan. Menggunakan properti tipe "reguler" dan "special"
      packagesList = {
        1: { id: 1, type: "reguler", subject: "REGULER 1", question: "Buatlah esai mengenai implementasi Hak asasi manusia yang dapat diimplementasikan oleh generasi muda di masa kini dan mendatang.", duration: 600 },
        2: { id: 2, type: "reguler", subject: "REGULER 2", question: "Buatlah esai tentang toleransi kehidupan beragama di Indonesia yang dapat dipraktekan oleh generasi muda di lingkungan anda.", duration: 600 },
        3: { id: 3, type: "reguler", subject: "REGULER 3", question: "Buatlah esai mengenai penerapan demokrasi yang dapat diimplementasikan oleh generasi muda di lingkungan sekitar.", duration: 600 },
        4: { id: 4, type: "reguler", subject: "REGULER 4", question: "Buatlah esai mengenai tindakan bela negara yang dapat diimplementasikan oleh generasi muda di era digital.", duration: 600 },
        5: { id: 5, type: "reguler", subject: "REGULER 5", question: "Buatlah esai mengenai penerapan penggunaan bahasa Indonesia yang dapat diimplementasikan oleh generasi muda di kehidupan sehari-hari.", duration: 600 },
        6: { id: 6, type: "reguler", subject: "REGULER 6", question: "Buatlah esai mengenal praktek keadilan sosial yang dapat diimplementasikan oleh generasi muda dalam kehidupan sehari-hari.", duration: 600 },
        7: { id: 7, type: "reguler", subject: "REGULER 7", question: "Jelaskan konsep Bela Negara yang paling relevan bagi Anda sebagai calon Intelektual muda di abad ke-21, di luar konteks pertahanan militer.", duration: 600 },
        8: { id: 8, type: "reguler", subject: "REGULER 8", question: "Di tengah maraknya politik Identitas, Jelaskan satu langkah konkret yang akan Anda ambil untuk mempraktikkan dan menjaga nilai Persatuan Indonesia.", duration: 600 },
        9: { id: 9, type: "reguler", subject: "REGULER 9", question: "Selain menjalankan ibadah sesuai keyakinan Anda, bagaimana wujud nyata pengamalan Sila Pertama dalam merespons keberagaman agama di lingkungan pergaulan Anda?", duration: 600 },
        10: { id: 10, type: "reguler", subject: "REGULER 10", question: "Menurut Anda, apa elemen terpenting dari identitas nasional Indonesia yang harus dipertahankan dan diperkuat di tengah persaingan global?", duration: 600 },
        11: { id: 11, type: "reguler", subject: "REGULER 11", question: "Sebagai digital native, jelaskan tanggung jawab etis terbesar yang Anda miliki dalam menggunakan media sosial untuk kemajuan bangsa.", duration: 600 },
        12: { id: 12, type: "reguler", subject: "REGULER 12", question: "Bagaimana nilai-nilai luhur bangsa, seperti gotong royong, dapat diimplementasikan secara modern dalam upaya mengatasi krisis lingkungan di Indonesia?", duration: 600 },
        13: { id: 13, type: "reguler", subject: "REGULER 13", question: "Bagaimana cara kita meneruskan jasa pahlawan?", duration: 600 },
        14: { id: 14, type: "reguler", subject: "REGULER 14", question: "Bayangkan 10 tahun dari sekarang setelah Anda lulus. Kontribusi spesifik apa, sesuai dengan bidang ilmu yang akan Anda tekuni, yang ingin Anda berikan untuk Indonesia?", duration: 600 },
        15: { id: 15, type: "reguler", subject: "REGULER 15", question: "Bagaimana peran generasi muda dalam melestarikan lingkungan hidup di Indonesia?", duration: 600 },
        16: { id: 16, type: "reguler", subject: "REGULER 16", question: "Semboyan Bhinneka Tunggal Ika adalah fondasi bangsa. Berikan satu contoh nyata bagaimana Anda dapat merawat semboyan ini di tengah arus globalisasi dan budaya asing.", duration: 600 },
        17: { id: 17, type: "reguler", subject: "REGULER 17", question: "Jelaskan mengenai konsep Bela Negara dan apa yang bisa Anda lakukan sebagai warga negara Indonesia untuk membela NKRI?", duration: 600 },
        18: { id: 18, type: "reguler", subject: "REGULER 18", question: "Identifikasikan satu akar masalah yang menurut Anda paling berpotensi menyebabkan disintegrasi bangsa saat ini, dan jelaskan gagasan Anda untuk mencabut akar tersebut.", duration: 600 },
        19: { id: 19, type: "reguler", subject: "REGULER 19", question: "Pancasila sering disebut relevan di setiap zaman. Menurut Anda, bagaimana nilai-nilai Pancasila dapat menjadi solusi atas tantangan terbesar yang dihadapi generasi Anda saat ini?", duration: 600 },
        20: { id: 20, type: "reguler", subject: "REGULER 20", question: "Bagaimana kontribusi generasi muda dalam memelihara keberagaman budaya di Indonesia?", duration: 600 },
        21: { id: 21, type: "reguler", subject: "REGULER 21", question: "Bagaimana peran aktif generasi muda dalam menjaga persatuan dan kesatuan bangsa Indonesia di era digital?", duration: 600 },
        22: { id: 22, type: "reguler", subject: "REGULER 22", question: "Selain mencegah konflik, bagaimana cara paling efektif untuk secara proaktif membangun rasa saling percaya antar-kelompok masyarakat yang berbeda di Indonesia?", duration: 600 },
        23: { id: 23, type: "reguler", subject: "REGULER 23", question: "Mengapa pemahaman sejarah perjuangan kemerdekaan Indonesia penting bagi generasi muda?", duration: 600 },
        24: { id: 24, type: "reguler", subject: "REGULER 24", question: "Bagaimana cara terbaik bagi generasi Anda untuk \"meneruskan perjuangan para pahlawan\" dalam konteks tantangan nasional masa kini?", duration: 600 },
        25: { id: 25, type: "reguler", subject: "REGULER 25", question: "Apa pentingnya generasi muda dalam memahami dan menerapkan nilai-nilal Pancasila dalam kehidupan sehari-hari?", duration: 600 },
        26: { id: 26, type: "reguler", subject: "REGULER 26", question: "Jelaskan apa yang menyebabkan munculnya disintegrasi bangsa dan apa yang bisa Anda lakukan dalam rangka mencegahnya.", duration: 600 },
        27: { id: 27, type: "reguler", subject: "REGULER 27", question: "Bagaimana peran generasi muda dalam menjaga persatuan dan kesatuan negara di era digital ini?", duration: 600 },
        28: { id: 28, type: "reguler", subject: "REGULER 28", question: "Bangsa yang besar adalah bangsa yang menghargai jasa dan perjuangan para pahlawan, selain itu juga mampu berdisiplin terhadap norma dan peraturan yang berlaku. Jelaskan pernyataan tersebut!", duration: 600 },
        29: { id: 29, type: "reguler", subject: "REGULER 29", question: "Apa makna Bhinneka Tunggal Ika sebagai semboyan negara?", duration: 600 },
        30: { id: 30, type: "reguler", subject: "REGULER 30", question: "Jelaskan penerapan sila-sila Pancasila dalam mewujudkan pembangunan nasional!", duration: 600 },
        31: { id: 31, type: "reguler", subject: "REGULER 31", question: "Bela negara merupakan salah satu hak dan kewajiban warga negara. Berikan contoh bela negara di lingkungan sekolah, masyarakat, berbangsa dan bernegara!", duration: 600 },
        32: { id: 32, type: "reguler", subject: "REGULER 32", question: "Jelaskan penerapan sila-sila Pancasila dalam kehidupan sehari-hari!", duration: 600 },
        33: { id: 33, type: "reguler", subject: "REGULER 33", question: "Prinsip demokrasi yang paling mendasar adalah...", duration: 600 },
        34: { id: 34, type: "reguler", subject: "REGULER 34", question: "Tujuan nasional Indonesia yang tercantum dalam Pembukaan UUD 1945 adalah ...", duration: 600 },
        35: { id: 35, type: "reguler", subject: "REGULER 35", question: "Jelaskan terkait dengan \"Wawasan Kebangsaan Membentuk Kesatuan Bersama\".", duration: 600 },
        36: { id: 36, type: "reguler", subject: "REGULER 36", question: "Jelaskan peran aktif anak muda dalam mempertahankan persatuan di era digital!", duration: 600 },
        37: { id: 37, type: "reguler", subject: "REGULER 37", question: "Jelaskan pentingnya toleransi bagi generasi muda.", duration: 600 },
        38: { id: 38, type: "reguler", subject: "REGULER 38", question: "Jelaskan prinsip anda terhadap perbedaan agama dalam lingkungan berbangsa dan bernegara.", duration: 600 },
        
        39: { id: 39, type: "special", subject: "SPECIAL 1", question: "Bagaimana cara menghindari disintegrasi dan apa yang kamu lakukan untuk menanggulangi disintegrasi dalam kehidupan berbangsan dan bernegara?", duration: 600 },
        40: { id: 40, type: "special", subject: "SPECIAL 2", question: "Apa pentingnya generasi muda dalam memahami dan menerapkan nilai-nilai Pancasila dalam kehidupan sehari-hari?", duration: 600 },
        41: { id: 41, type: "special", subject: "SPECIAL 3", question: "Jelaskan bagaimana cara mengamalkan Sila Pertama dari Pancasila dalam kehidupan sehari-hari!", duration: 600 },
        42: { id: 42, type: "special", subject: "SPECIAL 4", question: "Mengapa pemahaman sejarah perjuangan kemerdekaan Indonesia penting bagi generasi muda?", duration: 600 },
        43: { id: 43, type: "special", subject: "SPECIAL 5", question: "Jelaskan mengenai konsep Bela Negara dan apa yang bisa Kamu lakukan sebagai warga negera Indonesia untuk membela NKRI?", duration: 600 },
        44: { id: 44, type: "special", subject: "SPECIAL 6", question: "Bagaimana kontribusi generasi muda dalam memelihara keberagaman budaya di Indonesia?", duration: 600 },
        45: { id: 45, type: "special", subject: "SPECIAL 7", question: "Jelaskan tentang semboyan bangsa Indonesia dan apa yang bisa Kamu lakukan dalam rangka menjunjung tinggi semboyan bangsa Indonesia Ini?", duration: 600 },
        46: { id: 46, type: "special", subject: "SPECIAL 8", question: "Bagaimana peran generasi muda dalam melestarikan lingkungan hidup di Indonesia?", duration: 600 }
      };

      Object.keys(packagesList).forEach(id => {
        if (!packageStatus[id]) packageStatus[id] = 'belum_mulai';
      });

      savePackagesToStorage();
      saveStatusToStorage();
      renderAdminPackages();
      renderPackagesLandingGrid();
    }

    // --- ADMIN PANEL CONTROLLER ---
    function renderAdminPackages() {
      const tbody = document.getElementById('admin-packages-tbody');
      const countBadge = document.getElementById('admin-packages-count');
      if (!tbody || !countBadge) return;
      tbody.innerHTML = '';
      
      const keys = Object.keys(packagesList).sort((a,b) => parseInt(a) - parseInt(b));
      countBadge.textContent = keys.length;

      keys.forEach(id => {
        const pkg = packagesList[id];
        const isSpecial = pkg.type === 'special' || pkg.subject.toUpperCase().includes('SPECIAL');
        const badgeColor = isSpecial ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700';

        tbody.innerHTML += `
          <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
            <td class="px-4 py-3 text-center"><span class="px-2 py-1 rounded text-[10px] font-bold ${badgeColor}">Pkg ${id}</span></td>
            <td class="px-4 py-3 font-semibold text-slate-800">${pkg.subject}</td>
            <td class="px-4 py-3 max-w-sm truncate text-slate-500 font-medium" title="${escapeHtml(pkg.question)}">
              ${escapeHtml(pkg.question)}
            </td>
            <td class="px-4 py-3 text-center">
              <div class="flex gap-2 justify-center">
                <button onclick="openEditPackageForm(${id})" class="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition">
                  <i class="fa-regular fa-pen-to-square"></i> Edit
                </button>
                <button onclick="deletePackage(${id})" class="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition">
                  <i class="fa-regular fa-trash-can"></i> Hapus
                </button>
              </div>
            </td>
          </tr>
        `;
      });
    }

    function openAddPackageModal() {
      document.getElementById('modal-title-action').textContent = 'Tambah';
      document.getElementById('modal-input-pkg-id').value = '';
      document.getElementById('modal-input-subject').value = '';
      document.getElementById('modal-input-text').value = '';
      document.getElementById('modal-input-duration').value = '600';
      document.getElementById('modal-package-form').classList.remove('hidden');
    }

    function openEditPackageForm(id) {
      const pkg = packagesList[id];
      if (!pkg) return;
      document.getElementById('modal-title-action').textContent = 'Edit';
      document.getElementById('modal-input-pkg-id').value = id;
      document.getElementById('modal-input-subject').value = pkg.subject;
      document.getElementById('modal-input-text').value = pkg.question;
      document.getElementById('modal-input-duration').value = pkg.duration || 600;
      document.getElementById('modal-package-form').classList.remove('hidden');
    }

    function closePackageFormModal() {
      document.getElementById('modal-package-form').classList.add('hidden');
    }

    function savePackageForm() {
      const idInput = document.getElementById('modal-input-pkg-id').value;
      const subject = document.getElementById('modal-input-subject').value.trim() || 'REGULER';
      const text = document.getElementById('modal-input-text').value.trim();
      const duration = parseInt(document.getElementById('modal-input-duration').value) || 600;

      if (!text) {
        showNotification('error', 'Gagal', 'Teks soal esai tidak boleh kosong.');
        return;
      }

      let pkgId = idInput ? parseInt(idInput) : null;
      if (!pkgId) {
        const existingKeys = Object.keys(packagesList).map(Number);
        pkgId = existingKeys.length > 0 ? Math.max(...existingKeys) + 1 : 1;
      }

      const isSpecial = subject.toUpperCase().includes('SPECIAL');

      packagesList[pkgId] = {
        id: pkgId,
        type: isSpecial ? 'special' : 'reguler',
        subject: subject.toUpperCase(),
        question: text,
        duration: duration
      };

      if (!packageStatus[pkgId]) packageStatus[pkgId] = 'belum_mulai';

      savePackagesToStorage();
      saveStatusToStorage();
      renderAdminPackages();
      renderPackagesLandingGrid();
      closePackageFormModal();
      showNotification('success', 'Berhasil Disimpan', `Paket Soal ${pkgId} telah diperbarui.`);
    }

    function deletePackage(id) {
      showConfirmDialog('Hapus Paket Soal?', `Menghapus Paket ${id} akan melenyapkannya dari daftar ujian siswa secara permanen.`, () => {
        delete packagesList[id];
        delete packageStatus[id];
        savePackagesToStorage();
        saveStatusToStorage();
        renderAdminPackages();
        renderPackagesLandingGrid();
        showNotification('success', 'Paket Terhapus', `Paket ${id} berhasil dilenyapkan dari basis data.`);
      });
    }

    // --- STUDENTS HOME LANDING UI ---
    function renderPackagesLandingGrid() {
      const grid = document.getElementById('packages-landing-grid');
      if (!grid) return;
      grid.innerHTML = '';

      const sortedKeys = Object.keys(packagesList).sort((a,b) => parseInt(a) - parseInt(b));
      
      if (sortedKeys.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full text-center py-10 text-slate-400">
            <i class="fa-solid fa-folder-open text-4xl block mb-2"></i>
            Tidak ada paket ujian aktif. Silakan isi paket di Panel Admin.
          </div>
        `;
        return;
      }

      sortedKeys.forEach(id => {
        const pkg = packagesList[id];
        const status = packageStatus[id] || 'belum_mulai';
        const isSelesai = status === 'selesai';
        const isAktif = status === 'sedang_mengerjakan';
        const isSpecial = pkg.type === 'special' || pkg.subject.toUpperCase().includes('SPECIAL');

        let badgeText = 'Belum Dimulai';
        let badgeClass = 'bg-slate-100 text-slate-500';
        
        // Pembedaan Warna Tema Berdasarkan Tipe Reguler / Special
        let cardBorderClass = isSpecial 
            ? 'border-indigo-100 hover:border-indigo-500 hover:shadow-lg bg-indigo-50/30' 
            : 'border-slate-200 hover:border-amber-500 hover:shadow-lg bg-white/90';
            
        let iconClass = isSpecial 
            ? 'bg-indigo-100 text-indigo-700 border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white' 
            : 'bg-amber-50 text-amber-700 border-amber-100 group-hover:bg-amber-500 group-hover:text-white';
            
        let titleHoverClass = isSpecial ? 'group-hover:text-indigo-700' : 'group-hover:text-amber-700';
        let subjClass = isSpecial ? 'text-indigo-600' : 'text-red-600';
        
        if (isSelesai) {
          badgeText = 'Sudah Dinilai';
          badgeClass = 'bg-emerald-100 text-emerald-700 font-bold';
          cardBorderClass = 'border-emerald-200 hover:border-emerald-500 hover:shadow-md bg-white';
        } else if (isAktif) {
          badgeText = 'Sedang Dikerjakan';
          badgeClass = 'bg-amber-100 text-amber-700 font-bold animate-pulse';
          cardBorderClass = 'border-amber-200 hover:border-amber-500 hover:shadow-md bg-white';
        }

        const mins = Math.floor((pkg.duration || 600) / 60);

        grid.innerHTML += `
          <div onclick="selectAndStartPackage(${pkg.id})" class="group border-2 rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 space-y-4 shadow-sm ${cardBorderClass}">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black font-title mx-auto transition-colors border ${iconClass}">
              ${pkg.id}
            </div>
            <div>
              <h4 class="font-bold text-slate-800 transition-colors ${titleHoverClass}">Paket Soal ${pkg.id}</h4>
              <p class="text-[10px] font-extrabold uppercase mt-1 tracking-wider ${subjClass}">${pkg.subject}</p>
            </div>
            <div class="text-xs text-slate-400 flex items-center justify-center gap-1">
              <i class="fa-regular fa-clock"></i> ${mins} Menit
            </div>
            <div class="text-[10px] font-semibold py-1 rounded-full ${badgeClass}">
              ${badgeText}
            </div>
          </div>
        `;
      });
    }

    // --- SEAMLESS WORKSPACE FLOW ---
    function selectAndStartPackage(pkgId) {
      activePackageId = pkgId;
      const pkg = packagesList[pkgId];
      if (!pkg) return;

      const startExamFlow = () => {
        packageStatus[pkgId] = 'sedang_mengerjakan';
        saveStatusToStorage();
        renderPackagesLandingGrid();

        document.getElementById('section-package-selector').classList.add('hidden');
        document.getElementById('section-exam').classList.remove('hidden');

        document.getElementById('exam-question-number').textContent = `Paket Soal #${pkgId}`;
        document.getElementById('exam-question-subject').textContent = pkg.subject;
        
        // Pembedaan warna teks subject di dalam soal workspace
        const isSpecial = pkg.type === 'special' || pkg.subject.toUpperCase().includes('SPECIAL');
        document.getElementById('exam-question-subject').className = isSpecial 
            ? "text-xs md:text-sm font-extrabold tracking-widest text-indigo-700 uppercase font-title"
            : "text-xs md:text-sm font-extrabold tracking-widest text-red-700 uppercase font-title";
            
        document.getElementById('exam-question-text').textContent = pkg.question;

        const savedAns = studentAnswers[pkgId] || { text: '', html: '' };
        document.getElementById('essay-editor').innerHTML = savedAns.html || '';

        document.getElementById('timer-pkg-label').textContent = `Waktu Paket ${pkgId}`;
        document.getElementById('info-pkg-subject').textContent = pkg.subject;
        document.getElementById('info-pkg-status').textContent = 'Aktif';
        document.getElementById('info-pkg-status').className = 'font-bold text-amber-600';

        timeRemaining = pkg.duration || 600;
        totalExamDuration = pkg.duration || 600;

        startTimer();
        updateCounters();
        updateMascotCompanion('exam');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      if (packageStatus[pkgId] === 'selesai') {
        showHistoryOrRetakeDialog(pkgId, startExamFlow);
      } else {
        startExamFlow();
      }
    }

    function showHistoryOrRetakeDialog(pkgId, startExamFlow) {
      const container = document.getElementById('modal-alert-buttons');
      container.innerHTML = `
        <button onclick="closeCustomDialog(); loadStudentHistory(${pkgId})" class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition shadow-sm border border-slate-200"><i class="fa-solid fa-clock-rotate-left"></i> Lihat Riwayat Hasil</button>
        <button onclick="closeCustomDialog(); resetAndStartExam(${pkgId})" class="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-md"><i class="fa-solid fa-rotate-right"></i> Kerjakan Ulang</button>
      `;

      const iconBox = document.getElementById('modal-alert-icon-container');
      iconBox.className = "w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl bg-indigo-100 text-indigo-600";
      iconBox.innerHTML = '<i class="fa-solid fa-file-signature"></i>';

      document.getElementById('modal-alert-title').textContent = "Paket Telah Dikerjakan";
      document.getElementById('modal-alert-desc').innerHTML = "Anda sudah pernah mendapatkan penilaian untuk paket ini. Anda ingin melihat ulasan riwayat sebelumnya atau menghapus draf dan mengerjakan ulang?";
      document.getElementById('modal-alert').classList.remove('hidden');
    }

    function resetAndStartExam(pkgId) {
      studentAnswers[pkgId] = { text: '', html: '' };
      saveAnswersToStorage();
      
      // We must manually trigger start flow
      activePackageId = pkgId;
      packageStatus[pkgId] = 'sedang_mengerjakan';
      saveStatusToStorage();
      renderPackagesLandingGrid();

      document.getElementById('section-package-selector').classList.add('hidden');
      document.getElementById('section-exam').classList.remove('hidden');

      const pkg = packagesList[pkgId];
      document.getElementById('exam-question-number').textContent = `Paket Soal #${pkgId}`;
      document.getElementById('exam-question-subject').textContent = pkg.subject;
      
      const isSpecial = pkg.type === 'special' || pkg.subject.toUpperCase().includes('SPECIAL');
      document.getElementById('exam-question-subject').className = isSpecial 
          ? "text-xs md:text-sm font-extrabold tracking-widest text-indigo-700 uppercase font-title"
          : "text-xs md:text-sm font-extrabold tracking-widest text-red-700 uppercase font-title";
          
      document.getElementById('exam-question-text').textContent = pkg.question;
      document.getElementById('essay-editor').innerHTML = '';

      document.getElementById('timer-pkg-label').textContent = `Waktu Paket ${pkgId}`;
      document.getElementById('info-pkg-subject').textContent = pkg.subject;
      document.getElementById('info-pkg-status').textContent = 'Aktif';
      document.getElementById('info-pkg-status').className = 'font-bold text-amber-600';

      timeRemaining = pkg.duration || 600;
      totalExamDuration = pkg.duration || 600;

      startTimer();
      updateCounters();
      updateMascotCompanion('exam');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function exitToPackageSelector() {
      saveCurrentResponseState();
      clearInterval(timerInterval);
      
      document.getElementById('section-exam').classList.add('hidden');
      document.getElementById('section-evaluation').classList.add('hidden');
      document.getElementById('section-package-selector').classList.remove('hidden');
      
      renderPackagesLandingGrid();
      updateMascotCompanion('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function handleEditorInput() {
      const indicator = document.getElementById('saved-indicator');
      if (indicator) {
        indicator.innerHTML = `<span class="text-amber-500 font-bold"><i class="fa-solid fa-spinner animate-spin mr-1"></i>Mengetik...</span>`;
      }
      
      updateCounters();
      
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        saveCurrentResponseState();
      }, 700);
    }

    // --- GRADES LEDGER & HISTORY MANAGER ---
    function saveGradesLedger() {
      localStorage.setItem('swp_grades_ledger', JSON.stringify(gradesLedger));
    }

    function loadGradesLedger() {
      const stored = localStorage.getItem('swp_grades_ledger');
      if (stored) {
        gradesLedger = JSON.parse(stored);
      }
    }

    function renderGradesLedgerTable() {
      const tbody = document.getElementById('admin-grades-tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (gradesLedger.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-4 text-center text-slate-400">Belum ada pengumpulan jawaban terdeteksi.</td></tr>`;
        return;
      }

      [...gradesLedger].reverse().forEach(log => {
        tbody.innerHTML += `
          <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
            <td class="px-4 py-2">${log.date} <span class="text-[10px] text-slate-400 block">${log.time || ''}</span></td>
            <td class="px-4 py-2 font-mono text-[11px]">${log.studentId}</td>
            <td class="px-4 py-2 font-semibold text-blue-700">Paket ${log.pkgId}</td>
            <td class="px-4 py-2 text-center font-black ${log.score >= 75 ? 'text-emerald-600' : 'text-amber-600'}">${log.score}</td>
            <td class="px-4 py-2 text-center">
              <button onclick="viewHistoryDetail(${log.id})" class="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition shadow-sm border border-blue-200">
                <i class="fa-solid fa-file-lines mr-1"></i> Detail
              </button>
            </td>
          </tr>
        `;
      });
    }

    function clearGradesLedger() {
      showConfirmDialog('Kosongkan Riwayat Nilai?', 'Tindakan ini akan menghapus log semua rekap nilai dan jawaban siswa yang tersimpan.', () => {
        gradesLedger = [];
        saveGradesLedger();
        renderGradesLedgerTable();
        showNotification('success', 'Dibersihkan', 'Daftar riwayat nilai berhasil dibersihkan.');
      });
    }

    // Fitur Menampilkan Riwayat untuk Siswa di layar utama (Section Evaluation)
    function loadStudentHistory(pkgId) {
      // Find the most recent log for this pkgId
      const reversedLedger = [...gradesLedger].reverse();
      const historyLog = reversedLedger.find(log => log.pkgId === pkgId);

      if (!historyLog || !historyLog.eval) {
        showNotification('error', 'Riwayat Tidak Tersedia', 'Data evaluasi terperinci untuk paket ini dari sesi sebelumnya tidak ditemukan atau belum menggunakan sistem perekaman baru.');
        return;
      }

      activePackageId = pkgId;
      document.getElementById('section-package-selector').classList.add('hidden');
      document.getElementById('section-evaluation').classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      renderEvaluationContent(historyLog.pkgId, historyLog.studentId, historyLog.date, historyLog.score, historyLog.answer, historyLog.eval);
      updateMascotCompanion('eval');
    }

    // Fitur Menampilkan Modal Detail History untuk Admin
    function viewHistoryDetail(logId) {
      const log = gradesLedger.find(l => l.id === logId);
      if (!log) return;

      document.getElementById('modal-history-subtitle').textContent = `Log ID: ${log.studentId} | Tanggal: ${log.date} ${log.time || ''}`;
      
      const pkg = packagesList[log.pkgId];
      const questionText = pkg ? pkg.question : "Soal tidak ditemukan.";
      const evalData = log.eval || getSmartFallbackEvaluation(questionText, log.answer || "");

      let modalContent = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Pertanyaan & Jawaban -->
          <div class="space-y-3">
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h5 class="text-xs font-bold text-slate-500 mb-1">Pertanyaan (Paket ${log.pkgId}):</h5>
              <p class="text-slate-700 text-sm leading-relaxed font-medium">${escapeHtml(questionText)}</p>
            </div>
            <div class="bg-blue-50/40 p-4 rounded-xl border border-blue-200 shadow-sm">
              <h5 class="text-xs font-bold text-blue-800 mb-1">Jawaban Siswa:</h5>
              <div class="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-sans max-h-64 overflow-y-auto pr-2 custom-scroll">${escapeHtml(log.answer || 'Data jawaban tidak tersimpan.')}</div>
            </div>
          </div>
          
          <!-- Hasil Evaluasi AI -->
          <div class="space-y-4">
            <div class="flex items-center gap-4 bg-slate-900 p-4 rounded-xl text-white shadow-sm border border-slate-700">
              <div class="w-14 h-14 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-title text-2xl font-black text-amber-400">${log.score}</div>
              <div>
                <h5 class="text-xs text-slate-400 font-bold uppercase tracking-wider">Skor Akhir Evaluator</h5>
                <p class="text-sm font-semibold">${log.score >= 75 ? 'Memenuhi Standar' : 'Perlu Peningkatan'}</p>
              </div>
            </div>
            
            <div class="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5 space-y-1">
              <h5 class="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-circle-check"></i> Kelebihan</h5>
              <p class="text-xs text-slate-600 leading-relaxed">${evalData.kelebihan}</p>
            </div>

            <div class="bg-rose-50/50 border border-rose-200 rounded-xl p-3.5 space-y-1">
              <h5 class="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-circle-xmark"></i> Kekurangan</h5>
              <p class="text-xs text-slate-600 leading-relaxed">${evalData.kekurangan}</p>
            </div>

            <div class="bg-amber-50/50 border border-amber-200 rounded-xl p-3.5 space-y-1">
              <h5 class="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5"><i class="fa-solid fa-wand-magic-sparkles"></i> Rekomendasi</h5>
              <p class="text-xs text-slate-600 leading-relaxed whitespace-pre-line">${evalData.koreksi}</p>
            </div>
          </div>
        </div>
      `;

      document.getElementById('modal-history-content').innerHTML = modalContent;
      document.getElementById('modal-history-detail').classList.remove('hidden');
    }

    function closeHistoryModal() {
      document.getElementById('modal-history-detail').classList.add('hidden');
    }

    // --- CONFIG EXPORT / IMPORT (JSON DEVELOPER SUITE) ---
    function exportPackagesJSON() {
      const exportData = {
        packagesList: packagesList,
        defaultAiPrompt: localStorage.getItem('swp_ai_prompt') || defaultAiPrompt
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "swp_essay_packages_database.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showNotification('success', 'Ekspor Berhasil', 'Database paket soal aktif telah terunduh ke komputer Anda.');
    }

    // --- SECURITY PIN VALIDATION ---
    function toggleAdminMode() {
      const adminSection = document.getElementById('section-admin');
      const isHidden = adminSection.classList.contains('hidden');

      if (isHidden) {
        showInputDialog('Verifikasi Admin', 'Silakan masukkan PIN pengembang khusus Anda untuk mengelola paket soal dan data kelas:', (pin) => {
          if (pin === adminPin) {
            adminSection.classList.remove('hidden');
            document.getElementById('btn-toggle-mode').innerHTML = '<i class="fa-solid fa-lock"></i> Kunci Admin';
            document.getElementById('role-badge').className = "bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2";
            document.getElementById('role-badge').innerHTML = `<span class="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>Mode Admin Aktif`;
            showNotification('success', 'Akses Berhasil', 'Developer & Panel Kontrol Admin terbuka.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            showNotification('error', 'Akses Ditolak', 'Kode PIN Admin tidak valid.');
          }
        });
      } else {
        lockToExamMode();
      }
    }

    function lockToExamMode() {
      document.getElementById('section-admin').classList.add('hidden');
      document.getElementById('btn-toggle-mode').innerHTML = '<i class="fa-solid fa-user-gear"></i> Masuk Admin';
      document.getElementById('role-badge').className = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2";
      document.getElementById('role-badge').innerHTML = `<span class="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>Mode Ujian Aktif`;
    }

    function saveAdminConfigurations() {
      const promptText = document.getElementById('admin-ai-prompt').value;
      localStorage.setItem('swp_ai_prompt', promptText);
      saveApiKey();
    }

    function loadConfigurations() {
      loadApiKeyFromStorage();
      const storedPrompt = localStorage.getItem('swp_ai_prompt');
      document.getElementById('admin-ai-prompt').value = storedPrompt || defaultAiPrompt;
    }

    function saveApiKey() {
      const key = document.getElementById('input-api-key').value.trim();
      localStorage.setItem('swp_api_key', key);
      showNotification('success', 'Konfigurasi Disimpan', 'Konfigurasi sistem API & Prompt Evaluasi berhasil dimutakhirkan.');
    }

    function loadApiKeyFromStorage() {
      const key = localStorage.getItem('swp_api_key') || '';
      document.getElementById('input-api-key').value = key;
    }

    function toggleApiKeyVisibility() {
      const input = document.getElementById('input-api-key');
      const eye = document.getElementById('eye-icon');
      if (input.type === 'password') {
        input.type = 'text';
        eye.className = 'fa-regular fa-eye-slash';
      } else {
        input.type = 'password';
        eye.className = 'fa-regular fa-eye';
      }
    }

    // --- OTHER CORE UTILITIES ---
    function saveAnswersToStorage() {
      localStorage.setItem('swp_student_answers', JSON.stringify(studentAnswers));
    }

    function savePackagesToStorage() {
      localStorage.setItem('swp_packages_list', JSON.stringify(packagesList));
    }

    function loadStoredPackages() {
      const stored = localStorage.getItem('swp_packages_list');
      if (stored) {
        packagesList = JSON.parse(stored);
      }
    }

    function saveStatusToStorage() {
      localStorage.setItem('swp_package_status', JSON.stringify(packageStatus));
    }

    function loadStoredStatus() {
      const stored = localStorage.getItem('swp_package_status');
      if (stored) {
        packageStatus = JSON.parse(stored);
      }
    }

    function handleStoredAnswers() {
      const stored = localStorage.getItem('swp_student_answers');
      if (stored) {
        studentAnswers = JSON.parse(stored);
      }
    }

    function loadStoredAnswers() {
      handleStoredAnswers();
    }

    function execCmd(command, value = null) {
      document.execCommand(command, false, value);
      document.getElementById('essay-editor').focus();
      handleEditorInput();
    }

    function clearFormatting() {
      document.execCommand('removeFormat', false, null);
      document.getElementById('essay-editor').focus();
      handleEditorInput();
    }

    function escapeHtml(text) {
      if (!text) return '';
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    // --- ALERTS & CONFIRMATIONS ---
    function showNotification(type, title, desc) {
      const container = document.getElementById('modal-alert-buttons');
      if (!container) return;
      container.innerHTML = `<button onclick="closeCustomDialog()" class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-md">Mengerti</button>`;

      const iconBox = document.getElementById('modal-alert-icon-container');
      if (type === 'success') {
        iconBox.className = "w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl bg-emerald-100 text-emerald-600";
        iconBox.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
      } else if (type === 'error') {
        iconBox.className = "w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl bg-rose-100 text-rose-600";
        iconBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
      } else {
        iconBox.className = "w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl bg-amber-100 text-amber-600";
        iconBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i>';
      }

      document.getElementById('modal-alert-title').textContent = title;
      document.getElementById('modal-alert-desc').innerHTML = desc;
      document.getElementById('modal-alert').classList.remove('hidden');
    }

    function showConfirmDialog(title, desc, onConfirmCallback) {
      const container = document.getElementById('modal-alert-buttons');
      if (!container) return;
      container.innerHTML = `
        <button onclick="closeCustomDialog()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition">Batal</button>
        <button id="modal-confirm-btn" class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-md">Lanjutkan</button>
      `;

      const iconBox = document.getElementById('modal-alert-icon-container');
      iconBox.className = "w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl bg-blue-100 text-blue-600";
      iconBox.innerHTML = '<i class="fa-solid fa-circle-question"></i>';

      document.getElementById('modal-alert-title').textContent = title;
      document.getElementById('modal-alert-desc').innerHTML = desc;

      document.getElementById('modal-confirm-btn').onclick = () => {
        closeCustomDialog();
        onConfirmCallback();
      };

      document.getElementById('modal-alert').classList.remove('hidden');
    }

    function showInputDialog(title, desc, onConfirmCallback) {
      const container = document.getElementById('modal-alert-buttons');
      if (!container) return;
      container.innerHTML = `
        <button onclick="closeCustomDialog()" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition">Batal</button>
        <button id="modal-submit-pin-btn" class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-md">Verifikasi</button>
      `;

      const iconBox = document.getElementById('modal-alert-icon-container');
      iconBox.className = "w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl bg-slate-100 text-slate-700";
      iconBox.innerHTML = '<i class="fa-solid fa-shield-halved"></i>';

      document.getElementById('modal-alert-title').textContent = title;
      document.getElementById('modal-alert-desc').innerHTML = `
        <div class="space-y-3">
          <p class="text-xs text-slate-500 leading-relaxed">${desc}</p>
          <input type="password" id="modal-alert-input" placeholder="Masukkan PIN" class="w-full text-center tracking-widest px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none">
        </div>
      `;

      document.getElementById('modal-submit-pin-btn').onclick = () => {
        const val = document.getElementById('modal-alert-input').value;
        closeCustomDialog();
        onConfirmCallback(val);
      };

      document.getElementById('modal-alert').classList.remove('hidden');
      setTimeout(() => {
        const inputField = document.getElementById('modal-alert-input');
        if (inputField) inputField.focus();
      }, 100);
    }

    function closeCustomDialog() {
      document.getElementById('modal-alert').classList.add('hidden');
    }

    function saveCurrentResponseState() {
      const editor = document.getElementById('essay-editor');
      if (!editor) return;
      
      studentAnswers[activePackageId] = {
        text: editor.innerText.trim(),
        html: editor.innerHTML
      };

      saveAnswersToStorage();
      
      const indicator = document.getElementById('saved-indicator');
      if (indicator) {
        indicator.innerHTML = `<span class="text-emerald-600 font-bold"><i class="fa-solid fa-check-double mr-1"></i>Tersimpan</span>`;
      }
    }

    function updateCounters() {
      const editor = document.getElementById('essay-editor');
      if (!editor) return;
      const text = editor.innerText.trim();
      const html = editor.innerHTML;

      // Word Counter Logic
      const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

      const counterWord = document.getElementById('counter-word');
      const counterText = document.getElementById('counter-text');
      const counterHtml = document.getElementById('counter-html');

      if (counterWord) counterWord.textContent = wordCount;
      if (counterText) counterText.textContent = text.length;
      if (counterHtml) counterHtml.textContent = html === '<br>' ? 0 : html.length;
    }

    // --- TIMING COUNTER (10 MENIT) ---
    function startTimer() {
      clearInterval(timerInterval);
      const progress = document.getElementById('timer-progress');
      
      timerInterval = setInterval(() => {
        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          forceSubmitExam();
        } else {
          timeRemaining--;
          updateTimerDisplay();
          
          const percent = (timeRemaining / totalExamDuration) * 100;
          if (progress) {
            progress.style.width = `${percent}%`;
            if (percent < 20) {
              progress.className = 'bg-red-500 h-full transition-all duration-1000';
              document.getElementById('countdown-timer').classList.add('text-red-500', 'animate-pulse');
            } else {
              progress.className = 'bg-amber-500 h-full transition-all duration-1000';
              document.getElementById('countdown-timer').classList.remove('text-red-500', 'animate-pulse');
            }
          }
        }
      }, 1000);
    }

    function updateTimerDisplay() {
      const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
      const s = (timeRemaining % 60).toString().padStart(2, '0');
      const timerDisplay = document.getElementById('countdown-timer');
      if (timerDisplay) {
        timerDisplay.textContent = `${m}:${s}`;
      }
    }

    // --- EVALUATION CONTROLLER ---
    function confirmSubmitExam() {
      const text = studentAnswers[activePackageId]?.text || '';
      if (text.length < 5) {
        showNotification('warning', 'Teks Masih Kosong', 'Ketik esai analisis Anda di editor terlebih dahulu sebelum mengirimkan jawaban.');
        return;
      }

      showConfirmDialog('Selesaikan Paket Soal?', 'Sistem AI UNDIP akan langsung mengevaluasi keselarasan argumen, kebahasaan, dan memberikan skor kelulusan.', () => {
        clearInterval(timerInterval);
        processExamEvaluation();
      });
    }

    function forceSubmitExam() {
      showNotification('warning', 'Waktu Habis!', 'Sisa waktu pengerjaan paket telah habis. Mengirimkan jawaban otomatis...');
      processExamEvaluation();
    }

    async function processExamEvaluation() {
      saveCurrentResponseState();
      
      packageStatus[activePackageId] = 'selesai';
      saveStatusToStorage();
      renderPackagesLandingGrid();

      // Screen transition
      document.getElementById('section-exam').classList.add('hidden');
      document.getElementById('section-evaluation').classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const dateStr = new Date().toLocaleDateString('id-ID', { dateStyle: 'long' });
      const timeStr = new Date().toLocaleTimeString('id-ID', { timeStyle: 'short' });
      
      // Init header details
      document.getElementById('eval-pkg-badge').textContent = `Lembar Hasil Evaluasi Paket ${activePackageId}`;
      document.getElementById('eval-date-str').textContent = `${dateStr} ${timeStr}`;
      
      const studentId = 'SWP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      document.getElementById('eval-user-id').textContent = studentId;

      const container = document.getElementById('evaluation-details-container');
      if (!container) return;
      
      container.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm animate-pulse">
          <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto animate-spin">
            <i class="fa-solid fa-circle-notch"></i>
          </div>
          <h4 class="text-lg font-bold text-slate-800 font-title">AI Sedang Mengevaluasi Jawaban Esai Paket ${activePackageId}...</h4>
          <p class="text-sm text-slate-500 max-w-md mx-auto">Tutor bimbingan Study With Parthoo sedang meneliti akurasi gagasan, struktur alinea, dan kedalaman sintesis draf Anda.</p>
        </div>
      `;

      // Update Mascot State to Evaluation celebratory mode
      updateMascotCompanion('eval');

      const apiKey = localStorage.getItem('swp_api_key') || "";
      const currentPkg = packagesList[activePackageId];
      const studentAns = studentAnswers[activePackageId]?.text || "(Siswa mengumpulkan lembar kosong)";

      let evalResult = null;

      if (apiKey) {
        evalResult = await fetchAiEvaluation(apiKey, currentPkg.question, currentPkg.subject, studentAns);
      }

      // Offline fallback
      if (!evalResult) {
        evalResult = getSmartFallbackEvaluation(currentPkg.question, studentAns);
      }

      // Record grade to simulated Grades Ledger
      gradesLedger.push({
        id: Date.now(),
        date: dateStr,
        time: timeStr,
        studentId: studentId,
        pkgId: activePackageId,
        score: evalResult.score,
        chars: studentAns.length,
        answer: studentAns,
        eval: evalResult
      });
      saveGradesLedger();
      renderGradesLedgerTable();

      renderEvaluationContent(activePackageId, studentId, `${dateStr} ${timeStr}`, evalResult.score, studentAns, evalResult);
    }

    // Helper untuk merender hasil Evaluasi (bisa digunakan untuk evaluasi baru atau riwayat)
    function renderEvaluationContent(pkgId, sId, dateTime, score, studentAns, evalResult) {
      const container = document.getElementById('evaluation-details-container');
      const currentPkg = packagesList[pkgId];

      // Update Detail Atas
      document.getElementById('eval-pkg-badge').textContent = `Lembar Hasil Evaluasi Paket ${pkgId}`;
      document.getElementById('eval-date-str').textContent = dateTime;
      document.getElementById('eval-user-id').textContent = sId;
      document.getElementById('average-score-val').textContent = score;

      const gradeLabel = document.getElementById('grade-label');
      if (score >= 80) {
        gradeLabel.textContent = "Sangat Memuaskan (LOLOS UM)";
        gradeLabel.className = "text-[10px] text-emerald-400 font-extrabold tracking-wider mt-1.5 uppercase";
      } else if (score >= 65) {
        gradeLabel.textContent = "Cukup Memuaskan (Potensi Lolos)";
        gradeLabel.className = "text-[10px] text-blue-400 font-extrabold tracking-wider mt-1.5 uppercase";
      } else {
        gradeLabel.textContent = "Perlu Belajar Lebih Giat";
        gradeLabel.className = "text-[10px] text-rose-400 font-extrabold tracking-wider mt-1.5 uppercase";
      }

      // Initialize Chat Tutor History if not exists
      if (!chatHistories[pkgId]) {
        chatHistories[pkgId] = [
          { role: 'assistant', text: `Halo! Saya adalah AI Tutor Anda untuk Paket ${pkgId}. Di sebelah kiri adalah ulasan koreksi saya. Silakan tanyakan jika ada poin yang kurang dipahami!` }
        ];
      }

      let chatHTML = chatHistories[pkgId].map(msg => {
        if (msg.role === 'assistant') {
          return `<div class="bg-slate-800 text-slate-300 p-3 rounded-xl mr-4 leading-relaxed border border-slate-700/50">${msg.text}</div>`;
        } else {
          return `<div class="bg-blue-600 text-white p-3 rounded-xl ml-4 text-right leading-relaxed font-medium">${msg.text}</div>`;
        }
      }).join('');

      container.innerHTML = `
        <div class="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-fadeIn">
          
          <!-- Laporan Analisis Kiri -->
          <div class="lg:col-span-8 p-6 space-y-6 border-r border-slate-100">
            <div class="flex justify-between items-start">
              <div>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-widest block">Pertanyaan Paket ${pkgId}</span>
                <span class="text-xs font-extrabold text-red-700 font-title uppercase tracking-wider">${currentPkg ? currentPkg.subject : 'SUBJEK TIDAK DIKETAHUI'}</span>
              </div>
            </div>

            <!-- Pertanyaan & Jawaban -->
            <div class="space-y-3">
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-sm">
                <h5 class="text-xs font-bold text-slate-500 mb-1">Pertanyaan Ujian:</h5>
                <p class="text-slate-700 text-sm leading-relaxed font-medium">${escapeHtml(currentPkg ? currentPkg.question : '')}</p>
              </div>
              <div class="bg-blue-50/40 p-4 rounded-xl border border-blue-200/60 shadow-sm">
                <h5 class="text-xs font-bold text-blue-800 mb-1">Jawaban Esai Anda:</h5>
                <p class="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-sans">${escapeHtml(studentAns)}</p>
              </div>
            </div>

            <!-- Analisis Kognitif -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-2 shadow-sm">
                <h5 class="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <i class="fa-solid fa-circle-check"></i> Kelebihan Analisis
                </h5>
                <p class="text-xs text-slate-600 leading-relaxed">${evalResult.kelebihan}</p>
              </div>
              <div class="bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-2 shadow-sm">
                <h5 class="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <i class="fa-solid fa-circle-xmark"></i> Celah / Aspek Kurang
                </h5>
                <p class="text-xs text-slate-600 leading-relaxed">${evalResult.kekurangan}</p>
              </div>
            </div>

            <!-- Koreksi Paragraf -->
            <div class="bg-amber-50/50 border border-amber-200 rounded-xl p-4 space-y-2 shadow-sm">
              <h5 class="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Koreksi & Rekomendasi Redaksi Teks
              </h5>
              <p class="text-xs text-slate-600 leading-relaxed whitespace-pre-line">${evalResult.koreksi}</p>
            </div>

            <!-- Rujukan Jawaban Sempurna -->
            <div class="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 space-y-2 shadow-sm">
              <h5 class="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                <i class="fa-solid fa-lightbulb"></i> Kerangka Rujukan Nilai Sempurna
              </h5>
              <p class="text-xs text-slate-600 leading-relaxed whitespace-pre-line">${evalResult.ideal}</p>
            </div>
          </div>

          <!-- Tutor Chat Kanan -->
          <div class="lg:col-span-4 bg-slate-900 text-white p-5 flex flex-col min-h-[400px] lg:min-h-0">
            <div class="pb-3 border-b border-slate-800 flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <h5 class="text-xs font-bold font-title text-slate-200">Asisten Tanya-Jawab</h5>
                <p class="text-[10px] text-slate-400">Tanyakan detail evaluasi ini</p>
              </div>
            </div>

            <!-- Container Pesan -->
            <div id="chat-messages-${pkgId}" class="flex-1 space-y-3 overflow-y-auto py-4 max-h-[340px] text-xs custom-scroll">
              ${chatHTML}
            </div>

            <!-- Form Input Kirim -->
            <div class="pt-3 border-t border-slate-800 flex gap-2 mt-auto">
              <input 
                type="text" 
                id="chat-input-${pkgId}" 
                placeholder="Tanyakan ke asisten..." 
                onkeypress="handleChatEnter(event, ${pkgId})"
                class="flex-1 bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
              <button onclick="sendChatMessage(${pkgId})" class="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-lg text-xs transition">
                <i class="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>

        </div>
      `;
      // Gulir chat ke paling bawah
      const chatContainer = document.getElementById(`chat-messages-${pkgId}`);
      if(chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // --- GEMINI API ENGINE ---
    async function fetchAiEvaluation(apiKey, question, subject, studentAnswer) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const systemPrompt = localStorage.getItem('swp_ai_prompt') || defaultAiPrompt;

      const userQuery = `Mata Ujian: ${subject}
Pertanyaan Ujian: ${question}
Jawaban Siswa: ${studentAnswer}`;

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
      };

      let delay = 1000;
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return JSON.parse(textResponse);
          }
        } catch (err) {}
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; 
      }
      return null;
    }

    // --- SMART OFFLINE FALLBACK ---
    function getSmartFallbackEvaluation(question, studentAnswer) {
      const charCount = studentAnswer.length;
      let score = 30;

      if (charCount > 600) {
        score = 85 + Math.min(10, Math.floor((charCount - 600) / 100));
      } else if (charCount > 300) {
        score = 70 + Math.floor((charCount - 300) / 20);
      } else if (charCount > 50) {
        score = 45 + Math.floor(charCount / 10);
      }

      const wordCount = studentAnswer.split(/\s+/).length;
      if (wordCount < 10) {
        score = Math.max(10, score - 30);
      }

      return {
        score: score,
        kelebihan: "Tanggapan siswa menunjukkan pembawaan tata bahasa yang padu serta korelasi yang runtut dengan inti pertanyaan esai.",
        kekurangan: "Siswa kurang mengelaborasi teori sosiologi-politik serta tidak menghadirkan solusi fungsional konkret selaku kaum akademis.",
        koreksi: "Tuliskan setidaknya 1 perbandingan kasus serupa di masa lampau agar ulasan esai Anda terlihat lebih berbobot di mata tim penilai UNDIP.",
        ideal: "1. Tesis utama yang tangguh mengurai urgensi topik.\n2. Pembahasan landasan teoritik/hukum yang akurat.\n3. Solusi operasional jangka panjang.\n4. Kalimat simpulan yang persuasif."
      };
    }

    // --- EVALUATION CHAT ASSISTANT ---
    function handleChatEnter(evt, pkgId) {
      if (evt.key === 'Enter') {
        sendChatMessage(pkgId);
      }
    }

    async function sendChatMessage(pkgId) {
      const input = document.getElementById(`chat-input-${pkgId}`);
      if (!input) return;
      const queryText = input.value.trim();
      if (!queryText) return;

      input.value = '';
      const chatContainer = document.getElementById(`chat-messages-${pkgId}`);
      if (!chatContainer) return;

      // User Message Render
      const userDiv = document.createElement('div');
      userDiv.className = "bg-blue-600 text-white p-3 rounded-xl ml-4 text-right leading-relaxed font-medium";
      userDiv.textContent = queryText;
      chatContainer.appendChild(userDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      if(!chatHistories[pkgId]) chatHistories[pkgId] = [];
      chatHistories[pkgId].push({ role: 'user', text: queryText });

      // Loading state render
      const loadDiv = document.createElement('div');
      loadDiv.className = "bg-slate-800 text-slate-400 p-3 rounded-xl mr-4 leading-relaxed flex items-center gap-1.5 animate-pulse";
      loadDiv.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin text-xs"></i> Tutor sedang menyusun penjelasan...`;
      chatContainer.appendChild(loadDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      const apiKey = localStorage.getItem('swp_api_key') || "";
      let responseText = "Konfigurasi API Key Anda di Panel Admin untuk melakukan percakapan interaktif.";

      if (apiKey) {
        responseText = await fetchChatResponseFromGemini(apiKey, pkgId, queryText);
      }

      chatContainer.removeChild(loadDiv);

      // AI Response render
      const aiDiv = document.createElement('div');
      aiDiv.className = "bg-slate-800 text-slate-300 p-3 rounded-xl mr-4 leading-relaxed border border-slate-700/50";
      aiDiv.textContent = responseText;
      chatContainer.appendChild(aiDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      chatHistories[pkgId].push({ role: 'assistant', text: responseText });
    }

    async function fetchChatResponseFromGemini(apiKey, pkgId, newUserQuery) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const targetPkg = packagesList[pkgId];
      // Cari histori jawaban dari gradesLedger atau draft jika belum disubmit ulang
      const reversedLedger = [...gradesLedger].reverse();
      const historyLog = reversedLedger.find(log => log.pkgId === pkgId);
      const targetAnswer = historyLog ? historyLog.answer : (studentAnswers[pkgId]?.text || "");

      const systemPrompt = `Anda adalah tutor bimbingan khusus dari "Study With Parthoo".
Tugas Anda adalah menanggapi pertanyaan tindak lanjut siswa mengenai esai Paket ${pkgId} yang telah dievaluasi.
Berikan masukan secara suportif, ramah, kritis, namun mendidik agar siswa memahami poin kekurangan yang dideteksi penguji.
Pertanyaan: ${targetPkg ? targetPkg.question : ""}
Jawaban Siswa: ${targetAnswer}`;

      const contents = (chatHistories[pkgId] || []).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      contents.push({ role: 'user', parts: [{ text: newUserQuery }] });

      const payload = {
        contents: contents,
        systemInstruction: { parts: [{ text: systemPrompt }] }
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, asisten tutor tidak merespons.";
        }
      } catch (err) {}
      return "Tutor gagal menghubungi server penguji.";
    }

    // --- OTHER CORE ACTIONS ---
    function handleFileSelect(evt) {
      const file = evt.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const imported = JSON.parse(e.target.result);
          let parsedData = {};
          if (Array.isArray(imported)) {
            imported.forEach((item, index) => {
              parsedData[index + 1] = {
                id: index + 1,
                type: item.subject.toUpperCase().includes('SPECIAL') ? 'special' : 'reguler',
                subject: item.subject || 'REGULER',
                question: item.question || 'Soal kosong.',
                duration: item.duration || 600
              };
            });
          } else if (typeof imported === 'object') {
            Object.keys(imported).forEach(k => {
              parsedData[k] = {
                id: parseInt(k),
                type: (imported[k].subject || '').toUpperCase().includes('SPECIAL') ? 'special' : 'reguler',
                subject: imported[k].subject || 'REGULER',
                question: imported[k].question || 'Soal kosong.',
                duration: imported[k].duration || 600
              };
            });
          }

          packagesList = parsedData;
          savePackagesToStorage();
          renderAdminPackages();
          renderPackagesLandingGrid();
          showNotification('success', 'Impor Sukses!', 'Paket Soal berhasil diperbarui dari file JSON.');
        } catch (err) {
          showNotification('error', 'Gagal Membaca File', 'Berkas JSON tidak sesuai format atau rusak.');
        }
      };
      reader.readAsText(file);
    }

    // --- FLOATING MASCOT ("MIKO") DYNAMIC ACTIONS ---
    function updateMascotCompanion(state) {
      activeMascotState = state;
      const avatar = document.getElementById('mascot-avatar');
      if (!avatar) return;

      // Reset old animation classes
      avatar.classList.remove('mascot-anim-float', 'mascot-anim-breath', 'mascot-anim-wobble');

      // Apply tailored animation matching Miko's vibe
      if (state === 'home') {
        avatar.classList.add('mascot-anim-float');
      } else if (state === 'exam') {
        avatar.classList.add('mascot-anim-breath');
      } else if (state === 'eval') {
        avatar.classList.add('mascot-anim-wobble');
      } else {
        avatar.classList.add('mascot-anim-float');
      }

      // Speak default first bubble message
      showMascotSpeech(mascotDialogueMap[state][0]);
    }

    function showMascotSpeech(text) {
      const speechBubble = document.getElementById('mascot-speech');
      const speechText = document.getElementById('mascot-speech-text');
      if (!speechBubble || !speechText) return;

      speechText.textContent = text;
      speechBubble.classList.remove('opacity-0', 'translate-y-2');
      speechBubble.classList.add('opacity-100', 'translate-y-0');

      clearTimeout(mascotTimeout);
      mascotTimeout = setTimeout(() => {
        speechBubble.classList.remove('opacity-100', 'translate-y-0');
        speechBubble.classList.add('opacity-0', 'translate-y-2');
      }, 7000); // Hide bubble after 7 seconds
    }

    function speakMascotQuote() {
      const dialogues = mascotDialogueMap[activeMascotState];
      const randomIndex = Math.floor(Math.random() * dialogues.length);
      showMascotSpeech(dialogues[randomIndex]);
    }

    function toggleMascotVisibility() {
      const avatar = document.getElementById('mascot-avatar');
      const icon = document.getElementById('mascot-toggle-icon');
      const speechBubble = document.getElementById('mascot-speech');
      
      if (!avatar || !icon || !speechBubble) return;

      if (avatar.classList.contains('hidden')) {
        avatar.classList.remove('hidden');
        speechBubble.classList.remove('hidden');
        icon.className = 'fa-solid fa-eye-slash';
        speakMascotQuote();
      } else {
        avatar.classList.add('hidden');
        speechBubble.classList.add('hidden');
        icon.className = 'fa-solid fa-eye';
      }
    }

// --- DRAG & DROP INSTANT LOADER EVENT LISTENERS ---
    document.addEventListener("DOMContentLoaded", () => {
      const dropZone = document.getElementById('drop-zone');
      if (dropZone) {
        dropZone.addEventListener('dragover', (e) => { 
          e.preventDefault(); 
          dropZone.classList.add('border-blue-500', 'bg-blue-100/50'); 
        });
        dropZone.addEventListener('dragleave', () => { 
          dropZone.classList.remove('border-blue-500', 'bg-blue-100/50'); 
        });
        dropZone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropZone.classList.remove('border-blue-500', 'bg-blue-100/50');
          const files = e.dataTransfer.files;
          if (files.length > 0) {
            const fileUploader = document.getElementById('file-uploader');
            if (fileUploader) fileUploader.files = files;
            handleFileSelect({ target: { files: files } });
          }
        });
      }
    });

    /* STUDY WITH PARTHOO V2 PRO PATCH */
    document.addEventListener("DOMContentLoaded", () => {
      const h = document.querySelector("header");
      if (h) {
        const badge = document.createElement("div");
        badge.className = "fixed bottom-5 left-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs font-bold toast-pro";
        badge.innerHTML = "⚡ System Ujian V2 PRO Active";
        document.body.appendChild(badge);
        setTimeout(() => badge.remove(), 3500);
      }
    });

    // Keyboard shortcut save (Ctrl + S / Cmd + S)
    document.addEventListener("keydown", e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (typeof saveCurrentResponseState === "function") saveCurrentResponseState();
      }
    });

    // Auto recovery draft when closing page
    window.addEventListener("beforeunload", () => {
      if (typeof saveCurrentResponseState === "function") saveCurrentResponseState();
    });

    // Better character analytics
    function getEssayAnalytics() {
      const el = document.getElementById("essay-editor");
      if (!el) return null;
      const t = el.innerText.trim();
      return {
        words: t ? t.split(/\s+/).length : 0,
        chars: t.length,
        paragraphs: t.split("\n").filter(Boolean).length
      };
    }

// GSAP motion polish; the application still works if the animation library is unavailable.
document.addEventListener('DOMContentLoaded', () => {
  if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.from('header > div, main > section, main > div', { opacity: 0, y: 18, duration: .65, stagger: .08, ease: 'power3.out', clearProps: 'all' });
    document.querySelectorAll('.card-hover').forEach((card) => {
      card.addEventListener('mouseenter', () => gsap.to(card, { y: -4, duration: .2, ease: 'power2.out' }));
      card.addEventListener('mouseleave', () => gsap.to(card, { y: 0, duration: .25, ease: 'power2.out' }));
    });
  }
});
