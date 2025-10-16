document.addEventListener('DOMContentLoaded', () => {
    const rows = document.querySelectorAll('td.cell-normal');
    addToLocalStorage(rows);
});

function addToLocalStorage(rows) {
    const data = [];

    rows.forEach(td => {
        if (!td.dataset.x || !td.dataset.y || !td.dataset.r) return;

        data.push({
            x: Number(td.dataset.x),
            y: Number(td.dataset.y),
            r: Number(td.dataset.r),
            hit: td.dataset.hit === 'true',
            status: td.dataset.status || null,
            nowTime: td.dataset.nowTime || null,
            elapsedMs: Number(td.dataset.elapsedMs)
        });
    });

    const oldValue = JSON.parse(localStorage.getItem('results') || '[]');

    data.forEach(item => oldValue.push(item));

    localStorage.setItem('results', JSON.stringify(oldValue));

    console.log(JSON.parse(localStorage.getItem('results')));
}
