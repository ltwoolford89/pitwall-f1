/* PITWALL V7.5 — race-weekend headlines and free sports prediction picks.
   No wagering, virtual currency, payouts, betting odds, or prediction markets. */
'use strict';
(function(){
  const PICK_KEY='pitwall-v75-free-picks';
  let saved={};
  try{
    const value=JSON.parse(localStorage.getItem(PICK_KEY)||'{}');
    if(value&&typeof value==='object')saved=value;
  }catch(e){}
  let newsItems=[], newsUpdated=null, newsLoaded=0, newsPending=null, newsError='';
  let selectedNewsRound=null, selectedPickRound=null, selectedPickEvent='race',selectedNewsArticle=null;
  const year=String(YEAR);
  const clean=(value)=>typeof safe==='function'?safe(String(value??'')):String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const raceList=()=>data.races.slice().sort((a,b)=>Date.parse(a.race)-Date.parse(b.race));
  const uniqueDrivers=()=>Array.from(new Map(data.drivers.map(d=>[String(d.code).toUpperCase(),d])).values()).sort((a,b)=>Number(a.position)-Number(b.position));
  const allowedLink=value=>{try{const u=new URL(String(value));return u.protocol==='https:'?u.href:'';}catch(e){return '';}};
  function persist(){
    try{localStorage.setItem(PICK_KEY,JSON.stringify(saved));}catch(e){if(typeof toast==='function')toast('Unable to save picks on this device');}
  }
  function currentRace(){
    const ordered=raceList();
    return ordered.find(r=>Date.parse(r.race)>Date.now()-2*86400000)||ordered[ordered.length-1];
  }
  function raceByRound(round){return data.races.find(r=>Number(r.round)===Number(round))||currentRace();}
  function roundSelect(current,attr){
    return '<select '+attr+' aria-label="Choose Grand Prix">'+raceList().map(r=>
      '<option value="'+r.round+'" '+(Number(current)===Number(r.round)?'selected':'')+'>'+clean('R'+r.round+' · '+r.name)+'</option>'
    ).join('')+'</select>';
  }
  function fmtTime(ts){
    const ms=Date.parse(ts);
    return Number.isFinite(ms)?new Intl.DateTimeFormat('en-AU',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit',timeZone:'Australia/Adelaide'}).format(new Date(ms)):'Date unavailable';
  }
  function requestNews(force=false){
    if(newsPending)return newsPending;
    if(!force && Date.now()-newsLoaded<15*60000)return Promise.resolve();
    newsPending=fetch('./weekend-news.json?fresh='+Date.now(),{cache:'no-store'}).then(r=>{
      if(!r.ok)throw Error('News feed unavailable');
      return r.json();
    }).then(j=>{
      newsItems=Array.isArray(j.items)?j.items.slice(0,180).filter(a=>allowedLink(a.url)&&a.title&&Number.isFinite(Date.parse(a.published))&&!/\b(?:betting|wager|gambling|odds)\b/i.test(a.title)):[];
      newsUpdated=j.updatedAt||null;newsError='';newsLoaded=Date.now();
    }).catch(()=>{newsError='Recent headlines could not be refreshed.';newsLoaded=Date.now();})
      .finally(()=>{newsPending=null;if(st.tab==='news')render();});
    return newsPending;
  }
  function newsPage(){
    if(selectedNewsRound===null)selectedNewsRound=currentRace()?.round;
    if(Date.now()-newsLoaded>15*60000 && !newsPending)requestNews();
    const r=raceByRound(selectedNewsRound);
    if(!r)return '<section class="main-tab v75-page"><h2>Weekend News</h2><p>The calendar is unavailable.</p></section>';
    const raceAt=Date.parse(r.race),from=raceAt-4*86400000,to=raceAt+2*86400000;
    const items=newsItems.filter(a=>{const t=Date.parse(a.published);return t>=from&&t<=to;}).sort((a,b)=>Date.parse(b.published)-Date.parse(a.published)).slice(0,45);
    const cards=items.map(a=>{
      const index=newsItems.indexOf(a);
      return '<button type="button" class="v75-news-card" data-v75-article="'+index+'">'+
        '<small>'+clean(a.source||'F1 NEWS')+' · '+clean(fmtTime(a.published))+'</small>'+
        '<strong>'+clean(a.title)+'</strong><span>ARTICLE PREVIEW →</span></button>';
    }).join('');
    const article=newsItems[selectedNewsArticle]||null;
    const showPreview=article&&items.includes(article);
    const preview=showPreview?'<section class="v78-article-preview" aria-label="Article preview">'+
      '<button type="button" data-v75-close-article aria-label="Close preview">× CLOSE PREVIEW</button>'+
      '<small>'+clean(article.source||'F1 NEWS')+' · '+clean(fmtTime(article.published))+'</small>'+
      '<h3>'+clean(article.title)+'</h3>'+
      '<p>'+clean(article.summary||'This report looks at '+article.title+'. Read the original story for the full detail.')+'</p>'+
      '<a href="'+clean(allowedLink(article.url))+'" target="_blank" rel="noopener noreferrer">OPEN ORIGINAL WEBSITE ↗</a></section>':'';
    return '<section class="main-tab v75-page"><div class="v75-heading"><span>THE PITWALL / WEEKEND COVERAGE</span><h2>F1 News</h2><p>Recent reporting published around each Grand Prix weekend.</p></div>'+
      '<div class="v75-toolbar">'+roundSelect(selectedNewsRound,'data-v75-news-round')+'<button type="button" data-v75-news-refresh>↻ Refresh</button></div>'+
      '<p class="v75-status">'+(newsPending?'Checking for newer articles…':newsUpdated?'Last feed update: '+clean(fmtTime(newsUpdated)):clean(newsError||'Waiting for the news feed to update.'))+'</p>'+
      preview+(cards||'<div class="v75-empty">No collected articles fall inside this weekend yet. The news feed refreshes automatically when available.</div>')+
      '<p class="v75-source">Credited headlines and short previews from <a href="https://www.formula1.com/en/latest" target="_blank" rel="noopener noreferrer">official Formula 1 news</a>, <a href="https://www.bbc.com/sport/formula1" target="_blank" rel="noopener noreferrer">BBC Sport F1</a> and <a href="https://www.motorsport.com/f1/news/" target="_blank" rel="noopener noreferrer">Motorsport.com F1</a>. Read full reports on the original websites.</p></section>';
  }
  function keyFor(r,event){return year+'-'+r.round+'-'+event;}
  const PRELOCK_MS=5*60000;
  function scheduleDate(r,event){
    if(event==='race')return Date.parse(r.race);
    const sessions=typeof scheduleFor==='function'?scheduleFor(r):(r.sessions||[]);
    const qualifying=sessions.find(x=>String(x.name).trim().toLowerCase()==='qualifying'&&!x.cancelled);
    return qualifying?Date.parse(qualifying.dateStart):NaN;
  }
  function lockStatus(r,event){
    const date=scheduleDate(r,event);
    if(!Number.isFinite(date))return {locked:true,info:'No confirmed session start time. Picks stay locked until the calendar has one.'};
    const closing=date-PRELOCK_MS;
    if(Date.now()>=closing)return {locked:true,info:'Locked five minutes before session start · '+fmtTime(new Date(closing).toISOString())};
    const remaining=Math.ceil((closing-Date.now())/60000);
    return {locked:false,info:'Locks '+fmtTime(new Date(closing).toISOString())+' · '+remaining+' min left (Adelaide time)'};
  }
  function quickPickKey(r,event){return keyFor(r,event)+'-p1';}
  function quickPick(r,event){
    const locked=lockStatus(r,event).locked;
    const chosen=saved[quickPickKey(r,event)]||'';
    const results=window.pitwallWeekendResults?.(r.round)?.[event];
    const pole=Array.isArray(results)?results.find(x=>Number(x.position)===1)?.code:null;
    const points=chosen&&pole?(chosen===pole?15:0):null;
    return '<div class="v78-quick-pick"><strong>'+clean(event==='race'?'Your predicted winner (P1)':'Your predicted pole position (P1)')+'</strong>'+
      '<small>Pick before lock-in. The top-ten prediction is separate below.</small>'+
      '<select aria-label="P1 pick" data-v78-p1="'+event+'" '+(locked?'disabled':'')+'>'+pickRowOptions(r,chosen)+'</select>'+
      (points===null?'':'<small>'+ (points?'Correct P1: +15 points':'P1 selection: 0 points')+'</small>')+
      '</div>';
  }
  function scorePicks(r,event){
    const model=window.pitwallWeekendResults?.(r.round);
    const classified=model?.[event==='race'?'race':'qualifying'];
    if(!Array.isArray(classified)||classified.length<10)return null;
    const actual=classified.filter(d=>d.position>=1&&d.position<=10).sort((a,b)=>a.position-b.position).slice(0,10).map(d=>d.code);
    if(actual.length<10)return null;
    const picks=Array.isArray(saved[keyFor(r,event)])?saved[keyFor(r,event)]:[];
    if(picks.length!==10||picks.some(x=>!x))return null;
    let score=0,exact=0,inTop=0;
    for(let i=0;i<10;i++){
      if(picks[i]===actual[i]){score+=10;exact++;}
      else if(actual.includes(picks[i])){score+=2;inTop++;}
    }
    // Persist only accuracy achievements; points are not stakes or currency.
    const scoreboardKey=year+'-scoreboard';
    const book=saved[scoreboardKey]&&typeof saved[scoreboardKey]==='object'?saved[scoreboardKey]:{};
    const id=String(r.round)+'-'+event;
    const prior=book[id];
    if(!prior||prior.score!==score||prior.exact!==exact||prior.inTop!==inTop){
      book[id]={score,exact,inTop};
      saved[scoreboardKey]=book;
      persist();
    }
    return {score,exact,inTop,actual};
  }
  function pickRowOptions(d,chosen){
    const drivers=uniqueDrivers();
    return '<option value="">Choose a driver</option>'+drivers.map(x=>
      '<option value="'+clean(x.code)+'" '+(x.code===chosen?'selected':'')+'>'+clean(x.first+' '+x.last+' · '+x.team)+'</option>'
    ).join('');
  }
  function eventPicks(r,event){
    const state=lockStatus(r,event),value=saved[keyFor(r,event)]||Array(10).fill('');
    const result=scorePicks(r,event);
    const complete=value.length===10&&value.every(Boolean);
    const rows=Array.from({length:10},(_,i)=>
      '<label class="v75-pick-row"><span>P'+(i+1)+'</span><select data-v75-slot="'+i+'" data-v75-event="'+event+'" '+(state.locked?'disabled':'')+'>'+
      pickRowOptions(r,value[i]||'')+'</select></label>'
    ).join('');
    return '<div class="v75-pick-status">'+clean(state.info)+'</div>'+quickPick(r,event)+
      '<p class="v75-hint">Select a different driver for each place. '+(complete?'Your picks are saved on this device.':'Choose all ten positions to complete your entry.')+'</p>'+
      '<div class="v75-pick-rows">'+rows+'</div>'+
      (result?'<div class="v75-score"><b>'+result.score+' accuracy points</b><span>'+result.exact+' exact positions · '+result.inTop+' other top-ten drivers</span></div>':
      '<p class="v75-hint">Accuracy points appear after a published top-ten classification: 10 per exact position or 2 for a driver in the top ten but another position. No prizes or stakes.</p>');
  }
  function championshipPicks(){
    const champ=saved[year+'-champ']||{};
    const end=Date.parse(raceList().slice(-1)[0]?.race||'');
    const locked=Number.isFinite(end)&&Date.now()>=end;
    const drivers=uniqueDrivers();
    const teams=Array.from(new Set(data.constructors.map(x=>x.team))).sort();
    const option=(list,selected)=>'<option value="">Choose a champion</option>'+list.map(x=>
      '<option value="'+clean(x.value)+'" '+(x.value===selected?'selected':'')+'>'+clean(x.label)+'</option>').join('');
    const dlist=drivers.map(x=>({value:x.code,label:x.first+' '+x.last}));
    const tlist=teams.map(x=>({value:x,label:x}));
    return '<section class="v75-pick-panel"><h3>Championship predictions</h3>'+
      '<p>Who will finish the season as Drivers’ and Constructors’ Champion? Your choices stay on this device.</p>'+
      '<label class="v75-wide-label">Drivers’ Champion<select data-v75-champ="driver" '+(locked?'disabled':'')+'>'+option(dlist,champ.driver)+'</select></label>'+
      '<label class="v75-wide-label">Constructors’ Champion<select data-v75-champ="team" '+(locked?'disabled':'')+'>'+option(tlist,champ.team)+'</select></label>'+
      '<p class="v75-hint">'+(locked?'Championship picks closed at the final race start.':'Championship picks close at the final scheduled race start.')+'</p></section>';
  }
  function achievementSummary(){
    const record=saved[year+'-scoreboard']||{};
    const values=Object.values(record).filter(x=>x&&Number.isFinite(Number(x.score)));
    const earned=values.reduce((n,x)=>n+Math.max(0,Number(x.score)||0),0);
    const total=100+earned; // Starter challenge points, never spent or wagered.
    const exact=values.reduce((n,x)=>n+(Number(x.exact)||0),0);
    const tier=total>=600?'PITWALL MASTER':total>=350?'RACE ENGINEER':total>=180?'GRID ANALYST':'ROOKIE STRATEGIST';
    return '<section class="v76-achievements" aria-label="Fantasy picks achievement points">'+
      '<div><span>CHALLENGE POINTS</span><strong>'+total+'</strong><small>100 starter points + '+earned+' earned</small></div>'+
      '<div><span>YOUR RANK</span><strong>'+tier+'</strong><small>'+values.length+' results scored · '+exact+' exact positions</small></div>'+
      '</section>'+
      '<p class="v76-safety-note">Prediction game only. Gambling can cause harm. These points cannot be spent, staked, withdrawn, or converted into money or prizes.</p>';
  }
  function picksPage(){
    if(selectedPickRound===null)selectedPickRound=currentRace()?.round;
    const r=raceByRound(selectedPickRound);
    if(!r)return '<section class="main-tab v75-page"><h2>F1 Picks</h2><p>Waiting for the calendar.</p></section>';
    // Fetch published classifications when viewing a recently completed weekend.
    if(typeof window.pitwallRefreshWeekendResults==='function'){
      const existing=window.pitwallWeekendResults?.(r.round);
      if(!existing||Date.now()-existing.at>5*60000)window.pitwallRefreshWeekendResults(r).then(()=>{
        if(st.tab==='picks')render();
      }).catch(()=>{});
    }
    return '<section class="main-tab v75-page"><div class="v75-heading"><span>THE PITWALL / FOR FUN</span><h2>F1 Picks</h2>'+
      '<p>Make your own top-ten and championship picks. Earn points for accuracy, not wagers.</p></div>'+achievementSummary()+
      '<div class="v75-toolbar">'+roundSelect(selectedPickRound,'data-v75-pick-round')+'</div>'+
      '<div class="v75-event-switch"><button type="button" data-v75-kind="qualifying" class="'+(selectedPickEvent==='qualifying'?'active':'')+'">QUALIFYING TOP 10</button>'+
      '<button type="button" data-v75-kind="race" class="'+(selectedPickEvent==='race'?'active':'')+'">RACE TOP 10</button></div>'+
      '<section class="v75-pick-panel"><h3>'+clean(selectedPickEvent==='race'?'Grand Prix finishing order':'Qualifying classification')+'</h3>'+
      eventPicks(r,selectedPickEvent)+'</section>'+championshipPicks()+'</section>';
  }
  window.pitwallExtraPage=function(tab){return tab==='news'?newsPage():picksPage();};
  document.addEventListener('change',event=>{
    const e=event.target;
    if(e.matches('[data-v75-news-round]')){selectedNewsRound=Number(e.value);selectedNewsArticle=null;render();return;}
    if(e.matches('[data-v78-p1]')){
      const r=raceByRound(selectedPickRound),eventName=e.dataset.v78P1;
      if(!r||!['race','qualifying'].includes(eventName)||lockStatus(r,eventName).locked)return render();
      saved[quickPickKey(r,eventName)]=e.value;persist();render();return;
    }
    if(e.matches('[data-v75-pick-round]')){selectedPickRound=Number(e.value);render();return;}
    if(e.matches('[data-v75-slot]')){
      const r=raceByRound(selectedPickRound),kind=e.dataset.v75Event,index=Number(e.dataset.v75Slot);
      if(!r||lockStatus(r,kind).locked)return render();
      const values=Array.isArray(saved[keyFor(r,kind)])?saved[keyFor(r,kind)].slice():Array(10).fill('');
      if(e.value && values.some((v,i)=>i!==index && v===e.value)){
        if(typeof toast==='function')toast('You already picked that driver');
        return render();
      }
      values[index]=e.value;
      saved[keyFor(r,kind)]=values;
      persist();render();return;
    }
    if(e.matches('[data-v75-champ]')){
      const end=Date.parse(raceList().slice(-1)[0]?.race||'');
      if(Number.isFinite(end)&&Date.now()>=end)return render();
      const key=year+'-champ',values=saved[key]||{};
      if(e.dataset.v75Champ==='driver')values.driver=e.value;
      else values.team=e.value;
      saved[key]=values;persist();render();
    }
  });
  document.addEventListener('click',event=>{
    const e=event.target.closest('[data-v75-news-refresh],[data-v75-kind],[data-v75-article],[data-v75-close-article]');
    if(!e)return;
    if(e.matches('[data-v75-news-refresh]')){newsLoaded=0;newsError='';requestNews(true);render();}
    if(e.matches('[data-v75-article]')){selectedNewsArticle=Number(e.dataset.v75Article);render();return;}
    if(e.matches('[data-v75-close-article]')){selectedNewsArticle=null;render();return;}
    if(e.matches('[data-v75-kind]')){selectedPickEvent=e.dataset.v75Kind;render();}
  });
  render();
})();
