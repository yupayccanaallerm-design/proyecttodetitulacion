const chat = document.getElementById('chat');
const textInput = document.getElementById('textInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const asrStatus = document.getElementById('asrStatus');

/* ==================== UI ==================== */
function addMessage(role, text){
  const row = document.createElement('div');
  row.className = `msg ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  const roleEl = document.createElement('div');
  roleEl.className = 'role';
  roleEl.textContent = role === 'user' ? 'Tú' : 'MotoHelper';

  const side = document.createElement('div');
  side.appendChild(roleEl);

  row.appendChild(side);
  row.appendChild(bubble);
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function showThinking(){
  const id = "thinking-" + Math.random().toString(36).slice(2);
  const row = document.createElement('div');
  row.className = `msg bot`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.dataset.id = id;
  bubble.textContent = "Estoy revisando el manual…";

  const roleEl = document.createElement('div');
  roleEl.className = 'role';
  roleEl.textContent = 'MotoHelper';

  const side = document.createElement('div');
  side.appendChild(roleEl);

  row.appendChild(side);
  row.appendChild(bubble);
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
  return id;
}

function replaceThinking(id, text){
  const bubbles = chat.querySelectorAll('.msg.bot .bubble');
  for (const b of bubbles) {
    if (b.dataset.id === id) { b.textContent = text; break; }
  }
}

/* ==================== TTS (voz) ==================== */
let voices = [];
let chosenVoiceName = null;
const RATE_DEFAULT = 1.1;
const PITCH_DEFAULT = 1.0;
let AUTO_LISTEN = true;

const preferredVoiceNames = [
  "Google español de Estados Unidos",
  "Google US Spanish",
  "es-US",
  "Microsoft Sabina","Microsoft Dalia","Luciana","Paulina"
];

function pickPreferredVoice(list){
  for (const name of preferredVoiceNames){
    const found = list.find(v => (v.name || "").toLowerCase().includes(name.toLowerCase()));
    if(found) return found.name;
  }
  const es = list.find(v => (v.lang || "").toLowerCase().startsWith('es'));
  if (es) return es.name;
  return list[0]?.name || null;
}

function loadVoices(){
  if(!window.speechSynthesis) return;
  voices = window.speechSynthesis.getVoices();
  if (!voices || !voices.length) return;
  chosenVoiceName = pickPreferredVoice(voices);
}

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}

/* Limpia texto para TTS */
function toTTS(text){
  if (!text) return text;
  let t = String(text);

  // corta desde "Fuentes:" o "Referencias:"
  t = t.replace(/(^|\r?\n)\s*(fuentes?|referencias?)\s*:\s*[\s\S]*$/i, "");

  // elimina URLs o referencias numéricas [1]
  t = t.replace(/https?:\/\/\S+/gi, "");
  t = t.replace(/\[\d{1,3}\]/g, "");

  // limpia emojis y símbolos decorativos
  t = t.replace(/[\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}]/gu, "");
  t = t.replace(/[•●·◆◇■□▶▷➤►✓✔✗✘★☆※#*_`~|><^=\\]/g, "");

  // espacios
  t = t.replace(/[ \t]+\n/g, "\n").replace(/\s{2,}/g, " ").trim();

  return t;
}

function speak(text){
  if(!window.speechSynthesis) return;
  if (recognition && recognizing) try { recognition.stop(); } catch {}

  const u = new SpeechSynthesisUtterance(text);
  if (!chosenVoiceName) loadVoices();
  const sel = voices.find(v => v.name === chosenVoiceName);
  if(sel){ u.voice = sel; u.lang = sel.lang || 'es-ES'; } else { u.lang='es-ES'; }
  u.rate = RATE_DEFAULT; u.pitch = PITCH_DEFAULT;

  u.onend = () => {
    if(AUTO_LISTEN && recognition && !recognizing){
      setTimeout(() => { try { recognition.start(); } catch {} }, 300);
    }
  };

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

/* ==================== STT (micrófono) ==================== */
let recognition = null;
let recognizing = false;
let noSpeechRetries = 0;
const MAX_NO_SPEECH_RETRIES = 2;

async function warmUpMic() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation:true, noiseSuppression:true, autoGainControl:true }
  });
  stream.getTracks().forEach(t => t.stop());
  return true;
}

function setupASR(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ asrStatus.textContent = "STT no disponible"; micBtn.disabled=true; return; }
  recognition = new SR();
  recognition.lang='es-ES';
  recognition.interimResults=false;
  recognition.maxAlternatives=1;

  recognition.onstart = ()=>{ recognizing=true; micBtn.classList.add('active'); asrStatus.textContent="Escuchando…"; };
  recognition.onend = ()=>{ recognizing=false; micBtn.classList.remove('active'); if(asrStatus.textContent!=="Procesando…") asrStatus.textContent="Micrófono inactivo"; noSpeechRetries=0; };
  recognition.onerror = (e)=> {
    console.error('ASR error:',e);
    if(e && e.error==='no-speech'){ asrStatus.textContent="No te escuché"; if(noSpeechRetries<MAX_NO_SPEECH_RETRIES){ noSpeechRetries++; setTimeout(()=>{ try{recognition.start();} catch{} },350); } }
    else if(e && e.error==='not-allowed'){ asrStatus.textContent="Permite el micrófono"; }
    else{ asrStatus.textContent="Error de micrófono"; }
    recognizing=false; micBtn.classList.remove('active');
  };
  recognition.onresult = (e)=>{
    let final = "";
    for(let i=e.resultIndex;i<e.results.length;i++){ if(e.results[i].isFinal) final+=e.results[i][0].transcript; }
    if(final){ asrStatus.textContent="Procesando…"; handleUserInput(final); }
  };
}
setupASR();

micBtn.addEventListener('click', async ()=>{
  if(!recognition){ asrStatus.textContent="STT no disponible"; return; }
  if(recognizing){ asrStatus.textContent="Procesando…"; try{ recognition.stop(); } catch{} }
  else{
    if(window.speechSynthesis?.speaking){ asrStatus.textContent="Espera a que termine de hablar…"; return; }
    try{ await warmUpMic(); asrStatus.textContent="Preparando micrófono…"; setTimeout(()=>{ try{ recognition.start(); } catch{ asrStatus.textContent="Permite micrófono"; } },150); } 
    catch{ asrStatus.textContent="Permite micrófono"; }
  }
});

/* ==================== Backend ==================== */
async function askBackend(q){
  try{
    const res = await fetch('/ask',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({user_id:'taller_user', query:q, top_k:3})
    });
    if(!res.ok) throw new Error('HTTP '+res.status);
    return await res.json();
  }catch(err){ console.error('askBackend error:',err); return { answer:"(Error al consultar backend)" }; }
}

/* ==================== Conversación ==================== */
async function handleUserInput(text){
  addMessage('user', text);
  const thinkingId = showThinking();
  const r = await askBackend(text);
  const answer = (r && r.answer)? r.answer : "(sin respuesta)";
  replaceThinking(thinkingId, answer);
  const tts = toTTS(answer);
  speak(tts);
  asrStatus.textContent="Micrófono inactivo";
}

/* ==================== Envío ==================== */
sendBtn.addEventListener('click', ()=>{
  const val = textInput.value.trim();
  if(!val) return;
  textInput.value='';
  handleUserInput(val);
});
textInput.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ sendBtn.click(); } });
