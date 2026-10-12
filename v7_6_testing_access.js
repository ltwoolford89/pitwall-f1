/* PITWALL testing access gate for Career Mode and F1 Picks.
   Browser-side interface lock only; it is not secure authentication.
   The shared testing PIN is not stored as readable text in this repository. */
'use strict';
(function(){
  const EXPECTED_DIGEST='cad6ddf10c7f185baa569652306063313da25e747d9c7c2ce29f5b1d3bd216cb';
  const STORAGE_KEY='pitwall-testing-access-v1';
  const allowed=new Set(['career','picks','forecast']);
  const unlocked=new Set();
  try{
    const saved=sessionStorage.getItem(STORAGE_KEY);
    for(const tab of JSON.parse(saved||'[]')){
      if(allowed.has(tab))unlocked.add(tab);
    }
  }catch(e){}
  function persist(){
    try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify([...unlocked]));}catch(e){}
  }
  function isUnlocked(tab){return !allowed.has(tab)||unlocked.has(tab);}
  function label(tab){return tab==='career'?'Career Mode':tab==='forecast'?'Full Race Forecast':'F1 Picks';}
  function lockPage(tab){
    const name=label(tab);
    return '<section class="main-tab v76-lock-page"><div class="v76-lock-icon" aria-hidden="true">🔒</div>'+
      '<span class="v76-lock-label">PITWALL / TESTING ACCESS</span>'+
      '<h2>'+name+'</h2>'+
      '<p>This feature is in testing. Enter your private testing PIN to open it on this device.</p>'+
      '<form data-v76-unlock="'+tab+'" autocomplete="off">'+
      '<label for="v76-testing-pin">Testing PIN</label>'+
      '<input id="v76-testing-pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{4}" minlength="4" maxlength="4" autocomplete="off" required placeholder="4-digit PIN" />'+
      '<button type="submit">UNLOCK '+name.toUpperCase()+' →</button>'+
      '<div class="v76-lock-error" data-v76-error role="status" aria-live="polite"></div></form>'+
      '<small>For personal testing only. This is a browser-side lock and does not provide secure access control.</small>'+
      '</section>';
  }
  async function matchesPIN(value){
    if(!/^\d{4}$/.test(value)||!crypto?.subtle)return false;
    const bytes=new TextEncoder().encode(value);
    const buffer=await crypto.subtle.digest('SHA-256',bytes);
    const digest=[...new Uint8Array(buffer)].map(x=>x.toString(16).padStart(2,'0')).join('');
    return digest===EXPECTED_DIGEST;
  }
  window.pitwallTestGate={isUnlocked,render:lockPage};
  document.addEventListener('submit',async e=>{
    const form=e.target.closest('form[data-v76-unlock]');
    if(!form)return;
    e.preventDefault();
    const tab=form.dataset.v76Unlock;
    if(!allowed.has(tab))return;
    const input=form.querySelector('input[name="pin"]');
    const button=form.querySelector('button[type="submit"]');
    const error=form.querySelector('[data-v76-error]');
    const pin=String(input?.value||'');
    if(input)input.value='';
    if(button)button.disabled=true;
    const ok=await matchesPIN(pin).catch(()=>false);
    if(button)button.disabled=false;
    if(!ok){
      if(error)error.textContent='Incorrect PIN. Try again.';
      return;
    }
    unlocked.add(tab);
    persist();
    render();
    if(typeof toast==='function')toast(label(tab)+' unlocked for this browser session');
  });
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-v76-relock]');
    if(!button)return;
    const tab=button.dataset.v76Relock;
    if(!allowed.has(tab))return;
    unlocked.delete(tab);
    persist();
    render();
  });
  const oldRender=render;
  render=function(){
    const value=oldRender.apply(this,arguments);
    if((st.tab==='career'||st.tab==='picks'||st.tab==='forecast')&&isUnlocked(st.tab)){
      const node=document.querySelector('#app .main-tab');
      if(node&&!node.querySelector('[data-v76-relock]')){
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='v76-relock';
        btn.dataset.v76Relock=st.tab;
        btn.textContent='🔒 Lock testing mode';
        node.prepend(btn);
      }
    }
    return value;
  };
  render();
})();