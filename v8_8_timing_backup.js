/* PITWALL V8.8 — iPhone-friendly timing fallback.
   Live timing opens directly on the external provider. Only historical
   classifications from public OpenF1 are shown within PITWALL.
   No paid live API access, user credentials or unofficial live claims. */
'use strict';
(function(){
  if(typeof window.pitwallLiveTimingPage!=='function')return;
  const API='https://api.openf1.org/v1/';
  const YEAR=2026;
  let result=null,lastFetch=0,pending=null;
  const TTL=5*60*1000;
  const safe=v=>String(v??'').replace(/[&<>"']/g,c=>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pretty=raw=>{
    const n=Number(raw);
    return Number.isFinite(n)&&n>0?'P'+n:'NC';
  };
  function panel(){
    return '<section class="v88-last-session" aria-label="Recent completed F1 session classification">'+
      '<div class="v88-last-heading"><div><small>IN-APP BACKUP · FREE HISTORICAL DATA</small>'+
      '<h3>Latest completed session</h3></div>'+
      '<button type="button" data-v88-refresh aria-label="Refresh historical session results">↻ REFRESH</button></div>'+
      '<p>Shows a recently finished session, not the live timing feed. '+
      'During an ongoing session, select <strong>Open Full Dashboard</strong> above to follow it on the provider’s website.</p>'+
      '<div class="v88-last-body" aria-live="polite"><p class="v88-result-note">Checking the latest published classification…</p></div>'+
      '<div class="v88-source">Source: <a href="https://openf1.org/" target="_blank" rel="noopener noreferrer">OpenF1</a> · Historical session data only</div>'+
      '</section>';
  }
  const oldPage=window.pitwallLiveTimingPage;
  window.pitwallLiveTimingPage=function(){
    const html=oldPage();
    const end=html.lastIndexOf('</section>');
    if(end<0)return html+panel();
    return html.slice(0,end)+panel()+html.slice(end);
  };
  function dateLabel(raw){
    try{return new Intl.DateTimeFormat('en-AU',{
      timeZone:'Australia/Adelaide',weekday:'short',day:'numeric',month:'short',
      hour:'numeric',minute:'2-digit',timeZoneName:'short'
    }).format(new Date(raw));}catch(e){return 'Date unavailable';}
  }
  async function request(path){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetch(API+path,{signal:controller.signal,cache:'no-store'});
      if(!response.ok)throw new Error('OpenF1 HTTP '+response.status);
      const json=await response.json();
      if(!Array.isArray(json))throw new Error('Unexpected historical timing data');
      return json;
    }finally{clearTimeout(timeout);}
  }
  async function fetchLatest(){
    const sessions=await request('sessions?year='+YEAR);
    const now=Date.now()-30*60*1000;
    const finished=sessions.filter(s=>Number.isFinite(Date.parse(s.date_end))&&
      Date.parse(s.date_end)<now&&Number.isFinite(Number(s.session_key)))
      .sort((a,b)=>Date.parse(b.date_end)-Date.parse(a.date_end));
    const last=finished[0];
    if(!last)return {state:'none'};
    const key=encodeURIComponent(last.session_key);
    const [drivers,entries]=await Promise.all([
      request('drivers?session_key='+key),request('session_result?session_key='+key)
    ]);
    const people=new Map(drivers.map(d=>[Number(d.driver_number),d]));
    const rows=entries.filter(x=>Number.isFinite(Number(x.driver_number)))
      .sort((a,b)=>(Number(a.position)||999)-(Number(b.position)||999))
      .slice(0,24).map(x=>{
        const d=people.get(Number(x.driver_number))||{};
        const name=d.full_name||[d.first_name,d.last_name].filter(Boolean).join(' ')||
          'Driver #'+x.driver_number;
        const result=x.dsq?'DSQ':x.dns?'DNS':x.dnf?'DNF':pretty(x.position);
        return {name,team:d.team_name||'',result,code:d.name_acronym||'',
          color:/^[a-f0-9]{6}$/i.test(d.team_colour||'')?'#'+d.team_colour:'#71869a'};
      });
    return {state:rows.length?'ready':'none',rows,
      name:last.session_name||'Session',event:last.meeting_name||last.location||'Grand Prix',
      ended:last.date_end};
  }
  function markup(data){
    if(data.state==='none')return '<p class="v88-result-note">A recent finished session classification is not yet available. '+
      'Use Open Full Dashboard for live sessions, or check back after the session ends.</p>';
    return '<div class="v88-session-title"><strong>'+safe(data.event)+' · '+
      safe(data.name)+'</strong><span>'+safe(dateLabel(data.ended))+'</span></div>'+
      '<div class="v88-session-rows">'+data.rows.map(d=>
        '<div class="v88-session-row"><b>'+safe(d.result)+'</b>'+
        '<i style="background:'+d.color+'"></i>'+
        '<div><strong>'+safe(d.name)+'</strong><small>'+
        safe(d.code)+' · '+safe(d.team)+'</small></div></div>').join('')+'</div>'+
      '<p class="v88-result-note">This is a completed-session classification, not a real-time order.</p>';
  }
  function display(){
    const node=document.querySelector('.v67-timing-page .v88-last-body');
    if(!node)return;
    if(result)node.innerHTML=markup(result);
    else node.innerHTML='<p class="v88-result-note">Checking the latest published classification…</p>';
  }
  function load(force=false){
    if(force){lastFetch=0;result=null;}
    display();
    if(!force&&result&&Date.now()-lastFetch<TTL)return Promise.resolve(result);
    if(pending)return pending;
    pending=fetchLatest().then(v=>{
      result=v;lastFetch=Date.now();display();return v;
    }).catch(err=>{
      result=null;
      const node=document.querySelector('.v67-timing-page .v88-last-body');
      if(node)node.innerHTML='<p class="v88-result-note">Historical results could not load right now. '+
        'You can still open the external live dashboard above, or retry later.</p>';
      return {state:'error',reason:String(err)};
    }).finally(()=>{pending=null;});
    return pending;
  }
  const previousRender=render;
  render=function(...args){
    const v=previousRender.apply(this,args);
    if(st.tab==='timing')load();
    return v;
  };
  document.addEventListener('click',event=>{
    if(!event.target.closest('[data-v88-refresh]'))return;
    event.preventDefault();load(true);
  });
  window.PITWALLTimingBackup={markup,load};
})();