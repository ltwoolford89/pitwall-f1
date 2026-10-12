/* PITWALL V7.2 — circuit weather and qualifying/sprint-informed fan forecasts.
   Weather: Open-Meteo; session classifications: OpenF1.
   No fabricated times or classifications, no wagering or betting. */
'use strict';
(function(){
  const weatherCache=new Map();
  const weatherInflight=new Map();
  const predictionCache=new Map();
  const predictionInflight=new Map();
  let sessionsPromise=null;
  let observer=null;
  const latestTime=()=>Date.now();
  const nextSession=name=>String(name||'').trim().toLowerCase().replace(/\s+/g,' ');
  const parseTime=iso=>Date.parse(iso||'');
  const isValid=ms=>Number.isFinite(ms);
  const esc=value=>safe(value);
  function findRace(round){return data.races.find(r=>r.round===Number(round));}
  function sessionItems(r){
    const from=typeof scheduleFor==='function'?scheduleFor(r):[];
    return Array.isArray(from)?from.filter(s=>isValid(parseTime(s.dateStart))):[];
  }
  function weatherKey(r){return String(r.round)+'|'+String(r.race);}
  function weatherMode(r){
    if(typeof v42Spot!=='function'||!v42Spot(r))return 'no-location';
    const age=(parseTime(r.race)-latestTime())/86400000;
    if(!isValid(age))return 'not-scheduled';
    if(age>14.9)return 'too-early';
    if(age>=-0.5)return 'forecast';
    if(age > -7)return 'archive-pending';
    return 'archive';
  }
  function weatherText(r,view){
    const mode=weatherMode(r);
    if(mode==='no-location')return 'Circuit forecast location not available';
    if(mode==='not-scheduled')return 'Weather pending · date TBC';
    if(mode==='too-early')return view==='short'?'Forecast nearer race':'Detailed circuit forecast appears within approximately two weeks of race day';
    if(mode==='archive-pending')return view==='short'?'Archive pending':'Historical weather generally appears several days after the race';
    return mode==='archive'?'Loading historical circuit weather…':'Loading circuit forecast…';
  }
  function getSnapshot(r,iso){
    const cached=weatherCache.get(weatherKey(r));
    if(!cached?.hourly?.time?.length)return null;
    const target=parseTime(iso);
    if(!isValid(target))return null;
    let idx=-1,minimum=Number.POSITIVE_INFINITY;
    const hourly=cached.hourly;
    for(let i=0;i<hourly.time.length;i++){
      const ts=parseTime(hourly.time[i]+'Z'),diff=Math.abs(ts-target);
      if(isValid(diff)&&diff<minimum){minimum=diff;idx=i;}
    }
    if(idx<0||minimum>65*60000)return null;
    const number=x=>Number.isFinite(Number(x))&&x!==null?Math.round(Number(x)):null;
    return {temp:number(hourly.temperature_2m?.[idx]),rain:cached.type==='forecast'?number(hourly.precipitation_probability?.[idx]):null,
      rainfall:cached.type==='archive'?Number(hourly.precipitation?.[idx]):null,
      wind:number(hourly.wind_speed_10m?.[idx]),code:hourly.weather_code?.[idx]};
  }
  function formatWeather(r,detail=false){
    const mode=weatherMode(r),cached=weatherCache.get(weatherKey(r));
    const kind=mode==='archive'?'ARCHIVE':'FORECAST';
    if(['no-location','not-scheduled','too-early','archive-pending'].includes(mode))
      return '<div class="v72-weather-status">'+esc(weatherText(r,detail?'detail':'short'))+'</div>';
    if(cached?.error)return '<div class="v72-weather-status">'+(detail?'Weather service temporarily unavailable.':'Weather unavailable')+'</div>';
    if(!cached?.hourly)return '<div class="v72-weather-status">◷ '+esc(weatherText(r,detail?'detail':'short'))+'</div>';
    const snap=getSnapshot(r,r.race);
    const icon=snap? v42WeatherCode(snap.code)[0]:'◷';
    const description=snap?v42WeatherCode(snap.code)[1]:'Weather reading unavailable';
    if(!detail){
      return snap?'<div class="v72-weather-line"><span class="v72-weather-icon">'+icon+'</span><b>'+esc(snap.temp===null?'—':snap.temp+'°C')+'</b>'+
        '<span>'+esc(description)+'</span><small>'+esc(mode==='forecast'?(snap.rain===null?'Rain TBC':snap.rain+'% rain'):(snap.rainfall===null?'Rainfall TBC':snap.rainfall.toFixed(1)+' mm'))+'</small></div>':
        '<div class="v72-weather-status">Weather data unavailable for race start</div>';
    }
    const sessionRows=sessionItems(r).filter(s=>['Practice 1','Practice 2','Practice 3','Sprint Qualifying','Sprint','Qualifying','Race'].includes(s.name));
    const selected=sessionRows.length?sessionRows:[{name:'Race',dateStart:r.race}];
    return '<div class="v72-weather-detail-summary"><span class="v72-weather-icon">'+icon+'</span><strong>'+esc(snap?.temp===null||!snap?'—':snap.temp+'°C')+'</strong>'+
      '<span>'+esc(description)+'</span><small>'+esc(mode==='forecast'?'Upcoming forecast':'Historical reanalysis')+'</small></div>'+
      '<div class="v72-weather-sessions">'+selected.map(s=>{
        const w=getSnapshot(r,s.dateStart);
        const symbol=w?v42WeatherCode(w.code)[0]:'—';
        const metric=!w?'—':mode==='forecast'?(w.rain===null?'—':w.rain+'% rain'):(w.rainfall===null?'—':w.rainfall.toFixed(1)+' mm');
        return '<div><b>'+esc(s.name)+'</b><span>'+symbol+' '+esc(w?.temp===null||!w?'—':w.temp+'°C')+'</span><small>'+esc(metric)+'</small></div>';
      }).join('')+'</div>'+
      '<p class="v72-weather-source">'+(mode==='archive'?'Historical modelled weather, not official trackside observations. Rain shown in mm.':'Forecast at the circuit, not Adelaide. Rain shown as probability; forecast may change.')+
      ' <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo ↗</a></p>';
  }
  async function fetchJSON(url,timeout=12000){
    const abort=new AbortController();
    const timer=setTimeout(()=>abort.abort(),timeout);
    try{const response=await fetch(url,{signal:abort.signal,mode:'cors'});if(!response.ok)throw Error('HTTP '+response.status);return await response.json();}
    finally{clearTimeout(timer);}
  }
  async function fetchWeather(r,force=false){
    const mode=weatherMode(r),key=weatherKey(r);
    if(!['forecast','archive'].includes(mode))return;
    const saved=weatherCache.get(key);
    const ttl=mode==='forecast'?45*60000:12*3600000;
    if(!force && saved && latestTime()-saved.at<(saved.error?120000:ttl))return;
    if(weatherInflight.has(key))return weatherInflight.get(key);
    const request=(async()=>{
      const spot=v42Spot(r);if(!spot)return;
      const [lat,lon]=spot;
      let uri='';
      if(mode==='forecast'){
        uri='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(lat)+
          '&longitude='+encodeURIComponent(lon)+'&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&forecast_days=16&timezone=UTC';
      }else{
        const end=parseTime(r.race);
        const sessions=sessionItems(r).map(s=>parseTime(s.dateStart)).filter(isValid);
        const startTime=Math.min(end,...sessions);
        const startDate=new Date(startTime-86400000).toISOString().slice(0,10);
        const endDate=new Date(end+86400000).toISOString().slice(0,10);
        uri='https://archive-api.open-meteo.com/v1/archive?latitude='+encodeURIComponent(lat)+
          '&longitude='+encodeURIComponent(lon)+'&start_date='+startDate+'&end_date='+endDate+
          '&hourly=temperature_2m,precipitation,weather_code,wind_speed_10m&timezone=UTC';
      }
      try{
        const response=await fetchJSON(uri);
        if(!Array.isArray(response?.hourly?.time)||!response.hourly.time.length)throw Error('Empty weather series');
        weatherCache.set(key,{hourly:response.hourly,type:mode,at:latestTime()});
      }catch(error){weatherCache.set(key,{error:true,type:mode,at:latestTime()});}
      updateWeather(r);
    })();
    weatherInflight.set(key,request);
    try{await request;}finally{weatherInflight.delete(key);}
  }
  function updateWeather(r){
    if(st.tab!=='calendar')return;
    document.querySelectorAll('[data-v72-weather-round="'+r.round+'"]').forEach(el=>{
      el.innerHTML=formatWeather(r,el.dataset.v72WeatherMode==='detail');
    });
  }
  function cardWeather(r){
    return '<div class="v72-card-weather" data-v72-weather-round="'+r.round+'" data-v72-weather-mode="short">'+formatWeather(r)+'</div>';
  }
  function detailedWeather(r){
    return '<section class="v72-weather-card" aria-label="Circuit weather"><div class="v72-panel-head"><span>◉ TRACK CONDITIONS</span><b>RACE WEEKEND</b></div>'+
      '<h3>Weather at '+esc(r.location)+'</h3><div data-v72-weather-round="'+r.round+'" data-v72-weather-mode="detail">'+formatWeather(r,true)+'</div></section>';
  }
  /* A form-based fan forecast initially; published results update the scores.
     Formula 1 odds, gambling markets and betting data are not used. */
  function baseScores(r){
    const weights={technical:{mercedes:6,mclaren:4,ferrari:3,red_bull:2},street:{ferrari:6,mclaren:4,red_bull:4,mercedes:3},highspeed:{mclaren:6,red_bull:5,mercedes:3},balanced:{mercedes:5,mclaren:4,ferrari:3,red_bull:3}};
    return data.drivers.map(d=>{
      const team=aliases[d.team]||'';
      return {driver:d,score:Math.max(0,Number(d.points)||0)*0.17+Math.max(0,Number(d.wins)||0)*2.5+(weights[r.profile]?.[team]||0)};
    });
  }
  function qualifiedRows(rows){
    return Array.isArray(rows)?rows.filter(row=>Number.isFinite(Number(row.position))&&Number(row.position)>0&&
      Number.isFinite(Number(row.driver_number))).sort((a,b)=>Number(a.position)-Number(b.position)):[];
  }
  function resolveSession(list,r){
    const raceAt=parseTime(r.race);
    const anchor=list.filter(s=>nextSession(s.session_name)==='race'&&isValid(parseTime(s.date_start)) &&
      Math.abs(parseTime(s.date_start)-raceAt)<36*3600000)
      .sort((a,b)=>Math.abs(parseTime(a.date_start)-raceAt)-Math.abs(parseTime(b.date_start)-raceAt))[0];
    return anchor;
  }
  let sessionFetchedAt=0;
  async function allSessions(force=false){
    if(!force&&sessionsPromise&&latestTime()-sessionFetchedAt<60*60000)return sessionsPromise;
    sessionFetchedAt=latestTime();
    sessionsPromise=fetchJSON('https://api.openf1.org/v1/sessions?year='+YEAR).then(j=>Array.isArray(j)?j:[])
      .catch(err=>{sessionsPromise=null;throw err;});
    return sessionsPromise;
  }
  function finished(session,kind){
    const end=parseTime(session.date_end);
    const start=parseTime(session.date_start);
    return isValid(end)?latestTime()>end+15*60000:
      isValid(start)&&latestTime()>start+(kind==='Sprint'?95:105)*60000;
  }
  async function sessionClassification(meta){
    const id=encodeURIComponent(meta.session_key);
    const [result,people]=await Promise.all([
      fetchJSON('https://api.openf1.org/v1/session_result?session_key='+id),
      fetchJSON('https://api.openf1.org/v1/drivers?session_key='+id)
    ]);
    const names=new Map((Array.isArray(people)?people:[]).map(x=>[Number(x.driver_number),x]));
    const resolved=[];
    for(const item of qualifiedRows(result)){
      const info=names.get(Number(item.driver_number));
      if(!info)continue;
      const abbr=String(info.name_acronym||'').toUpperCase();
      const lname=String(info.last_name||'').toLowerCase();
      const driver=data.drivers.find(d=>d.code===abbr||d.last.toLowerCase()===lname);
      if(driver)resolved.push({code:driver.code,position:Number(item.position)});
    }
    return resolved.length>=5?resolved:null;
  }
  async function getForm(r,force=false){
    const key=String(r.round);
    const cached=predictionCache.get(key);
    if(!force&&cached&&latestTime()-cached.at<(cached.error?120000:180000))return cached;
    if(predictionInflight.has(key))return predictionInflight.get(key);
    const pending=(async()=>{
      const result={qualifying:null,sprint:null,sprintQualifying:null,practice1:null,practice2:null,practice3:null,race:null,at:latestTime(),error:false,checked:true};
      try{
        const sessions=await allSessions(force);
        const anchor=resolveSession(sessions,r);
        if(!anchor){result.missing=true;predictionCache.set(key,result);return result;}
        const meet=sessions.filter(s=>s.meeting_key===anchor.meeting_key);
        const find=(name)=>meet.find(s=>nextSession(s.session_name)===nextSession(name) ||
          (name==='Sprint Qualifying'&&nextSession(s.session_name)==='sprint shootout'));
        const wanted=[['Practice 1','practice1'],['Practice 2','practice2'],['Practice 3','practice3'],['Qualifying','qualifying'],['Sprint','sprint'],['Sprint Qualifying','sprintQualifying'],['Race','race']];
        await Promise.all(wanted.map(async([name,keyName])=>{
          const match=find(name);
          if(!match||!finished(match,name))return;
          try{result[keyName]=await sessionClassification(match);}catch(e){result.error=true;}
        }));
      }catch(e){result.error=true;}
      predictionCache.set(key,result);
      return result;
    })();
    predictionInflight.set(key,pending);
    try{return await pending;}finally{predictionInflight.delete(key);refreshPredictions(r);}
  }
  function forecast(r,event){
    const model=predictionCache.get(String(r.round))||{};
    const ranked=baseScores(r);
    const sources=[];
    const attach=(rows,scale)=>{
      if(!Array.isArray(rows)||rows.length<5)return;
      const positions=new Map(rows.map(row=>[row.code,row.position]));
      for(const row of ranked){
        const pos=positions.get(row.driver.code);
        row.score+=pos===undefined?-4:Math.max(0,24-pos)*scale;
      }
    };
    if(event==='sprint'){
      if(model.sprintQualifying){attach(model.sprintQualifying,2.8);sources.push('Sprint qualifying');}
      else if(model.practice1||model.practice2){attach(model.practice1,0.24);attach(model.practice2,0.3);sources.push('Practice');}
    }else{
      for(const [key,label,scale] of [['practice1','FP1',0.22],['practice2','FP2',0.30],['practice3','FP3',0.35]]){
        if(model[key]){attach(model[key],scale);sources.push(label);}
      }
      if(model.qualifying){attach(model.qualifying,3.3);sources.push('Qualifying');}
      if(model.sprint && r.sprint){attach(model.sprint,1.75);sources.push('Sprint');}
    }
    ranked.sort((a,b)=>b.score-a.score||a.driver.last.localeCompare(b.driver.last));
    return {drivers:ranked.slice(0,10).map(x=>x.driver),sources};
  }
  function eventDate(r,kind){
    if(kind==='race')return parseTime(r.race);
    const exact=sessionItems(r).find(s=>s.name==='Sprint');
    return exact?parseTime(exact.dateStart):null;
  }
  function predMarkup(r,kind){
    const date=eventDate(r,kind);
    const isSprint=kind==='sprint';
    const over=isValid(date)&&date<latestTime()-(isSprint?90:160)*60000;
    const title=isSprint?'Sprint prediction':'Race prediction';
    const sub=isSprint?'Before the sprint starts':'For the Grand Prix';
    let inside='';
    if(isSprint&&!r.sprint)inside='<div class="v72-pred-status">No sprint is scheduled for this Grand Prix.</div>';
    else if(over)inside='<div class="v72-pred-status">This session is complete. Select its Results shortcut to view the published classification.</div>';
    else{
      const {drivers,sources}=forecast(r,kind);
      inside='<div class="v72-pred-source">'+(sources.length?'UPDATED USING '+esc(sources.join(' + ').toUpperCase()):'SEASON FORM · WAITING FOR SESSION RESULTS')+'</div>'+
        '<div class="v72-pred-podium">'+drivers.slice(0,3).map((d,i)=>'<div class="v72-pred-driver">'+
          '<span class="v72-pred-position">P'+(i+1)+'</span><img src="'+(typeof window.pitwallDriverArtPath==='function'?window.pitwallDriverArtPath(d.code,'face'):'./Blank_driver.png')+'" alt="" loading="lazy" />'+
          '<b>'+esc(d.last)+'</b><small>'+esc(d.team)+'</small></div>').join('')+'</div>'+
        '<div class="v75-pred-more">'+drivers.slice(3,10).map((d,i)=>'<div><b>P'+(i+4)+'</b><span>'+esc(d.first)+' '+esc(d.last)+'</span><small>'+esc(d.team)+'</small></div>').join('')+'</div>'+
        '<p class="v72-pred-note">'+(isSprint&&!isValid(date)?'Sprint start time TBC. ':'')+(sources.length?'Published session classifications contribute to this fan forecast.':'An early form-based forecast; this updates when published session results arrive.')+'</p>';
    }
    return '<section class="v72-pred-card" data-v72-prediction-round="'+r.round+'" data-v72-event="'+kind+'">'+
      '<div class="v72-panel-head"><span>✦ PITWALL FAN FORECAST</span><b>'+esc(sub)+'</b></div>'+
      '<h3>'+title+'</h3>'+inside+'</section>';
  }
  function refreshPredictions(r){
    document.querySelectorAll('[data-v72-prediction-round="'+r.round+'"]').forEach(el=>{
      const div=document.createElement('div');div.innerHTML=predMarkup(r,el.dataset.v72Event);
      if(div.firstElementChild)el.replaceWith(div.firstElementChild);
    });
  }
  function maybeLoadPredictions(r){
    const days=(parseTime(r.race)-latestTime())/86400000;
    if(days<-.2||days>10)return;
    getForm(r).catch(()=>{});
  }
  // Read-only session classifications for the free sports-picks challenge.
  window.pitwallWeekendResults=function(round){
    return predictionCache.get(String(round))||null;
  };
  window.pitwallRefreshWeekendResults=function(r,force=false){
    return getForm(r,force);
  };
  const oldCalendar=calendar;
  calendar=function(){
    let html=oldCalendar();
    if(st.tab!=='calendar')return html;
    if(html.includes('v71-race-detail')){
      const roundMatch=html.match(/data-v71-detail-round="(\d+)"/);
      const r=roundMatch?findRace(roundMatch[1]):null;
      if(!r)return html;
      const insertion=detailedWeather(r)+predMarkup(r,'race')+(r.sprint?predMarkup(r,'sprint'):'');
      if(html.includes('<section class="v71-weekend">'))
        return html.replace('<section class="v71-weekend">',insertion+'<section class="v71-weekend">');
      if(html.includes('<p class="v71-detail-note"'))
        return html.replace('<p class="v71-detail-note"',insertion+'<p class="v71-detail-note"');
      return html.replace('</section>',insertion+'</section>');
    }
    return html.replace(/(<article class="v71-race-card">)([\s\S]*?)(<\/article>)/g,(whole,opening,body,closing)=>{
      const match=body.match(/data-v71-race="(\d+)"/);
      const r=match?findRace(match[1]):null;
      return r?opening+body+cardWeather(r)+closing:whole;
    });
  };
  const oldHome=home;
  home=function(){
    const html=oldHome();
    const r=nextRace();
    if(!r||!html.includes('<div class="v6-career-teaser">'))return html;
    return html.replace('<div class="v6-career-teaser">',predMarkup(r,'race')+(r.sprint?predMarkup(r,'sprint'):'')+'<div class="v6-career-teaser">');
  };
  function setupObserver(){
    if(observer)observer.disconnect();
    const items=[...document.querySelectorAll('[data-v72-weather-round]')];
    if(!items.length)return;
    if(typeof IntersectionObserver==='undefined'){
      items.slice(0,6).forEach(el=>{const r=findRace(el.dataset.v72WeatherRound);if(r)fetchWeather(r);});
      return;
    }
    observer=new IntersectionObserver(entries=>{
      for(const e of entries){
        if(!e.isIntersecting)continue;
        observer.unobserve(e.target);
        const r=findRace(e.target.dataset.v72WeatherRound);
        if(r)fetchWeather(r);
      }
    },{rootMargin:'210px 0px'});
    items.forEach(el=>observer.observe(el));
  }
  function queueModels(){
    const detail=document.querySelector('.v71-race-detail');
    if(detail){
      const node=detail.querySelector('[data-v72-prediction-round]');
      const race=node?findRace(node.dataset.v72PredictionRound):null;
      if(race)maybeLoadPredictions(race);
    }else if(st.tab==='home'){
      const node=document.querySelector('.v6-home [data-v72-prediction-round]');
      const race=node?findRace(node.dataset.v72PredictionRound):null;
      if(race)maybeLoadPredictions(race);
    }
  }
  const prevRender=render;
  render=function(){
    const value=prevRender.apply(this,arguments);
    if(st.tab==='calendar')setupObserver();
    queueModels();
    return value;
  };
  /* Historical content is lazy loaded; live races poll for newly published grids. */
  setInterval(()=>{
    if(document.hidden)return;
    if(st.tab==='home'||st.tab==='calendar'){
      const sel=document.querySelector('[data-v72-prediction-round]');
      const race=sel?findRace(sel.dataset.v72PredictionRound):null;
      if(race)maybeLoadPredictions(race);
    }
  },180000);
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden && (st.tab==='home'||st.tab==='calendar'))queueModels();
  });
  render();
})();
