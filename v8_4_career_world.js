/* PITWALL V8.4 — simulated championships, fictional F1 driver market,
   energy-based social actions and structured career portfolio.
   Real-world team/driver names are starting references only; all subsequent
   results, transfers, contracts and money are fictional. */
'use strict';
(function(){
  const api=window.pitwallCareer8;
  if(!api)return;
  const old={
    migrate:api.migrate,start:api.start,daily:api.daily,race:api.race,
    promote:api.promote,signF1:api.signF1,scoutSeat:api.scoutSeat,
    academySeat:api.requestAcademySeat,successor:api.successor,
    ensureStaff:api.ensureStaff,peopleProfiles:api.peopleProfiles,
    socialInteraction:api.socialInteraction,relationship:api.relationship,
    job:api.job,seekSponsor:api.seekSponsor,acceptSponsor:api.acceptSponsor,
    acceptAcademy:api.acceptAcademy,buy:api.buy,sell:api.sell,
    buyItem:api.buyItem,sellItem:api.sellItem,joinPlan:api.joinPlan,
    cancelPlan:api.cancelPlan,invest:api.invest,train:api.train,
    child:api.child,encourageChild:api.encourageChild
  };
  const POINTS=[25,18,15,12,10,8,6,4,2,1];
  const NAMES=['Emil Keller','Matteo Ricci','Aiden Brooks','Noah Bianchi','Leo Tanaka',
    'Oscar Meyer','Iker Navarro','Elliot Hayes','Sasha Moreau','Theo Costa','Luca Moretti','Kiran Shah'];
  const CARS=[
    {id:'civic',kind:'car',name:'Honda Civic',cost:36000,upkeep:23},
    {id:'corolla',kind:'car',name:'Toyota Corolla',cost:34000,upkeep:20},
    {id:'golfgti',kind:'car',name:'Volkswagen Golf GTI',cost:58500,upkeep:39},
    {id:'impreza',kind:'car',name:'Subaru WRX',cost:59000,upkeep:47},
    {id:'i30n',kind:'car',name:'Hyundai i30 N',cost:54500,upkeep:35},
    {id:'mustang',kind:'car',name:'Ford Mustang GT',cost:90000,upkeep:61},
    {id:'supra',kind:'car',name:'Toyota GR Supra',cost:100000,upkeep:73},
    {id:'type-r',kind:'car',name:'Honda Civic Type R',cost:75000,upkeep:54},
    {id:'model3',kind:'car',name:'Tesla Model 3',cost:65000,upkeep:30},
    {id:'taycan',kind:'car',name:'Porsche Taycan',cost:250000,upkeep:125},
    {id:'gtr',kind:'car',name:'Nissan GT-R',cost:225000,upkeep:130},
    {id:'db12',kind:'car',name:'Aston Martin DB12',cost:480000,upkeep:240},
    {id:'roma',kind:'car',name:'Ferrari Roma',cost:510000,upkeep:255},
    {id:'huracan',kind:'car',name:'Lamborghini Huracán',cost:740000,upkeep:340},
    {id:'spectre',kind:'car',name:'Rolls-Royce Spectre',cost:880000,upkeep:390}
  ];
  const EXTRA_TRAIN=[
    {id:'starts',name:'Race-start reaction practice',energy:15,fitness:0},
    {id:'tyres',name:'Tyre and strategy study',energy:12,fitness:0},
    {id:'mechanics',name:'Engineering workshops',energy:15,fitness:0},
    {id:'leadership',name:'Leadership skills',energy:12,fitness:0},
    {id:'adaptation',name:'Track adaptation exercises',energy:17,fitness:1}
  ];
  const HISTORY_CASES=[
    {id:'sony',name:'Sony · PlayStation 2 success (2000)',company:'Sony',year:2000,
      event:'PlayStation 2 launched in 2000.',steps:[6,-3,7,2,-4,5]},
    {id:'tesla',name:'Tesla · Model 3 production (2017)',company:'Tesla',year:2017,
      event:'Model 3 deliveries began in 2017.',steps:[-8,12,-5,8,-7,4]},
    {id:'amd',name:'AMD · Ryzen launch (2017)',company:'AMD',year:2017,
      event:'The first Ryzen processors launched in 2017.',steps:[4,8,-6,5,9,-4]}
  ];
  for(const v of CARS)if(!api.PROPERTY.some(x=>x.id===v.id))api.PROPERTY.push(v);
  for(const v of EXTRA_TRAIN)if(!api.TRAIN.some(x=>x.id===v.id))api.TRAIN.push(v);
  for(const v of HISTORY_CASES)if(!api.CASES.some(x=>x.id===v.id))api.CASES.push(v);
  const keyName=d=>String(d.first||'').trim()+' '+String(d.last||'').trim();
  const toId=s=>'drv-'+String(s).replace(/[^A-Za-z0-9]/g,'').toUpperCase();
  const scoreFor=pos=>POINTS[pos-1]||0;
  const randint=(from,to)=>Math.floor(Math.random()*(to-from+1))+from;
  const teams=()=>typeof data!=='undefined'&&Array.isArray(data.constructors)&&data.constructors.length?
    Array.from(new Set(data.constructors.map(t=>t.team))):
    ['Mercedes','Ferrari','McLaren','Red Bull Racing','Williams','Aston Martin','Audi','Haas','Alpine','Racing Bulls','Cadillac'];
  function canon(name){
    const n=String(name||'').toLowerCase().trim();
    return teams().find(t=>t.toLowerCase()===n)||
      (n==='red bull'?'Red Bull Racing':n==='rb'?'Racing Bulls':null);
  }
  function initRoster(){
    const teamNames=teams();
    const activeDrivers=(data.drivers||[]).filter(d=>d&&d.code&&canon(d.team));
    const entries={},pools={};
    for(const d of activeDrivers){
      const id=toId(d.code);
      entries[id]={id,name:keyName(d),team:canon(d.team),ability:Math.max(44,Math.min(95,
        60+Math.round((Number(d.points)||0)/22)+randint(-2,3))),
        realReference:true,number:d.code};
      (pools[entries[id].team]??=[]).push(id);
    }
    const roster={},free=[];
    for(const t of teamNames){
      const ids=(pools[t]||[]).slice().sort((a,b)=>entries[b].ability-entries[a].ability);
      roster[t]=ids.slice(0,2);
      free.push(...ids.slice(2));
    }
    let counter=0;
    for(const t of teamNames)while(roster[t].length<2){
      const id='academy-'+counter++,name=NAMES[counter%NAMES.length];
      entries[id]={id,name,team:t,ability:randint(47,68),realReference:false};
      roster[t].push(id);
    }
    return {roster,drivers:entries,freeAgents:free,transfers:[],
      initializedAt:'2026 driver snapshot',marketYear:1};
  }
  function state(){
    const c=old.migrate();
    if(!c)return null;
    if(!c.v84){
      c.v84={
        version:4,finance:[],raceHistory:[],titles:[],roster:initRoster(),
        championship:null,marketEvents:[],lastSocialDay:-1,socialCounts:{},
        stageStats:{},seasonSummaries:[],addedAt:c.day
      };
    }
    const x=c.v84;
    for(const field of ['finance','raceHistory','titles','marketEvents','seasonSummaries'])
      if(!Array.isArray(x[field]))x[field]=[];
    x.socialCounts=x.socialCounts||{};
    x.stageStats=x.stageStats||{};
    if(!x.roster||!x.roster.roster||!x.roster.drivers)x.roster=initRoster();
    if(!Array.isArray(x.roster.freeAgents))x.roster.freeAgents=[];
    if(!Array.isArray(x.roster.transfers))x.roster.transfers=[];
    if(!x.championship)resetChampionship(c,x);
    return {c,x};
  }
  function journal(kind,amount,desc,source=''){
    const z=state();if(!z)return;
    const n=Math.round(Number(amount)||0);
    if(!n)return;
    z.x.finance.push({day:z.c.day,year:z.c.season,kind,
      amount:n,description:desc,source:source||kind});
    if(z.x.finance.length>1500)z.x.finance=z.x.finance.slice(-1500);
  }
  function notify(message){save();render();if(typeof toast==='function')toast(message);}
  function resetChampionship(c,x){
    const series=career.stage===4?'Formula 1':
      ['Karting','Formula 4','Formula 3','Formula 2'][career.stage]||'Junior racing';
    const grid=career.stage===4?Object.values(x.roster.roster).flat():
      Array.from({length:17},(_,i)=>'junior-'+i);
    const entries={};
    for(const id of grid){
      if(id==='player')continue;
      const d=x.roster.drivers[id];
      entries[id]=d?{name:d.name,team:d.team,ability:d.ability,points:0,wins:0,podiums:0}:
        {name:NAMES[Number(id.split('-')[1])%NAMES.length],team:'Junior '+(Number(id.split('-')[1])%6+1),
         ability:randint(46,74),points:0,wins:0,podiums:0};
    }
    entries.player={name:career.name,team:career.team,ability:0,points:0,wins:0,podiums:0,isPlayer:true};
    x.championship={series,stage:career.stage,season:c.season,entries,rounds:[],teams:{},totalRounds:0};
  }
  function rollover(){
    const z=state(),{c,x}=z;
    const champ=x.championship;
    if(!champ||champ.stage!==career.stage||champ.season!==c.season){
      if(champ&&champ.rounds.length){
        const leader=ladder(champ)[0];
        const isWinner=leader?.id==='player';
        x.seasonSummaries.push({
          season:champ.season,series:champ.series,rounds:champ.rounds.length,
          champion:leader?.name||'Not determined',won:isWinner,
          driverPoints:champ.entries.player?.points||0,
          finalRank:ladder(champ).findIndex(y=>y.id==='player')+1
        });
        if(isWinner){
          x.titles.push({season:champ.season,series:champ.series,
            points:champ.entries.player.points});
        }
      }
      resetChampionship(c,x);
    }
  }
  function ladder(champ=state()?.x.championship){
    if(!champ)return [];
    return Object.entries(champ.entries).map(([id,d])=>({id,...d})).sort((a,b)=>
      b.points-a.points||b.wins-a.wins||b.podiums-a.podiums||a.name.localeCompare(b.name));
  }
  function constructors(champ=state()?.x.championship){
    if(!champ)return [];
    const list=new Map();
    for(const d of Object.values(champ.entries)){
      const name=canon(d.team)||d.team||'Independent';
      const row=list.get(name)||{team:name,points:0,wins:0};
      row.points+=Number(d.points)||0;row.wins+=Number(d.wins)||0;
      list.set(name,row);
    }
    return [...list.values()].sort((a,b)=>b.points-a.points||b.wins-a.wins||a.team.localeCompare(b.team));
  }
  function roster(){
    return state()?.x.roster;
  }
  function marketLine(description,kind='transfer'){
    const z=state();if(!z)return;
    z.x.marketEvents.unshift({day:z.c.day,kind,description});
    z.x.marketEvents=z.x.marketEvents.slice(0,70);
  }
  function getTeammate(){
    const book=roster(),team=canon(career.team);
    if(!book||!team)return null;
    const mate=(book.roster[team]||[]).find(id=>id!=='player');
    return mate?book.drivers[mate]||null:null;
  }
  function enterTeam(name){
    const z=state(),book=z.x.roster,newTeam=canon(name);
    if(!newTeam)return;
    const oldTeam=Object.keys(book.roster).find(t=>(book.roster[t]||[]).includes('player'));
    if(oldTeam===newTeam)return;
    // Return a reserve driver to the abandoned seat where possible.
    if(oldTeam){
      book.roster[oldTeam]=book.roster[oldTeam].filter(id=>id!=='player');
      const original=book.freeAgents.find(id=>book.drivers[id]?.team===oldTeam);
      const replacement=original||book.freeAgents[0];
      if(replacement){
        book.freeAgents=book.freeAgents.filter(id=>id!==replacement);
        book.roster[oldTeam].push(replacement);
        book.drivers[replacement].team=oldTeam;
        marketLine(book.drivers[replacement].name+' joins '+oldTeam+' in your former seat.');
      }
    }
    const seats=book.roster[newTeam]||(book.roster[newTeam]=[]);
    if(seats.length>=2){
      const remove=seats.slice().sort((a,b)=>
        (book.drivers[a]?.ability||50)-(book.drivers[b]?.ability||50))[0];
      book.roster[newTeam]=seats.filter(id=>id!==remove);
      if(!book.freeAgents.includes(remove))book.freeAgents.push(remove);
      if(book.drivers[remove])marketLine(book.drivers[remove].name+' becomes an F1 free agent after losing a seat at '+newTeam+'.');
    }
    book.roster[newTeam].push('player');
    const champ=z.x.championship;
    if(!champ||champ.stage!==career.stage||(champ.stage===4&&!champ.rounds.length))
      resetChampionship(z.c,z.x);
    marketLine(career.name+' signs for '+newTeam+'. Your new teammate is '+(getTeammate()?.name||'to be confirmed')+'.');
  }
  function leaveSeat(){
    const book=roster();
    if(!book)return;
    const t=Object.keys(book.roster).find(t=>book.roster[t].includes('player'));
    if(!t)return;
    book.roster[t]=book.roster[t].filter(id=>id!=='player');
    const next=book.freeAgents.find(id=>book.drivers[id]?.team===t)||book.freeAgents[0];
    if(next){
      book.freeAgents=book.freeAgents.filter(id=>id!==next);
      book.roster[t].push(next);
      book.drivers[next].team=t;
      marketLine(book.drivers[next].name+' replaces your driver at '+t+'.');
    }
  }
  function driverMarket(){
    const z=state(),book=z.x.roster;
    const options=Object.entries(book.roster).filter(([t,ids])=>!ids.includes('player')&&ids.length===2);
    if(options.length<2)return;
    const a=options[randint(0,options.length-1)];
    const b=options.find(x=>x[0]!==a[0]);
    if(!b)return;
    const aId=a[1][randint(0,1)],bId=b[1][randint(0,1)];
    a[1][a[1].indexOf(aId)]=bId;
    b[1][b[1].indexOf(bId)]=aId;
    book.drivers[aId].team=b[0];
    book.drivers[bId].team=a[0];
    marketLine(book.drivers[aId].name+' joins '+b[0]+'; '+book.drivers[bId].name+' signs for '+a[0]+'.');
  }
  function registerRace(record,preTeam){
    const z=state(),{c,x}=z;
    rollover();
    const champ=x.championship;
    const playerId='player';
    champ.entries.player.name=career.name;
    champ.entries.player.team=canon(preTeam)||preTeam;
    const grid=career.stage===4?
      Object.values(x.roster.roster).flat().filter(id=>id!=='player'):
      Object.keys(champ.entries).filter(id=>id!=='player');
    for(const id of grid)if(!champ.entries[id]){
      const info=x.roster.drivers[id];
      champ.entries[id]={name:info?.name||'Reserve Driver',
        team:info?.team||'Independent',ability:info?.ability||52,points:0,wins:0,podiums:0};
    }
    // Every driver gets one unique classified position. The player occupies
    // their actual position from the race simulator; rivals fill the others.
    const playerPos=Math.max(1,Math.min(grid.length+1,Number(record.position)||1));
    const opponents=grid.map(id=>{
      const v=champ.entries[id];
      const ability=(v.ability||60)+(teams().indexOf(v.team)%3)*1.3;
      return {id,v,roll:ability*.55+Math.random()*34};
    }).sort((a,b)=>b.roll-a.roll);
    const positions=[];
    let idx=0;
    for(let pos=1;pos<=grid.length+1;pos++){
      if(pos===playerPos){positions.push({position:pos,id:'player',name:career.name,team:preTeam,points:scoreFor(pos)});continue;}
      const next=opponents[idx++];
      positions.push({position:pos,id:next.id,name:next.v.name,team:next.v.team,points:scoreFor(pos)});
    }
    for(const row of positions){
      const driver=champ.entries[row.id];
      driver.points=(Number(driver.points)||0)+row.points;
      if(row.position===1)driver.wins=(Number(driver.wins)||0)+1;
      if(row.position<=3)driver.podiums=(Number(driver.podiums)||0)+1;
    }
    const race={day:c.day,round:champ.rounds.length+1,name:record.title||'Race weekend',
      stage:career.stage,series:champ.series,season:c.season,playerPosition:playerPos,
      finishingOrder:positions.map(y=>({...y}))};
    champ.rounds.push(race);
    champ.totalRounds=champ.rounds.length;
    x.raceHistory.push({...race,earnings:record.reward||0,team:preTeam,reputation:record.rep||0});
    if(x.raceHistory.length>500)x.raceHistory=x.raceHistory.slice(-500);
    const stageKey=String(career.stage);
    const stats=x.stageStats[stageKey]||{starts:0,wins:0,podiums:0,points:0};
    stats.starts++;stats.wins+=playerPos===1?1:0;stats.podiums+=playerPos<=3?1:0;
    stats.points+=scoreFor(playerPos);
    x.stageStats[stageKey]=stats;
    if(career.stage===4){
      // The original F1 career totals remain intact, including results from
      // before this optional rival-simulation feature was installed. The
      // new ladder is explicitly a from-upgrade simulated championship.
      career.f1DriverPoints=career.f1DriverPoints||{};
      career.f1TeamPoints=career.f1TeamPoints||{};
    }
    journal('Race prizes',record.reward||0,(record.title||'Race')+' · P'+playerPos,'Race winnings');
  }
  function daily(){
    const z=state(),startDay=z?.c.day??-1,wasSeason=z?.c.season,prior=career?.cash||0;
    old.daily();
    if(!career||career.v8.day===startDay)return;
    const now=state(),c=now.c;
    if(c.day%7===0){
      const sponsors=(c.sponsors||[]).reduce((n,s)=>n+(Number(s.weekly)||0),0);
      const scholarship=c.scholarship?.active?Number(c.scholarship.weekly)||0:0;
      const salary=career.stage===4&&c.f1Deal?.salary?Math.round(c.f1Deal.salary/52):0;
      const upkeep=c.homes.concat(c.cars).reduce((n,id)=>
        n+(api.PROPERTY.find(x=>x.id===id)?.upkeep||0),0);
      journal('Sponsorship',sponsors,'Weekly sponsor support','Sponsors');
      journal('Scholarships',scholarship,'Weekly academy payment','Academies');
      journal('Contract salary',salary,'F1 team weekly salary','Team contracts');
      if(api.years()>=16)journal('Property running costs',-upkeep,'Houses and vehicle upkeep','Lifestyle costs');
    }
    const memberships=api.lifestyleState?.()?.v;
    if(memberships?.ledger?.length){
      const since=memberships.ledger.filter(x=>x.day===c.day&&
        !now.x.finance.some(y=>y.day===c.day&&y.description===x.description&&y.amount===x.amount));
      for(const tx of since)journal('Lifestyle subscriptions',tx.amount,tx.description,'Lifestyle costs');
    }
    if(c.season!==wasSeason){rollover();driverMarket();}
    save();
  }
  function race(){
    const count=career?.raceCount||0;
    const team=career?.team;
    old.race();
    if(!career||career.raceCount===count)return;
    const record=career.history?.[career.history.length-1]||career.lastReport;
    if(record)registerRace(record,team);
    if(team!==career.team&&career.stage===4)leaveSeat();
    save();render();
  }
  function signF1(team){
    const previous=career?.team;old.signF1(team);
    if(!career||career.team===previous)return;
    enterTeam(career.team);
    ensureStaff();
    save();render();
  }
  function scoutSeat(){
    const prev=career?.team;old.scoutSeat();
    if(career?.stage===4&&career.team!==prev){enterTeam(career.team);ensureStaff();save();}
  }
  function academySeat(){
    const prev=career?.team;old.academySeat?.();
    if(career?.stage===4&&career.team!==prev){enterTeam(career.team);ensureStaff();save();}
  }
  function promote(){
    const prior=career?.stage;old.promote();
    if(career?.stage!==prior){rollover();save();}
  }
  function ensureStaff(){
    const staff=old.ensureStaff();
    if(!career||career.stage!==4)return staff;
    const mate=getTeammate();
    const person=staff.find(p=>p.role==='Teammate');
    if(mate&&person){
      person.name=mate.name;
      person.isF1Teammate=true;
      person.driverId=mate.id;
      person.team=career.team;
      person.portrait=[...mate.id].reduce((n,ch)=>n+ch.charCodeAt(0),0);
      const c=state().c;
      c.contacts[person.id]=person;
    }
    return staff;
  }
  function socialCost(kind){return {chat:6,listen:7,collaborate:12,disagree:8,date:14}[kind]||6;}
  function connect(id,kind){
    const z=state(),{c,x}=z;
    api.peopleProfiles?.();
    ensureStaff();
    const person=c.contacts[id];
    if(!person)return;
    const cost=socialCost(kind);
    if((Number(career.energy)||0)<cost)return notify('Not enough energy. You can rest and try again.');
    const partnerAge=api.personAge?.(id)||person.age||0;
    if(kind==='date'){
      if(api.years()<18||partnerAge<18||person.isF1Teammate)
        return notify('Dating is available only between adult fictional characters.');
      if((c.relations[id]||0)<40)return notify('Develop a friendship first.');
    }
    const changes={
      chat:{low:3,high:7,morale:1},
      listen:{low:5,high:9,morale:2},
      collaborate:{low:5,high:11,morale:1},
      disagree:{low:-5,high:0,morale:-1},
      date:{low:7,high:12,morale:3}
    };
    const change=changes[kind]||changes.chat;
    const amount=randint(change.low,change.high);
    career.energy=Math.max(0,career.energy-cost);
    career.morale=Math.max(0,Math.min(100,career.morale+change.morale));
    c.relations[id]=Math.max(0,Math.min(100,(c.relations[id]||10)+amount));
    x.lastSocialDay=c.day;
    x.socialCounts[id]=(x.socialCounts[id]||0)+1;
    const meta=c.v82?.socialProfiles?.[id];
    if(meta){meta.moments=(meta.moments||0)+1;meta.lastTalkDay=c.day;}
    if(kind==='collaborate'){
      career.skillPoints+=1;
      if(career.stage>=1)career.reputation=Math.min(500,career.reputation+1);
    }
    if(kind==='date'){c.partner=id;person.relationship='Dating';}
    notify(kind==='date'?'Spent time with '+person.name+'.':
      'Talked with '+person.name+' · '+(amount>=0?'+':'')+amount+' friendship · −'+cost+' energy.');
  }
  function childTime(id,kind){
    const z=state(),{c}=z;
    if(career.energy<7)return notify('You need at least 7 energy for a family activity.');
    // The earlier game permitted only one family activity per day.
    const before=c.relationsDay;
    c.relationsDay=-999;
    old.encourageChild?.(id,kind);
    c.relationsDay=before;
    career.energy=Math.max(0,career.energy-7);
    save();
  }
  function job(kind){
    const before=career?.cash||0;old.job(kind);
    if(career&&career.cash>before)journal('Part-time work',career.cash-before,
      ({garage:'Workshop shift',media:'Media assistance',coach:'Karting coaching'})[kind]||'Work','Employment');
  }
  function sponsor(){
    const c=state()?.c;const names=new Set((c?.sponsors||[]).map(s=>s.name));
    const before=career?.cash||0;old.seekSponsor();
    for(const s of c?.sponsors||[])if(!names.has(s.name))journal('Sponsorship sign-on',career.cash-before,
      'New sponsor: '+s.name,'Sponsors');
  }
  function academy(){
    const before=career?.cash||0;old.acceptAcademy?.apply(null,arguments);
    if(career?.cash>before)journal('Scholarship grant',career.cash-before,'Academy joining grant','Academies');
  }
  function sponsorOffer(name){
    const before=career?.cash||0;old.acceptSponsor?.(name);
    if(career?.cash>before)journal('Sponsorship sign-on',career.cash-before,'Sponsor joining grant','Sponsors');
  }
  function wrappedMoney(oldAction,kind,desc){
    return function(...args){
      const before=career?.cash||0;
      const id=args[0],result=oldAction?.apply(null,args);
      const delta=(career?.cash||0)-before;
      if(delta)journal(kind,delta,desc(id,delta),'Lifestyle & assets');
      return result;
    };
  }
  function invest(...args){
    const before=career?.cash||0;
    const result=old.invest(...args);
    const delta=(career?.cash||0)-before;
    if(delta)journal('Virtual investment transfer',delta,'Case study '+args[0]+' · '+args[1],
      'Investments (transfers)');
    return result;
  }
  function start(...args){const result=old.start(...args);state();return result;}
  function successor(...args){const before=career?.name;const result=old.successor(...args);
    if(before!==career?.name){state();save();}return result;
  }
  function stats(){
    const x=state()?.x;
    if(!x)return null;
    const totals={};
    for(const entry of x.finance){
      totals[entry.kind]=(totals[entry.kind]||0)+entry.amount;
    }
    const earned=x.finance.filter(t=>t.amount>0&&!/transfer|Asset sale|Lifestyle sale/i.test(t.kind))
      .reduce((n,t)=>n+t.amount,0);
    const spent=x.finance.filter(t=>t.amount<0)
      .reduce((n,t)=>n-Math.abs(t.amount),0);
    return {earned,spent,totals,races:x.raceHistory.length,
      podiums:x.raceHistory.filter(y=>y.playerPosition<=3).length,
      wins:x.raceHistory.filter(y=>y.playerPosition===1).length};
  }
  // Preserve earlier save-migration behavior; world data remains additive.
  api.careerWorld=state;
  api.careerLadder=()=>ladder();
  api.careerConstructors=()=>constructors();
  api.careerPortfolio=stats;
  api.careerRoster=roster;
  api.careerMarketEvents=()=>state()?.x.marketEvents||[];
  api.careerTeammate=getTeammate;
  api.enterCareerTeam=enterTeam;
  api.seasonMarket=driverMarket;
  api.ownChampionship=()=>state()?.x.championship||null;
  api.start=start;api.successor=successor;
  api.daily=daily;api.race=race;api.promote=promote;
  api.signF1=signF1;api.scoutSeat=scoutSeat;api.requestAcademySeat=academySeat;
  api.ensureStaff=ensureStaff;
  api.relationship=connect;api.socialInteraction=connect;
  api.encourageChild=childTime;
  api.job=job;api.seekSponsor=sponsor;api.acceptAcademy=academy;
  api.acceptSponsor=sponsorOffer;
  api.buy=wrappedMoney(old.buy,'Asset purchase',id=>'Purchased '+id);
  api.sell=wrappedMoney(old.sell,'Asset sale',id=>'Sold '+id);
  api.buyItem=wrappedMoney(old.buyItem,'Lifestyle purchase',id=>'Purchased '+id);
  api.sellItem=wrappedMoney(old.sellItem,'Lifestyle sale',id=>'Sold '+id);
  api.joinPlan=wrappedMoney(old.joinPlan,'Lifestyle subscription',id=>'Subscribed '+id);
  api.cancelPlan=old.cancelPlan;
  api.invest=invest;
  if(career){state();ensureStaff();}
})();