const form = document.getElementById('data_form');
const xCheckboxes = document.querySelectorAll('input[name="x"]');
const rButtons = document.querySelectorAll('.r-btn');
const yInput = document.getElementById('y_input');
const deleteButton = document.getElementById('delete_button');
const resultsBody = document.getElementById('results_table_body');
const localStorageKey = 'results';

document.addEventListener('DOMContentLoaded', () => {
    drawGraph('graph_canvas', 0);
    addPoints();
});

function cleanNumberString(s) {
    return s.trim().replace(',', '.');
}

function isNumericString(s) {
    if (s === '' || s === '-') return false;
    return /^-?\d+(\.\d+)?$/.test(s);
}

let xSelected = [];
function validateX(){
    xSelected = Array.from(xCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    if (xSelected.length === 0){
        setError(xCheckboxes[0], "Выберите хотя бы один X");
        return false;
    }
    cleanError(xCheckboxes[0]);
    return true;
}

let yText = "";
function validateY(yInput) {
    if (yInput.value === "") {
        setError(yInput, "Заполните поле");
        return false;
    }
    yText = cleanNumberString(yInput.value);
    if (!isNumericString(yText)){
        setError(yInput, "Y не число");
        return false;
    }
    yText = parseFloat(yText);
    if (yText < -5 || yText > 3) {
        setError(yInput, "Y должен быть -5<=y<=3");
        return false;
    }
    cleanError(yInput);
    return true;
}

let rSelected = null;

rButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.classList.contains('active')) {
            button.classList.remove('active');
            rSelected = null;
            drawGraph('graph_canvas', 0);
        } else {
            rButtons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            rSelected = button.dataset.value;
            drawGraph('graph_canvas', rSelected);
        }
    });
});

function validateR(){
    if (rSelected === null){
        setError(rButtons[0], "Выберите R");
        return false;
    }
    cleanError(rButtons[0]);
    return true;
}

function setError(element, message) {
    const group = element.closest('.input-group');
    const err = group.querySelector('.field_error');
    if (err) err.textContent = message || '';
}

function cleanError(element){
    const group = element.closest('.input-group');
    const err = group.querySelector('.field_error');
    err.textContent = '';
}

function validateAll(){
    console.log('x = ' + xSelected + '; y = ' + yText + '; r = ' + rSelected);
    return validateX() & validateY(yInput) & validateR();
}

//Рисование графика
function drawGraph(canvasId, R) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const W = canvas.width, H = canvas.height;
    const margin = 40;
    const cx = W / 2, cy = H / 2;

    const WORLD_MAX = 5; // диапазон по осям [-5;5]
    const s = Math.min((W/2 - margin)/WORLD_MAX, (H/2 - margin)/WORLD_MAX);

    const X = x => cx + x * s;
    const Y = y => cy - y * s;

    ctx.clearRect(0, 0, W, H);

    // ---- закрашенная область
    ctx.fillStyle = '#777777';
    // (1) прямоугольник: 0 ≤ x ≤ R/2, -R ≤ y ≤ 0
    ctx.beginPath();
    ctx.rect(X(0), Y(0), X(R/2) - X(0), Y(-R) - Y(0));
    ctx.fill();
    // (2) четверть круга радиуса R/2 (центр (0,0), I четверть)
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    ctx.arc(X(0), Y(0), s*(R/2), 0, -Math.PI/2, true);
    ctx.closePath();
    ctx.fill();
    // (3) треугольник: (-R,0) — (0,0) — (0,-R/2)
    ctx.beginPath();
    ctx.moveTo(X(-R), Y(0));
    ctx.lineTo(X(0), Y(0));
    ctx.lineTo(X(0), Y(-R/2));
    ctx.closePath();
    ctx.fill();

    // ---- оси, деления, подписи
    drawAxesWhite(ctx, W, H, cx, cy, s, R, margin, X, Y, WORLD_MAX);

    // ---- точки из localStorage
    drawPreviousPoints(ctx, X, Y);
}

