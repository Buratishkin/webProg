const SERVER_URL = 'http://localhost:8080/fcgi-bin/server.jar';

// Получаем DOM-элементы
const form = document.getElementById('data_form');
const xInput = document.getElementById('x_input');
const rInput = document.getElementById('r_input');
const ySelect = document.getElementById('y-select');
const submitButton = document.getElementById('submit_button');
const resultsBody = document.getElementById('results_table_body');
const canvas = document.getElementById('graph_canvas');

// Основа графика
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const CX = Math.floor(W / 2); // (0,0)
const CY = Math.floor(H / 2);
const MARGIN = 35;

// ===== Утилиты форматирования/валидации =====
function cleanNumberString(s) {
  return s.trim().replace(',', '.');
}

function isNumericString(s) {
  if (s === '' || s === '-') return false;
  return /^-?\d+(\.\d+)?$/.test(s);
}

// ===== Отображение ошибок ПОД полем + краткая подсветка =====
function showFieldError(el, message) {
  // краткая подсветка (как в highlightInvalid)
  const prev = el.style.border;
  el.style.border = '2px solid #ff5252';
  setTimeout(() => { el.style.border = prev; }, 1400);

  // контейнер сообщения
  let msgEl = el.nextElementSibling;
  if (!msgEl || !msgEl.classList.contains('error-message')) {
    msgEl = document.createElement('div');
    msgEl.className = 'error-message';
    msgEl.style.color = '#ff5252';
    msgEl.style.fontSize = '12px';
    msgEl.style.marginTop = '4px';
    el.insertAdjacentElement('afterend', msgEl);
  }
  msgEl.textContent = message;
}

function clearFieldError(el) {
  const msgEl = el.nextElementSibling;
  if (msgEl && msgEl.classList.contains('error-message')) {
    msgEl.remove();
  }
  el.style.border = '';
}

// ===== Валидаторы (без alert) =====
function validateX(xStr) {
  const s = cleanNumberString(xStr);
  if (!isNumericString(s)) return { ok: false, msg: 'X должен быть числом (например, 1.5).' };
  const x = parseFloat(s);
  if (!(x >= -3 && x <= 5)) return { ok: false, msg: 'X вне диапазона [-3, 5].' };
  return { ok: true, value: x };
}

function validateR(rStr) {
  const s = cleanNumberString(rStr);
  if (!isNumericString(s)) return { ok: false, msg: 'R должен быть числом (например, 2).' };
  const r = parseFloat(s);
  if (!(r >= 1 && r <= 4)) return { ok: false, msg: 'R вне диапазона [1, 4].' };
  return { ok: true, value: r };
}

function getSelectedY() {
  const val = ySelect.value;
  return val !== '' ? parseFloat(val) : null;
}

// ===== Графика =====
function currentRForDraw() {
  const v = validateR(rInput.value);
  return v.ok ? v.value : 2; // безопасное значение для отрисовки
}

// Преобразование координат
function makeScaler(R) {
  const scale = (Math.min(CX, CY) - MARGIN) / R; 
  const toX = (x) => CX + x * scale;
  const toY = (y) => CY - y * scale;
  return { scale, toX, toY };
}

function clearCanvas() {
  ctx.clearRect(0, 0, W, H);
}

// Оси, деления и подписи
function drawAxes(R, toX, toY) {
  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#e0e0e0';

  // X
  ctx.beginPath();
  ctx.moveTo(0, CY); ctx.lineTo(W, CY); ctx.stroke();
  // Y
  ctx.beginPath();
  ctx.moveTo(CX, 0); ctx.lineTo(CX, H); ctx.stroke();

  // Стрелки
  ctx.beginPath();
  ctx.moveTo(W - 10, CY - 5); ctx.lineTo(W, CY); ctx.lineTo(W - 10, CY + 5);
  ctx.moveTo(CX - 5, 10);     ctx.lineTo(CX, 0);  ctx.lineTo(CX + 5, 10);
  ctx.stroke();

  // Деления и подписи
  ctx.fillStyle = '#e0e0e0';
  ctx.font = '12px Segoe UI, Arial';

  const ticks = [-R, -R/2, R/2, R];

  // по X
  ticks.forEach((t) => {
    const x = toX(t);
    ctx.beginPath();
    ctx.moveTo(x, CY - 5); ctx.lineTo(x, CY + 5); ctx.stroke();
    ctx.fillText(t ===  R   ? 'R'   :
                 t === -R   ? '-R'  :
                 t ===  R/2 ? 'R/2' : '-R/2', x - 14, CY + 18);
  });

  // по Y
  ticks.forEach((t) => {
    const y = toY(t);
    ctx.beginPath();
    ctx.moveTo(CX - 5, y); ctx.lineTo(CX + 5, y); ctx.stroke();
    ctx.fillText(t ===  R   ? 'R'   :
                 t === -R   ? '-R'  :
                 t ===  R/2 ? 'R/2' : '-R/2', CX + 8, y + 4);
  });

  ctx.fillText('x', W - 12, CY - 8);
  ctx.fillText('y', CX + 8, 12);

  ctx.restore();
}

