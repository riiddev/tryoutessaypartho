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
