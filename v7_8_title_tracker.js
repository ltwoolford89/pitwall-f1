/* PITWALL V7.9 championship wins tracker.
   Optimistic GP wins needed to reach the present leader with maximum sprint
   points and no new rival points; distinct from mathematical elimination.
   Results remain conditional and ties depend on countback. */
'use strict';
(function(){
  function futureRaces(){
    const now=Date.now();
    return data.races.filter(r=>Number.isFinite(Date.parse(r.race))&&Date.parse(r.race)>now);
  }
  function futureSprints(races){
    return races.filter(r=>
      Boolean(r.sprint)||(r.sessions||[]).some(s=>String(s.name).toLowerCase()==='sprint'&&!s.cancelled)
    ).length;
  }
  function estimateWins(row,all,mode,remaining,sprints){
    const isTeam=mode==='constructors';
    const gpMaximum=isTeam?43:25; // Constructor 1–2: 25+18; driver winner: 25.
    const sprintMaximum=isTeam?15:8; // Constructor 1–2: 8+7; driver winner: 8.
    const points=Number(row.points)||0;
    const rivals=all.filter(x=>x!==row);
    const target=Math.max(0,...rivals.map(x=>Number(x.points)||0));
    const maximumPossible=points+remaining*gpMaximum+sprints*sprintMaximum;

    // "Not possible" ONLY for a mathematically eliminated entry. Do not
    // mistake a failed conservative guaranteed-clinch scenario for elimination.
    // Equal points may be decided by countback, so a tie is still possible.
    if(maximumPossible<target)return 'Not possible';

    // Best-case minimum number of GP victories needed to equal the present
    // leader, with maximum points from remaining sprints and zero new points
    // awarded to the rivals. A title is not guaranteed by this number.
    const gap=Math.max(0,target-points-sprints*sprintMaximum);
    const wins=Math.max(0,Math.ceil(gap/gpMaximum));
    return wins+' GP '+(wins===1?'win':'wins')+'*';
  }
  const oldStandings=standings;
  standings=function(){
    const html=oldStandings.apply(this,arguments);
    if(st.tab!=='standings')return html;
    const isTeams=st.standing==='constructors';
    const rows=isTeams?data.constructors:data.drivers;
    if(!Array.isArray(rows)||!rows.length)return html;
    const futures=futureRaces();
    const left=futures.length,sprints=futureSprints(futures);
    const node=document.createElement('div');
    node.innerHTML=html;
    const standingsRows=node.querySelectorAll('.leader');
    standingsRows.forEach((item,i)=>{
      const driver=rows[i];
      if(!driver)return;
      const team=item.querySelector('.team');
      if(!team)return;
      const detail=document.createElement('div');
      detail.className='v78-win-tracker';
      detail.textContent=estimateWins(driver,rows,st.standing,left,sprints);
      team.append(detail);
    });
    const seg=node.querySelector('.seg');
    if(seg){
      const note=document.createElement('p');
      note.className='v78-title-math';
      note.textContent='CHAMPIONSHIP PATH · '+left+' Grands Prix and '+sprints+
        ' sprints remaining. *GP wins are an optimistic minimum to equal the current leader’s points: '+
        'your driver (or team with a 1–2 finish) scores maximum points in those races and all remaining sprints, '+
        'while rivals score no more points. 0 wins does NOT mean the title is secured. '+
        '“Not possible” means even maximum remaining points cannot catch the current leader. '+
        'A points tie depends on countback. This is not a guarantee or a forecast.';
      seg.insertAdjacentElement('afterend',note);
    }
    return node.innerHTML;
  };
})();