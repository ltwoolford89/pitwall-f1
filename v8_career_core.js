/* PITWALL V8 — fictional long-form motorsport career simulation.
   Saves extend the existing pitwall-career-v2 save; no legacy data is deleted.
   All money, companies, agreements and results in this game are fictional. */
'use strict';
(function(){
  const DAY=86400000;
  const BASE=Date.UTC(2026,0,5);
  const COUNTRIES=['Australia','United Kingdom','Italy','France','Germany','Spain','Netherlands','Belgium','Brazil','Argentina','United States','Canada','Japan','New Zealand','Mexico','Monaco','Finland','Sweden','India','South Africa','South Korea','China','Singapore'];
  const TRAIN=[
    {id:'braking',name:'Braking drills',energy:16,fitness:2},
    {id:'racecraft',name:'Wheel-to-wheel simulator',energy:20,fitness:1},
    {id:'focus',name:'Race focus and review',energy:12,fitness:1},
    {id:'qualifying',name:'Qualifying practice',energy:17,fitness:1},
    {id:'fitness',name:'Movement and recovery',energy:14,fitness:3},
    {id:'strategy',name:'Strategy exercises',energy:9,fitness:0},
    {id:'wet',name:'Wet conditions simulator',energy:16,fitness:1},
    {id:'engineering',name:'Car engineering study',energy:11,fitness:0},
    {id:'media',name:'Public speaking',energy:8,fitness:0},
    {id:'teamwork',name:'Teamwork practice',energy:9,fitness:0}
  ];
  const PROPERTY=[
    {id:'flat',kind:'home',name:'City apartment',cost:180000,upkeep:110},
    {id:'townhome',kind:'home',name:'Townhouse',cost:425000,upkeep:240},
    {id:'villa',kind:'home',name:'Coastal villa',cost:1750000,upkeep:620},
    {id:'estate',kind:'home',name:'Country estate',cost:6700000,upkeep:2200},
    {id:'mx5',kind:'car',name:'Mazda MX-5',cost:42000,upkeep:30},
    {id:'gr86',kind:'car',name:'Toyota GR86',cost:49500,upkeep:37},
    {id:'m3',kind:'car',name:'BMW M3',cost:155000,upkeep:85},
    {id:'rs6',kind:'car',name:'Audi RS6 Avant',cost:265000,upkeep:140},
    {id:'gt',kind:'car',name:'Mercedes-AMG GT',cost:360000,upkeep:165},
    {id:'911',kind:'car',name:'Porsche 911 GT3',cost:510000,upkeep:220},
    {id:'296',kind:'car',name:'Ferrari 296 GTB',cost:650000,upkeep:280},
    {id:'750',kind:'car',name:'McLaren 750S',cost:670000,upkeep:300},
    {id:'rev',kind:'car',name:'Lamborghini Revuelto',cost:1080000,upkeep:490}
  ];
  const CASES=[
    {id:'apple',name:'Apple · iPhone introduction (2007)',company:'Apple',year:2007,event:'The first iPhone introduced a major new phone category.',steps:[-6,8,4,12,-5,6]},
    {id:'microsoft',name:'Microsoft · cloud transition (2014)',company:'Microsoft',year:2014,event:'Microsoft increased focus on cloud services in the 2010s.',steps:[3,-3,7,5,2,-4]},
    {id:'nintendo',name:'Nintendo · Switch introduction (2017)',company:'Nintendo',year:2017,event:'Nintendo launched the Switch console in 2017.',steps:[-3,7,12,-6,4,2]},
    {id:'nvidia',name:'NVIDIA · AI technology wave (2023)',company:'NVIDIA',year:2023,event:'AI demand became a major topic for chipmakers in 2023.',steps:[8,-9,11,4,-12,7]},
    {id:'blockbuster',name:'Blockbuster · digital video shift (2000s)',company:'Blockbuster',year:2007,event:'Video rental businesses faced competition from online distribution.',steps:[-8,-5,3,-12,-3,-4]}
  ];
  const FIRST=['Alex','Jordan','Morgan','Avery','Jamie','Riley','Taylor','Casey','Rowan','Harper','Sam','Ellis','Parker','Quinn','Robin','Blake','Emerson','Drew','Nico','Arden'];
  const LAST=['Hart','Voss','Bell','Hughes','Rivera','Chen','Rossi','Brooks','Jensen','Navarro','Miller','Patel','Quinn','Park','Fischer','Brown','Lane','Sato','Stone','Carter'];
  const ROLES=['Race engineer','Performance engineer','Chief mechanic','Strategist','Media officer','Team manager','Physiotherapist','Teammate','Paddock friend','Talent agent'];
  const PATHS=['Racing driver','Software developer','Chef','Teacher','Engineer','Designer','Journalist','Business founder'];
  const MAX=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
  const RNG=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
  const ID=()=>Math.random().toString(36).slice(2,9);
  const levels=()=>career?.v8?.skills||{};
  const dateOf=c=>new Date(BASE+c.day*DAY);
  const ageOf=c=>c.startAge+Math.floor((c.day-(c.ageOffsetDay||0))/365);
  function stageMinimum(stage){return [10,16,17,18,18][stage]||18;}
  function migrate(){
    if(!career)return null;
    if(!career.v8){
      const age=career.stage>=4?19:career.stage===3?18:career.stage===2?17:career.stage===1?16:12;
      career.v8={
        day:Math.max(0,(Math.max(1,Number(career.week)||1)-1)*7),
        ageOffsetDay:Math.max(0,(Math.max(1,Number(career.week)||1)-1)*7),
        startAge:age,country:'Australia',trainingDay:-1,relationsDay:-1,jobDay:-1,
        skills:{...(career.skillLevels||{})},xp:{},income:0,sponsors:[],scholarship:null,
        scout:null,staff:[],contacts:{},relations:{},partner:null,married:false,kids:[],
        homes:[],cars:[],investments:{},marketTick:0,lastInvestmentDay:0,
        sponsorAttempts:0,lastSponsorAttempt:-40,season:1,seasonRaces:0,
        f1Deal:null,lastEvent:'Existing career save upgraded to V8.',
        stageAgeAtStart:age,relationshipContactDay:-1
      };
      if(career.stage===4&&career.contract){
        career.v8.f1Deal={team:career.team,salary:3600000,years:2,endDay:career.v8.day+730};
      }
      save();
    }
    const c=career.v8;
    c.skills=c.skills||{};
    c.xp=c.xp||{};
    for(const k of ['sponsors','staff','kids','homes','cars'])if(!Array.isArray(c[k]))c[k]=[];
    c.relations=c.relations||{};c.contacts=c.contacts||{};c.investments=c.investments||{};
    return c;
  }
  function start(name,gender,country){
    career=defaultCareer(name,gender);
    const base=migrate();
    Object.assign(base,{day:0,ageOffsetDay:0,startAge:10,country:COUNTRIES.includes(country)?country:'Australia',
      trainingDay:-1,relationsDay:-1,jobDay:-1,skills:{},xp:{},stageAgeAtStart:10,staff:[],contacts:{},relations:{}});
    career.cash=1200;career.stage=0;career.week=1;career.reputation=0;
    career.skillPoints=0;career.history=[];career.team='Family Karting Team';
    base.lastEvent='You began karting at age 10. Your family is covering the entry costs for now.';
    ensureStaff();save();return base;
  }
  function makeStaff(team){
    const seed=[...team].reduce((n,x)=>n+x.charCodeAt(0),0);
    return ROLES.map((role,i)=>{
      const k=(seed+i*31)%FIRST.length,m=(seed*3+i*29)%LAST.length;
      return {id:'staff-'+seed+'-'+i,name:FIRST[k]+' '+LAST[m],role,age:role==='Teammate'?21+((seed+i)%9):24+((seed+i*7)%24),
        team,portrait:seed+i*13,relationship:'Colleague'};
    });
  }
  function ensureStaff(){
    const c=migrate();if(!c)return [];
    if(c.staffTeam!==career.team||!c.staff.length){
      c.staff=makeStaff(career.team);c.staffTeam=career.team;
      for(const person of c.staff){c.relations[person.id]??=RNG(10,28);c.contacts[person.id]=person;}
    }
    return c.staff;
  }
  function years(){const c=migrate();return ageOf(c)}
  function isRaceDay(){
    const c=migrate(),maxRounds=Math.min(24,Math.max(1,data.races.length||24));
    return c.day%7===6&&(career.stage!==4||
      (Math.floor(c.day/7)%2===0&&c.seasonRaces<maxRounds));
  }
  function daysUntilRace(){
    const c=migrate();
    if(career.stage===4&&c.seasonRaces>=Math.min(24,Math.max(1,data.races.length||24)))
      return Math.max(0,365-(c.day%365));
    const until=6-c.day%7;
    if(career.stage!==4)return until;
    return ((Math.floor((c.day+until)/7)%2===0)?until:until+7);
  }
  function stageReady(){
    const req=nextStages[career.stage];
    if(!req)return false;
    return years()>=stageMinimum(career.stage+1)&&career.stageRaces>=req.races&&career.reputation>=req.min;
  }
  function totalSkill(){
    const c=migrate();
    return TRAIN.reduce((sum,x)=>sum+2.3*Math.log1p(Math.max(0,Number(c.skills[x.id])||0)),0);
  }
  function pace(){
    const c=migrate(),age=years();
    const ageDecay=Math.max(0,age-32)*1.7;
    const mitigation=(c.skills.fitness||0)*0.16;
    const teamTrust=c.staff.length?c.staff.reduce((sum,p)=>sum+(c.relations[p.id]||0),0)/c.staff.length:0;
    // Lifestyle advantages must apply to real race simulation as well as UI.
    const lifestyleBonus=(c.v83?.items?.includes('simulator')?2:0)+
      (c.v83?.memberships?.coaching?2:0);
    return Math.round(32+totalSkill()+teamTrust*.045+career.fitness*.14+career.morale*.07+
      career.energy*.08+(teamSpec()?.power-55||0)*.24-Math.max(0,ageDecay-mitigation)+lifestyleBonus-
      (Number(c.v85?.difficultyPenalty)||0));
  }
  function log(message){
    migrate().lastEvent=message;return message;
  }
  function finish(message){log(message);save();render();if(typeof toast==='function')toast(message);}
  function daily(){
    const c=migrate();
    if(!c)return;
    c.day++;
    career.week=1+Math.floor(c.day/7);
    career.energy=MAX(career.energy+RNG(12,18));
    career.morale=MAX(career.morale+RNG(-1,2));
    if(c.day%7===0){
      const cost=c.homes.reduce((n,id)=>n+(PROPERTY.find(p=>p.id===id)?.upkeep||0),0)+
        c.cars.reduce((n,id)=>n+(PROPERTY.find(p=>p.id===id)?.upkeep||0),0);
      if(years()>=16)career.cash-=cost;
      for(const sponsor of c.sponsors)career.cash+=sponsor.weekly;
      if(c.scholarship?.active)career.cash+=c.scholarship.weekly;
      c.marketTick++;
      if(c.f1Deal?.salary&&career.stage===4)career.cash+=Math.round(c.f1Deal.salary/52);
    }
    if(c.day%365===0){
      c.season++;
      c.seasonRaces=0;
      if(c.f1Deal&&c.f1Deal.endDay<=c.day){c.f1Deal=null;career.contract=null;}
      career.f1Season=Math.max(1,Number(career.f1Season)||1)+1;
      career.f1Round=0;career.f1TeamPoints={};career.f1DriverPoints={};career.f1Races=[];
      if(years()>32)career.fitness=MAX(career.fitness-4);
      if(c.scholarship?.active&&career.reputation<c.scholarship.required){
        c.scholarship.active=false;c.scout=null;
        log('Your academy scholarship was not renewed after recent results.');
      }
    }
    if(c.scout?.offered&&years()>=18&&career.reputation<c.scout.threshold){
      c.scout.offered=false;c.scout.status='Seat opportunity withdrawn due to recent performances';
    }
    finish('Day ended. '+dateOf(c).toLocaleDateString('en-AU',{timeZone:'UTC',
      weekday:'long',day:'numeric',month:'short',year:'numeric'})+' · '+(daysUntilRace()===0?'Race weekend!':daysUntilRace()+' days to race.'));
  }
  function train(id){
    const c=migrate(),x=TRAIN.find(a=>a.id===id);
    if(!x||c.trainingDay===c.day)return finish('You can complete one training session per day.');
    if(career.energy<x.energy)return finish('Rest and end the day to recover energy.');
    c.trainingDay=c.day;career.energy=MAX(career.energy-x.energy);
    career.fitness=MAX(career.fitness+x.fitness);
    c.xp[id]=(c.xp[id]||0)+RNG(18,32);
    const gain=1+(c.xp[id]>=70?1:0);
    if(c.xp[id]>=70)c.xp[id]-=70;
    career.skillPoints+=gain;
    finish(x.name+' completed: +'+gain+' skill '+(gain===1?'point':'points')+'.');
  }
  function upgrade(id){
    const c=migrate(),x=TRAIN.find(a=>a.id===id);if(!x)return;
    const level=Number(c.skills[id])||0,cost=1+Math.floor(level/4);
    if(career.skillPoints<cost)return finish('You need '+cost+' skill points.');
    c.skills[id]=level+1;
    career.skillPoints-=cost;
    finish(x.name+' upgraded to level '+(level+1)+'. Levels have no cap.');
  }
  function job(kind){
    const c=migrate();
    if(years()<16)return finish('Your parents cover karting costs until age 16. Work unlocks from age 16.');
    if(c.jobDay===c.day)return finish('Only one shift or sponsor meeting per day.');
    const jobList={garage:{name:'Workshop shift',cash:180,energy:24},media:{name:'Media assistance',cash:160,energy:18},
      coach:{name:'Karting coaching',cash:240,energy:22}};
    const x=jobList[kind];if(!x||career.energy<x.energy)return;
    c.jobDay=c.day;career.energy=MAX(career.energy-x.energy);career.cash+=x.cash+Math.round(career.reputation*2);
    finish(x.name+' completed. Fictional payment received.');
  }
  function seekSponsor(){
    const c=migrate();
    if(years()<16)return finish('Sponsors become important from age 16.');
    if(c.day-c.lastSponsorAttempt<7)return finish('You can pitch to a sponsor once per week.');
    c.lastSponsorAttempt=c.day;
    const chance=MAX(15+career.reputation*.38+totalSkill()*.7,15,85)/100;
    if(Math.random()>chance){career.reputation=MAX(career.reputation-1,-50,500);return finish('Your sponsorship proposal was declined. Try another week.');}
    const brand=['Arrow Technologies','Evergreen Mobility','BluePeak Systems','Aurora Electronics','Kestrel Racing','Silverline Engineering'][c.sponsors.length%6];
    if(c.sponsors.some(x=>x.name===brand))return finish('Your existing sponsor renewed its support.');
    const weekly=220+Math.round(career.reputation*8)+RNG(0,300);
    c.sponsors.push({name:brand,weekly,started:c.day});
    finish(brand+' signed a fictional sponsorship worth '+fmtMoney(weekly)+'/week.');
  }
  function race(){
    const c=migrate();
    if(!isRaceDay())return finish('Race weekends follow the simulated season calendar. Use END DAY to advance.');
    if(c.lastRaceDay===c.day)return finish('You have already raced this weekend.');
    if(career.energy<19)return finish('Too little energy. You can rest before next weekend.');
    if(career.stage===4&&!c.f1Deal)return finish('You need a signed Formula 1 team contract.');
    const entry=[310,600,800,1000,0][career.stage];
    const subsidised=years()<16||(c.scholarship?.active&&career.stage===0);
    if(!subsidised&&career.cash<entry)return finish('You need funding to enter this event.');
    const stage=career.stage,grid=stage===4?22:18;
    let position=Math.round(grid/2+(48+stage*11-pace())*.16+RNG(-5,5));
    position=MAX(position,1,grid);
    const rep=RNG(-4,5)+Math.round((grid-position)*.7)+(position===1?5:0);
    const winnings=stage===4?Math.round((23-position)*50000):Math.round(190+(grid-position)*95*(stage+1));
    const scholarshipPay=c.scholarship?.active&&stage===0?500:0;
    career.cash+=winnings+scholarshipPay-(subsidised?0:entry);
    career.reputation=MAX(career.reputation+rep,-50,500);
    career.energy=MAX(career.energy-RNG(18,31));career.morale=MAX(career.morale+(position<=3?7:-3));
    career.raceCount++;career.stageRaces++;c.seasonRaces++;
    if(position<=3)career.stagePodiums=(career.stagePodiums||0)+1;
    if(position===1)career.wins++;
    career.skillPoints+=1+(position<=3?2:0);
    c.lastRaceDay=c.day;
    const raceName=stage===4?(data.races[(c.seasonRaces-1)%Math.max(1,data.races.length)]?.name||'Grand Prix'):
      ['Junior Kart Cup','Regional Formula 4','Formula 3 Feature','Formula 2 Grand Prix'][stage];
    const history={position,title:raceName,team:career.team,week:career.week,
      date:dateOf(c).toISOString().slice(0,10),reward:winnings,rep,stage,season:c.season};
    career.history.push(history);career.history=career.history.slice(-400);
    career.lastReport={...history,lines:['Your practice prepared you for race day.',
      'A changing field produced a P'+position+' finish.',
      rep<0?'Reputation fell after the tough result.':'The paddock noticed your performance.']};
    if(stage===4){
      career.f1Round=(career.f1Round||0)+1;
      const points=[25,18,15,12,10,8,6,4,2,1][position-1]||0;
      career.f1DriverPoints=career.f1DriverPoints||{};
      career.f1TeamPoints=career.f1TeamPoints||{};
      career.f1DriverPoints[career.name]=(career.f1DriverPoints[career.name]||0)+points;
      career.f1TeamPoints[career.team]=(career.f1TeamPoints[career.team]||0)+points;
      career.f1Races=career.f1Races||[];
      career.f1Races.push({name:raceName,position,team:career.team,season:c.season,round:c.seasonRaces});
      if(position>=16){c.poorResults=(c.poorResults||0)+1;}
      else c.poorResults=0;
      if(c.poorResults>=6){c.f1Deal=null;career.contract=null;career.team='F1 Free Agent';c.poorResults=0;}
    }
    if(stage===0&&years()>=11&&career.reputation>=28&&position<=8&&!c.scholarship){
      c.scholarship={active:false,weekly:250,required:16,offerDay:c.day};
      c.scout={offered:true,status:'Conditional academy interest. F1 seat review from age 18.',threshold:75};
    }
    if(c.scholarship?.active&&career.reputation<c.scholarship.required-24){
      c.scholarship.active=false;c.scout=null;
    }
    finish('Race complete: P'+position+' · '+(rep>=0?'+':'')+rep+' reputation · '+fmtMoney(winnings)+' fictional prize money.');
  }
  function acceptScholarship(){
    const c=migrate();
    if(!c.scholarship||c.scholarship.active)return;
    c.scholarship.active=true;
    career.cash+=1200;
    finish('Academy karting scholarship accepted: '+fmtMoney(1200)+' grant + '+fmtMoney(c.scholarship.weekly)+'/week.');
  }
  function promote(){
    const c=migrate(),stage=career.stage;if(!stageReady())return finish('Age, race or reputation requirements not yet met.');
    const to=stage+1;
    career.stage=to;career.stageRaces=0;career.stagePodiums=0;
    career.team=['Family Karting Team','Junior Formula 4 Academy','Formula 3 Development','Formula 2 Academy','F1 Free Agent'][to];
    if(to===4&&c.scout?.offered&&career.reputation>=c.scout.threshold)career.team='F1 Academy Prospect';
    c.staff=[];c.staffTeam=null;ensureStaff();
    if(to===4){c.f1Deal=null;career.contract=null;}
    finish('Promoted to '+stages[to]+'!');
  }
  function scoutSeat(){
    const c=migrate();
    if(years()<18||!c.scout?.offered||career.reputation<c.scout.threshold||totalSkill()<10)return finish('Conditional scholarship seat requirements not met.');
    career.stage=4;career.team='Williams';c.f1Deal={team:'Williams',salary:3500000,years:2,endDay:c.day+730};
    career.contract={team:'Williams',salary:Math.round(c.f1Deal.salary/24),remaining:48,total:48};
    c.staff=[];ensureStaff();finish('Your academy scholarship became a two-year Formula 1 seat!');
  }
  function signF1(team){
    const c=migrate();if(career.stage!==4||years()<18)return;
    const t=teams.find(x=>x.name===team);if(!t)return;
    const required=Math.max(70,Math.round(t.min*.72));
    if(career.reputation<required)return finish('Reputation requirement: '+required+'.');
    const chance=MAX(40+career.reputation*.14+totalSkill()*.25-required*.13,20,92)/100;
    if(Math.random()>chance)return finish(t.name+' has not offered a seat this time.');
    const salary=Math.round((2200000+t.power*55000+career.reputation*12500+totalSkill()*20000)/100000)*100000;
    c.f1Deal={team:t.name,salary,years:2,endDay:c.day+730};
    career.contract={team:t.name,salary:Math.round(salary/24),remaining:48,total:48};
    career.team=t.name;c.staff=[];ensureStaff();
    finish('Signed a fictional '+fmtMoney(salary)+'/year Formula 1 contract with '+t.name+'.');
  }
  function relationship(id,action){
    const c=migrate();ensureStaff();const p=c.contacts[id];
    if(!p)return;
    if(c.relationsDay===c.day)return finish('One social interaction each day. End the day to meet again.');
    if(action==='date'&&(years()<18||p.age<18))return finish('Dating in this game unlocks only for adults.');
    if(action==='date'&&(c.relations[id]||0)<40)return finish('Build a friendship first.');
    c.relationsDay=c.day;
    c.relations[id]=MAX((c.relations[id]||10)+(action==='date'?RNG(7,12):RNG(4,9)),0,100);
    career.morale=MAX(career.morale+(action==='date'?3:2));
    if(action==='date'){c.partner=id;p.relationship='Dating';}
    finish(action==='date'?'You went on a fictional date with '+p.name+'.':'You spent time with '+p.name+' and built your friendship.');
  }
  function marry(){
    const c=migrate();const person=c.contacts[c.partner];
    if(years()<21||!person||person.age<18||c.married||(c.relations[person.id]||0)<75)return finish('Marriage requires an adult partner, a strong relationship and age 21+.');
    c.married=true;person.relationship='Spouse';
    finish('Your driver and '+person.name+' got married in the career story.');
  }
  function child(){
    const c=migrate();
    if(years()<21||!c.married)return finish('Family legacy options unlock for married adult characters aged 21+.');
    if(c.lastChildDay!==undefined&&c.day-c.lastChildDay<365)return finish('Wait another in-game year before expanding your family.');
    const index=c.kids.length,name=FIRST[(c.day+index*5)%FIRST.length]+' '+career.name.trim().split(' ').slice(-1)[0];
    const childId='heir-'+ID()+'-'+index.toString(36)+'-'+c.day.toString(36);
    c.kids.push({id:childId,name,birthDay:c.day,job:PATHS[RNG(0,PATHS.length-1)],country:c.country});
    c.lastChildDay=c.day;finish(name+' joined your fictional family. You may create multiple successors.');
  }
  function successor(id){
    const c=migrate(),person=c.kids.find(x=>x.id===id);
    if(!person)return;
    const childAge=Math.floor((c.day-person.birthDay)/365);
    if(years()<35||childAge<16)return finish('Retirement handover needs your driver to be 35+ and your successor to be at least 16.');
    const history={name:career.name,team:career.team,age:years(),races:career.raceCount,wins:career.wins,
      retired:c.day};
    c.ancestors=c.ancestors||[];c.ancestors.push(history);
    const wealth=career.cash,fromAge=childAge,day=c.day,ancestors=c.ancestors.slice();
    const nation=person.country||c.country;
    const next=defaultCareer(person.name,career.gender);
    career=next;
    const dest=migrate();
    Object.assign(dest,{day,ageOffsetDay:day,startAge:fromAge,country:nation,kids:[],partner:null,married:false,
      ancestors,homes:c.homes.slice(),cars:c.cars.slice(),contacts:{},relations:{},sponsors:[],f1Deal:null,
      scholarship:null,scout:null,trainingDay:-1,relationsDay:-1,staff:[],staffTeam:null,
      skills:{},xp:{},season:Math.floor(day/365)+1,relationshipContactDay:-1});
    career.cash=Math.round(wealth*.85);
    career.stage=fromAge>=16?1:0;
    career.team='Family Development Academy';ensureStaff();
    finish('Legacy switched to '+person.name+'. '+person.job+' is their previous path; motorsport is now available.');
  }
  function buy(id){
    const c=migrate(),item=PROPERTY.find(x=>x.id===id);if(!item||career.cash<item.cost)return;
    const collection=item.kind==='home'?c.homes:c.cars;
    if(collection.includes(id))return finish('Already owned.');
    career.cash-=item.cost;collection.push(id);
    finish(item.name+' added to your collection. Existing properties and cars are retained.');
  }
  function sell(id){
    const c=migrate(),item=PROPERTY.find(x=>x.id===id);if(!item)return;
    const a=item.kind==='home'?c.homes:c.cars;
    const i=a.indexOf(id);if(i<0)return;
    a.splice(i,1);career.cash+=Math.round(item.cost*.65);
    finish(item.name+' sold for 65% of its original game price.');
  }
  function invest(id,action){
    const c=migrate(),item=CASES.find(x=>x.id===id);if(!item)return;
    const holding=c.investments[id]||{units:0,basis:0};
    const index=c.marketTick%item.steps.length;
    const multiplier=Math.pow(1+item.steps[index]/100,Math.floor(c.marketTick/item.steps.length));
    const price=Math.max(1,Math.round(100*multiplier*(1+item.steps[index]/100)));
    if(action==='buy'){
      const amount=Math.min(2000,career.cash);
      if(amount<100)return finish('At least 100 fictional credits are needed.');
      career.cash-=amount;holding.units+=amount/price;holding.basis+=amount;
      c.investments[id]=holding;finish('Added '+fmtMoney(amount)+' of fictional shares to a historical case-study simulation.');
    }else if(action==='sell'&&holding.units>0){
      const value=Math.round(holding.units*price);
      career.cash+=value;delete c.investments[id];
      finish('Historical case-study holding closed for '+fmtMoney(value)+' virtual cash.');
    }
  }
  function restart(){
    try{localStorage.removeItem('pitwall-career-v2');localStorage.removeItem('pitwall-career-v1');}catch(e){}
    career=null;st.careerTab='overview';render();toast('Career save restarted.');
  }
  window.pitwallCareer8={migrate,start,ensureStaff,dateOf,years,isRaceDay,daysUntilRace,pace,
    totalSkill,stageReady,TRAIN,PROPERTY,CASES,COUNTRIES,ROLES,MAX,
    daily,train,upgrade,job,seekSponsor,race,acceptScholarship,promote,scoutSeat,signF1,
    relationship,marry,child,successor,buy,sell,invest,restart};
  if(career){migrate();ensureStaff();}
})();