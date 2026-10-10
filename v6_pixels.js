/* PITWALL custom portrait loader using local portrait PNG files. */
'use strict';
(function(){
  const fallback = (typeof v4SvgAvatar === 'function') ? v4SvgAvatar : null;
  const supported = new Set(['ALB', 'ALO', 'ANT', 'BEA', 'BOR', 'BOT', 'COL', 'GAS', 'HAD', 'HAM', 'HUL', 'LAW', 'LEC', 'LIN', 'NOR', 'OCO', 'PER', 'PIA', 'RUS', 'SAI', 'STR', 'TSU', 'VER']);
  v4SvgAvatar = function(driver, style=(typeof v4Prefs==='object' && v4Prefs.portrait) || 'face'){
    const code = String(driver?.code || '').toUpperCase();
    const kind = style === 'helmet' ? 'helmet' : 'face';
    if(supported.has(code)){
      return `./portraits/${kind}/${code}.png`;
    }
    return fallback ? fallback(driver, style) : '';
  };
})();
