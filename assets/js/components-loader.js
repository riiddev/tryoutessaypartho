(function () {
  const components = [
    ['header', './components/header.html'],
    ['admin-panel', './components/admin-panel.html'],
    ['package-selector', './components/package-selector.html'],
    ['exam-workspace', './components/exam-workspace.html'],
    ['evaluation', './components/evaluation.html'],
    ['mascot', './components/mascot.html'],
    ['modals', './components/modals.html']
  ];
  const modules = [
    'core.js','question-bank.js','admin.js','workspace.js','history.js','admin-config.js',
    'storage-editor.js','dialogs.js','timer.js','evaluation.js','chat.js','companion.js',
    'file-import.js','live-review.js','motion.js'
  ];
  function addScript(src) {
    return new Promise((resolve, reject) => {
      const script=document.createElement('script');
      script.src='./assets/js/'+src;
      script.onload=resolve;
      script.onerror=()=>reject(new Error('Gagal memuat modul: '+src));
      document.body.appendChild(script);
    });
  }
  async function boot() {
    const rendered=await Promise.all(components.map(async ([name,url])=>{
      const response=await fetch(url,{cache:'no-cache'});
      if(!response.ok) throw new Error('Komponen '+name+' tidak ditemukan.');
      return [name,await response.text()];
    }));
    for(const [name,markup] of rendered) {
      const target=document.querySelector('[data-component="'+name+'"]');
      if(!target) throw new Error('Wadah komponen '+name+' tidak ditemukan.');
      target.innerHTML=markup;
    }
    window.__appComponentsReady=true;
    for(const moduleName of modules) await addScript(moduleName);
    document.dispatchEvent(new Event('app:components-loaded'));
    document.dispatchEvent(new Event('app:modules-loaded'));
  }
  boot().catch(error=>{
    console.error('[Nulis Esai] Gagal memuat aplikasi:',error);
    const alert=document.getElementById('app-load-error');
    if(alert){alert.hidden=false;alert.textContent='Aplikasi gagal dimuat ('+error.message+'). Periksa koneksi, lalu muat ulang halaman.';}
  });
})();
