// Live AI review: debounce writing and cap calls to avoid a request for every keystroke.
let liveReviewTimer=null;
let liveReviewAbortController=null;
let liveReviewLastText='';
let liveReviewLastRequestAt=0;
let liveReviewSequence=0;
function liveReviewElement(id){return document.getElementById(id);}
function liveReviewStatus(message,isError=false){
 const node=liveReviewElement('live-review-status');
 if(node){node.textContent=message;node.classList.toggle('is-error',isError);}
}
function liveReviewList(id,items,fallback){
 const node=liveReviewElement(id);if(!node)return;
 node.replaceChildren();
 const values=Array.isArray(items)?items.filter(Boolean).slice(0,4):[];
 (values.length?values:[fallback]).forEach(item=>{
  const li=document.createElement('li');li.textContent=String(item);node.appendChild(li);
 });
}
function resetLiveReview(){
 liveReviewLastText='';
 liveReviewAbortController?.abort();liveReviewAbortController=null;clearTimeout(liveReviewTimer);
 liveReviewStatus('Menunggu tulisan');
 const score=liveReviewElement('live-review-score');if(score)score.innerHTML='—<small>/100</small>';
 const summary=liveReviewElement('live-review-summary');if(summary)summary.textContent='Mulai tulis minimal 30 kata untuk mendapat masukan AI.';
 liveReviewList('live-review-strengths',[],'Argumen dan ide akan ditinjau di sini.');
 liveReviewList('live-review-improvements',[],'AI akan menunjukkan perbaikan yang paling penting.');
 const next=liveReviewElement('live-review-next');if(next)next.textContent='Gunakan contoh, alasan, dan solusi yang jelas.';
}
function scheduleLiveReview(){
 const editor=liveReviewElement('essay-editor');if(!editor)return;
 const answer=(editor.innerText||editor.textContent||'').trim();
 const words=answer?answer.split(/\s+/).filter(Boolean).length:0;
 if(words<30){
  clearTimeout(liveReviewTimer);
  liveReviewStatus(words?'Butuh lebih banyak konteks':'Menunggu tulisan');
  const summary=liveReviewElement('live-review-summary');
  if(summary)summary.textContent='Tulis minimal 30 kata agar AI dapat menilai isi, bukan hanya satu kalimat.';
  return;
 }
 if(answer===liveReviewLastText)return;
 clearTimeout(liveReviewTimer);liveReviewStatus('Menunggu jeda ketikan…');
 const elapsed=Date.now()-liveReviewLastRequestAt;
 liveReviewTimer=setTimeout(runLiveReview,Math.max(1600,5500-elapsed));
}
async function runLiveReview(){
 const editor=liveReviewElement('essay-editor');
 const answer=editor?(editor.innerText||editor.textContent||'').trim():'';
 const words=answer?answer.split(/\s+/).filter(Boolean).length:0;
 if(words<30||answer===liveReviewLastText)return;
 const pkg=packagesList[activePackageId]||{};
 const sequence=++liveReviewSequence;
 liveReviewAbortController?.abort();liveReviewAbortController=new AbortController();
 liveReviewStatus('AI sedang membaca…');
 const summary=liveReviewElement('live-review-summary');
 if(summary)summary.textContent='Memeriksa relevansi isi, alur argumen, struktur, dan kejelasan tulisan.';
 liveReviewLastRequestAt=Date.now();
 try{
  const response=await fetch('/api/essay-review',{
   method:'POST',headers:{'Content-Type':'application/json'},signal:liveReviewAbortController.signal,
   body:JSON.stringify({action:'review',subject:pkg.subject||'Esai umum',question:pkg.question||'',answer:answer.slice(0,12000),rubricPrompt:localStorage.getItem('swp_ai_prompt')||''})
  });
  const data=await response.json().catch(()=>({}));
  if(sequence!==liveReviewSequence)return;
  if(!response.ok){
   liveReviewStatus('AI belum terhubung',true);
   if(summary)summary.textContent=data.message||'AI belum dikonfigurasi di Vercel. Tambahkan GEMINI_API_KEY.';
   return;
  }
  const result=data.result||data.review;if(!result)throw new Error('Respons AI tidak lengkap.');
  const score=liveReviewElement('live-review-score');
  if(score)score.innerHTML=String(Math.max(0,Math.min(100,Number(result.score)||0)))+'<small>/100</small>';
  if(summary)summary.textContent=result.ringkasan||'Draf sudah ditinjau. Lihat poin perbaikan di bawah.';
  liveReviewList('live-review-strengths',result.kekuatan,'Tambahkan argumen spesifik agar kekuatan tulisan terlihat.');
  liveReviewList('live-review-improvements',result.perlu_diperbaiki,'Perjelas tesis, bukti, dan hubungan sebab-akibat.');
  const next=liveReviewElement('live-review-next');if(next)next.textContent=result.langkah_berikutnya||'Perbaiki satu poin utama lalu tulis ulang paragraf terkait.';
  liveReviewLastText=answer;liveReviewStatus('Diperbarui sekarang');
 }catch(error){
  if(error.name==='AbortError'||sequence!==liveReviewSequence)return;
  liveReviewStatus('Gagal menghubungi AI',true);
  if(summary)summary.textContent='Periksa koneksi dan konfigurasi GEMINI_API_KEY di Vercel.';
 }
}
document.addEventListener('input',event=>{if(event.target&&event.target.id==='essay-editor')scheduleLiveReview();});
