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
