let timerInterval = null;
let timeLeft = 0;
let isRunning = false;

function switchTab(tabId) {
  const panels = document.querySelectorAll('.tab-panel');
  const buttons = document.querySelectorAll('.tab-btn');
  panels.forEach(function(p) { p.classList.remove('active'); });
  buttons.forEach(function(b) { b.classList.remove('active'); });
  document.getElementById(tabId).classList.add('active');
  event.currentTarget.classList.add('active');
  updateProgress();
}

function updateProgress() {
  const activeIndex = Array.from(document.querySelectorAll('.tab-panel')).findIndex(function(p) { return p.classList.contains('active'); });
  const progress = ((activeIndex + 1) / 6) * 100;
  document.getElementById('headerProgress').style.width = progress + '%';
}

function toggleCheck(cb) {
  cb.classList.toggle('checked');
  refreshCounts();
}

function refreshCounts() {
  const dList = document.querySelectorAll('#deliverableChecklist .checkbox');
  let dChecked = 0;
  dList.forEach(function(cb) { if (cb.classList.contains('checked')) dChecked++; });
  document.getElementById('deliverableCount').textContent = dChecked;
  document.getElementById('deliverableTotal').textContent = dList.length;
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
  btn.textContent = text.classList.contains('show') ? '▶ 접기' : '▶ 더보기';
}

function resetChecklist() {
  const checkboxes = document.querySelectorAll('.checkbox');
  checkboxes.forEach(function(cb) { cb.classList.remove('checked'); });
  refreshCounts();
  addSessionLog('info', '🔄 결과물 체크리스트 초기화');
}

/* 워크플로 요구사항 검증기 */
function updateWorkflowCheck() {
  const inputs = document.querySelectorAll('.wf-count');
  let trigger = 0, action = 0, filter = 0, branch = 0;
  inputs.forEach(function(inp, i) {
    const v = parseFloat(inp.value) || 0;
    if (i === 0) trigger = v;
    else if (i === 1) action = v;
    else if (i === 2) filter = v;
    else if (i === 3) branch = v;
  });
  const total = trigger + action + filter + branch;
  document.getElementById('wfTotalCount').textContent = total;
  const badge = document.getElementById('wfStatusBadge');
  const ok = trigger >= 1 && action >= 2 && filter >= 1 && branch >= 1;
  if (ok) {
    badge.innerHTML = '<span class="badge badge-easy">✔ 요구사항 충족 (Trigger≥1, Action≥2, Filter≥1)</span>';
  } else {
    const missing = [];
    if (trigger < 1) missing.push('Trigger');
    if (action < 2) missing.push('Action');
    if (filter < 1) missing.push('Filter');
    if (branch < 1) missing.push('분기실행');
    badge.innerHTML = '<span class="badge badge-hard">✖ 부족: ' + missing.join(', ') + '</span>';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function startTimer() {
  if (isRunning) return;
  const minutes = parseInt(document.getElementById('timerInput').value) || 15;
  timeLeft = minutes * 60;
  isRunning = true;
  addInterviewLog('check', '⏱️ 인터뷰 타이머 시작 (' + minutes + '분)');
  timerInterval = setInterval(function() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    document.getElementById('timerDisplay').textContent = m + ':' + (s < 10 ? '0' : '') + s;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      addInterviewLog('fail', '⏰ 인터뷰 시간 종료!');
      flashTimer();
    }
    timeLeft--;
  }, 1000);
}

function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    addInterviewLog('check', '⏸️ 타이머 일시정지');
  }
}

function resetTimer() {
  pauseTimer();
  timeLeft = parseInt(document.getElementById('timerInput').value) * 60 || 900;
  const display = document.getElementById('timerDisplay');
  display.textContent = formatTime(timeLeft);
  display.style.color = '';
  display.style.animation = '';
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

function addInterviewLog(type, message) {
  const log = document.getElementById('interviewLog');
  const now = new Date();
  const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  const colorMap = { check: '#10b981', fail: '#ef4444', info: '#3b82f6' };
  const entry = document.createElement('div');
  entry.className = 'entry';
  entry.innerHTML = '<span class="time">[' + time + ']</span> <span style="color:' + (colorMap[type] || '#94a3b8') + '">' + escapeHtml(message) + '</span>';
  log.prepend(entry);
}

function addScoreListener() {
  const inputs = document.querySelectorAll('#scoreInputs input');
  inputs.forEach(function(inp) {
    inp.parentElement.querySelector('.value').textContent = inp.value;
    inp.addEventListener('input', function() {
      const max = parseInt(this.getAttribute('data-max')) || 0;
      let v = parseInt(this.value) || 0;
      if (v > max) { v = max; this.value = max; }
      if (v < 0) { v = 0; this.value = 0; }
      this.parentElement.querySelector('.value').textContent = this.value;
      updateTotalScore();
    });
  });
}

function updateTotalScore() {
  const inputs = document.querySelectorAll('#scoreInputs input');
  let total = 0;
  inputs.forEach(function(inp) { total += parseInt(inp.value) || 0; });
  const el = document.getElementById('totalScore');
  el.textContent = total;
  el.className = 'value';
  const grade = document.getElementById('gradeBadge');
  if (total >= 90) {
    el.classList.add('pass');
    grade.textContent = '우수 (A)';
    grade.className = 'badge badge-easy';
  } else if (total >= 70) {
    el.classList.add('warn');
    grade.textContent = '보통 (B)';
    grade.className = 'badge badge-mid';
  } else {
    el.classList.add('fail');
    grade.textContent = '재도전 (C)';
    grade.className = 'badge badge-hard';
  }
}

function resetScores() {
  const inputs = document.querySelectorAll('#scoreInputs input');
  inputs.forEach(function(inp) {
    inp.value = 0;
    inp.parentElement.querySelector('.value').textContent = '0';
  });
  updateTotalScore();
  addSessionLog('info', '⚖️ 채점 점수 초기화');
}

function addSessionLog(type, message) {
  const log = document.getElementById('sessionLog');
  const now = new Date();
  const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  const colorMap = { info: '#3b82f6', success: '#10b981', fail: '#ef4444' };
  const entry = document.createElement('div');
  entry.className = 'entry';
  entry.innerHTML = '<span class="time">[' + time + ']</span> <span style="color:' + (colorMap[type] || '#94a3b8') + '">' + escapeHtml(message) + '</span>';
  log.prepend(entry);
}

function addSessionLogFromInput() {
  const input = document.getElementById('logInput');
  const val = input.value.trim();
  if (!val) return;
  addSessionLog('info', val);
  input.value = '';
}

function clearSessionLog() {
  document.getElementById('sessionLog').innerHTML = '<div class="entry"><span class="time">[시스템]</span> 로그가 초기화되었습니다.</div>';
}

window.onload = function() {
  addScoreListener();
  resetTimer();
  refreshCounts();
  updateWorkflowCheck();
  updateTotalScore();
  const logInput = document.getElementById('logInput');
  logInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addSessionLogFromInput();
  });
};
