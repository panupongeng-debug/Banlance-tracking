const monthNames = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const timeline = [];
for(let y=2569; y<=2570; y++) monthNames.forEach((m, i) => timeline.push({ y, m: i, name: m + ' ' + (y%100) }));

let currentIdx = 1;
let db = JSON.parse(localStorage.getItem('debtProDB')) || {};

function getDefaults(idx) {
    const y = timeline[idx].y; const m = timeline[idx].m;
    let reg = 56000; let spec = 0; let fHouse = 3400; let fPers = 17000;
    let fCar = (y === 2570 && m >= 1) ? 0 : 12000;
    let items = [
        {n: "A-money", v: 9300, c: false}, {n: "ออมสิน", v: 6800, c: false},
        {n: "Kashjoy", v: 2500, c: false}, {n: "กรุงไทย", v: 2300, c: false}, {n: "Promise", v: 2193, c: false}
    ];
    if ((y === 2569 && m >= 1) || (y === 2570 && m === 0)) {
        if (!(y === 2569 && m >= 11)) items.push({n: "Money Hub", v: 2400, c: false});
    }
    if(y === 2569 && m === 1) { spec = 86764; items.unshift({n: "ปิด Paynext", v: 40000, c: false}); }
    if(y === 2569 && m === 2) items.push({n: "ค่าเทอม", v: 20000, c: false});
    if(y === 2569 && m === 11) { spec = 73660; items.push({n: "ปิด Money Hub", v: 30000, c: false}); }
    if(y === 2570 && m === 1) { spec = 103124; items.push({n: "ปิด Promise", v: 70000, c: false}); }
    if(y === 2570 && m >= 6) reg = 70000;
    return { reg, spec, fCar, fHouse, fPers, items };
}

function render() {
    const tabs = document.getElementById('month-tabs');
    if(!tabs) return;
    tabs.innerHTML = '';
    timeline.forEach((t, i) => {
        const b = document.createElement('button');
        b.className = `flex-shrink-0 pb-1 ${i === currentIdx ? 'tab-active' : ''}`;
        b.innerText = t.name;
        b.onclick = () => { currentIdx = i; render(); };
        tabs.appendChild(b);
    });
    document.getElementById('display-date').innerText = timeline[currentIdx].name;
    let carry = 0; let totalReduced = 0;
    timeline.forEach((t, i) => {
        const key = `${t.y}-${t.m}`;
        if(!db[key]) db[key] = getDefaults(i);
        db[key].items.forEach(item => { if(item.c) totalReduced += item.v; });
        const debtSum = db[key].items.reduce((s, x) => s + x.v, 0);
        const fixSum = (db[key].fCar || 0) + (db[key].fHouse || 0) + (db[key].fPers || 0);
        const net = (db[key].reg + db[key].spec) - fixSum - debtSum;
        if(i === currentIdx) {
            document.getElementById('in-regular').value = db[key].reg;
            document.getElementById('in-special').value = db[key].spec;
            document.getElementById('fix-car').value = db[key].fCar;
            document.getElementById('fix-house').value = db[key].fHouse;
            document.getElementById('fix-personal').value = db[key].fPers;
            document.getElementById('prev-carry').innerText = Math.round(carry).toLocaleString();
            document.getElementById('total-this-month-income').innerText = (db[key].reg + db[key].spec).toLocaleString();
            document.getElementById('total-out').innerText = Math.round(fixSum + debtSum).toLocaleString();
            const bal = carry + net;
            document.getElementById('acc-balance').innerText = Math.round(bal).toLocaleString();
            const cfEl = document.getElementById('month-cf');
            cfEl.innerText = (net >= 0 ? '+' : '') + Math.round(net).toLocaleString();
            cfEl.className = net >= 0 ? 'text-2xl font-black text-emerald-600' : 'text-2xl font-black text-rose-500';
            renderItems(db[key].items);
        }
        carry += net;
    });
    document.getElementById('total-reduced').innerText = Math.round(totalReduced).toLocaleString();
    localStorage.setItem('debtProDB', JSON.stringify(db));
}

function renderItems(items) {
    const list = document.getElementById('item-list');
    list.innerHTML = '';
    items.forEach((item, idx) => {
        list.innerHTML += `<div class="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm ${item.c ? 'checked-item' : ''}">
            <div class="flex items-center gap-3">
                <div onclick="toggleCheck(${idx})" class="w-6 h-6 rounded-full border-2 ${item.c ? 'bg-emerald-500 border-emerald-500' : ''} flex items-center justify-center cursor-pointer">
                    ${item.c ? '<i class="fa-solid fa-check text-white text-[10px]"></i>' : ''}
                </div>
                <div><p class="text-[9px] font-bold text-slate-400">${item.n}</p><p class="text-lg font-bold">${item.v.toLocaleString()}</p></div>
            </div>
            <button onclick="removeItem(${idx})" class="text-slate-200"><i class="fa-solid fa-circle-xmark"></i></button>
        </div>`;
    });
}

function toggleCheck(idx) {
    const key = `${timeline[currentIdx].y}-${timeline[currentIdx].m}`;
    db[key].items[idx].c = !db[key].items[idx].c;
    render();
}

function saveData() {
    const key = `${timeline[currentIdx].y}-${timeline[currentIdx].m}`;
    db[key].reg = parseFloat(document.getElementById('in-regular').value) || 0;
    db[key].spec = parseFloat(document.getElementById('in-special').value) || 0;
    db[key].fCar = parseFloat(document.getElementById('fix-car').value) || 0;
    db[key].fHouse = parseFloat(document.getElementById('fix-house').value) || 0;
    db[key].fPers = parseFloat(document.getElementById('fix-personal').value) || 0;
    render();
}

function addItem() {
    const key = `${timeline[currentIdx].y}-${timeline[currentIdx].m}`;
    db[key].items.push({n: "รายการใหม่", v: 0, c: false});
    render();
}

function removeItem(idx) {
    const key = `${timeline[currentIdx].y}-${timeline[currentIdx].m}`;
    db[key].items.splice(idx, 1);
    render();
}

render();