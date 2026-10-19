/* PITWALL V8.6 — per-driver championship scenarios shown inside
   their profile, independent from standings and ladder art. */
'use strict';
(function(){
  const GP=[25,18,15,12,10,8,6,4,2,1,0];
  const escapeText=(v)=>String(v??'').replace(/[&<>"']/g,c=>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const future=()=>data.races.filter(r=>Number.isFinite(Date.parse(r.race))&&
    Date.parse(r.race)>Date.now());
  function scenario(code){
    const driver=data.drivers.find(d=>String(d.code).toUpperCase()===String(code).toUpperCase());
    if(!driver)return null;
    const contenders=data.drivers.filter(d=>d!==driver).slice().sort((a,b)=>
      Number(b.points||0)-Number(a.points||0));
    const leader=contenders[0];
    const remaining=future(),left=remaining.length;
    const sprints=remaining.filter(r=>r.sprint||
      (r.sessions||[]).some(s=>String(s.name||'').toLowerCase()==='sprint'&&!s.cancelled)).length;
    const points=Number(driver.points)||0,leadPoints=Number(leader?.points)||0;
    const gap=Math.max(0,leadPoints-points);
    const max=left*25+sprints*8;
    const possible=points+max>=leadPoints;
    const wins=Math.min(left,Math.max(0,Math.ceil((gap-sprints*8)/25)));
    const cases=contenders.slice(0,4).map(r=>{
      const rivalPoints=Number(r.points)||0;
      const allowed=points+25-rivalPoints;
      let finish='Any lower position';
      if(allowed<0)finish='Cannot pass in one GP, even if they score 0';
      else if(allowed>=25)finish='Any position';
      else{
        const index=GP.findIndex(p=>p<=allowed);
        const place=index===10?11:index+1;
        finish='P'+place+' or lower (max '+GP[index]+' pts)';
      }
      return {code:r.code,name:(r.first||'')+' '+(r.last||''),finish};
    });
    return {name:driver.first+' '+driver.last,points,left,sprints,gap,leader,
      possible,wins,remainingMaximum:max,cases};
  }
  function markup(d){
    if(!d)return '';
    const rows=d.cases.map(r=>
      '<div class="v86-rival"><strong>'+escapeText(r.name)+'</strong><span>'+
      escapeText(r.finish)+'</span></div>').join('');
    const remaining=d.left>0?'Example: if '+escapeText(d.name)+
      ' finishes P1 at the next Grand Prix (25 points), these are the approximate finishing limits for leading rivals to remain level or behind:':
      'There are no future Grands Prix on the available calendar.';
    const status=!d.possible?'Mathematically eliminated based on remaining maximum points':
      d.gap===0?'Currently at or above the nearest challenger':
      'Still in mathematical contention · optimistic estimate: '+d.wins+
      ' GP '+(d.wins===1?'win':'wins')+' to reach today’s leader, assuming maximum sprint points and no new rival points';
    return '<section class="v86-profile-title" aria-label="Championship finishing scenarios">'+
      '<h3>Championship path & rival finishes</h3>'+
      '<p class="v86-title-status">'+escapeText(status)+'</p>'+
      '<p>'+d.left+' Grands Prix · '+d.sprints+' sprint weekends remaining. Current rival gap: '+
      d.gap+' points. Maximum additional points: '+d.remainingMaximum+'.</p>'+
      (d.left>0?'<p>'+remaining+'</p><div class="v86-rivals">'+rows+'</div>':'')+
      '<small>Illustrative next-race points only. Other rivals may also matter. '+
      'No single result guarantees the Drivers’ Championship; later Grands Prix, sprint results '+
      'and countback can change the outcome. “P11 or lower” earns no GP points under standard scoring.</small>'+
      '</section>';
  }
  function insert(){
    const shade=document.querySelector('.v44-driver-shade[data-driver-code]');
    if(!shade)return;
    const modal=shade.querySelector('.v44-driver-modal.v71-profile-ready');
    if(!modal||modal.querySelector('.v86-profile-title'))return;
    const d=scenario(shade.dataset.driverCode);
    if(!d)return;
    const overview=modal.querySelector('[data-v71-driver-panel="overview"]');
    if(!overview)return;
    overview.insertAdjacentHTML('beforeend',markup(d));
  }
  const observer=new MutationObserver(()=>insert());
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',()=>queueMicrotask(insert));
  window.pitwallChampionshipScenario=scenario;
  insert();
})();