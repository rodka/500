"use strict";
const DATA_URL="questions.json";
const ORIGINAL_PDF="https://www.ckait.cz/sites/default/files/2026-07/OTAZKY-ke-zkouskam-vyd%C3%A1n%C3%AD_2-2026.pdf";
const STORAGE_KEY="ckait-tzs-quiz-v1";
const $=id=>document.getElementById(id);
let bank=[],progress={},session=[],position=0,answered=false,sessionCorrect=0,sessionStyle="cards";

function readProgress(){
  try{const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");return data&&typeof data==="object"&&!Array.isArray(data)?data:{}}
  catch{return {}}
}
function saveProgress(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(progress))}
  catch{showError("Výsledky se v tomto prohlížeči nepodařilo uložit. Stáhněte si zálohu.")}
}
function showError(message){$("load-error").textContent=message;$("load-error").classList.remove("hidden")}
function row(id){return progress[id]||{seen:0,correct:0,wrong:0,streak:0,error:false,favorite:false}}
function shuffle(array){const a=[...array];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function updateStats(){
  $("stat-total").textContent=bank.length;
  $("stat-seen").textContent=bank.filter(q=>row(q.id).seen>0).length;
  $("stat-wrong").textContent=bank.filter(q=>row(q.id).error).length;
  $("stat-success").textContent=Object.values(progress).reduce((sum,r)=>sum+(Number(r.correct)||0),0);
}
function eligible(){
  const mode=document.querySelector('input[name="mode"]:checked').value;
  const category=$("category").value;
  return bank.filter(q=>{
    if(category!=="all"&&q.category!==category)return false;
    const r=row(q.id);
    return mode==="all"||mode==="wrong"&&r.error||mode==="unseen"&&!r.seen||mode==="favorite"&&r.favorite;
  });
}
function start(){
  sessionStyle=document.querySelector('input[name="study-style"]:checked').value;
  const possible=shuffle(eligible());
  if(!possible.length){showError("V této kombinaci zatím nejsou žádné otázky. Změňte okruh nebo režim tréninku.");return}
  $("load-error").classList.add("hidden");
  const n=$("count").value;
  session=n==="all"?possible:possible.slice(0,Number(n));
  position=0;sessionCorrect=0;
  $("home").classList.add("hidden");$("summary").classList.add("hidden");$("quiz").classList.remove("hidden");
  render();scrollTo({top:0,behavior:"smooth"});
}
function render(){
  answered=false;
  const q=session[position],r=row(q.id);
  $("session-count").textContent=`Otázka ${position+1} z ${session.length}`;
  $("progress-fill").style.width=`${position/session.length*100}%`;
  $("question-id").textContent=q.id;
  $("question-category").textContent=q.category_name;
  $("question-text").textContent=q.question;
  $("favorite").textContent=r.favorite?"★":"☆";
  $("favorite").setAttribute("aria-pressed",String(!!r.favorite));
  $("favorite").setAttribute("aria-label",r.favorite?"Odebrat označení otázky":"Označit otázku");
  $("feedback").className="feedback hidden";
  $("next").classList.add("hidden");
  $("pdf-link").href=`${ORIGINAL_PDF}#page=${q.official_pdf_page}`;
  const box=$("options");box.replaceChildren();
  $("flashcard").classList.toggle("hidden",sessionStyle!=="cards");
  box.classList.toggle("hidden",sessionStyle!=="choice");
  if(sessionStyle==="cards"){
    $("reveal").classList.remove("hidden");
    $("card-answer").classList.add("hidden");
    $("known").parentElement.classList.remove("hidden");
    $("answer-text").textContent=q.correct;
  }else{
    shuffle([q.correct,...q.wrong]).forEach((option,i)=>{
      const button=document.createElement("button");button.type="button";button.className="option";
      const letter=document.createElement("span");letter.className="option-letter";letter.textContent="ABCD"[i];
      const text=document.createElement("span");text.textContent=option;
      button.append(letter,text);button.addEventListener("click",()=>choose(option));box.append(button);
    });
  }
}
function recordAnswer(correct){
  answered=true;
  const q=session[position],r={...row(q.id)};
  r.seen=(Number(r.seen)||0)+1;
  if(correct){
    r.correct=(Number(r.correct)||0)+1;
    if(r.error){r.streak=(Number(r.streak)||0)+1;if(r.streak>=2){r.error=false;r.streak=0}}
    sessionCorrect++;
  }else{r.wrong=(Number(r.wrong)||0)+1;r.error=true;r.streak=0}
  progress[q.id]=r;saveProgress();updateStats();
  return r;
}
function reveal(){
  if(answered)return;
  $("reveal").classList.add("hidden");
  $("card-answer").classList.remove("hidden");
}
function grade(correct){
  if(answered||$("card-answer").classList.contains("hidden"))return;
  const r=recordAnswer(correct);
  $("known").parentElement.classList.add("hidden");
  showFeedback(correct,r,"Zaznamenáno jako "+(correct?"správně.":"chybně."));
}
function choose(option){
  if(answered)return;
  const q=session[position],correct=option===q.correct,r=recordAnswer(correct);
  for(const button of $("options").children){
    const value=button.lastElementChild.textContent;
    button.disabled=true;
    if(value===q.correct)button.classList.add("correct");
    else if(value===option)button.classList.add("incorrect");
  }
  showFeedback(correct,r,correct?"Správně.":"Chybně. Správná odpověď je zvýrazněna zeleně.");
}
function showFeedback(correct,r,message){
  const q=session[position],info=$("feedback");
  info.className=`feedback ${correct?"correct":"incorrect"}`;
  info.replaceChildren();
  const title=document.createElement("span");title.textContent=message;
  const source=document.createElement("small");source.textContent=`Zdroj v podkladu: ${q.source||"viz originální strana"}${r.error&&correct?` · Ještě ${2-r.streak}× správně pro vyřazení z chyb.`:""}`;
  info.append(title,source);
  if(q.explanation){const explanation=document.createElement("small");explanation.textContent=q.explanation;info.append(explanation)}
  $("next").textContent=position+1===session.length?"Zobrazit výsledek →":"Další otázka →";
  $("next").classList.remove("hidden");
}
function next(){
  if(!answered)return;
  position++;
  if(position<session.length){render();scrollTo({top:0,behavior:"smooth"});return}
  $("quiz").classList.add("hidden");$("summary").classList.remove("hidden");
  $("summary-score").textContent=`${sessionCorrect} / ${session.length} správně`;
  $("summary-detail").textContent=`K opakování je nyní ${bank.filter(q=>row(q.id).error).length} otázek. U každé chybné otázky se sledují dvě následné správné odpovědi.`;
  $("progress-fill").style.width="100%";
  scrollTo({top:0,behavior:"smooth"});
}
function home(){
  $("quiz").classList.add("hidden");$("summary").classList.add("hidden");$("home").classList.remove("hidden");updateStats();scrollTo({top:0,behavior:"smooth"});
}
function exportProgress(){
  const blob=new Blob([JSON.stringify({type:"ckait-tzs-progress",version:1,exported:new Date().toISOString(),progress},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;
  a.download=`ckait-tzs-vysledky-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function importProgress(file){
  if(!file)return;
  try{
    const data=JSON.parse(await file.text());
    if(data.type!=="ckait-tzs-progress"||data.version!==1||!data.progress||typeof data.progress!=="object"||Array.isArray(data.progress))throw Error("Neplatný soubor zálohy.");
    const allowed=new Set(bank.map(q=>q.id)),imported={};
    for(const [id,r] of Object.entries(data.progress)){
      if(!allowed.has(id)||!r||typeof r!=="object")continue;
      imported[id]={seen:Math.max(0,Number(r.seen)||0),correct:Math.max(0,Number(r.correct)||0),
        wrong:Math.max(0,Number(r.wrong)||0),streak:Math.min(1,Math.max(0,Number(r.streak)||0)),
        error:!!r.error,favorite:!!r.favorite};
    }
    progress=imported;saveProgress();updateStats();$("load-error").classList.add("hidden");
  }catch(e){showError(e.message||"Zálohu se nepodařilo načíst.")}
  $("import").value="";
}
async function init(){
  try{
    const response=await fetch(DATA_URL,{cache:"no-store"});
    if(!response.ok)throw Error("Soubor otázek se nepodařilo načíst.");
    bank=await response.json();
    if(!Array.isArray(bank)||!bank.length||bank.some(q=>!q.id||!q.question||!q.correct||!Array.isArray(q.wrong)||q.wrong.length!==3))throw Error("Databáze otázek je neúplná.");
    progress=readProgress();
    const categories=[...new Map(bank.map(q=>[q.category,q.category_name])).entries()];
    for(const [id,name] of categories){const option=document.createElement("option");option.value=id;option.textContent=`${id} · ${name}`;$("category").append(option)}
    updateStats();
    $("start").addEventListener("click",start);
    $("reveal").addEventListener("click",reveal);
    $("known").addEventListener("click",()=>grade(true));
    $("unknown").addEventListener("click",()=>grade(false));
    $("next").addEventListener("click",next);
    $("back").addEventListener("click",home);
    $("summary-home").addEventListener("click",home);
    $("favorite").addEventListener("click",()=>{
      const id=session[position].id;rToggle(id);
    });
    $("export").addEventListener("click",exportProgress);
    $("import").addEventListener("change",event=>importProgress(event.target.files[0]));
    $("reset").addEventListener("click",()=>{
      if(confirm("Smazat všechny výsledky, chybné a označené otázky v tomto prohlížeči?")){
        progress={};saveProgress();updateStats();
      }
    });
  }catch(e){showError(`${e.message} Web otevřete přes GitHub Pages nebo místní webový server.`);$("start").disabled=true}
}
function rToggle(id){
  const r={...row(id)};r.favorite=!r.favorite;progress[id]=r;saveProgress();
  $("favorite").textContent=r.favorite?"★":"☆";
  $("favorite").setAttribute("aria-pressed",String(r.favorite));
  $("favorite").setAttribute("aria-label",r.favorite?"Odebrat označení otázky":"Označit otázku");
}
init();
