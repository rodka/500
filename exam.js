'use strict';
const EXAM_KEY='ckait-tzs-exam-v1';
const EXAM_DURATION=30*60*1000;
let examMap=null,exam=null,examInterval=null;
const partLabel=p=>p==='general'?'Obecná část':p==='specialist'?'Oborová část':'Časovaný trénink';
function examMessage(message){$('exam-error').textContent=message;$('exam-error').classList.remove('hidden')}
function persistExam(){
  try{sessionStorage.setItem(EXAM_KEY,JSON.stringify(exam))}
  catch{$('exam-session-note').textContent='Průběh nelze uložit. Neobnovujte tuto stránku; časový limit běží dál.'}
}
function forgetExam(){try{sessionStorage.removeItem(EXAM_KEY)}catch{}}
function updateExamDescription(){
  const split=$('exam-kind').value==='split';
  const general=examMap?.questions.filter(q=>q.part==='general').length||0;
  const specialist=examMap?.questions.filter(q=>q.part==='specialist').length||0;
  $('exam-composition-note').textContent=split
    ?`Pracovní simulace: výběr z ${general} obecných a ${specialist} oborových otázek zařazených podle staršího vydání. Členění pro rok 2026 není potvrzené. Zbývajících ${bank.length-general-specialist} otázek tento režim nepoužívá.`
    :`Náhodný výběr z celé banky ${bank.length} otázek s pestrým zastoupením okruhů. Bez rozdělení 20 + 10; výsledek bude pouze bodový, bez výroku o splnění zkoušky.`;
  $('exam-start').textContent=split?'Spustit zkoušku nanečisto':'Spustit časovaný trénink';
  $('exam-start').disabled=split&&!examMap;
}
function showExam(){
  for(const id of ['home','quiz','summary','exam-result'])$(id).classList.add('hidden');
  $('exam-view').classList.remove('hidden');
  $('exam-session-note').textContent=exam.kind==='split'?'Pracovní členění podle vydání 2025 · řešení až po odevzdání':'Časovaný trénink z celé banky · řešení až po odevzdání';
  renderExam();clearInterval(examInterval);tickExam();
  if(exam)examInterval=setInterval(tickExam,250);
  scrollTo({top:0,behavior:'smooth'});
}
function startExam(){
  try{
    const kind=$('exam-kind').value;
    if(kind==='split'&&!examMap)throw Error('Členění se nepodařilo načíst. Zkuste časovaný trénink.');
    const started=Date.now();
    exam={version:1,kind,started,deadline:started+EXAM_DURATION,position:0,items:ExamCore.build(bank,examMap?.questions||[],kind)};
    $('exam-error').classList.add('hidden');showExam();persistExam();
  }catch(e){exam=null;examMessage(e.message)}
}
function tickExam(){
  if(!exam)return;
  const seconds=Math.max(0,Math.ceil((exam.deadline-Date.now())/1000));
  $('exam-timer').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  $('exam-timer').classList.toggle('time-low',seconds<=300);
  if(!seconds)finishExam(true);
}
function canAnswer(){if(!exam)return false;if(Date.now()>=exam.deadline){finishExam(true);return false}return true}
function renderExam(){
  const item=exam.items[exam.position],q=bank.find(q=>q.id===item.id);
  $('exam-position').textContent=`Otázka ${exam.position+1} z 30`;
  $('exam-answered').textContent=`Zodpovězeno ${exam.items.filter(i=>i.answer!==null).length} / 30`;
  $('exam-id').textContent=q.id;$('exam-category').textContent=q.category_name;$('exam-part').textContent=partLabel(item.part);
  $('exam-question').textContent=q.question;
  $('exam-options').replaceChildren();
  item.options.forEach((option,i)=>{
    const button=document.createElement('button');button.type='button';button.className='option';
    const selected=item.answer===option;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));
    const letter=document.createElement('span');letter.className='option-letter';letter.textContent='ABC'[i];
    const text=document.createElement('span');text.textContent=option;button.append(letter,text);
    button.addEventListener('click',()=>{if(!canAnswer())return;item.answer=option;persistExam();renderExam();$('exam-options').children[i].focus()});
    $('exam-options').append(button);
  });
  $('exam-nav').replaceChildren();
  exam.items.forEach((entry,i)=>{
    const button=document.createElement('button');button.type='button';button.textContent=String(i+1);
    button.classList.toggle('has-answer',entry.answer!==null);button.classList.toggle('current',i===exam.position);
    button.setAttribute('aria-label',`Otázka ${i+1}, ${partLabel(entry.part)}, ${entry.answer===null?'nezodpovězená':'zodpovězená'}`);
    if(i===exam.position)button.setAttribute('aria-current','step');
    button.addEventListener('click',()=>moveExam(i));$('exam-nav').append(button);
  });
  $('exam-prev').disabled=exam.position===0;$('exam-next').disabled=exam.position===29;$('exam-clear').disabled=item.answer===null;
}
function moveExam(index){if(!canAnswer())return;exam.position=Math.max(0,Math.min(29,index));persistExam();renderExam();$('exam-question').focus({preventScroll:true})}
function finishExam(expired=false){
  if(!exam)return;
  // Zpracování je synchronní; opakované odevzdání ani časovač nemohou body zapsat znovu.
  const completed=exam;exam=null;clearInterval(examInterval);examInterval=null;forgetExam();
  if($('exam-confirm').open)$('exam-confirm').close();
  const score=ExamCore.evaluate(completed.items,bank);
  for(const item of completed.items){
    const q=bank.find(q=>q.id===item.id),correct=item.answer===q.correct,r={...row(q.id)};
    r.seen=(Number(r.seen)||0)+1;
    if(correct){r.correct=(Number(r.correct)||0)+1;if(r.error){r.streak=(Number(r.streak)||0)+1;if(r.streak>=2){r.error=false;r.streak=0}}}
    else{r.wrong=(Number(r.wrong)||0)+1;r.error=true;r.streak=0}
    progress[q.id]=r;
  }
  saveProgress();updateStats();
  $('exam-view').classList.add('hidden');$('exam-result').classList.remove('hidden');
  $('exam-result-heading').textContent=completed.kind==='split'?'Výsledek zkoušky nanečisto':'Výsledek časovaného tréninku';
  $('exam-score').textContent=`${score.total} / 30 správně`;
  const verdicts={pass:'Vyhověl v této simulaci',oral:'V této simulaci by následovaly doplňující ústní otázky',fail:'Nevyhověl v této simulaci',mixed:'Bodový výsledek bez hodnocení jednotlivých částí zkoušky'};
  $('exam-verdict').textContent=verdicts[score.status];
  $('exam-result-note').textContent=completed.kind==='split'
    ?'Výsledek používá oficiální bodové hranice, ale pouze pracovní členění otázek podle vydání 2025. Přesné složení současné zkoušky ani výběr podle specializace nejsou potvrzené.'
    :'Tento test vybírá ze všech 500 otázek. Nemá ověřené složení 20 + 10, proto z celkového skóre nelze určit výsledek skutečné zkoušky.';
  $('exam-scores').replaceChildren();
  if(completed.kind==='split'){
    const table=document.createElement('table');table.className='exam-score-table';
    const head=table.createTHead().insertRow();for(const text of ['Část','Správně','Hodnocení']){const th=document.createElement('th');th.scope='col';th.textContent=text;head.append(th)}
    const body=table.createTBody();
    for(const [label,value,max,pass,fail] of [['Obecná',score.general,20,16,10],['Oborová',score.specialist,10,8,5]]){
      const tr=body.insertRow();for(const text of [label,`${value} / ${max}`,value>=pass?'Vyhověl':value<=fail?'Nevyhověl':'Doplňující ústní otázky'])tr.insertCell().textContent=text;
    }
    $('exam-scores').append(table);
  }
  const elapsed=Math.min(EXAM_DURATION,Math.max(0,Date.now()-completed.started));
  $('exam-completed-info').textContent=`${expired?'Čas vypršel. Test byl automaticky odevzdán.':'Test odevzdán.'} Čas: ${Math.floor(elapsed/60000)}:${String(Math.floor(elapsed/1000)%60).padStart(2,'0')}. Nezodpovězeno: ${score.unanswered}. Chybné i nezodpovězené otázky byly zařazeny k opakování.`;
  const review=$('exam-review');review.replaceChildren();
  completed.items.forEach((item,i)=>{
    const q=bank.find(q=>q.id===item.id),correct=item.answer===q.correct;
    const details=document.createElement('details');details.className='review-item';
    const summary=document.createElement('summary');summary.textContent=`${i+1}. ${q.id} · ${correct?'Správně':item.answer===null?'Nezodpovězeno':'Chybně'} — ${q.question}`;details.append(summary);
    const p=document.createElement('p');p.textContent=`Vaše odpověď: ${item.answer??'Bez odpovědi'}`;details.append(p);
    const answer=document.createElement('p');answer.className='review-correct';answer.textContent=`Správně: ${q.correct}`;details.append(answer);
    const source=document.createElement('p');source.textContent=`Zdroj: ${q.source}`;details.append(source);
    if(q.explanation){const info=document.createElement('p');info.textContent=q.explanation;details.append(info)}
    const a=document.createElement('a');a.href=`${ORIGINAL_PDF}#page=${q.official_pdf_page}`;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Otevřít stranu v podkladu ↗';details.append(a);review.append(details);
  });
  $('exam-result-heading').focus({preventScroll:true});scrollTo({top:0,behavior:'smooth'});
}
function restoreExam(){
  let saved;try{saved=JSON.parse(sessionStorage.getItem(EXAM_KEY)||'null')}catch{forgetExam();return}
  if(!saved)return;
  const byId=new Map(bank.map(q=>[q.id,q]));
  const valid=saved.version===1&&['split','mixed'].includes(saved.kind)&&Number.isFinite(saved.started)&&saved.started<=Date.now()&&saved.deadline===saved.started+EXAM_DURATION&&Number.isInteger(saved.position)&&saved.position>=0&&saved.position<30&&Array.isArray(saved.items)&&saved.items.length===30&&new Set(saved.items.map(i=>i.id)).size===30&&saved.items.every(item=>{
    const q=byId.get(item.id);return q&&Array.isArray(item.options)&&item.options.length===3&&new Set(item.options).size===3&&item.options.includes(q.correct)&&item.options.every(o=>o===q.correct||q.wrong.includes(o))&&(item.answer===null||item.options.includes(item.answer))&&(saved.kind==='mixed'?item.part==='mixed':examMap?.questions.some(m=>m.id===item.id&&m.part===item.part));
  })&&(saved.kind==='mixed'||(saved.items.filter(i=>i.part==='general').length===20&&saved.items.filter(i=>i.part==='specialist').length===10));
  if(!valid){forgetExam();examMessage('Rozpracovaný test nelze obnovit po změně dat. Spusťte nový test.');return}
  exam=saved;showExam();
}
async function initExam(){
  $('exam-start').addEventListener('click',startExam);
  $('exam-kind').addEventListener('change',updateExamDescription);
  $('exam-prev').addEventListener('click',()=>moveExam(exam.position-1));
  $('exam-next').addEventListener('click',()=>moveExam(exam.position+1));
  $('exam-clear').addEventListener('click',()=>{if(!canAnswer())return;exam.items[exam.position].answer=null;persistExam();renderExam()});
  $('exam-submit').addEventListener('click',()=>{
    if(!canAnswer())return;const unanswered=exam.items.filter(i=>i.answer===null).length;
    $('exam-confirm-text').textContent=unanswered?`Zbývá ${unanswered} nezodpovězených otázek. Při odevzdání získají 0 bodů. Čas běží i během tohoto potvrzení.`:'Všech 30 otázek je zodpovězených. Po odevzdání už odpovědi nepůjde změnit.';
    $('exam-confirm').showModal();
  });
  $('exam-confirm-cancel').addEventListener('click',()=>$('exam-confirm').close());
  $('exam-confirm-send').addEventListener('click',()=>{if(canAnswer())finishExam()});
  $('exam-back').addEventListener('click',()=>{
    if(!canAnswer())return;
    if(confirm('Ukončit test bez hodnocení a zahodit odpovědi?')){
      exam=null;clearInterval(examInterval);forgetExam();$('exam-view').classList.add('hidden');home();
    }else tickExam();
  });
  $('exam-result-home').addEventListener('click',()=>{$('exam-result').classList.add('hidden');home()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)tickExam()});
  try{
    const response=await fetch('exam-map.json',{cache:'no-store'});if(!response.ok)throw Error();
    const map=await response.json();const ids=new Set(bank.map(q=>q.id));
    if(!Array.isArray(map.questions)||new Set(map.questions.map(q=>q.id)).size!==map.questions.length||map.questions.some(q=>!ids.has(q.id)||!['general','specialist'].includes(q.part))||map.questions.filter(q=>q.part==='general').length<20||map.questions.filter(q=>q.part==='specialist').length<10)throw Error();
    examMap=map;
  }catch{examMessage('Soubor exam-map.json se nepodařilo načíst. Procvičování a časovaný trénink ze všech otázek jsou dostupné.');$('exam-kind').value='mixed'}
  updateExamDescription();restoreExam();
}
