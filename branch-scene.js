/* V4 为同一个世界追加构件与完整快照。前 15 个状态仍调用 V3。 */
(function(T){
  'use strict';
  const PI=Math.PI, cp=x=>JSON.parse(JSON.stringify(x));
  const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  const C={ivory:'#e3d8bc',wood:'#ad8760',dark:'#49544b',green:'#8cb7a2',red:'#915650'};
  T.extendStoryMesh=function(m){
    m.use('it-ground').box(0,-.35,0,12,.35,16,C.wood);
    m.use('it-hall');
    [-5.8,5.8].forEach(x=>{
      m.box(x,0,0,.25,.55,15.5,C.ivory);
      [-6,-3,0,3,6].forEach(z=>{
        m.box(x,0,z,.32,3.1,.32,C.ivory);
        m.box(x,3.1,z,.52,.15,.52,C.wood);
      });
    });
    m.box(0,0,-7.8,11.5,3.3,.18,'#636f5e');
    m.use('it-table').box(0,.8,0,4.5,.18,2.6,C.wood);
    [-1.8,1.8].forEach(x=>[-.9,.9].forEach(z=>m.box(x,0,z,.18,.8,.18,C.dark)));
    m.use('it-manuscripts');
    [-1.45,0,1.45].forEach(x=>{
      m.box(x,1,0,1.12,.025,1.7,'#efe2bf');
      for(let i=0;i<5;i++)m.line([x-.4,1.032,-.5+i*.22],[x+.35,1.032,-.5+i*.22],'#9e8866',.012);
    });
    m.use('it-ruin-sketch');
    for(let i=0;i<4;i++)m.band(0,0,.25+i*.16,.3+i*.16,1.04,.01,0,PI,'#6f7769',18);
    m.use('it-survey');
    [-1.5,0,1.5].forEach(x=>{
      m.line([x-.5,1.07,-.55],[x+.5,1.07,.6],C.green,.012);
      m.line([x+.5,1.07,-.55],[x-.5,1.07,.6],C.green,.012);
      m.line([x-.5,1.07,-.55],[x+.5,1.07,-.55],C.green,.012);
    });
    m.use('it-stage').box(0,0,0,9,.48,8.4,C.wood);
    m.use('it-frontzone').box(0,.492,.7,8.8,.012,2,'#8cb7a2');
    m.use('it-backzone').box(0,.492,-4.3,8.8,.012,6,'#927967');
    for(let j=0;j<5;j++){
      m.use('it-road'+j).box(0,0,0,5.6,.055,1.4,'#c5b395');
      [-1,1].forEach(s=>['city','palace','forest'].forEach(kind=>{
        m.use(`it-${kind}-${j}-${s}`);
        if(kind==='forest'){
          m.box(0,0,0,.18,2.9,.15,'#74624c');
          m.tri([-1,1,.1],[0,3.4,.1],[1,1,.1],'#789b7a');
          m.tri([-.8,1.9,.13],[0,3.9,.13],[.8,1.9,.13],'#a2b58d');
        }else{
          m.box(0,0,0,1.95,3.25,.13,kind==='city'?C.ivory:'#bdb398');
          m.roof(0,3.25,0,2.12,.6,.16,kind==='city'?'#9b7459':'#727b6a');
          m.box(0,.05,.08,.55,1.3,.06,C.dark);
          [-.5,.5].forEach(x=>{
            m.box(x,2,.09,.34,.5,.03,'#718b80');
            m.box(x,1.87,.11,.44,.06,.05,C.wood);
          });
          m.box(0,2.8,.10,2.05,.08,.05,C.wood);
          if(kind==='palace')[-.82,.82].forEach(x=>{
            m.cylinder(x,0,.17,.12,3.1,'#ead9b9',6);
            m.box(x,3.0,.16,.38,.15,.32,'#d6b879');
          });
        }
        m.line([0,2,-.12],[0,0,-.9],'#6c634f',.045);
      }));
    }
    m.use('it-vp').sphere(0,1.6,-8.3,.11,.11,.09,C.green,8);
    m.use('it-guides');
    [-3,-1.5,1.5,3].forEach(x=>m.line([x,.56,0],[0,1.6,-8.3],C.green,.016));
    [-4.3,4.3].forEach(x=>m.line([x,3.7,-.7],[0,1.6,-8.3],C.green,.014));
    m.use('it-axis').line([0,1.7,6.5],[0,1.6,-8.3],'#e3cf92',.023);
    m.use('it-seat').box(0,.05,6,1.1,.23,1,'#c6a671');
    m.box(0,.28,6.2,.64,.7,.4,C.red);
    m.use('it-frame');
    [-4.65,4.65].forEach(x=>{
      m.box(x,0,.1,.45,4.65,.55,C.ivory);m.box(x,0,.43,.11,4.5,.06,C.wood);
    });
    m.box(0,4.5,.1,9.75,.35,.6,C.ivory);
    m.use('it-olympic');
    [-4.6,-2.4,2.4,4.6].forEach(x=>{
      m.box(x,.5,-1.8,1.3,3.8,.48,C.ivory);
      m.cylinder(x-.5,.5,-1.45,.10,3.7,'#f0e8cf',8);
      m.cylinder(x+.5,.5,-1.45,.10,3.7,'#f0e8cf',8);
      m.sphere(x,3.45,-1.50,.16,.36,.12,'#afa990',6);
    });
    m.box(0,4.3,-1.8,10.3,.32,.7,C.ivory);
    m.use('it-cavea');
    for(let j=0;j<6;j++)m.band(0,0,3.9+j*.45,4.32+j*.45,.1+j*.25,.18,.1,PI-.1,C.ivory,28);
    m.use('it-fullsize');
    [-3,0,3].forEach(x=>[-3,-6].forEach(z=>m.box(x,.5,z,2.7,4,2.5,C.ivory)));
    for(let i=0;i<18;i++)m.use('it-person'+i).person(0,0,0,i%3?'#839b8b':'#c1b396',1.05);
    m.use('it-actor').person(0,0,0,(T.Characters?.people.luca.color||'#c08765'),2);
    m.use('en-ground').box(0,-.28,0,14,.28,14,'#96896e');
    m.use('en-yard').cylinder(0,-.15,0,6.6,.15,'#b7a079',40);
    // 仅垂直分层实验显示中央剖口，让台下位置确实可见。
    m.use('en-cutaway-ground').band(0,0,2.7,6.6,-.15,.15,0,2*PI,'#b7a079',40);
    m.use('en-travel-hall');
    m.box(0,0,-4,8,3,.25,C.ivory);
    [-3.9,3.9].forEach(x=>m.box(x,0,-1,.22,3,6,C.ivory));
    m.use('en-town-hall');
    m.box(0,0,-5,9,3,.25,'#9ba594');m.roof(0,3,-5,9.4,1,2.5,C.dark);
    [-3,-1,1,3].forEach(x=>m.box(x,0,-4.7,.3,3,.3,C.ivory));
    // 房间与楼廊共用开间；矩形周边坐标插值至多边形周边。
    for(let k=0;k<16;k++){
      if(k<2||k>14)continue; // 教学剖口
      for(let level=0;level<3;level++){
        m.use(`en-bay${k}-${level}`);
        m.box(0,0,0,2.45,.15,1.4,C.wood);
        m.box(0,.15,-.65,2.4,1.3,.1,C.ivory);
        [-1.10,1.10].forEach(x=>m.box(x,0,.5,.10,1.6,.10,'#604735'));
        m.box(0,.15,.6,2.4,.35,.1,'#ad9676');
        m.box(0,1.5,0,2.5,.12,1.4,'#6d543f');
      }
      m.use('en-door'+k).box(0,.15,-.57,.65,1.15,.03,'#6b5b4d');
    }
    m.use('en-platform').box(0,0,0,4.3,.62,1,'#b58a59');
    m.use('en-backstage');
    m.box(0,0,-4.75,4.8,3.8,.35,C.ivory);
    [-1.4,1.4].forEach(x=>m.box(x,.63,-4.54,.8,1.6,.04,C.red));
    m.box(0,2.6,-4.25,4.8,.4,.55,C.wood);
    m.use('en-posts');
    [-1.7,1.7].forEach(x=>m.cylinder(x,.62,-1.3,.12,3.1,C.red,10));
    m.use('en-roof').box(0,3.75,-2.8,4.8,.18,4.2,'#809398');
    m.roof(0,3.92,-2.8,5,.6,4.3,'#846c4d');
    m.use('en-trap').box(0,.626,-1,1.15,.015,.8,'#292d2b');
    m.use('en-under').box(0,-.65,1.8,2,.18,1.5,'#855747');
    m.use('en-palace');
    m.box(0,.64,-1.2,.9,.45,.7,'#b18b57');m.box(0,1.09,-1.48,.9,1.15,.13,C.red);
    m.use('en-forest');
    m.line([.5,.65,-.6],[.5,2.3,-.6],'#866d4c',.05);
    [[.1,1.9],[.9,2.1],[.3,2.3]].forEach(([x,y])=>m.sphere(x,y,-.6,.25,.25,.12,'#83a77e',6));
    m.use('en-battle');
    [-1,1].forEach(x=>{m.line([x,.65,-1],[x,2.8,-1],C.ivory,.04);m.box(x+.3,2.1,-1,.6,.65,.04,C.red);});
    m.use('en-conflict');
    [-1.7,1.7].forEach(x=>m.box(x,.65,-1,.16,3.1,3.4,'#bfb596'));
    for(let i=0;i<18;i++)m.use('en-person'+i).person(0,0,0,i%3?'#959b7e':'#b4957e',1.05);
    for(let i=0;i<4;i++){
      m.use('en-player'+i).person(0,0,0,(i===2&&T.Characters?T.Characters.people.will.color:['#b07d60','#a2b39e','#b1a682','#8fa9a4'][i]),1.25);
      m.box(.3,.05,0,.32,.3,.34,C.wood);
    }
    m.use('en-music').cylinder(-.7,.8,1,.25,.3,C.wood,8);
    m.use('en-badge').box(0,1.7,-1.8,.9,1.1,.06,C.red);
    m.tri([-.4,1.7,-1.76],[0,1.35,-1.76],[.4,1.7,-1.76],'#d5b67f');
    ['heaven','earth','hell'].forEach((id,i)=>{
      m.use('en-token-'+id).box(0,0,0,1.5,.07,1.0,['#a0bdc0','#c9b489','#aa7566'][i]);
      if(i===0)m.sphere(0,.27,0,.25,.25,.08,'#eadbab',6);
      if(i===1)m.box(0,.07,0,.5,.35,.4,C.ivory);
      if(i===2)m.tri([-.2,.07,0],[0,.65,0],[.2,.07,0],'#d79a63');
    });
  };
  const Base=T.StoryWorld;
  class BranchWorld extends Base {
    snapshot(state,stop=-1,values={}){
      if(typeof state==='number'){
        const s=super.snapshot(state,stop);
        if(state===14){
          for(let i=0;i<3;i++){s['mansion'+i].visible=true;s['mansion'+i].position=[0,0,3];}
          s.cleric0.visible=true;s.cleric0.position=[26,.15,-2];
        }
        return s;
      }
      const s=super.snapshot(14,stop);
      const show=(id,pos,scale)=>{s[id].visible=true;if(pos)s[id].position=pos;if(scale)s[id].scale=scale;return s[id];};
      if(state.startsWith('city-')||state==='STATE_BRANCH_EUROPE'){
        ['earth','trees','rubble','romanbase','facade0',...Array.from({length:5},(_,i)=>'stoneseat'+i)].forEach(id=>s[id].visible=false);
        for(let i=0;i<3;i++)show('mansion'+i,[0,0,3]);
        show('cleric0',[26,.15,-2]);
        if(state==='city-unified'){
          s.mansion0.visible=s.mansion2.visible=false;
          s.mansion0.position=[1.5,0,3];s.mansion2.position=[-1.5,0,3];
          show('mansion1',[0,0,3],[2.6,1,1]);s.mansion1.pivot=[26,0,-2.8];
          show('actingfloor',[26,0,4]);
        }
        if(state==='city-players')for(let i=0;i<4;i++)show('en-player'+i,[20+i*2,.06,3]);
        return s;
      }
      Object.values(s).forEach(p=>p.visible=false);
      if(state.startsWith('it-')){
        show('it-ground');show('it-hall');
        if(['it-study','it-research'].includes(state)){
          show('it-table');show('it-manuscripts');show('it-ruin-sketch');
          show('it-actor',[0,0,2.1]);
          if(state==='it-research')show('it-survey');
          return s;
        }
        const bare=state==='it-hall', frontal=!bare;
        if(frontal)show('it-stage',[0,0,-2.7]);
        for(let i=0;i<18;i++){
          const pos=bare?[-4+(i%5)*2,0,-5+Math.floor(i/5)*3.1]:[-3.7+(i%6)*1.48,0,2.7+Math.floor(i/6)*1.25];
          show('it-person'+i,pos).angle=bare?i*1.7:PI;
        }
        show('it-actor',bare?[.6,0,-.5]:[0,.48,.2]);
        if(bare||state==='it-frontal')return s;
        const perspective=values.perspective===undefined?4:values.perspective;
        const t=T.clamp(perspective/4,0,1), kind=values.scenery||'city';
        for(let j=0;j<5;j++){
          const scale=1-j*.195*t, z=-.8-j*1.4, y=.50+j*.16*t;
          show('it-road'+j,[0,y,z],[1-j*.17*t,1,1]);
          [-1,1].forEach(sign=>show(`it-${kind}-${j}-${sign}`,[sign*(3.7-j*.61*t),y,z],[scale,scale,1]));
        }
        if(t>=.99){show('it-vp');show('it-guides');}
        if(['it-zones','it-viewpoint','it-giant'].includes(state)){show('it-frontzone');show('it-backzone');}
        if(state==='it-giant')show('it-actor',[0,1.14,-6.35]);
        if(['it-viewpoint','it-framed','it-changeable','it-changeable-fixed'].includes(state)){show('it-seat');show('it-axis');}
        if(['it-framed','it-changeable','it-changeable-fixed'].includes(state))show('it-frame');
        if(state==='it-olimpico'){
          show('it-olympic');show('it-cavea');s['it-hall'].visible=false;
          for(let i=0;i<18;i++){
            const a=.15+(i%9)*(.35),r=4.3+Math.floor(i/9)*1.35;
            show('it-person'+i,[Math.cos(a)*r,.35+Math.floor(i/9)*.72,Math.sin(a)*r]).angle=-a-PI/2;
          }
        }
        return s;
      }
      if(state.startsWith('en-')){
        show('en-ground');
        const formation=values.company||[];
        if(['en-players','en-company'].includes(state)){
          for(let i=0;i<4;i++)show('en-player'+i,formation.includes(i)?[-1.8+i*1.2,0,.6]:[-4+i*2.7,0,(i%2?2:-2.5)]);
          if(formation.includes(1))show('en-music');
          if(formation.includes(3))show('en-badge');
          return s;
        }
        if(state==='en-travel-hall'||state==='en-town-hall'){
          show(state);for(let i=0;i<4;i++)show('en-player'+i,[-1.8+i*1.2,0,0]);return s;
        }
        const inn=['en-inn','en-travel'].includes(state);
        const morph=inn?0:state==='en-public'?T.clamp((values.morph??100)/100,0,1):1;
        if(morph>0){show('en-yard').opacity=morph;s['en-ground'].opacity=1-morph;}
        for(let k=2;k<15;k++){
          const a=k*2*PI/16, r=5.8;
          const circular=[Math.sin(a)*r,0,Math.cos(a)*r];
          const rect=[Math.sin(a)/Math.max(Math.abs(Math.sin(a)),Math.abs(Math.cos(a)))*r,0,Math.cos(a)/Math.max(Math.abs(Math.sin(a)),Math.abs(Math.cos(a)))*r];
          const pos=mix(rect,circular,morph), ca=Math.atan2(-pos[0],-pos[2]);
          const ra=Math.abs(rect[0])>Math.abs(rect[2])?Math.sign(-rect[0])*PI/2:(rect[2]<0?0:PI);
          const angle=ra+Math.atan2(Math.sin(ca-ra),Math.cos(ca-ra))*morph;
          for(let l=0;l<3;l++){
            if(l===2&&morph===0)continue;
            const p=show(`en-bay${k}-${l}`,[pos[0],l*1.55,pos[2]],[1,l===2?Math.max(.01,morph):1,1]);p.angle=angle;
          }
          if(morph<1){const p=show('en-door'+k,pos);p.angle=angle;p.opacity=1-morph;}
        }
        const placed=inn?(values.platform??4):4;
        const thrust=!inn&&state!=='en-public';
        const len=thrust?5.4:1.7;
        const platform=show('en-platform',[0,0,inn?3.5-placed*1.7:-4.3+len/2],[1,1,len]);
        for(let i=0;i<4;i++)show('en-player'+i,[-1.3+i*.8,.63,platform.position[2]+(thrust?1.6:0)]);
        if(!inn)show('en-backstage');
        if(placed===4)for(let i=0;i<18;i++){
          let pos;
          if(i<6)pos=[-2.4+i*.96,0,3.7];
          else if(i<12)pos=[-3.25,0,-2.4+(i-6)*.92];
          else pos=[3.25,0,-2.4+(i-12)*.92];
          if(!thrust&&i>=12)pos=[-4.8+(i-12)*1.9,1.7,-4.75];
          const p=show('en-person'+i,pos);p.angle=Math.atan2(-pos[0],-.7-pos[2]);
        }
        if(['en-open','en-cosmos','en-globe','en-flashback'].includes(state)){
          const prop=values.props||'palace';show('en-'+prop);
        }
        if(['en-cosmos','en-globe'].includes(state)){
          const assigned=values.cosmos||[];
          ['heaven','earth','hell'].forEach((id,i)=>{
            const pos=assigned.includes(id)?[[0,3.82,-2.8],[0,.64,.2],[0,-.46,1.8]][i]:[-3+i*3,1.2,4.7];
            show('en-token-'+id,pos);
          });
          if(assigned.includes('heaven'))show('en-posts');
          if(assigned.includes('hell')){show('en-trap');show('en-under');}
          if(state==='en-cosmos'){s['en-yard'].visible=false;show('en-cutaway-ground');}
        }
        if(state==='en-globe'){
          show('en-posts');show('en-roof');show('en-trap');
          s['en-under'].visible=false;
          ['heaven','earth','hell'].forEach(id=>s['en-token-'+id].visible=false);
        }
        return s;
      }
      return s;
    }
    alternativeBranch(effect,state,values){
      const s=cp(this.current);
      if(effect==='ring')for(let i=0;i<18;i++){
        const a=i*2*PI/18;s['it-person'+i].position=[Math.cos(a)*4,0,Math.sin(a)*4];s['it-person'+i].angle=-a-PI/2;
      }
      if(effect==='full-size')s['it-fullsize'].visible=true;
      if(effect==='ruins')s['it-manuscripts'].opacity=.22;
      if(effect==='keep-mansions')for(let i=0;i<3;i++)s['mansion'+i].tint=[1.15,.87,.74];
      if(effect==='church')s.cleric0.position=[26,.15,-4.6];
      if(effect==='festival')for(let i=0;i<24;i++)if(s['viewer'+i].visible)s['viewer'+i].position[2]+=.9;
      if(effect==='temporary'){s['it-frame'].visible=false;s['it-stage'].scale=[1,.1,1];}
      if(effect==='fixed')s['it-frame'].tint=[1.1,.8,.7];
      if(effect==='scatter'||effect==='plan-only')for(let i=0;i<4;i++)s['en-player'+i].position=[-4+i*2.7,0,i%2?2:-2];
      if(effect==='entry-block')s['en-platform'].position=[0,0,5.3];
      if(effect==='borrow')s['en-platform'].position=[2,0,2.6];
      if(effect==='retreat')for(let i=0;i<4;i++)s['en-player'+i].position[2]=-4.3;
      if(effect==='scenery-conflict')s['en-conflict'].visible=true;
      if(effect==='forget')s['en-backstage'].opacity=.3;
      return s;
    }
    comparison(value=50,split=false){
      const a=this.snapshot('it-changeable',-1,{perspective:4}), b=this.snapshot('en-globe');
      const s=cp(a),t=T.clamp(value/100,0,1);
      this.ids.forEach(id=>{
        const isI=id.startsWith('it-'),isE=id.startsWith('en-');
        if(!isI&&!isE){s[id].visible=false;return;}
        s[id]=cp(isI?a[id]:b[id]);const p=s[id];if(!p.visible)return;
        if(split){p.position=p.position.map((v,k)=>v*.82+(k===0?(isI?-6.8:6.8):0));p.pivot=p.pivot.map(v=>v*.82);p.scale=p.scale.map(v=>v*.82);}
        else p.opacity*=isI?1-t:t;
      });
      if(!split){
        // 同一组人物连续移动，直观看出单向座席到三面观众的重新组织。
        for(let i=0;i<18;i++){
          s['it-person'+i].visible=true;s['it-person'+i].opacity=1;
          s['it-person'+i].position=mix(a['it-person'+i].position,b['en-person'+i].position,t);
          s['it-person'+i].angle=PI+Math.atan2(Math.sin(b['en-person'+i].angle-PI),Math.cos(b['en-person'+i].angle-PI))*t;
          s['en-person'+i].visible=false;
        }
        s['it-stage'].opacity=1;s['en-platform'].visible=false;
        s['it-stage'].scale=[1-(1-4.3/9)*t,1+(.62/.48-1)*t,1-(1-5.4/8.4)*t];
        s['it-stage'].position=[0,0,-2.7+1.1*t];
        s['it-actor'].opacity=1;s['it-actor'].position=[0,.48+.15*t,.2];
        for(let i=0;i<4;i++)s['en-player'+i].visible=false;
      }
      return s;
    }
  }
  T.StoryWorld=BranchWorld;
})(window.TTM);
