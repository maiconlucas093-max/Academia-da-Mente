/* ACADEMIA DA MENTE — versão inicial local.
   Para cadastrar aulas, edite LESSONS e informe o caminho de um MP3 real. */
const DEPARTMENTS = [
 {id:"garnier-malet",name:"Jean-Pierre Garnier-Malet",symbol:"◈",description:"Teorias e hipóteses sobre tempo e antecipação."},
 {id:"tom-campbell",name:"Tom Campbell",symbol:"◎",description:"Consciência, experiência e modelos de realidade."},
 {id:"my-big-toe",name:"My Big TOE",symbol:"◇",description:"Fundamentos, conceitos e análise crítica da teoria."},
 {id:"jung",name:"Carl Gustav Jung",symbol:"☯",description:"Inconsciente, arquétipos, símbolos e individuação."},
 {id:"neurociencia",name:"Neurociência",symbol:"⌬",description:"Cérebro, memória, atenção e aprendizagem."},
 {id:"criatividade",name:"Inteligência, criatividade e linguagem",symbol:"✧",description:"Raciocínio, vocabulário, imaginação e comunicação."},
 {id:"economia",name:"Economia e bolsa de valores",symbol:"◫",description:"Mercados, investimentos e educação financeira."},
 {id:"filosofia",name:"Filosofia e ciência",symbol:"⌘",description:"Conhecimento, pensamento crítico e investigação."}
];
// Adicione objetos neste formato. Não há aulas ou áudios fictícios cadastrados.


const LESSONS = [
  {
    id: "garnier-malet-aula-01-parte-01",
    title: "O desdobramento do tempo — Parte 1",
    department: "garnier-malet",
    module: "Aula 01 • Parte 1",
    audio: "aula-01-parte-01.mp3",
    durationLabel: "MP3",
    transcript: ""
  },
  {
    id: "garnier-malet-aula-01-parte-02",
    title: "O desdobramento do tempo — Parte 2",
    department: "garnier-malet",
    module: "Aula 01 • Parte 2",
    audio: "aula-01-parte-02.mp3",
    durationLabel: "MP3",
    transcript: ""
  }
];


