/* PITWALL V6.4 - Interactive Grand Prix and session countdowns.
   Uses the existing 2026 race calendar and session feed; no estimated times. */
'use strict';
(function(){
  let selectedRound=null;
  let selectedSession='Race';
  const sessionGroups = {
    standard: [['Practice 1','FP1'],['Practice 2','FP2'],['Practice 3','FP3'],['Qualifying','QUALI'],['Race','RACE']],
    sprint: [['Practice 1','FP1'],['Sprint Qualifying','SQ'],['Sprint','SPRINT'],['Qualifying','QUALI'],['Race','RACE']]
  };
  const pad2=n=>String(Math.max(0,n)).padStart(2,'0');
  const raceDate = iso => {
    const ms = Date.parse(iso);
    return Number.isFinite(ms)? ms : null;
  };
  function findRace(){
    const list=sortedRaces();
    const userChoice=list.find(r=>r.round===selectedRound);
    return userChoice || list.find(r=>raceDate(r.race)>Date.now()) || list[list.length-1] || null;
  }
  function findSession(r,name){
    let arr=typeof scheduleFor==='function'?scheduleFor(r):[];
    const match=arr.find(s=>s.name===name && raceDate(s.dateStart)!==null);
    if(match) return match;
    if(name==='Race' && raceDate(r.race)!==null) return {name:'Race',dateStart:r.race};
    return null;
  }
  function activeSlot(r){
    const pick=findSession(r,selectedSession);
    if(pick)return pick;
    selectedSession='Race';
    return findSession(r,'Race');
  }
  function updateClock(){
    const hero=document.querySelector('.v6-race-hero[data-v6-active-round]');
    if(!hero) return;
    const r=findRace();
    if(!r)return;
    const slot=activeSlot(r);
    const target=slot?raceDate(slot.dateStart):null;
    const ms=target===null?0:Math.max(0,target-Date.now());
    const values={
      days:Math.floor(ms/86400000),
      hours:Math.floor(ms/3600000)%24,
      mins:Math.floor(ms/60000)%60,
      secs:Math.floor(ms/1000)%60
    };
    for(const [key,val] of Object.entries(values)){
      const el=hero.querySelector('[data-v6-countdown="'+key+'"]');
      if(el)el.textContent=pad2(val);
    }
    const headline=hero.querySelector('.v6-clock-note strong');
    const subtitle=hero.querySelector('.v6-clock-note span');
    const context=hero.querySelector('.v6-countdown-context strong');
    if(headline)headline.textContent=target===null?'TIME TBC':target>Date.now()?'UNTIL '+selectedSession.toUpperCase():'SESSION STARTED';
    if(subtitle)subtitle.textContent=target===null?'Awaiting official schedule':fmtDay(slot.dateStart)+' · '+fmtHour(slot.dateStart);
    if(context)context.textContent=selectedSession.toUpperCase()+' · ADELAIDE TIME';
  }
  function drawSessions(r,hero){
    const holder=hero.querySelector('.v6-sessions');
    if(!holder)return;
    holder.replaceChildren();
    for(const [name,code] of sessionGroups[r.sprint?'sprint':'standard']){
      const s=findSession(r,name);
      const button=document.createElement('button');
      button.type='button';
      button.className='v6-session'+(name===selectedSession?' is-selected':'')+(name==='Race'?' is-race':'');
      button.dataset.v6Session=name;
      if(!s)button.disabled=true;
      button.setAttribute('aria-pressed',name===selectedSession?'true':'false');
      button.setAttribute('aria-label',s?name+' countdown, '+fmtDay(s.dateStart)+' '+fmtHour(s.dateStart):name+' time to be confirmed');
      const title=document.createElement('span');
      title.textContent=code;
      const time=document.createElement('b');
      time.textContent=s?fmtHour(s.dateStart):'—';
      const weekday=document.createElement('small');
      weekday.textContent=s?new Intl.DateTimeFormat('en-AU',{timeZone:TZ,weekday:'short'}).format(new Date(s.dateStart)):'TBC';
      button.append(title,time,weekday);
      holder.append(button);
    }
  }
  function refreshHero(){
    if(st.tab!=='home')return;
    const hero=document.querySelector('.v6-race-hero');
    const r=findRace();
    if(!hero||!r)return;
    hero.dataset.v6ActiveRound=String(r.round);
    const title=hero.querySelector('.v6-hero-info h1');
    const location=hero.querySelector('.v6-flag-title');
    const start=hero.querySelector('.v6-hero-info p');
    const topline=hero.querySelector('.v6-topline>span');
    const round=hero.querySelector('.v6-topline>b');
    if(title)title.innerHTML=safe(r.short)+'<small>GRAND PRIX</small>';
    if(location)location.innerHTML=v4Flag(r)+' <span>'+safe(r.location)+'</span>';
    if(start)start.textContent=fmtDay(r.race)+' · '+fmtHour(r.race)+' Adelaide';
    if(topline)topline.innerHTML='<i></i> '+(selectedRound!==null?'SELECTED WEEKEND':raceDate(r.race)>Date.now()?'NEXT RACE':'LATEST RACE');
    if(round)round.textContent='ROUND '+pad2(r.round);
    const circuitButton=hero.querySelector('.v6-hero-circuit');
    if(circuitButton){
      circuitButton.dataset.v4Race=String(r.round);
      circuitButton.setAttribute('aria-label','Open '+r.short+' circuit details');
      if(typeof v41CircuitSvg==='function')
        circuitButton.innerHTML=v41CircuitSvg(r,'v6-map-svg')+'<small>CIRCUIT GUIDE ↗</small>';
    }
    const weekendButton=hero.querySelector('.v6-primary');
    if(weekendButton)weekendButton.dataset.v4Race=String(r.round);
    const clock=hero.querySelector('.v6-clock-row');
    if(clock){
      const units=clock.querySelectorAll('.v6-clock-cell b');
      ['days','hours','mins'].forEach((kind,i)=>{if(units[i])units[i].dataset.v6Countdown=kind;});
      if(!clock.querySelector('[data-v6-countdown="secs"]')){
        const div=document.createElement('div');
        div.className='v6-clock-cell';
        div.innerHTML='<b data-v6-countdown="secs">00</b><span>SECS</span>';
        clock.insertBefore(div,clock.querySelector('.v6-clock-note'));
      }
      if(!hero.querySelector('.v6-countdown-context')){
        const tag=document.createElement('div');
        tag.className='v6-countdown-context';
        tag.innerHTML='<span>COUNTDOWN TO</span><strong>RACE · ADELAIDE TIME</strong>';
        clock.before(tag);
      }
    }
    drawSessions(r,hero);
    const strips=document.querySelectorAll('.v6-flag-item[data-v4-race],.v6-flag-item[data-v6-pick-race]');
    for(const el of strips){
      const num=Number(el.getAttribute('data-v4-race')||el.getAttribute('data-v6-pick-race'));
      el.removeAttribute('data-v4-race');
      el.dataset.v6PickRace=String(num);
      const active=num===r.round;
      el.classList.toggle('on',active);
      el.setAttribute('aria-pressed',active?'true':'false');
      el.setAttribute('aria-label','Count down to '+(data.races.find(x=>x.round===num)?.short||'Grand Prix'));
    }
    updateClock();
  }
  function enhanceCalendar(){
    if(st.tab!=='calendar')return;
    const cards=document.querySelectorAll('.racecard');
    for(const card of cards){
      const trigger=card.querySelector('[data-race]');
      if(!trigger)continue;
      const r=data.races.find(x=>x.round===Number(trigger.dataset.race));
      if(!r)continue;
      const rows=card.querySelectorAll('.raceinner .schedule');
      const sessions=scheduleFor(r);
      rows.forEach((row,i)=>{
        const slot=sessions[i];
        if(!slot||!raceDate(slot.dateStart)||row.querySelector('.v6-go-countdown'))return;
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='v6-go-countdown';
        btn.dataset.v6GoRound=String(r.round);
        btn.dataset.v6GoSession=slot.name;
        btn.textContent='COUNTDOWN ↗';
        btn.setAttribute('aria-label','Show countdown for '+r.short+' '+slot.name);
        row.append(btn);
      });
    }
  }
  function onTap(event){
    const session=event.target.closest('[data-v6-session]');
    if(session && !session.disabled){
      event.preventDefault();event.stopImmediatePropagation();
      selectedSession=session.dataset.v6Session;
      refreshHero();
      window.dispatchEvent(new CustomEvent('pitwall:selection-changed'));
      return;
    }
    const race=event.target.closest('[data-v6-pick-race]');
    if(race){
      event.preventDefault();event.stopImmediatePropagation();
      const round=Number(race.dataset.v6PickRace);
      if(!data.races.some(r=>r.round===round))return;
      selectedRound=round;
      selectedSession='Race';
      refreshHero();
      window.dispatchEvent(new CustomEvent('pitwall:selection-changed'));
      document.querySelector('.v6-race-hero')?.scrollIntoView({block:'start',behavior:'smooth'});
      return;
    }
    const fromCalendar=event.target.closest('[data-v6-go-round]');
    if(fromCalendar){
      event.preventDefault();event.stopImmediatePropagation();
      selectedRound=Number(fromCalendar.dataset.v6GoRound);
      selectedSession=fromCalendar.dataset.v6GoSession||'Race';
      st.tab='home';
      render();
      window.dispatchEvent(new CustomEvent('pitwall:selection-changed'));
      window.scrollTo({top:0,behavior:'instant'});
    }
  }
  const previousRender=render;
  render=function(){
    const result=previousRender.apply(this,arguments);
    refreshHero();
    enhanceCalendar();
    return result;
  };
  document.addEventListener('click',onTap,true);
  setInterval(updateClock,1000);
  refreshHero();
  enhanceCalendar();
})();
