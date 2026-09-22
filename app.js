const words=[['قطة','🐱'],['كلب','🐶'],['شجرة','🌳'],['سيارة','🚗'],['شمس','☀️'],['سمكة','🐟'],['منزل','🏠'],['طائرة','✈️'],['تفاحة','🍎'],['زهرة','🌸'],['فيل','🐘'],['قلعة','🏰'],['قوس قزح','🌈'],['كتاب','📖'],['كرة','⚽'],['فراشة','🦋'],['سفينة','🚢'],['رائد فضاء','👩‍🚀']];
let state={artist:'',duration:60,round:1,chosen:null,options:[],score:0,time:60,timer:null,drawingData:null};
const $=id=>document.getElementById(id);const screens=['setupScreen','cardsScreen','drawScreen','guessScreen','resultScreen'];function show(id){screens.forEach(x=>$(x).classList.toggle('active',x===id));$('roundLabel').textContent=`الجولة ${state.round}`;window.scrollTo({top:0,behavior:'smooth'})}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}function makeCards(){state.options=shuffle(words).slice(0,3);$('cards').innerHTML=state.options.map((w,i)=>`<button class="word-card" data-index="${i}"><span class="word-icon">${w[1]}</span><span>بطاقة ${i+1}</span></button>`).join('');document.querySelectorAll('.word-card').forEach(b=>b.onclick=()=>chooseCard(+b.dataset.index))}
$('startButton').onclick=()=>{state.artist=$('artistName').value.trim()||'الرسّامة';state.duration=+$('duration').value;state.time=state.duration;$('artistGreeting').textContent=`${state.artist}، اختاري بطاقة سرية`;makeCards();show('cardsScreen')};$('newCardsButton').onclick=makeCards;
function chooseCard(i){state.chosen=state.options[i];$('timer').textContent=format(state.duration);show('drawScreen');requestAnimationFrame(()=>{setupCanvas($('drawingCanvas'));startTimer()})}
function format(s){return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function startTimer(){clearInterval(state.timer);state.time=state.duration;state.timer=setInterval(()=>{state.time--; $('timer').textContent=format(state.time);$('timer').classList.toggle('warning',state.time<=10);if(state.time<=0){clearInterval(state.timer);finishDrawing()}},1000)}
const ctxs=new WeakMap();
function setupCanvas(canvas){
  const rect = canvas.getBoundingClientRect();
  const cssWidth = rect.width || 800;
  const cssHeight = rect.height || 420;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.width = '100%';
  canvas.style.height = cssHeight + 'px';
  canvas.style.cursor = 'crosshair';
  canvas.style.touchAction = 'none';

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const stateCanvas = {ctx, down:false, color:'#292d3e', tool:'pen', history:[], lastPoint:null};
  ctxs.set(canvas, stateCanvas);

  const getPoint = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  canvas.onpointerdown = (e) => {
    e.preventDefault();
    canvas.setPointerCapture?.(e.pointerId);
    const q = ctxs.get(canvas);
    q.down = true;
    q.lastPoint = getPoint(e);
    q.history.push(canvas.toDataURL());
    q.ctx.beginPath();
    q.ctx.moveTo(q.lastPoint.x, q.lastPoint.y);
    q.ctx.strokeStyle = q.tool === 'eraser' ? '#fff' : q.color;
    q.ctx.lineWidth = q.tool === 'eraser' ? 28 : 5;
  };

  canvas.onpointermove = (e) => {
    if (!ctxs.get(canvas).down) return;
    const q = ctxs.get(canvas);
    const p = getPoint(e);
    q.ctx.beginPath();
    q.ctx.moveTo(q.lastPoint.x, q.lastPoint.y);
    q.ctx.lineTo(p.x, p.y);
    q.ctx.strokeStyle = q.tool === 'eraser' ? '#fff' : q.color;
    q.ctx.lineWidth = q.tool === 'eraser' ? 28 : 5;
    q.ctx.stroke();
    q.lastPoint = p;
  };

  canvas.onpointerup = canvas.onpointerleave = canvas.onpointercancel = () => {
    const q = ctxs.get(canvas);
    q.down = false;
    q.lastPoint = null;
  };
}

function finishDrawing(){clearInterval(state.timer);state.drawingData=$('drawingCanvas').toDataURL();$('guessArtist').textContent=state.artist;const gc=$('guessCanvas');const img=new Image();img.onload=()=>{gc.width=$('drawingCanvas').width;gc.height=$('drawingCanvas').height;gc.getContext('2d').drawImage(img,0,0,gc.width,gc.height)};img.src=state.drawingData;const opts=shuffle([state.chosen,...shuffle(words.filter(w=>w[0]!==state.chosen[0])).slice(0,3)]);$('guessOptions').innerHTML=opts.map(w=>`<button class="guess-option" data-answer="${w[0]}">${w[1]} ${w[0]}</button>`).join('');document.querySelectorAll('.guess-option').forEach(b=>b.onclick=()=>submitGuess(b.dataset.answer));$('guessMessage').textContent='';show('guessScreen')}
$('finishDrawing').onclick=finishDrawing;document.querySelectorAll('.tool').forEach(b=>b.onclick=()=>{const q=ctxs.get($('drawingCanvas'));if(!q)return;if(b.dataset.tool){q.tool=b.dataset.tool;document.querySelectorAll('.tool[data-tool]').forEach(x=>x.classList.remove('active'));b.classList.add('active')}if(b.id==='clearButton'){const canvas=$('drawingCanvas');const c=ctxs.get(canvas).ctx;c.clearRect(0,0,canvas.width/(window.devicePixelRatio||1),canvas.height/(window.devicePixelRatio||1));c.fillStyle='#fff';c.fillRect(0,0,canvas.width/(window.devicePixelRatio||1),canvas.height/(window.devicePixelRatio||1))}if(b.id==='undoButton'){const src=q.history.pop();if(src){const im=new Image();im.onload=()=>{const canvas=$('drawingCanvas');const c=ctxs.get(canvas).ctx;c.clearRect(0,0,canvas.width/(window.devicePixelRatio||1),canvas.height/(window.devicePixelRatio||1));c.fillStyle='#fff';c.fillRect(0,0,canvas.width/(window.devicePixelRatio||1),canvas.height/(window.devicePixelRatio||1));c.drawImage(im,0,0,canvas.width/(window.devicePixelRatio||1),canvas.height/(window.devicePixelRatio||1));};im.src=src}}});document.querySelectorAll('.color').forEach(b=>b.onclick=()=>{const q=ctxs.get($('drawingCanvas'));if(!q)return;q.color=b.dataset.color;q.tool='pen';document.querySelectorAll('.color').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');document.querySelectorAll('.tool[data-tool]').forEach(x=>x.classList.toggle('active',x.dataset.tool==='pen'))});
function submitGuess(answer){if(answer===state.chosen[0]){state.score++;$('resultTitle').textContent='إجابة صحيحة! 🎉';$('resultText').textContent='حصلتم على نقطة، أحسنتم يا أصدقاء!'}else{$('resultTitle').textContent='محاولة رائعة! 🌟';$('resultText').textContent='لا بأس، استمروا في المحاولة في الجولة القادمة.'}$('answer').textContent=state.chosen[0];show('resultScreen')}$('submitCustom').onclick=()=>{const v=$('customGuess').value.trim();if(v)submitGuess(v)};$('nextRound').onclick=()=>{state.round++;makeCards();show('cardsScreen')};$('restart').onclick=()=>{state={...state,round:1,score:0};show('setupScreen')};
