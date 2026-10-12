/* PITWALL V8.2 — career progression, academy reviews, NPC networks and
   generational life paths. Additive V8 save extension; no README edits. */
'use strict';
(function(){
  const api=window.pitwallCareer8;
  if(!api)return;
  const old={
    migrate:api.migrate,daily:api.daily,race:api.race,promote:api.promote,
    scoutSeat:api.scoutSeat,acceptScholarship:api.acceptScholarship,
    ensureStaff:api.ensureStaff,relationship:api.relationship,
    successor:api.successor,seekSponsor:api.seekSponsor,signF1:api.signF1,child:api.child
  };
  const ACADEMIES=[
    {id:'apex',name:'Apex Junior Programme',partner:'Williams',minRep:24,weekly:380,grant:2800,seatRep:72,teamwork:1},
    {id:'aurora',name:'Aurora Formula Academy',partner:'Mercedes',minRep:38,weekly:520,grant:3900,seatRep:90,teamwork:2},
    {id:'scarlet',name:'Scarlet Driver Development',partner:'Ferrari',minRep:50,weekly:650,grant:4800,seatRep:105,teamwork:2},
    {id:'papaya',name:'Papaya Motorsport Academy',partner:'McLaren',minRep:41,weekly:550,grant:4200,seatRep:97,teamwork:2},
    {id:'velocity',name:'Velocity Youth Racing',partner:'Red Bull Racing',minRep:32,weekly:430,grant:3200,seatRep:83,teamwork:1}
  ];
  const PERSONALITIES=[
    {id:'thoughtful',name:'Thoughtful',scene:'carefully reviews the race data and offers detailed feedback'},
    {id:'energetic',name:'Energetic',scene:'brings excitement to the garage and celebrates small improvements'},
    {id:'focused',name:'Focused',scene:'prefers a structured plan and clear responsibilities'},
    {id:'creative',name:'Creative',scene:'suggests an inventive solution to a tricky weekend'},
    {id:'competitive',name:'Competitive',scene:'pushes everyone to improve their performance'},
    {id:'supportive',name:'Supportive',scene:'checks how the team is coping before the next session'}
  ];
  const NAMES=[
    ['Kai','Porter'],['Nina','Silva'],['Theo','Marquez'],
    ['Maya','Bennett'],['Luca','Fernandez'],['Amira','Hayes'],
    ['Ellie','Brooks'],['Oliver','Khan'],['Avery','Sutton'],
    ['Mika','Patel'],['Jules','Foster'],['Harper','Chen']
  ];
  const CAREERS=['Mechanic','Architect','Software engineer','Teacher','Graphic designer','Chef','Journalist','Pilot','Business founder','Professional driver'];
  const MIN=(n,a,b)=>Math.max(a,Math.min(b,n));
  const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  function ensure(){
    const c=old.migrate();
    if(!c)return null;
    if(!c.v82){
      c.v82={
        version:2,academy:null,offers:[],lastAssessment:null,reviewResults:[],
        lastAcademyOfferDay:-365,academyHistory:[],sponsorOffers:[],lastSponsorOfferDay:-365,
        publicFriends:[],socialProfiles:{},messages:[],kidsDevelopment:{},
        familyArchive:[],talentReports:[],juniorSeason:{},lastJuniorReviewDay:-365,
        mentorship:0
      };
    }
    const x=c.v82;
    for(const key of ['offers','reviewResults','academyHistory','sponsorOffers','publicFriends',
      'messages','familyArchive','talentReports'])if(!Array.isArray(x[key]))x[key]=[];
    for(const key of ['socialProfiles','kidsDevelopment'])if(!x[key]||typeof x[key]!=='object')x[key]={};
    // Old characters and their relationships are retained and never recreated.
    for(const child of c.kids||[]){
      if(x.kidsDevelopment[child.id])continue;
      const born=Number(child.birthDay)||0;
      const age=Math.max(0,Math.floor((c.day-born)/365));
      const milestones=age>=18?['At 16, explored interests and training.','At 18, began a pathway in '+(child.job||'Undecided')+'.']:
        age>=16?['At 16, began exploring '+(child.job||'new interests')+'.']:[];
      x.kidsDevelopment[child.id]={
        talent:rand(35,88),racingInterest:child.job==='Racing driver'?80:rand(5,55),
        education:age>=18?'Completed school':age>=13?'Secondary school':age>=6?'Primary school':'Early years',
        work:child.job||'Undecided',level:Math.max(1,Math.floor(age/5)),
        lastYear:age,earnings:age>=18?rand(1000,12000):0,
        milestones,personality:PERSONALITIES[rand(0,PERSONALITIES.length-1)].name
      };
    }
    return c;
  }
  function xState(){return ensure()?.v82;}
  function news(message){
    const c=ensure(),x=c?.v82;
    if(!x)return;
    x.messages.unshift({day:c.day,text:message});
    x.messages=x.messages.slice(0,32);
  }
  function updated(message){
    if(message)news(message);
    save();
    render();
    if(message&&typeof toast==='function')toast(message);
  }
  function canOffer(a,c){
    const prior=xState().academyHistory;
    return career.stage===0&&api.years()>=11&&career.reputation>=a.minRep&&
      !prior.some(y=>y.id===a.id&&y.status==='dropped')&&
      !xState().offers.some(o=>o.id===a.id);
  }
  function proposeAcademies(result){
    const c=ensure(),x=c.v82;
    if(career.stage!==0||api.years()<11||x.academy?.status==='ACTIVE'||result.position>9)return;
    if(c.day-x.lastAcademyOfferDay<28)return;
    const eligible=ACADEMIES.filter(a=>canOffer(a,c));
    if(!eligible.length)return;
    const ranked=eligible.sort((a,b)=>Math.abs(a.minRep-career.reputation)-Math.abs(b.minRep-career.reputation));
    const offer=ranked[0];
    if(Math.random()>.38+Math.min(.48,career.reputation/250))return;
    x.offers.push({...offer,createdDay:c.day,expiresDay:c.day+35});
    x.lastAcademyOfferDay=c.day;
    news(offer.name+' has invited you to its junior academy assessment.');
  }
  function acceptAcademy(id){
    const c=ensure(),x=c.v82,offer=x.offers.find(o=>o.id===id);
    if(!offer||x.academy?.status==='ACTIVE')return updated('This academy offer is no longer available.');
    if(c.day>offer.expiresDay)return updated('This academy offer has expired.');
    x.academy={id:offer.id,name:offer.name,partner:offer.partner,weekly:offer.weekly,
      seatRep:offer.seatRep,grade:75,status:'ACTIVE',poorReviews:0,
      joinedDay:c.day,renewsAtDay:c.day+365,scholarshipActive:true};
    x.academyHistory.push({id,name:offer.name,status:'active',day:c.day});
    x.offers=[];
    c.scholarship={active:true,weekly:offer.weekly,required:Math.max(12,career.reputation-35),
      offerDay:c.day};
    c.scout={offered:true,status:'Academy-backed development pathway; F1 seat review from age 18.',
      threshold:offer.seatRep};
    career.cash+=offer.grant;
    news('Signed with '+offer.name+'. Scholarship grant and weekly funding awarded.');
    updated('Joined '+offer.name+' · '+offer.partner+' affiliated (fictional).');
  }
  function academyAssessment(report){
    const c=ensure(),x=c.v82,a=x.academy;
    if(!a||a.status!=='ACTIVE')return;
    const pos=Number(report.position)||18,rep=Number(report.rep)||0;
    const performance=MIN(103-Math.round((pos-1)*5)+rep+Math.round(api.totalSkill()*.24),0,100);
    a.grade=Math.round(.65*a.grade+.35*performance);
    x.reviewResults.push({day:c.day,position:pos,grade:a.grade,rep});
    x.reviewResults=x.reviewResults.slice(-45);
    a.poorReviews=a.grade<37?a.poorReviews+1:Math.max(0,a.poorReviews-1);
    x.lastAssessment={day:c.day,grade:a.grade,position:pos,academy:a.name,
      verdict:a.grade>=75?'Outstanding':a.grade>=55?'On track':a.grade>=37?'Improvement needed':'At risk'};
    if(a.poorReviews>=3){
      a.status='DROPPED';a.scholarshipActive=false;
      if(c.scholarship)c.scholarship.active=false;
      if(c.scout)c.scout.offered=false;
      const rec=x.academyHistory.find(h=>h.id===a.id&&h.status==='active');
      if(rec)rec.status='dropped';
      news(a.name+' ended your scholarship after repeated poor reviews.');
    }else if(a.grade<46){
      news(a.name+' placed your development plan under review.');
    }else if(a.grade>=80&&report.position<=3){
      career.reputation=MIN(career.reputation+2,-50,500);
      news('Academy report: strong performance. Reputation +2.');
    }
  }
  function seatEvaluation(){
    const c=ensure(),x=c.v82,a=x.academy;
    if(!a||a.status!=='ACTIVE'||api.years()<18)return null;
    const last=x.reviewResults.slice(-6);
    const average=last.length?last.reduce((sum,y)=>sum+y.grade,0)/last.length:a.grade;
    const eligible=career.reputation>=a.seatRep&&api.totalSkill()>=12&&
      a.grade>=55&&average>=53;
    return {eligible,threshold:a.seatRep,grade:a.grade,average:Math.round(average),
      team:a.partner,reason:eligible?'Eligible for a fictional academy F1 seat review':
      'Improve reputation, skill and recent assessment grades to keep the seat opportunity.'};
  }
  function requestAcademySeat(){
    const check=seatEvaluation(),c=ensure(),a=c?.v82.academy;
    if(!check?.eligible)return updated('Academy F1 seat criteria are not yet satisfied.');
    if(career.stage!==4)career.stage=4;
    career.team=a.partner;
    const salary=3600000+Math.round(api.totalSkill()*14000/100000)*100000;
    c.f1Deal={team:a.partner,salary,years:2,endDay:c.day+730};
    career.contract={team:a.partner,salary:Math.round(salary/24),remaining:48,total:48};
    c.staff=[];c.staffTeam=null;
    old.ensureStaff();
    ensureStaff();
    a.status='GRADUATED';
    if(c.scholarship)c.scholarship.active=false;
    news('Academy F1 development seat awarded after a successful review.');
    updated('Signed an F1 seat with '+a.partner+' at '+fmtMoney(salary)+'/year (fictional).');
  }
  function sponsorOffer(){
    const c=ensure(),x=c.v82;
    if(api.years()<16||career.reputation<30||c.day-x.lastSponsorOfferDay<42)return;
    const categories=[
      {name:'Pinnacle Engineering',weekly:1200},
      {name:'ClearSky Motorsports',weekly:1850},
      {name:'Vista Technology Group',weekly:2400},
      {name:'Harbour Mobility',weekly:1600}
    ];
    const a=categories[rand(0,categories.length-1)];
    if((c.sponsors||[]).some(s=>s.name===a.name))return;
    if(x.sponsorOffers.some(s=>s.name===a.name&&s.expiresDay>c.day))return;
    const amount=a.weekly+Math.max(0,Math.round(career.reputation*12));
    x.sponsorOffers.push({name:a.name,weekly:amount,expiresDay:c.day+35,offeredAt:c.day});
    x.lastSponsorOfferDay=c.day;
    news(a.name+' is considering a '+fmtMoney(amount)+'/week virtual sponsorship.');
  }
  function acceptSponsor(name){
    const c=ensure(),x=c.v82,o=x.sponsorOffers.find(y=>y.name===name);
    if(!o||o.expiresDay<c.day)return updated('That sponsor offer has expired.');
    if(c.sponsors.some(s=>s.name===name))return;
    c.sponsors.push({name,weekly:o.weekly,started:c.day});
    x.sponsorOffers=x.sponsorOffers.filter(s=>s!==o);
    updated('Signed a fictional '+name+' sponsorship for '+fmtMoney(o.weekly)+'/week.');
  }
  function peopleProfiles(){
    const c=ensure(),x=c.v82;
    old.ensureStaff();
    for(const p of c.staff){
      if(!x.socialProfiles[p.id]){
        const role=p.role;
        const personality=PERSONALITIES[Math.abs(p.portrait||0)%PERSONALITIES.length];
        x.socialProfiles[p.id]={personality:personality.name,
          likes:role==='Race engineer'?'Clear feedback':role==='Media officer'?'Honest interviews':'Dependable teamwork',
          lastTalkDay:-1,moments:0,skill:role==='Race engineer'?'Strategy':'Teamwork'};
      }
    }
    if(!x.publicFriends.length){
      const base=c.day%1000+career.name.length*9;
      for(let i=0;i<6;i++){
        const pair=NAMES[(i*3+base)%NAMES.length];
        const role=['Neighbour','Motorsport journalist','Junior coach','Friend from school','Car designer','Racing fan'][i];
        const p={id:'outside-'+career.name.length+'-'+i,name:pair.join(' '),role,
          team:'Independent',age:19+i*3,portrait:base+i*11,relationship:'Friend'};
        x.publicFriends.push(p);
        c.contacts[p.id]=p;
        c.relations[p.id]??=rand(8,27);
        x.socialProfiles[p.id]={personality:PERSONALITIES[(base+i)%PERSONALITIES.length].name,
          likes:['Motorsport','Music','Art','Design','Cars','Travel'][i],lastTalkDay:-1,moments:0};
      }
    }else{
      for(const p of x.publicFriends){c.contacts[p.id]=p;c.relations[p.id]??=10;}
    }
    return x.publicFriends;
  }
  function socialInteraction(id,kind){
    const c=ensure(),x=c.v82;
    peopleProfiles();
    const p=c.contacts[id];
    if(!p)return;
    if(c.relationsDay===c.day)return updated('You have already spent time with someone today.');
    const meta=x.socialProfiles[id]||{personality:'Thoughtful',moments:0};
    let delta=rand(2,7),message='';
    if(kind==='listen'){
      delta+=3;career.morale=MIN(career.morale+2,0,100);
      message=p.name+' shared feedback and you listened carefully.';
    }else if(kind==='collaborate'){
      delta+=2;career.skillPoints+=1;
      if(career.stage>=1)career.reputation=MIN(career.reputation+1,-50,500);
      message='Working alongside '+p.name+' improved teamwork and earned 1 skill point.';
    }else if(kind==='disagree'){
      delta=-rand(2,6);career.morale=MIN(career.morale-1,0,100);
      message='You and '+p.name+' disagreed. Your working relationship needs care.';
    }else return;
    c.relationsDay=c.day;
    c.relations[id]=MIN((c.relations[id]||12)+delta,0,100);
    meta.moments=(meta.moments||0)+1;
    meta.lastTalkDay=c.day;
    x.socialProfiles[id]=meta;
    updated(message);
  }
  function teamMood(){
    const c=ensure();
    old.ensureStaff();
    const scores=c.staff.map(p=>c.relations[p.id]||0);
    const avg=scores.length?scores.reduce((sum,n)=>sum+n,0)/scores.length:20;
    return {average:Math.round(avg),bonus:Math.round((avg-20)*.06),
      label:avg>=72?'Excellent':avg>=48?'Strong':avg>=28?'Developing':'Needs attention'};
  }
  function childAge(child,c){return Math.max(0,Math.floor((c.day-child.birthDay)/365))}
  function tickChildren(){
    const c=ensure(),x=c.v82;
    for(const child of c.kids){
      const info=x.kidsDevelopment[child.id],age=childAge(child,c);
      if(!info)continue;
      // One progression milestone per birthday, including old imported saves.
      while(info.lastYear<age){
        info.lastYear++;
        const year=info.lastYear;
        if(year===6)info.education='Primary school';
        if(year===13)info.education='Secondary school';
        if(year===16){
          info.education='Senior school / training';
          info.racingInterest=MIN(info.racingInterest+rand(-8,13),0,100);
          info.milestones.push('At 16, started exploring '+info.work.toLowerCase()+'.');
        }
        if(year===18){
          info.education='Finished school';
          info.work=info.racingInterest>=70&&info.talent>=65?'Junior racing driver':info.work;
          info.milestones.push('At 18, chose a pathway in '+info.work+'.');
        }
        if(year>=18){
          info.level=Math.min(100,(info.level||1)+rand(1,3));
          const income=info.work==='Junior racing driver'?rand(0,6500):rand(1200,11000);
          info.earnings=Math.max(0,(info.earnings||0)+income);
        }
        if(year>20&&year%4===0){
          if(info.work!=='Junior racing driver'&&info.racingInterest>=76&&info.talent>=60){
            info.work='Motorsport engineering';
            info.milestones.push('Explored motorsport as a new career interest.');
          }else{
            info.milestones.push('Advanced in '+info.work+'.');
          }
        }
      }
      info.milestones=info.milestones.slice(-6);
    }
  }
  function encourageChild(id,kind){
    const c=ensure(),x=c.v82;
    const child=c.kids.find(k=>k.id===id),d=x.kidsDevelopment[id];
    if(!child||!d)return;
    if(c.relationsDay===c.day)return updated('Your daily family interaction has already been used.');
    c.relationsDay=c.day;
    if(kind==='racing'){
      d.racingInterest=MIN(d.racingInterest+rand(5,10),0,100);
      d.talent=MIN(d.talent+1,0,100);
      updated(child.name+' explored motorsport as a hobby.');
    }else if(kind==='school'){
      d.education='Learning and growing';
      d.level=(d.level||1)+1;
      updated(child.name+' spent time learning skills for their own career.');
    }
  }
  function academyOnRace(){
    const c=ensure(),x=c.v82;
    const report=career.lastReport;
    if(!report)return;
    if(career.stage===0)proposeAcademies(report);
    academyAssessment(report);
    sponsorOffer();
    const trust=teamMood();
    if(trust.average>=55){
      career.reputation=MIN(career.reputation+1,-50,500);
      news('Supportive team atmosphere adds +1 reputation after the race.');
    }
    x.talentReports.push({day:c.day,stage:career.stage,position:report.position,
      trust:trust.average,academyGrade:x.academy?.grade??null});
    x.talentReports=x.talentReports.slice(-40);
  }
  function daily(){
    const before=career?.v8?.day;
    old.daily();
    if(!career||career.v8.day===before)return;
    const c=ensure(),x=c.v82;
    if(c.day%365===0){
      if(x.academy?.status==='ACTIVE'&&career.reputation<x.academy.seatRep-55){
        x.academy.poorReviews++;
        if(x.academy.poorReviews>=3){x.academy.status='DROPPED';if(c.scholarship)c.scholarship.active=false;}
      }
      sponsorOffer();
    }
    x.offers=x.offers.filter(o=>o.expiresDay>=c.day);
    x.sponsorOffers=x.sponsorOffers.filter(o=>o.expiresDay>=c.day);
    tickChildren();
    save();
  }
  function race(){
    const count=career?.raceCount||0;
    old.race();
    if(!career||career.raceCount<=count)return;
    academyOnRace();
    save();render();
  }
  function promote(){
    const prior=career?.stage;
    old.promote();
    if(!career||career.stage===prior)return;
    const c=ensure(),x=c.v82;
    if(x.academy?.status==='ACTIVE'){
      career.cash+=Math.round(x.academy.weekly*3);
      news(x.academy.name+' supported your promotion to '+['Karting','F4','F3','F2','F1'][career.stage]+'.');
    }
    peopleProfiles();save();
  }
  function child(){
    const c=ensure(),count=c.kids.length;
    old.child();
    if(!career)return;
    const updatedC=ensure();
    if(updatedC.kids.length>count){
      const newborn=updatedC.kids[updatedC.kids.length-1];
      const d=updatedC.v82.kidsDevelopment[newborn.id];
      if(d)d.milestones.push('Joined the family.');
      save();
    }
  }
  function successor(id){
    const oldC=ensure(),oldX=oldC?.v82,child=oldC?.kids.find(k=>k.id===id);
    const development=child&&oldX?.kidsDevelopment[child.id];
    const oldName=career?.name;
    const siblingArchive=oldC?.kids.filter(k=>k.id!==id).map(k=>({
      name:k.name,job:oldX.kidsDevelopment[k.id]?.work||k.job,
      age:childAge(k,oldC),generation:'Family relative'
    }))||[];
    old.successor(id);
    if(!career||career.name===oldName)return;
    const c=ensure(),x=c.v82;
    x.familyArchive=(oldX?.familyArchive||[]).concat(siblingArchive);
    x.nextGen={
      inheritedTalent:development?.talent||45,
      initialInterest:development?.racingInterest||20,
      originalCareer:development?.work||'Unknown',
      education:development?.education||'Unknown',
      inheritedAt:c.day
    };
    // Skills translate only modestly; the new driver still needs development.
    const startBoost=Math.floor((development?.talent||40)/25);
    for(const k of ['racecraft','focus','teamwork'])c.skills[k]=startBoost;
    c.xp={};
    career.fitness=MIN(45+startBoost*3,0,100);
    news('New generation: '+career.name+' transitioned from '+x.nextGen.originalCareer+' to motorsport.');
    save();render();
  }
  function acceptScholarship(){
    const c=ensure(),x=c?.v82;
    if(x?.academy?.status==='ACTIVE')return updated('Your academy scholarship is already active.');
    old.acceptScholarship();
  }
  function signF1(name){
    const oldTeam=career?.team;
    old.signF1(name);
    if(career?.team!==oldTeam){peopleProfiles();news('Met your new '+name+' team and its staff.');save();}
  }
  function relationship(id,kind){
    peopleProfiles();
    old.relationship(id,kind);
  }
  api.ACADEMIES=ACADEMIES;
  api.PERSONALITIES=PERSONALITIES;
  api.migrate=ensure;
  api.ensureStaff=()=>{const a=old.ensureStaff();peopleProfiles();return a;};
  api.daily=daily;
  api.race=race;
  api.promote=promote;
  api.child=child;
  api.successor=successor;
  api.signF1=signF1;
  api.relationship=relationship;
  api.acceptScholarship=acceptScholarship;
  api.acceptAcademy=acceptAcademy;
  api.requestAcademySeat=requestAcademySeat;
  api.seatEvaluation=seatEvaluation;
  api.acceptSponsor=acceptSponsor;
  api.peopleProfiles=peopleProfiles;
  api.socialInteraction=socialInteraction;
  api.teamMood=teamMood;
  api.childProgress=id=>xState()?.kidsDevelopment?.[id]||null;
  api.encourageChild=encourageChild;
  api.childAge=childAge;
  api.sponsorOffer=sponsorOffer;
  if(career){ensure();peopleProfiles();tickChildren();save();}
})();