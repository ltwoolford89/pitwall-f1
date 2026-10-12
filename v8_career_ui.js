/* PITWALL V8 Career UI. Retro staff portraits are generated locally as
   crisp-edged SVG pixel art; all faces and names are fictional. */
'use strict';
(function(){
  const api=window.pitwallCareer8;
  if(!api)return;
  const e=value=>safe(String(value??''));
  const money=value=>fmtMoney(Number(value)||0);
  const btn=(text,action,id='',disabled=false,cls='')=>
    '<button type="button" class="v8-btn '+cls+'" data-v8-action="'+e(action)+'" data-v8-id="'+e(id)+'" '+(disabled?'disabled':'')+'>'+text+'</button>';
  const panel=(title,content,extra='')=>'<section class="v8-panel '+extra+'"><h3>'+title+'</h3>'+content+'</section>';
  const stageTitle=()=>stages[career.stage]||'KARTING';
  const state=()=>api.migrate();
  const age=()=>api.years();
  const progress=value=>Math.max(0,Math.min(100,Math.round(value)));
  function pixelArt(seed=0,team=''){
    const k=Math.abs(seed);
    const skins=['#c18a67','#e2ac88','#9b7256','#d49b7b','#b88369','#b59174'];
    const hairs=['#2a1c1b','#4a291d','#775031','#141a20','#b27434','#5d4540'];
    const jackets=['#28687a','#cd3545','#278d84','#2d5591','#dc8c31','#8750a2'];
    const face=skins[k%skins.length],hair=hairs[(k*7+3)%hairs.length];
    const jacket=jackets[(k*11+2)%jackets.length];
    const eye='#221c20',bg=['#192d3d','#1d3849','#233445','#172f43'][k%4];
    const hairStyle=k%4;
    const rect=(x,y,w,h,col)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+col+'"/>';
    let svg='<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 16 16" shape-rendering="crispEdges">';
    svg+=rect(0,0,16,16,bg)+rect(1,1,14,14,'#253d50');
    svg+=rect(1,14,14,2,'#132736')+rect(2,13,12,3,jacket)+rect(3,12,10,4,jacket)+rect(6,11,4,3,face);
    svg+=rect(4,4,8,8,face)+rect(3,5,1,5,face)+rect(12,5,1,5,face);
    svg+=rect(4,3,8,2,hair)+rect(3,4,2,4,hair)+rect(11,4,2,3,hair);
    if(hairStyle===0)svg+=rect(5,2,7,2,hair)+rect(12,4,2,2,hair);
    if(hairStyle===1)svg+=rect(3,2,10,2,hair)+rect(11,3,2,3,hair);
    if(hairStyle===2)svg+=rect(5,2,6,1,hair)+rect(3,3,2,3,hair);
    if(hairStyle===3)svg+=rect(4,2,8,2,hair)+rect(2,4,2,2,hair);
    svg+=rect(5,7,2,1,eye)+rect(10,7,2,1,eye)+rect(7,10,3,1,'#854e42');
    if(k%5===0)svg+=rect(4,7,4,1,'#1a2027')+rect(9,7,4,1,'#1a2027')+rect(8,7,1,1,'#1a2027');
    svg+=rect(6,13,1,3,'#c6e2eb')+rect(9,13,1,3,'#c6e2eb');
    if(team.includes('Ferrari'))svg+=rect(0,15,16,1,'#ff475d');
    svg+='</svg>';
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
  }
  function dateText(){
    const c=state();
    return api.dateOf(c).toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  }
  function tabButton(tab,label){
    return '<button type="button" data-v8-tab="'+tab+'" class="'+(st.careerTab===tab?'on':'')+'">'+label+'</button>';
  }
  const tabList=[['overview','Overview'],['race','Race weekend'],['training','Training'],['skills','Skills'],['contracts','Contracts'],['team','Team'],['connections','Friends & family'],['assets','Homes & cars'],['investments','Investments'],['legacy','Legacy'],['history','Diary']];
  function startPage(){
    return '<section class="main-tab v8-career"><div class="v8-hero"><span>THE PITWALL ARCHIVE / CAREER MODE</span>'+
      '<h2>Your racing story starts in karting.</h2><p>Begin at age 10. Race on weekends, train during the week and build a multigeneration motorsport career.</p></div>'+
      panel('Create your driver','<form id="v8-create" class="v8-form">'+
        '<label>Driver name<input name="driver" maxlength="26" required placeholder="Your driver’s name"></label>'+
        '<label>Gender (cosmetic only)<select name="gender"><option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option></select></label>'+
        '<label>Country of origin<select name="country">'+api.COUNTRIES.map(country=>'<option value="'+e(country)+'">'+e(country)+'</option>').join('')+'</select></label>'+
        '<p>Parent-funded karting ends at 16; scholarships and sponsors can help later. All cash, contracts, investing and results are simulated.</p>'+
        '<button class="v8-btn primary" type="submit">START CAREER →</button></form>')+'</section>';
  }
  function header(){
    const c=state();
    const seed=career.name.length+career.stage*11;
    return '<div class="v8-header">'+
      '<div class="v8-header-title"><span>THE PITWALL ARCHIVE / CAREER</span><strong>'+e(stageTitle())+' · Season '+c.season+'</strong></div>'+
      '<div class="v8-driver-identity"><img class="v8-pixel" src="'+pixelArt(seed,career.team)+'" alt="">'+
      '<div><h2>'+e(career.name)+'</h2><p>'+e(c.country)+' · '+age()+' years old · '+e(career.team)+'</p>'+
      '<small>'+e(dateText())+' · '+(api.isRaceDay()?'RACE SUNDAY':'DAY '+(c.day%7+1)+'/7')+'</small></div></div>'+
      '<div class="v8-header-stats"><div><span>BALANCE</span><strong>'+money(career.cash)+'</strong></div>'+
      '<div><span>REPUTATION</span><strong>'+Math.round(career.reputation)+'</strong></div>'+
      '<div><span>OVERALL</span><strong>'+api.pace()+'</strong></div>'+
      '<div><span>SKILL POINTS</span><strong>'+Math.round(career.skillPoints)+'</strong></div></div>'+
      '<div class="v8-header-end"><div><small>NEXT EVENT</small><b>'+
      (api.isRaceDay()?'Racing this weekend':api.daysUntilRace()+' days until Sunday')+
      '</b></div>'+btn('END DAY →','day','','', 'primary')+'</div></div>';
  }
  function overview(){
    const c=state();
    const req=nextStages[career.stage];
    const eligible=api.stageReady();
    return panel('Driver condition','<div class="v8-three">'+
      [['Energy',career.energy],['Fitness',career.fitness],['Morale',career.morale]].map(x=>
      '<div><span>'+x[0]+'</span><b>'+Math.round(x[1])+'/100</b><div class="v8-meter"><i style="width:'+progress(x[1])+'%"></i></div></div>').join('')+
      '</div>')+
      panel('Your next milestone','<p>'+(career.stage===4?'Establish a long Formula 1 career. Sign multi-season team contracts and manage your training.':
      'Promotion to '+e(stages[career.stage+1])+'. Minimum age '+api.years()+'/'+([16,17,18,18][career.stage]||18)+
      ', '+career.stageRaces+'/'+req.races+' races and '+career.reputation+'/'+req.min+' reputation.')+'</p>'+
      '<div class="v8-actions">'+btn('TRAIN TODAY','tab','training')+btn('RACE SCHEDULE','tab','race')+
      btn('CONTRACTS','tab','contracts')+'</div>'+
      (eligible?'<p class="v8-success">You are ready to apply for a promotion.</p>':'')+
      (c.scholarship&&!c.scholarship.active?'<div class="v8-highlight"><strong>ACADEMY SCHOLARSHIP OFFER</strong><p>An academy is offering paid karting support.</p>'+btn('ACCEPT SCHOLARSHIP','scholarship')+'</div>':'')+
      (c.scholarship?.active?'<p class="v8-success">Paid karting scholarship active · '+money(c.scholarship.weekly)+'/week.</p>':'')+
      (c.scout?.offered?'<p class="v8-success">F1 scout: '+e(c.scout.status)+'</p>':'')+
      '</div>')+
      panel('Daily paddock update','<p>'+e(c.lastEvent||'Your next step is waiting.')+'</p>'+
      '<p>Races happen on weekends. Training, work, sponsorship and friendships take place on normal weekdays.</p>')+
      panel('Save & restart','<p>Your existing career save is stored on this device. Restart will erase this career and its progress.</p>'+
      btn('RESTART CAREER','reset-arm','','', 'danger')+
      (resetArmed?'<div class="v8-warning"><p>Are you sure? This permanently resets this local career save.</p>'+btn('YES, ERASE CAREER','reset-confirm','','','danger')+
      btn('CANCEL','reset-cancel')+'</div>':''),'v8-reset-panel');
  }
  function racePage(){
    const c=state();
    const entry=[310,600,800,1000,0][career.stage];
    const covered=age()<16||(c.scholarship?.active&&career.stage===0);
    const allowed=api.isRaceDay()&&c.lastRaceDay!==c.day&&career.energy>=19&&
      (covered||career.cash>=entry)&&(career.stage<4||c.f1Deal);
    const countdown=api.isRaceDay()?'Race Sunday is here.':'Race in '+api.daysUntilRace()+' days.';
    const report=career.lastReport;
    return panel('Race weekend','<div class="v8-event">'+
      '<div><span>FICTIONAL '+e(stageTitle())+' CHAMPIONSHIP</span><h3>'+e(career.stage===4?
        data.races[c.seasonRaces%Math.max(1,data.races.length)]?.name||'Grand Prix':'Junior Motorsport Cup')+'</h3>'+
      '<p>'+countdown+' Only one race is possible per scheduled weekend.</p></div>'+
      '<div class="v8-three"><div><span>ENTRY FEE</span><b>'+money(covered?0:entry)+'</b></div>'+
      '<div><span>YOUR PACE</span><b>'+api.pace()+'</b></div>'+
      '<div><span>ENERGY</span><b>'+Math.round(career.energy)+'</b></div></div>'+
      btn(api.isRaceDay()?'SIMULATE WEEKEND RACE →':'RACE LOCKED UNTIL SUNDAY','race','',!allowed,'primary')+
      (c.lastRaceDay===c.day?'<p class="v8-hint">This weekend’s race is complete. End the day to continue.</p>':'')+
      (career.stage===4&&!c.f1Deal?'<p class="v8-hint">A signed Formula 1 seat is required.</p>':'')+
      '</div>')+
      (report?panel('Latest race result','<h3>P'+e(report.position)+' · '+e(report.title)+'</h3>'+
      '<p>'+e(report.date||'')+' · '+(report.rep>=0?'+':'')+e(report.rep)+' reputation · '+
      money(report.reward)+' fictional income.</p>'):'');
  }
  function training(){
    const c=state();
    return panel('Training facility','<p>Train once per in-game day to earn skill points. Spend them on unlimited levels in the Skills tab. Regular training helps offset later-career age effects.</p>'+
      '<div class="v8-list">'+api.TRAIN.map(x=>
      '<div class="v8-list-row"><div><strong>'+e(x.name)+'</strong><p>Uses '+x.energy+' energy · '+e(c.xp[x.id]||0)+'/70 progress to bonus point</p></div>'+
      btn(c.trainingDay===c.day?'TRAINED TODAY':'TRAIN','train',x.id,c.trainingDay===c.day||career.energy<x.energy)+'</div>').join('')+'</div>'+
      '<div class="v8-actions">'+btn('UPGRADE YOUR SKILLS','tab','skills')+'</div>');
  }
  function skills(){
    const c=state();
    return panel('Unlimited skill tree','<p>You have <b>'+career.skillPoints+' skill points</b>. There is no level cap, but every four levels increase upgrade costs and gains become gradually smaller.</p>'+
      api.TRAIN.map(x=>{
        const lvl=Number(c.skills[x.id])||0;
        const cost=1+Math.floor(lvl/4);
        return '<div class="v8-list-row"><div><strong>'+e(x.name)+' · Level '+lvl+'</strong>'+
          '<p>Next level: '+cost+' SP · '+Math.round(2.3*Math.log1p(lvl))+' current pace contribution</p></div>'+
          btn('LEVEL UP','skill',x.id,career.skillPoints<cost)+'</div>';
      }).join(''));
  }
  function contracts(){
    const c=state(),year=age();
    const req=nextStages[career.stage];
    let result=panel('Sponsors & funding','<p>'+(year<16?
      'Until your 16th birthday, your family covers junior karting entry fees.':
      'From age 16, you fund your motorsport journey through work, sponsors, scholarships and race results.')+'</p>'+
      (c.sponsors.length?c.sponsors.map(x=>'<div class="v8-list-row"><strong>'+e(x.name)+'</strong><b>'+money(x.weekly)+'/wk</b></div>').join(''):'<p>No sponsors signed yet.</p>')+
      (c.scholarship?.active?'<p>Scholarship: '+money(c.scholarship.weekly)+'/week.</p>':'')+
      (c.scholarship&&!c.scholarship.active?btn('ACCEPT ACADEMY SCHOLARSHIP','scholarship'):'')+
      '<div class="v8-actions">'+btn('PITCH A SPONSOR','sponsor','',year<16)+
      btn('WORK IN GARAGE','job','garage',year<16||career.energy<24)+
      btn('MEDIA SHIFT','job','media',year<16||career.energy<18)+'</div>');
    if(career.stage<4){
      result+=panel('Career progression','<p>Next level: '+e(stages[career.stage+1])+' · minimum age '+
        ([16,17,18,18][career.stage]||18)+'.</p><p>Races '+career.stageRaces+'/'+req.races+
        ' · Reputation '+career.reputation+'/'+req.min+'.</p>'+
        btn('APPLY FOR PROMOTION','promote','',!api.stageReady(),'primary')+
        (c.scout?.offered?'<div class="v8-highlight"><strong>F1 ACADEMY INTEREST</strong>'+
        '<p>'+e(c.scout.status)+'</p>'+btn('REQUEST F1 SCHOLARSHIP SEAT','scout-seat','','','primary')+'</div>':''));
    }else{
      result+=panel('Formula 1 team contracts','<p>Fictional multi-million dollar annual contracts. Offers depend on your reputation, training and team competitiveness.</p>'+
        (c.f1Deal?'<div class="v8-highlight"><strong>YOUR CONTRACT</strong><p>'+e(c.f1Deal.team)+' · '+
        money(c.f1Deal.salary)+'/year · '+c.f1Deal.years+' seasons.</p></div>':'<p>Currently seeking a team seat.</p>')+
        teams.map(t=>'<div class="v8-list-row"><div><strong>'+e(t.name)+'</strong>'+
        '<p>Team rating '+t.power+' · Minimum reputation '+Math.max(70,Math.round(t.min*.72))+'</p></div>'+
        btn('APPLY','sign',t.name,career.reputation<Math.max(70,Math.round(t.min*.72))||c.f1Deal?.team===t.name)+'</div>').join(''));
    }
    return result;
  }
  function people(){
    const c=state();
    api.ensureStaff();
    return panel('Team headquarters','<p>Meet your fictional race engineer, strategist, mechanics, media team and teammate. Building friendships can improve morale and teamwork.</p>'+
      '<div class="v8-staff-grid">'+c.staff.map(p=>personCard(p)).join('')+'</div>');
  }
  function personCard(p){
    const c=state(),friend=c.relations[p.id]||0;
    const canDate=age()>=18&&p.age>=18&&friend>=40;
    return '<div class="v8-person"><div class="v8-person-top"><img class="v8-pixel" src="'+pixelArt(p.portrait,p.team)+'" alt="">'+
      '<div><strong>'+e(p.name)+'</strong><small>'+e(p.role)+' · '+p.age+' yrs</small>'+
      '<small>Friendship '+friend+'/100'+(c.partner===p.id?' · Partner':'')+'</small></div></div>'+
      '<div class="v8-actions">'+btn('CHAT','chat',p.id,c.relationsDay===c.day)+
      btn('DATE','date',p.id,!canDate||c.relationsDay===c.day)+'</div></div>';
  }
  function connections(){
    const c=state();
    const spouse=c.contacts?.[c.partner]||null;
    return panel('Friends & connections','<p>Chat with team members or develop adult relationships at your own pace. Dating requires both characters to be adults.</p>'+
      '<div class="v8-staff-grid">'+c.staff.map(p=>personCard(p)).join('')+'</div>')+
      panel('Family & partner','<p>'+ (spouse?e(spouse.name)+(c.married?' · Married':' · Dating'):
      'No current partner. Friendships are available at every age; adult relationships unlock at 18.')+'</p>'+
      btn('PROPOSE MARRIAGE','marry','',age()<21||!c.partner||c.married||((c.relations[c.partner]||0)<75))+
      (c.married?'<p class="v8-success">Your driver is married. Family legacy options are available.</p>':'')+
      '<div class="v8-actions">'+btn('OPEN LEGACY','tab','legacy')+'</div>');
  }
  function assets(){
    const c=state();
    return panel('Your property collection','<p>You may own multiple houses and cars at once. All purchases are fictional; selling returns 65% of the original game price. Upkeep is charged weekly.</p>'+
      '<div class="v8-property-count"><span>'+c.homes.length+' properties</span><span>'+c.cars.length+' vehicles</span></div>'+
      api.PROPERTY.map(x=>{
        const owned=(x.kind==='home'?c.homes:c.cars).includes(x.id);
        return '<div class="v8-list-row"><div><strong>'+e(x.name)+'</strong><p>'+
          (x.kind==='home'?'HOUSE':'CAR')+' · '+money(x.cost)+' · '+money(x.upkeep)+'/wk upkeep</p></div>'+
          (owned?btn('SELL','sell',x.id):btn('BUY','buy',x.id,career.cash<x.cost))+'</div>';
      }).join(''));
  }
  function investments(){
    const c=state();
    return panel('Historical investment laboratory','<p><b>Educational simulation — virtual money only.</b> Each case study uses a real historical company event, but all prices and outcomes below are fictional examples. They are not historical share prices, investment advice or a market feed.</p>'+
      '<p>Case-study index steps forward once per game week; outcomes can rise or fall.</p>'+
      api.CASES.map(x=>{
        const holding=c.investments[x.id],step=c.marketTick%x.steps.length;
        const price=Math.max(1,Math.round(100*Math.pow(1+x.steps[step]/100,
          Math.floor(c.marketTick/x.steps.length))*(1+x.steps[step]/100)));
        const value=holding?Math.round(holding.units*price):0;
        const difference=holding?value-holding.basis:0;
        return '<div class="v8-case"><strong>'+e(x.name)+'</strong><p>'+e(x.event)+'</p>'+
          '<div class="v8-invest-meta"><span>Illustrative index '+price+'</span>'+
          '<span>Owned value '+money(value)+'</span>'+
          (holding?'<span>Change '+(difference>=0?'+':'')+money(difference)+'</span>':'')+'</div>'+
          '<div class="v8-actions">'+btn('ALLOCATE UP TO 2,000','invest-buy',x.id,career.cash<100)+
          btn('CLOSE HOLDING','invest-sell',x.id,!holding)+'</div></div>';
      }).join(''));
  }
  function legacy(){
    const c=state();
    return panel('Family legacy','<p>Build a fictional family, then pass your racing story to an adult or near-adult successor when you retire. Dating requires both characters to be adults, and marriage/family choices begin at 21.</p>'+
      (c.ancestors?.length?'<h4>Retired generations</h4>'+c.ancestors.map(a=>
        '<div class="v8-list-row"><strong>'+e(a.name)+'</strong><span>'+a.races+' races · '+a.wins+' wins</span></div>').join(''):'')+
      '<div class="v8-actions">'+btn('EXPAND FAMILY','child','',!c.married||age()<21)+'</div>'+
      (c.kids.length?c.kids.map(k=>{
        const yearsOld=Math.max(0,Math.floor((c.day-k.birthDay)/365));
        return '<div class="v8-list-row"><div><strong>'+e(k.name)+' · Age '+yearsOld+'</strong>'+
          '<p>Interest: '+e(k.job)+' · Can choose motorsport when taking over</p></div>'+
          btn('PLAY AS CHILD','successor',k.id,yearsOld<16||age()<35)+'</div>';
      }).join(''):'<p>No children in this career yet.</p>')+
      '<p class="v8-hint">Your current driver must be 35+ and the chosen child 16+ for retirement handover. Multiple children may have different career interests.</p>');
  }
  function history(){
    const c=state();
    return panel('Career archive','<p>'+career.raceCount+' total races · '+career.wins+' wins · '+c.season+' career seasons.</p>'+
      (career.history.length?career.history.slice().reverse().slice(0,55).map(h=>
        '<div class="v8-list-row"><div><strong>P'+e(h.position)+' · '+e(h.title)+'</strong><p>'+
        e(h.date||'Week '+h.week)+' · '+e(h.team||'')+'</p></div>'+
        '<span>'+e((h.rep>=0?'+':'')+h.rep)+' REP</span></div>').join(''):'<p>Race results will appear here after your first weekend.</p>'));
  }
  let resetArmed=false;
  function careerView(){
    if(!career)return startPage();
    api.migrate();api.ensureStaff();
    const views={overview,race:racePage,training,skills,contracts,team:people,connections,assets,investments,legacy,history};
    const view=views[st.careerTab]||overview;
    return '<section class="main-tab v8-career">'+header()+
      '<nav class="v8-tabs" aria-label="Career sections">'+tabList.map(t=>tabButton(t[0],t[1])).join('')+'</nav>'+
      '<div class="v8-content">'+view()+'</div>'+
      '<p class="v8-disclaimer">Independent fictional motorsport simulator. Driver/team staff, race outcomes, offers, finances and simulated historical investment indexes are made up. Saves remain on your device.</p>'+
      '</section>';
  }
  careerPage=careerView;
  setup=startPage;
  document.addEventListener('submit',event=>{
    if(event.target.id!=='v8-create')return;
    event.preventDefault();
    const values=new FormData(event.target);
    const name=String(values.get('driver')||'').trim();
    if(!name)return toast('Enter a driver name.');
    api.start(name,String(values.get('gender')||'Prefer not to say'),String(values.get('country')||'Australia'));
    st.careerTab='overview';render();toast('Your karting career begins!');
  });
  document.addEventListener('click',event=>{
    const nav=event.target.closest('[data-v8-tab]');
    if(nav){st.careerTab=nav.dataset.v8Tab;resetArmed=false;render();return;}
    const btn=event.target.closest('[data-v8-action]');
    if(!btn||btn.disabled)return;
    const action=btn.dataset.v8Action,id=btn.dataset.v8Id;
    switch(action){
      case 'tab':st.careerTab=id;resetArmed=false;render();break;
      case 'day':api.daily();break;
      case 'race':api.race();break;
      case 'train':api.train(id);break;
      case 'skill':api.upgrade(id);break;
      case 'job':api.job(id);break;
      case 'sponsor':api.seekSponsor();break;
      case 'scholarship':api.acceptScholarship();break;
      case 'promote':api.promote();break;
      case 'scout-seat':api.scoutSeat();break;
      case 'sign':api.signF1(id);break;
      case 'chat':api.relationship(id,'chat');break;
      case 'date':api.relationship(id,'date');break;
      case 'marry':api.marry();break;
      case 'child':api.child();break;
      case 'successor':api.successor(id);break;
      case 'buy':api.buy(id);break;
      case 'sell':api.sell(id);break;
      case 'invest-buy':api.invest(id,'buy');break;
      case 'invest-sell':api.invest(id,'sell');break;
      case 'reset-arm':resetArmed=true;render();break;
      case 'reset-cancel':resetArmed=false;render();break;
      case 'reset-confirm':resetArmed=false;api.restart();break;
    }
  });
  window.pitwallCareer8.portrait=pixelArt;
  render();
})();