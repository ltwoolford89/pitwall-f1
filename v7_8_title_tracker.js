/* PITWALL V7.8 championship scenario tracker.
   Conservative sufficient-win scenario, NOT a guaranteed or uniquely
   necessary win count; other finishing positions and points can change it. */
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
    const winGain=isTeam?43:25;
    const rivalDuringWin=isTeam?27:18;
    const rivalOtherRace=isTeam?43:25;
    const rivalSprint=isTeam?15:8;
    const points=Number(row.points)||0;
    if(!remaining){
      const top=Math.max(...all.map(x=>Number(x.points)||0),0);
      return points>=top?'Season complete':'Season complete';
    }
    const competitor=all.filter(x=>x!==row);
    let wins=0;
    for(const rival of competitor){
      const other=Number(rival.points)||0;
      // Assume our subject earns its winning score in k races, no other
      // GP/sprint points. Each rival earns the best possible non-winning
      // GP result during those wins and maximises the rest of the season.
      // This is a conservative sufficient condition, not a prediction.
      const required=Math.max(0,Math.floor(
        (other-points+rivalOtherRace*remaining+rivalSprint*sprints)/
        (winGain-rivalDuringWin+rivalOtherRace))+1);
      wins=Math.max(wins,required);
    }
    if(wins===0)return 'Title secured';
    if(wins>remaining)return 'Needs rival to drop points';
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
        ' sprints still scheduled. *Conservative wins-to-clinch example: '+
        (isTeams?'your team finishes 1–2, rivals 3–4 in those races; rivals sweep other races and sprints.':
                 'you win while rivals take second; rivals win the other races and score maximum sprint points.')+
        ' Actual points, other finishing results, schedule changes and tie-breaks affect the title.';
      seg.insertAdjacentElement('afterend',note);
    }
    return node.innerHTML;
  };
})();