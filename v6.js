/* PITWALL V6 — screen redesign. Existing season/game/data storage remain untouched. */
'use strict';
(function(){
  const esc = safe;
  const longDate = iso=>new Intl.DateTimeFormat('en-AU',{timeZone:TZ,day:'numeric',month:'long',year:'numeric'}).format(new Date(iso));
  const shortDay = iso=>new Intl.DateTimeFormat('en-AU',{timeZone:TZ,weekday:'short',day:'numeric',month:'short'}).format(new Date(iso));
  const n2 = n=>String(n).padStart(2,'0');
  function circuit(r, cls='v6-map-svg') {
    if(typeof v41CircuitSvg==='function')return v41CircuitSvg(r,cls);
    return `<svg viewBox="0 0 360 230" class="${cls}" aria-label="Schematic circuit outline"><path d="${v2Schematic(r).d}" fill="none" stroke="white" stroke-width="8"/></svg>`;
  }
  function nearest(){return sortedRaces().find(r=>Date.parse(r.race)>Date.now())||sortedRaces().at(-1);}
  function sessionGrid(r){let times=scheduleFor(r), categories=[['FP1','Practice 1'],['FP2','Practice 2'],['FP3','Practice 3'],['QUALI','Qualifying'],['RACE','Race']];
    if(r.sprint)categories=[['FP1','Practice 1'],['SQ','Sprint Qualifying'],['SPRINT','Sprint'],['QUALI','Qualifying'],['RACE','Race']];
    return categories.map(([short,type])=>{let s=times.find(s=>s.name===type||((type==='Qualifying')&&(/Qualifying/i.test(s.name)&&!/Sprint/i.test(s.name))));if(!s&&type==='Race')s={dateStart:r.race};return `<div class="v6-session ${type==='Race'?'is-race':''}"><span>${esc(short)}</span><b>${s?fmtHour(s.dateStart):'—'}</b><small>${s?new Intl.DateTimeFormat('en-AU',{timeZone:TZ,weekday:'short'}).format(new Date(s.dateStart)):'TBC'}</small></div>`;}).join('');
  }
  function raceHeader(r){const future=Date.parse(r.race)>Date.now();const ms=Math.max(0,Date.parse(r.race)-Date.now());return `<section class="v6-race-hero" aria-label="Next Grand Prix">
    <div class="v6-hero-sheen"></div>
    <div class="v6-topline"><span><i></i> ${future?'NEXT RACE':'LATEST RACE'}</span><b>ROUND ${n2(r.round)}</b></div>
    <div class="v6-hero-main"><div class="v6-hero-info"><div class="v6-flag-title">${v4Flag(r)} <span>${esc(r.location)}</span></div><h1>${esc(r.short)}<small>GRAND PRIX</small></h1><p>${shortDay(r.race)} · ${fmtHour(r.race)} Adelaide</p></div><button type="button" data-v4-race="${r.round}" class="v6-hero-circuit" aria-label="Open ${esc(r.short)} race details">${circuit(r)}<small>CIRCUIT GUIDE ↗</small></button></div>
    <div class="v6-clock-row"><div class="v6-clock-cell"><b>${n2(Math.floor(ms/86400000))}</b><span>DAYS</span></div><div class="v6-clock-cell"><b>${n2(Math.floor(ms/3600000)%24)}</b><span>HOURS</span></div><div class="v6-clock-cell"><b>${n2(Math.floor(ms/60000)%60)}</b><span>MINS</span></div><div class="v6-clock-note"><strong>${future?'LIGHTS OUT':'FINISHED'}</strong><span>${future?'Adelaide local time':'View race history'}</span></div></div>
    <div class="v6-session-caption">WEEKEND TIMETABLE <small>ADELAIDE TIME</small></div><div class="v6-sessions">${sessionGrid(r)}</div>
    <div class="v6-hero-buttons"><button type="button" class="v6-primary" data-v4-race="${r.round}">RACE WEEKEND ↗</button><a href="${KAYO}" target="_blank" rel="noopener noreferrer">WATCH ON KAYO ↗</a></div>
    </section>`;
  }
  function raceStrip(){const ahead=sortedRaces().filter(r=>Date.parse(r.race)>Date.now());const items=(ahead.length?ahead:sortedRaces().slice(-7)).slice(0,9);
   return `<section class="v6-races-block"><div class="v6-section-title"><div><span>UP NEXT</span><h2>Race calendar</h2></div><button data-action="go-calendar">VIEW ALL →</button></div><div class="v6-flags-strip">${items.map((r,i)=>`<button class="v6-flag-item ${i===0?'on':''}" type="button" data-v4-race="${r.round}"><span class="v6-flag-icon">${v4Flag(r)}</span><b>${esc(r.short==='Great Britain'?'Britain':r.short==='São Paulo'?'Brazil':r.short)}</b><small>${v4Day(r)}</small></button>`).join('')}</div></section>`;}
  function podiumWidget(){const d=typeof v3Favourite==='function'?v3Favourite():data.drivers[0];return `<section class="v6-fave-panel" style="--v6-team:${teamColour(d.team)}"><div class="v6-fave-top"><span>YOUR FAVOURITE DRIVER</span><button data-action="go-settings">CUSTOMISE ↗</button></div><button class="v6-fave-body" data-v4-driver="${esc(d.code)}"><div class="v6-fave-art">${v4Avatar(d,'v6-fave-avatar') }</div><div class="v6-fave-copy"><small>${v41TeamBadge(d.team)} ${esc(d.team)}</small><h2>${esc(d.last.toUpperCase())}</h2><span>${esc(d.first)} ${esc(d.last)}</span></div><div class="v6-fave-pos"><b>P${esc(d.position)}</b><small>${esc(d.points)} PTS</small></div></button></section>`;}
  const oldHome=home;
  home=function(){const r=nearest();return `<section class="main-tab v6-home"><div class="v6-home-top"><span class="v6-mini-strap">THE PADDOCK · ${YEAR} SEASON</span><span class="v6-home-dot">${data.online?'● ONLINE':'◌ SAVED DATA'}</span></div>${raceHeader(r)}${raceStrip()}${v4Ladder()}${podiumWidget()}${typeof v42WeatherMarkup==='function'?v42WeatherMarkup(r,'home'):''}<div class="v6-career-teaser"><div><span>CAREER MODE</span><h2>${career?esc(career.name):'Write your own story.'}</h2><p>${career?esc(stages[career.stage]+' · '+career.team):'Karting → Formula 1. Your choices, your legacy.'}</p></div><button data-action="go-career">PLAY →</button></div>${sourceFooter()}</section>`;};
  const oldStandings=standings;
  standings=function(){let content=oldStandings();return content.replace('<section class="main-tab"','<section class="main-tab v6-standings"').replace('<section class="main-tab v4','<section class="main-tab v6');};
  const oldCalendar=calendar;
  calendar=function(){return oldCalendar().replace('<section class="main-tab"','<section class="main-tab v6-calendar"');};
  const oldCareer=careerPage;
  careerPage=function(){let html=oldCareer();if(!career)return html.replace('<section class="main-tab"','<section class="main-tab v6-career-setup"');
    const team=teamColour(career.team)||'#f43f54';const banner=`<div class="v6-driver-header" style="--v6-team:${team}"><div class="v6-driver-tag">YOUR CAREER <span>${esc(stages[career.stage])}</span></div><div class="v6-driver-row"><div class="v6-driver-bust"><svg viewBox="0 0 40 44" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="44" fill="#1a2b3d"/><path d="M5 44V33H35V44" fill="${team}"/><path d="M11 26h18v10H11" fill="#bb8261"/><path d="M9 10h22v17H9" fill="#d69c79"/><path d="M9 8h22v7H9" fill="#33251e"/><path d="M14 18h4v2h-4M23 18h4v2h-4M18 28h6v1h-6" fill="#211c20"/></svg></div><div class="v6-driver-data"><h2>${esc(career.name)}</h2><p>${esc(career.team)} · WEEK ${career.week}</p><strong>OVR ${myPace()}</strong></div></div><div class="v6-condition-meters">${[['ENERGY',career.energy,'#f6a237'],['MORALE',career.morale,'#61d7a1'],['FITNESS',career.fitness,'#54b4e5']].map(([k,v,c])=>`<div><span>${k}</span><div class="v6-meter"><i style="width:${Math.max(0,Math.min(100,v))}%;background:${c}"></i></div><b>${v}%</b></div>`).join('')}</div><div class="v6-driver-bottom"><div><b>${fmtMoney(career.cash)}</b><small>BALANCE</small></div><div><b>${career.reputation}</b><small>REPUTATION</small></div><div><b>${career.skillPoints}</b><small>SKILL PTS</small></div></div></div>`;
    html=html.replace('<section class="main-tab"','<section class="main-tab v6-career"');html=html.replace('<div class="sectionhead">',banner+'<div class="sectionhead v6-hidden-title">');return html;
  };
  const prevRender=render;
  render=function(...args){const v=prevRender(...args); document.title='PITWALL V6.5 — Custom Art Test';document.querySelector('.topbar .brand > span')?.replaceChildren();const brand=document.querySelector('.topbar .brand > span');if(brand)brand.innerHTML='PIT<span>WALL</span><small>V6.5</small>'; 
    const v6badge=document.querySelector('.v41-version');if(v6badge)v6badge.textContent='V6.5';
    document.querySelectorAll('.v521-settings-version').forEach(e=>{e.textContent='✓ V6.5';e.setAttribute('aria-label','App version 6');});
    if(st.tab==='settings'){
      const section=document.querySelector('#app .main-tab');if(section){const b=document.createElement('div');b.className='v6-settings-intro';b.innerHTML='<strong>Make it yours.</strong><span>Driver art, race widgets and reminders — all in one place.</span>';section.prepend(b);}
    }
    return v;
  };
  render();
})();
