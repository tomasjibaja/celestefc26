/* ================================================================
   ZONA DE CONFIGURACIÓN — modificá acá lo esencial
   ================================================================ */

// Letra: { time: segundos, text: frase }
const lyrics = [
  { time: 5,   text: "Clareando entra el sol" },
  { time: 8,   text: "por un vidrio cuadrado" },
  { time: 13,  text: "más allá el barrio" },
  { time: 16,  text: "se despierta" },
  { time: 21,  text: "con suerte tenga diez minutos" },
  { time: 26,  text: "para verte dormir" },
  { time: 31,  text: "o no" },
  { time: 36,  text: "así le pido a esta mañana" },
  { time: 39,  text: "que mañana también digas sí" },
  { time: 44,  text: "tengo un tacho lleno de momentos" },
  { time: 52,  text: "medio tambaleando te vestís" },
  { time: 57,  text: "y te vas" },
  { time: 59,  text: "se estruja mi corazón" },
  { time: 62,  text: "cuando cruzás la puerta" },
  { time: 69,  text: "será que es tan natural" },
  { time: 71,  text: "tu forma de amar" },
  { time: 73,  text: "tu mano en mi pelo" },
  { time: 75,  text: "tu marca en mi piel" },
  { time: 77,  text: "tu aroma" },
  { time: 79,  text: "mejor paro acá" },
  { time: 83,  text: "mejor le pido a esta mañana" },
  { time: 86,  text: "que mañana también digas sí" },
  { time: 91,  text: "tengo un container lleno de" },
  { time: 95,  text: "momentos por vivir" },
  { time: 99,  text: "y así le pido a esta mañana" },
  { time: 102, text: "que esta noche" },
  { time: 104, text: "vuelva a estar así" },
  { time: 107, text: "para regalarte otro momento" }
];

const CONFIG = {
  fallbackDuration: 126,   // usado antes de que cargue metadata del audio
  shipLyricTime: 92,       // segundo en el que aparece el container marítimo
  shipWindow: [82, 119],   // ventana en la que el barco cruza la escena
  birdsRange: [0.22, 0.85],// rango de progreso en el que se ven los pájaros
  lyricTransitionMs: 230,  // duración del crossfade entre frases
  starCount: 46
};

// Paisaje del cielo a lo largo de la canción (progreso 0 → 1)
const SKY_KEYFRAMES = [
  { p: 0.00, top: '#12152c', mid: '#2c3358', bottom: '#5a4a6a', bright: 0.16 },
  { p: 0.18, top: '#273463', mid: '#6a5a8c', bottom: '#f0a06a', bright: 0.42 },
  { p: 0.40, top: '#3f7bc4', mid: '#86c0e4', bottom: '#ffe6b8', bright: 0.85 },
  { p: 0.62, top: '#4a95d6', mid: '#aad7ec', bottom: '#fff6dd', bright: 1.00 },
  { p: 0.82, top: '#3a5690', mid: '#c97b57', bottom: '#ffcf8a', bright: 0.55 },
  { p: 1.00, top: '#0a0c1c', mid: '#151935', bottom: '#2a2350', bright: 0.06 }
];

/* ================================================================
   UTILIDADES
   ================================================================ */
function hexToRgb(hex){
  const h = hex.replace('#','');
  return {
    r: parseInt(h.substring(0,2),16),
    g: parseInt(h.substring(2,4),16),
    b: parseInt(h.substring(4,6),16)
  };
}
function rgbToHex(r,g,b){
  const c = v => Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0');
  return `#${c(r)}${c(g)}${c(b)}`;
}
function lerp(a,b,t){ return a + (b-a)*t; }
function lerpColor(hexA, hexB, t){
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  return rgbToHex(lerp(a.r,b.r,t), lerp(a.g,b.g,t), lerp(a.b,b.b,t));
}
function mixWithBlack(hex, amount){
  const c = hexToRgb(hex);
  return rgbToHex(c.r*(1-amount), c.g*(1-amount), c.b*(1-amount));
}
function formatTime(s){
  if(!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s/60);
  const sec = Math.floor(s%60);
  return `${m}:${sec.toString().padStart(2,'0')}`;
}
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
function smoothstep(edge0, edge1, x){
  const t = clamp((x-edge0)/(edge1-edge0), 0, 1);
  return t*t*(3-2*t);
}

