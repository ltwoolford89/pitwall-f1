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
    // Original 24x24 artwork with crisp edges and distinct seeded features.
    // No real person's portrait or copyrighted team imagery is embedded.
    const k=Math.abs(Number(seed)||0);
    const skins=['#c38b68','#e0af8d','#9b6a55','#d5a080','#ab755c','#b9957b'];
    const hairs=['#2a1c1b','#523326','#9b6944','#171e27','#a77133','#63474b'];
    const tops=['#246779','#b63049','#308976','#315c9c','#d9882c','#845ea6'];
    const skin=skins[(k*7)%skins.length],hair=hairs[(k*3+1)%hairs.length];
    const uniform=tops[(k*11+2)%tops.length];
    const bg=['#192d40','#1c384b','#233447','#1a3347'][k%4];
    const rect=(x,y,w,h,c)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"/>';
    const parts=[
      rect(0,0,24,24,bg),rect(1,1,22,22,'#294559'),
      rect(3,20,18,4,uniform),rect(5,18,14,6,uniform),rect(9,17,6,4,skin),
      rect(6,7,12,11,skin),rect(5,10,1,5,skin),rect(18,10,1,5,skin),
      rect(6,5,12,4,hair),rect(5,7,3,4,hair),rect(17,7,2,4,hair),
      rect(9,11,2,1,'#26252a'),rect(15,11,2,1,'#26252a'),
      rect(12,12,1,3,'#aa7058'),rect(11,16,4,1,'#8f5546'),
      rect(8,19,2,5,'#e0eff7'),rect(16,19,2,5,'#e0eff7'),
      rect(10,20,6,2,'#1c354b')
    ];
    if(k%4===0)parts.push(rect(6,3,12,3,hair),rect(18,5,2,4,hair));
    if(k%4===1)parts.push(rect(5,4,11,2,hair),rect(4,7,2,6,hair));
    if(k%4===2)parts.push(rect(9,3,7,3,hair),rect(17,4,2,5,hair));
    if(k%4===3)parts.push(rect(5,3,14,2,hair),rect(19,6,1,5,hair));
    if(k%5===0)parts.push(rect(8,11,4,1,'#102335'),rect(14,11,4,1,'#102335'),rect(12,11,2,1,'#102335'));
    if(k%3===0)parts.push(rect(7,17,10,1,'#875647'));
    if(k%6===0)parts.push(rect(10,16,5,1,'#4e342d'));
    if(team.includes('Ferrari'))parts.push(rect(1,23,22,1,'#ef4159'));
    if(team.includes('Mercedes'))parts.push(rect(1,23,22,1,'#3cd4c6'));
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" shape-rendering="crispEdges">'+parts.join('')+'</svg>';
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
      (c.v82?.sponsorOffers?.filter(o=>o.expiresDay>=c.day).map(o=>
        '<div class="v8-list-row"><div><strong>'+e(o.name)+' · Offer</strong>'+
        '<p>'+money(o.weekly)+'/week · '+Math.max(0,o.expiresDay-c.day)+' days left</p></div>'+
        btn('ACCEPT','accept-sponsor',o.name)+'</div>').join('')||'')+
      '<div class="v8-actions">'+btn('PITCH A SPONSOR','sponsor','',year<16)+
      btn('WORK IN GARAGE','job','garage',year<16||career.energy<24)+
      btn('MEDIA SHIFT','job','media',year<16||career.energy<18)+'</div>');
    if(career.stage<4||c.v82?.academy){
      const expanded=c.v82||{};
      const academy=expanded.academy;
      const assessment=expanded.lastAssessment;
      const available=(expanded.offers||[]).filter(o=>o.expiresDay>=c.day);
      const seat=api.seatEvaluation?.();
      result+=panel('Academy & scout reports',
        '<p>Choose from fictional junior academy offers. Coaching, weekly funding and performance reviews may lead to a conditional Formula 1 opportunity. A sustained downturn can put an agreement at risk.</p>'+
        (academy?'<div class="v8-academy">'+
          '<strong>'+e(academy.name)+'</strong><span class="v8-mini-status">'+e(academy.status)+'</span>'+
          '<p>F1 pathway: '+e(academy.partner)+' · '+money(academy.weekly)+'/week · Assessment '+academy.grade+'/100</p>'+
          '<p>Scout review: '+e(assessment?.verdict||'Awaiting first competitive assessment')+
          (seat?' · '+e(seat.reason):'')+'</p>'+
          (seat?.eligible?btn('REQUEST ACADEMY F1 SEAT','academy-seat','',false,'primary'):'')+
          '</div>':'<p>No academy signed. Strong karting results may attract competing programmes.</p>')+
        (available.length?'<div class="v8-list">'+available.map(o=>
          '<div class="v8-list-row"><div><strong>'+e(o.name)+'</strong>'+
          '<p>'+e(o.partner)+' junior affiliation · '+money(o.grant)+' grant · '+money(o.weekly)+'/week</p>'+
          '<p>Offer expires in '+Math.max(0,o.expiresDay-c.day)+' days</p></div>'+
          btn('ACCEPT','academy',o.id,!!academy)+'</div>').join('')+'</div>':'')+
        (expanded.reviewResults?.length?'<p>Recent evaluations: '+
          expanded.reviewResults.slice(-5).map(g=>'P'+g.position+' · '+g.grade+'/100').join(' · ')+'</p>':''));
    }
    if(career.stage<4){
      result+=panel('Career progression','<p>Next level: '+e(stages[career.stage+1])+' · minimum age '+
        ([16,17,18,18][career.stage]||18)+'.</p><p>Races '+career.stageRaces+'/'+req.races+
        ' · Reputation '+career.reputation+'/'+req.min+'.</p>'+
        btn('APPLY FOR PROMOTION','promote','',!api.stageReady(),'primary')+
        (c.scout?.offered&&!c.v82?.academy?'<div class="v8-highlight"><strong>F1 ACADEMY INTEREST</strong>'+
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
    const mood=api.teamMood?.()||{average:0,label:'Developing'};
    return panel('Team headquarters','<p>Meet your fictional engineer, strategist, mechanics, media staff and teammate. Their unique personalities affect team trust, morale and your racing development.</p>'+
      '<div class="v8-team-mood"><strong>'+e(mood.label)+'</strong><span>Team friendship average '+mood.average+'/100</span></div>'+
      '<div class="v8-staff-grid">'+c.staff.map(p=>personCard(p)).join('')+'</div>');
  }
  function personCard(p){
    const c=state(),friend=c.relations[p.id]||0;
    const profile=c.v82?.socialProfiles?.[p.id]||{};
    const npcAge=api.personAge?.(p.id)||p.age;
    const canDate=age()>=18&&npcAge>=18&&friend>=40;
    const used=c.relationsDay===c.day;
    return '<div class="v8-person"><div class="v8-person-top"><img class="v8-pixel" src="'+pixelArt(p.portrait,p.team)+'" alt="">'+
      '<div><strong>'+e(p.name)+'</strong><small>'+e(p.role)+' · '+npcAge+' yrs</small>'+
      (p.isF1Teammate?'<small>Current F1 teammate · generated portrait is illustrative only</small>':'')+
      '<small>'+e(profile.personality||'Thoughtful')+' · Friendship '+friend+'/100'+
      (c.partner===p.id?' · Partner':'')+'</small></div></div>'+
      '<p class="v8-npc-trait">Likes: '+e(profile.likes||'Teamwork')+
      ' · '+e(profile.moments||0)+' shared activities</p>'+
      '<div class="v8-actions">'+btn('CHAT','chat',p.id,used)+
      btn('LISTEN','listen',p.id,used)+btn('WORK TOGETHER','collaborate',p.id,used)+
      btn('DISAGREE','disagree',p.id,used)+
      btn('DATE','date',p.id,!canDate||used)+'</div></div>';
  }
  function connections(){
    const c=state();
    const spouse=c.contacts?.[c.partner]||null;
    return panel('Friends & connections','<p>Meet independent friends and team colleagues. Their personalities and shared experiences are saved across team moves. Adult dating is optional and requires both characters to be 18 or older.</p>'+
      '<div class="v8-staff-grid">'+c.staff.concat(api.peopleProfiles?.()||[]).map(p=>personCard(p)).join('')+'</div>')+
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
          '<p>'+e(api.childProgress?.(k.id)?.work||k.job)+
          ' · '+e(api.childProgress?.(k.id)?.education||'Growing up')+
          ' · Talent '+e(api.childProgress?.(k.id)?.talent??'—')+
          '/100 · Motorsports interest '+e(api.childProgress?.(k.id)?.racingInterest??'—')+'/100</p>'+
          '<p>Milestones: '+e((api.childProgress?.(k.id)?.milestones||[]).slice(-2).join(' · ')||'Still developing')+'</p></div>'+
          '<div class="v8-heir-actions">'+btn('RACING HOBBY','child-racing',k.id,c.relationsDay===c.day)+
          btn('SUPPORT LEARNING','child-school',k.id,c.relationsDay===c.day)+
          btn('PLAY AS CHILD','successor',k.id,yearsOld<16||age()<35)+'</div></div>';
      }).join(''):'<p>No children in this career yet.</p>')+
      (c.v82?.familyArchive?.length?'<h4>Other family careers</h4>'+
        c.v82.familyArchive.map(p=>'<div class="v8-list-row"><div><strong>'+e(p.name)+'</strong><p>'+e(p.job)+' · Age '+p.age+'</p></div></div>').join(''):'')+
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
      case 'academy':api.acceptAcademy(id);break;
      case 'academy-seat':api.requestAcademySeat();break;
      case 'accept-sponsor':api.acceptSponsor(id);break;
      case 'listen':case 'collaborate':case 'disagree':api.socialInteraction(id,action);break;
      case 'child-racing':api.encourageChild(id,'racing');break;
      case 'child-school':api.encourageChild(id,'school');break;
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