const progressKey = 'rayyona-progress-v1';
const emptyProgress = () => ({stars:0, math:0, language:0, english:0, stories:0, memory:0, art:0, daily:{}});
let progress = emptyProgress();
let storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(progressKey) || 'null');
  if (saved && typeof saved === 'object') {
    for (const key of ['stars','math','language','english','stories','memory','art']) {
      if (Number.isSafeInteger(saved[key]) && saved[key] >= 0) progress[key] = saved[key];
    }
    if (saved.daily && typeof saved.daily === 'object' && !Array.isArray(saved.daily)) progress.daily = saved.daily;
  }
} catch { storageAvailable = false; }
function localDay() { const now = new Date(); return `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`; }
function persistProgress() {
  try { localStorage.setItem(progressKey, JSON.stringify(progress)); }
  catch { storageAvailable = false; }
  renderProgress();
}
function reward(category, stars = 1) { progress[category]++; progress.stars += stars; persistProgress(); }
const extraCards = [
  ['language','memory','Aa','ONA TILI','So‘zlar bog‘i','Tushib qolgan harfni top va harflardan so‘z tuz.','So‘zlar bilan o‘ynash'],
  ['english','art','ABC','INGLIZ TILI','Hello, Rayyona!','Ranglar, hayvonlar va sonlarni rasmlar bilan o‘rgan.','Let’s play!'],
  ['stories','math','☷','KITOB','Ertak burchagi','Kichik ertaklarni o‘qi va qiziqarli savollarga javob ber.','Ertakni ochish']
];
extraCards.forEach(([type,theme,icon,tag,title,description,action]) => {
  const card = document.createElement('button'); card.className = `card ${theme}`; card.dataset.game = type;
  card.innerHTML = `<span class="card-top"><i>${icon}</i><b>${tag}</b></span><h3>${title}</h3><p>${description}</p><span class="card-bottom">${action} <strong>↗</strong></span>`;
  document.querySelector('.cards').append(card);
});
const dashboard = document.createElement('section'); dashboard.className = 'wrap dashboard';
 dashboard.innerHTML = `<div class="section-title"><div><div class="eyebrow">HAR BIR URINISH — BIR YUTUQ</div><h2>Mening kichik g‘alabalarim 🏆</h2></div><div class="star-total" aria-live="polite"></div></div><p class="storage-note"></p><div class="medals"></div><div class="daily-tasks"><h3>Bugungi kichik qadamlar ☀</h3><p>Har kuni yangi boshlanish. Bajarilgan ishni belgilab qo‘y!</p><div class="task-list"></div><p class="task-summary" role="status"></p></div>`;
