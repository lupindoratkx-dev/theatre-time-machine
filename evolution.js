/* 两条支线共用这一控制器；继续使用 Story.run / StoryWorld / Stage。 */
(function(T){
  'use strict';
  const D=T.BRANCH,$=id=>document.getElementById(id),copy=x=>JSON.parse(JSON.stringify(x));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button=(action,text,value='',disabled=false,cls='')=>`<button type="button" data-action="story-evo-${action}" data-value="${esc(value)}" class="${cls}" ${disabled?'disabled':''}>${text}</button>`;
  const unique=(a,allowed)=>Array.isArray(a)?[...new Set(a.filter(x=>allowed.includes(x)))]:[];
  const number=(v,a,b,f=a)=>Number.isFinite(v)?T.clamp(v,a,b):f;
  const freshRoute=()=>({cursor:0,phase:'problem',done:[],beat:0,values:{perspective:0,viewpoint:0,views:[],scenery:'city',sceneries:[],company:[],platform:0,morph:0,looks:[],props:'palace',propVisits:[],cosmos:[]}});
  const fresh=()=>({schema:5,invited:false,invitation:0,screen:'trunk',entry:'story',route:null,italy:freshRoute(),england:freshRoute(),comparison:{value:50,ends:[],layout:'split'}});
  function clean(raw,unlocked=false){
    const out=fresh();if(!raw||typeof raw!=='object')return out;
    out.entry=raw.entry==='chapter'?'chapter':'story';
    for(const route of ['italy','england']){
      const r=raw[route],s=out[route],events=D.routes[route];if(!r)continue;
      // V5 的章节跳转允许分段完成；旧版本仍按连续记录迁移。
      if(raw.schema===5)s.done=unique(r.done,events.map(e=>e.id));
      else for(const event of events){if(!Array.isArray(r.done)||!r.done.includes(event.id))break;s.done.push(event.id);}
      s.cursor=raw.schema===5&&Number.isInteger(r.cursor)?T.clamp(r.cursor,0,events.length-1):Math.min(s.done.length,events.length-1);
      s.phase=['problem','activity','discovery'].includes(r.phase)?r.phase:'problem';
      const v=r.values||{},o=s.values;
      for(const k of ['perspective','platform'])o[k]=Math.round(number(v[k],0,4));
      o.viewpoint=number(v.viewpoint,-100,100,0);o.morph=number(v.morph,0,100);
      o.views=unique(v.views,['center','side']);o.looks=unique(v.looks,['left','front','right']);
      o.sceneries=unique(v.sceneries,['city','palace','forest']);o.scenery=['city','palace','forest'].includes(v.scenery)?v.scenery:'city';
      o.propVisits=unique(v.propVisits,['palace','forest','battle']);o.props=['palace','forest','battle'].includes(v.props)?v.props:'palace';
      o.company=unique(v.company,[0,1,2,3]);if(o.company.length<4)o.company=o.company.filter(x=>x!==3);
      o.cosmos=unique(v.cosmos,['heaven','earth','hell']);
      const event=events[s.cursor],beats=T.NARRATIVE.events[event.id].beats;
      s.beat=Number.isInteger(r.beat)?T.clamp(r.beat,0,beats.length-1):s.phase==='discovery'?beats.length-1:s.phase==='activity'?Math.max(0,beats.findIndex(b=>b.kind==='activity')):0;
      const activity=beats.findIndex(b=>b.kind==='activity');
      if(activity>=0&&s.beat>activity&&!ready(event.activity,o))s.beat=activity;
      s.phase=beats[s.beat].kind==='activity'?'activity':beats[s.beat].kind==='teaching'?'discovery':'problem';
      if(s.phase==='activity'&&!event.activity)s.phase='problem';
      if(s.phase==='discovery'&&event.activity&&!ready(event.activity,o))s.phase='activity';
    }
    out.invited=raw.invited===true||raw.schema!==5&&raw.screen!=='trunk';
    out.invitation=Number.isInteger(raw.invitation)?T.clamp(raw.invitation,0,T.NARRATIVE.invitation.length-1):0;
    out.route=['italy','england'].includes(raw.route)?raw.route:null;
    out.screen=['trunk','invitation','map','route','comparison','conclusion'].includes(raw.screen)?raw.screen:'trunk';
    if(!unlocked&&out.entry!=='chapter')out.screen='trunk';
    if(out.screen==='route'&&!out.route)out.screen='map';
    if(['comparison','conclusion'].includes(out.screen)&&!both(out))out.screen='map';
    const c=raw.comparison||{};out.comparison.value=number(c.value,0,100,50);out.comparison.ends=unique(c.ends,[0,100]);
    out.comparison.layout=c.layout==='mix'?'mix':'split';
    if(out.screen==='conclusion'&&out.comparison.ends.length<2)out.screen='comparison';
    return out;
  }
  const complete=(s,r)=>s[r].done.length===D.routes[r].length;
  const both=s=>complete(s,'italy')&&complete(s,'england');
  function ready(kind,v){
    return {perspective:v.perspective===4,viewpoint:v.views.length===2,scenery:v.sceneries.length===3,company:v.company.length===4,
      platform:v.platform===4,morph:v.morph===100,'actor-view':v.looks.length===3,props:v.propVisits.length===3,cosmos:v.cosmos.length===3}[kind]||false;
  }
  class Evolution{
    constructor(owner){
      this.o=owner;this.world=owner.world;this.stage=owner.stage;
      this.state=owner.memory.evolution;this.feedback='';this.selectedToken='';
      if(owner.context.entry==='europe'&&this.state.screen==='trunk'){this.state.entry='chapter';this.state.screen='map';owner.save();}
    }
    get active(){return this.state.screen!=='trunk';}
    get route(){return this.state[this.state.route];}
    get event(){return D.routes[this.state.route]?.[this.route?.cursor];}
    values(){const v=copy(this.route.values);if(this.route.cursor>4&&this.state.route==='italy')v.perspective=4;return v;}
    scene(){
      const d=this.event;
      if(this.route.phase!=='problem')return d.sceneMutation;
      if(d.intro==='giant')return 'it-giant';
      if(d.intro==='travel')return 'en-travel';
      if(d.intro==='flashback')return 'en-flashback';
      return d.from;
    }
    snapshot(){
      const s=this.state;
      if(s.screen==='map')return this.world.snapshot('STATE_BRANCH_EUROPE',this.o.memory.stop);
      if(['comparison','conclusion'].includes(s.screen))return this.world.comparison(s.comparison.value,s.comparison.layout==='split');
      return this.world.snapshot(this.scene(),this.o.memory.stop,this.values());
    }
    restore(){this.world.apply(this.snapshot());}
    overview(instant=false){
      let camera;
      if(this.state.screen==='map')camera=D.mapCamera;
      else if(['comparison','conclusion'].includes(this.state.screen))camera=this.state.comparison.layout==='split'?D.compareCamera:D.routeCamera;
      else camera=this.event.camera;
      camera=copy(camera);
      const aspect=this.stage.canvas.clientWidth/Math.max(1,this.stage.canvas.clientHeight);
      if(aspect<1.2)camera.distance*=1.2/Math.max(.6,aspect);
      this.stage.go(camera,instant);this.stage.controlsEnabled=!this.o.busy;this.stage.highlight('');
    }
    enterMap(animate=true){
      if(this.o.busy||!this.stage.ok)return;
      this.o.context.close?.();this.state.screen='map';this.state.route=null;this.feedback='';this.trying=false;this.o.phase='evolution';
      this.o.setLabels([]);this.o.save();
      if(animate){this.o.busy=true;this.render();this.overview();this.o.run(this.snapshot(),1800,()=>this.render());}
      else{this.restore();this.overview(true);this.render();}
    }
    beginRoute(route){
      if(!D.routes[route]||this.o.busy||!this.stage.ok)return;
      this.o.context.close?.();this.state.screen='route';this.state.route=route;this.o.save();this.feedback='';this.trying=false;
      this.enterEvent();
    }
    enterEvent(){
      this.o.setLabels([]);this.o.busy=true;this.render();this.overview();
      const d=this.event;
      if(this.route.phase!=='problem'){this.o.run(this.snapshot(),1000,()=>{this.render();this.activityView();});return;}
      if(d.intro==='travel'){
        const list=['en-travel-hall','en-town-hall','en-travel'];let at=0;
        const step=()=>{const name=list[at++];this.o.feedback='';this.feedback=['贵族大厅 · GREAT HALL','市政空间 · TOWN HALL','旅馆院落 · INN YARD'][at-1];this.o.busy=true;this.render();this.o.run(this.world.snapshot(name,-1,this.values()),1050,()=>at<list.length?step():(this.feedback='',this.render()));};step();
      }else if(d.intro==='flashback'){
        this.stage.go(D.mapCamera);this.o.run(this.world.snapshot('city-mansions'),1300,()=>{this.o.busy=true;this.feedback='水平并置 → 比较新的垂直组织';this.render();this.overview();this.o.run(this.snapshot(),1500,()=>{this.feedback='';this.render();});});
      }else{
        const begin=this.world.snapshot(d.from,-1,this.values());
        this.o.run(begin,1100,()=>{
          if(d.intro==='giant'){this.o.busy=true;this.render();this.o.run(this.snapshot(),2600,()=>this.render());}
          else this.render();
        });
      }
    }
    choose(index){
      if(this.state.screen!=='route'||this.route.phase!=='problem'||this.o.busy||!this.stage.ok)return;
      const d=this.event,c=d.choices[Number(index)];if(!c)return;
      this.feedback=c.consequence;
      if(Number(index)!==d.successfulChoice){
        this.trying=true;this.o.busy=true;this.render();
        if(c.effect==='giant-repeat'){
          this.world.apply(this.world.snapshot('it-perspective',-1,this.values()));
          this.o.run(this.snapshot(),2200,()=>this.render());return;
        }
        if(c.effect==='side')this.viewpoint(100,false);
        this.o.run(this.world.alternativeBranch(c.effect,this.scene(),this.values()),1000,()=>this.render());return;
      }
      this.trying=false;this.o.busy=true;this.render();
      this.o.run(this.world.snapshot(d.sceneMutation,-1,this.values()),d.transition.duration,()=>{
        this.route.phase=d.activity?'activity':'discovery';this.feedback='';this.o.save();this.render();this.activityView();
      });
    }
    next(){
      if(this.state.screen!=='route'||this.route.phase!=='discovery'||this.o.busy)return;
      const r=this.route,d=this.event;
      if(!r.done.includes(d.id))r.done.push(d.id);
      if(r.done.length===D.routes[this.state.route].length){this.o.save();this.enterMap();return;}
      r.cursor=r.done.length;r.phase='problem';this.o.save();this.enterEvent();
    }
    viewpoint(value,record=true){
      const x=value/100*4.1;
      this.stage.view([x,1.9,7.8],[x,1.55,-7],true);this.stage.controlsEnabled=false;
      if(record){
        const v=this.route.values;v.viewpoint=value;
        const point=Math.abs(value)<8?'center':Math.abs(value)>65?'side':null;
        if(point&&!v.views.includes(point))v.views.push(point);
      }
      this.stage.show('it-seat',false);
      this.stage.show('it-axis',Math.abs(value)<8);this.stage.show('it-guides',Math.abs(value)<8);
    }
    activityView(){
      if(this.stage.ok&&this.state.screen==='route'&&this.route.phase==='activity'){
        if(this.event.activity==='perspective')this.viewpoint(0,false);
        if(this.event.activity==='viewpoint')this.viewpoint(this.route.values.viewpoint,true);
        this.o.save();this.sync();
      }
    }
    input(kind,value){
      if(!this.active||this.o.busy||!this.stage.ok||!Number.isFinite(value))return;
      if(this.state.screen==='comparison'&&kind==='logic'){
        const c=this.state.comparison;c.value=T.clamp(value,0,100);c.layout='mix';
        if([0,100].includes(c.value)&&!c.ends.includes(c.value))c.ends.push(c.value);
        this.world.apply(this.world.comparison(c.value));this.stage.go(D.routeCamera);this.o.save();this.updateOverlay();this.sync();return;
      }
      if(this.state.screen!=='route'||this.route.phase!=='activity'||kind!==this.event.activity)return;
      const v=this.route.values;
      if(['perspective','platform'].includes(kind))v[kind]=Math.round(T.clamp(value,0,4));
      if(kind==='morph')v.morph=Math.round(T.clamp(value,0,100));
      if(kind==='viewpoint')this.viewpoint(T.clamp(value,-100,100));
      else{this.world.apply(this.world.snapshot(this.event.sceneMutation,-1,this.values()));if(kind==='perspective')this.viewpoint(0,false);}
      this.o.save();this.sync();
    }
    activityAction(name,value){
      if(this.state.screen!=='route'||this.route.phase!=='activity'||this.o.busy||!this.stage.ok)return;
      const v=this.route.values,kind=this.event.activity;
      if(name==='company'&&kind==='company'){
        const i=Number(value);if(![0,1,2,3].includes(i))return;
        if(i===3&&[0,1,2].some(x=>!v.company.includes(x))){this.o.context.toast('先加入三类成员，再联系赞助者。');return;}
        if(!v.company.includes(i))v.company.push(i);
      }else if(name==='theme'&&['scenery','props'].includes(kind)){
        const list=kind==='scenery'?['city','palace','forest']:['palace','forest','battle'];if(!list.includes(value))return;
        const visited=kind==='scenery'?v.sceneries:v.propVisits;if(!visited.includes(value))visited.push(value);v[kind]=value;
      }else if(name==='look'&&kind==='actor-view'){
        if(!['left','front','right'].includes(value))return;
        if(!v.looks.includes(value))v.looks.push(value);
        this.stage.view([0,1.75,-.6],{left:[-4,1,-.7],front:[0,1,4],right:[4,1,-.7]}[value]);
        this.stage.show('en-player2',false);this.stage.controlsEnabled=true;this.o.save();this.render();return;
      }else if(name==='token'&&kind==='cosmos'){
        if(!['heaven','earth','hell'].includes(value))return;
        this.selectedToken=value;this.render();return;
      }else if(name==='slot'&&kind==='cosmos'){
        if(!this.selectedToken){this.o.context.toast('先选择一个词，再选它的位置。');return;}
        if(this.selectedToken!==value){this.o.context.toast('观察上方的 Heavens、舞台表面与台下活板门，再试一次。');return;}
        if(!v.cosmos.includes(value))v.cosmos.push(value);this.selectedToken='';
      }else return;
      this.o.save();this.o.busy=true;this.render();
      this.o.run(this.world.snapshot(this.event.sceneMutation,-1,this.values()),650,()=>this.render());
    }
    sync(){
      const out=$('evo-output'),commit=$('evo-commit');
      if(this.state.screen==='comparison'){
        if(out)out.textContent=this.state.comparison.value===0?'意大利 · 单向构图':this.state.comparison.value===100?'英国 · 三面交流':'对照混合态 · 不代表历史过渡阶段';
        if(commit)commit.disabled=this.state.comparison.ends.length<2;return;
      }
      if(this.state.screen!=='route')return;
      const v=this.route.values,kind=this.event.activity;
      const message={perspective:`${v.perspective+1} / 5 档 · ${v.perspective===4?'共同消失点已形成':'继续观察建筑递减'}`,
        viewpoint:`${Math.abs(v.viewpoint)<8?'中央':v.viewpoint<0?'左侧':'右侧'} · 已比较 ${v.views.length} / 2 种位置`,
        platform:v.platform===4?'平台就位 · 观众进入院落和楼廊':'移动到院落后端',morph:`${v.morph}% · ${v.morph===100?'专用演出场所':'房间逐渐转为观看楼廊'}`,
        props:{palace:'“诸位，请入宫议事。” · 王座',forest:'“林中树影遮住了归路。” · 树枝',battle:'“军旗在前，准备迎战。” · 旗帜'}[v.props]};
      if(out)out.textContent=message[kind]||'点击完成空间安排';
      if(commit)commit.disabled=!ready(kind,v)||this.o.busy;
    }
    controls(){
      const kind=this.event.activity,v=this.route.values;
      const slider=(label,min,max,value,step=1)=>`<label class="range-label" for="evo-range">${label}</label><input id="evo-range" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-story-control="${kind}" aria-label="${label}"><output id="evo-output" aria-live="polite"></output>`;
      let html='';
      if(['perspective','platform'].includes(kind))html=slider(kind==='perspective'?'调整视觉纵深':'移动平台 · 入口 → 院落后端',0,4,v[kind]);
      if(kind==='morph')html=slider('院落 → 专用公共剧场',0,100,v.morph);
      if(kind==='viewpoint')html=slider('观看位置 · 左侧 / 中央 / 右侧',-100,100,v.viewpoint);
      if(kind==='company')html='<div class="branch-controls-grid">'+['演员','乐师','舞台协作','贵族赞助'].map((x,i)=>button('company',(v.company.includes(i)?'✓ ':'＋ ')+x,i,this.o.busy,i===3?'patron-control':'')).join('')+'</div>';
      if(['scenery','props'].includes(kind)){
        const list=kind==='scenery'?[['city','城市'],['palace','宫殿'],['forest','森林']]:[['palace','宫殿'],['forest','森林'],['battle','战场']];
        const visited=kind==='scenery'?v.sceneries:v.propVisits;
        html='<div class="branch-controls-grid three">'+list.map(([id,label])=>button('theme',(visited.includes(id)?'✓ ':'')+label,id,this.o.busy,v[kind]===id?'active':'')).join('')+'</div><output id="evo-output"></output>';
      }
      if(kind==='actor-view')html='<div class="branch-controls-grid three">'+[['left','左侧'],['front','前方'],['right','右侧']].map(([id,label])=>button('look',(v.looks.includes(id)?'✓ ':'')+'看'+label,id,this.o.busy)).join('')+'</div><small>现在你站在舞台上。点“复位”可回到建筑总览。</small>';
      if(kind==='cosmos')html='<div class="cosmos-tokens">'+[['heaven','Heaven'],['earth','Earth'],['hell','Hell']].map(([id,label])=>button('token',(v.cosmos.includes(id)?'✓ ':'')+label,id,this.o.busy,this.selectedToken===id?'active':'')).join('')+'</div><div class="branch-controls-grid three">'+[['heaven','上方'],['earth','台面'],['hell','台下']].map(([id,label])=>button('slot',label,id,this.o.busy)).join('')+'</div><small>点选词语，再点击位置；可用键盘 Tab 和 Enter 操作。</small>';
      return html+`<button type="button" id="evo-commit" data-action="story-evo-commit" class="primary" ${!ready(kind,v)||this.o.busy?'disabled':''}>记录这次发现 →</button>`;
    }
    updateOverlay(){
      const el=$('branch-overlay'),s=this.state;el.hidden=!this.active;
      if(!this.active)return;
      el.dataset.screen=s.screen;let html='';
      if(s.screen==='map'){
          html='<div class="branch-map"><span class="branch-root">MEDIEVAL TRADITIONS<br><small>中世纪表演传统持续存在</small></span><div class="branch-connectors" aria-hidden="true"></div><div class="branch-map-ends">'+['italy','england'].map(r=>button('route',`<small>${r.toUpperCase()}</small><strong>${D.names[r]}</strong><span>${complete(s,r)?'✓ 已完成 · 查看结尾':s[r].done.length?`继续 · ${s[r].done.length}/${D.routes[r].length}`:'进入这条路线 ↗'}</span>`,r,this.o.busy||!this.stage.ok,`map-${r}`)).join('')+'</div><small class="map-note">区域关系示意 · 可任选先后</small></div>';
      }else if(s.screen==='comparison'&&s.comparison.layout==='split'){
        html='<div class="comparison-captions"><div><strong>ITALY</strong><span>COURT · PERSPECTIVE · FRAMED SPACE</span><small>视觉幻觉</small></div><div><strong>ENGLAND</strong><span>COMPANY · THRUST · OPEN STAGE</span><small>演员—观众关系</small></div></div>';
      }else if(s.screen==='conclusion'){
        html='<div class="branch-ending"><p>SAME PERIOD.<br>DIFFERENT QUESTIONS.<br><em>DIFFERENT THEATRES.</em></p><strong>同一个时代，不同的问题，产生不同的剧场。</strong></div>';
      }
      el.innerHTML=html;
    }
    render(){
      const s=this.state,o=this.o,unavailable=!this.stage.ok;
      $('story-opening').hidden=true;$('story-panel').dataset.phase='evolution';
      document.body.dataset.branch=s.screen==='route'?s.route:s.screen;
      let title='',text='',tag='',actions='',speaker='maker',name='',era='15—17世纪初 · 不同地区与实践的比较';
      if(s.screen==='map'){
        tag='EUROPE BRANCH · 历史并没有只有一个答案';title='15TH CENTURY EUROPE';name='剧场演化的第一次分叉';
        text='这种城市演出传统并没有突然消失。但欧洲正在出现新的演出需求。请选择一条路线，另一条会保留。';
        if(complete(s,'italy')&&!complete(s,'england'))text='同一个时代，英国没有完全沿着这条路线发展。回到共同的演出传统，看看另一种空间回答。';
        if(complete(s,'england')&&!complete(s,'italy'))text='英国路线已完成。回到共同背景，比较意大利的古典研究与视觉实验。';
        actions=button('compare','比较两条路线 →','',!both(s)||o.busy||unavailable,'primary')+button('trunk','回到此前章节','',o.busy);
        for(const r of ['italy','england'])if(complete(s,r))actions+=`<p class="branch-keywords"><b>✓ ${r.toUpperCase()}</b><br>${D.keywords[r].join(' · ')}</p>`;
      }else if(s.screen==='route'){
        const d=this.event;speaker=d.speaker;name=d.discovery.zh;title=d.title;text=d.problem;
        tag=`${s.route.toUpperCase()} · ${this.route.cursor+1} / ${D.routes[s.route].length}`;
        if(o.busy){tag+=' · 空间正在变化';text=this.feedback||d.consequence;actions='<span class="building-pulse" aria-hidden="true"></span><small>观察人物与空间的改变 · 可暂停</small>';}
        else if(this.trying){tag+=' · 观察后调整';text=this.feedback;actions=button('retry','调整方案，再试一次','','','primary');}
        else if(this.route.phase==='problem')actions=d.choices.map((c,i)=>button('choose',esc(c.text),i,unavailable,'story-choice')).join('');
        else if(this.route.phase==='activity'){tag+=' · 动手观察';text=d.consequence;actions=this.controls();}
        else {tag=d.discovery.en;title=d.discovery.zh;text=d.teachingPoint;actions=button('next',this.route.cursor===D.routes[s.route].length-1?'完成本线，返回欧洲分叉 →':'继续下一幕 →','',unavailable,'primary');}
        actions+=button('map','返回分叉 · 保留本线进度','',o.busy);
      }else if(s.screen==='comparison'){
        tag='SAME PERIOD · DIFFERENT SPATIAL LOGICS';name='同一时代，两种剧场逻辑';title='拖动，看观众与舞台怎样重组';
        text='先比较两侧模型，再把滑杆移到两个端点：一边强化共享构图，另一边让演员进入观众之间。中间态仅用于对照。';
        actions=`<label class="range-label" for="evo-range"><span>ITALY</span><span>ENGLAND</span></label><input id="evo-range" data-story-control="logic" type="range" min="0" max="100" value="${s.comparison.value}" aria-label="意大利与英国剧场逻辑比较"><output id="evo-output"></output><div class="branch-controls-grid">${button('layout','并列模型','split',unavailable)}<button id="evo-commit" data-action="story-evo-conclude" class="primary" ${s.comparison.ends.length<2?'disabled':''}>带走课程结论 →</button></div>`;
      }else if(s.screen==='conclusion'){
        tag='THEATRE IS SHAPED BY WHAT PERFORMANCE NEEDS.';name='剧场，是怎样被塑造的？';title='不同需求，塑造不同的空间';
        text='意大利这条路线重在怎样建立可信的视觉世界；英国这条路线重在怎样让演员与大量观众共同完成一场戏。两者是比较重点，并非互斥的国家标签。';
        actions=button('tree','查看完整演化树','','','primary')+button('compare','重做双路线比较')+button('map','返回欧洲分叉');
      }
      if(unavailable){text='当前 3D 显示未能恢复。进度会保留，请刷新或换用系统浏览器。';actions='<button data-action="period" data-value="greek">打开文字与空间导览</button>';}
      const role=T.Portraits.roles[speaker]||T.Portraits.roles.builder;
      $('story-portrait').innerHTML=T.Portraits.svg(speaker);$('story-person').textContent=role[0];$('story-person-en').textContent=role[1];
      $('story-tag').textContent=tag;$('story-title').textContent=title;$('story-dialogue').textContent=text;$('story-choices').innerHTML=actions;
      $('scene-kicker').textContent=s.screen==='route'?`${s.route.toUpperCase()} / ${this.event.id.split('_')[1]}`:'EUROPE · TWO PATHS';
      $('scene-title').textContent=name;$('scene-date').textContent=era;
      $('story-step').textContent=`EVOLUTION MODE · ${s.italy.done.length+s.england.done.length} / 18 个支线发现`;
      $('story-saving').textContent=o.unsaved?'浏览器限制保存：本次会话内有效':'两条路线分别保存';
      $('story-timeline').innerHTML=`<span>MEDIEVAL</span><div class="mini-fork"><i class="lit"></i><b class="${complete(s,'italy')?'lit':''}">IT</b><b class="${complete(s,'england')?'lit':''}">EN</b></div>`;
      $('story-pause').disabled=!o.busy;$('story-pause').textContent=o.paused?'继续':'暂停';
      $('story-live').textContent=o.busy?'空间正在变化':title;
      this.stage.controlsEnabled=!o.busy&&!(s.screen==='route'&&this.route.phase==='activity'&&['perspective','viewpoint'].includes(this.event.activity));
      if(s.screen==='route'&&!o.busy){
        const scene=this.scene();let labels=[];
        if(scene==='it-zones')labels=[['FORESTAGE',[0,.85,1.2]],['PERSPECTIVE SCENERY',[0,2.8,-5.8]]];
        if(scene==='en-cosmos')labels=[['HEAVENS',[0,4.8,-2.8]],['STAGE',[2.2,1.1,.2]],['HELL / TRAP · 剖口',[0,-.1,2.7]]];
        this.o.setLabels(labels);
      }
      this.updateOverlay();this.sync();
    }
    tree(){
      const s=this.state;
      const trunk='<div class="tree-trunk">RITUAL · 祭仪<br>GREECE · 希腊<br>ROME · 罗马<br>MEDIEVAL · 中世纪</div>';
      const arms=['italy','england'].map(r=>`<section><h3>${r.toUpperCase()} · ${D.names[r]}</h3><p>${D.summary[r]}</p><ol>${D.routes[r].map(d=>`<li class="${s[r].done.includes(d.id)?'learned':''}"><small>${d.discovery.en}</small>${d.discovery.zh}${s[r].done.includes(d.id)?' ✓':''}</li>`).join('')}</ol>${button('route',complete(s,r)?'查看本线结尾':'进入 / 继续',r,this.o.busy||(!this.active&&this.o.memory.phase!=='finished'))}</section>`).join('');
      this.o.context.modal('剧场演化树',`<p>从共同背景长出的两条路线；不表示一条替代另一条。课堂直达不会补记前章成绩。</p><div class="evolution-tree">${trunk}<div class="tree-arms">${arms}</div></div><p>法国、意大利民间演出、英国室内剧场等实践留待后续扩展。</p><button data-action="story-sources">史料与教学边界</button><button data-action="story-restart-dialog">重新开始故事</button>`);
    }
    handle(name,value){
      if(name==='evo-enter'&&!this.active&&this.o.memory.phase==='finished'){this.enterMap();return true;}
      if(!name.startsWith('evo-'))return false;
      const action=name.slice(4);
      if(action==='tree'){this.tree();return true;}
      if(action==='route'&&(this.active||this.o.memory.phase==='finished')&&!this.o.busy&&this.stage.ok){this.beginRoute(value);return true;}
      if(!this.active||this.o.busy||!this.stage.ok)return true;
      if(action==='map')this.enterMap();
      if(action==='choose')this.choose(value);
      if(action==='retry'&&this.trying){this.trying=false;this.feedback='';this.o.busy=true;this.render();this.overview();this.o.run(this.snapshot(),700,()=>this.render());}
      if(action==='commit'&&this.state.screen==='route'&&this.route.phase==='activity'&&ready(this.event.activity,this.route.values)){
        this.route.phase='discovery';this.o.save();this.render();this.overview();
      }
      if(action==='next')this.next();
      if(['company','theme','look','token','slot'].includes(action))this.activityAction(action,value);
      if(action==='compare'&&both(this.state)){this.state.screen='comparison';this.o.save();this.restore();this.overview();this.render();}
      if(action==='layout'&&this.state.screen==='comparison'){this.state.comparison.layout='split';this.o.save();this.restore();this.overview();this.render();}
      if(action==='conclude'&&this.state.screen==='comparison'&&this.state.comparison.ends.length===2){this.state.screen='conclusion';this.o.save();this.render();}
      if(action==='trunk'){this.state.screen='trunk';this.o.phase=this.o.memory.phase;this.o.save();$('branch-overlay').hidden=true;delete document.body.dataset.branch;this.o.world.apply(this.o.world.snapshot(this.o.index,this.o.memory.stop));this.o.overview();this.o.render();}
      return true;
    }
  }
  T.Evolution=Evolution;T.cleanEvolutionMemory=clean;T.freshEvolutionMemory=fresh;
  T.branchActivityReady=ready;
  T.STORY.version=5;T.STORY.storageKey='theatre-time-machine-v5-story';
})(window.TTM);
