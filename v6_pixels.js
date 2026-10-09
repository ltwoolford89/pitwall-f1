/* PITWALL V6.2 — upgraded concept-style pixel portraits */
'use strict';
(function(){
  const previous = typeof v4SvgAvatar === 'function' ? v4SvgAvatar : null;
  const cache = new Map();
  const DRIVER_NUM = {VER:'1', NOR:'4', PIA:'81', HAM:'44', LEC:'16', RUS:'63', ANT:'12', ALO:'14', SAI:'55', GAS:'10', BOT:'77', PER:'11', HUL:'27', ALB:'23', OCO:'31', STR:'18', TSU:'22', HAD:'6', LAW:'30', COL:'43', BEA:'87', BOR:'5', LIN:'24'};
  const FLAG = {AUS:'🇦🇺', GBR:'🇬🇧', NED:'🇳🇱', MON:'🇲🇨', MCO:'🇲🇨', ESP:'🇪🇸', ITA:'🇮🇹', FRA:'🇫🇷', JPN:'🇯🇵', THA:'🇹🇭', CAN:'🇨🇦', MEX:'🇲🇽', CHN:'🇨🇳', FIN:'🇫🇮', GER:'🇩🇪', BRA:'🇧🇷'};
  const TEAM_MARK = {Mercedes:'✦', Ferrari:'▣', McLaren:'◢', 'Red Bull Racing':'◉', 'Racing Bulls':'◌', Alpine:'△', Haas:'□', Audi:'◈', Williams:'◇', 'Aston Martin':'✦', Cadillac:'◫'};
  const TEAM_HELMET = (typeof V4_TEAM_HELMET==='object' ? V4_TEAM_HELMET : {});
  const FACES = (typeof V4_FACES==='object' ? V4_FACES : {});
  const safeHex = h => /^#[0-9a-f]{6}$/i.test(h||'') ? h : '#888888';
  const hexToRgb = hex => {hex=safeHex(hex).slice(1); return [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16));};
  const rgbToHex = rgb => '#' + rgb.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
  const mix = (a,b,t=.5) => {const ar=hexToRgb(a), br=hexToRgb(b); return rgbToHex(ar.map((v,i)=>v+(br[i]-v)*t));};
  const shade = (hex,pct=0)=>mix(hex,pct>=0?'#ffffff':'#000000',Math.abs(pct)/100);
  const R=(x,y,w,h,fill,op='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${op!==''?` opacity="${op}"`:''}/>`;
  const T=(x,y,val,size,fill,anchor='middle',weight=700)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="system-ui,Segoe UI,Arial" font-size="${size}" font-weight="${weight}" fill="${fill}">${val}</text>`;
  const draw = (rows, arr, fill, op='') => arr.forEach(([x,y,w,h])=>rows.push(R(x,y,w,h,fill,op)));
  const fallbackCountry = driver => FLAG[driver.countryCode] || FLAG[driver.nationalityCode] || '';

  function bg(rows, accent){
    const panel = mix(accent,'#091420',.82), glow = mix(accent,'#56e2ff',.18), warm = mix(accent,'#ff6d84',.12);
    rows.push(R(0,0,128,144,'#0b1220'));
    rows.push(R(0,0,128,144,panel,.96));
    rows.push(R(78,6,44,44,glow,.12));
    rows.push(R(88,16,28,28,'#ffffff',.05));
    rows.push(R(0,112,128,32,'#08111b'));
    rows.push(R(0,0,128,5,mix(accent,'#e9f6ff',.30),.85));
    rows.push(R(0,139,128,5,accent));
    rows.push(R(8,18,96,5,'#73dfff',.09));
    rows.push(R(12,28,82,4,'#73dfff',.07));
    rows.push(R(10,38,62,3,'#73dfff',.07));
    rows.push(R(22,12,20,40,warm,.06));
    rows.push(R(70,50,40,26,accent,.06));
    rows.push(R(12,102,104,1,'#ffffff',.05));
    for(let y=20;y<80;y+=16) rows.push(R(8,y,112,1,'#ffffff',.04));
  }
  function suit(rows, accent, team){
    const base = mix(accent,'#111824',.60), base2 = mix(accent,'#0c1119',.76), light = shade(accent,25), darker=shade(accent,-24);
    // 3/4 body silhouette
    rows.push(R(22,95,84,26,base));
    rows.push(R(16,104,32,24,light,.92));
    rows.push(R(82,102,26,24,base2,.95));
    rows.push(R(34,84,56,20,base));
    rows.push(R(47,76,28,16,base2));
    rows.push(R(55,68,16,12,base2));
    rows.push(R(57,79,8,38,'#e7edf3',.95));
    rows.push(R(60,79,2,33,accent,.72));
    rows.push(R(24,98,14,11,darker,.75));
    rows.push(R(88,106,12,12,darker,.65));
    rows.push(R(26,91,18,6,light));
    rows.push(R(76,89,18,6,light));
    rows.push(R(46,89,8,6,'#132032'));
    rows.push(R(67,89,9,6,'#132032'));
    rows.push(R(28,115,12,4,'#ffffff',.5));
    rows.push(R(87,112,11,4,'#ffffff',.42));
    if(team==='McLaren') rows.push(R(34,96,18,5,'#5fe7ff',.9), R(33,108,22,4,'#ffffff',.55));
    if(team==='Ferrari') rows.push(R(82,110,11,6,'#ffe56b',.9));
    if(team==='Mercedes') rows.push(R(28,108,18,4,'#9cffef',.85), R(83,96,12,4,'#9cffef',.8));
    if(team==='Red Bull Racing') rows.push(R(31,108,14,4,'#fac325',.9), R(83,96,13,4,'#e74860',.9));
  }
  function hairBlocks(shape){
    switch(shape){
      case 'curly': return [[34,16,10,6],[44,12,12,7],[56,14,10,7],[66,19,8,7],[26,24,12,9],[36,22,14,7],[52,22,14,7],[66,26,8,7],[32,10,9,6],[41,7,10,7],[52,8,10,6]];
      case 'waves': return [[34,16,14,6],[46,14,16,8],[60,18,10,6],[28,23,18,8],[44,22,19,7],[61,26,10,6],[33,10,12,6],[45,9,13,6]];
      case 'braids': return [[34,14,28,9],[31,23,8,10],[58,24,8,9],[30,32,7,30],[61,34,7,28],[40,9,16,5],[45,5,8,4]];
      case 'fringe': return [[34,15,28,7],[29,22,18,8],[49,21,13,7],[61,18,7,10],[40,9,12,7]];
      case 'messy': return [[33,14,30,8],[28,20,18,9],[48,18,14,9],[39,8,11,8],[51,10,8,6],[60,13,6,7]];
      case 'side': return [[35,16,28,7],[31,16,8,13],[57,11,8,8],[45,10,12,5],[30,24,12,7]];
      default: return [[34,16,28,7],[38,11,20,7],[31,22,9,10],[56,21,8,8]];
    }
  }
  function face(rows, code, skin, hair, shape, beardBase){
    const skinL=shade(skin,14), skinD=shade(skin,-12), skinDD=shade(skin,-22), noseT=mix(skin,'#7f5140',.42), lip=mix(skin,'#894d42',.45), cheek=mix(skin,'#ffb29b',.18), beard=beardBase || shade(hair,-10), hairL=shade(hair,12), hairD=shade(hair,-18);
    // neck
    rows.push(R(54,67,15,16,skinD)); rows.push(R(56,69,11,11,skin));
    // head in 3/4 angle
    rows.push(R(31,28,40,33,skin));
    rows.push(R(27,38,48,18,skin));
    rows.push(R(33,56,34,10,skin));
    rows.push(R(28,32,6,26,skinL,.38));
    rows.push(R(63,31,7,27,skinD,.26));
    rows.push(R(30,46,24,6,cheek,.28));
    rows.push(R(33,62,28,2,skinD,.18));
    // ears
    rows.push(R(25,45,6,12,skinD));
    rows.push(R(67,44,5,10,skinD));
    // hair
    draw(rows,hairBlocks(shape),hair);
    rows.push(R(36,14,22,3,hairL,.35));
    if(shape==='braids'){ rows.push(R(32,61,6,7,hairD)); rows.push(R(61,60,6,7,hairD)); }
    // eyebrows
    rows.push(R(39,40,8,2,hairD)); rows.push(R(54,39,10,2,hairD));
    // eyes (slightly offset for 3/4 view)
    rows.push(R(39,43,8,5,'#f6f2ed')); rows.push(R(54,42,9,6,'#f6f2ed'));
    rows.push(R(42,44,3,4,'#171b21')); rows.push(R(57,44,3,4,'#171b21'));
    rows.push(R(43,44,1,1,'#d6f3ff')); rows.push(R(58,44,1,1,'#d6f3ff'));
    // nose / bridge
    rows.push(R(51,44,4,12,skinD,.8));
    rows.push(R(48,53,8,3,noseT,.9));
    // lips/jaw
    rows.push(R(46,58,13,2,lip,.95));
    rows.push(R(48,60,10,2,mix(skin,'#d78a75',.22),.72));
    // facial hair / stubble
    if(['HAM','ALO','SAI','PER','BOT','GAS'].includes(code)){
      rows.push(R(39,60,24,5,beard,.95));
      rows.push(R(42,65,18,5,beard,.88));
      rows.push(R(34,54,4,11,beard,.78)); rows.push(R(63,52,4,10,beard,.68));
      rows.push(R(47,56,11,2,beard,.64));
    } else if(['NOR','RUS','PIA','ANT','BEA','LEC','VER'].includes(code)){
      rows.push(R(46,62,12,2,skinDD,.18));
    } else {
      rows.push(R(48,62,10,2,beard,.5));
    }
    // code-specific tweaks
    if(code==='HAM'){ rows.push(R(30,27,6,8,hairD)); rows.push(R(66,29,5,8,hairD)); rows.push(R(31,35,4,12,hairL,.4)); rows.push(R(67,36,3,11,hairL,.4)); }
    if(code==='NOR'){ rows.push(R(34,12,10,6,hairL)); rows.push(R(64,16,6,5,hairL)); }
    if(code==='VER'){ rows.push(R(38,11,18,6,hairL)); }
    if(code==='LEC'){ rows.push(R(36,15,8,5,hairL)); rows.push(R(61,19,6,5,hairD)); }
    if(code==='ALO'){ rows.push(R(32,16,7,5,hairL)); rows.push(R(61,17,8,5,hairL)); }
    if(code==='PIA'){ rows.push(R(35,13,10,5,hairL)); rows.push(R(57,14,8,5,hairL)); }
    if(code==='RUS'){ rows.push(R(36,13,8,4,hairL)); rows.push(R(60,15,6,4,hairL)); }
  }
  function helmet(rows, code, accent, team, cols){
    const h=cols[0]||accent, h2=cols[1]||'#ffffff', dark='#101925', visor='#1a3550';
    rows.push(R(24,23,50,10,h));
    rows.push(R(18,31,60,27,h));
    rows.push(R(14,44,68,22,h));
    rows.push(R(18,64,56,10,h));
    rows.push(R(28,18,36,6,h2));
    rows.push(R(33,13,25,5,h));
    rows.push(R(38,9,14,4,h2));
    rows.push(R(21,46,53,14,dark));
    rows.push(R(23,47,46,10,visor));
    rows.push(R(24,47,44,3,'#d1f4ff',.72));
    rows.push(R(18,35,12,5,h2)); rows.push(R(66,35,9,5,h2));
    rows.push(R(24,68,44,5,h2));
    rows.push(R(39,24,10,15,h2)); rows.push(R(43,24,3,15,h,.85));
    rows.push(R(27,59,38,4,'#141f2d'));
    if(team==='Ferrari') rows.push(R(58,29,8,5,'#ffe35a'));
    if(team==='McLaren') rows.push(R(22,38,8,5,'#49d8ff'));
    if(team==='Mercedes') rows.push(R(31,28,16,4,'#b6fff2'));
    if(team==='Red Bull Racing') rows.push(R(49,30,10,4,'#ef4a57'));
    if(code==='HAM') rows.push(R(34,20,8,5,'#f1f8fb'));
  }
  function teamBadge(rows, team, accent){
    const x=10, y=11, bg=mix(accent,'#0f1620',.58);
    rows.push(R(x,y,18,18,bg)); rows.push(R(x+1,y+1,16,16,'#142132')); rows.push(T(x+9,y+13,TEAM_MARK[team]||'◈',10,shade(accent,28)));
  }
  function flagBadge(rows, flag){ if(!flag) return; rows.push(R(98,11,20,18,'#1d2a39',.95)); rows.push(T(108,24,flag,11,'#fff')); }
  function numberBadge(rows, code){ rows.push(R(101,31,17,14,'#182535',.96)); rows.push(T(109.5,42,DRIVER_NUM[code]||code.slice(-2),11,'#f3f7fb')); }
  function cornerGlow(rows, accent){ rows.push(R(0,110,128,10,accent,.16)); rows.push(R(0,120,128,24,'#000',.14)); }

  v4SvgAvatar = function(driver, style=(typeof v4Prefs==='object'&&v4Prefs.portrait)||'face'){
    try {
      const code=String(driver.code||'DRV').toUpperCase();
      const team=driver.team || 'Unknown';
      const accent=(typeof teamColour==='function' ? teamColour(team) : '#ff4d5c') || '#ff4d5c';
      const key=[code,team,style].join('|');
      if(cache.has(key)) return cache.get(key);
      const fd=FACES[code] || ['#c58f6a','#3a2b24','short','#392b24'];
      const [skin,hair,shape,beardBase] = fd;
      const helmetCols=TEAM_HELMET[team] || [accent,'#ffffff'];
      const rows=[];
      bg(rows,accent); suit(rows,accent,team);
      if(style==='helmet') helmet(rows,code,accent,team,helmetCols); else face(rows,code,skin,hair,shape,beardBase);
      teamBadge(rows,team,accent); flagBadge(rows,fallbackCountry(driver)); numberBadge(rows,code); cornerGlow(rows,accent);
      rows.push(T(64,138,code,8,shade(accent,35),'middle',900));
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="144" viewBox="0 0 128 144" shape-rendering="crispEdges">${rows.join('')}</svg>`;
      const uri='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
      cache.set(key,uri); return uri;
    } catch(err){ return previous ? previous(driver, style) : ''; }
  };
})();
