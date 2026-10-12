/* PITWALL V7.7: full-grid, read-only fan race forecast.
   Built from the same practice/qualifying/sprint ranking as calendar predictions.
   Projected DNFs are illustrative, NOT announced retirements or real outcomes. */
'use strict';
(function(){
  let selectedRound=null;
  let seasonHistory=null;
  let historyPending=null;
  let historyCheckedAt=0;
  const inflightRounds=new Set();
  let currentError='';
  const escape=value=>safe(String(value??''));
  const orderedRaces=()=>data.races.slice().sort((a,b)=>Date.parse(a.race)-Date.parse(b.race));
  const findRace=round=>data.races.find(x=>Number(x.round)===Number(round));
  const now=()=>Date.now();
  function upcoming(){
    const list=orderedRaces();
    return list.find(x=>Date.parse(x.race)>=now()-90*60000)||list[list.length-1]||null;
  }
  function hash01(code,round,salt=0){
    const value=String(code)+'-'+String(round)+'-'+String(salt);
    let h=2166136261;
    for(let i=0;i<value.length;i++){
      h^=value.charCodeAt(i);
      h=Math.imul(h,16777619);
    }
    return (h>>>0)/4294967295;
  }
  function loadHistory(force=false){
    if(historyPending)return historyPending;
    if(!force&&seasonHistory&&now()-historyCheckedAt<30*60000)return Promise.resolve(seasonHistory);
    if(!force&&!seasonHistory&&now()-historyCheckedAt<2*60000)return Promise.resolve(null);
    historyCheckedAt=now();
    historyPending=fetch(API+YEAR+'/results.json?limit=2000',{mode:'cors',cache:'no-store'})
      .then(resp=>{if(!resp.ok)throw Error('Results HTTP '+resp.status);return resp.json();})
      .then(payload=>{
        const rounds=payload?.MRData?.RaceTable?.Races;
        seasonHistory=Array.isArray(rounds)?rounds:[];
        currentError='';
        return seasonHistory;
      }).catch(()=>{
        currentError='Historical reliability data unavailable; using a neutral DNF-risk estimate.';
        return null;
      }).finally(()=>{
        historyPending=null;
        if(st.tab==='forecast'&&window.pitwallTestGate?.isUnlocked('forecast'))render();
      });
    return historyPending;
  }
  function reliabilityFor(r){
    const rec=new Map();
    if(!Array.isArray(seasonHistory))return rec;
    const past=seasonHistory.filter(x=>Number(x.round)<Number(r.round));
    for(const race of past){
      for(const entry of race.Results||[]){
        const code=String(entry.Driver?.code||'').toUpperCase();
        if(!code)continue;
        const row=rec.get(code)||{starts:0,nonfinishes:0};
        row.starts++;
        const status=String(entry.status||'');
        if(!/^(Finished|\+\d+ Laps?)$/i.test(status))row.nonfinishes++;
        rec.set(code,row);
      }
    }
    return rec;
  }
  function recentRaceForm(r){
    const bonuses=new Map();
    if(!Array.isArray(seasonHistory))return bonuses;
    const previous=seasonHistory.filter(x=>Number(x.round)<Number(r.round))
      .sort((a,b)=>Number(b.round)-Number(a.round)).slice(0,4);
    const weights=[0.7,0.48,0.30,0.18];
    previous.forEach((race,index)=>{
      for(const entry of race.Results||[]){
        const code=String(entry.Driver?.code||'').toUpperCase();
        const position=Number(entry.position);
        if(!code||!Number.isFinite(position)||position<=0||position>25)continue;
        const bonus=Math.max(0,24-position)*weights[index];
        bonuses.set(code,(bonuses.get(code)||0)+bonus);
      }
    });
    return bonuses;
  }
  function dnfRisk(stats){
    // Smoothed simple risk estimate, not a calibrated statistical probability.
    const starts=stats?.starts||0,nonfinishes=stats?.nonfinishes||0;
    return Math.max(0.05,Math.min(0.36,0.07+0.75*(nonfinishes+0.7)/(starts+10)));
  }
  function projection(r){
    const form=window.pitwallRaceProjection?.(r.round);
    if(!form||!Array.isArray(form.ranked)||!form.ranked.length)return null;
    const history=reliabilityFor(r);
    const raceForm=recentRaceForm(r);
    const updatedRanking=form.ranked.map(row=>({
      driver:row.driver,
      score:row.score+(raceForm.get(String(row.driver.code||'').toUpperCase())||0)
    })).sort((a,b)=>b.score-a.score||a.driver.last.localeCompare(b.driver.last));
    const entrants=updatedRanking.map((row,index)=>{
      const code=String(row.driver.code||'').toUpperCase();
      const stats=history.get(code)||null;
      const risk=dnfRisk(stats);
      return {driver:row.driver,score:row.score,index,risk,starts:stats?.starts||0,
        nonfinishes:stats?.nonfinishes||0,
        riskRoll:hash01(code,r.round,2026)};
    });
    // A repeatable illustrated scenario (1–3 projected retirements). No result
    // or cause of retirement is fabricated as reported news.
    const expected=entrants.reduce((sum,x)=>sum+x.risk,0);
    const count=Math.min(3,Math.max(1,Math.round(expected)));
    const likely=entrants.slice().sort((a,b)=>
      (b.risk*(0.7+b.riskRoll))-(a.risk*(0.7+a.riskRoll))||a.index-b.index);
    const retired=new Set(likely.slice(0,count).map(x=>x.driver.code));
    const finishers=entrants.filter(x=>!retired.has(x.driver.code));
    const dnfs=entrants.filter(x=>retired.has(x.driver.code)).sort((a,b)=>b.risk-a.risk);
    const lines=finishers.map((x,i)=>({...x,position:i+1,status:'Projected finish'}))
      .concat(dnfs.map(x=>({...x,position:null,status:'Projected DNF'})));
    return {...form,lines,expectedDNFs:count,historyLoaded:Array.isArray(seasonHistory),
      pastRaceFormUsed:raceForm.size>0};
  }
  function requestCurrent(r,force=false){
    if(!r||typeof window.pitwallRefreshWeekendResults!=='function')return;
    const cached=window.pitwallWeekendResults?.(r.round);
    if(!force&&cached&&now()-cached.at<3*60000)return;
    if(inflightRounds.has(String(r.round)))return;
    inflightRounds.add(String(r.round));
    window.pitwallRefreshWeekendResults(r,force)
      .catch(()=>{currentError='Some published session results could not be loaded.';})
      .finally(()=>{
        inflightRounds.delete(String(r.round));
        if(st.tab==='forecast'&&window.pitwallTestGate?.isUnlocked('forecast'))render();
      });
  }
  function fmtDate(iso){
    const d=Date.parse(iso);
    return Number.isFinite(d)?new Intl.DateTimeFormat('en-AU',{
      day:'numeric',month:'short',hour:'numeric',minute:'2-digit',timeZone:'Australia/Adelaide'
    }).format(d):'Time unknown';
  }
  function sourceLine(form){
    const labels=form?.sources||[];
    if(!labels.length)return form?.pastRaceFormUsed?'SEASON FORM + RECENT GRAND PRIX RESULTS · AWAITING WEEKEND DATA':'SEASON FORM · AWAITING SESSION CLASSIFICATIONS';
    return 'UPDATED FROM '+labels.join(' + ').toUpperCase()+(form?.pastRaceFormUsed?' + RECENT GRAND PRIX RESULTS':'');
  }
  function rowHTML(x){
    const code=escape(x.driver.code),fullName=escape(x.driver.first+' '+x.driver.last);
    const art=typeof window.pitwallDriverArtPath==='function'?
      window.pitwallDriverArtPath(x.driver.code,'face'):'./Blank_driver.png';
    const riskPercent=Math.round(x.risk*100);
    const cls=x.position?'v77-finisher':'v77-dnf';
    return '<div class="v77-row '+cls+'">'+
      '<span class="v77-position">'+(x.position?'P'+x.position:'DNF')+'</span>'+
      '<img loading="lazy" decoding="async" alt="" src="'+art+'">'+
      '<div class="v77-row-name"><strong>'+fullName+'</strong><small>'+escape(x.driver.team)+
      ' · '+code+'</small></div>'+
      '<div class="v77-row-metrics"><b>'+riskPercent+'%</b><small>DNF risk*</small></div>'+
      '</div>';
  }
  function page(){
    const race=selectedRound===null?upcoming():findRace(selectedRound);
    if(!race)return '<section class="main-tab v77-page"><h2>Full Race Forecast</h2><p>The F1 calendar is unavailable.</p></section>';
    if(selectedRound===null)selectedRound=race.round;
    const cached=window.pitwallWeekendResults?.(race.round);
    if(!cached||now()-cached.at>3*60000)requestCurrent(race);
    if(now()-historyCheckedAt>30*60000)loadHistory();
    const predicted=projection(race);
    const past=Date.parse(race.race)<now();
    const options=orderedRaces().map(item=>
      '<option value="'+item.round+'" '+(Number(item.round)===Number(race.round)?'selected':'')+'>'+
      escape('R'+item.round+' · '+item.name)+'</option>').join('');
    const current=predicted?.lines||[];
    const winner=current.find(x=>x.position===1);
    const list=current.map(rowHTML).join('');
    return '<section class="main-tab v77-page">'+
      '<div class="v77-hero"><span>PITWALL / EXPERIMENTAL FORECAST</span>'+
      '<h2>Full Race Prediction</h2>'+
      '<p>A modelled finishing order for every current driver, including possible retirements. For fun, not a live result.</p>'+
      '</div>'+
      '<div class="v77-controls"><select data-v77-race aria-label="Choose race">'+options+'</select>'+
      '<button type="button" data-v77-refresh>↻ UPDATE</button></div>'+
      '<div class="v77-race-heading"><strong>'+escape(race.name)+'</strong>'+
      '<span>'+escape(fmtDate(race.race))+' · ADELAIDE</span></div>'+
      (past?'<p class="v77-notice">This Grand Prix has already started or finished. The table below is a model scenario, not the official race classification.</p>':'')+
      '<div class="v77-model-source">'+escape(sourceLine(predicted))+'</div>'+
      (winner?'<div class="v77-predicted-winner"><span>PROJECTED WINNER</span><strong>'+escape(winner.driver.first+' '+winner.driver.last)+'</strong>'+
      '<small>'+escape(winner.driver.team)+'</small></div>':'')+
      '<div class="v77-grid-header"><span>PROJECTED CLASSIFICATION</span><span>RELIABILITY</span></div>'+
      (list||'<p class="v77-notice">Waiting for current driver standings and race data.</p>')+
      '<p class="v77-method">Forecast inputs: current championship form, FP1–FP3, qualifying and sprint classifications once published; circuit type is also considered. The predicted DNF scenarios use recent finish/retirement history when available, with a repeatable risk simulation. '+(currentError?escape(currentError)+' ':'')+'</p>'+
      '<p class="v77-disclaimer">*DNF risk is a rough model indicator, not a calibrated probability. Predictions and DNFs are hypothetical, not reported outcomes. Actual race results can differ substantially. The calendar still keeps its separate top-three preview.</p>'+
      '</section>';
  }
  window.pitwallFullForecastPage=page;
  document.addEventListener('change',e=>{
    const input=e.target.closest('[data-v77-race]');
    if(!input)return;
    selectedRound=Number(input.value);
    render();
  });
  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-v77-refresh]');
    if(!btn)return;
    const race=findRace(selectedRound);
    if(race){
      requestCurrent(race,true);
      loadHistory(true);
      render();
    }
  });
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden&&st.tab==='forecast'&&window.pitwallTestGate?.isUnlocked('forecast'))render();
  });
  setInterval(()=>{
    if(document.hidden||st.tab!=='forecast'||!window.pitwallTestGate?.isUnlocked('forecast'))return;
    const race=findRace(selectedRound);
    if(race)requestCurrent(race);
  },180000);
})();