const dialog = document.querySelector('#dialog');
const game = document.querySelector('#game');
let version = 0;
document.querySelector('#close').onclick = () => dialog.close();
dialog.addEventListener('close', () => version++);
document.querySelectorAll('[data-game]').forEach(button => button.onclick = () => {
  version++;
  const type = button.dataset.game;
  document.querySelector('#modal-label').textContent = {math:'SONLAR SEHRGARI',memory:'JUFTINI TOP!',art:'KICHIK RASSOM',language:'ONA TILI',english:'ENGLISH TIME',stories:'ERTAK BURCHAGI'}[type];
  ({math:learningMath,memory:memoryGame,art:drawGame,language:languageGame,english:englishGame,stories:storyGame})[type]();
  dialog.showModal();
});
function shuffle(values) {
  const items = [...values];
  for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
  return items;
}
function mathGame() {
  let stars = 0;
  function next() {
    const a = 2 + Math.floor(Math.random()*8), b = 2 + Math.floor(Math.random()*8), answer = a*b;
    const choices = new Set([answer]);
    while (choices.size < 4) choices.add(2 + Math.floor(Math.random()*80));
    game.innerHTML = `<h2>Qani, hisoblab ko‘r! ✨</h2><p>Yig‘ilgan yulduzlar: ${stars} ⭐</p><div class="question">${a} × ${b} = ?</div><div class="answers"></div><p class="feedback" role="status"></p>`;
    let solved = false;
    shuffle(choices).forEach(value => {
      const button = document.createElement('button'); button.textContent = value;
      button.onclick = () => {
        if (solved) return;
        if (value === answer) {
          solved = true; stars++;
          game.querySelector('.feedback').textContent = 'Barakalla! Yana bir yulduz seniki! 🌟';
          game.querySelectorAll('.answers button').forEach(item => item.disabled = true);
          const again = document.createElement('button'); again.className = 'again'; again.textContent = 'Keyingi savol →'; again.onclick = next; game.append(again);
        } else { button.disabled = true; game.querySelector('.feedback').textContent = 'Yana urinib ko‘r, uddalaysan! 💛'; }
      };
      game.querySelector('.answers').append(button);
    });
  }
  next();
}
function memoryGame() {
  const current = ++version;
  let first = null, locked = false, pairs = 0, moves = 0;
  game.innerHTML = '<h2>Xotirangni sinab ko‘r 🌸</h2><p>Bir xil rasmlarni topish uchun kartalarni och.</p><div class="memory-grid"></div><p class="feedback" role="status">Juftlar: 0 / 6 · Urinishlar: 0</p>';
  shuffle(['🌷','🦋','🍓','🌈','⭐','🐱'].flatMap(symbol => [symbol,symbol])).forEach(symbol => {
    const tile = document.createElement('button'); tile.className = 'tile'; tile.textContent = '?'; tile.setAttribute('aria-label','Yashirin karta');
    tile.onclick = () => {
      if (locked || tile.disabled || tile === first) return;
      tile.textContent = symbol; tile.classList.add('open'); tile.setAttribute('aria-label',symbol);
      if (!first) { first = tile; return; }
      const previous = first; first = null; moves++;
      if (previous.textContent === symbol) {
        pairs++; if (pairs === 6) reward('memory', 5); [previous,tile].forEach(item => {item.disabled = true; item.classList.add('matched');});
      } else {
        locked = true;
        setTimeout(() => {
          if (version !== current) return;
          [previous,tile].forEach(item => {item.textContent = '?'; item.classList.remove('open'); item.setAttribute('aria-label','Yashirin karta');}); locked = false;
        },900);
      }
      game.querySelector('.feedback').textContent = pairs === 6 ? `Ajoyib! ${moves} urinishda hamma juftni topding! 🎉` : `Juftlar: ${pairs} / 6 · Urinishlar: ${moves}`;
      if (pairs === 6) { const again = document.createElement('button'); again.className = 'again'; again.textContent = 'Yana o‘ynash ↻'; again.onclick = memoryGame; game.append(again); }
    };
    game.querySelector('.memory-grid').append(tile);
  });
}
function drawGame() {
  game.innerHTML = '<h2>Ranglarga erkinlik ber! 🎨</h2><p>Barmog‘ing yoki sichqoncha bilan chiz.</p><div class="palette" role="group" aria-label="Ranglar"></div><canvas width="900" height="540" aria-label="Rasm chizish maydoni"></canvas><div class="drawing-actions"><button id="clear">Tozalash</button><button id="save">Rasmni saqlash ↓</button></div>';
  const canvas = game.querySelector('canvas'), ctx = canvas.getContext('2d');
  let color = '#cb7a90', drawing = false;
  [['#cb7a90','Pushti'],['#927caf','Binafsha'],['#78936a','Yashil'],['#e5b94e','Sariq'],['#6d9fc0','Moviy'],['#354035','Qora']].forEach(([value,name],index) => {
    const swatch = document.createElement('button'); swatch.className = 'swatch' + (index === 0 ? ' selected' : ''); swatch.style.background = value; swatch.setAttribute('aria-label',name); swatch.setAttribute('aria-pressed',String(index === 0));
    swatch.onclick = () => {color = value; game.querySelectorAll('.swatch').forEach(item => {item.classList.remove('selected'); item.setAttribute('aria-pressed','false');}); swatch.classList.add('selected'); swatch.setAttribute('aria-pressed','true');};
    game.querySelector('.palette').append(swatch);
  });
  function clear() {ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);}
  function point(event) {const r = canvas.getBoundingClientRect(); return [(event.clientX-r.left)*canvas.width/r.width,(event.clientY-r.top)*canvas.height/r.height];}
  canvas.onpointerdown = event => {drawing = true; canvas.setPointerCapture(event.pointerId); const [x,y] = point(event); ctx.beginPath(); ctx.fillStyle = color; ctx.arc(x,y,5,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.moveTo(x,y);};
  canvas.onpointermove = event => {if (!drawing) return; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.lineTo(...point(event)); ctx.stroke();};
  ['pointerup','pointercancel','lostpointercapture'].forEach(type => canvas.addEventListener(type,() => drawing = false));
  game.querySelector('#clear').onclick = clear;
  game.querySelector('#save').onclick = () => {const link = document.createElement('a'); link.download = 'Rayyonaning-rasmi.png'; link.href = canvas.toDataURL('image/png'); link.click(); if (!canvas.dataset.rewarded) { reward('art', 3); canvas.dataset.rewarded = 'true'; }};
  clear();
}
const dreamInput = document.querySelector('#dream-input'), status = document.querySelector('#dream-status');
try {dreamInput.value = localStorage.getItem('rayyona-dream') || '';} catch {}
document.querySelector('#dream-form').onsubmit = event => {
  event.preventDefault();
  if (!dreamInput.value.trim()) {status.textContent = 'Avval orzungni yoz 🌷'; return;}
  try {localStorage.setItem('rayyona-dream',dreamInput.value.trim()); status.textContent = 'Orzung shu brauzerda saqlandi! Unga qarab qadam tashla ♡';}
  catch {status.textContent = 'Chiroyli orzu! Bu brauzerda uni saqlash imkoni yo‘q.';}
};
