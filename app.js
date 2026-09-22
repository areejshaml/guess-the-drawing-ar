const words = [
  ['قطة','🐱'],['كلب','🐶'],['شجرة','🌳'],['سيارة','🚗'],['شمس','☀️'],['سمكة','🐟'],['منزل','🏠'],['طائرة','✈️'],['تفاحة','🍎'],['زهرة','🌸'],['فيل','🐘'],['قلعة','🏰'],['قوس المطر','🌈'],['كتاب','📖'],['كرة','⚽'],['فراشة','🦋'],['سفينة','🚢'],['رائد فضاء','👩‍🚀'],['أسد','🦁'],['نمر','🐯'],['أرنب','🐰'],['حصان','🐴'],['زرافة','🦒'],['روبوت','🤖'],['هاتف','📱'],['حاسوب','💻'],['كعكة','🍰'],['بيتزا','🍕'],['موزة','🍌'],['بطيخة','🍉'],['جبل','⛰️'],['بحر','🌊'],['قمر','🌙'],['نجمة','⭐'],['صاروخ','🚀'],['قطار','🚂'],['دراجة','🚲'],['حديقة','🏞️'],['مدرسة','🏫'],['هدية','🎁'],['بالون','🎈'],['تنين','🐉'],['وحيد القرن','🦄'],['حورية بحر','🧜‍♀️'],['دجاجة','🐔'],['سلحفاة','🐢'],['قرد','🐒'],['نحلة','🐝'],['ديناصور','🦖'],['مظلة','☂️'],['حقيبة','🎒'],['قلم','🖊️'],['مقص','✂️'],['نظارة','👓'],['قبعة','🧢'],['كعكة عيد ميلاد','🎂'],['جزرة','🥕'],['وردة','🌹'],['نخلة','🌴'],['سحابة','☁️'],['برق','⚡'],['حافلة','🚌'],['إشارة مرور','🚦'],['مطار','🛫'],['مكتبة','📚'],['مزرعة','🚜'],['مسرح','🎭'],['تاج','👑'],['طائرة ورقية','🪁'],['رجل ثلج','☃️'],['خيمة','⛺'],['مركب شراعي','⛵'],['غواصة','🤿'],['مركبة فضائية','🛸']
];

const texts = {
  gameTitle:'خَمِّن الرسمة', startTitle:'لعبة الرسم والتخمين', startDescription:'اكتبي أسمك، ثم اختاري بطاقة سرية وارْسميها، ودعي الأطفال يخمّنون!', artistLabel:'اسم الرسّامة', artistPlaceholder:'مثال: المعلمة أريج', durationLabel:'مدة الجولة', one:'دقيقة واحدة', half:'دقيقة ونصف', two:'دقيقتان', start:'ابدئي اللعبة', tip:'💡 لعبة مناسبة للعب الجماعي على جهاز واحد. .', choose:'اختاري بطاقة سرية', chooseSub:'لا تدعي الأطفال يرون اختيارك!', other:'🔄 خيارات أخرى', secret:'البطاقة مختارة سرًا 🤫', finish:'انتهيت ✓', pen:'✏️ قلم', fill:'🪣 تعبئة', eraser:'🧽 ممحاة', undo:'↩ تراجع', clear:'مسح الكل', guessTitle:'ما الذي رسمته', guessSub:'انظروا إلى الرسمة وفكّروا جيدًا!', options:'اختاروا التخمين', placeholder:'أو اكتب إجابتك هنا', send:'إرسال', correct:'إجابة صحيحة! 🎉', correctText:'حصلتم على نقطة، أحسنتم يا أصدقاء!', wrong:'محاولة رائعة! 🌟', wrongText:'لا بأس، استمروا في المحاولة في الجولة القادمة.', answer:'الإجابة الصحيحة كانت:', next:'جولة جديدة', restart:'العودة إلى البداية', footer:'صُممت بمحبة للتعلّم والمرح ❤️', card:'بطاقة', round:'الجولة', custom:'اكتبوا الشيء الذي تريدون رسمه', customButton:'اختيار ورسم'
};

