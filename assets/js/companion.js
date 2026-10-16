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
