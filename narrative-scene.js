/* 在现有世界追加少量人物和行李；建筑、透视及变形仍由 V4 负责。 */
(function(T){
  'use strict';
  const extend=T.extendStoryMesh, Base=T.StoryWorld;
  T.extendStoryMesh=m=>{
    extend(m);
    for(const id of ['lorenzo','isabella','matteo','thomas','agnes','edmund']){
      m.use('n-'+id).person(0,0,0,T.Characters.people[id].color,1.4);
      if(id==='thomas')m.box(-.2,.54,.23,.35,.30,.08,'#b69a6c');
      if(id==='lorenzo')m.box(.2,.57,.23,.3,.22,.06,'#e6d8b2');
    }
    m.use('n-luggage');
    [-.65,.65].forEach(x=>{m.box(x,0,0,.7,.55,.5,'#927856');m.box(x-.18,.55,0,.035,.13,.1,'#514d40');m.box(x+.18,.55,0,.035,.13,.1,'#514d40');m.box(x,.67,0,.38,.035,.1,'#514d40');});
  };
  class NarrativeWorld extends Base{
    snapshot(state,stop=-1,values={}){
      const s=super.snapshot(state,stop,values);
      if(typeof state!=='string')return s;
      const show=(id,pos)=>{s[id].visible=true;s[id].position=pos;return s[id];};
      if(state==='city-invitation'){
        for(let i=0;i<24;i++)s['viewer'+i].visible=i<4;
        show('n-lorenzo',[24.1,0,4.8]);show('n-thomas',[27.5,0,4.5]);
        show('n-luggage',[26,0,5.5]);show('en-player2',[28.6,0,4]);
      }
      if(state.startsWith('it-')){
        show('n-lorenzo',[-4.5,0,1.7]);show('n-matteo',[4.5,0,1.4]);
        if(!['it-study','it-research'].includes(state)){
          show('n-isabella',[(values.viewpoint||0)*.041,0,6]).angle=Math.PI;
          // 避开中央贵宾座位，保持角色和其他宾客之间的空隙。
          if(s['it-person14'])s['it-person14'].visible=false;
          if(s['it-person15'])s['it-person15'].visible=false;
        }
      }
      if(['it-framed','it-changeable','it-changeable-fixed','it-olimpico'].includes(state))for(const id of ['it-axis','it-guides','it-vp'])s[id].visible=false;
      if(state.startsWith('en-')){
        show('n-thomas',[-3.5,0,2.6]);show('n-edmund',[3.4,0,2.1]);
        if(['en-travel','en-inn'].includes(state))show('n-agnes',[4.7,0,-.5]);
        if(['en-players','en-company','en-travel-hall','en-town-hall','en-travel'].includes(state))show('n-luggage',[-2,0,2.4]);
      }
      return s;
    }
    alternativeBranch(effect,state,values){
      const s=super.alternativeBranch(effect,state,values);
      if(effect==='spread-mansions')for(let i=0;i<3;i++)s['mansion'+i].position[0]+=(i-1)*3;
      if(effect==='extra-mansion'){s.mansion1.scale=[1.7,1,1];s.mansion1.pivot=[26,0,-2.8];s.mansion1.tint=[1.15,.84,.73];}
      if(effect==='ring-court')for(let i=0;i<18;i++){const a=i*Math.PI/9;s['it-person'+i].position=[Math.cos(a)*4.5,0,Math.sin(a)*4.5];s['it-person'+i].angle=-a-Math.PI/2;}
      if(effect==='back-seats')for(let i=0;i<18;i++)s['it-person'+i].position=[-4+(i%6)*1.6,0,-6+Math.floor(i/6)*1.1];
      if(['block-gate','side-platform'].includes(effect)){s['en-platform'].position=effect==='block-gate'?[0,0,5.3]:[4.7,0,-2];for(let i=0;i<4;i++)s['en-player'+i].position=[s['en-platform'].position[0]-.9+i*.6,.63,s['en-platform'].position[2]];}
      if(effect==='full-sets')s['en-conflict'].visible=true;
      return s;
    }
    performanceClip(kind,base){
      return (frame,t)=>{
        const id=kind==='italy'?'it-actor':'en-player2', actor=frame[id], original=base[id];
        if(!actor||!original)return;
        // 色调稍暖形成表演时刻，不插入现代灯具或另建灯光系统。
        if(kind==='italy')for(const key of ['it-stage','it-frame','it-ground'])if(frame[key]?.visible)frame[key].tint=[1+.08*Math.sin(t*Math.PI),1+.035*Math.sin(t*Math.PI),1-.04*Math.sin(t*Math.PI)];
        // 出场、面对观众、停步致意；人物保持同一尺度。
        actor.position[0]=original.position[0]+Math.sin(Math.min(1,t/.55)*Math.PI)*1.15;
        actor.angle=kind==='italy'?Math.sin(t*Math.PI)*.4:Math.sin(t*Math.PI*2)*1.2;
        actor.pivot=[0,.15,0];actor.tilt=t>.75?Math.sin((t-.75)*Math.PI*4)*.13:0;
        for(let i=0;i<18;i++){
          const key=(kind==='italy'?'it-person':'en-person')+i,p=frame[key];
          if(!p?.visible)continue;
          const response=Math.max(0,Math.sin((t-.35)*Math.PI))*((i%3+1)/3);
          p.position[1]=base[key].position[1]+response*.09;
          p.tint=[1+response*.10,1+response*.06,1];
        }
      };
    }
  }
  T.StoryWorld=NarrativeWorld;
})(window.TTM);
