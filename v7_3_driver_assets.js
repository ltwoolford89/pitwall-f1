/* PITWALL driver image fallback and conservative black-background cleanup.
   Only edge-connected near-black pixels are removed. Suit details inside the
   silhouette are not masked. The original image files remain unchanged. */
'use strict';
(function(){
  const BLANK='./Blank_driver.png';
  const cleaned=new Map();
  let work=Promise.resolve();

  function assetURL(value){
    try{
      const url=new URL(value,document.baseURI);
      if(url.origin!==location.origin)return null;
      if(!/\/(?:portraits\/(?:face|face_alt|helmet)|custom_uploads\/fullbody)\/[A-Z]{3}\.png$/i.test(url.pathname))return null;
      return url.href;
    }catch(err){return null;}
  }

  function removeEdgeBlack(source){
    const width=source.naturalWidth, height=source.naturalHeight, count=width*height;
    if(!count||count>3500000)return Promise.resolve(null);
    const canvas=document.createElement('canvas');
    canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx)return Promise.resolve(null);
    try{ctx.drawImage(source,0,0);}catch(err){return Promise.resolve(null);}
    // Process only opaque near-black-backed assets. Already-transparent
    // artwork can contain black racing suits touching image edges.
    let darkCorners=0;
    for(const [x,y] of [[0,0],[width-1,0],[0,height-1],[width-1,height-1]]){
      const c=ctx.getImageData(x,y,1,1).data;
      if(c[3]>=245&&c[0]<=8&&c[1]<=8&&c[2]<=8)darkCorners++;
    }
    if(darkCorners<2)return Promise.resolve(null);
    let pixels;
    try{pixels=ctx.getImageData(0,0,width,height);}catch(err){return Promise.resolve(null);}
    const rgba=pixels.data;
    const visited=new Uint8Array(count),queue=new Int32Array(count);
    let head=0,tail=0;
    function isBlack(n){
      const p=n*4;
      return rgba[p+3]>=245&&rgba[p]<=8&&rgba[p+1]<=8&&rgba[p+2]<=8;
    }
    function enqueue(n){
      if(!visited[n]&&isBlack(n)){visited[n]=1;queue[tail++]=n;}
    }
    for(let x=0;x<width;x++){enqueue(x);enqueue((height-1)*width+x);}
    for(let y=0;y<height;y++){enqueue(y*width);enqueue(y*width+width-1);}
    if(!tail)return Promise.resolve(null);
    while(head<tail){
      const n=queue[head++],x=n%width;
      rgba[n*4+3]=0;
      if(n>=width)enqueue(n-width);
      if(n<count-width)enqueue(n+width);
      if(x>0)enqueue(n-1);
      if(x+1<width)enqueue(n+1);
    }
    // A tiny dark border is part of artwork, not a background.
    if(tail<count*0.012)return Promise.resolve(null);
    ctx.putImageData(pixels,0,0);
    return new Promise(resolve=>{
      canvas.toBlob(blob=>resolve(blob?URL.createObjectURL(blob):null),'image/png');
    });
  }

  function cleanedURL(url){
    if(!cleaned.has(url)){
      const task=work.then(()=>new Promise(resolve=>{
        const image=new Image();
        image.onload=()=>{removeEdgeBlack(image).then(resolve,()=>resolve(null));};
        image.onerror=()=>resolve(null);
        image.src=url;
      }));
      cleaned.set(url,task);
      work=task.then(()=>undefined,()=>undefined);
    }
    return cleaned.get(url);
  }

  function inspectImage(img){
    if(!(img instanceof HTMLImageElement)||!img.complete||!img.naturalWidth)return;
    const original=assetURL(img.currentSrc||img.src);
    if(!original||img.dataset.pitwallCleanedFor===original)return;
    img.dataset.pitwallCleanedFor=original;
    cleanedURL(original).then(replacement=>{
      if(replacement&&img.isConnected&&assetURL(img.currentSrc||img.src)===original)img.src=replacement;
    });
  }

  function inspectHeader(header){
    const value=header.style.getPropertyValue('--v64-fullbody');
    const match=/url\(['"]?([^)'"]+)/.exec(value);
    const original=match?assetURL(match[1]):null;
    if(!original||header.dataset.pitwallCleanedFor===original)return;
    header.dataset.pitwallCleanedFor=original;
    cleanedURL(original).then(replacement=>{
      if(replacement&&header.isConnected&&header.dataset.pitwallCleanedFor===original)
        header.style.setProperty('--v64-fullbody','url("'+replacement+'")');
    });
  }

  document.addEventListener('load',event=>{
    if(event.target instanceof HTMLImageElement)inspectImage(event.target);
  },true);
  document.addEventListener('error',event=>{
    const img=event.target;
    if(!(img instanceof HTMLImageElement)||!assetURL(img.src)||img.dataset.pitwallBlank==='1')return;
    img.dataset.pitwallBlank='1';
    img.removeAttribute('data-v69-fallback');
    img.src=BLANK;
  },true);

  let queued=false;
  function scan(){
    queued=false;
    document.querySelectorAll('img').forEach(inspectImage);
    document.querySelectorAll('.v44-driver-header').forEach(inspectHeader);
  }
  function scheduleScan(){
    if(queued)return;
    queued=true;
    Promise.resolve().then(scan);
  }
  new MutationObserver(scheduleScan).observe(document.body,{
    childList:true,subtree:true,attributes:true,attributeFilter:['src','style']
  });
  scan();
})();