// Закрашенная область (как на картинке)
function drawArea(R, toX, toY, scale) {
  ctx.save();
  ctx.fillStyle = 'rgba(79, 195, 247, 0.55)';

  // 1) Четверть круга в I четверти
  ctx.beginPath();
  ctx.moveTo(CX, CY);
  ctx.arc(CX, CY, R * scale, -Math.PI / 2, 0, false);
  ctx.closePath();
  ctx.fill();

  // 2) Прямоугольник в III четверти: x∈[-R/2,0], y∈[-R,0]
  ctx.beginPath();
  ctx.moveTo(toX(-R/2), toY(0));
  ctx.lineTo(toX(-R/2), toY(-R));
  ctx.lineTo(toX(0),     toY(-R));
  ctx.lineTo(toX(0),     toY(0));
  ctx.closePath();
  ctx.fill();

  // 3) Треугольник в IV четверти: (0,0) – (R,0) – (0,-R)
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(0));
  ctx.lineTo(toX(R), toY(0));
  ctx.lineTo(toX(0), toY(-R));
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Полная перерисовка
function redraw() {
  const R = currentRForDraw();
  const { scale, toX, toY } = makeScaler(R);
  clearCanvas();
  drawArea(R, toX, toY, scale);
  drawAxes(R, toX, toY);
}

// Перерисовывать при изменении R
if (rInput) rInput.addEventListener('input', redraw);

// Первый рендер
redraw();

// Формат времени
function formatTimeISO(date = new Date()) {
  const z = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${z(date.getMonth() + 1)}-${z(date.getDate())} ${z(date.getHours())}:${z(date.getMinutes())}:${z(date.getSeconds())}`;
}

// Добавление строки в таблицу
function appendResultRow({ x, y, r, status, serverTime, scriptTimeMs }) {
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td>${x}</td>
    <td>${y}</td>
    <td>${r}</td>
    <td>${status}</td>
    <td>${serverTime || formatTimeISO()}</td>
    <td>${typeof scriptTimeMs === 'number' ? scriptTimeMs.toFixed(3) + ' ms' : (scriptTimeMs || '—')}</td>
  `;

  resultsBody.insertBefore(tr, resultsBody.firstChild);
}

// ===== Обработчик submit без alert =====
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const xRaw = xInput.value;
  const rRaw = rInput.value;
  const yVal = getSelectedY();

  // валидация X
  const vx = validateX(xRaw);
  if (!vx.ok) {
    showFieldError(xInput, vx.msg);
    return;
  } else {
    clearFieldError(xInput);
  }

  // валидация R
  const vr = validateR(rRaw);
  if (!vr.ok) {
    showFieldError(rInput, vr.msg);
    return;
  } else {
    clearFieldError(rInput);
  }

  // валидация Y
  if (yVal === null) {
    showFieldError(ySelect, 'Выберите значение Y.');
    return;
  } else {
    clearFieldError(ySelect);
  }

  const payload = new URLSearchParams();
  payload.append('x', vx.value);
  payload.append('y', yVal);
  payload.append('r', vr.value);

  try {
    const startTime = performance.now();

    const resp = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: payload.toString()
    });

    const endTime = performance.now();

    if (!resp.ok) {
      // показываем описание статуса под кнопкой (не alert)
      showFieldError(submitButton, `HTTP ${resp.status} ${resp.statusText || ''}`.trim());
      return;
    }

    let json;
    try {
      json = await resp.json();
    } catch {
      showFieldError(submitButton, 'Ответ сервера не JSON.');
      return;
    }

    clearFieldError(submitButton);

    if (Array.isArray(json)) {
      resultsBody.innerHTML = '';
      json.forEach(item => {
        appendResultRow({
          x: item.x,
          y: item.y,
          r: item.r,
          status: (item.hit === true) ? 'Попадание' : 'Промах',
          serverTime: item.time,
          scriptTimeMs: item.execMs ?? (endTime - startTime)
        });
      });
    }
  } catch (err) {
    // сеть/доступ: показываем сообщение под кнопкой
    showFieldError(submitButton, `Ошибка запроса: ${err.message}`);
  }
});
