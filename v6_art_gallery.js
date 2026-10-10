/* PITWALL V6.9 - Custom driver art gallery and two selectable Mercedes faces */
'use strict';
(function(){
  const choiceKey='pitwall-v69-face-choices';
  const customBody=new Set(['VER','HAM','ANT','RUS','LEC','NOR','PIA','HAD']);
  const selectable=new Set(['ANT','RUS']);
  let choices={};
  try{
    const saved=JSON.parse(localStorage.getItem(choiceKey)||'{}');
    if(saved&&typeof saved==='object')choices=saved;
  }catch(err){}
  const origAvatar=v4SvgAvatar;
  function facePath(code,version='1'){
    return './portraits/'+(version==='2'?'face_alt':'face')+'/'+code+'.png';
  }
  v4SvgAvatar=function(driver,style){
    const code=String(driver?.code||'').toUpperCase();
    const kind=style||(typeof v4Prefs==='object'?v4Prefs.portrait:'face');
    if(kind!=='helmet'&&selectable.has(code)&&choices[code]==='2')return facePath(code,'2');
    return origAvatar(driver,style);
  };
  function gallery(code,driver){
    const version=selectable.has(code)&&choices[code]==='2'?'2':'1';
    const face=facePath(code,version);
    const body=customBody.has(code)?'./custom_uploads/fullbody/'+code+'.png':facePath(code,'1');
    const choose=selectable.has(code)?'<div class="v69-face-picker" role="group" aria-label="Choose '+safe(driver.last)+' face artwork">'+
      '<button type="button" data-v69-face="'+code+'" data-v69-version="1" aria-pressed="'+(version==='1')+'" class="'+(version==='1'?'active':'')+'">FACE 1</button>'+
      '<button type="button" data-v69-face="'+code+'" data-v69-version="2" aria-pressed="'+(version==='2')+'" class="'+(version==='2'?'active':'')+'">FACE 2</button>'+
      '</div>':'';
    return '<section class="v69-gallery" aria-label="Driver pixel-art gallery">'+
      '<div class="v69-gallery-heading"><div><span>PERSONALISED DRIVER ART</span><h3>Driver artwork</h3></div><span>PIXEL COLLECTION</span></div>'+
      '<div class="v69-gallery-panel">'+
        '<div class="v69-image-stage v69-fullbody-stage"><img src="'+body+'" data-v69-fallback="'+facePath(code,'1')+'" alt="'+safe(driver.first+' '+driver.last)+' full-body illustration or portrait placeholder" loading="lazy"/></div>'+
        '<div class="v69-gallery-copy"><b>'+safe(driver.first+' '+driver.last)+'</b><span>'+safe(driver.team)+'</span>'+
          '<p>'+(customBody.has(code)?'Full-body driver art from your collection.':'Full-body artwork coming later. The face portrait is being used as a placeholder.')+'</p>'+
        '</div>'+
      '</div>'+
      '<div class="v69-face-section"><div class="v69-face-label">FACE PORTRAIT'+(selectable.has(code)?' · SELECT A VERSION':'')+'</div>'+
      choose+
      '<div class="v69-face-preview"><img src="'+face+'" data-v69-face-preview="'+code+'" data-v69-fallback="'+facePath(code,'1')+'" alt="'+safe(driver.first+' '+driver.last)+' face portrait" loading="lazy" /><div><b>'+safe(driver.last.toUpperCase())+'</b><span class="v69-face-choice-label">'+(version==='2'?'Alternate portrait':'Original portrait')+'</span></div></div>'+
      '</div>'+
    '</section>';
  }
  function adjustHeader(code){
    const header=document.querySelector('.v44-driver-header');
    if(!header)return;
    // Faces remain visible as placeholders until full-body artwork is available.
    const asset=customBody.has(code)?'./custom_uploads/fullbody/'+code+'.png':facePath(code,'1');
    header.classList.add('v64-has-background');
    header.style.setProperty('--v64-fullbody', "url('"+asset+"')");
    header.classList.toggle('v69-face-placeholder',!customBody.has(code));
  }
  function attachImageFallbacks(shade){
    shade.querySelectorAll('img[data-v69-fallback]').forEach(img=>{
      img.addEventListener('error',()=>{
        const next=img.dataset.v69Fallback;
        if(next&&img.getAttribute('src')!==next){img.removeAttribute('data-v69-fallback');img.src=next;}
        else img.removeAttribute('data-v69-fallback');
      });
    });
  }
  const previousShow=v4ShowDriver;
  v4ShowDriver=function(code){
    previousShow(code);
    const shade=document.querySelector('.v44-driver-shade');
    const driver=data.drivers.find(d=>d.code===code);
    if(!shade||!driver)return;
    const body=shade.querySelector('.v44-archive-body');
    if(!body)return;
    adjustHeader(code);
    body.insertAdjacentHTML('beforeend',gallery(code,driver));
    attachImageFallbacks(shade);
  };
  document.addEventListener('click',event=>{
    const btn=event.target.closest('[data-v69-face]');
    if(!btn)return;
    event.preventDefault();
    const code=btn.dataset.v69Face,version=btn.dataset.v69Version;
    if(!selectable.has(code)||!['1','2'].includes(version))return;
    choices[code]=version;
    try{localStorage.setItem(choiceKey,JSON.stringify(choices));}catch(err){}
    const galleryEl=btn.closest('.v69-gallery');
    if(!galleryEl)return;
    galleryEl.querySelectorAll('[data-v69-face]').forEach(node=>{
      const active=node.dataset.v69Version===version;
      node.classList.toggle('active',active);
      node.setAttribute('aria-pressed',String(active));
    });
    const img=galleryEl.querySelector('[data-v69-face-preview]');
    if(img)img.src=facePath(code,version);
    const label=galleryEl.querySelector('.v69-face-choice-label');
    if(label)label.textContent=version==='2'?'Alternate portrait':'Original portrait';
    const header=galleryEl.closest('.v44-driver-modal')?.querySelector('.v44-driver-avatar');
    if(header&&v4Prefs.portrait!=='helmet')header.src=facePath(code,version);
    // When returning to Home/Standings the selected face is used there too.
  });
})();