function drawAxesWhite(ctx, W, H, cx, cy, s, R, margin, X, Y, WORLD_MAX) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';

    // --- Сетка (тонкая)
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 0.5;
    for (let i = -WORLD_MAX; i <= WORLD_MAX; i++) {
        // вертикальные линии
        ctx.beginPath();
        ctx.moveTo(X(i), Y(-WORLD_MAX));
        ctx.lineTo(X(i), Y(WORLD_MAX));
        ctx.stroke();
        // горизонтальные линии
        ctx.beginPath();
        ctx.moveTo(X(-WORLD_MAX), Y(i));
        ctx.lineTo(X(WORLD_MAX), Y(i));
        ctx.stroke();
    }

    // --- Оси
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(margin / 2, cy);
    ctx.lineTo(W - margin / 2, cy); // OX
    ctx.moveTo(cx, margin / 2);
    ctx.lineTo(cx, H - margin / 2); // OY
    ctx.stroke();

    // стрелки
    ctx.beginPath();
    ctx.moveTo(W - margin / 2, cy);
    ctx.lineTo(W - margin / 2 - 8, cy - 4);
    ctx.moveTo(W - margin / 2, cy);
    ctx.lineTo(W - margin / 2 - 8, cy + 4);
    ctx.moveTo(cx, margin / 2);
    ctx.lineTo(cx - 4, margin / 2 + 8);
    ctx.moveTo(cx, margin / 2);
    ctx.lineTo(cx + 4, margin / 2 + 8);
    ctx.stroke();

    // --- Деления и подписи от -5 до 5
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = -WORLD_MAX; i <= WORLD_MAX; i++) {
        const tx = X(i);
        ctx.beginPath();
        ctx.moveTo(tx, cy - 4);
        ctx.lineTo(tx, cy + 4);
        ctx.stroke();
        if (i !== 0) ctx.fillText(i, tx, cy + 6);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = -WORLD_MAX; i <= WORLD_MAX; i++) {
        const ty = Y(i);
        ctx.beginPath();
        ctx.moveTo(cx - 4, ty);
        ctx.lineTo(cx + 4, ty);
        ctx.stroke();
        if (i !== 0) ctx.fillText(i, cx - 6, ty);
    }

    // --- Метки ±R и ±R/2
    ctx.fillStyle = '#00ff00';
    const special = [-R, -R / 2, R / 2, R];
    special.forEach(v => {
        if (v >= -WORLD_MAX && v <= WORLD_MAX) {
            // по X
            ctx.beginPath();
            ctx.moveTo(X(v), cy - 6);
            ctx.lineTo(X(v), cy + 6);
            ctx.stroke();
            ctx.fillText(lbl(v, R), X(v), cy + 16);
            // по Y
            ctx.beginPath();
            ctx.moveTo(cx - 6, Y(v));
            ctx.lineTo(cx + 6, Y(v));
            ctx.stroke();
            ctx.fillText(lbl(v, R), cx - 10, Y(v));
        }
    });

    // подписи осей
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('x', W - margin / 2 + 12, cy + 2);
    ctx.fillText('y', cx + 6, margin / 2 - 10);

    function lbl(val, Runit) {
        if (val === -Runit) return '-R';
        if (val === -Runit / 2) return '-R/2';
        if (val === Runit / 2) return 'R/2';
        if (val === Runit) return 'R';
        return String(val);
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateAll()) {
        console.log("Валидация пройдена");
        sendPoints(xSelected, yText, rSelected);
    }
});

function ctd(){ const m = location.pathname.match(/^\/[^/]+/); return m ? m[0] : ''; }
function sendPoints(xArr, y, R) {
    const url = new URL(`${location.origin}${ctd()}/main`);
    (Array.isArray(xArr) ? xArr : [xArr]).forEach(v => url.searchParams.append('x', v));
    url.searchParams.set('y', y);
    url.searchParams.set('R', R);
    window.location.href = url.toString();
}

function addPoints(){
    const points = JSON.parse(localStorage.getItem(localStorageKey));
    console.log(points);
    if (Array.isArray(points)){
        resultsBody.innerHTML = '';
        points.forEach(item => {
            appendResultRow({
                x: item.x,
                y: item.y,
                r: item.r,
                status: (item.hit === true) ? 'Попадание' : 'Промах',
                nowTime: item.nowTime,
                serverTime: item.elapsedMs
            });
        });
    }
}

function appendResultRow({ x, y, r, status, serverTime,nowTime}) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
    <td>${x}</td>
    <td>${y}</td>
    <td>${r}</td>
    <td>${status}</td>
    <td>${nowTime}</td>
    <td>${serverTime.toFixed(3)}ms</td>
  `;

    resultsBody.insertBefore(tr, resultsBody.firstChild);
}

deleteButton.addEventListener('click', () => {
    console.log("Удаление данных");
    resultsBody.innerHTML = '';
    localStorage.setItem(localStorageKey, JSON.stringify([]));
});

const graphCanvas = document.getElementById('graph_canvas');
graphCanvas.addEventListener('click', (event) => {
    if (rSelected === null) {
        return;
    }

    const rect = graphCanvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const W = graphCanvas.width;
    const H = graphCanvas.height;
    const margin = 40;
    const cx = W / 2;
    const cy = H / 2;
    const WORLD_MAX = 5;
    const s = Math.min((W/2 - margin)/WORLD_MAX, (H/2 - margin)/WORLD_MAX);

    // перевод в математические координаты
    const xCoord = (clickX - cx) / s;
    const yCoord = (cy - clickY) / s;

    console.log(`Клик по координатам: x=${xCoord}, y=${yCoord}`);

    // округлим до 3 знаков
    const xFinal = Number(xCoord.toFixed(3));
    const yFinal = Number(yCoord.toFixed(3));

    // если X должен быть только из списка доступных (например чекбоксы), то выбираем ближайшее
    let chosenX = xFinal;
    if (xCheckboxes.length > 0) {
        const available = Array.from(xCheckboxes).map(cb => parseFloat(cb.value));
        let nearest = available[0];
        let minDist = Math.abs(available[0] - xFinal);
        for (let val of available) {
            const d = Math.abs(val - xFinal);
            if (d < minDist) {
                minDist = d;
                nearest = val;
            }
        }
        chosenX = nearest;
        console.log(`Ближайший X из списка: ${chosenX}`);
    }

    // Y — можно брать как есть (если нет ограничений)
    const yClamped = Math.max(-5, Math.min(3, yFinal)); // ограничим по условиям валидации

    // Вызываем отправку
    sendPoints(chosenX, yClamped, rSelected);
});

function drawPreviousPoints(ctx, X, Y) {
    const data = JSON.parse(localStorage.getItem(localStorageKey));
    if (!Array.isArray(data) || data.length === 0) return;

    data.forEach(point => {
        const x = parseFloat(point.x);
        const y = parseFloat(point.y);
        const hit = point.hit === true;

        ctx.beginPath();
        ctx.arc(X(x), Y(y), 4, 0, 2 * Math.PI);

        // Цвет в зависимости от попадания
        ctx.fillStyle = hit ? 'lime' : 'red';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}