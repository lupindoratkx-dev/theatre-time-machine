/* 时代 → 具体问题两级目录；跳转只改变当前位置，完成记录独立保存。 */
(function(T){
  'use strict';
  const P=T.Story.prototype,$=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button=(action,text,value='')=>`<button type="button" data-action="story-${action}" data-value="${esc(value)}">${text}</button>`;
  const chapters=[{id:'greek',name:'古希腊',en:'GREECE',indices:[0,1,2,3,4]},
    {id:'rome',name:'古罗马',en:'ROME',indices:[5,6,7]},
    {id:'medieval',name:'中世纪',en:'MEDIEVAL',indices:[8,9,10,11]},
    {id:'italy',name:'文艺复兴意大利',en:'ITALY'},
    {id:'england',name:'英国公共剧场',en:'ENGLAND'}];
  P.cancel=function(){
    this.generation=(this.generation||0)+1;this.stage.stopAnimation();this.stage.controlsEnabled=true;
    this.busy=false;this.paused=false;this.feedback='';this.setLabels([]);
    if(this.evolution){this.evolution.feedback='';this.evolution.detour=null;this.evolution.trying=false;}
  };
  P.chapterId=function(){return this.evolution.active?(this.evolution.state.route||'medieval'):this.memory.cursor<5?'greek':this.memory.cursor<8?'rome':'medieval';};
  P.navigation=function(){
    const el=$('story-navigation');if(!el)return;
    el.innerHTML=button('previous','← 上一问题')+button('rewatch','↺ 重看本幕')+button('chapters','↑ 时代目录');
  };
  P.chapters=function(){
    const current=this.chapterId();
    const html=chapters.map(c=>{
      const route=T.BRANCH.routes[c.id];
      const items=route?route.map((d,i)=>({value:c.id+':'+i,title:T.NARRATIVE.events[d.id].title,done:this.evolution.state[c.id].done.includes(d.id),here:this.evolution.active&&this.evolution.state.route===c.id&&this.evolution.route.cursor===i})):
        c.indices.map(i=>{const d=T.STORY.decisions[i];return {value:'trunk:'+i,title:d.title,done:this.memory.completed.includes(d.id),here:!this.evolution.active&&this.memory.cursor===i};});
      return `<details class="chapter-item" ${current===c.id?'open':''}><summary><span><small>${c.en}</small><strong>${c.name}</strong></span><span>${items.filter(x=>x.done).length} / ${items.length}　⌄</span></summary><div class="chapter-tools">${button('jump','从本时代开头进入 →',items[0].value)}</div><ol>${items.map((x,i)=>`<li><button type="button" data-action="story-jump" data-value="${x.value}" ${x.here?'aria-current="step"':''}><small>${String(i+1).padStart(2,'0')}</small><span>${esc(x.title)}</span><b>${x.done?'✓':x.here?'当前':'→'}</b></button></li>`).join('')}</ol></details>`;
    }).join('');
    this.context.modal('时代与问题', '<p>点时代可展开具体问题。可以直接跳转，已完成的记录会保留。</p>'+html+'<div class="directory-footer">'+button('evo-tree','完整演化树')+button('sources','史料与教学边界')+'</div>');
  };
  P.jump=function(value){
    const match=/^(trunk|italy|england):(\d+)$/.exec(value);if(!match)return;
    const route=match[1],index=Number(match[2]);
    if(index>=(route==='trunk'?T.STORY.decisions.length:T.BRANCH.routes[route].length))return;
    this.cancel();this.context.close?.();
    if(route==='trunk'){
      this.evolution.state.screen='trunk';this.evolution.state.route=null;this.memory.started=true;
      this.memory.cursor=index;this.memory.phase=this.phase='problem';this.index=this.indexFor();
      $('branch-overlay').hidden=true;delete document.body.dataset.branch;
      this.save();this.world.apply(this.world.snapshot(this.index,this.memory.stop));this.overview();this.render();
    }else{
      const e=this.evolution,r=e.state[route];e.state.entry='chapter';e.state.invited=true;e.state.screen='route';e.state.route=route;
      r.cursor=index;r.beat=0;r.phase='problem';
      const kind=T.BRANCH.routes[route][index].activity,v=r.values;
      if(kind==='perspective')v.perspective=0;
      if(kind==='viewpoint'){v.viewpoint=0;v.views=[];}
      if(kind==='scenery'){v.scenery='city';v.sceneries=[];}
      if(kind==='company')v.company=[];
      if(kind==='platform')v.platform=0;
      if(kind==='morph')v.morph=0;
      if(kind==='actor-view')v.looks=[];
      if(kind==='props'){v.props='palace';v.propVisits=[];}
      if(kind==='cosmos')v.cosmos=[];
      this.save();e.enterEvent();
    }
    $('story-panel').scrollTop=0;
  };
  P.navigateAction=function(name,value){
    if(name==='chapters'){this.chapters();return true;}
    if(name==='jump'){this.jump(value);return true;}
    if(name==='previous'||name==='rewatch'){
      const e=this.evolution;
      if(e.active&&e.state.screen!=='route'){this.chapters();return true;}
      const r=e.active?e.state.route:'trunk',i=e.active?e.route.cursor:this.memory.cursor;
      if(name==='previous'&&i===0){this.chapters();return true;}
      this.jump(r+':'+(name==='previous'?i-1:i));return true;
    }
    return false;
  };
  T.CHAPTERS=chapters;
})(window.TTM);
