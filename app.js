/* V5：两个入口，演化剧情与纯时代模型。运行资源全部为本地静态文件。 */
(function(T){
  'use strict';
  const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const models=T.DATA.periods;
  let story=null,current=null,mode='home',stage=null,pendingDirectory=false;
  function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
  function modal(title,html){
    $('modal-title').textContent=title;$('modal-body').innerHTML=html;
    if(!$('modal').open){if($('modal').showModal)$('modal').showModal();else{$('modal').setAttribute('open','');$('modal').classList.add('dialog-fallback');}}
    if(story)stage.pause(true);
  }
  function close(){
    if($('modal').open||$('modal').hasAttribute('open')){if($('modal').close)$('modal').close();else $('modal').removeAttribute('open');}
    if(story)stage.pause(story.paused);
  }
  function error(message){$('fallback').hidden=false;$('fallback-text').textContent=message;if(story)story.fail();}
  stage=new T.Stage($('canvas'),()=>story?.frame(),error);
  function modelCamera(instant=false){
    if(!current)return;
    const camera=JSON.parse(JSON.stringify(current.camera)),aspect=stage.canvas.clientWidth/Math.max(1,stage.canvas.clientHeight);
    if(aspect<1.15)camera.distance*=1.15/Math.max(.6,aspect);
    stage.go(camera,instant);stage.highlight('');
  }
  function eraNav(){
    $('era-nav').innerHTML=models.map((p,i)=>`<button type="button" class="era ${current?.id===p.id?'active':''}" data-action="period" data-value="model/${p.id}" aria-current="${current?.id===p.id?'page':'false'}"><span class="era-number">${String(i+1).padStart(2,'0')}</span><span><strong>${p.name}</strong><small>${p.en}</small></span></button>`).join('');
  }
  function modelDirectory(){modal('选择时代模型','<div class="model-directory">'+models.map(p=>`<button data-action="period" data-value="model/${p.id}"><small>${esc(p.en)}</small><strong>${esc(p.name)}</strong><span>${esc(p.keyword)}</span></button>`).join('')+'</div><p>拖动旋转，双指缩放。可用“复位”回到模型总览。</p>');}
  function setPeriod(raw){
    story?.dispose();story=null;stage.stopAnimation();stage.controlsEnabled=true;current=null;close();
    $('story-panel').hidden=$('story-hud').hidden=$('story-opening').hidden=true;
    $('branch-overlay').hidden=true;delete document.body.dataset.branch;
    $('scene-status').textContent='';$('fallback').hidden=stage.ok;
    const id=raw==='models'?'model/greek':models.some(p=>p.id===raw)?'model/'+raw:raw;
    if(id==='story'||id==='europe'){
      mode='story';document.body.dataset.screen=mode;document.body.dataset.mode=mode;
      document.documentElement.style.setProperty('--accent','#a8ceba');
      $('story-panel').hidden=$('story-hud').hidden=false;
      $('directory-button').textContent='章节目录';
      story=new T.Story(stage,{toast,modal,close,entry:id,restart:()=>setPeriod('story')});
      if(pendingDirectory){pendingDirectory=false;story.chapters();}
    }else if(id?.startsWith('model/')&&models.some(p=>p.id===id.slice(6))){
      mode='model';current=models.find(p=>p.id===id.slice(6));document.body.dataset.screen=mode;document.body.dataset.mode=mode;
      document.documentElement.style.setProperty('--accent',current.color);
      $('directory-button').textContent='选择时代';
      if(current.id==='rome'){const world=new T.StoryWorld(stage);world.apply(world.snapshot(7));}
      else {stage.load(T.BUILDERS[current.id]());for(const id of ['anomaly','relations','guides','vanishing','stations','facing','player'])stage.show(id,false);}
      if(current.id==='greek'){
        for(let i=0;i<6;i++){const a=i*Math.PI/3;stage.move('chorus'+i,[Math.cos(a)*1.45,.13,Math.sin(a)*1.45],true);stage.rotate('chorus'+i,-a-Math.PI/2,[0,0,0],true);}
        stage.move('actor',[0,.76,-3.25],true);
      }
      if(current.id==='elizabeth')stage.move('actor',[0,.83,-.65],true);
      $('scene-kicker').textContent='MODEL COLLECTION / '+current.en.toUpperCase();
      $('scene-title').textContent=current.name;$('scene-date').textContent=current.date;
      $('scene-hint').textContent='单指旋转 · 双指缩放';$('scene-model-note').textContent=current.note;
      modelCamera(true);
    }else{
      mode='home';document.body.dataset.screen=mode;document.body.dataset.mode=mode;
      document.documentElement.style.setProperty('--accent','#8edacb');$('directory-button').textContent='章节目录';
      const world=new T.StoryWorld(stage);world.apply(world.snapshot(0));stage.go(T.STORY.states[0].camera,true);
      try{const saved=T.cleanStoryMemory(JSON.parse(localStorage.getItem(T.STORY.storageKey)||localStorage.getItem(T.BRANCH.storageKey)||localStorage.getItem(T.BRANCH.legacyKey)));$('story-start-label').textContent=saved.started||saved.evolution.screen!=='trunk'?'继续演化剧情':'进入演化剧情';}catch(_){$('story-start-label').textContent='进入演化剧情';}
    }
    eraNav();stage.invalidate();
  }
  function go(id){close();if(location.hash==='#'+id)setPeriod(id);else location.hash=id;}
  document.addEventListener('click',e=>{
    const button=e.target.closest('button[data-action]');if(!button||button.disabled)return;
    const a=button.dataset.action,v=button.dataset.value;
    if(a.startsWith('story-')){story?.action(a.slice(6),v);return;}
    if(a==='home'){go('home');return;}
    if(a==='start'){go('story');return;}
    if(a==='period'){go(v);return;}
    if(a==='close'){close();return;}
    if(a==='directory'){
      if(mode==='model')modelDirectory();else if(story)story.chapters();else{pendingDirectory=true;go('story');}return;
    }
    if(a==='overview'){if(story)story.overview();else modelCamera();return;}
    if(a==='zoom'){if(!story?.busy)stage.zoom(Number(v));return;}
    if(a==='help'){
      if(story)story.help();
      else modal('选择一种体验','<p><strong>演化剧情</strong>：跟随演出执行者，从场地问题走进剧场史。可从章节目录选择时代和具体问题。</p><p><strong>时代模型</strong>：直接查看五个时代的建筑模型，拖动旋转、双指缩放。</p><p>顶部“首页”随时退出。剧情中的“上一问题”与“重看本幕”保留已完成记录。建议横屏。</p>');return;
    }
    if(a==='fullscreen'){
      const req=document.fullscreenElement?document.exitFullscreen?.():document.documentElement.requestFullscreen?.();
      if(req?.catch)req.catch(()=>toast('此浏览器不支持全屏，可横屏继续使用。'));
      else if(!document.documentElement.requestFullscreen)toast('请旋转手机横屏体验。');return;
    }
    if(a==='share'){
      const url=location.href.split('#')[0];
      modal('分享给学生',`<p>复制网站地址，可粘贴到班级群或制作二维码。</p><input id="share-url" type="text" readonly value="${esc(url)}" aria-label="网站地址"><button data-action="copy-url">复制地址</button>`);return;
    }
    if(a==='copy-url'){
      const field=$('share-url');field.select();
      if(navigator.clipboard?.writeText)navigator.clipboard.writeText(field.value).then(()=>toast('地址已复制'),()=>toast('请长按地址复制。'));
      else toast('请长按地址复制。');
    }
  });
  document.addEventListener('input',e=>{const kind=e.target.dataset.storyControl;if(kind&&story)story.evolution.input(kind,Number(e.target.value));});
  $('modal').addEventListener('close',()=>{if(story)stage.pause(story.paused);});
  window.addEventListener('hashchange',()=>setPeriod(location.hash.slice(1)));
  window.addEventListener('resize',()=>{if(mode==='model')modelCamera(true);});
  setPeriod(location.hash.slice(1));
  T.inspect=()=>({version:'5.0',period:story?'story':current?.id||'home',mode,webgl:stage.ok,frame:stage.frame,stats:stage.stats,camera:JSON.parse(JSON.stringify(stage.cam)),story:story?story.inspect():null,journey:null,animation:stage.animation?{elapsed:stage.animation.elapsed,duration:stage.animation.duration,paused:stage.paused}:null,
    progress:(()=>{try{return JSON.parse(localStorage.getItem(T.DATA.storageKey)||'{}');}catch(_){return {};}})()});
  T.MODELS=models;
  window.TTM_READY=true;$('boot-warning').hidden=true;
})(window.TTM);
