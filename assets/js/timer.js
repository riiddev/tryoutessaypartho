    // --- TIMING COUNTER (10 MENIT) ---
    function startTimer() {
      clearInterval(timerInterval);
      const progress = document.getElementById('timer-progress');
      
      timerInterval = setInterval(() => {
        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          forceSubmitExam();
        } else {
          timeRemaining--;
          updateTimerDisplay();
          
          const percent = (timeRemaining / totalExamDuration) * 100;
          if (progress) {
            progress.style.width = `${percent}%`;
            if (percent < 20) {
              progress.className = 'bg-red-500 h-full transition-all duration-1000';
              document.getElementById('countdown-timer').classList.add('text-red-500', 'animate-pulse');
            } else {
              progress.className = 'bg-amber-500 h-full transition-all duration-1000';
              document.getElementById('countdown-timer').classList.remove('text-red-500', 'animate-pulse');
            }
          }
        }
      }, 1000);
    }

    function updateTimerDisplay() {
      const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
      const s = (timeRemaining % 60).toString().padStart(2, '0');
      const timerDisplay = document.getElementById('countdown-timer');
      if (timerDisplay) {
        timerDisplay.textContent = `${m}:${s}`;
      }
    }
