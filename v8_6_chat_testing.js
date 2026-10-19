/* PITWALL V8.6 — gated chat preview.
   TESTING ONLY: groups/messages exist on this device. GitHub Pages
   cannot provide authenticated multi-user messaging without a backend,
   rules and abuse-reporting tools. Never imply these are online rooms. */
'use strict';
(function(){
  const STORE='pitwall-v86-local-chat-preview';
  const MAX_GROUPS=12,MAX_MESSAGES=120;
  const chars=v=>String(v??'').replace(/[&<>"']/g,c=>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const makeId=()=>Math.random().toString(36).slice(2,10)+'-'+Date.now().toString(36);
  const initial=()=>({profile:{name:'',anonymous:true},groups:[
    {id:'paddock',name:'Race weekend discussion',messages:[]},
    {id:'picks',name:'Free F1 Picks discussion',messages:[]}
  ],active:'paddock'});
  let state=initial();
  try{
    const loaded=JSON.parse(localStorage.getItem(STORE)||'null');
    if(loaded&&typeof loaded==='object'&&Array.isArray(loaded.groups)){
      state.profile={name:String(loaded.profile?.name||'').slice(0,24),anonymous:loaded.profile?.anonymous!==false};
      state.groups=loaded.groups.filter(g=>g&&typeof g.name==='string'&&Array.isArray(g.messages))
        .slice(0,MAX_GROUPS).map(g=>({
          id:String(g.id).slice(0,64),name:g.name.slice(0,35),
          messages:g.messages.slice(-MAX_MESSAGES).map(m=>({
            id:String(m.id||''),body:String(m.body||'').slice(0,400),
            sender:String(m.sender||'You').slice(0,24),at:Number(m.at)||Date.now(),
            anonymous:m.anonymous!==false}))
        }));
      if(!state.groups.length)state.groups=initial().groups;
      state.active=state.groups.some(g=>g.id===loaded.active)?loaded.active:state.groups[0].id;
    }
  }catch(e){}
  function save(){
    try{localStorage.setItem(STORE,JSON.stringify(state));}
    catch(e){if(typeof toast==='function')toast('Local chat preview could not be saved on this device.');}
  }
  function profile(){return window.pitwallPicksProfile?.()||{
    points:100,rank:'ROOKIE STRATEGIST',completedRaces:0,participation:0
  };}
  function current(){return state.groups.find(g=>g.id===state.active)||state.groups[0];}
  function time(at){
    try{return new Date(at).toLocaleString('en-AU',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});}
    catch(e){return '';}
  }
  function page(){
    const currentRoom=current(),stats=profile();
    const shownName=state.profile.anonymous?'Anonymous fan':(state.profile.name.trim()||'Anonymous fan');
    const messages=currentRoom.messages.map(m=>
      '<div class="v86-chat-message"><div class="v86-chat-message-head"><strong>'+
      chars(m.anonymous?'Anonymous fan':m.sender)+'</strong><small>'+chars(time(m.at))+'</small></div>'+
      '<p>'+chars(m.body)+'</p></div>').join('');
    return '<section class="main-tab v86-chat">'+
      '<div class="v86-chat-heading"><small>PITWALL / PIN-LOCKED EXPERIMENT</small>'+
      '<h2>Fan chat · testing preview</h2>'+
      '<p><strong>On-device preview only.</strong> These messages and groups are visible solely in this browser. '+
      'They are not delivered online to other people. Live chat requires an authenticated, moderated backend before launch.</p>'+
      '<p>Use a nickname rather than sharing personal contact details. Your prediction rank is for free Picks achievements, not betting.</p></div>'+
      '<div class="v86-chat-grid"><div class="v86-chat-sidebar">'+
      '<section class="v86-chat-panel"><h3>Your chat profile</h3>'+
      '<div class="v86-chat-points"><span>F1 PICKS CHALLENGE</span><strong>'+
      Number(stats.points||100)+' points</strong><small>'+chars(stats.rank)+'</small>'+
      '<small>'+stats.completedRaces+' scored Grand Prix picks · +'+stats.participation+' participation points</small></div>'+
      '<form id="v86-profile-form" class="v86-chat-form">'+
      '<label>Display name (optional)<input name="displayName" maxlength="24" value="'+
      chars(state.profile.name)+'" placeholder="Your nickname"></label>'+
      '<label class="v86-chat-check"><input type="checkbox" name="anonymous" '+(state.profile.anonymous?'checked':'')+
      '>Post as anonymous</label>'+
      '<button type="submit">SAVE PROFILE</button></form>'+
      '<p class="v86-chat-muted">Nickname/anonymous setting applies only to this local test. Online anonymity would require privacy and safety protections on the server.</p></section>'+
      '<section class="v86-chat-panel"><h3>Test groups</h3>'+
      '<div class="v86-chat-groups">'+state.groups.map(g=>
      '<button type="button" data-v86-room="'+chars(g.id)+'" class="'+
      (g.id===state.active?'active':'')+'">'+chars(g.name)+
      '<small>'+g.messages.length+' local messages</small></button>').join('')+'</div>'+
      '<form id="v86-create-room" class="v86-chat-form">'+
      '<label>New group name<input name="room" maxlength="35" placeholder="e.g. Australian GP"></label>'+
      '<button type="submit" '+(state.groups.length>=MAX_GROUPS?'disabled':'')+'>CREATE TEST GROUP</button>'+
      '</form></section></div>'+
      '<section class="v86-chat-panel v86-chat-room"><div><small>LOCAL TEST GROUP</small>'+
      '<h3>'+chars(currentRoom.name)+'</h3>'+
      '<p>Only you can see these posts. No other fans are connected.</p></div>'+
      '<div class="v86-chat-thread" aria-label="Local chat messages">'+
      (messages||'<p class="v86-chat-empty">No messages yet. Write a test message below.</p>')+'</div>'+
      '<form id="v86-send" class="v86-chat-form"><label>Your message'+
      '<textarea name="message" rows="3" maxlength="400" required placeholder="Write a test message…"></textarea>'+
      '</label><button type="submit">SAVE MESSAGE ON THIS DEVICE</button></form>'+
      '<div class="v86-chat-footer"><small>Live rooms: unavailable · Cloud messages: disabled · Report/block tools: required before online launch.</small>'+
      '<button type="button" data-v86-clear-room>Clear this group’s local messages</button></div>'+
      '</section></div></section>';
  }
  function inside(e){return !!e.target.closest('.v86-chat');}
  document.addEventListener('submit',e=>{
    const f=e.target;
    if(!inside(e))return;
    if(f.id==='v86-profile-form'){
      e.preventDefault();const v=new FormData(f);
      state.profile.name=String(v.get('displayName')||'').replace(/\s+/g,' ').trim().slice(0,24);
      state.profile.anonymous=v.has('anonymous');save();render();
    }else if(f.id==='v86-create-room'){
      e.preventDefault();const v=new FormData(f);
      const name=String(v.get('room')||'').replace(/\s+/g,' ').trim().slice(0,35);
      if(name.length<3){toast('Choose a group name with at least three characters.');return;}
      if(state.groups.length>=MAX_GROUPS){toast('Maximum test groups reached.');return;}
      const id=makeId();state.groups.push({id,name,messages:[]});state.active=id;save();render();
    }else if(f.id==='v86-send'){
      e.preventDefault();const v=new FormData(f);
      const body=String(v.get('message')||'').trim().slice(0,400);
      if(!body)return;
      current().messages.push({id:makeId(),body,sender:state.profile.name.trim()||'Anonymous fan',
        anonymous:state.profile.anonymous,at:Date.now()});
      current().messages=current().messages.slice(-MAX_MESSAGES);
      save();render();
    }
  });
  document.addEventListener('click',e=>{
    if(!inside(e))return;
    const button=e.target.closest('[data-v86-room],[data-v86-clear-room]');
    if(!button)return;
    if(button.dataset.v86Room){
      if(state.groups.some(g=>g.id===button.dataset.v86Room)){
        state.active=button.dataset.v86Room;save();render();
      }
    }else if(button.matches('[data-v86-clear-room]')){
      current().messages=[];save();render();
    }
  });
  window.pitwallChatPage=page;
  window.pitwallChatTestState=()=>state;
})();