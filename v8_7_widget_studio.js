/* PITWALL V8.7 — compact F1 widgets, iPhone theme-aware previews.
   Live previews in Settings, not native iOS Home Screen widgets.
   WidgetKit extension needed for actual iPhone Home/Lock Screen widgets. */
'use strict';
(function(){
  const KEY='pitwall-v87-widget-preferences';
  const defaults={appearance:'auto',race:true,constructors:true,driver:true,driverArtwork:'face'};
  const validThemes=['auto','dark','light','clear'];
  let options={...defaults};
  try{
    const stored=JSON.parse(localStorage.getItem(KEY)||'{}');
    if(stored&&typeof stored==='object'){
      for(const key of ['race','driver','constructors'])if(typeof stored[key]==='boolean')options[key]=stored[key];
      if(validThemes.includes(stored.appearance))options.appearance=stored.appearance;
      if(['face','fullbody'].includes(stored.driverArtwork))options.driverArtwork=stored.driverArtwork;
    }else if(window.PITWALLV54?.getPreferences){
      const old=window.PITWALLV54.getPreferences();
      for(const key of ['race','driver','constructors'])if(typeof old[key]==='boolean')options[key]=old[key];
    }
  }catch(e){}
  const e=value=>String(value??'').replace(/[&<>"']/g,c=>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const TRACK={
    Australia:'albert_park',China:'shanghai',Japan:'suzuka',Bahrain:'bahrain',
    'Saudi Arabia':'jeddah',Miami:'miami',Canada:'villeneuve',Monaco:'monaco',
    'Barcelona-Catalunya':'catalunya',Spain:'catalunya',Austria:'red_bull_ring',
    'Great Britain':'silverstone',Belgium:'spa',Hungary:'hungaroring',
    Netherlands:'zandvoort',Italy:'monza',Azerbaijan:'baku',Singapore:'marina_bay',
    'United States':'americas',Mexico:'rodriguez','São Paulo':'interlagos',
    'Las Vegas':'vegas',Qatar:'losail','Abu Dhabi':'yas_marina'
  };
  const FLAGS={ANT:'🇮🇹',RUS:'🇬🇧',HAM:'🇬🇧',LEC:'🇲🇨',NOR:'🇬🇧',VER:'🇳🇱',
    PIA:'🇦🇺',HAD:'🇫🇷',LAW:'🇳🇿',GAS:'🇫🇷',LIN:'🇬🇧',COL:'🇦🇷',BEA:'🇬🇧',
    BOR:'🇧🇷',HUL:'🇩🇪',OCO:'🇫🇷',ALO:'🇪🇸',SAI:'🇪🇸',ALB:'🇹🇭',
    TSU:'🇯🇵',STR:'🇨🇦',BOT:'🇫🇮',PER:'🇲🇽'};
  const flags=r=>{
    if(!r)return '🏁';
    return typeof v4Flag==='function'?v4Flag(r):'🏁';
  };
  const preferences=()=>({...options});
  function upcomingRace(){
    const races=(typeof sortedRaces==='function'?sortedRaces():data.races)||[];
    const now=Date.now();
    return races.find(r=>Number.isFinite(Date.parse(r.race))&&Date.parse(r.race)>=now)||
      races.filter(r=>Number.isFinite(Date.parse(r.race))).slice(-1)[0]||null;
  }
  function raceTime(iso){
    if(!iso||!Number.isFinite(Date.parse(iso)))return 'Time TBC';
    try{return new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Adelaide',
      weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit',
      timeZoneName:'short'}).format(new Date(iso));
    }catch(e){return 'Time TBC';}
  }
  function circuit(r){
    if(!r)return '<span class="v87-no-map">NEXT SEASON</span>';
    const id=TRACK[r.short]||TRACK[String(r.name||'').replace(/ Grand Prix$/,'')];
    if(id)return '<img class="v87-track-art" src="./assets/circuits/'+id+
      '.svg" loading="lazy" decoding="async" alt="Outline of the '+e(r.location||r.short)+' circuit">';
    if(typeof v41CircuitSvg==='function')return v41CircuitSvg(r,'v87-track-svg');
    return '<span class="v87-no-map">CIRCUIT TO BE CONFIRMED</span>';
  }
  function favouriteDriver(){
    return (typeof v3Favourite==='function'&&v3Favourite())||(data.drivers||[])[0]||null;
  }
  function teamMark(name){
    try{return typeof v41TeamBadge==='function'?v41TeamBadge(name):
      '<i class="v87-team-dot" style="background:'+e(teamColour(name))+'"></i>';}
    catch(err){return '🏎️';}
  }
  function tile(kind){
    if(kind==='race'){
      const r=upcomingRace(),ended=r&&Date.parse(r.race)<Date.now();
      return '<article class="v87-widget v87-race" role="group" aria-label="Next race widget preview">'+
        '<div class="v87-outer-bg" aria-hidden="true"></div>'+
        '<div class="v87-kicker"><span>'+(ended?'LATEST RACE':'NEXT RACE')+
        '</span><small>'+e(r?'R'+r.round:'SEASON COMPLETE')+'</small></div>'+
        '<div class="v87-race-body"><div class="v87-race-info">'+
        '<div class="v87-race-title"><span class="v87-race-flag">'+flags(r)+'</span>'+
        '<strong>'+e(r?(r.short==='São Paulo'?'São Paulo':r.short)+' GP':'No upcoming GP')+'</strong></div>'+
        '<span class="v87-location">'+e(r?.location||'Calendar to be announced')+'</span>'+
        '<span class="v87-time">'+(r?e(raceTime(r.race)):'—')+'</span>'+
        '</div><div class="v87-circuit">'+circuit(r)+'</div></div></article>';
    }
    if(kind==='constructors'){
      const ct=(data.constructors||[]).slice(0,3);
      return '<article class="v87-widget v87-team" role="group" aria-label="Constructors top three widget preview">'+
        '<div class="v87-kicker"><span>CONSTRUCTORS’ CHAMPIONSHIP</span><small>TOP 3</small></div>'+
        '<div class="v87-team-body">'+(ct.length?ct.map((t,i)=>
        '<div class="v87-team-row"><span class="v87-team-place">'+(t.position||i+1)+'</span>'+
        '<span class="v87-team-mark">'+teamMark(t.team)+'</span>'+
        '<strong>'+e(t.team)+'</strong><b>'+e(t.points??'—')+'</b></div>').join(''):
        '<p class="v87-empty">Awaiting constructor standings</p>')+'</div>'+
        '<div class="v87-constructors-graphic" aria-hidden="true"><span>F1</span>'+
        '<span>CONSTRUCTORS</span></div></article>';
    }
    const d=favouriteDriver();
    const rank=d?.position??'—';
    const code=String(d?.code||'').toUpperCase();
    const valid=/^[A-Z]{3}$/.test(code);
    const portrait=valid?(options.driverArtwork==='fullbody'?
      './custom_uploads/fullbody/'+code+'.png':'./portraits/face/'+code+'.png'):
      './Blank_driver.png';
    const accent=d&&typeof teamColour==='function'?teamColour(d.team):'#ff8c26';
    return '<article class="v87-widget v87-driver" data-v87-art-mode="'+options.driverArtwork+'" role="group" aria-label="Favourite driver widget preview" style="--v87-team-accent:'+e(accent)+'">'+
      '<div class="v87-driver-sweep" aria-hidden="true"></div>'+
      '<div class="v87-driver-pixel"><img src="'+portrait+
      '" data-v87-driver-art="'+code+'" data-v87-art-source="'+options.driverArtwork+
      '" loading="lazy" decoding="async" alt="'+(d?'Pixel artwork of '+e(d.first)+' '+e(d.last):'Driver placeholder')+'"></div>'+
      '<div class="v87-driver-copy"><strong>'+e(d?(d.first+' '+d.last):'Choose a driver')+'</strong>'+
      '<span>'+e(FLAGS[code]||'🏁')+' '+e(d?.team||'')+'</span>'+
      '<small class="v87-driver-flag">'+e(FLAGS[code]||'🏁')+'</small></div>'+
      '<div class="v87-driver-score"><b>P'+e(rank)+'</b><small>'+e(d?.points??'—')+' PTS</small></div>'+
      '</article>';
  }
  function preview(){
    const chosen=options.appearance;
    const modes=[['auto','Follow iPhone'],['dark','Dark'],['light','Light'],['clear','Clear / Glass']];
    const visible=[['race','Next race'],['constructors','Constructors'],['driver','Favourite driver']];
    return '<section class="v87-widget-settings" id="v87-widget-settings" aria-label="Widget design preview">'+
      '<div class="settings-group-title">WIDGET STUDIO</div>'+
      '<div class="v87-widget-lead"><h2>Home Screen widget previews</h2>'+
      '<p>Styled around your example: real circuit outlines, compact constructors and large pixel driver portraits. '+
      'The data comes from PITWALL’s current race calendar and standings.</p></div>'+
      '<div class="v87-widget-options"><div><b>Widget appearance</b><div class="v87-theme-buttons" role="group" aria-label="Widget preview appearance">'+
      modes.map(([key,label])=>'<button type="button" data-v87-theme="'+key+'" class="'+
      (chosen===key?'active':'')+'" aria-pressed="'+(chosen===key)+'">'+label+'</button>').join('')+
      '</div></div><div><b>Driver artwork</b><div class="v87-theme-buttons" role="group" aria-label="Driver widget portrait mode">'+
      [['face','Face portrait'],['fullbody','Full body']].map(([key,label])=>
        '<button type="button" data-v87-art="'+key+'" class="'+
        (options.driverArtwork===key?'active':'')+'" aria-pressed="'+(options.driverArtwork===key)+'">'+label+'</button>').join('')+
      '</div></div><div><b>Show in preview</b><div class="v87-preview-visibility">'+
      visible.map(([key,label])=>'<button type="button" data-v87-toggle="'+key+'" aria-pressed="'+
      String(options[key])+'" class="'+(options[key]?'on':'')+'">'+
      (options[key]?'✓ ':'+ ')+label+'</button>').join('')+'</div></div></div>'+
      '<div class="v87-preview-surface" data-v87-appearance="'+chosen+'">'+
      '<div class="v87-preview-hint"><span>WIDGET PREVIEW · MEDIUM RECTANGLE</span><small>'+
      (chosen==='auto'?'FOLLOWS SYSTEM':chosen==='clear'?'SIMULATED CLEAR FINISH':chosen.toUpperCase())+
      '</small></div><div class="v87-preview-grid">'+
      (options.race?tile('race'):'')+(options.constructors?tile('constructors'):'')+
      (options.driver?tile('driver'):'')+
      (!options.race&&!options.constructors&&!options.driver?
        '<p class="v87-none">Enable a widget above to show its preview.</p>':'')+
      '</div></div>'+
      '<p class="v87-widget-footnote">These are interactive previews within PITWALL, not installed iOS widgets. '+
      'iPhone Home Screen widgets require a separate WidgetKit extension. '+
      'A future iOS widget can follow the phone’s light/dark appearance and supported tinted/clear rendering modes; '+
      'exact transparency is controlled by iOS, not the web app.</p></section>';
  }
  function persist(){
    try{localStorage.setItem(KEY,JSON.stringify(options));}
    catch(err){if(typeof toast==='function')toast('Widget preview preferences could not be saved');}
  }
  function refreshPreview(){
    if(st.tab!=='settings')return;
    const root=document.querySelector('#app .main-tab');
    if(!root)return;
    const existing=root.querySelector('#v87-widget-settings');
    if(existing)existing.outerHTML=preview();
    else root.insertAdjacentHTML('beforeend',preview());
  }
  const previousRender=render;
  render=function(...args){
    const result=previousRender.apply(this,args);
    if(st.tab==='settings')refreshPreview();
    return result;
  };
  document.addEventListener('click',event=>{
    const choice=event.target.closest('[data-v87-theme]');
    if(choice){
      const next=choice.dataset.v87Theme;
      if(!validThemes.includes(next))return;
      options.appearance=next;persist();refreshPreview();return;
    }
    const artwork=event.target.closest('[data-v87-art]');
    if(artwork){
      const choice=artwork.dataset.v87Art;
      if(['face','fullbody'].includes(choice)){
        options.driverArtwork=choice;persist();refreshPreview();
      }
      return;
    }
    const toggle=event.target.closest('[data-v87-toggle]');
    if(toggle){
      const key=toggle.dataset.v87Toggle;
      if(!['race','constructors','driver'].includes(key))return;
      options[key]=!options[key];persist();refreshPreview();
    }
  });
  // Preview follows the OS appearance automatically in auto/clear mode.
  // CSS controls the actual palette; we only refresh when Settings is open.
  try{
    const mq=window.matchMedia('(prefers-color-scheme: dark)');
    const repaint=()=>{if(st.tab==='settings'&&['auto','clear'].includes(options.appearance))refreshPreview();};
    if(mq.addEventListener)mq.addEventListener('change',repaint);
    else mq.addListener?.(repaint);
  }catch(err){}
  // Pixel-art exports differ in transparent padding. Trim that space
  // on the widget ONLY; never modify the original image or driver profiles.
  const cropped=new Map();
  function normalisePortrait(img){
    if(!img?.isConnected||!img.naturalWidth||img.dataset.v87Processed)return;
    img.dataset.v87Processed='1';
    const source=img.currentSrc||img.src;
    if(!source||source.startsWith('data:')||source.startsWith('blob:'))return;
    if(cropped.has(source)){const result=cropped.get(source);if(result)img.src=result;return;}
    try{
      const w=img.naturalWidth,h=img.naturalHeight;
      if(!w||!h||w*h>2200000)return;
      const canvas=document.createElement('canvas');
      canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      if(!ctx)return;
      ctx.drawImage(img,0,0);
      const pixels=ctx.getImageData(0,0,w,h).data;
      let left=w,top=h,right=-1,bottom=-1,opaque=0;
      // Sampling every 2px keeps larger images smooth on mobile.
      for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){
        const a=pixels[(y*w+x)*4+3];
        if(a<28)continue;
        opaque++;
        if(x<left)left=x;if(x>right)right=x;
        if(y<top)top=y;if(y>bottom)bottom=y;
      }
      if(right<left||bottom<top||opaque>=(w*h)/4*0.98)return;
      const pad=Math.max(2,Math.round(Math.min(w,h)*0.015));
      left=Math.max(0,left-pad);top=Math.max(0,top-pad);
      right=Math.min(w-1,right+pad);bottom=Math.min(h-1,bottom+pad);
      // Avoid unnecessary conversion and preserve high-quality source images.
      if((right-left+1)>w*.96&&(bottom-top+1)>h*.96)return;
      const target=document.createElement('canvas');
      target.width=right-left+1;target.height=bottom-top+1;
      target.getContext('2d').drawImage(canvas,left,top,target.width,target.height,0,0,target.width,target.height);
      const url=target.toDataURL('image/png');
      cropped.set(source,url);
      if(img.isConnected)img.src=url;
    }catch(err){/* Tainted or unsupported canvas: the normal image still works. */}
  }
  document.addEventListener('load',event=>{
    const img=event.target;
    if(img?.matches?.('[data-v87-driver-art]'))normalisePortrait(img);
  },true);
  document.addEventListener('error',event=>{
    const img=event.target;
    if(!img?.matches?.('[data-v87-driver-art]'))return;
    const code=String(img.dataset.v87DriverArt||'').toUpperCase();
    const fallback=img.dataset.v87ArtSource;
    img.dataset.v87Processed='';
    if(fallback==='fullbody'&&/^[A-Z]{3}$/.test(code)){
      img.dataset.v87ArtSource='face';
      img.src='./portraits/face/'+code+'.png';
    }else if(fallback!=='blank'){
      img.dataset.v87ArtSource='blank';
      img.src='./Blank_driver.png';
    }
  },true);
  window.PITWALLWidgetStudio={preview,tile,preferences};
  if(st.tab==='settings')refreshPreview();
})();