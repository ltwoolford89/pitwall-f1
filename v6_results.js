/* PITWALL V6.5 — OpenF1 session classifications and Formula 1 Dashboard viewer */
'use strict';
(function(){
  const TIMING_URL='https://app.formula1dashboard.com/live-timing/';
  const API='https://api.openf1.org/v1/';
  const cache=new Map();
  let sessionsPromise=null;
  let serial=0;
  let expanded=false;
  const sname=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
  const asDate=x=>Date.parse(x||'');
  const escaped=x=>safe(String(x??''));
  const isRace=name=>['Race','Sprint'].includes(name);
  const completeAfter=name=>name==='Race'?150: name==='Sprint'?75: name==='Qualifying'||name==='Sprint Qualifying'?100:85;
  function selected(){
    const hero=document.querySelector('.v6-race-hero[data-v6-active-round]');
    if(!hero)return null;
    const round=Number(hero.dataset.v6ActiveRound);
    const race=data.races.find(r=>r.round===round);
    const button=hero.querySelector('.v6-session.is-selected');
    const name=button?.dataset.v6Session||'Race';
    if(!race)return null;
    const session=scheduleFor(race).find(s=>s.name===name);
    return {race,name,session:session||name==='Race'?session||{name:'Race',dateStart:race.race}:null};
  }
  function status(session,name){
    const start=asDate(session?.dateStart);
    if(!Number.isFinite(start))return 'tbc';
    return Date.now()<start?'future':Date.now()<start+completeAfter(name)*60000?'ongoing':'ended';
  }
  function displayTime(duration){
    if(Array.isArray(duration)) duration=[...duration].reverse().find(x=>typeof x==='number'&&Number.isFinite(x)&&x>0);
    if(typeof duration!=='number'||!Number.isFinite(duration)||duration<=0)return '—';
    const m=Math.floor(duration/60);
    const sec=(duration%60).toFixed(3).padStart(6,'0');
    return m+':'+sec;
  }
  function gapText(v){
    if(Array.isArray(v))v=[...v].reverse().find(x=>x!==null&&x!==undefined&&x!=='');
    if(v===null||v===undefined||v==='')return '—';
    if(typeof v==='number')return v===0?'LEADER':'+'+v.toFixed(3)+'s';
    return String(v).slice(0,30);
  }
  async function request(path,timeout=10000){
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),timeout);
    try{
      const res=await fetch(API+path,{signal:ctrl.signal,mode:'cors'});
      if(!res.ok)throw Error('HTTP '+res.status);
      const json=await res.json();
      if(!Array.isArray(json))throw Error('Unexpected API response');
      return json;
    }finally{clearTimeout(timer);}
  }
  function sessions(){
    if(!sessionsPromise){
      sessionsPromise=request('sessions?year='+encodeURIComponent(YEAR)).catch(err=>{sessionsPromise=null;throw err;});
    }
    return sessionsPromise;
  }
  function metadata(list,race,name,session){
    const raceStamp=asDate(race.race);
    if(!Number.isFinite(raceStamp))return null;
    const races=list.filter(x=>sname(x.session_name)==='race'&&Number.isFinite(asDate(x.date_start)));
    const anchor=races.filter(x=>Math.abs(asDate(x.date_start)-raceStamp)<36*3600000)
      .sort((a,b)=>Math.abs(asDate(a.date_start)-raceStamp)-Math.abs(asDate(b.date_start)-raceStamp))[0];
    let options=list.filter(x=>sname(x.session_name)===sname(name));
    if(anchor)options=options.filter(x=>x.meeting_key===anchor.meeting_key);
    else {
      const at=asDate(session?.dateStart);
      if(!Number.isFinite(at))return null;
      options=options.filter(x=>Math.abs(asDate(x.date_start)-at)<90*60000);
    }
    const desired=asDate(session?.dateStart);
    options.sort((a,b)=>Math.abs(asDate(a.date_start)-desired)-Math.abs(asDate(b.date_start)-desired));
    return options[0]||null;
  }
  async function load(race,name,session,force=false){
    const key=race.round+'|'+name;
    const hit=cache.get(key);
    if(!force&&hit&&Date.now()-hit.at<15*60000)return hit.value;
    const listing=await sessions();
    const meta=metadata(listing,race,name,session);
    if(!meta)return {state:'missing',message:'No matching session was found in the results feed yet.'};
    const [rows,drivers]=await Promise.all([
      request('session_result?session_key='+encodeURIComponent(meta.session_key)),
      request('drivers?session_key='+encodeURIComponent(meta.session_key))
    ]);
    if(!rows.length)return {state:'missing',message:'The official classification has not reached OpenF1 yet.'};
    const people=new Map(drivers.map(d=>[Number(d.driver_number),d]));
    const classified=rows.filter(x=>Number.isFinite(Number(x.position)) && Number(x.position)>0)
      .sort((a,b)=>Number(a.position)-Number(b.position));
    if(!classified.length)return {state:'missing',message:'Classification is not available yet.'};
    const value={state:'ready',rows:classified,people,sessionKey:meta.session_key};
    cache.set(key,{at:Date.now(),value});
    return value;
  }
  function renderRows(item,name){
    const entries=expanded?item.rows:item.rows.slice(0,10);
    const out=entries.map(row=>{
      const driver=item.people.get(Number(row.driver_number))||{};
      const fallback=data.drivers.find(d=>Number(d.driverNumber)===Number(row.driver_number) || String(d.number)===String(row.driver_number));
      const person=driver.full_name||[driver.first_name,driver.last_name].filter(Boolean).join(' ')||[fallback?.first,fallback?.last].filter(Boolean).join(' ')||'Driver #'+row.driver_number;
      const code=driver.name_acronym||String(driver.last_name||fallback?.last||row.driver_number).slice(0,3).toUpperCase();
      const team=driver.team_name||fallback?.team||'';
      let value= row.dsq?'DSQ':row.dns?'DNS':row.dnf?'DNF': isRace(name)?gapText(row.gap_to_leader):displayTime(row.duration);
      if(isRace(name)&&row.position===1)value='WINNER';
      const colour=driver.team_colour&&/^[A-F0-9]{6}$/i.test(driver.team_colour)?'#'+driver.team_colour:'#f9546d';
      return '<div class="v65-result-row"><b class="v65-place">P'+escaped(row.position)+'</b><span class="v65-team-bar" style="background:'+colour+'"></span><span class="v65-result-name"><strong>'+escaped(person)+'</strong><small>'+escaped(code)+' · '+escaped(team)+'</small></span><b class="v65-result-time">'+escaped(value)+'</b></div>';
    }).join('');
    const toggle=item.rows.length>10?'<button type="button" data-v65-toggle-results class="v65-toggle">'+(expanded?'SHOW TOP 10':'SHOW ALL '+item.rows.length)+' DRIVERS</button>':'';
    return '<div class="v65-results-list">'+out+'</div>'+toggle+
      '<p class="v65-caption">Historical results via OpenF1, available after publication. They are not live classifications.</p>';
  }
  function createPanel(){
    const hero=document.querySelector('.v6-race-hero');
    if(!hero)return;
    let panel=hero.querySelector('.v65-results-panel');
    if(panel)return panel;
    panel=document.createElement('section');
    panel.className='v65-results-panel';
    panel.setAttribute('aria-label','Session results');
    panel.innerHTML='<div class="v65-results-top"><div><span class="v65-eyebrow">SESSION CENTRE</span><h3>Session results</h3></div><button type="button" data-v65-refresh class="v65-refresh" aria-label="Refresh session results">↻ REFRESH</button></div><div class="v65-results-body" aria-live="polite"></div>';
    const buttons=hero.querySelector('.v6-hero-buttons');
    if(buttons)buttons.before(panel);
    else hero.append(panel);
    return panel;
  }
  async function show(){
    if(st.tab!=='home')return;
    const state=selected();
    const panel=createPanel();
    if(!panel||!state)return;
    const {race,name,session}=state;
    const key=race.round+'|'+name;
    if(panel.dataset.v65Key!==key)expanded=false;
    panel.dataset.v65Key=key;
    const body=panel.querySelector('.v65-results-body');
    const kind=status(session,name);
    if(kind!=='ended'){
      body.innerHTML='<p class="v65-result-state">'+(kind==='future'?
        'Results for '+escaped(name)+' will appear after the session is completed and published.':
        kind==='ongoing'?'This session may still be running. Final results will appear after publication.':
        'Session start time is not confirmed yet.')+'</p>';
      return;
    }
    const seq=++serial;
    body.innerHTML='<p class="v65-result-state">Loading '+escaped(name)+' results…</p>';
    try{
      const item=await load(race,name,session);
      if(seq!==serial||document.querySelector('.v65-results-panel')!==panel||panel.dataset.v65Key!==key)return;
      body.innerHTML=item.state==='ready'?renderRows(item,name):'<p class="v65-result-state">'+escaped(item.message)+'</p>';
    }catch(err){
      if(seq!==serial||document.querySelector('.v65-results-panel')!==panel)return;
      body.innerHTML='<p class="v65-result-state">Results are temporarily unavailable. Please retry later or view the official timing website.</p>';
    }
  }
  function liveTimingMarkup(){
    return '<section class="v65-live-card" aria-label="Formula 1 live timing">'+
      '<div class="v65-live-heading"><div><span class="v65-eyebrow">TIMING CENTRE</span><h3>Live F1 timing</h3></div><span class="v65-external">THIRD-PARTY</span></div>'+
      '<p>Live timing provided by Formula 1 Dashboard. Open the full experience or try the in-app viewer below.</p>'+
      '<div class="v65-live-actions"><a href="'+TIMING_URL+'" target="_blank" rel="noopener noreferrer" class="v65-live-primary">OPEN LIVE TIMING ↗</a>'+
      '<button type="button" data-v65-embed-toggle class="v65-live-secondary">VIEW INSIDE PITWALL</button></div>'+
      '<div class="v65-embed-shell" hidden><p>If the viewer stays blank, the provider may block embedded access. Use “Open Live Timing” instead.</p>'+
      '<div class="v65-iframe-wrap" data-v65-frame></div></div>'+
      '<small>Live data and availability depend on the external provider. PITWALL does not rebroadcast their timing feed.</small></section>';
  }
  function insertLiveTiming(){
    if(st.tab!=='home')return;
    const homeEl=document.querySelector('.v6-home');
    if(!homeEl || homeEl.querySelector('.v65-live-card'))return;
    const el=document.createElement('div');
    el.innerHTML=liveTimingMarkup();
    const card=el.firstElementChild;
    const raceBlock=homeEl.querySelector('.v6-races-block');
    if(raceBlock)raceBlock.before(card);
    else homeEl.append(card);
  }
  function enhanceCalendar(){
    if(st.tab!=='calendar')return;
    document.querySelectorAll('.racecard').forEach(card=>{
      const trigger=card.querySelector('[data-race]');
      if(!trigger)return;
      const race=data.races.find(r=>r.round===Number(trigger.dataset.race));
      if(!race)return;
      const schedule=scheduleFor(race);
      card.querySelectorAll('.raceinner .schedule').forEach((row,i)=>{
        const sess=schedule[i];
        if(!sess||status(sess,sess.name)!=='ended'||row.querySelector('.v65-calendar-results'))return;
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='v6-go-countdown v65-calendar-results';
        btn.dataset.v6GoRound=String(race.round);
        btn.dataset.v6GoSession=sess.name;
        btn.textContent='RESULTS ↗';
        btn.setAttribute('aria-label','View '+race.short+' '+sess.name+' results');
        row.append(btn);
      });
    });
  }
  function handleClick(event){
    const refresh=event.target.closest('[data-v65-refresh]');
    if(refresh){
      const state=selected();
      if(!state)return;
      cache.delete(state.race.round+'|'+state.name);
      sessionsPromise=null;
      show();
      return;
    }
    const toggle=event.target.closest('[data-v65-toggle-results]');
    if(toggle){expanded=!expanded;show();return;}
    const embed=event.target.closest('[data-v65-embed-toggle]');
    if(embed){
      const shell=document.querySelector('.v65-embed-shell');
      if(!shell)return;
      shell.hidden=!shell.hidden;
      embed.textContent=shell.hidden?'VIEW INSIDE PITWALL':'HIDE IN-APP VIEWER';
      if(!shell.hidden && !shell.querySelector('iframe')){
        const iframe=document.createElement('iframe');
        iframe.src=TIMING_URL;
        iframe.title='Formula 1 Dashboard live timing';
        iframe.loading='lazy';
        iframe.referrerPolicy='strict-origin-when-cross-origin';
        iframe.allowFullscreen=true;
        shell.querySelector('[data-v65-frame]')?.append(iframe);
      }
    }
  }
  window.addEventListener('pitwall:selection-changed',show);
  const oldRender=render;
  render=function(){
    const v=oldRender.apply(this,arguments);
    createPanel();
    insertLiveTiming();
    enhanceCalendar();
    show();
    return v;
  };
  document.addEventListener('click',handleClick);
  insertLiveTiming();
  createPanel();
  enhanceCalendar();
  show();
})();
