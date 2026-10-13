/* PITWALL V8.3 — time skipping, milestone-based purchases, and lifestyle.
   Non-gambling fictional economy, normal balanced food and fitness amenities.
   Adds fields to v8.v83, retaining existing driver save and game progress. */
'use strict';
(function(){
  const api=window.pitwallCareer8;
  if(!api) return;
  const originals={
    daily:api.daily,
    start:api.start,
    successor:api.successor,
    buy:api.buy
  };
  const GOODS=[
    {id:'phone-basic',name:'Everyday smartphone',type:'tech',price:650,morale:2,description:'A reliable phone for staying in touch'},
    {id:'phone-pro',name:'Flagship smartphone',type:'tech',price:1750,morale:3,description:'Premium camera and entertainment features'},
    {id:'laptop',name:'Performance laptop',type:'tech',price:2300,morale:2,description:'For study, editing and race notes'},
    {id:'tablet',name:'Creative tablet',type:'tech',price:980,morale:2,description:'Portable sketching and media device'},
    {id:'headphones',name:'Wireless headphones',type:'tech',price:420,morale:2,description:'Music and everyday listening'},
    {id:'smartwatch',name:'Smartwatch',type:'tech',price:560,morale:1,description:'Appointments, notifications and routines'},
    {id:'console',name:'Games console',type:'home',price:680,morale:3,description:'Games and entertainment'},
    {id:'furniture',name:'Bedroom furniture upgrade',type:'home',price:1400,morale:3,description:'A more comfortable living space'},
    {id:'simulator',name:'Home racing simulator',type:'hobby',price:3600,morale:3,pace:2,description:'A small bonus for racing practice'},
    {id:'camera',name:'Photography camera',type:'hobby',price:1100,morale:2,description:'A creative hobby for days off'},
    {id:'bicycle',name:'Leisure bicycle',type:'hobby',price:820,morale:2,description:'Getting around and enjoying free time'}
  ];
  const PLANS=[
    {id:'meals',name:'Balanced food plan',weekly:85,description:'Regular varied meals and convenient meal preparation',energy:3},
    {id:'gym',name:'Gym membership',weekly:55,description:'Optional moderate fitness sessions and training facilities',fitness:1},
    {id:'recovery',name:'Recovery & physiotherapy membership',weekly:125,description:'Comfort, rest and professional recovery support',energy:2},
    {id:'coaching',name:'Driver coaching programme',weekly:240,description:'Additional mentoring and racing simulation support',pace:2}
  ];
  const HISTORY_MAX=38;
  function state(){
    const c=api.migrate();
    if(!c)return null;
    if(!c.v83)c.v83={
      version:3,items:career.purchases?.includes('sim')?['simulator']:[],
      memberships:{},ledger:[],lastFastForward:null,fastForwardRuns:0
    };
    const v=c.v83;
    if(!Array.isArray(v.items))v.items=[];
    if(!v.memberships||typeof v.memberships!=='object')v.memberships={};
    if(!Array.isArray(v.ledger))v.ledger=[];
    if(v.fastForwardRuns===undefined)v.fastForwardRuns=0;
    return {c,v};
  }
  function ages(){return Number(api.years())||0;}
  function minimumAge(kind){return kind==='home'?18:kind==='car'?17:16;}
  function canBuyProperty(item){return !!item&&ages()>=minimumAge(item.kind);}
  function entry(description,amount){
    const sv=state();if(!sv)return;
    sv.v.ledger.unshift({day:sv.c.day,description,amount});
    sv.v.ledger=sv.v.ledger.slice(0,HISTORY_MAX);
  }
  function update(message){
    save();render();
    if(message&&typeof toast==='function')toast(message);
  }
  function start(name,gender,country){
    const result=originals.start(name,gender,country);
    state();save();return result;
  }
  function successor(id){
    const prev=career?.name;
    originals.successor(id);
    if(career&&career.name!==prev){state();save();}
  }
  function buyProperty(id){
    const x=api.PROPERTY.find(p=>p.id===id);
    if(!x)return;
    const minAge=minimumAge(x.kind);
    if(ages()<minAge)return update(x.kind==='car'?'Vehicles unlock at age 17.':'Houses unlock at age 18.');
    originals.buy(id);
  }
  function buyItem(id){
    if(ages()<16)return update('Lifestyle purchases unlock at age 16.');
    const sv=state(),item=GOODS.find(x=>x.id===id);
    if(!sv||!item)return;
    if(sv.v.items.includes(id))return update(item.name+' is already owned.');
    if(career.cash<item.price)return update('Not enough virtual cash to buy '+item.name+'.');
    career.cash-=item.price;
    sv.v.items.push(id);
    career.morale=Math.min(100,career.morale+item.morale);
    entry('Purchased '+item.name,-item.price);
    update(item.name+' has been added to your Lifestyle collection.');
  }
  function sellItem(id){
    if(ages()<16)return update('Lifestyle unlocks at age 16.');
    const sv=state(),item=GOODS.find(x=>x.id===id);
    if(!sv||!item||!sv.v.items.includes(id))return;
    const resale=Math.round(item.price*0.55);
    sv.v.items=sv.v.items.filter(x=>x!==id);
    career.cash+=resale;
    entry('Sold '+item.name,resale);
    update(item.name+' sold for '+fmtMoney(resale)+' virtual cash.');
  }
  function joinPlan(id){
    if(ages()<16)return update('Lifestyle memberships unlock at age 16.');
    const sv=state(),plan=PLANS.find(x=>x.id===id);
    if(!sv||!plan)return;
    if(sv.v.memberships[id])return update('You already have this membership.');
    if(career.cash<plan.weekly)return update('Not enough virtual cash for the first week.');
    // Charge first week here, then every subsequent game week at rollover.
    career.cash-=plan.weekly;
    sv.v.memberships[id]={since:sv.c.day,paidThrough:sv.c.day+7};
    entry('Joined '+plan.name,-plan.weekly);
    update(plan.name+' is active. Next charge in one game week.');
  }
  function cancelPlan(id){
    const sv=state(),plan=PLANS.find(x=>x.id===id);
    if(!sv||!plan||!sv.v.memberships[id])return;
    delete sv.v.memberships[id];
    update(plan.name+' cancelled. No further charges.');
  }
  function daily(){
    const before=career?.v8?.day;
    originals.daily();
    if(!career||career.v8.day===before)return;
    const {c,v}=state();
    // Memberships bill on their own 7-day anniversaries; a lapsed plan
    // stops when virtual funds cannot cover renewal.
    for(const plan of PLANS){
      const membership=v.memberships[plan.id];
      if(!membership)continue;
      if(!Number.isFinite(Number(membership.paidThrough)))
        membership.paidThrough=c.day+7;
      if(c.day>=membership.paidThrough){
        if(career.cash>=plan.weekly){
          career.cash-=plan.weekly;
          membership.paidThrough+=7;
          entry(plan.name+' weekly membership',-plan.weekly);
        }else{
          delete v.memberships[plan.id];
          entry(plan.name+' ended (insufficient virtual funds)',0);
        }
      }
      if(v.memberships[plan.id]&&plan.energy)
        career.energy=Math.min(100,career.energy+plan.energy);
      if(v.memberships[plan.id]&&plan.fitness&&c.day%7===0)
        career.fitness=Math.min(100,career.fitness+plan.fitness);
    }
    save();
  }
  // End Week advances seven in-game days, and automatically plays any
  // eligible race weekend passed. Skip to Race stops before the next race.
  function fastForward(kind){
    if(!career)return;
    const sv=state();
    const from=sv.c.day;
    let advanced=0,simulated=0,missed=0,raceResult=null;
    const untilNext=kind==='week'?7:405;
    const priorRender=render,priorToast=toast;
    let caught=null;
    // Avoid flashing dozens of frames or toast notifications during a batch.
    try{
      render=function(){};
      toast=function(){};
      if(kind==='race'&&api.isRaceDay()&&sv.c.lastRaceDay!==sv.c.day){
        // Already at the next race: do not simulate it automatically.
      }else{
        while(advanced<untilNext){
          const current=state().c;
          if(kind==='race'&&advanced>0&&api.isRaceDay()&&current.lastRaceDay!==current.day)break;
          if(kind==='week'&&api.isRaceDay()&&current.lastRaceDay!==current.day){
            const required=[310,600,800,1000,0][career.stage]||0;
            const funded=api.years()<16||(current.scholarship?.active&&career.stage===0);
            const canEnter=career.energy>=19&&(career.stage!==4||current.f1Deal)&&
              (funded||career.cash>=required);
            if(canEnter){
              const before=career.raceCount;
              api.race();
              if(career.raceCount>before){
                simulated++;
                raceResult=career.lastReport?.position;
              }
            }else{
              missed++;
              current.lastRaceDay=current.day;
              current.v83.missedWeekends=(current.v83.missedWeekends||0)+1;
              entry('Race weekend missed — no eligible entry',0);
            }
          }
          api.daily();
          advanced++;
          if(kind==='race'&&api.isRaceDay()&&state().c.lastRaceDay!==state().c.day)break;
        }
      }
    }catch(error){caught=error;}
    finally{
      render=priorRender;toast=priorToast;
    }
    const current=state();
    current.v.lastFastForward={
      kind,from,to:current.c.day,days:advanced,simulated,missed,
      lastPosition:raceResult,date:new Date().toISOString()
    };
    current.v.fastForwardRuns++;
    save();render();
    if(caught){toast('Could not finish the whole time skip. Progress was saved.');return;}
    if(kind==='race'){
      toast(advanced===0?'Race day is already here.':
        api.isRaceDay()?'Ready for race day after '+advanced+' days.':
        'Advanced '+advanced+' days. The next race is not currently scheduled.');
    }else{
      toast('Advanced seven days · '+simulated+' simulated race'+(simulated===1?'':'s')+
        (missed?' · '+missed+' missed weekend'+(missed===1?'':'s'):'')+
        (raceResult?' · Latest P'+raceResult:''));
    }
  }
  api.GOODS=GOODS;
  api.PLANS=PLANS;
  api.lifestyleState=state;
  api.minimumAge=minimumAge;
  api.canBuyProperty=canBuyProperty;
  api.buyItem=buyItem;
  api.sellItem=sellItem;
  api.joinPlan=joinPlan;
  api.cancelPlan=cancelPlan;
  api.fastForward=fastForward;
  api.start=start;
  api.successor=successor;
  api.buy=buyProperty;
  api.daily=daily;
  if(career)state();
})();