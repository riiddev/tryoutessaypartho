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
