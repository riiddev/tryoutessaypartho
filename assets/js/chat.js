    // --- EVALUATION CHAT ASSISTANT ---
    function handleChatEnter(evt, pkgId) {
      if (evt.key === 'Enter') {
        sendChatMessage(pkgId);
      }
    }

    async function sendChatMessage(pkgId) {
      const input = document.getElementById(`chat-input-${pkgId}`);
      if (!input) return;
      const queryText = input.value.trim();
      if (!queryText) return;

      input.value = '';
      const chatContainer = document.getElementById(`chat-messages-${pkgId}`);
      if (!chatContainer) return;

      // User Message Render
      const userDiv = document.createElement('div');
      userDiv.className = "bg-blue-600 text-white p-3 rounded-xl ml-4 text-right leading-relaxed font-medium";
      userDiv.textContent = queryText;
      chatContainer.appendChild(userDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      if(!chatHistories[pkgId]) chatHistories[pkgId] = [];
      chatHistories[pkgId].push({ role: 'user', text: queryText });

      // Loading state render
      const loadDiv = document.createElement('div');
      loadDiv.className = "bg-slate-800 text-slate-400 p-3 rounded-xl mr-4 leading-relaxed flex items-center gap-1.5 animate-pulse";
      loadDiv.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin text-xs"></i> Tutor sedang menyusun penjelasan...`;
      chatContainer.appendChild(loadDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      let responseText = await fetchChatResponseFromGemini(null, pkgId, queryText);
      if (!responseText) {
        responseText = "AI belum tersedia. Pastikan GEMINI_API_KEY sudah ditambahkan di Environment Variables Vercel.";
      }

      chatContainer.removeChild(loadDiv);

      // AI Response render
      const aiDiv = document.createElement('div');
      aiDiv.className = "bg-slate-800 text-slate-300 p-3 rounded-xl mr-4 leading-relaxed border border-slate-700/50";
      aiDiv.textContent = responseText;
      chatContainer.appendChild(aiDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      chatHistories[pkgId].push({ role: 'assistant', text: responseText });
    }

    async function fetchChatResponseFromGemini(_unusedApiKey, pkgId, newUserQuery) {
      const targetPkg = packagesList[pkgId];
      const reversedLedger = [...gradesLedger].reverse();
      const historyLog = reversedLedger.find(log => log.pkgId === pkgId);
      const targetAnswer = historyLog ? historyLog.answer : (studentAnswers[pkgId]?.text || "");
      const messages = (chatHistories[pkgId] || []).slice(-12).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        text: String(msg.text || '').slice(0, 1800)
      }));

      try {
        const response = await fetch('/api/essay-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'chat',
            subject: targetPkg?.subject || '',
            question: targetPkg?.question || '',
            answer: targetAnswer,
            messages
          })
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.text || null;
      } catch (error) {
        return null;
      }
    }
