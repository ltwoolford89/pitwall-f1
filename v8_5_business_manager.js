/* PITWALL V8.5 — educational investment allocations, unlockable
   career challenges, fictional businesses and F1 team ownership.
   All companies, prices, transactions, races and purchases in this
   game are simulated. No real-money transactions are possible. */
'use strict';
(function(){
  const api=window.pitwallCareer8;
  if(!api)return;
  const originals={daily:api.daily,fastForward:api.fastForward,start:api.start,
    successor:api.successor,signF1:api.signF1};
  const DIFFICULTIES=[
    {id:'rookie',name:'Rookie',days:0,races:0,reputation:-50,penalty:0,note:'Learn the racing calendar and build skills.'},
    {id:'club',name:'Club Racer',days:180,races:8,reputation:10,penalty:3,note:'Rivals are more competitive.'},
    {id:'pro',name:'Pro Driver',days:730,races:24,reputation:60,penalty:7,note:'Strong rivals demand consistent training.'},
    {id:'legend',name:'World Champion',days:1460,races:50,reputation:110,penalty:12,note:'The toughest simulated racing challenge.'}
  ];
  const BUSINESS_TYPES=[
    {id:'workshop',name:'Automotive workshop',minAge:16,startCost:18000,
      weeklyRevenue:1900,weeklyCosts:1250,detail:'Servicing, repairs and small engineering projects'},
    {id:'simstudio',name:'Racing simulator studio',minAge:16,startCost:38000,
      weeklyRevenue:3300,weeklyCosts:2150,detail:'Simulator sessions and motorsport education'},
    {id:'media',name:'Media production company',minAge:17,startCost:55000,
      weeklyRevenue:4600,weeklyCosts:3200,detail:'Creative projects, photography and video production'},
    {id:'electronics',name:'Electronics business',minAge:18,startCost:85000,
      weeklyRevenue:6300,weeklyCosts:4300,detail:'Circuit design, prototyping and electronics'},
    {id:'kartacademy',name:'Junior karting academy',minAge:18,startCost:180000,
      weeklyRevenue:12500,weeklyCosts:8500,detail:'Development courses and fictional karting events'},
    {id:'engineering',name:'Motorsport engineering company',minAge:19,startCost:260000,
      weeklyRevenue:19000,weeklyCosts:13700,detail:'Engineering, testing and technical consulting'},
    {id:'logistics',name:'Motorsport logistics business',minAge:21,startCost:380000,
      weeklyRevenue:28000,weeklyCosts:19500,detail:'Transport and event support services'}
  ];
  const DEVELOPMENT=[
    {id:'aero',name:'Aerodynamics',detail:'Wind-tunnel work and car aerodynamics'},
    {id:'engine',name:'Powertrain',detail:'Powertrain efficiency and reliability'},
    {id:'strategy',name:'Race strategy',detail:'Pit wall, tyre strategy and engineers'},
    {id:'facilities',name:'Facilities',detail:'Factory, simulators and staff development'}
  ];
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const whole=n=>Number.isSafeInteger(n)&&n>=0;
  function state(){
    if(!career)return null;
    const c=api.migrate();
    if(!c.v85)c.v85={version:5,difficulty:'rookie',difficultyPenalty:0,
      businesses:[],businessHistory:[],team:null,yearSkips:0,createdDay:c.day,
      investmentHistory:[],lastAdvance:null};
    const x=c.v85;
    for(const p of ['businesses','businessHistory','investmentHistory'])
      if(!Array.isArray(x[p]))x[p]=[];
    if(!DIFFICULTIES.some(d=>d.id===x.difficulty))x.difficulty='rookie';
    x.difficultyPenalty=DIFFICULTIES.find(d=>d.id===x.difficulty)?.penalty||0;
    return {c,x};
  }
  function ledger(kind,amount,desc,source){
    const z=state();if(!z)return;
    const n=Math.round(Number(amount)||0);
    if(!n)return;
    const world=api.careerWorld?.();
    if(world?.x?.finance){
      world.x.finance.push({day:z.c.day,year:z.c.season,kind,amount:n,
        description:desc,source:source||kind});
      if(world.x.finance.length>1600)world.x.finance.splice(0,world.x.finance.length-1600);
    }
  }
  function finish(text){
    save();render();
    if(text&&typeof toast==='function')toast(text);
  }
  function earnedDays(){
    const z=state();
    return z?Math.max(0,z.c.day-(z.c.ageOffsetDay||0)):0;
  }
  function eligibleDifficulty(d){
    return earnedDays()>=d.days&&career.raceCount>=d.races&&career.reputation>=d.reputation;
  }
  function difficultyList(){
    state();
    return DIFFICULTIES.map(d=>({...d,unlocked:eligibleDifficulty(d)}));
  }
  function selectDifficulty(id){
    const z=state(),d=DIFFICULTIES.find(d=>d.id===id);
    if(!z||!d||!eligibleDifficulty(d))return finish('This difficulty is still locked. Keep racing and improving your reputation.');
    z.x.difficulty=d.id;
    z.x.difficultyPenalty=d.penalty;
    finish('Difficulty selected: '+d.name+'. Your next race will use its challenge setting.');
  }
  function indexPrice(item,tick){
    const i=tick%item.steps.length;
    const ratio=1+item.steps[i]/100;
    return Math.max(1,Math.round(100*Math.pow(ratio,
      Math.floor(tick/item.steps.length))*ratio));
  }
  function investCustom(id,raw){
    const z=state(),item=api.CASES.find(a=>a.id===id);
    if(!z||!item)return;
    const amount=Number(String(raw).trim());
    if(!whole(amount)||amount<100)return finish('Choose a whole-number virtual investment amount of at least 100.');
    if(amount>career.cash)return finish('That exceeds your available virtual money.');
    if(amount>1000000000)return finish('Choose an amount of one billion virtual credits or less.');
    const price=indexPrice(item,z.c.marketTick);
    const holding=z.c.investments[id]||{units:0,basis:0};
    holding.units+=amount/price;
    holding.basis+=amount;
    z.c.investments[id]=holding;
    career.cash-=amount;
    z.x.investmentHistory.push({day:z.c.day,caseId:id,amount,price,action:'allocate'});
    z.x.investmentHistory=z.x.investmentHistory.slice(-100);
    ledger('Investment allocation',-amount,item.company+' historical case study · allocation','Investment transfers');
    finish('Allocated '+fmtMoney(amount)+' of fictional money to '+item.company+' at illustrative index '+price+'.');
  }
  function startCompany(typeId,name){
    const z=state(),type=BUSINESS_TYPES.find(b=>b.id===typeId);
    if(!z||!type)return;
    const desired=String(name||'').trim().replace(/\s+/g,' ').slice(0,40);
    if(api.years()<type.minAge)return finish(type.name+' is unlocked at age '+type.minAge+'.');
    if(!desired||desired.length<3)return finish('Enter a business name with at least three characters.');
    if(z.x.businesses.some(b=>b.name.toLowerCase()===desired.toLowerCase()))
      return finish('You already own a business with this name.');
    if(z.x.businesses.length>=12)return finish('You can operate up to 12 businesses at once.');
    if(career.cash<type.startCost)return finish('Not enough virtual funds to start this business.');
    career.cash-=type.startCost;
    const entity={id:'biz-'+z.c.day+'-'+(z.x.businesses.length+1)+'-'+
      Math.random().toString(36).slice(2,7),name:desired,type:type.id,level:1,
      staff:2,started:z.c.day,earned:0,spent:type.startCost,
      reputation:25,operatingWeeks:0};
    z.x.businesses.push(entity);
    ledger('Business startup',-type.startCost,'Founded '+desired,'Business expenses');
    finish(desired+' opened as a fictional '+type.name.toLowerCase()+'.');
  }
  function upgradeCompany(id){
    const z=state(),business=z?.x.businesses.find(b=>b.id===id);
    if(!business)return;
    const type=BUSINESS_TYPES.find(t=>t.id===business.type);
    const price=businessUpgradeCost(business);
    if(career.cash<price)return finish('Not enough virtual money to upgrade '+business.name+'.');
    career.cash-=price;
    business.level++;
    business.staff+=2;
    business.reputation=clamp(business.reputation+5,0,100);
    business.spent+=price;
    ledger('Business expansion',-price,'Expanded '+business.name+' to level '+business.level,'Business expenses');
    finish(business.name+' upgraded to level '+business.level+'.');
  }
  function businessUpgradeCost(b){
    const type=BUSINESS_TYPES.find(t=>t.id===b.type);
    return Math.round((type?.startCost||18000)*(0.48+0.22*b.level));
  }
  function teamAcquisitionCost(name){
    const team=typeof teams!=='undefined'?teams.find(t=>t.name===name):null;
    const rating=team?.power||70;
    return Math.round((38000000+rating*870000)/1000000)*1000000;
  }
  function ownedTeam(){
    return state()?.x.team||null;
  }
  function teamBonuses(){
    const z=state(),team=z?.x.team;
    if(!z)return;
    const active=team&&team.name===career.team&&career.stage===4;
    z.x.teamBonus=active?(Object.values(team.development).reduce((n,v)=>n+(v-1),0)*.8):0;
  }
  function registerOwnedTeam(name){
    const book=api.careerRoster?.();
    if(!book)return;
    if(!book.roster[name]){
      const pool=book.freeAgents.splice(0,2);
      while(pool.length<2){
        const idx=Object.keys(book.drivers).length+1;
        const id='newacademy-'+idx;
        book.drivers[id]={id,name:'Academy Driver '+idx,team:name,ability:58,realReference:false};
        pool.push(id);
      }
      book.roster[name]=pool;
      for(const id of pool)if(book.drivers[id])book.drivers[id].team=name;
    }
  }
  function makeTeam(name){
    const z=state();if(!z)return;
    if(api.years()<18)return finish('Team ownership unlocks at age 18.');
    if(z.x.team)return finish('You already own a team. Sell your current team to acquire another.');
    const teamName=String(name||'').trim().replace(/\s+/g,' ').slice(0,30);
    if(!teamName||teamName.length<3)return finish('Enter a team name of at least three characters.');
    if(Object.keys(api.careerRoster()?.roster||{}).some(t=>t.toLowerCase()===teamName.toLowerCase()))
      return finish('A team with that name already exists.');
    const cost=32000000;
    if(career.cash<cost)return finish('Building a new F1 team costs '+fmtMoney(cost)+' in this game.');
    career.cash-=cost;
    z.x.team={name:teamName,type:'new',started:z.c.day,price:cost,
      balance:10000000,development:{aero:1,engine:1,strategy:1,facilities:1},
      weeks:0,sponsors:[],championshipPoints:0,brand:55,profit:0};
    registerOwnedTeam(teamName);
    ledger('F1 team foundation',-cost,'Established '+teamName,'Team ownership');
    finish(teamName+' has joined the fictional F1 driver market with two seats and a starting budget.');
  }
  function buyTeam(name){
    const z=state(),book=api.careerRoster?.();
    if(!z||!book||!book.roster[name])return;
    if(api.years()<18)return finish('F1 team ownership unlocks at age 18.');
    if(z.x.team)return finish('You already own an F1 team. Sell it before another takeover.');
    const cost=teamAcquisitionCost(name);
    if(career.cash<cost)return finish('This fictional buyout costs '+fmtMoney(cost)+'.');
    career.cash-=cost;
    z.x.team={name,type:'takeover',started:z.c.day,price:cost,
      balance:12000000,development:{aero:1,engine:1,strategy:1,facilities:1},
      weeks:0,sponsors:[],championshipPoints:0,brand:72,profit:0};
    ledger('F1 team buyout',-cost,'Bought fictional ownership of '+name,'Team ownership');
    finish('You now own '+name+' in this simulated F1 career. Existing driver seats remain.');
  }
  function teamUpgradeCost(key){
    const team=ownedTeam();
    if(!team||!DEVELOPMENT.some(d=>d.id===key))return 0;
    return Math.round(1000000*(1+(team.development[key]||1)*.8));
  }
  function improveTeam(key){
    const team=ownedTeam();if(!team)return;
    const price=teamUpgradeCost(key);
    if(!price||team.balance<price)return finish('Not enough team budget. The racing operation needs '+fmtMoney(price)+'.');
    team.balance-=price;
    team.development[key]=(team.development[key]||1)+1;
    team.brand=clamp(team.brand+2,0,100);
    const book=api.careerRoster?.();
    for(const id of book?.roster[team.name]||[]){
      const driver=book.drivers[id];
      if(driver)driver.ability=clamp(driver.ability+1,40,99);
    }
    teamBonuses();
    finish('Your '+team.name+' '+key+' division improved to level '+team.development[key]+'.');
  }
  function investInTeam(raw){
    const team=ownedTeam();if(!team)return;
    const amount=Number(String(raw).trim());
    if(!whole(amount)||amount<10000||amount>career.cash)return finish('Enter a whole-number team funding amount of at least 10,000, within your virtual balance.');
    career.cash-=amount;team.balance+=amount;
    ledger('Team capital transfer',-amount,'Funded '+team.name,'Team funding transfers');
    finish('Moved '+fmtMoney(amount)+' in virtual funds to '+team.name+"'s racing budget.");
  }
  function sellTeam(){
    const z=state(),team=z?.x.team;
    if(!team)return;
    const value=Math.round(team.price*.67+Math.max(0,team.balance));
    career.cash+=value;
    ledger('F1 team sale',value,'Sold fictional stake in '+team.name,'Team sale');
    z.x.businessHistory.push({day:z.c.day,text:'Sold '+team.name+' for '+fmtMoney(value)});
    z.x.team=null;
    z.x.teamBonus=0;
    finish('Your simulated ownership of '+team.name+' has ended.');
  }
  function manageTeamDriving(){
    const z=state(),team=z?.x.team;
    if(!team)return;
    if(api.years()<18||career.stage!==4)return finish('You must reach the F1 racing stage and be at least 18 to drive for your team.');
    if(career.team===team.name)return finish('You already drive for your own team.');
    const oldName=career.team;
    const c=z.c;
    career.team=team.name;
    c.f1Deal={team:team.name,salary:4000000,years:2,endDay:c.day+730};
    career.contract={team:team.name,salary:Math.round(4000000/24),remaining:48,total:48};
    api.enterCareerTeam?.(team.name);
    c.staff=[];c.staffTeam=null;
    api.ensureStaff();
    teamBonuses();
    finish('You moved from '+oldName+' to your own F1 team, '+team.name+'.');
  }
  function weeklyOperations(){
    const z=state(),{c,x}=z;
    if(c.day%7!==0)return;
    for(const b of x.businesses){
      const type=BUSINESS_TYPES.find(t=>t.id===b.type);
      if(!type)continue;
      const seasonality=.90+Math.random()*.20;
      const income=Math.round(type.weeklyRevenue*(1+.24*(b.level-1))*seasonality);
      const cost=Math.round(type.weeklyCosts*(1+.15*(b.level-1)));
      const net=income-cost;
      career.cash+=net;
      b.earned+=income;b.spent+=cost;b.operatingWeeks++;
      b.reputation=clamp(b.reputation+(net>0?1:-1),0,100);
      ledger('Business revenue',income,b.name+' · weekly sales','Business income');
      ledger('Business operating costs',-cost,b.name+' · payroll and running costs','Business costs');
    }
    const team=x.team;
    if(team){
      const level=Object.values(team.development).reduce((n,v)=>n+v,0);
      const income=Math.round(820000+team.brand*2600+team.sponsors.length*55000);
      const expenses=Math.round(680000+Math.max(0,level-4)*28000);
      team.balance+=income-expenses;
      team.weeks++;
      team.profit+=income-expenses;
      // Team turnover is a separate account; not credited directly to driver.
      if(team.balance<0){team.balance=0;team.brand=clamp(team.brand-2,0,100);}
    }
  }
  function daily(){
    const z=state(),before=z?.c.day;
    originals.daily();
    if(!career||z.c.day===before)return;
    weeklyOperations();
    teamBonuses();
    save();
  }
  function start(...args){
    const result=originals.start(...args);
    const z=state();if(z)z.x.difficulty='rookie';
    return result;
  }
  function successor(...args){
    const prev=career?.name;
    const result=originals.successor(...args);
    if(career?.name!==prev){state();save();}
    return result;
  }
  function signF1(name){
    const result=originals.signF1(name);
    teamBonuses();
    return result;
  }
  function yearAdvance(){
    const z=state();if(!z)return;
    const from=z.c.day,wasAge=api.years();
    let raced=0,missed=0,errors=null,advanced=0;
    const oldRender=render,oldToast=toast;
    try{
      render=function(){};
      toast=function(){};
      for(let i=0;i<365;i++){
        const current=api.migrate();
        if(api.isRaceDay()&&current.lastRaceDay!==current.day){
          const fee=[310,600,800,1000,0][career.stage]||0;
          const covered=api.years()<16||
            (current.scholarship?.active&&career.stage===0);
          const canRace=career.energy>=19&&
            (covered||career.cash>=fee)&&
            (career.stage!==4||current.f1Deal);
          if(canRace){
            const before=career.raceCount;
            api.race();
            if(career.raceCount>before)raced++;
            else missed++;
          }else{
            current.lastRaceDay=current.day;
            missed++;
            current.v83.missedWeekends=(current.v83.missedWeekends||0)+1;
          }
        }
        api.daily();
        advanced++;
      }
    }catch(e){errors=e;}
    finally{
      render=oldRender;
      toast=oldToast;
    }
    const current=state();
    current.x.yearSkips++;
    current.x.lastAdvance={from,to:current.c.day,days:advanced,raced,missed,
      ageBefore:wasAge,ageAfter:api.years()};
    if(current.c.v83)current.c.v83.lastFastForward={
      kind:'year',from,to:current.c.day,days:advanced,simulated:raced,missed,
      lastPosition:career.lastReport?.position||null};
    save();render();
    if(errors){toast('The year advance stopped early. Your saved progress has been retained.');return;}
    toast('One year advanced · '+raced+' races · '+missed+' missed weekends · age '+api.years()+'.');
  }
  api.DIFFICULTIES=DIFFICULTIES;
  api.BUSINESS_TYPES=BUSINESS_TYPES;
  api.TEAM_DEVELOPMENT=DEVELOPMENT;
  api.careerV85=state;
  api.difficultyList=difficultyList;
  api.selectDifficulty=selectDifficulty;
  api.investCustom=investCustom;
  api.startCompany=startCompany;
  api.upgradeCompany=upgradeCompany;
  api.businessUpgradeCost=businessUpgradeCost;
  api.makeOwnedTeam=makeTeam;
  api.buyOwnedTeam=buyTeam;
  api.teamAcquisitionCost=teamAcquisitionCost;
  api.teamUpgradeCost=teamUpgradeCost;
  api.improveTeam=improveTeam;
  api.investInTeam=investInTeam;
  api.sellOwnedTeam=sellTeam;
  api.driveOwnedTeam=manageTeamDriving;
  api.fastForward=(kind)=>kind==='year'?yearAdvance():originals.fastForward(kind);
  api.daily=daily;
  api.start=start;
  api.successor=successor;
  api.signF1=signF1;
  if(career){state();teamBonuses();}
})();