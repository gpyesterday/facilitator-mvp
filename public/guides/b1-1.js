let timerInterval = null;
let timeLeft = 0;
let isRunning = false;

function switchTab(tabId) {
  const panels = document.querySelectorAll('.tab-panel');
  const buttons = document.querySelectorAll('.tab-btn');
  panels.forEach(p => { p.classList.remove('active'); });
  buttons.forEach(b => { b.classList.remove('active'); });
  document.getElementById(tabId).classList.add('active');
  event.currentTarget.classList.add('active');
  updateProgress();
}

function updateProgress() {
  const activeIndex = Array.from(document.querySelectorAll('.tab-panel')).findIndex(p => p.classList.contains('active'));
  const progress = ((activeIndex + 1) / 6) * 100;
  document.getElementById('headerProgress').style.width = progress + '%';
}

function toggleCheck(cb) {
  cb.classList.toggle('checked');
  updateCheckCount();
}

function toggleAccordion(header) {
  header.classList.toggle('active');
  const content = header.nextElementSibling;
  if (content.style.maxHeight) {
    content.style.maxHeight = null;
  } else {
    content.style.maxHeight = content.scrollHeight + 'px';
  }
}

function toggleHint(btn) {
  const text = btn.previousElementSibling;
  text.classList.toggle('show');
}

function updateCheckCount() {
  const checked = document.querySelectorAll('.checkbox.checked, .checkbox:checked').length;
  document.getElementById('checkedCount').textContent = checked;
}

function resetChecklist() {
  const checkboxes = document.querySelectorAll('.checkbox');
  checkboxes.forEach(cb => cb.classList.remove('checked'));
  const inputs = document.querySelectorAll('#scoreInputs input');
  inputs.forEach(inp => { inp.value = 0; inp.dispatchEvent(new Event('input')); });
  document.getElementById('totalScore').textContent = '0';
  document.getElementById('totalScore').className = '';
}

function startTimer() {
  if (isRunning) return;
  const minutes = parseInt(document.getElementById('timerInput').value) || 15;
  timeLeft = minutes * 60;
  isRunning = true;
  addLog('info', '⏱️ 인터뷰 타이머 시작 (' + minutes + '분)');
  timerInterval = setInterval(function() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    document.getElementById('timerDisplay').textContent = m + ':' + (s < 10 ? '0' : '') + s;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      addLog('warning', '⏰ 시간 종료!');
      flashTimer();
    }
    timeLeft--;
  }, 1000);
}

function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    isRunning = false;
  }
}

function resetTimer() {
  pauseTimer();
  timeLeft = parseInt(document.getElementById('timerInput').value) * 60 || 900;
  document.getElementById('timerDisplay').textContent = formatTime(timeLeft);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function flashTimer() {
  const display = document.getElementById('timerDisplay');
  display.style.color = '#ef4444';
  display.style.animation = 'pulse 0.5s infinite';
}

function addScoreListener() {
  const inputs = document.querySelectorAll('#scoreInputs input');
  inputs.forEach(inp => {
    inp.parentElement.querySelector('.value').textContent = inp.value;
    inp.addEventListener('input', function() {
      this.parentElement.querySelector('.value').textContent = this.value;
      updateTotalScore();
    });
  });
}

function updateTotalScore() {
  const inputs = document.querySelectorAll('#scoreInputs input');
  let total = 0;
  inputs.forEach(inp => { total += parseInt(inp.value) || 0; });
  const el = document.getElementById('totalScore');
  el.textContent = total;
  el.className = '';
  if (total >= 90) { el.classList.add('pass'); }
  else if (total >= 70) { el.classList.add('warn'); }
  else { el.classList.add('fail'); }
}

function resetScores() {
  const inputs = document.querySelectorAll('#scoreInputs input');
  inputs.forEach(inp => {
    inp.value = 0;
    inp.parentElement.querySelector('.value').textContent = '0';
  });
  document.getElementById('totalScore').textContent = '0';
  document.getElementById('totalScore').className = '';
}

function addLog(type, message) {
  const log = document.getElementById('sessionLog');
  const now = new Date();
  const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  const entry = document.createElement('div');
  entry.className = 'entry';
  const colorMap = { info: '#3b82f6', warning: '#f59e0b', success: '#10b981', fail: '#ef4444' };
  entry.innerHTML = '<span class="time">[' + time + ']</span> <span style="color:' + colorMap[type] + '">' + message + '</span>';
  log.prepend(entry);
}

function logAction(type, message) {
  addLog(type, message);
  document.getElementById('logInput').value = '';
}

function clearLog() {
  document.getElementById('sessionLog').innerHTML = '<div class="entry"><span class="time">[시스템]</span> 로그가 초기화되었습니다.</div>';
}

window.onload = function() {
  addScoreListener();
  resetTimer();
  document.getElementById('logInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addLog('info', this.value);
  });
};
