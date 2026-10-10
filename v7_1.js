/* PITWALL V7.1 — screenshot-inspired calendar, track guide and driver archive. */
'use strict';
(function(){
  let openRace=null;
  let raceTab='overview';
  let driverTab='overview';
  let lastTab='home';
  const FLAGS={
    Australia:['au','🇦🇺'],China:['cn','🇨🇳'],Japan:['jp','🇯🇵'],Bahrain:['bh','🇧🇭'],
    'Saudi Arabia':['sa','🇸🇦'],Miami:['us','🇺🇸'],Canada:['ca','🇨🇦'],Monaco:['mc','🇲🇨'],
    'Barcelona-Catalunya':['es','🇪🇸'],Austria:['at','🇦🇹'],'Great Britain':['gb','🇬🇧'],
    Belgium:['be','🇧🇪'],Hungary:['hu','🇭🇺'],Netherlands:['nl','🇳🇱'],Italy:['it','🇮🇹'],
    Spain:['es','🇪🇸'],Azerbaijan:['az','🇦🇿'],'Bahrain in Malaysia':['my','🇲🇾'],
    Singapore:['sg','🇸🇬'],'United States':['us','🇺🇸'],Mexico:['mx','🇲🇽'],
    'São Paulo':['br','🇧🇷'],'Las Vegas':['us','🇺🇸'],Qatar:['qa','🇶🇦'],'Abu Dhabi':['ae','🇦🇪']
  };
  const TRACK={
    Australia:'albert_park',China:'shanghai',Japan:'suzuka',Bahrain:'bahrain',
    'Saudi Arabia':'jeddah',Miami:'miami',Canada:'villeneuve',Monaco:'monaco',
    'Barcelona-Catalunya':'catalunya',Austria:'red_bull_ring','Great Britain':'silverstone',
    Belgium:'spa',Hungary:'hungaroring',Netherlands:'zandvoort',Italy:'monza',
    Azerbaijan:'baku',Singapore:'marina_bay','United States':'americas',Mexico:'rodriguez',
    'São Paulo':'interlagos','Las Vegas':'vegas',Qatar:'losail','Abu Dhabi':'yas_marina'
  };
  const CIRCUIT={
    Australia:[58,'5.278','306.124'],China:[56,'5.451','305.066'],Japan:[53,'5.807','307.471'],
    Miami:[57,'5.412','308.326'],Canada:[70,'4.361','305.270'],Monaco:[78,'3.337','260.286'],
    'Barcelona-Catalunya':[66,'4.657','307.236'],Austria:[71,'4.318','306.452'],
    'Great Britain':[52,'5.891','306.198'],Belgium:[44,'7.004','308.052'],
    Hungary:[70,'4.381','306.630'],Netherlands:[72,'4.259','306.587'],
    Italy:[53,'5.793','306.720'],Azerbaijan:[51,'6.003','306.049'],
    Singapore:[62,'4.940','306.143'],'United States':[56,'5.513','308.405'],
    Mexico:[71,'4.304','305.354'],'São Paulo':[71,'4.309','305.879'],
    'Las Vegas':[50,'6.201','309.958'],Qatar:[57,'5.419','308.611'],
    'Abu Dhabi':[58,'5.281','306.183']
  };
  const BIO={
    ANT:['it','🇮🇹','Italian','12'],RUS:['gb','🇬🇧','British','63'],HAM:['gb','🇬🇧','British','44'],
    LEC:['mc','🇲🇨','Monegasque','16'],NOR:['gb','🇬🇧','British','4'],VER:['nl','🇳🇱','Dutch','1'],
    PIA:['au','🇦🇺','Australian','81'],HAD:['fr','🇫🇷','French','6'],LAW:['nz','🇳🇿','New Zealander','30'],
    GAS:['fr','🇫🇷','French','10'],LIN:['gb','🇬🇧','British',null],COL:['ar','🇦🇷','Argentine','43'],
    BEA:['gb','🇬🇧','British','87'],BOR:['br','🇧🇷','Brazilian','5'],HUL:['de','🇩🇪','German','27'],
    OCO:['fr','🇫🇷','French','31'],ALO:['es','🇪🇸','Spanish','14'],SAI:['es','🇪🇸','Spanish','55'],
    ALB:['th','🇹🇭','Thai','23'],TSU:['jp','🇯🇵','Japanese','22'],STR:['ca','🇨🇦','Canadian','18'],
    BOT:['fi','🇫🇮','Finnish','77'],PER:['mx','🇲🇽','Mexican','11']
  };
  function flag(code,emoji,cls='v71-flag'){
    const fallback=safe(emoji||'🏁');
    return code?'<span class="'+cls+'"><img src="https://flagcdn.com/'+code+'.svg" alt="" loading="lazy" referrerpolicy="no-referrer" data-v71-flag><span class="v71-flag-fallback" hidden>'+fallback+'</span></span>':
      '<span class="'+cls+'"><span>'+fallback+'</span></span>';
  }
  function country(r){return FLAGS[r.short]||FLAGS[String(r.name||'').replace(/ Grand Prix$/,'')]||[null,'🏁'];}
  function mapImg(r,cls){
    const id=TRACK[r.short];
    return id?'<img class="'+cls+'" src="./assets/circuits/'+id+'.svg" alt="Actual layout outline of '+safe(r.location)+' circuit" loading="lazy" data-v71-circuit>':
      '<span class="v71-map-unavailable">VERIFIED CIRCUIT OUTLINE NOT AVAILABLE</span>';
  }
  function day(r){return new Intl.DateTimeFormat('en-AU',{timeZone:TZ,day:'numeric',month:'short',year:'numeric'}).format(new Date(r.race));}
  function stamp(iso){const d=new Date(iso);return isNaN(d.getTime())?'TBC':new Intl.DateTimeFormat('en-AU',{timeZone:TZ,weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(d);}
  function weekend(r){const items=scheduleFor(r);return items.filter(s=>s?.dateStart && !isNaN(Date.parse(s.dateStart)));}
  function sessionShort(name){return ({'Practice 1':'FP1','Practice 2':'FP2','Practice 3':'FP3','Sprint Qualifying':'SQ','Sprint':'Sprint','Qualifying':'Quali','Race':'Race'})[name]||name;}
  function schedule(r,detail){
    const sessions=weekend(r);
    const order=['Practice 1','Practice 2','Practice 3','Sprint Qualifying','Sprint','Qualifying','Race'];
    const names=order.filter(n=>n==='Race'||sessions.some(s=>s.name===n));
    return names.map(name=>{
      const s=sessions.find(x=>x.name===name);
      const time=s?stamp(s.dateStart):'TBC';
      if(detail)return '<div class="v71-schedule-row"><span class="v71-session-name">'+safe(sessionShort(name))+'</span><span class="v71-session-clock">'+safe(time)+'</span><button type="button" data-v6-go-round="'+r.round+'" data-v6-go-session="'+safe(name)+'" class="v71-session-action">'+(Date.parse(s?.dateStart||r.race)<Date.now()?'RESULTS':'COUNTDOWN')+' ↗</button></div>';
      return '<div class="v71-mini-session"><b>'+safe(sessionShort(name))+'</b><span>'+safe(time)+'</span></div>';
    }).join('');
  }
  function raceCard71(r){
    const [iso,emoji]=country(r);
    return '<article class="v71-race-card"><button type="button" class="v71-card-open" data-v71-race="'+r.round+'" aria-label="Open '+safe(r.name)+'">'+
      flag(iso,emoji)+
      '<span class="v71-card-text"><strong>R'+String(r.round).padStart(2,'0')+' · '+safe(day(r))+'</strong>'+
      '<b>'+safe(r.location)+' · '+safe(r.short)+'</b><span>'+safe(r.name)+'</span>'+
      '<span class="v71-mini-sessions">'+schedule(r,false)+'</span></span>'+
      '<span class="v71-card-track">'+mapImg(r,'v71-outline')+'</span>'+
      '<span class="v71-chevron" aria-hidden="true">›</span></button></article>';
  }
  function raceDetail(r){
    const [iso,emoji]=country(r);
    const s=CIRCUIT[r.short]||[null,null,null];
    const off=typeof v3GetOfficialImage==='function'?v3GetOfficialImage(r):'';
    const panel=off&&raceTab==='overview'?'<img src="'+safe(off)+'" class="v71-official-map" alt="Formula 1 circuit artwork for '+safe(r.location)+'" loading="lazy" referrerpolicy="no-referrer" data-v71-official>':
      mapImg(r,'v71-detailed-outline');
    const map='<div class="v71-race-map"><div class="v71-grid-decor"></div><div class="v71-map-title">TRACK / '+safe(r.location.toUpperCase())+'</div>'+panel+
      '<div class="v71-map-caption">'+(off&&raceTab==='overview'?'CIRCUIT IMAGE VIA OPENF1 / F1 MEDIA':'CIRCUIT OUTLINE / CC0 TRACK ART')+'</div></div>';
    const tabs=['overview','track','live'];
    const tabLabels=['Overview','Track Map','Live (Race Day)'];
    const statTiles='<div class="v71-track-stats">'+[['LAPS',s[0]],['LENGTH',s[1]&&s[1]+' km'],['RACE DISTANCE',s[2]&&s[2]+' km']].map(([label,value])=>
      '<div><span>'+label+'</span><b>'+safe(value??'—')+'</b></div>').join('')+'</div>';
    const streaming='<div class="v71-stream"><div class="v71-stream-label">WATCH / OFFICIAL LINKS</div>'+
       '<a href="'+KAYO+'" target="_blank" rel="noopener noreferrer" class="v71-kayo">Watch on Kayo ↗</a>'+
       '<a href="'+safe(v3F1RaceUrl(r))+'" target="_blank" rel="noopener noreferrer">Official F1 race page ↗</a></div>';
    let content='';
    if(raceTab==='overview')content=map+statTiles+'<section class="v71-weekend"><h3>Weekend schedule <small>ADELAIDE TIME</small></h3>'+schedule(r,true)+'</section>'+streaming;
    if(raceTab==='track')content=map+statTiles+'<p class="v71-detail-note">Circuit outlines are sourced from an open CC0 collection. Track layout and official distance may change; check the official race page for the latest details.</p>'+
      '<a class="v71-info-link" href="'+safe(v3F1RaceUrl(r))+'" target="_blank" rel="noopener noreferrer">Explore circuit on F1.com ↗</a>';
    if(raceTab==='live')content='<section class="v71-live-box"><div class="v71-live-icon">◉</div><h3>Race-day timing</h3><p>Follow the Grand Prix in PITWALL’s Live Timing tab. Session availability depends on Formula 1 Dashboard.</p>'+
      (window.pitwallFeatures?.liveTiming!==false?'<button type="button" data-v71-live-nav>OPEN LIVE TIMING ↗</button>':'<p>Enable Live Timing from Settings to show its tab.</p>')+
      '</section><section class="v71-weekend"><h3>Weekend schedule <small>ADELAIDE TIME</small></h3>'+schedule(r,true)+'</section>';
    return '<section class="main-tab v71-calendar-page v71-race-detail">'+
      '<button class="v71-back" type="button" data-v71-back>‹ <span>Calendar</span></button>'+
      '<div class="v71-race-detail-header">'+flag(iso,emoji,'v71-flag v71-flag-large')+
      '<div><h1>'+safe(r.name)+'</h1><p>'+safe(r.location)+' · Round '+r.round+' · '+safe(day(r))+'</p></div></div>'+
      '<div class="v71-detail-tabs" role="tablist" aria-label="Race details">'+tabs.map((t,i)=>
      '<button role="tab" aria-selected="'+String(t===raceTab)+'" class="'+(t===raceTab?'active':'')+'" data-v71-race-tab="'+t+'">'+tabLabels[i]+'</button>').join('')+'</div>'+
      content+'<p class="v71-sources">Track outlines: <a href="https://github.com/MasterPlay007/F1-Track-Layouts-SVG" target="_blank" rel="noopener noreferrer">CC0 circuit layouts</a>. Real SVG country flags: <a href="https://flagcdn.com/" target="_blank" rel="noopener noreferrer">FlagCDN</a>. Times shown in Adelaide; check the official timetable.</p></section>';
  }
  const originalCalendar=calendar;
  calendar=function(){
    if(openRace!==null){
      const r=data.races.find(x=>x.round===openRace);
      if(r)return raceDetail(r);
      openRace=null;
    }
    const races=sortedRaces().filter(r=>st.filter!=='upcoming'||!started(r));
    return '<section class="main-tab v71-calendar-page"><div class="v71-calendar-heading"><div><span>2026 FORMULA 1 WORLD CHAMPIONSHIP</span><h2>Calendar</h2></div>'+
      '<small>ADELAIDE TIME</small></div>'+
      '<div class="v71-cal-filter" role="group" aria-label="Choose races">'+
      '<button type="button" data-v71-filter="upcoming" class="'+(st.filter==='upcoming'?'active':'')+'">Upcoming</button>'+
      '<button type="button" data-v71-filter="all" class="'+(st.filter!=='upcoming'?'active':'')+'">All Races</button></div>'+
      '<div class="v71-race-list">'+(races.length?races.map(raceCard71).join(''):'<div class="v71-no-races">No upcoming races. View All Races to browse the season.</div>')+'</div>'+
      '<p class="v71-sources">Real country flags via FlagCDN · CC0 circuit layouts · All times in Adelaide. Changes to the official weekend timetable may take time to reach PITWALL.</p></section>';
  };
  function moveDriverElements(code){
    const shade=document.querySelector('.v44-driver-shade');
    if(!shade)return;
    const modal=shade.querySelector('.v44-driver-modal');
    const d=data.drivers.find(x=>x.code===code);
    if(!modal||!d||modal.classList.contains('v71-profile-ready'))return;
    modal.classList.add('v71-profile-ready');
    const originalHeader=modal.querySelector('.v44-driver-header');
    const originalBody=modal.querySelector('.v44-archive-body');
    const originalAvatar=modal.querySelector('.v44-driver-pixel');
    const grid=modal.querySelector('.v44-career-grid');
    const status=modal.querySelector('.v44-data-status');
    const gallery=modal.querySelector('.v69-gallery');
    const nationality=BIO[code]||[null,'🏁','—',null];
    const career=V41_DRIVER_HISTORY[code]||{};
    const number=nationality[3]||'—';
    const popup=modal.querySelector('.v4-close');
    if(popup)popup.remove();
    const navTop=document.createElement('div');
    navTop.className='v71-profile-navbar';
    navTop.innerHTML='<button type="button" data-v4-close aria-label="Close driver profile">‹</button><strong>DRIVERS</strong><span>✦</span>';
    modal.prepend(navTop);
    originalHeader.classList.add('v71-profile-hero');
    originalHeader.innerHTML='<div class="v71-driver-visual"></div>'+
      '<div class="v71-driver-ident"><span>'+safe(d.first)+'</span><h2 id="v44-title">'+safe(d.last.toUpperCase())+'</h2>'+
      '<div class="v71-nationality">'+flag(nationality[0],nationality[1],'v71-flag v71-driver-flag')+'<span>'+safe(nationality[2])+'</span></div>'+
      '<button type="button" data-v43-team="'+safe(d.team)+'" class="v71-driver-team">'+v41TeamBadge(d.team)+'<span>'+safe(d.team)+'</span></button></div>'+
      '<b class="v71-driver-number">'+safe(number)+'</b>';
    if(originalAvatar)originalHeader.querySelector('.v71-driver-visual').append(originalAvatar);
    const tabbar=document.createElement('div');
    tabbar.className='v71-driver-tabs';
    tabbar.setAttribute('role','tablist');
    tabbar.setAttribute('aria-label','Driver profile sections');
    tabbar.innerHTML=['overview','stats','career','history'].map(t=>
      '<button type="button" role="tab" data-v71-profile-tab="'+t+'" aria-selected="'+String(t==='overview')+'" class="'+(t==='overview'?'active':'')+'">'+t.charAt(0).toUpperCase()+t.slice(1)+'</button>').join('');
    const sections=document.createElement('div');
    sections.className='v71-driver-panels';
    sections.innerHTML='<section data-v71-driver-panel="overview" class="v71-driver-panel">'+
      '<div class="v71-driver-stat-tiles">'+[['POSITION','P'+d.position],['POINTS',d.points],['WINS',d.wins],['PODIUMS',v44Cached[code]?.data?.podiums??'—']].map(([l,v])=>
      '<div><small>'+l+'</small><b '+(l==='PODIUMS'?'data-v71-podiums':'')+'>'+safe(v)+'</b></div>').join('')+'</div>'+
      '<div class="v71-info-table"><h3>Driver Information</h3>'+
      [['Full name',d.first+' '+d.last],['Nationality',nationality[2]],['Team',d.team],['Driver number',number]].map(([l,v])=>
      '<div><span>'+safe(l)+'</span><strong>'+safe(v)+'</strong></div>').join('')+'</div></section>'+
      '<section data-v71-driver-panel="stats" class="v71-driver-panel" hidden><h3>Career statistics</h3><div data-v71-grid-holder></div><p class="v71-detail-note">Career totals from the results archive. Unavailable values are shown as a dash.</p></section>'+
      '<section data-v71-driver-panel="career" class="v71-driver-panel" hidden><h3>Career journey</h3>'+
      '<p>'+safe(career.line||'Formula 1 driver')+'</p><div class="v71-career-strip"><div><small>F1 DEBUT</small><b>'+safe(v44FirstSeason(career,code))+'</b></div><div><small>TEAM</small><b>'+safe(d.team)+'</b></div></div></section>'+
      '<section data-v71-driver-panel="history" class="v71-driver-panel" hidden><h3>Driver history</h3><p>'+safe(career.bio||'Read more about this driver through the official Formula 1 archive.')+'</p>'+
      '<a class="v71-info-link" href="https://en.wikipedia.org/wiki/'+encodeURIComponent((career.wiki||d.first+' '+d.last).replaceAll(' ','_'))+'" target="_blank" rel="noopener noreferrer">READ DRIVER HISTORY ↗</a></section>';
    if(grid)sections.querySelector('[data-v71-grid-holder]').append(grid);
    if(status)sections.querySelector('[data-v71-grid-holder]').append(status);
    originalBody.remove();
    modal.append(tabbar,sections);
    if(gallery){gallery.classList.add('v71-profile-gallery');modal.append(gallery);}
    driverTab='overview';
    const promise=v44LoadDriver(code);
    if(promise?.then)promise.then(()=>{const el=modal.querySelector('[data-v71-podiums]');if(el)el.textContent=v44Cached[code]?.data?.podiums??'—';});
  }
  const previousDriver=v4ShowDriver;
  v4ShowDriver=function(code){
    previousDriver(code);
    moveDriverElements(code);
  };
  const prevRender=render;
  render=function(){
    if(lastTab==='calendar' && st.tab!=='calendar'){openRace=null;raceTab='overview';}
    lastTab=st.tab;
    return prevRender.apply(this,arguments);
  };
  document.addEventListener('error',event=>{
    const img=event.target;
    if(img?.matches?.('img[data-v71-flag]')){
      img.hidden=true;
      const text=img.parentElement?.querySelector('.v71-flag-fallback');
      if(text)text.hidden=false;
    }
    if(img?.matches?.('img[data-v71-circuit],img[data-v71-official]')){
      img.style.display='none';
      const card=img.closest('.v71-race-map,.v71-card-track');
      if(card && !card.querySelector('.v71-map-unavailable')){
        const msg=document.createElement('span');msg.className='v71-map-unavailable';msg.textContent='CIRCUIT IMAGE UNAVAILABLE';card.append(msg);
      }
    }
  },true);
  document.addEventListener('click',event=>{
    const btn=event.target.closest('[data-v71-race],[data-v71-filter],[data-v71-back],[data-v71-race-tab],[data-v71-profile-tab],[data-v71-live-nav]');
    if(!btn)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(btn.hasAttribute('data-v71-filter')){
      st.filter=btn.dataset.v71Filter;openRace=null;raceTab='overview';render();
    }else if(btn.hasAttribute('data-v71-race')){
      openRace=Number(btn.dataset.v71Race);raceTab='overview';render();window.scrollTo(0,0);
    }else if(btn.hasAttribute('data-v71-back')){
      openRace=null;raceTab='overview';render();window.scrollTo(0,0);
    }else if(btn.hasAttribute('data-v71-race-tab')){
      raceTab=btn.dataset.v71RaceTab;render();window.scrollTo(0,0);
    }else if(btn.hasAttribute('data-v71-profile-tab')){
      driverTab=btn.dataset.v71ProfileTab;
      const dialog=btn.closest('.v71-profile-ready');
      if(!dialog)return;
      dialog.querySelectorAll('[data-v71-profile-tab]').forEach(el=>{
        const active=el.dataset.v71ProfileTab===driverTab;el.classList.toggle('active',active);el.setAttribute('aria-selected',String(active));
      });
      dialog.querySelectorAll('[data-v71-driver-panel]').forEach(el=>{el.hidden=el.dataset.v71DriverPanel!==driverTab;});
    }else if(btn.hasAttribute('data-v71-live-nav'))nav('timing');
  },true);
  render();
})();
