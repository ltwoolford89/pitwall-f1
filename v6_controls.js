/* PITWALL V6.6 — Navigation and persistent display preferences */
'use strict';
(function(){
  const KEY='pitwall-v66-display-preferences';
  const defaults={showAllResults:true,liveTiming:true,career:false,news:false,picks:false,forecast:false,chat:false};
  let stored={};
  try{const value=JSON.parse(localStorage.getItem(KEY)||'{}');if(value&&typeof value==='object')stored=value;}catch(err){}
  // First V7.7 start: explicitly disable experimental tabs that were
  // previously default-on. Later setting choices are saved normally.
  const INIT_KEY='pitwall-v77-experimental-tabs-defaulted';
  try{
    if(localStorage.getItem(INIT_KEY)!=='1'){
      for(const key of ['career','news','picks','forecast'])stored[key]=false;
      localStorage.setItem(KEY,JSON.stringify(stored));
      localStorage.setItem(INIT_KEY,'1');
    }
  }catch(err){}
  const prefs={...defaults,...Object.fromEntries(Object.entries(stored).filter(([k,v])=>k in defaults&&typeof v==='boolean'))};
  window.pitwallFeatures=prefs;
  // Normalise Liam Lawson's current team even when a delayed external feed
  // returns a different team string. This also protects saved standings data.
  function correctLawson(){
    if(!Array.isArray(data.drivers))return;
    data.drivers.forEach(d=>{
      if(String(d.code||'').toUpperCase()==='LAW'||String(d.last||'').toLowerCase()==='lawson'){
        d.team='Racing Bulls';
      }
    });
  }
  function persist(){
    try{localStorage.setItem(KEY,JSON.stringify(prefs));}
    catch(err){if(typeof toast==='function')toast('Your settings could not be saved');}
  }
  function toggle(key){
    return '<button type="button" role="switch" aria-label="'+({
      showAllResults:'Full session results',liveTiming:'Live Timing tab',career:'Career Mode',news:'Weekend News tab',picks:'Free F1 Picks tab',forecast:'Full Race Forecast tab',chat:'Chat testing tab'
    })[key]+'" aria-checked="'+String(prefs[key])+'" class="switch '+(prefs[key]?'on':'')+'" data-v66-toggle="'+key+'"><span></span></button>';
  }
  const previousSettings=v3SettingsPage;
  v3SettingsPage=function(){
    const html=previousSettings();
    const settingsMarkup='<div class="settings-group-title">TABS & RESULTS</div>'+
      '<div class="settings-group">'+
      '<div class="settings-row"><span class="settings-ico">🏁</span><span class="settings-label">Full session results<small class="v66-pref-subtitle">All reported drivers, including NC</small></span>'+toggle('showAllResults')+'</div>'+
      '<div class="settings-row"><span class="settings-ico">◉</span><span class="settings-label">Live Timing tab<small class="v66-pref-subtitle">Show or hide the external timing viewer</small></span>'+toggle('liveTiming')+'</div>'+
      '<div class="settings-row"><span class="settings-ico">🏎</span><span class="settings-label">Career Mode<small class="v66-pref-subtitle">Show or hide the racing game tab</small></span>'+toggle('career')+'</div>'+
      '<div class="settings-row"><span class="settings-ico">📰</span><span class="settings-label">Weekend News<small class="v66-pref-subtitle">Headlines published around race weekends</small></span>'+toggle('news')+'</div>'+
      '<div class="settings-row"><span class="settings-ico">🏁</span><span class="settings-label">Free F1 Picks<small class="v66-pref-subtitle">Guess results and champions. No money or odds.</small></span>'+toggle('picks')+'</div>'+
      '<div class="settings-row"><span class="settings-ico">📊</span><span class="settings-label">Full Race Forecast<small class="v66-pref-subtitle">Testing: full grid and potential DNFs</small></span>'+toggle('forecast')+'</div>'+ 
      '<div class="settings-row"><span class="settings-ico">💬</span><span class="settings-label">Chat testing preview<small class="v66-pref-subtitle">PIN-locked local groups; online messaging is not connected</small></span>'+toggle('chat')+'</div>'+
      '</div><p class="settings-hint">When full results are off, session results display only the top 10 classified drivers. Your career save is retained even if the game tab is hidden.</p>';
    // V5.2+ adds styling and a version badge to the Settings heading.
    // Anchor the controls to the Appearance section instead of exact heading markup.
    const anchor='<div class="settings-group-title">APPEARANCE</div>';
    if(html.includes(anchor))return html.replace(anchor,settingsMarkup+anchor);
    const h=html.indexOf('</h1>');
    return h<0?settingsMarkup+html:html.slice(0,h+5)+settingsMarkup+html.slice(h+5);
  };
  const bottom=document.querySelector('.bottomnav');
  const existing={};
  ['home','standings','calendar','career'].forEach(k=>{
    existing[k]=bottom?.querySelector('[data-tab="'+k+'"]')?.outerHTML||'';
  });
  const timingButton='<button type="button" data-tab="timing" aria-label="Live Timing"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15c1.8-4 3.3 5 5.3 0s3.4-4 5.2 0 3.3 5 5.2 0 2.5-1.5 2.5-1.5M4 7h16M7 3h10"/></svg>TIMING</button>';
  const newsButton='<button type="button" data-tab="news" aria-label="Weekend News"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h6"/></svg>NEWS</button>';
  const picksButton='<button type="button" data-tab="picks" aria-label="Free F1 Picks"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5v16M5 6h14l-3 5 3 5H5"/></svg>PICKS</button>';
  const chatButton='<button type="button" data-tab="chat" aria-label="Chat testing preview"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5zM8 10h8"/></svg>CHAT</button>';
  const forecastButton='<button type="button" data-tab="forecast" aria-label="Full Race Forecast"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v16M7 7h14M7 12h11M7 17h8"/></svg>FORECAST</button>';
  function updateHeader(){
    const header=document.querySelector('.topbar');
    if(!header)return;
    // The original V4.1 gear must not remain beside the new Settings gear.
    header.querySelectorAll('.v41-settings-gear').forEach(old=>old.remove());
    header.querySelectorAll('.v41-header-actions').forEach(group=>{
      if(!group.querySelector('button, a, #dataStatus'))group.remove();
    });
    let group=header.querySelector('.v66-header-actions');
    if(!group){
      group=document.createElement('div');group.className='v66-header-actions';
      const existingStatus=header.querySelector('#dataStatus');
      if(existingStatus)group.append(existingStatus);
      const gear=document.createElement('button');
      gear.type='button';gear.className='v66-settings-gear';
      gear.dataset.action='go-settings';gear.setAttribute('aria-label','Open PITWALL settings');
      gear.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M9 2h6l1 3 3 1 2 3-2 3 2 3-2 3-3 1-1 3H9l-1-3-3-1-2-3 2-3-2-3 2-3 3-1z"/></svg>';
      group.append(gear);
      header.append(group);
    }
    // Move any remaining status badge, then remove the now-obsolete V4.1 header
    // container entirely so only the new top-right Settings button remains.
    header.querySelectorAll('.v41-header-actions').forEach(old=>{
      const status=old.querySelector('#dataStatus');
      if(status)group.prepend(status);
      old.remove();
    });
    const gear=group.querySelector('.v66-settings-gear');
    if(gear){gear.classList.toggle('active',st.tab==='settings');gear.setAttribute('aria-current',st.tab==='settings'?'page':'false');}
  }
  function syncNavigation(){
    if(!bottom)return;
    bottom.innerHTML=existing.home+existing.standings+existing.calendar+
      (prefs.liveTiming?timingButton:'')+(prefs.career?existing.career:'')+(prefs.news?newsButton:'')+(prefs.picks?picksButton:'')+(prefs.forecast?forecastButton:'')+(prefs.chat?chatButton:'');
    // Keep a comfortable touch target for EVERY visible tab.
    // The capsule shrinks only when there is enough room to preserve spacing.
    const count=bottom.querySelectorAll('button[data-tab]').length;
    bottom.style.width='';
    bottom.style.setProperty('--pitwall-nav-desired',String(count*78+22)+'px');
    bottom.style.gridTemplateColumns='repeat('+count+', minmax(0, 1fr))';
    bottom.dataset.visibleTabs=String(count);
    bottom.querySelectorAll('button[data-tab]').forEach(btn=>{
      const active=btn.dataset.tab===st.tab;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-current',active?'page':'false');
    });
    bottom.classList.toggle('v66-four-tabs',bottom.querySelectorAll('button').length===4);
    bottom.classList.toggle('v66-three-tabs',bottom.querySelectorAll('button').length===3);
  }
  const previousNav=nav;
  nav=function(tab){
    if((tab==='timing'&&!prefs.liveTiming)||(tab==='career'&&!prefs.career)||(tab==='news'&&!prefs.news)||(tab==='picks'&&!prefs.picks)||(tab==='forecast'&&!prefs.forecast)||(tab==='chat'&&!prefs.chat))tab='settings';
    previousNav(tab);
  };
  const previousRender=render;
  render=function(){
    correctLawson();
    if(st.tab==='timing'&&!prefs.liveTiming)st.tab='home';
    if(st.tab==='career'&&!prefs.career)st.tab='home';
    if(st.tab==='news'&&!prefs.news)st.tab='home';
    if(st.tab==='picks'&&!prefs.picks)st.tab='home';
    if(st.tab==='forecast'&&!prefs.forecast)st.tab='home';
    if(st.tab==='chat'&&!prefs.chat)st.tab='home';
    if((st.tab==='career'||st.tab==='picks'||st.tab==='forecast'||st.tab==='chat')&&window.pitwallTestGate&&!window.pitwallTestGate.isUnlocked(st.tab)){
      const node=document.querySelector('#app');
      node.innerHTML=window.pitwallTestGate.render(st.tab);
    }else if(st.tab==='chat'){
      const node=document.querySelector('#app');
      node.innerHTML=window.pitwallChatPage?window.pitwallChatPage():
        '<section class="main-tab"><h2>Chat preview</h2><p>Local testing is preparing…</p></section>';
    }else if(st.tab==='forecast'){
      const node=document.querySelector('#app');
      node.innerHTML=window.pitwallFullForecastPage?window.pitwallFullForecastPage():
        '<section class="main-tab"><h2>Preparing race forecast…</h2></section>';
    }else if(st.tab==='news'||st.tab==='picks'){
      const node=document.querySelector('#app');
      node.innerHTML=window.pitwallExtraPage?window.pitwallExtraPage(st.tab):'<section class="main-tab"><h2>Loading…</h2></section>';
    }else if(st.tab==='timing'){
      const node=document.querySelector('#app');
      node.innerHTML=window.pitwallLiveTimingPage?window.pitwallLiveTimingPage():
        '<section class="main-tab"><h2>Live Timing</h2><p>Use the live timing website from your browser.</p></section>';
    }else{
      previousRender.apply(this,arguments);
    }
    if(!prefs.career)document.querySelector('.v6-career-teaser')?.remove();
    updateHeader();
    syncNavigation();
  };
  document.addEventListener('click',event=>{
    const btn=event.target.closest('[data-v66-toggle]');
    if(!btn)return;
    event.preventDefault();
    const key=btn.dataset.v66Toggle;
    if(!(key in defaults))return;
    prefs[key]=!prefs[key];
    persist();
    render();
  });
  correctLawson();
  render();
})();
