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
