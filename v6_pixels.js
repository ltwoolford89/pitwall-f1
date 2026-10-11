/* PITWALL pixel-art assets supplied in the current F1 sprite collection.
   Drivers without custom artwork always use the user's Blank_driver.png. */
'use strict';
(function(){
  const available=new Set(['ALO','ANT','BOR','BOT','COL','GAS','HAD','HAM','HUL','LAW','LEC','LIN','NOR','PIA','RUS','STR','VER']);
  const fullBodies=new Set(['ALO','ANT','BOR','BOT','COL','GAS','HAD','HAM','HUL','LAW','LEC','LIN','NOR','PIA','RUS','STR','VER']);
  const alternateFaces=new Set(['ANT','RUS']);
  const blank='./Blank_driver.png';

  window.pitwallDriverArtPath=function(code,kind='face',version='1'){
    const id=String(code||'').trim().toUpperCase();
    if(!available.has(id))return blank;
    if(kind==='fullbody')return fullBodies.has(id)?'./custom_uploads/fullbody/'+id+'.png':blank;
    if(kind==='helmet')return './portraits/helmet/'+id+'.png';
    if(kind==='face_alt'&&alternateFaces.has(id))return './portraits/face_alt/'+id+'.png';
    if(kind==='face'&&version==='2'&&alternateFaces.has(id))return './portraits/face_alt/'+id+'.png';
    return './portraits/face/'+id+'.png';
  };

  v4SvgAvatar=function(driver,style){
    const portrait=style||(typeof v4Prefs==='object'&&v4Prefs.portrait)||'face';
    return window.pitwallDriverArtPath(driver?.code,portrait==='helmet'?'helmet':'face');
  };
})();