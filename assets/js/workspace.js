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
      if (typeof resetLiveReview === 'function') resetLiveReview();
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
