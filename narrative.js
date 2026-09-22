/* 对话节拍控制器。仍复用 Evolution 的滑杆、小游戏及比较，和 Story.run 的取消/暂停机制。 */
(function(T){
  'use strict';
  const Base=T.Evolution,N=T.NARRATIVE,D=T.BRANCH,$=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const btn=(action,text,value='',disabled=false)=>`<button type="button" data-action="story-evo-${action}" data-value="${esc(value)}" ${disabled?'disabled':''}>${esc(text)}</button>`;
  class Narrative extends Base{
    constructor(owner){
      super(owner);
      if(this.state.screen==='map'&&!this.state.invited){this.state.screen='invitation';this.state.invitation=0;}
    }
    get isInvitation(){return this.state.screen==='invitation';}
    get sequence(){return this.isInvitation?N.invitation:N.events[this.event?.id]?.beats||[];}
    get at(){return this.isInvitation?this.state.invitation:this.route?.beat||0;}
    get beat(){return this.sequence[this.at];}
    set at(n){if(this.isInvitation)this.state.invitation=n;else this.route.beat=n;}
    get narrative(){return this.isInvitation||this.state.screen==='route';}
    values(){return this.isInvitation?{}:super.values();}
    scene(){
      if(!this.narrative)return super.scene();
      let scene=this.isInvitation?'STATE_BRANCH_EUROPE':this.event.from;
      for(let i=0;i<this.at;i++)if(this.sequence[i].scene)scene=this.sequence[i].scene;
      if(this.beat?.kind==='activity')scene=this.event.sceneMutation;
      return scene;
    }
    snapshot(){return this.isInvitation?this.world.snapshot(this.scene(),this.o.memory.stop):super.snapshot();}
    overview(instant=false){
      if(!this.narrative){super.overview(instant);return;}
      const scene=this.beat?.scene||this.scene();
      let camera=JSON.parse(JSON.stringify(scene.startsWith('city-')||scene==='STATE_BRANCH_EUROPE'?D.mapCamera:this.event?.camera||D.routeCamera));
      const aspect=this.stage.canvas.clientWidth/Math.max(1,this.stage.canvas.clientHeight);
      if(aspect<1.2)camera.distance*=1.2/Math.max(.6,aspect);
      this.stage.go(camera,instant);this.stage.highlight('');
      if(this.beat?.kind==='activity')this.activityView();
    }
    enterMap(animate=true){
      if(!this.state.invited){
        this.o.cancel?.();this.state.screen='invitation';this.state.invitation=0;this.state.route=null;
        this.o.phase='evolution';this.o.save();this.restore();this.overview();this.render();this.resume();return;
      }
      super.enterMap(animate);
    }
    enterEvent(){
      this.o.cancel?.();this.o.phase='evolution';this.feedback='';this.trying=false;this.detour=null;
      this.updatePhase();this.o.save();this.restore();this.overview();this.render();this.activityView();this.resume();
    }
    updatePhase(){if(this.state.screen==='route')this.route.phase=this.beat?.kind==='activity'?'activity':this.beat?.kind==='teaching'?'discovery':'problem';}
    resume(){if(this.narrative&&this.beat?.kind==='action'&&!this.o.busy&&!this.o.dead&&this.stage.ok)this.playAction();}
    advance(){
      if(!this.narrative||this.o.busy||!this.stage.ok)return;
      if(this.isInvitation&&this.at===this.sequence.length-1){this.state.invited=true;this.o.save();super.enterMap();return;}
      if(this.at>=this.sequence.length-1){this.next();return;}
      this.at++;this.updatePhase();this.feedback='';this.o.save();this.render();
      if(this.beat.kind==='activity'){this.world.apply(this.world.snapshot(this.event.sceneMutation,-1,this.values()));this.activityView();}
      this.resume();
    }
    playAction(){
      const b=this.beat;if(!b||b.kind!=='action')return;
      const target=this.world.snapshot(b.scene,this.o.memory.stop,this.values());
      if(b.camera==='side')target['n-isabella'].position[0]=4.1;
      this.o.busy=true;this.render();this.overview();
      let mark=-1;const performance=b.performance?this.world.performanceClip(b.performance,target):null;
      const clip=(frame,t)=>{
        if(performance){
          performance(frame,t);
          const moment=Math.min(2,Math.floor(t*3));
          if(moment!==mark){mark=moment;this.o.setLabels(b.performance==='england'?[
            [['喂，看这边！',[-3.25,1.9,.2]],['我们只看到后脑勺啦！',[3.25,2.5,-4]],['好！',[0,1.8,3.7]]][moment]
          ]:[['诸位，请看。',[0,3,.5]]]);}
        }
        if(b.camera==='side'){
          this.stage.view([4.1*t,1.9,7.8],[4.1*t,1.55,-7],true);
          if(frame['n-isabella'])frame['n-isabella'].position[0]=4.1*t;
        }
        if(b.scene==='city-invitation'&&frame['n-luggage'])frame['n-luggage'].position[0]=26+Math.sin(t*Math.PI)*.7;
      };
      this.o.run(target,b.duration,()=>{if(b.camera==='side')this.route.values.viewpoint=100;this.o.setLabels([]);this.advance();},clip);
    }
    choose(value){
      if(!this.narrative||this.beat?.kind!=='choice'||this.o.busy||this.detour||!this.stage.ok)return;
      const c=this.beat.options[Number(value)];if(!c)return;
      if(c.correct){this.advance();return;}
      this.detour=c;this.o.busy=true;this.render();
      this.o.run(this.world.alternativeBranch(c.effect,this.scene(),this.values()),1100,()=>this.render());
    }
    next(){
      if(this.state.screen!=='route'||this.beat.kind!=='teaching'||this.o.busy||!this.stage.ok)return;
      const route=this.state.route,r=this.route;
      if(!r.done.includes(this.event.id))r.done.push(this.event.id);
      if(r.cursor===D.routes[route].length-1){this.o.save();this.enterMap();return;}
      r.cursor++;r.beat=0;this.updatePhase();this.o.save();this.enterEvent();
    }
    showProps(){
      const ids=this.isInvitation?['text','ledger']:N.events[this.event.id]?.props||[];
      this.o.context.modal('随身的物件',ids.map(id=>{const p=N.props[id];return `<article class="narrative-object"><div>${T.Characters.svg(p.owner)}</div><section><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></section></article>`;}).join('')+'<small>人物为跨年代教学故事中的虚构合成角色。物件文字为教学创作。</small>');
    }
    portrait(who,expression='neutral'){
      const p=T.Characters.people[who];if(!p)return;
      $('story-portrait').innerHTML=T.Characters.svg(who,expression);$('story-portrait').dataset.character=who;
      $('story-portrait').dataset.expression=expression;$('story-person').textContent=p.name;
      $('story-person-en').textContent=p.en+' · '+p.role;
    }
    render(){
      if(!this.narrative){
        $('story-note').hidden=true;$('narrative-props').innerHTML='';super.render();this.o.navigation?.();
        if(this.state.screen==='comparison'){
          this.portrait('matteo','positive');
          $('story-dialogue').innerHTML='<span class="comparison-voice">马泰奥：我让观众相信眼前的世界。</span><span class="comparison-voice">威尔：我让他们和我一起完成故事。</span>';
          $('story-note').hidden=false;$('story-note').textContent='移动滑杆到两端，比较观众与舞台的关系。中间形态只用于对照。';
          $('narrative-props').innerHTML=`<div class="comparison-portraits">${T.Characters.svg('matteo','positive')}${T.Characters.svg('will','positive')}</div>`;
        }
        if(this.state.screen==='conclusion'){
          this.portrait('will','positive');$('story-dialogue').textContent='一个让景象可信，一个让交流发生。回到课堂：你的节目，更需要哪一种观看关系？';
        }
        return;
      }
      const b=this.beat,o=this.o,inv=this.isInvitation,unavailable=!this.stage.ok;
      this.updatePhase();document.body.dataset.branch=inv?'invitation':this.state.route;
      $('story-opening').hidden=true;$('story-panel').dataset.phase='narrative';
      const data=inv?null:N.events[this.event.id];
      let who=this.detour?.who||b.who||(inv?'thomas':this.state.route==='italy'?'matteo':'will');
      if(b.kind==='action'){
        for(let i=this.at-1;i>=0;i--)if(this.sequence[i].who){who=this.sequence[i].who;break;}
      }
      this.portrait(who,this.detour?'problem':b.expression||'neutral');
      $('story-tag').textContent=inv?'散场之后 · 两条路':`${D.names[this.state.route]} · 第 ${this.route.cursor+1} 幕`;
      $('story-title').textContent=inv?'演出之后，又会发生什么？':data.title;
      $('story-dialogue').textContent=this.detour?.reply||b.text;
      $('story-note').hidden=b.kind!=='teaching';$('story-note').textContent=b.note||'';
      let actions='';
      if(unavailable){actions='<p>3D 暂时不可用，剧情进度已保留。请尝试系统浏览器。</p><button data-action="home">返回首页</button>';}
      else if(o.busy)actions='<div class="action-cue"><span class="building-pulse"></span><span>看一看空间里的行动</span></div>';
      else if(this.detour)actions=btn('retry','调整一下，再试试');
      else if(b.kind==='choice')actions=b.options.map((c,i)=>btn('choose',c.text,i)).join('');
      else if(b.kind==='activity')actions=this.controls().replace('记录这次发现 →','看看大家怎么说 →');
      else actions=btn('advance',b.kind==='teaching'?'继续下一幕 →':inv&&this.at===this.sequence.length-1?'选择一条路线 →':'继续 →');
      $('story-choices').innerHTML=actions;
      const last=$('story-choices').lastElementChild;if(last?.tagName==='BUTTON'&&b.kind!=='choice')last.classList.add('primary');
      const props=inv?['text','ledger']:data.props;
      $('narrative-props').innerHTML=props.length?btn('props',`随身物件 · ${props.length}`):'';
      $('scene-kicker').textContent=inv?'AFTER THE PERFORMANCE':this.state.route.toUpperCase();
      $('scene-title').textContent=inv?'中世纪城市 · 散场':this.event.discovery.zh;
      $('scene-date').textContent=b.scene==='it-olimpico'||this.event?.id==='ITALY_09_PERMANENT_THEATRE'?'跨年代案例 · 维琴察 · 1585 年':'跨年代教学故事 · 形态示意';
      $('story-step').textContent=`演出执行者 · ${inv?'序幕':`${this.at+1} / ${this.sequence.length} 段`}`;
      $('story-saving').textContent=o.unsaved?'本次会话内有效':'本机自动保存';
      $('story-timeline').innerHTML='<small>STORY · V5</small>';
      $('story-pause').disabled=!o.busy;$('story-pause').textContent=o.paused?'继续':'暂停';
      $('story-live').textContent=this.detour?.reply||b.text;
      this.stage.controlsEnabled=!o.busy&&!(b.kind==='activity'&&['perspective','viewpoint'].includes(this.event?.activity));
      this.updateOverlay();this.sync();this.o.navigation?.();
    }
    handle(name,value){
      if(name==='evo-props'&&this.narrative){this.showProps();return true;}
      if(name==='evo-advance'){if(!this.detour&&['say','teaching'].includes(this.beat?.kind))this.advance();return true;}
      if(name==='evo-retry'&&this.detour&&!this.o.busy){this.detour=null;this.restore();this.overview();this.render();return true;}
      if(name==='evo-commit'&&this.narrative){if(this.beat.kind==='activity'&&T.branchActivityReady(this.event.activity,this.route.values)){this.overview();this.advance();}return true;}
      if(name==='evo-enter'&&!this.active&&this.o.memory.phase==='finished'){this.enterMap();return true;}
      return super.handle(name,value);
    }
  }
  T.Evolution=Narrative;
})(window.TTM);
