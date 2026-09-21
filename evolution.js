/* Evolution Mode：以“问题 → 决策 → 空间变化”串联古希腊、罗马与中世纪。 */
(function (T) {
  "use strict";

  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  const CHAPTERS = {
    greek: {
      kicker: "BEFORE THEATRE → ANCIENT GREECE",
      title: "剧场从一次表演中长出来",
      date: "祭仪 · 公共观看 · 古希腊",
      camera: { yaw: .42, pitch: .73, distance: 27, target: [0, .8, 0] },
      events: [
        {
          speaker: "祭司 PRIEST",
          problem: ["歌队要围绕祭坛歌唱、舞蹈。", "怎样让表演拥有一个共同发生的地方？"],
          choices: [
            { text: "让所有表演者分散在不同地方", consequence: "表演彼此分散，很难形成共同的观看中心。" },
            { text: "围绕中央形成共同的表演区域", ok: true, consequence: "集体歌舞获得了共同的空间核心。" }
          ],
          unlock: ["ORCHESTRA", "歌舞场", "集体歌舞构成了早期戏剧空间的重要核心。"],
          transition: "orchestra"
        },
        {
          speaker: "观众 AUDIENCE",
          problem: ["人越来越多了。", "我站在后面完全看不到，怎么办？"],
          choices: [
            { text: "大家继续挤在同一块平地", consequence: "大量观众处于同一高度，后排仍然被前排遮挡。" },
            { text: "利用旁边的天然山坡形成高差", ok: true, consequence: "高差改善了大规模观看的视线条件。" }
          ],
          unlock: ["THEATRON", "观看区域 / 观众席", "天然坡地为大量观众提供了观看所需的高差。"],
          transition: "theatron"
        },
        {
          speaker: "演员 ACTOR",
          problem: ["下一场我要换面具和服装。", "这些准备工作应该在哪里完成？"],
          choices: [
            { text: "直接在所有观众面前更换", consequence: "演员缺少被遮蔽的准备空间，角色转换也失去组织。" },
            { text: "在表演区旁搭建服务演员的小型建筑", ok: true, consequence: "演员拥有了候场、换装和出入的后台空间。" }
          ],
          unlock: ["SKENE", "景屋", "Skene最初首先服务于演员准备、换装与出入场，后来越来越重要。"],
          transition: "skene"
        },
        {
          speaker: "演员 ACTOR",
          problem: ["人物之间的行动越来越重要。", "演员需要更明确的活动区域。"],
          choices: [
            { text: "所有行动仍只围绕歌队中心进行", consequence: "人物行动被限制，新的戏剧结构很难展开。" },
            { text: "强化景屋前方的演员活动区域", ok: true, consequence: "歌队仍然存在，但人物行动开始获得更清楚的位置。" }
          ],
          unlock: ["ACTOR SPACE", "演员行动增强", "空间重心开始从纯粹的歌队中心，向人物行动扩展。"],
          transition: "actor-space"
        },
        {
          speaker: "工匠 BUILDER",
          problem: ["每年都重新搭木结构，人数又越来越多。", "怎样让剧场更稳定、更适合长期使用？"],
          choices: [
            { text: "每年继续重新搭临时结构", consequence: "临时结构仍要反复搭建，稳定性与容量问题没有解决。" },
            { text: "逐渐改造成永久性的石质设施", ok: true, consequence: "观看空间变得稳定、规整，并形成成熟的公共剧场。" }
          ],
          unlock: ["GREEK THEATRE", "成熟古希腊剧场", "这座剧场不是一次设计完成的，而是在一次次表演需求中逐渐形成的。"],
          transition: "stone"
        }
      ]
    },
    roman: {
      kicker: "ANCIENT ROME",
      title: "如果没有山，剧场还能成立吗？",
      date: "工程技术 · 城市建筑 · 公共娱乐",
      camera: { yaw: .42, pitch: .74, distance: 27, target: [0, 1, 0] },
      events: [
        {
          speaker: "罗马工程师 ENGINEER",
          problem: ["希腊剧场常借助天然坡地。", "但我们的城市没有这样的山，怎么办？"],
          choices: [
            { text: "只有有山的城市才能建剧场", consequence: "剧场仍然被自然地形限制，无法成为独立的城市建筑。" },
            { text: "用工程结构人工支撑观众席", ok: true, consequence: "观众席摆脱天然山坡，剧场可以独立建造。" }
          ],
          unlock: ["WE BUILT THE HILL.", "我们自己造了一座山", "拱券与支撑结构让剧场逐渐摆脱对天然坡地的依赖。"],
          transition: "arcades"
        },
        {
          speaker: "演出负责人 PRODUCER",
          problem: ["剧场已经成为城市公共建筑。", "舞台背后需要怎样的视觉背景？"],
          choices: [
            { text: "继续完全依赖远处自然景观", consequence: "舞台背景仍然缺少稳定、可控制的城市视觉形象。" },
            { text: "建立永久、宏伟的建筑立面", ok: true, consequence: "舞台背景本身成为建筑和视觉设计的一部分。" }
          ],
          unlock: ["SCAENAE FRONS", "舞台背景建筑", "柱列、门洞与分层立面把舞台背景高度建筑化、纪念碑化。"],
          transition: "scaenae"
        },
        {
          speaker: "观众 AUDIENCE",
          problem: ["我们想看的不只是戏剧，还有更大型的公共娱乐。", "如果更多方向都需要观看呢？"],
          choices: [
            { text: "所有观看仍保持一个方向", consequence: "大规模竞技与奇观仍受到单向观看关系限制。" },
            { text: "让观众进一步围绕中央活动区域", ok: true, consequence: "观看关系从半围合进一步发展为环绕。" }
          ],
          unlock: ["AMPHITHEATRE", "环绕型公共娱乐空间", "罗马公共娱乐继续扩大，圆形竞技场把观众组织到中央活动区四周。"],
          transition: "amphi"
        }
      ]
    },
    medieval: {
      kicker: "5TH CENTURY → MEDIEVAL",
      title: "剧场制度衰落以后，表演去哪里？",
      date: "礼仪 · 象征空间 · 城市",
      camera: { yaw: .50, pitch: .72, distance: 25, target: [-1, 1, -1] },
      events: [
        {
          speaker: "教士 CLERIC",
          problem: ["许多信徒无法直接阅读宗教故事。", "怎样让他们理解复活等故事？"],
          choices: [
            { text: "只增加更多文字说明", consequence: "文字仍然无法解决所有人的理解问题。" },
            { text: "用人物、动作、对白和音乐把故事演出来", ok: true, consequence: "礼仪空间开始承担越来越明显的表演功能。" }
          ],
          unlock: ["CHURCH PERFORMANCE", "教堂礼仪表演", "古典剧场制度衰落后，表演又在新的宗教空间中获得组织。"],
          transition: "church"
        },
        {
          speaker: "教士 CLERIC",
          problem: ["故事里同时有天堂、耶路撒冷和地狱。", "一个地点已经不够用了。"],
          choices: [
            { text: "每一段都把全部场景拆掉重搭", consequence: "故事不断中断，多个地点之间的关系也难以被看见。" },
            { text: "让不同象征地点同时并置", ok: true, consequence: "人物只要移动位置，就可以进入另一个戏剧地点。" }
          ],
          unlock: ["MANSION + PLATEA", "并置的象征空间", "不同地点可以同时存在，空间的意义由符号和人物行动共同建立。"],
          transition: "mansion"
        },
        {
          speaker: "观众 AUDIENCE",
          problem: ["故事越来越大，来看的人也越来越多。", "教堂已经装不下了。"],
          choices: [
            { text: "只允许少数人进入教堂", consequence: "公共观看需求仍然没有解决。" },
            { text: "把演出逐渐移向教堂门前、广场和街道", ok: true, consequence: "表演空间从建筑内部扩张到了城市公共空间。" }
          ],
          unlock: ["PUBLIC SPACE", "教堂 → 广场 → 街道", "中世纪没有形成一种单一标准剧场，城市中的不同地点都可能被组织为表演空间。"],
          transition: "city"
        },
        {
          speaker: "巡演者 PERFORMER",
          problem: ["城市这么大，不同街区的人都想看。", "难道所有人都必须来到同一个广场吗？"],
          choices: [
            { text: "让所有观众自己来到同一个地点", consequence: "观看仍然被固定在单一地点，城市尺度的问题没有解决。" },
            { text: "让舞台移动到观众面前", ok: true, consequence: "演出车把同一段表演带到不同城市站点。" }
          ],
          unlock: ["PAGEANT WAGON", "流动演出车", "当舞台开始移动，街道、站点和整座城市都参与组织观看。"],
          transition: "wagon"
        }
      ]
    }
  };

  class Evolution {
    constructor(ctx) {
      this.ctx = ctx;
      this.stage = ctx.stage;
      this.chapter = "greek";
      this.step = 0;
      this.busy = false;
      this.feedback = "";
      this.unlock = null;
      this.finished = false;
      this.active = true;
      this.loadChapter("greek");
    }

    chapterData() { return CHAPTERS[this.chapter]; }
    event() { return this.chapterData().events[this.step]; }

    loadChapter(id) {
      this.chapter = id;
      this.step = 0;
      this.busy = false;
      this.feedback = "";
      this.unlock = null;
      this.finished = false;
      if (id === "greek") {
        this.stage.load(T.BUILDERS.greek());
        ["theatron","orchestra","skene","proskenion","parodos","people","player","actor","relations","anomaly","evo-wood-theatron"].forEach(x => this.stage.show(x, false));
        for (let i=0;i<6;i++) this.stage.show("chorus"+i,false);
        this.stage.show("evo-altar", true); this.stage.show("evo-ritual", true);
      } else if (id === "roman") {
        this.stage.load(T.BUILDERS.roman());
        ["roman-arcades","roman-scaenae","roman-amphi"].forEach(x => this.stage.show(x,false));
        ["roman-hill","roman-cavea","roman-orchestra","roman-stage","roman-people"].forEach(x => this.stage.show(x,true));
      } else {
        this.stage.load(T.BUILDERS.medieval());
        ["houses","stations","wagon","wagon-flap","wagon-cast","crowd0","crowd1","crowd2","church-performance","mansion-heaven","mansion-jerusalem","mansion-hell"].forEach(x => this.stage.show(x,false));
        this.stage.show("church",true); this.stage.show("street",true);
      }
      this.stage.controlsEnabled = true;
      this.stage.go(this.chapterData().camera, true);
      this.updateHeading();
      this.ctx.status(this.chapter === "greek" ? "从一块空地开始 · 先解决第一个表演问题" : this.chapter === "roman" ? "ROME · 新的社会与技术条件带来新的空间问题" : "5TH CENTURY · 古典剧场制度衰落，但表演没有消失");
      this.render();
    }

    updateHeading() { this.ctx.heading(this.chapterData()); }
    render() { if (this.active) this.ctx.render(); }
    overview() { this.stage.go(this.chapterData().camera); }
    dispose() { this.active=false; this.stage.stopAnimation(); this.stage.controlsEnabled=true; }

    reveal(id, duration=900, depth=2.2, done) {
      this.stage.move(id,[0,-depth,0],true); this.stage.show(id,true);
      this.stage.animate(duration,t=>this.stage.move(id,[0,-depth*(1-t),0],true),()=>{ this.stage.move(id,[0,0,0],true); if(done)done(); });
    }

    finishTransition(ev) {
      this.busy=false;
      this.unlock=ev.unlock;
      this.feedback=ev.choices.find(c=>c.ok).consequence;
      this.step++;
      this.render();
    }

    success(ev) {
      this.busy=true; this.feedback=""; this.unlock=null; this.render();
      const finish=()=>this.finishTransition(ev);
      switch(ev.transition) {
        case "orchestra":
          this.reveal("orchestra",850,1.2,finish); break;
        case "theatron":
          this.stage.show("evo-ritual",false);
          for(let i=0;i<6;i++) { const a=i*Math.PI/3; this.stage.move("chorus"+i,[Math.cos(a)*1.35,.13,Math.sin(a)*1.35],true); this.stage.show("chorus"+i,true); }
          this.stage.show("people",true); this.stage.show("parodos",true);
          this.reveal("evo-wood-theatron",1100,2.8,()=>{ this.stage.go({yaw:.45,pitch:.72,distance:26,target:[0,1,1]}); finish(); });
          break;
        case "skene":
          this.reveal("skene",1050,3.0,()=>{ this.stage.show("actor",true); this.stage.move("actor",[0,.75,-3.35],true); finish(); }); break;
        case "actor-space":
          this.reveal("proskenion",850,1.4,()=>{ this.stage.move("actor",[-.55,.75,-3.05],true); finish(); }); break;
        case "stone":
          this.stage.show("evo-wood-theatron",false);
          this.reveal("theatron",1300,2.8,()=>{ this.stage.go({yaw:.45,pitch:.78,distance:25,target:[0,1,0]}); finish(); }); break;
        case "arcades":
          this.stage.show("roman-arcades",true); this.stage.move("roman-arcades",[0,-2.4,0],true);
          this.stage.animate(1350,t=>{ this.stage.move("roman-hill",[0,-2.6*t,0],true); this.stage.move("roman-arcades",[0,-2.4*(1-t),0],true); },()=>{ this.stage.show("roman-hill",false); this.stage.move("roman-arcades",[0,0,0],true); finish(); });
          break;
        case "scaenae": this.reveal("roman-scaenae",1150,3.2,finish); break;
        case "amphi":
          this.stage.show("roman-amphi",true); this.stage.move("roman-amphi",[0,-2.8,0],true);
          this.stage.animate(1300,t=>{ this.stage.move("roman-amphi",[0,-2.8*(1-t),0],true); },()=>{ this.stage.show("roman-stage",false); this.stage.show("roman-scaenae",false); this.stage.go({yaw:.35,pitch:1.02,distance:27,target:[0,.7,0]}); finish(); });
          break;
        case "church": this.reveal("church-performance",850,1.4,finish); break;
        case "mansion":
          ["mansion-heaven","mansion-jerusalem","mansion-hell"].forEach((id,i)=>{ this.stage.move(id,[0,-1.8,0],true); this.stage.show(id,true); });
          this.stage.animate(1100,t=>["mansion-heaven","mansion-jerusalem","mansion-hell"].forEach(id=>this.stage.move(id,[0,-1.8*(1-t),0],true)),()=>{ this.stage.go({yaw:.35,pitch:.72,distance:23,target:[0,1,0]}); finish(); });
          break;
        case "city":
          ["houses","stations"].forEach(id=>{this.stage.move(id,[0,-1.8,0],true);this.stage.show(id,true);});
          this.stage.animate(1200,t=>["houses","stations"].forEach(id=>this.stage.move(id,[0,-1.8*(1-t),0],true)),()=>{ this.stage.go({yaw:.5,pitch:.75,distance:26,target:[0,1,0]}); finish(); });
          break;
        case "wagon":
          ["wagon","wagon-flap","wagon-cast","crowd0","crowd1","crowd2"].forEach(id=>this.stage.show(id,true));
          ["wagon","wagon-flap","wagon-cast"].forEach(id=>this.stage.move(id,[-3,0,0],true));
          this.stage.animate(4200,t=>{
            const x=-3+6*t; ["wagon","wagon-flap","wagon-cast"].forEach(id=>this.stage.move(id,[x,0,0],true));
          },()=>{ this.stage.go({yaw:.48,pitch:.78,distance:24,target:[0,1,1]}); finish(); });
          break;
        default: finish();
      }
    }

    choose(index) {
      if(this.busy || this.finished) return;
      const ev=this.event(); if(!ev) return;
      const ch=ev.choices[index]; if(!ch) return;
      if(!ch.ok) { this.feedback=ch.consequence; this.unlock=null; this.ctx.status("CONSEQUENCE · 问题仍然存在，请重新选择"); this.render(); return; }
      this.ctx.status("SOLUTION ADOPTED · 空间正在发生变化");
      this.success(ev);
    }

    nextChapter() {
      if(this.busy) return;
      if(this.chapter==="greek") this.loadChapter("roman");
      else if(this.chapter==="roman") {
        this.ctx.status("5TH CENTURY · 古典剧场制度衰落，但表演没有消失");
        this.loadChapter("medieval");
      } else { this.finished=true; this.render(); }
    }

    restart() { this.loadChapter("greek"); }

    action(name,value) {
      if(name==="choice") this.choose(Number(value));
      else if(name==="next-chapter") this.nextChapter();
      else if(name==="restart") this.restart();
      else if(name==="overview") this.overview();
    }

    progressText() {
      const totals={greek:5,roman:3,medieval:4};
      const prior=this.chapter==="greek"?0:this.chapter==="roman"?5:8;
      return `${prior+Math.min(this.step,totals[this.chapter])} / 12`;
    }

    html() {
      if(this.finished) return `
        <div class="evo-card evo-final">
          <div class="eyebrow">EVOLUTION COMPLETE · 12 / 12</div>
          <h2>剧场从来不只是一栋建筑。</h2>
          <p>它是表演方式、社会制度、观看关系与技术条件共同塑造出来的空间。</p>
          <div class="evo-timeline final"><span>祭祀空地</span><b>→</b><span>希腊剧场</span><b>→</b><span>罗马建筑</span><b>→</b><span>教堂</span><b>→</b><span>城市与演出车</span></div>
          <button class="primary wide" data-action="evolution-restart">从头再看一次</button>
          <button class="wide" data-action="home">返回首页</button>
        </div>`;

      const c=this.chapterData();
      const ev=this.event();
      if(!ev) {
        const next=this.chapter==="greek"?"进入古罗马 →":this.chapter==="roman"?"进入中世纪 →":"完成这次空间旅行 →";
        const summary=this.chapter==="greek"?"祭祀空地 → Orchestra → Theatron → Skene → 石质公共剧场":this.chapter==="roman"?"天然坡地 → 人工支撑 → Scaenae Frons → 环绕型公共娱乐空间":"教堂礼仪 → Mansion + Platea → 广场与街道 → Pageant Wagon";
        return `<div class="evo-card chapter-complete">
          <div class="eyebrow">CHAPTER COMPLETE · ${this.progressText()}</div>
          <h2>${esc(c.title)}</h2>
          <p class="evo-summary">${esc(summary)}</p>
          ${this.unlock?`<div class="evo-unlock"><span>${esc(this.unlock[0])}</span><strong>${esc(this.unlock[1])}</strong><p>${esc(this.unlock[2])}</p></div>`:""}
          <button class="primary wide" data-action="evolution-next-chapter">${next}</button>
        </div>`;
      }

      const choices=ev.choices.map((x,i)=>`<button ${this.busy?"disabled":""} data-action="evolution-choice" data-value="${i}"><span>${String.fromCharCode(65+i)}</span>${esc(x.text)}</button>`).join("");
      return `<div class="evo-card">
        <div class="evo-meta"><span>${esc(c.kicker)}</span><b>EVOLUTION ${this.progressText()}</b></div>
        ${this.unlock?`<div class="evo-unlock"><span>${esc(this.unlock[0])}</span><strong>${esc(this.unlock[1])}</strong><p>${esc(this.unlock[2])}</p></div>`:""}
        <div class="evo-speaker">${esc(ev.speaker)}</div>
        <h2>${ev.problem.map(esc).join("<br>")}</h2>
        ${this.feedback?`<div class="evo-consequence"><span>CONSEQUENCE｜结果</span><p>${esc(this.feedback)}</p></div>`:""}
        ${this.busy?`<div class="evo-building"><i></i><span>空间正在变化…</span></div>`:`<div class="evo-choices">${choices}</div>`}
        <p class="evo-note">选择不是考试。先看方案会造成什么，再决定怎样继续。</p>
      </div>`;
    }
  }

  T.Evolution = Evolution;
  T.EVOLUTION_CHAPTERS = CHAPTERS;
})(window.TTM);
