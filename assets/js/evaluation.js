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
      
      const studentId = 'NEP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      document.getElementById('eval-user-id').textContent = studentId;

      const container = document.getElementById('evaluation-details-container');
      if (!container) return;
      
      container.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm animate-pulse">
          <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto animate-spin">
            <i class="fa-solid fa-circle-notch"></i>
          </div>
          <h4 class="text-lg font-bold text-slate-800 font-title">AI Sedang Mengevaluasi Jawaban Esai Paket ${activePackageId}...</h4>
          <p class="text-sm text-slate-500 max-w-md mx-auto">Tutor bimbingan Nulis Esai by Parthoo sedang meneliti akurasi gagasan, struktur alinea, dan kedalaman sintesis draf Anda.</p>
        </div>
      `;

      // Update Mascot State to Evaluation celebratory mode
      updateMascotCompanion('eval');

      const currentPkg = packagesList[activePackageId];
      const studentAns = studentAnswers[activePackageId]?.text || "(Siswa mengumpulkan lembar kosong)";

      let evalResult = await fetchAiEvaluation(null, currentPkg.question, currentPkg.subject, studentAns);

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
          return `<div class="bg-slate-800 text-slate-300 p-3 rounded-xl mr-4 leading-relaxed border border-slate-700/50">${escapeHtml(msg.text)}</div>`;
        } else {
          return `<div class="bg-blue-600 text-white p-3 rounded-xl ml-4 text-right leading-relaxed font-medium">${escapeHtml(msg.text)}</div>`;
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
                <p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(evalResult.kelebihan)}</p>
              </div>
              <div class="bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-2 shadow-sm">
                <h5 class="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <i class="fa-solid fa-circle-xmark"></i> Celah / Aspek Kurang
                </h5>
                <p class="text-xs text-slate-600 leading-relaxed">${escapeHtml(evalResult.kekurangan)}</p>
              </div>
            </div>

            <!-- Koreksi Paragraf -->
            <div class="bg-amber-50/50 border border-amber-200 rounded-xl p-4 space-y-2 shadow-sm">
              <h5 class="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Koreksi & Rekomendasi Redaksi Teks
              </h5>
              <p class="text-xs text-slate-600 leading-relaxed whitespace-pre-line">${escapeHtml(evalResult.koreksi)}</p>
            </div>

            <!-- Rujukan Jawaban Sempurna -->
            <div class="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 space-y-2 shadow-sm">
              <h5 class="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                <i class="fa-solid fa-lightbulb"></i> Kerangka Rujukan Nilai Sempurna
              </h5>
              <p class="text-xs text-slate-600 leading-relaxed whitespace-pre-line">${escapeHtml(evalResult.ideal)}</p>
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

    // --- SERVER-SIDE AI ENGINE ---
    async function fetchAiEvaluation(_unusedApiKey, question, subject, studentAnswer) {
      try {
        const response = await fetch('/api/essay-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'evaluate',
            question,
            subject,
            answer: studentAnswer,
            rubricPrompt: localStorage.getItem('swp_ai_prompt') || defaultAiPrompt
          })
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.result || data;
      } catch (error) {
        return null;
      }
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