/* ================================================================
   REFERENCIAS DOM
   ================================================================ */
const stage = document.getElementById('stage');
const audio = document.getElementById('audio');

const playBtn = document.getElementById('playBtn');
const iconPlay = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');
const loopBtn = document.getElementById('loopBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressHandle = document.getElementById('progressHandle');
const timeCurrent = document.getElementById('timeCurrent');
const timeTotal = document.getElementById('timeTotal');

const lyricsWrap = document.querySelector('.lyrics-wrap');
const lyricEl = document.getElementById('lyricLine');

const skyStop1 = document.getElementById('skyStop1');
const skyStop2 = document.getElementById('skyStop2');
const skyStop3 = document.getElementById('skyStop3');
const seaStop1 = document.getElementById('seaStop1');
const seaStop2 = document.getElementById('seaStop2');
const sun = document.getElementById('sun');
const sunGlowCircle = document.getElementById('sunGlowCircle');
const hills = document.querySelector('.hills');
const birds = document.getElementById('birds');
const starsGroup = document.getElementById('stars');
const ship = document.getElementById('ship');
const particlesWrap = document.getElementById('particles');

const finalScreen = document.getElementById('finalScreen');
const ratingRow = document.getElementById('ratingRow');
const finalThanks = document.getElementById('finalThanks');
const replayBtn = document.getElementById('replayBtn');

/* ================================================================
   INICIALIZACIÓN DE ELEMENTOS DECORATIVOS (una sola vez)
   ================================================================ */
(function createStars(){
  const frag = document.createDocumentFragment();
  for(let i=0;i<CONFIG.starCount;i++){
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx', Math.random()*1000);
    c.setAttribute('cy', Math.random()*360);
    c.setAttribute('r', (Math.random()*1.3+0.3).toFixed(2));
    c.setAttribute('opacity', (Math.random()*0.6+0.4).toFixed(2));
    frag.appendChild(c);
  }
  starsGroup.appendChild(frag);
})();

(function createParticles(){
  const frag = document.createDocumentFragment();
  for(let i=0;i<18;i++){
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = `${Math.random()*100}%`;
    p.style.bottom = `-10px`;
    p.style.animationDuration = `${14 + Math.random()*14}s`;
    p.style.animationDelay = `${Math.random()*18}s`;
    frag.appendChild(p);
  }
  particlesWrap.appendChild(frag);
})();

/* ================================================================
   AUDIO — carga, duración, play/pause, loop
   ================================================================ */
function getDuration(){
  return (isFinite(audio.duration) && audio.duration > 0) ? audio.duration : CONFIG.fallbackDuration;
}

timeTotal.textContent = formatTime(CONFIG.fallbackDuration);

audio.addEventListener('loadedmetadata', () => {
  timeTotal.textContent = formatTime(getDuration());
  render(audio.currentTime);
});

function playAudio(){
  const p = audio.play();
  if(p && p.catch) p.catch(()=>{ /* reproducción bloqueada hasta interacción del usuario */ });
}

playBtn.addEventListener('click', () => {
  maybeDismissFinal();
  if(audio.paused) playAudio();
  else audio.pause();
});

audio.addEventListener('play', () => {
  stage.classList.add('playing');
  iconPlay.style.display = 'none';
  iconPause.style.display = '';
  playBtn.setAttribute('aria-label','Pausar');
  startFrameLoop();
});

audio.addEventListener('pause', () => {
  stage.classList.remove('playing');
  iconPlay.style.display = '';
  iconPause.style.display = 'none';
  playBtn.setAttribute('aria-label','Reproducir');
  stopFrameLoop();
  render(audio.currentTime);
});

loopBtn.addEventListener('click', () => {
  maybeDismissFinal();
  audio.loop = !audio.loop;
  loopBtn.classList.toggle('active', audio.loop);
  loopBtn.setAttribute('aria-pressed', audio.loop ? 'true' : 'false');
});

audio.addEventListener('ended', () => {
  stage.classList.remove('playing');
  iconPlay.style.display = '';
  iconPause.style.display = 'none';
  if(!audio.loop){
    showFinalScreen();
  }
});

/* ================================================================
   BARRA DE PROGRESO — click y arrastre
   ================================================================ */
let isSeeking = false;

function fractionFromEvent(evt){
  const rect = progressBar.getBoundingClientRect();
  const x = (evt.touches ? evt.touches[0].clientX : evt.clientX) - rect.left;
  return clamp(x / rect.width, 0, 1);
}

function seekToFraction(frac){
  const dur = getDuration();
  audio.currentTime = frac * dur;
  render(audio.currentTime);
}

progressBar.addEventListener('pointerdown', (e) => {
  maybeDismissFinal();
  isSeeking = true;
  progressBar.setPointerCapture(e.pointerId);
  seekToFraction(fractionFromEvent(e));
});
progressBar.addEventListener('pointermove', (e) => {
  if(!isSeeking) return;
  seekToFraction(fractionFromEvent(e));
});
progressBar.addEventListener('pointerup', (e) => {
  isSeeking = false;
  try{ progressBar.releasePointerCapture(e.pointerId); }catch(err){}
});
progressBar.addEventListener('pointercancel', () => { isSeeking = false; });

audio.addEventListener('seeking', () => render(audio.currentTime));
audio.addEventListener('seeked', () => render(audio.currentTime));

/* ================================================================
   BUCLE DE SINCRONIZACIÓN — currentTime del audio como fuente de verdad
   ================================================================ */
let rafId = null;

function startFrameLoop(){
  if(rafId) return;
  const step = () => {
    render(audio.currentTime);
    if(!audio.paused){
      rafId = requestAnimationFrame(step);
    } else {
      rafId = null;
    }
  };
  rafId = requestAnimationFrame(step);
}
function stopFrameLoop(){
  if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
}

// también seguimos timeupdate como respaldo (p.ej. reproducción en segundo plano)
audio.addEventListener('timeupdate', () => {
  if(!isSeeking) render(audio.currentTime);
});

function render(t){
  const dur = getDuration();
  const progress = clamp(t / dur, 0, 1);
  updateProgressUI(t, dur, progress);
  updateBackground(progress, t);
  updateLyrics(t);
}

/* ================================================================
   UI DE PROGRESO
   ================================================================ */
function updateProgressUI(t, dur, progress){
  progressFill.style.width = `${progress*100}%`;
  progressHandle.style.left = `${progress*100}%`;
  timeCurrent.textContent = formatTime(t);
  timeTotal.textContent = formatTime(dur);
}

/* ================================================================
   FONDO — evoluciona según currentTime / duration
   ================================================================ */
function skyKeyframeAt(progress){
  const kf = SKY_KEYFRAMES;
  let lo = kf[0], hi = kf[kf.length-1];
  for(let i=0;i<kf.length-1;i++){
    if(progress >= kf[i].p && progress <= kf[i+1].p){
      lo = kf[i]; hi = kf[i+1]; break;
    }
  }
  const span = (hi.p - lo.p) || 1;
  const localT = clamp((progress - lo.p)/span, 0, 1);
  return {
    top: lerpColor(lo.top, hi.top, localT),
    mid: lerpColor(lo.mid, hi.mid, localT),
    bottom: lerpColor(lo.bottom, hi.bottom, localT),
    bright: lerp(lo.bright, hi.bright, localT)
  };
}

function updateBackground(progress, t){
  const sky = skyKeyframeAt(progress);

  skyStop1.setAttribute('stop-color', sky.top);
  skyStop2.setAttribute('stop-color', sky.mid);
  skyStop3.setAttribute('stop-color', sky.bottom);

  seaStop1.setAttribute('stop-color', mixWithBlack(sky.mid, 0.35));
  seaStop2.setAttribute('stop-color', mixWithBlack(sky.top, 0.55));

  hills.setAttribute('fill', mixWithBlack(sky.mid, 0.72));

  // sol: recorre un arco de amanecer a atardecer/noche (rango acotado para que
  // se mantenga visible incluso en pantallas muy angostas con preserveAspectRatio "slice")
  const sunX = 260 + progress*480;
  const sunY = 500 - Math.sin(progress*Math.PI) * 430;
  sun.setAttribute('cx', sunX);
  sun.setAttribute('cy', sunY);
  sunGlowCircle.setAttribute('cx', sunX);
  sunGlowCircle.setAttribute('cy', sunY);
  sun.style.opacity = 0.35 + sky.bright*0.65;
  sunGlowCircle.style.opacity = 0.25 + sky.bright*0.6;

  // estrellas: visibles cuando el cielo está oscuro (inicio tenue / final noche)
  const darkness = clamp(1 - (sky.bright - 0.25)/0.6, 0, 1);
  starsGroup.style.opacity = darkness;

  // pájaros: una pequeña bandada con profundidad (distinta escala/altura por ave)
  const showBirds = progress > CONFIG.birdsRange[0] && progress < CONFIG.birdsRange[1];
  birds.classList.toggle('visible', showBirds);
  if(showBirds){
    const bx = (progress - CONFIG.birdsRange[0]) / (CONFIG.birdsRange[1]-CONFIG.birdsRange[0]);
    const flock = [
      { lead: 0,   dx: 0,   dy: 0,   scale: 1.0  },
      { lead: -14, dx: -34, dy: 16,  scale: 0.8  },
      { lead: -26, dx: 30,  dy: 30,  scale: 0.65 },
      { lead: -40, dx: -8,  dy: 46,  scale: 0.55 }
    ];
    birds.querySelectorAll('.bird').forEach((b, i) => {
      const f = flock[i] || flock[flock.length-1];
      const x = 100 + bx*760 + f.dx + f.lead;
      const y = 130 + f.dy - bx*36 + Math.sin(t*1.6 + i) * 3;
      b.setAttribute('transform', `translate(${x}, ${y}) scale(${f.scale})`);
    });
  }

  // barco / container marítimo (aparece cerca del segundo 92), con leve balanceo sobre el agua
  const [ws, we] = CONFIG.shipWindow;
  if(t >= ws && t <= we){
    const local = (t - ws) / (we - ws);
    const x = -170 + local*1320;
    const bob = Math.sin(t*1.3) * 1.6;
    ship.setAttribute('transform', `translate(${x},${452+bob}) scale(0.82)`);
    ship.style.opacity = smoothstep(ws, ws+4, t) * (1 - smoothstep(we-4, we, t));
  } else {
    ship.style.opacity = 0;
  }
}

/* ================================================================
   LETRA SINCRONIZADA
   ================================================================ */
function getActiveLyricIndex(t){
  let idx = -1;
  for(let i=0;i<lyrics.length;i++){
    if(t >= lyrics[i].time - 0.02) idx = i;
    else break;
  }
  return idx;
}

let currentLyricIndex = -2; // valor imposible para forzar primer render
let lyricSwapToken = 0;

function updateLyrics(t){
  const idx = getActiveLyricIndex(t);
  if(idx === currentLyricIndex) return;
  currentLyricIndex = idx;

  const token = ++lyricSwapToken;
  lyricEl.classList.remove('visible');
  lyricsWrap.classList.remove('ink-on');

  window.setTimeout(() => {
    if(token !== lyricSwapToken) return; // llegó una frase más nueva, descartamos ésta
    lyricEl.textContent = idx >= 0 ? lyrics[idx].text : '';
    void lyricEl.offsetWidth; // fuerza reflow para reiniciar la transición
    if(idx >= 0){
      lyricEl.classList.add('visible');
      lyricsWrap.classList.add('ink-on');
    }
  }, CONFIG.lyricTransitionMs);
}

/* ================================================================
   PANTALLA FINAL
   ================================================================ */
let hasVoted = false;

function showFinalScreen(){
  finalScreen.classList.add('visible');
}
function hideFinalScreen(){
  finalScreen.classList.remove('visible');
  resetRatingUI();
}
function maybeDismissFinal(){
  if(finalScreen.classList.contains('visible') && hasVoted){
    hideFinalScreen();
  }
}
function resetRatingUI(){
  hasVoted = false;
  finalThanks.classList.remove('visible');
  ratingRow.querySelectorAll('.rate-btn').forEach(b => {
    b.classList.remove('selected','dimmed');
  });
}

ratingRow.querySelectorAll('.rate-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    hasVoted = true;
    ratingRow.querySelectorAll('.rate-btn').forEach(b => {
      const isSelected = b === btn;
      b.classList.toggle('selected', isSelected);
      b.classList.toggle('dimmed', !isSelected);
    });
    finalThanks.classList.add('visible');
  });
});

replayBtn.addEventListener('click', () => {
  hideFinalScreen();
  audio.currentTime = 0;
  render(0);
  playAudio();
});

/* ================================================================
   ESTADO INICIAL
   ================================================================ */
render(0);