let state = { artist:'', duration:60, round:1, chosen:null, options:[], time:60, timer:null, drawingData:null };
const $ = id => document.getElementById(id);
const screens = ['setupScreen','cardsScreen','drawScreen','guessScreen','resultScreen'];
const canvasStates = new WeakMap();
const setText = (id, value) => { $(id).textContent = value; };

function applyTexts() {
  document.title = texts.gameTitle;
  [['gameTitle','gameTitle'],['startTitle','startTitle'],['startDescription','startDescription'],['artistNameLabel','artistLabel'],['durationLabel','durationLabel'],['setupTip','tip'],['chooseCardSub','chooseSub'],['secretCard','secret'],['finishDrawing','finish'],['guessTitle','guessTitle'],['guessSub','guessSub'],['guessOptionsTitle','options'],['submitCustom','send'],['answerLabel','answer'],['nextRound','next'],['restart','restart'],['footer','footer']].forEach(([id,key]) => setText(id,texts[key]));
  $('artistName').placeholder = texts.artistPlaceholder;
  $('customGuess').placeholder = texts.placeholder;
  $('startButton').textContent = texts.start;
  $('newCardsButton').textContent = texts.other;
  $('undoButton').textContent = texts.undo;
  $('clearButton').textContent = texts.clear;
  $('[data-tool="pen"]').textContent = texts.pen;
  $('[data-tool="fill"]').textContent = texts.fill;
  $('[data-tool="eraser"]').textContent = texts.eraser;
  $('duration').innerHTML = `<option value="60">${texts.one}</option><option value="90">${texts.half}</option><option value="120">${texts.two}</option>`;
  setText('roundLabel', `${texts.round} 1`);
}
function show(id) { screens.forEach(x => $(x).classList.toggle('active', x === id)); setText('roundLabel', `${texts.round} ${state.round}`); window.scrollTo({top:0, behavior:'smooth'}); }
function shuffle(list) { return [...list].sort(() => Math.random() - .5); }
function makeCards() {
  state.options = shuffle(words).slice(0,3);
  $('cards').innerHTML = state.options.map((word,i) => `<button class="word-card" data-index="${i}"><span class="word-icon">${word[1]}</span><span>${texts.card} ${i+1}</span></button>`).join('') + `<div class="custom-card"><input id="customWord" maxlength="40" placeholder="${texts.custom}"><button id="customCardButton" class="primary">${texts.customButton}</button></div>`;
  document.querySelectorAll('.word-card').forEach(button => button.onclick = () => startDrawing(state.options[Number(button.dataset.index)]));
  $('customCardButton').onclick = () => { const value = $('customWord').value.trim(); if (value) startDrawing([value,'✏️']); };
}
$('startButton').onclick = () => { state.artist = $('artistName').value.trim() || texts.artistLabel; state.duration = Number($('duration').value); setText('artistGreeting', `${state.artist}، ${texts.choose}`); makeCards(); show('cardsScreen'); };
$('newCardsButton').onclick = makeCards;
function startDrawing(chosen) { state.chosen = chosen; setText('timer', format(state.duration)); show('drawScreen'); requestAnimationFrame(() => { setupCanvas($('drawingCanvas')); startTimer(); }); }
function format(seconds) { return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`; }
function startTimer() { clearInterval(state.timer); state.time = state.duration; state.timer = setInterval(() => { state.time--; setText('timer',format(state.time)); if (state.time <= 0) finishDrawing(); },1000); }
function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect(), width = rect.width || 800, height = rect.height || 420, dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr); canvas.style.touchAction = 'none';
  const ctx = canvas.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,width,height); ctx.lineCap='round'; ctx.lineJoin='round';
  canvasStates.set(canvas,{ctx,down:false,last:null,color:'#292d3e',tool:'pen',history:[],dpr,width,height});
  const point = e => { const r=canvas.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
  canvas.onpointerdown = e => { e.preventDefault(); canvas.setPointerCapture?.(e.pointerId); const s=canvasStates.get(canvas), p=point(e); s.down=true; s.last=p; s.history.push(canvas.toDataURL()); if(s.tool==='fill'){s.ctx.fillStyle=s.color;s.ctx.fillRect(0,0,s.width,s.height);s.down=false;return;} };
  canvas.onpointermove = e => { const s=canvasStates.get(canvas); if(!s.down)return; const p=point(e); s.ctx.beginPath();s.ctx.moveTo(s.last.x,s.last.y);s.ctx.lineTo(p.x,p.y);s.ctx.strokeStyle=s.tool==='eraser'?'#fff':s.color;s.ctx.lineWidth=s.tool==='eraser'?28:5;s.ctx.stroke();s.last=p; };
  canvas.onpointerup = canvas.onpointercancel = canvas.onpointerleave = () => { const s=canvasStates.get(canvas); if(s){s.down=false;s.last=null;} };
}
function finishDrawing() { if (!state.chosen) return; clearInterval(state.timer); state.drawingData=$('drawingCanvas').toDataURL(); setText('guessArtist',state.artist); const preview=$('guessCanvas'), image=new Image(); image.onload=()=>{preview.width=$('drawingCanvas').width;preview.height=$('drawingCanvas').height;preview.getContext('2d').drawImage(image,0,0);}; image.src=state.drawingData; const choices=shuffle([state.chosen,...shuffle(words.filter(w=>w[0]!==state.chosen[0])).slice(0,3)]); $('guessOptions').innerHTML=choices.map(w=>`<button class="guess-option" data-answer="${w[0]}">${w[1]} ${w[0]}</button>`).join(''); document.querySelectorAll('.guess-option').forEach(b=>b.onclick=()=>submitGuess(b.dataset.answer)); show('guessScreen'); }
$('finishDrawing').onclick = finishDrawing;
document.querySelectorAll('.tool').forEach(button => button.onclick = () => { const s=canvasStates.get($('drawingCanvas')); if(!s)return; if(button.dataset.tool){s.tool=button.dataset.tool;document.querySelectorAll('.tool[data-tool]').forEach(x=>x.classList.remove('active'));button.classList.add('active');} if(button.id==='clearButton'){s.ctx.setTransform(1,0,0,1,0,0);s.ctx.clearRect(0,0,$('drawingCanvas').width,$('drawingCanvas').height);s.ctx.fillStyle='#fff';s.ctx.fillRect(0,0,$('drawingCanvas').width,$('drawingCanvas').height);s.ctx.setTransform(s.dpr,0,0,s.dpr,0,0);} if(button.id==='undoButton'){const src=s.history.pop();if(src){const image=new Image();image.onload=()=>{s.ctx.setTransform(1,0,0,1,0,0);s.ctx.clearRect(0,0,$('drawingCanvas').width,$('drawingCanvas').height);s.ctx.drawImage(image,0,0,$('drawingCanvas').width,$('drawingCanvas').height);s.ctx.setTransform(s.dpr,0,0,s.dpr,0,0);};image.src=src;}} });
document.querySelectorAll('.color').forEach(button => button.onclick = () => setColor(button.dataset.color)); $('colorWheel').oninput = e => setColor(e.target.value); function setColor(value){const s=canvasStates.get($('drawingCanvas'));if(s){s.color=value;s.tool='pen';document.querySelectorAll('.tool[data-tool]').forEach(x=>x.classList.toggle('active',x.dataset.tool==='pen'));}}
function submitGuess(answer){const correct=answer.trim()===state.chosen[0].trim();setText('resultTitle',correct?texts.correct:texts.wrong);setText('resultText',correct?texts.correctText:texts.wrongText);setText('answer',state.chosen[0]);show('resultScreen');}
$('submitCustom').onclick=()=>{const value=$('customGuess').value.trim();if(value)submitGuess(value);}; $('nextRound').onclick=()=>{state.round++;makeCards();show('cardsScreen');}; $('restart').onclick=()=>{state.round=1;show('setupScreen');};
applyTexts();
