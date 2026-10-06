/* Čisté funkce pro sestavení a vyhodnocení testu. */
(function(root){
  'use strict';
  function shuffled(items,rng=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  // Jedna otázka z každého dostupného okruhu, zbytek náhodně z celého zbytku.
  // Jde o tréninkový algoritmus, nikoli o předepsané kvóty ČKAIT.
  function diverse(pool,count,rng=Math.random){
    if(pool.length<count)throw Error('Pro zvolenou část není dostatek otázek.');
    const groups=new Map();for(const q of pool){if(!groups.has(q.category))groups.set(q.category,[]);groups.get(q.category).push(q)}
    const selected=shuffled([...groups.values()],rng).slice(0,count).map(g=>shuffled(g,rng)[0]);
    const ids=new Set(selected.map(q=>q.id));
    return shuffled([...selected,...shuffled(pool.filter(q=>!ids.has(q.id)),rng).slice(0,count-selected.length)],rng);
  }
  function build(bank,mapping,kind,rng=Math.random){
    const parts=new Map(mapping.map(m=>[m.id,m.part]));
    const questions=kind==='split'
      ?[...diverse(bank.filter(q=>parts.get(q.id)==='general'),20,rng),...diverse(bank.filter(q=>parts.get(q.id)==='specialist'),10,rng)]
      :diverse(bank,30,rng);
    return questions.map(q=>({id:q.id,part:kind==='split'?parts.get(q.id):'mixed',options:shuffled([q.correct,...shuffled(q.wrong,rng).slice(0,2)],rng),answer:null}));
  }
  function status(g,s){if(g<=10||s<=5)return 'fail';if(g>=16&&s>=8)return 'pass';return 'oral'}
  function evaluate(items,bank){
    const byId=new Map(bank.map(q=>[q.id,q]));let general=0,specialist=0,total=0,unanswered=0;
    for(const item of items){if(item.answer===null)unanswered++;const correct=item.answer===byId.get(item.id).correct;if(correct){total++;if(item.part==='general')general++;if(item.part==='specialist')specialist++}}
    return {total,general,specialist,unanswered,status:items.every(i=>i.part==='mixed')?'mixed':status(general,specialist)};
  }
  const api={shuffled,diverse,build,status,evaluate};root.ExamCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
