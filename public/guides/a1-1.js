(() => {
  const storageKey = 'a1-1-facilitation-guide-v1';
  const tabs = Array.from(document.querySelectorAll('.tab-btn'));
  const panels = Array.from(document.querySelectorAll('.tab-panel'));
  const checks = Array.from(document.querySelectorAll('.mission-check'));
  const headerProgress = document.getElementById('headerProgress');
  const progressCaption = document.getElementById('progressCaption');
  const checkedCount = document.getElementById('checkedCount');
  const totalCount = document.getElementById('totalCount');
  const saveStatus = document.getElementById('saveStatus');
  const notes = document.getElementById('sessionNotes');
  const notesStatus = document.getElementById('notesStatus');
  let timerInterval = null;
  let timeLeft = 900;

  function announce(message, element) {
    element.textContent = message;
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      checks.forEach((check) => { check.checked = saved.checks?.[check.dataset.check] === true; });
      notes.value = typeof saved.notes === 'string' ? saved.notes : '';
      updateProgress();
    } catch (error) {
      announce('브라우저 저장소를 읽지 못했습니다. 체크와 메모는 이 탭을 닫으면 사라질 수 있습니다.', saveStatus);
    }
  }

  function saveState() {
    const state = {
      checks: Object.fromEntries(checks.map((check) => [check.dataset.check, check.checked])),
      notes: notes.value
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      announce('현재 브라우저에 자동 저장됨', saveStatus);
      announce('메모 자동 저장됨', notesStatus);
    } catch (error) {
      announce('브라우저 저장에 실패했습니다. 메모를 별도로 보관하세요.', saveStatus);
      announce('브라우저 저장에 실패했습니다. 메모를 별도로 보관하세요.', notesStatus);
    }
  }

  function updateProgress() {
    const completed = checks.filter((check) => check.checked).length;
    const total = checks.length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    headerProgress.style.width = `${percent}%`;
    progressCaption.textContent = `체크리스트 ${completed} / ${total}개 완료 (${percent}%)`;
    checkedCount.textContent = String(completed);
    totalCount.textContent = String(total);
  }

  function switchTab(tabId, focusButton) {
    panels.forEach((panel) => {
      const isActive = panel.id === tabId;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
    });
    tabs.forEach((button) => {
      const isActive = button.dataset.tab === tabId;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });
    if (focusButton) focusButton.focus();
  }

  tabs.forEach((button, index) => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === 'Home' ? 0
        : event.key === 'End' ? tabs.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      switchTab(tabs[nextIndex].dataset.tab, tabs[nextIndex]);
    });
  });

  checks.forEach((check) => check.addEventListener('change', () => {
    updateProgress();
    saveState();
  }));
  notes.addEventListener('input', saveState);

  document.getElementById('resetChecklist').addEventListener('click', () => {
    checks.forEach((check) => { check.checked = false; });
    updateProgress();
    saveState();
  });

  function renderTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timerDisplay').textContent =
      `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  document.getElementById('startTimer').addEventListener('click', () => {
    if (timerInterval !== null) return;
    if (timeLeft <= 0) {
      const minutes = Number(document.getElementById('timerInput').value);
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
        document.getElementById('timerInput').focus();
        return;
      }
      timeLeft = minutes * 60;
    }
    timerInterval = window.setInterval(() => {
      timeLeft -= 1;
      renderTimer();
      if (timeLeft <= 0) {
        window.clearInterval(timerInterval);
        timerInterval = null;
        document.getElementById('timerDisplay').style.color = 'var(--danger)';
      }
    }, 1000);
  });

  document.getElementById('pauseTimer').addEventListener('click', () => {
    if (timerInterval !== null) {
      window.clearInterval(timerInterval);
      timerInterval = null;
    }
  });

  document.getElementById('resetTimer').addEventListener('click', () => {
    if (timerInterval !== null) window.clearInterval(timerInterval);
    timerInterval = null;
    const minutes = Number(document.getElementById('timerInput').value);
    timeLeft = Number.isInteger(minutes) && minutes >= 1 && minutes <= 180 ? minutes * 60 : 900;
    document.getElementById('timerDisplay').style.color = '';
    renderTimer();
  });

  loadState();
  switchTab('overview');
  renderTimer();
})();