document.querySelector('#dream').before(dashboard);
const tasks = ['15 daqiqa kitob o‘qidim','Uy vazifamni bajardim','Matematikani mashq qildim','Yaqinlarimga yordam berdim'];
function renderProgress() {
  dashboard.querySelector('.star-total').textContent = `${progress.stars} ⭐`;
  dashboard.querySelector('.storage-note').textContent = storageAvailable ? 'Yutuqlaring shu brauzerda saqlanadi.' : 'Hozircha yutuqlar faqat shu ochiq sahifada saqlanadi.';
  const medals = [['🌱','Birinchi qadam',progress.stars >= 1],['🧮','Hisobdon',progress.math >= 10],['🌷','So‘z ustasi',progress.language >= 5],['🌍','English star',progress.english >= 5],['📚','Kitobxon',progress.stories >= 1],['🦋','Diqqatli',progress.memory >= 1],['🎨','Rassom',progress.art >= 1],['🌟','50 yulduz',progress.stars >= 50]];
  dashboard.querySelector('.medals').innerHTML = medals.map(([icon,name,earned]) => `<div class="medal ${earned ? 'earned' : ''}"><span>${icon}</span><b>${name}</b><small>${earned ? 'Qo‘lga kiritildi ✓' : 'Hali oldinda'}</small></div>`).join('');
  const today = localDay(), done = Array.isArray(progress.daily[today]) ? progress.daily[today] : [];
  const list = dashboard.querySelector('.task-list'); list.replaceChildren();
  tasks.forEach((task,index) => {
    const row = document.createElement('label'); row.className = 'task';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = done.includes(index);
    input.onchange = () => {
      const day = localDay(); const selected = new Set(Array.isArray(progress.daily[day]) ? progress.daily[day] : []);
      if (input.checked) selected.add(index); else selected.delete(index);
      progress.daily = {[day]: [...selected]}; persistProgress();
    };
    const text = document.createElement('span'); text.textContent = task; row.append(input,text); list.append(row);
  });
  dashboard.querySelector('.task-summary').textContent = done.length === tasks.length ? 'Bugungi barcha vazifalar bajarildi! Barakalla! 🎉' : `${done.length} / ${tasks.length} vazifa bajarildi`;
}
renderProgress();
window.addEventListener('focus', renderProgress);
// Shared quiz: each question can award stars only once per round.
function quiz({title, questions, category, finish}) {
  let index = 0, correct = 0;
  function show() {
    if (index === questions.length) {
      game.innerHTML = `<h2>Ajoyib mehnat! 🎉</h2><p>${correct} ta savolni bajarding va ${correct} ta yulduz yig‘ding.</p><button class="again">Yana o‘ynash ↻</button>`;
      game.querySelector('.again').onclick = finish; return;
    }
    const q = questions[index];
    game.innerHTML = `<h2>${title}</h2><p>${index+1} / ${questions.length} savol</p><div class="quiz-prompt"></div><div class="answers"></div><p class="feedback" role="status"></p>`;
    game.querySelector('.quiz-prompt').textContent = q.prompt;
    let solved = false;
    shuffle(q.options).forEach(option => {
      const button = document.createElement('button'); button.textContent = option;
      button.onclick = () => {
        if (solved) return;
        if (option !== q.answer) { button.disabled = true; game.querySelector('.feedback').textContent = 'Yana bir o‘ylab ko‘r. Uddalaysan! 💛'; return; }
        solved = true; correct++; reward(category);
        game.querySelectorAll('.answers button').forEach(item => item.disabled = true);
        game.querySelector('.feedback').textContent = 'To‘g‘ri! +1 ⭐';
        const next = document.createElement('button'); next.className = 'again'; next.textContent = index === questions.length-1 ? 'Natijamni ko‘rish →' : 'Keyingi savol →';
        next.onclick = () => { index++; show(); }; game.append(next);
      };
      game.querySelector('.answers').append(button);
    });
  }
  show();
}
function menu(title,description,items) {
  game.innerHTML = `<h2>${title}</h2><p>${description}</p><div class="lesson-menu"></div>`;
  items.forEach(([label,action]) => { const button = document.createElement('button'); button.textContent = label; button.onclick = action; game.querySelector('.lesson-menu').append(button); });
}
function learningMath() {
  const levels = ['1-bosqich · Qo‘shish va ayirish','2-bosqich · Ko‘paytirish va bo‘lish','3-bosqich · Kichik masalalar'];
  menu('Sonlar sarguzashti 🧮','Bosqichni tanla. Har safar 5 ta savol!',levels.map((label,level) => [label,() => {
    const questions = Array.from({length:5},() => {
      const a = 2+Math.floor(Math.random()*8), b = 2+Math.floor(Math.random()*8);
      let answer, prompt;
      if (level === 0) {
        const x = a*10+b, y = 10+Math.floor(Math.random()*30), add = Math.random()>.5;
        answer = add ? x+y : Math.max(x,y)-Math.min(x,y); prompt = add ? `${x} + ${y} = ?` : `${Math.max(x,y)} − ${Math.min(x,y)} = ?`;
      } else if (level === 1) {
        const multiply = Math.random()>.5; answer = multiply ? a*b : a; prompt = multiply ? `${a} × ${b} = ?` : `${a*b} ÷ ${b} = ?`;
      } else {
        answer = a*b; prompt = `Rayyonada ${a} ta quti bor. Har bir qutida ${b} tadan qalam. Jami nechta qalam bor?`;
      }
      const options = new Set([answer]); while(options.size<4) options.add(Math.max(0,answer+Math.floor(Math.random()*21)-10));
      return {prompt,answer,options:[...options]};
    });
    quiz({title:label,questions,category:'math',finish:learningMath});
  } ]));
}
function languageGame() {
  const missing = [ ['k_tob','i',['i','a','o','u']], ['m_ktab','a',['a','i','o','e']], ['b_hor','a',['a','o','u','i']], ['q_lam','a',['a','i','e','u']], ['quy_sh','o',['o','a','i','e']], ['g_l','u',['u','a','i','o']] ];
  const words = [['B · O · K · I · T','KITOB',['KITOB','MAKTAB','QALAM','BAHOR']],['A · M · Q · L · A','QALAM',['QALAM','OLMA','GUL','KITOB']],['M · A · O · L','OLMA',['OLMA','ANOR','GUL','BOLA']],['R · O · A · N','ANOR',['ANOR','OLMA','QALAM','BAHOR']],['A · O · B · L','BOLA',['BOLA','OLMA','GUL','KITOB']]];
  menu('So‘zlar bog‘i 🌷','Harflarni topamiz, so‘zlar tuzamiz.',[
    ['Tushib qolgan harfni top',() => quiz({title:'Qaysi harf yetishmayapti?',questions:shuffle(missing).slice(0,5).map(([word,answer,options])=>({prompt:word,answer,options})),category:'language',finish:languageGame})],
    ['Harflardan so‘z tuz',() => quiz({title:'Bu harflardan qaysi so‘z tuziladi?',questions:shuffle(words).map(([prompt,answer,options])=>({prompt,answer,options})),category:'language',finish:languageGame})]
  ]);
}
function englishGame() {
  const groups = [
    ['🎨 Ranglar',[['🔴 Qizil','Red'],['🔵 Ko‘k','Blue'],['🟢 Yashil','Green'],['🟡 Sariq','Yellow'],['⚪ Oq','White']]],
    ['🐱 Hayvonlar',[['🐱 Mushuk','Cat'],['🐶 It','Dog'],['🐰 Quyon','Rabbit'],['🐦 Qush','Bird'],['🐟 Baliq','Fish']]],
    ['🔢 Sonlar',[['🍎','One'],['🍎 🍎','Two'],['🍎 🍎 🍎','Three'],['🍎 🍎 🍎 🍎','Four'],['🍎 🍎 🍎 🍎 🍎','Five']]]
  ];
  menu('Hello, Rayyona! 🌍','Mavzuni tanla. Rasmga mos inglizcha so‘zni top.',groups.map(([title,words])=>[title,()=>quiz({title,category:'english',finish:englishGame,questions:shuffle(words).map(([prompt,answer])=>({prompt,answer,options:[answer,...shuffle(words.map(item=>item[1]).filter(word=>word!==answer)).slice(0,3)]}))})]));
}
const stories = [
  {title:'Mitti urug‘ning orzusi',text:['Bir kuni Rayyona deraza yonidagi tuvakka mitti urug‘ ekdi. U har kuni tuproqni tekshirib, kerak bo‘lganda suv quydi.','Urug‘ avval ko‘rinmadi. Rayyona sabr bilan kutdi. Bir tong tuproq orasidan yashil nihol bosh ko‘tardi.','Rayyona niholni yorug‘ joyga qo‘ydi. Vaqt o‘tib, unda sariq gul ochildi. Qizaloq kichik g‘amxo‘rlik ham katta go‘zallik yaratishini tushundi.'],questions:[{prompt:'Rayyona urug‘ni qayerga ekdi?',answer:'Tuvakka',options:['Tuvakka','Qutiga','Ko‘chaga']},{prompt:'Gul qanday rangda ochildi?',answer:'Sariq',options:['Sariq','Ko‘k','Oq']},{prompt:'Bu ertak nimani o‘rgatadi?',answer:'Sabr va g‘amxo‘rlikni',options:['Sabr va g‘amxo‘rlikni','Shoshilishni','Taslim bo‘lishni']}]},
  {title:'Bulutning sovg‘asi',text:['Kichkina bulut dalalar ustida suzib yurardi. Pastda bir bog‘ chanqoq edi: gullar boshini egib, yomg‘irni kutardi.','Bulut do‘stlarini chaqirdi. Ular birlashib, bog‘ ustiga mayin yomg‘ir yog‘dirdi. Daraxtlar va gullar yana yashnab ketdi.','Quyosh chiqqach, osmonda kamalak paydo bo‘ldi. Kichkina bulut quvondi: birgalikda qilingan yaxshilik hammani xursand qilgan edi.'],questions:[{prompt:'Bog‘ nimani kutayotgan edi?',answer:'Yomg‘irni',options:['Yomg‘irni','Qorni','Shamolni']},{prompt:'Bulut kimlarni yordamga chaqirdi?',answer:'Do‘stlarini',options:['Do‘stlarini','Qushlarni','Bolalarni']},{prompt:'Osmonda nima paydo bo‘ldi?',answer:'Kamalak',options:['Kamalak','Oy','Yulduzlar']}]}
];
function storyGame() {
  menu('Ertak burchagi 📚','Qulay joylashib ol. Bugun qaysi ertakni o‘qiymiz?',stories.map(story=>[story.title,()=>{
    game.innerHTML = '<h2></h2><article class="story-text"></article><button class="again">Savollarga javob berish →</button>';
    game.querySelector('h2').textContent = story.title;
    story.text.forEach(text=>{const p=document.createElement('p');p.textContent=text;game.querySelector('article').append(p);});
    game.querySelector('.again').onclick=()=>quiz({title:story.title,questions:story.questions,category:'stories',finish:storyGame});
  }]));
}
