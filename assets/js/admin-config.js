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
      const promptText = document.getElementById('admin-ai-prompt').value.trim();
      localStorage.setItem('swp_ai_prompt', promptText);
      showNotification('success', 'Konfigurasi Disimpan', 'Rubrik penilaian disimpan. Kunci API AI tetap aman di server Vercel.');
    }

    function loadConfigurations() {
      const storedPrompt = localStorage.getItem('swp_ai_prompt');
      document.getElementById('admin-ai-prompt').value = storedPrompt || defaultAiPrompt;
    }