const STORAGE_KEY = "academiaMente.v1";
const emptyState = {favorites:[],completed:[],progress:{},notes:[],playlists:[],history:[],totalListenedSeconds:0,lastLesson:null,recalls:[]};
let state = loadState(), currentLesson = null, sessionStartedAt = null, sessionInterval = null, attentionInterval = null, attentionRemaining = 120;
const $ = id => document.getElementById(id);
const audio = $("audioElement");
function loadState(){try{return {...emptyState,...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}}catch(e){return {...emptyState}}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));renderDashboard()}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2500)}
function fmt(seconds){if(!Number.isFinite(seconds)||seconds<0)return "0:00";const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=Math.floor(seconds%60);return h?`${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${m}:${String(s).padStart(2,"0")}`}
function dept(id){return DEPARTMENTS.find(d=>d.id===id)?.name||"Departamento"}
function showView(name){document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));$("view-"+name)?.classList.add("active");document.querySelectorAll(".nav-item[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===name));$("crumb").textContent=({dashboard:"Visão geral",audio:"Central de áudios",walking:"Modo caminhada",departments:"Departamentos",memory:"Memória e atenção",notebook:"Caderno de estudos",playlists:"Minhas playlists",settings:"Configurações"})[name]||name;$("sidebar").classList.remove("open");if(name==="audio")renderLessons();if(name==="notebook")renderNotes();if(name==="playlists")renderPlaylists();window.scrollTo(0,0)}
function renderDepartmentCards(target){$(target).innerHTML=DEPARTMENTS.map(d=>`<article class="department-card" data-dept="${d.id}"><div class="department-symbol">${d.symbol}</div><strong>${d.name}</strong><p>${d.description}</p></article>`).join("");$(target).querySelectorAll("[data-dept]").forEach(card=>card.addEventListener("click",()=>{showView("audio");$("departmentFilter").value=card.dataset.dept;renderLessons()}))}
function renderDashboard(){const mins=Math.floor((state.totalListenedSeconds||0)/60);$("statTime").textContent=mins>=60?`${Math.floor(mins/60)}h ${mins%60}min`:`${mins} min`;$("statLessons").textContent=state.completed.length;$("statFavorites").textContent=state.favorites.length;$("statNotes").textContent=state.notes.length;const last=LESSONS.find(l=>l.id===state.lastLesson);$("lastLessonTitle").textContent=last?last.title:"Sua próxima aula começa aqui";$("lastLessonInfo").textContent=last?`${dept(last.department)} • ${fmt(state.progress[last.id]||0)} ouvidos`:"Adicione um arquivo MP3 para começar a estudar por áudio."}
function renderLessons(){const query=$("audioSearch").value.toLowerCase(),filter=$("departmentFilter").value;const list=LESSONS.filter(l=>(!filter||l.department===filter)&&(`${l.title} ${dept(l.department)} ${l.module||""}`).toLowerCase().includes(query));$("audioCount").textContent=`${list.length} aula(s)`;$("lessonList").innerHTML=list.length?list.map(l=>`<div class="lesson-item ${currentLesson?.id===l.id?"current":""}"><button class="lesson-play" data-play="${l.id}" aria-label="Reproduzir ${l.title}">▶</button><div class="lesson-meta"><strong>${l.title}</strong><small>${dept(l.department)} • ${l.module||"Aula"}</small></div><span class="lesson-duration">${l.durationLabel||"MP3"}</span><button class="text-btn" data-fav="${l.id}" aria-label="Favoritar">${state.favorites.includes(l.id)?"♥":"♡"}</button></div>`).join(""):`<div class="empty-state"><strong>${LESSONS.length?"Nenhuma aula encontrada.":"Sua biblioteca está pronta para receber aulas."}</strong><br>${LESSONS.length?"Experimente outro termo ou departamento.":"Cadastre um MP3 real na lista LESSONS do arquivo script.js. As pastas dos departamentos já estão preparadas."}</div>`;document.querySelectorAll("[data-play]").forEach(b=>b.onclick=()=>selectLesson(b.dataset.play,true));document.querySelectorAll("[data-fav]").forEach(b=>b.onclick=()=>toggleFavorite(b.dataset.fav))}
function selectLesson(id,autoplay=false){const lesson=LESSONS.find(l=>l.id===id);if(!lesson)return;if(!lesson.audio){toast("Esta aula ainda não possui um arquivo MP3 configurado.");return}currentLesson=lesson;audio.src=lesson.audio;audio.load();$("playerTitle").textContent=lesson.title;$("playerDepartment").textContent=dept(lesson.department);$("walkTitle").textContent=lesson.title;$("walkDepartment").textContent=dept(lesson.department).toUpperCase();$("miniTitle").textContent=lesson.title;$("miniState").textContent=dept(lesson.department);$("playPause").disabled=$("walkPlay").disabled=$("miniPlay").disabled=$("completeLesson").disabled=false;$("favoriteCurrent").textContent=state.favorites.includes(id)?"♥ Favoritado":"♡ Favoritar";state.lastLesson=id;state.history=state.history.filter(x=>x!==id);state.history.unshift(id);saveState();renderLessons();if(autoplay)playAudio()}
async function playAudio(){if(!currentLesson){toast("Escolha uma aula com MP3 cadastrado.");return}try{await audio.play()}catch(e){toast("Não foi possível reproduzir. Verifique o arquivo MP3 e tente novamente.")}}
function updatePlayButtons(){const playing=!audio.paused;$("playPause").textContent=playing?"Ⅱ":"▶";$("walkPlay").textContent=playing?"Ⅱ":"▶";$("miniPlay").textContent=playing?"Ⅱ":"▶";$("playPause").setAttribute("aria-label",playing?"Pausar":"Reproduzir")}
function toggleFavorite(id){if(state.favorites.includes(id))state.favorites=state.favorites.filter(x=>x!==id);else state.favorites.push(id);saveState();renderLessons();if(currentLesson?.id===id)$("favoriteCurrent").textContent=state.favorites.includes(id)?"♥ Favoritado":"♡ Favoritar"}
function seek(delta){if(Number.isFinite(audio.duration))audio.currentTime=Math.max(0,Math.min(audio.duration,audio.currentTime+delta))}
function renderNotes(){$("notesList").innerHTML=state.notes.length?state.notes.slice().reverse().map(n=>`<article class="note-card"><strong>${escapeHtml(n.title)}</strong><p>${escapeHtml(n.body)}</p><small>${new Date(n.createdAt).toLocaleString("pt-BR")}</small></article>`).join(""):'<div class="empty-state">Suas anotações aparecerão aqui.</div>'}
function renderPlaylists(){$("playlistList").innerHTML=state.playlists.length?state.playlists.map(p=>`<article class="playlist-card"><div><strong>${escapeHtml(p.name)}</strong><small>${p.lessonIds.length} aula(s) • ${p.lessonIds.map(id=>LESSONS.find(l=>l.id===id)?.title).filter(Boolean).join(", ")||"Adicione aulas pela biblioteca"}</small></div><button class="outline-btn" data-add="${p.id}">Adicionar aula</button></article>`).join(""):'<div class="empty-state">Crie sua primeira playlist para organizar seus estudos por tema ou atividade.</div>';document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{const available=LESSONS.filter(l=>!state.playlists.find(p=>p.id===b.dataset.add).lessonIds.includes(l.id));if(!available.length){toast("Não há aulas cadastradas disponíveis.");return}const chosen=prompt("Digite o título exato da aula para adicionar:\\n"+available.map(l=>l.title).join("\\n"));const lesson=available.find(l=>l.title.toLowerCase()===String(chosen||"").toLowerCase());if(lesson){state.playlists.find(p=>p.id===b.dataset.add).lessonIds.push(lesson.id);saveState();renderPlaylists();toast("Aula adicionada.")}else if(chosen)toast("Título não encontrado.")})}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function init(){ $("todayLabel").textContent=new Date().toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"short"});renderDepartmentCards("dashboardDepartments");renderDepartmentCards("allDepartments");$("departmentFilter").innerHTML='<option value="">Todos os departamentos</option>'+DEPARTMENTS.map(d=>`<option value="${d.id}">${d.name}</option>`).join("");renderDashboard();renderLessons();renderNotes();renderPlaylists();
 document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.go)));$("menuToggle").onclick=()=>$("sidebar").classList.toggle("open");
 $("audioSearch").oninput=renderLessons;$("departmentFilter").onchange=renderLessons;
 $("playPause").onclick=$("walkPlay").onclick=$("miniPlay").onclick=()=>audio.paused?playAudio():audio.pause();$("back15").onclick=$("walkBack").onclick=()=>seek(-15);$("forward15").onclick=$("walkForward").onclick=()=>seek(15);
 $("speedSelect").onchange=()=>audio.playbackRate=Number($("speedSelect").value);$("favoriteCurrent").onclick=()=>currentLesson&&toggleFavorite(currentLesson.id);
 audio.addEventListener("play",updatePlayButtons);audio.addEventListener("pause",updatePlayButtons);audio.addEventListener("loadedmetadata",()=>{$("duration").textContent=fmt(audio.duration);$("progressBar").max=audio.duration||100});audio.addEventListener("timeupdate",()=>{$("currentTime").textContent=fmt(audio.currentTime);$("progressBar").value=audio.currentTime||0;$("duration").textContent=fmt(audio.duration);$("walkElapsed").textContent=fmt(audio.currentTime);if(currentLesson){state.progress[currentLesson.id]=Math.floor(audio.currentTime);state.totalListenedSeconds=(state.totalListenedSeconds||0);}});
 let lastSavedSecond=0;audio.addEventListener("timeupdate",()=>{const now=Math.floor(audio.currentTime);if(now>lastSavedSecond){state.totalListenedSeconds+=now-lastSavedSecond;lastSavedSecond=now;state.progress[currentLesson.id]=now;if(now%10===0)saveState()}});audio.addEventListener("seeking",()=>{lastSavedSecond=Math.floor(audio.currentTime)});audio.addEventListener("ended",()=>{updatePlayButtons();lastSavedSecond=0;toast("Áudio finalizado. Se desejar, marque a aula como concluída.")});audio.addEventListener("error",()=>{if(currentLesson)toast("Arquivo MP3 não encontrado. Confira o caminho cadastrado.")});
 $("progressBar").oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number($("progressBar").value)};
 $("completeLesson").onclick=()=>{if(!currentLesson)return;if(!state.completed.includes(currentLesson.id))state.completed.push(currentLesson.id);saveState();toast("Aula marcada como concluída.")};
 $("saveNote").onclick=()=>{const title=$("noteTitle").value.trim(),body=$("noteBody").value.trim();if(!title||!body){toast("Preencha o título e o conteúdo.");return}state.notes.push({title,body,createdAt:new Date().toISOString()});saveState();$("noteTitle").value=$("noteBody").value="";renderNotes();toast("Anotação salva neste dispositivo.")};
 $("createPlaylist").onclick=()=>{const name=$("playlistName").value.trim();if(!name){toast("Digite um nome para a playlist.");return}state.playlists.push({id:"p-"+Date.now(),name,lessonIds:[]});saveState();$("playlistName").value="";renderPlaylists();toast("Playlist criada.")};
 $("saveRecall").onclick=()=>{const answer=$("recallAnswer").value.trim();if(!answer){toast("Escreva primeiro o que conseguiu recordar.");return}state.recalls.push({answer,createdAt:new Date().toISOString()});saveState();$("recallAnswer").value="";toast("Reflexão de memória salva.")};
 $("attentionStart").onclick=()=>{if(attentionInterval){clearInterval(attentionInterval);attentionInterval=null;$("attentionStatus").textContent="Exercício pausado.";return}attentionRemaining=120;$("attentionStatus").textContent="Observe sua respiração e os sons ao redor. Tempo: 2:00";attentionInterval=setInterval(()=>{attentionRemaining--;$("attentionStatus").textContent=`Exercício em andamento • ${fmt(attentionRemaining)}`;if(attentionRemaining<=0){clearInterval(attentionInterval);attentionInterval=null;$("attentionStatus").textContent="Exercício concluído. Registre como foi sua experiência."}},1000)};
 $("startSession").onclick=()=>{if(sessionStartedAt){toast("Já existe uma sessão em andamento.");return}sessionStartedAt=Date.now();$("walkStatus").textContent="Sessão em andamento.";sessionInterval=setInterval(()=>{const elapsed=Math.floor((Date.now()-sessionStartedAt)/1000);$("walkElapsed").textContent=fmt(elapsed);if(elapsed>=Number($("sessionLength").value)*60)endWalkingSession(true)},1000);toast("Sessão iniciada.")};
 $("endSession").onclick=()=>endWalkingSession(false);
 $("exportData").onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="academia-da-mente-dados.json";a.click();URL.revokeObjectURL(url)};
 if("mediaSession" in navigator){navigator.mediaSession.setActionHandler("play",playAudio);navigator.mediaSession.setActionHandler("pause",()=>audio.pause());navigator.mediaSession.setActionHandler("seekbackward",()=>seek(-15));navigator.mediaSession.setActionHandler("seekforward",()=>seek(15));}
}
function endWalkingSession(auto){if(!sessionStartedAt){toast("Nenhuma sessão está em andamento.");return}const elapsed=Math.floor((Date.now()-sessionStartedAt)/1000);clearInterval(sessionInterval);sessionInterval=null;sessionStartedAt=null;$("walkStatus").textContent=`Sessão encerrada • ${fmt(elapsed)} de tempo decorrido.`;toast(auto?"Sua sessão programada terminou.":"Sessão encerrada. Obrigado por estudar.");}
init();