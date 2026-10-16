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
