/* V3 状态机：决定 → 可见后果 → 建造 → 术语。保存最后一个稳定节点。 */
(function (T) {
  "use strict";
  const D = T.STORY, $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const copy = s => JSON.parse(JSON.stringify(s));
  const btn = (action, text, value = "", cls = "", disabled = false) => `<button type="button" data-action="story-${action}" data-value="${esc(value)}" class="${cls}" ${disabled ? "disabled" : ""}>${text}</button>`;
  const fresh = () => ({ version: 5, completed: [], cursor: 0, phase: "problem", started: false, stops: [], stop: -1, evolution: T.freshEvolutionMemory() });
  function clean(raw) {
    if (!raw || ![3,4,5].includes(raw.version) || !Number.isInteger(raw.cursor) || raw.cursor < 0 || raw.cursor >= D.decisions.length) return fresh();
    const out = fresh();
    out.cursor = raw.cursor; out.started = !!raw.started || raw.cursor > 0;
    out.phase = ["problem","discovery","wagon","finished"].includes(raw.phase) ? raw.phase : "problem";
    if (["wagon","finished"].includes(out.phase) && out.cursor !== 11) out.phase = "problem";
    if (raw.version===5 || out.cursor === 11 && ["wagon","finished"].includes(out.phase)) {
      out.stops = Array.isArray(raw.stops) ? [...new Set(raw.stops.filter(i => Number.isInteger(i) && i >= 0 && i < 3))] : [];
      out.stop = Number.isInteger(raw.stop) && out.stops.includes(raw.stop) ? raw.stop : out.stops.length ? out.stops[out.stops.length-1] : -1;
      if (out.phase === "finished" && out.stops.length < 2) out.phase = "wagon";
    }
    out.completed=raw.version===5&&Array.isArray(raw.completed)?[...new Set(raw.completed.filter(x=>D.decisions.some(d=>d.id===x)))]:D.decisions.filter((d,i)=>i<out.cursor||i===out.cursor&&out.phase!=='problem').map(d=>d.id);
    out.evolution=T.cleanEvolutionMemory(raw.evolution,out.phase==='finished'||out.completed.includes(D.decisions[11].id));
    return out;
  }
  function read() { try { return clean(JSON.parse(localStorage.getItem(D.storageKey)||localStorage.getItem(T.BRANCH.storageKey)||localStorage.getItem(T.BRANCH.legacyKey))); } catch (_) { return fresh(); } }

  class Story {
    constructor(stage, context) {
      this.stage = stage; this.context = context; this.memory = read(); this.dead = false;
      this.phase = this.memory.started || !stage.ok ? this.memory.phase : "opening";
      this.busy = false; this.paused = false; this.temporaryLabels = [];
      this.world = new T.StoryWorld(stage);
      this.index = this.indexFor();
      this.world.apply(this.world.snapshot(this.index, this.memory.stop));
      this.evolution=new T.Evolution(this);
      if(this.evolution.active){this.phase='evolution';this.evolution.restore();}
      this.save();
      this.overview(true); this.render();
      if(this.evolution.active){this.evolution.activityView();this.evolution.resume?.();}
      this.resizeHandler = () => { if(!this.dead&&!this.busy){this.overview(true);if(this.evolution.active){this.evolution.activityView();this.evolution.resume?.();}} };
      window.addEventListener("resize",this.resizeHandler);
    }
    indexFor() { const d = D.decisions[this.memory.cursor]; return this.memory.phase === "problem" ? d.from : d.to; }
    save() {
      try { localStorage.setItem(D.storageKey, JSON.stringify(this.memory)); }
      catch (_) { this.unsaved = true; }
    }
    inspect() { return { ...copy(this.memory), scene: this.evolution?.active ? this.evolution.state.screen==='route' ? this.evolution.scene() : this.evolution.state.screen : this.index, viewPhase: this.phase, event: this.evolution?.active ? this.evolution.event?.id : null, busy: this.busy, paused: this.paused }; }
    dispose() { this.dead = true; this.stage.stopAnimation(); this.stage.controlsEnabled = true; window.removeEventListener("resize",this.resizeHandler); $("story-labels").replaceChildren(); $("branch-overlay").hidden=true;delete document.body.dataset.branch; }
    overview(instant = false) {
      if (this.busy && !instant) return;
      if(this.evolution?.active){this.evolution.overview(instant);return;}
      const camera = copy(D.states[this.index].camera);
      // 窄竖屏增大镜头距离；横屏保留完整模型与台下对话。
      const aspect = this.stage.canvas.clientWidth / Math.max(1, this.stage.canvas.clientHeight);
      if (aspect < 1.25) camera.distance *= 1.25 / Math.max(.58, aspect);
      this.stage.go(camera, instant); this.stage.highlight("");
    }
    headline() {
      const state = D.states[this.index];
      $("scene-kicker").textContent = state.chapter;
      $("scene-title").textContent = state.name;
      $("scene-date").textContent = state.era;
      $("story-step").textContent = `PERFORMANCE MAKER · 演出执行者　${Math.min(12,this.memory.cursor+1)} / 12`;
      const learned = D.timeline.filter(x=>x[0]<=this.index);
      $("story-timeline").innerHTML = '<span>EVOLUTION</span>' + D.timeline.map(([index,en,zh]) =>
        `<i class="${index <= this.index ? "lit" : ""}" title="${index <= this.index ? esc(zh) : "尚未发现"}"></i>`).join("") +
        `<small>${esc(learned[learned.length-1]?.[1] || "Ritual")}</small>`;
      $("story-live").textContent = this.busy ? "空间正在变化" : state.name;
    }
    render() {
      if (this.dead) return;
      this.navigation?.();
      if(this.evolution?.active){this.evolution.render();return;}
      $("story-note").hidden=true;$("narrative-props").innerHTML="";
      this.headline();
      const d = D.decisions[this.memory.cursor], r = T.Portraits.roles[d.speaker];
      $("story-portrait").innerHTML = T.Portraits.svg(d.speaker);
      $("story-person").textContent = r[0];
      $("story-person-en").textContent = r[1];
      $("story-opening").hidden = this.phase !== "opening";
      $("story-panel").dataset.phase = this.phase;
      let tag = "PROBLEM · 当前困境", title = d.title, text = d.problem, actions = "";
      const unavailable = !this.stage.ok;
      if (this.phase === "opening") {
        title = "你是演出执行者"; text = "每一次选择，都会改变眼前的空间。";
        actions = btn("begin", "开始演出 ↗", "", "primary", unavailable);
      } else if (this.phase === "problem") {
        actions = d.choices.map((c,i)=>btn("choose", `<span class="choice-index">${String(i+1).padStart(2,"0")}</span><span>${esc(c.text)}</span><span class="choice-arrow">↗</span>`, i, "story-choice", unavailable)).join("");
      } else if (this.phase === "consequence") {
        tag = "CONSEQUENCE · 空间回应"; title = "看看发生了什么"; text = this.feedback;
        actions = btn("retry", "调整方案，再试一次", "", "primary", this.busy || unavailable);
      } else if (this.phase === "building") {
        tag = "SOLUTION ADOPTED · 方案采用"; title = this.buildTitle || "让空间开始生长"; text = this.feedback || d.choices.find(c=>c.adopt).consequence;
        actions = `<span class="building-pulse" aria-hidden="true"></span><span class="muted">${esc(this.buildStatus || "请观察模型的变化")}</span>`;
      } else if (this.phase === "discovery") {
        tag = "DISCOVERY · 现在，给它一个名字"; title = d.discovery.zh; text = d.discovery.text;
        tag += ` <strong>${esc(d.discovery.en)}</strong>`;
        actions = btn("next", this.memory.cursor === 11 ? "开始城市巡演 ↗" : "继续下一幕 →", "", "primary", this.busy || unavailable);
        if (d.viewpoints) actions += btn("view", esc(d.viewpoints[0].label), "0");
        if (this.memory.cursor === 4) actions += btn("labels", "查看四个空间名称");
        if (this.memory.cursor === 8 || this.memory.cursor === 9) actions += btn("perform", "再看一次人物行动", "", "", this.busy || unavailable);
      } else if (this.phase === "wagon") {
        tag = "CITY TOUR · 把演出带给观众"; title = "选择下一处停演站点";
        text = `点击站点 → 移动车台 → 停靠展开 → 演出 → 收起。已在 ${this.memory.stops.length} / 2 个不同站点完成演出。`;
        actions = D.stations.map((s,i)=>btn("station", (this.memory.stops.includes(i) ? "已演出 · " : "前往 · ") + esc(s.name), i, "", unavailable || this.busy)).join("");
        if (this.memory.stops.length >= 2) actions += btn("finish", "俯瞰这座城市 →", "", "primary");
      } else if (this.phase === "finished") {
        tag = "THE CITY BECOMES THE THEATRE."; title = "城市成为剧场";
        text = "剧场从来不只是一栋建筑。它是表演方式、社会制度、观看关系与技术条件共同塑造出来的空间。";
        actions = btn("evo-enter", "时间向前：进入欧洲分叉 →", "", "primary") + btn("replay", "24 秒回看此前空间变化") + btn("sources","史料与教学边界");
      } else if (this.phase === "replay") {
        tag = "THEATRE IS NOT JUST A BUILDING."; title = D.states[this.index].name;
        text = "回看不同的空间回答；这些历史实践并非一条必然、连续的进化链。";
        actions = btn("pause", this.paused ? "继续回看" : "暂停回看") + btn("end-replay", "结束回看");
      }
      if (unavailable) {
        tag = "3D 显示需要恢复"; text = "当前浏览器未能显示 3D。请刷新或换用系统浏览器；已完成的故事节点会保留。";
        actions += '<button data-action="period" data-value="greek">查看时代模型</button>';
      }
      $("story-tag").innerHTML = tag;
      $("story-title").textContent = title;
      $("story-dialogue").textContent = text;
      $("story-choices").innerHTML = actions;
      $("story-saving").textContent = this.unsaved ? "浏览器限制保存：本次会话内有效" : "本机自动记住进度";
      $("story-pause").disabled = !this.busy && this.phase !== "replay";
      $("story-pause").textContent = this.paused ? "继续" : "暂停";
      this.stage.controlsEnabled = !this.busy;
    }
    setLabels(labels) {
      this.temporaryLabels = labels;
      $("story-labels").innerHTML = labels.map(([text])=>`<span>${esc(text)}</span>`).join("");
      this.stage.invalidate();
    }
    frame() {
      const nodes = $("story-labels").children;
      this.temporaryLabels.forEach(([,point],i) => {
        const p = this.stage.project(point), node = nodes[i]; if (!node) return;
        const visible = p && p.x > 65 && p.x < this.stage.width - 65 && p.y > 72 && p.y < this.stage.height - 20;
        node.hidden = !visible;
        if (visible) { node.style.left = p.x + "px"; node.style.top = p.y + "px"; }
      });
    }
    run(target, duration, done, clip) {
      this.busy = true; this.paused = false;
      const ticket=this.generation||0;
      this.world.transition(target, duration, ()=>{ if(this.dead||ticket!==(this.generation||0))return; this.busy=false; this.paused=false; done?.(); }, clip);
    }
    choose(value) {
      if (this.phase !== "problem" || this.busy || !this.stage.ok) return;
      const d = D.decisions[this.memory.cursor], c = d.choices[Number(value)]; if (!c) return;
      this.feedback = c.consequence; this.setLabels([]);
      if (!c.adopt) {
        this.phase = "consequence"; this.busy = true; this.render();
        this.run(this.world.alternative(c.effect, this.index), 1200, ()=>this.render());
        return;
      }
      this.phase = "building"; this.buildTitle = "让空间开始生长"; this.buildStatus = "正在组织表演与观看的位置"; this.busy = true; this.render();
      const target = this.world.snapshot(d.to), camera = D.states[d.to].camera;
      this.stage.go(camera);
      const finish = () => {
        if(this.dead)return;
        this.index = d.to; this.memory.phase = "discovery"; this.phase = "discovery";
        this.busy = false; this.paused = false; this.stage.controlsEnabled=true;
        if(!this.memory.completed.includes(d.id))this.memory.completed.push(d.id);
        this.save(); this.render(); this.overview();
        this.setLabels([[d.discovery.en, d.focus]]);
      };
      this.run(target, 1500, () => {
        if (d.clip === "costume") {
          this.busy = true; this.buildStatus = "演员进入景屋，换装后重新出场"; this.render();
          this.world.costume(finish);
        } else if (["places","liturgy"].includes(d.clip)) {
          this.busy = true; this.render(); this.world.performance(finish,d.clip);
        } else if (d.clip === "orbit") {
          this.busy=true;this.render();this.stage.controlsEnabled=false;
          this.stage.animate(this.stage.reduced ? 200 : 1800, t => this.stage.go({...camera,yaw: -.65+t*.9}), finish);
        } else finish();
      });
    }
    next() {
      if(this.phase!=="discovery"||this.busy||!this.stage.ok)return;
      this.setLabels([]);
      if(this.memory.cursor===11) { this.phase=this.memory.phase="wagon"; this.save();this.render();return; }
      const cursor = this.memory.cursor + 1, index = D.decisions[cursor].from;
      const commit = () => { this.busy=false;this.paused=false;this.stage.controlsEnabled=true;this.memory.cursor=cursor;this.memory.phase="problem";this.phase="problem";this.index=index;this.save();this.overview();this.render(); };
      if (cursor === 8) {
        this.phase="building";this.feedback="晚期古代到中世纪，古代公共剧场的使用与维护在各地发生变化。镜头将跨越数世纪，来到另一处礼仪空间。";
        this.buildTitle="空间改变，表演仍在继续";this.buildStatus="时间压缩与地点切换";this.busy=true;this.render();
        const ruin = this.world.snapshot(9);
        this.stage.go({...D.states[8].camera, distance:35});
        this.run(ruin, 2000, ()=> {
          this.busy=true;this.render();this.stage.controlsEnabled=false;
          this.stage.go(D.states[9].camera);
          this.stage.animate(this.stage.reduced?150:2200,()=>{},commit);
        });
      } else if(cursor === 11) {
        this.phase="building";this.feedback="行会、市民与宗教节庆将街道联系起来。现在，演出面对的是整座城市。";
        this.buildTitle="从广场看向城市";this.buildStatus="公共空间继续展开";this.busy=true;this.render();
        this.stage.go(D.states[13].camera); this.run(this.world.snapshot(13),1500,commit);
      } else commit();
    }
    station(value) {
      if(this.phase!=="wagon"||this.busy||!this.stage.ok)return;
      const i=Number(value);if(!D.stations[i])return;
      if(this.memory.stops.includes(i)){this.context.toast("这一站已演出，请选择另一个站点。");return;}
      const x=D.stations[i].x;
      this.phase="building";this.buildTitle="前往"+D.stations[i].name;this.feedback="同一个车台，把同一段演出带到下一群观众面前。";this.buildStatus="移动中";this.busy=true;this.render();
      this.stage.go({target:[x,1,2.8],distance:19,yaw:-.34,pitch:.72});
      const parked=this.world.snapshot(14,i);
      this.run(parked,1800,()=> {
        this.busy=true;this.buildStatus="停靠 · 展开平台";this.render();
        const open=copy(parked);open["wagon-flap"].visible=true;open["wagon-cast"].visible=true;
        open["wagon-flap"].tilt=0;
        open["wagon-cast"].position[2]+=.9;
        for(let j=i*8;j<i*8+8;j++)open["viewer"+j].position[2]-=.7;
        this.run(open,1100,()=> {
          this.busy=true;this.buildStatus="演员出场 · 短暂演出";this.render();
          this.world.performance(()=> {
            if(this.dead)return;
            this.busy=true;this.buildStatus="收起舞台 · 准备下一站";this.render();
            this.run(parked,1000,()=> {
              this.memory.stops.push(i);this.memory.stop=i;this.phase=this.memory.phase="wagon";this.save();this.render();
              this.context.toast(D.stations[i].name+"演出完成");
            });
          });
        });
      });
    }
    finish() {
      if(this.phase!=="wagon"||this.memory.stops.length<2||this.busy)return;
      this.phase=this.memory.phase="finished";this.save();this.index=14;this.overview();this.render();
      this.setLabels([["THE CITY BECOMES THE THEATRE.",[26,1.1,2]]]);
    }
    replay() {
      if(this.memory.phase!=="finished")return;
      this.phase="replay";this.busy=true;this.paused=false;this.setLabels([]);this.replayLast=-1;
      this.stage.animate(24000,t=> {
        const frame=Math.min(14,Math.floor(t*15));
        if(frame===this.replayLast)return;
        this.replayLast=frame;this.index=frame;
        this.world.apply(this.world.snapshot(frame,frame===14?this.memory.stop:-1));
        this.stage.go(D.states[frame].camera);this.render();
      },()=>this.endReplay());
      this.render();
    }
    endReplay() {
      if(this.phase!=="replay")return;
      this.stage.stopAnimation();this.phase="finished";this.busy=false;this.paused=false;this.index=14;
      this.world.apply(this.world.snapshot(14,this.memory.stop));this.overview();this.render();
    }
    action(name,value) {
      if(this.dead)return;
      if(this.navigateAction?.(name,value))return;
      if(this.evolution.handle(name,value))return;
      if(name==="begin"&&this.phase==="opening"&&this.stage.ok){this.memory.started=true;this.phase="problem";this.save();this.render();}
      if(name==="choose")this.choose(value);
      if(name==="retry"&&this.phase==="consequence"&&!this.busy&&this.stage.ok){
        this.busy=true;this.render();this.run(this.world.snapshot(this.index),700,()=>{this.phase="problem";this.feedback="";this.render();});
      }
      if(name==="next")this.next();
      if(name==="view"&&this.phase==="discovery"&&!this.busy){const v=D.decisions[this.memory.cursor].viewpoints?.[Number(value)];if(v){this.stage.view(v.eye,v.target);this.setLabels([]);}}
      if(name==="labels"&&this.index===5) { this.setLabels([["ORCHESTRA",[0,.35,0]],["THEATRON",[0,3,5.9]],["SKENE",[0,3.2,-4.5]],["PARODOS",[-4.7,.3,-2.4]]]); }
      if(name==="perform"&&this.phase==="discovery"&&!this.busy&&this.stage.ok){this.busy=true;this.render();this.world.performance(()=>{if(this.dead)return;this.busy=false;this.render();},D.decisions[this.memory.cursor].clip);}
      if(name==="station")this.station(value);
      if(name==="finish")this.finish();
      if(name==="replay")this.replay();
      if(name==="end-replay")this.endReplay();
      if(name==="pause"&&(this.busy||this.phase==="replay")){this.paused=!this.paused;this.stage.pause(this.paused);this.render();}
      if(name==="sources")this.sources();
      if(name==="progress")this.progress();
      if(name==="restart-dialog")this.context.modal("重新开始故事",'<p>重新开始会清空演化剧情的发现记录。时代模型无需进度，随时可查看。</p>'+btn("restart","从空地重新开始","","primary wide"));
      if(name==="restart") {this.stage.stopAnimation();this.memory=fresh();this.save();this.context.restart();}
    }
    help() {
      this.context.modal("演出执行者的玩法",'<p>先看角色遇到的困境，再选空间方案。观察建筑与人物改变，然后读新出现的名称。尝试其他方案可重来，没有扣分。</p><p>前章约 8–12 分钟；欧洲双线含 18 幕，可分段体验。意大利、英国可任选先后，进度分别保存；两线完成才开放最终比较。</p><p>顶部“首页”随时退出，“章节目录”可选择时代与具体问题。面板底部可返回上一问题或重看本幕，完成记录保留。普通场景可单指旋转、双指缩放；透视观察时使用滑杆。角色与上下分层任务采用点击选择，适合手机。“暂停”可停下动画，“复位”返回场景视角。</p>'+btn("sources","史料与教学边界","","wide"));
    }
    progress() {
      if(this.evolution.active||this.memory.phase==='finished'){this.evolution.tree();return;}
      this.context.modal("你的空间发现", '<p>你始终是演出执行者。名称在解决问题后出现，进度仅保存在此浏览器。</p><div class="story-discoveries">'+D.decisions.map((d,i)=>`<div><small>${String(i+1).padStart(2,"0")}</small><span>${this.memory.completed.includes(d.id) ? esc(d.discovery.en)+" · "+esc(d.discovery.zh) : "尚未发现"}</span></div>`).join("")+'</div>'+btn("restart-dialog","重新开始故事","","wide"));
    }
    sources() {
      this.context.modal("历史依据与教学边界",'<p>模型是跨时期的空间比较，不是一座剧场的连续考古复原。决策用来讨论条件，不能证明历史起源或唯一因果。</p><p>希腊阶段压缩了长期变化；罗马竞技场作为并行类型切换。中世纪礼仪、广场及街道实践长期并存。</p><p>本故事对比意大利的一类宫廷／学院视觉实践与英国的一类公共剧场实践，不能代表两国全部戏剧。英国宫廷假面剧也采用透视布景。奥林匹克个案不等于现代镜框完成形态；可变布景的发展也不是从它之后才开始。院落变形与上下分层都是教学比较，并不证明直接起源。</p><ul>'+[...D.sources,...T.BRANCH.sources].map(([title,url])=>`<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)}</a></li>`).join("")+'</ul><p>八位人物是跨年代的虚构合成角色，不是史实人物，也不表示同一剧团亲历数世纪。尺度、展开机构及建造顺序均为教学简化。当前模型不做真实声学模拟。</p>');
    }
    fail() {this.stage.stopAnimation();this.busy=false;this.paused=false;this.phase=this.memory.phase;this.index=this.indexFor();this.render();}
  }
  T.Story = Story; T.cleanStoryMemory=clean;
})(window.TTM);
