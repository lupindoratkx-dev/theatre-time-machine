/* V2 角色任务。纯数据状态与渲染分离，沿用 T.Stage 和 T.DATA.periods。 */
(function (T) {
  "use strict";
  const PI = Math.PI;
  const clamp = T.clamp;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const btn = (action, label, value = "", className = "", disabled = false) =>
    `<button type="button" data-action="journey-${action}" data-value="${esc(value)}" class="${className}" ${disabled ? "disabled" : ""}>${label}</button>`;
  const range = (id, label, min, max, value, step = 1) =>
    `<label class="range-label" for="${id}">${label}<output id="${id}-value">${value}</output></label><input id="${id}" data-control="${id}" type="range" min="${min}" max="${max}" value="${value}" step="${step}" aria-label="${label}">`;

  function alongPath(path, t) {
    const lengths = path.slice(1).map((p, i) => Math.hypot(...p.map((v, k) => v - path[i][k])));
    const total = lengths.reduce((a, b) => a + b, 0);
    let d = clamp(t, 0, 1) * total;
    for (let i = 0; i < lengths.length; i++) {
      if (d <= lengths[i] || i === lengths.length - 1) {
        const a = path[i], b = path[i + 1], q = lengths[i] ? clamp(d / lengths[i], 0, 1) : 0;
        return { position: a.map((v, k) => v + (b[k] - v) * q), yaw: Math.atan2(b[0] - a[0], b[2] - a[2]) };
      }
      d -= lengths[i];
    }
    return { position: [...path[0]], yaw: 0 };
  }
  function audienceAngle(position, target) {
    return Math.atan2(target[0] - position[0], target[2] - position[2]);
  }
  function angleDistance(a, b) { return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))); }
  function flatOffsets(values, targets) {
    return values.map((v, i) => ({ x: (v - targets[i]) * .56, z: (v - targets[i]) * .18 }));
  }

  class Journey {
    constructor(period, context) {
      this.p = period;
      this.d = period.journey;
      this.ctx = context;
      this.stage = context.stage;
      this.state = { phase: "entry", seat: -1, seats: [], busy: false, played: false,
        route: 0, station: 0, docking: false, flats: [3, 0, 0], arranged: false,
        viewpoint: 0, centered: false, side: false, position: 1, moved: false,
        angle: -155, connected: [], connection: "", complete: false, paused: false, anomaly: false };
      this.active = true;
      this.resetScene();
    }
    signal(text) { this.ctx.status(text); }
    render() { if (this.active) this.ctx.render(); }
    mark(...ids) { ids.forEach(id => this.ctx.mark(id)); }
    finish(text) {
      if (!this.state.complete) {
        this.state.complete = true;
        this.ctx.complete("journey");
      }
      this.signal(text);
      this.render();
    }
    resetScene() {
      const s = this.stage, q = this.state;
      s.controlsEnabled = true;
      s.show("anomaly", false); s.show("guides", false); s.show("vanishing", false);
      if (this.p.id === "greek") {
        s.move("player", this.d.path[0], true);
        s.show("player", true); s.show("actor", false);
        for (let i = 0; i < 6; i++) {
          s.move("chorus" + i, [-7 - i * .22, .13, -2.5], true);
          s.show("chorus" + i, false);
        }
        this.signal("你是观众 · 沿侧向通道入场");
      } else if (this.p.id === "medieval") {
        this.wagonAt(0);
        this.signal("你是巡演者 · 向右拖动车辆");
      } else if (this.p.id === "renaissance") {
        this.setFlats();
        this.viewpoint(0);
        this.signal("你是舞台设计师 · 调整三组景片");
      } else {
        this.actorPose(true);
        s.show("canopy", false);
        s.show("gallery-front", false);
        this.signal("你是演员 · 换站位，转身回应三面观众");
      }
    }
    activate() {
      this.active = true;
      this.stage.pause(this.state.paused);
      this.stage.show("relations", false);
      this.stage.show("anomaly", this.state.anomaly);
      if (this.p.id === "greek" && this.state.seat >= 0) this.seatView();
      else if (this.p.id === "renaissance") this.viewpoint(this.state.viewpoint);
      else this.stage.go(this.p.camera);
      if (this.p.id === "elizabeth") {
        this.stage.show("canopy", false);
        this.stage.show("gallery-front", false);
      }
      this.stage.controlsEnabled = this.p.id !== "renaissance";
      this.render();
    }
    deactivate() {
      this.active = false;
      this.stage.pause(true);
      this.stage.controlsEnabled = true;
      this.stage.show("canopy", true);
      this.stage.show("gallery-front", true);
      this.stage.show("seat", true);
      this.stage.show("guides", false); this.stage.show("vanishing", false);
      this.stage.show("anomaly", false);
    }
    dispose() {
      this.active = false;
      this.stage.stopAnimation();
      this.stage.controlsEnabled = true;
    }
    overview() {
      this.stage.controlsEnabled = true;
      this.stage.go(this.p.camera);
      // 角色课题可见，点击“回到我的视角”继续观察。
      if (this.p.id === "renaissance") {
        this.stage.show("seat", true);
        this.stage.go({ yaw: .63, pitch: .66, distance: 25, target: [0, 1, -1] });
      }
      if (this.p.id === "greek") this.stage.show("player", !this.state.busy);
    }
    moveAlong(id, path, t) {
      const step = alongPath(path, t);
      this.stage.move(id, step.position, true);
      this.stage.rotate(id, step.yaw, [0, 0, 0], true);
    }
    seatView() {
      const seat = this.d.seats[this.state.seat];
      if (!seat) return;
      this.stage.show("player", false);
      this.stage.view(seat.eye, [0, .72, -2]);
      this.signal(`${seat.label} · 先观察歌队区与景屋的位置`);
    }
    entrance() {
      const q = this.state;
      if (q.busy || q.phase !== "entry") return;
      q.busy = true;
      this.signal("PARODOS · 侧向通道连接剧场外部与观看空间");
      this.render();
      this.stage.animate(2400, t => this.moveAlong("player", this.d.path, t), () => {
        q.busy = false; q.phase = "seats";
        this.mark("parodos");
        this.signal("已到达观众席 · 选择你的座位"); this.render();
      });
    }
    chooseSeat(index) {
      const q = this.state, seat = this.d.seats[index];
      if (!seat || q.busy || q.phase === "entry") return;
      q.seat = index; q.busy = true;
      if (!q.seats.includes(index)) q.seats.push(index);
      const from = this.stage.offset("player");
      const path = [from, [0, from[1], from[2]], [0, seat.position[1], seat.position[2]], seat.position];
      this.stage.go(this.p.camera); this.stage.show("player", true); this.render();
      this.stage.animate(1000, t => this.moveAlong("player", path, t), () => {
        q.busy = false;
        this.mark("theatron"); this.seatView(); this.render();
      });
    }
    performance() {
      const q = this.state;
      if (q.seat < 0 || q.busy) return;
      q.phase = "performance"; q.busy = true; q.paused = false; q.performanceSec = 0;
      this.seatView(); this.render();
      this.stage.show("actor", false);
      let cue = -1;
      this.stage.animate(12000, t => {
        const sec = t * 12;
        const nextCue = sec < 6 ? 0 : sec < 9 ? 1 : 2;
        if (cue !== nextCue) {
          cue = nextCue;
          this.signal(["CHORUS · 歌队由侧向通道进入", "ORCHESTRA · 歌队在歌队区组成队形", "SKENE · 演员从景屋附近出场"][cue]);
        }
        for (let i = 0; i < 6; i++) {
          const a = i * PI * 2 / 6, target = [Math.cos(a) * 1.35, .13, Math.sin(a) * 1.35];
          const progress = clamp((sec - i * .45) / 5.1, 0, 1);
          this.stage.show("chorus" + i, sec >= i * .45);
          this.moveAlong("chorus" + i, [[-6.9, .13, -2.6], [-3.65, .13, -1.9], [-2.1, .13, -.5], target], progress);
          if (progress === 1) this.stage.rotate("chorus" + i, Math.atan2(-target[0], -3.2 - target[2]), [0, 0, 0], true);
        }
        if (sec >= 8) {
          this.stage.show("actor", true);
          this.moveAlong("actor", [[0, .75, -4.5], [0, .75, -3.3], [-.55, .75, -3.2]], clamp((sec - 8) / 2.5, 0, 1));
          if (sec >= 10.5) this.stage.rotate("actor", 0, [0, 0, 0], true);
        }
        const clock = document.getElementById("performance-clock");
        q.performanceSec = Math.min(12, Math.floor(sec));
        if (clock) clock.textContent = `${q.performanceSec} / 12 秒`;
      }, () => {
        q.phase = "complete"; q.busy = false; q.played = true;
        this.mark("orchestra", "skene", "proskenion");
        this.finish("PERFORMANCE STARTED · 演出空间已连成整体");
      });
    }
    wagonAt(value) {
      const route = this.d.route, s = this.stage;
      const x = route.start + (route.stations[2] - route.start) * value / 100;
      ["wagon", "wagon-flap", "wagon-cast"].forEach(id => s.move(id, [x, 0, 0], true));
      s.show("wagon-flap", this.state.docking); s.show("wagon-cast", this.state.docking);
    }
    wagonInput(value) {
      const q = this.state, r = this.d.route;
      if (q.docking || q.station >= 3) return;
      // 新手即使一下拖到底，也会停在下一站，逐站完成。
      const stop = r.values[q.station];
      q.route = clamp(value, q.station ? r.values[q.station - 1] : 0, stop);
      this.wagonAt(q.route);
      const slider = document.getElementById("route");
      if (slider) slider.value = q.route;
      this.sync();
      if (q.route >= stop) this.dock();
    }
    dock() {
      const q = this.state, i = q.station, s = this.stage;
      q.docking = true;
      this.wagonAt(q.route);
      this.signal(`${this.d.route.names[i]} · 车停下，观众围拢，演出开始`);
      s.move("crowd" + i, [0, 0, -.65]);
      s.highlight("wagon");
      s.move("wagon-flap", [this.d.route.stations[i], -.35, -.55], true);
      s.animate(1800, t => {
        s.move("wagon-flap", [this.d.route.stations[i], -.35 * (1 - t), -.55 * (1 - t)], true);
        s.move("wagon-cast", [this.d.route.stations[i], 0, t * .25], true);
      }, () => {
        q.station++;
        this.mark("wagon", "guild", "station");
        if (i === 0) this.mark("church");
        if (q.station === 3) this.finish("TOUR COMPLETE · 城市成为临时剧场");
        else {
          this.signal(`${this.d.route.names[i]}演出完成 · 收起舞台后前往下一站`);
          this.render();
        }
      });
      this.render();
    }
    depart() {
      if (!this.state.docking || this.stage.animation || this.state.complete) return;
      this.state.docking = false;
      this.stage.highlight("");
      this.wagonAt(this.state.route);
      this.signal(`前往${this.d.route.names[this.state.station]} · 继续拖动车辆`);
      this.render();
    }
    setFlats() {
      const offsets = flatOffsets(this.state.flats, this.d.flatTargets);
      offsets.forEach((o, i) => [-1, 1].forEach(sign => {
        this.stage.move("flats" + i + (sign < 0 ? "L" : "R"), [sign * o.x, 0, o.z], true);
      }));
    }
    flatInput(index, value) {
      if (index < 0 || index > 2) return;
      this.state.flats[index] = value;
      this.setFlats();
      const ready = this.state.flats.every((v, i) => v === this.d.flatTargets[i]);
      this.state.arranged = ready;
      this.sync();
      this.signal(ready ? "景片已形成递减关系 · 现在移动观看位置" : "观察街道两侧的间隔、遮挡与尺度");
      if (ready) { this.mark("flats", "scale"); this.viewpoint(this.state.viewpoint); this.render(); }
    }
    viewpoint(value) {
      const q = this.state;
      q.viewpoint = value;
      // 观察镜头位于座位附近，隐藏近处椅背，避免遮住街道。
      this.stage.show("seat", false);
      const x = value / 100 * this.d.viewpointLimit;
      // 眼睛与目标同步横移，避免自动朝向消失点抵消离轴观察。
      this.stage.view([x, 1.64, 7], [x, 1.1, -5], true);
      this.stage.controlsEnabled = false;
      const aligned = q.arranged && Math.abs(value) <= 7;
      this.stage.show("guides", aligned); this.stage.show("vanishing", aligned);
      if (aligned) {
        q.centered = true; this.mark("point");
        this.signal("IDEAL VIEWPOINT FOUND · 理想观看位置");
      } else if (q.arranged && Math.abs(value) >= 65) {
        q.side = true;
        this.signal("侧看 · 景片的间隔与厚度显露出来");
      }
      this.sync();
      if (q.centered && q.side && !q.complete) {
        this.mark("court");
        this.finish("PERSPECTIVE DISCOVERED · 视点改变，幻觉也改变");
      }
    }
    actorPose(instant = false) {
      const q = this.state, pos = this.d.positions[q.position], angle = q.angle * PI / 180;
      ["actor", "facing"].forEach(id => {
        this.stage.move(id, pos, instant);
        this.stage.rotate(id, angle, [0, 0, 0], instant);
      });
    }
    actorInput(value) {
      const q = this.state;
      q.angle = value;
      this.actorPose();
      const pos = this.d.positions[q.position], angle = value * PI / 180;
      const group = this.d.audience.find(a => angleDistance(angle, audienceAngle(pos, a.center)) <= 18 * PI / 180);
      this.stage.highlight(group ? "audience-" + group.id : "");
      if (group && q.moved) {
        if (!q.connected.includes(group.id)) {
          q.connected.push(group.id);
          this.mark("thrust", "yard");
        }
        q.connection = group.id;
        this.signal(`${group.en} ✓ · 正在朝向${group.label}观众`);
      } else {
        q.connection = "";
        this.signal(q.moved ? "转动身体 · 留意身前的方向标记" : "先换一个站位，再开始三面交流");
      }
      this.sync();
      if (q.connected.length === 3 && q.moved && !q.complete) {
        this.mark("galleries", "heavens");
        this.finish("THREE-SIDED RELATIONSHIP · 三面交流已完成");
      }
    }
    actorPosition(index) {
      const q = this.state;
      if (index < 0 || index > 2) return;
      if (q.position !== index) q.moved = true;
      q.position = index;
      this.actorPose(); this.actorInput(q.angle); this.render();
    }
    sync() {
      const q = this.state;
      const output = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
      if (this.p.id === "medieval") {
        output("route-value", `${Math.round(q.route)}%`);
        const icon = document.getElementById("wagon-token");
        if (icon) icon.style.left = `${q.route}%`;
      }
      if (this.p.id === "renaissance") {
        q.flats.forEach((v, i) => output(`flat-${i}-value`, v === this.d.flatTargets[i] ? "已对齐 ✓" : `位置 ${v + 1}`));
        output("viewpoint-value", Math.abs(q.viewpoint) <= 7 ? "中央" : (q.viewpoint < 0 ? "左侧 " : "右侧 ") + Math.abs(q.viewpoint) + "%");
        output("perspective-state", !q.arranged ? "先整理三组景片" : q.centered && !q.side ? "再移到侧面观察" : !q.centered ? "移回中央找理想视点" : "已完成中央与侧面的对照");
      }
      if (this.p.id === "elizabeth") {
        output("actor-angle-value", `${q.angle}°`);
        this.d.audience.forEach(a => {
          const el = document.getElementById("connection-" + a.id);
          if (el) { el.classList.toggle("lit", q.connected.includes(a.id)); el.textContent = `${a.en}${q.connected.includes(a.id) ? " ✓" : " ○"}`; }
        });
      }
    }
    input(id, value) {
      if (!this.active || !this.stage.ok || !Number.isFinite(value)) return;
      if (id === "route") this.wagonInput(value);
      else if (id.startsWith("flat-")) this.flatInput(Number(id.slice(5)), clamp(value, 0, 3));
      else if (id === "viewpoint") this.viewpoint(clamp(value, -100, 100));
      else if (id === "actor-angle") this.actorInput(clamp(value, -180, 180));
    }
    action(name, value) {
      if (!this.stage.ok) { this.ctx.toast("3D 暂不可用，可切换到空间导览阅读知识。 "); return; }
      if (name === "enter") this.entrance();
      else if (name === "seat") this.chooseSeat(Number(value));
      else if (name === "perform") this.performance();
      else if (name === "depart") this.depart();
      else if (name === "actor-position") this.actorPosition(Number(value));
      else if (name === "pause") {
        this.state.paused = !this.state.paused; this.stage.pause(this.state.paused); this.render();
      } else if (name === "my-view") {
        if (this.p.id === "greek") this.seatView();
        else if (this.p.id === "renaissance") this.viewpoint(this.state.viewpoint);
      } else if (name === "anomaly") {
        this.state.anomaly = !this.state.anomaly;
        this.stage.show("anomaly", this.state.anomaly);
        this.stage.show("relations", false);
        this.stage.go({ yaw: -.32, pitch: .6, distance: 22, target: [0, 1, .2] });
        this.signal(this.state.anomaly ? "TEMPORAL ANOMALY · 部分斜向视线被侧翼截断" : "空间恢复 · 歌队区重新开放"); this.render();
      } else if (name === "replay") {
        this.dispose();
        this.ctx.restart();
      }
    }
    html() {
      const q = this.state, p = this.p;
      const title = text => `<h2>${text}</h2>`;
      let out = `<div class="role-line"><span>ROLE / ${esc(this.d.roleEn)}</span><b>${esc(this.d.role)}</b></div>`;
      if (!this.stage.ok) return out + title("当前可使用空间导览") + `<p>浏览器未能显示 3D。点击上方“空间导览”阅读热点；可换用系统浏览器后刷新。</p>`;
      if (p.id === "greek") {
        if (q.phase === "entry") out += title("从侧向通道入场") + `<p>${esc(this.d.opening)}</p>` + btn("enter", q.busy ? "正在走入剧场…" : "沿 Parodos 入场 ↗", "", "primary wide", q.busy);
        else {
          out += title(q.phase === "performance" ? "演出正在开始" : q.complete ? "你已坐进历史现场" : "选择你的观看位置");
          if (!q.complete && q.phase !== "performance") out += `<p>先坐下，看看歌队区与景屋。也可以换座位比较。</p>`;
          out += `<div class="seat-choices">${this.d.seats.map((seat, i) => btn("seat", `${seat.label}${q.seats.includes(i) ? " ✓" : ""}`, i, q.seat === i ? "active" : "", q.busy)).join("")}</div>`;
          if (q.phase === "performance") out += `<div class="performance-line"><span id="performance-clock">${q.performanceSec || 0} / 12 秒</span>${btn("pause", q.paused ? "继续播放" : "暂停")}</div>`;
          else if (!q.complete) out += btn("perform", "坐好，观看演出开始 →", "", "primary wide", q.seat < 0 || q.busy);
          else {
            out += `<p class="journey-summary">${esc(this.d.summary)}</p>`;
            out += btn("perform", "重看 12 秒演出", "", "wide", q.busy);
            out += btn("anomaly", q.anomaly ? "移除镜框，恢复空间" : "时空异常 · 插入现代镜框", "", "wide");
            if (q.anomaly) out += `<p class="callout">${esc(this.d.anomalyText)}</p>`;
          }
          if (q.seat >= 0) out += btn("my-view", "回到我的座位视角", "", "text-button");
        }
      } else if (p.id === "medieval") {
        out += title(q.complete ? "城市成为剧场" : q.docking ? "到站停演" : "把舞台推向城市");
        out += `<p>${q.complete ? esc(this.d.summary) : q.docking ? "台板展开，演员出现，附近观众围拢。" : "拖动车辆到下一站。放手即可停下，方向键也能微调。"}</p>`;
        out += `<div class="route-map" aria-hidden="true"><span>教堂</span><span>街道</span><span>广场</span><span>市集</span><i id="wagon-token" style="left:${q.route}%">▣</i></div>`;
        out += `<div class="slider-wrap">${range("route", "演出车路线", 0, 100, q.route)}<span class="route-count">已完成 ${q.station} / 3 站</span></div>`;
        if (q.docking && !q.complete) out += btn("depart", this.stage.animation ? "正在演出…" : "收起舞台，继续出发 →", "", "primary wide", !!this.stage.animation);
      } else if (p.id === "renaissance") {
        out += title(q.complete ? "视点改变了幻觉" : !q.arranged ? "排列一条透视街道" : "寻找理想观看位置");
        out += `<p>${q.complete ? esc(this.d.summary) : !q.arranged ? "拖动前、中、后三组景片，使两侧立面形成递减的街道。" : "左右移动观看位置。找到中央，再去侧面看景片怎样露出间隔。"}</p>`;
        if (!q.arranged) {
          out += `<div class="flat-controls">${q.flats.map((v, i) => `<div class="slider-wrap">${range("flat-" + i, this.d.flatNames[i], 0, 3, v)}</div>`).join("")}</div>`;
        } else {
          out += `<div class="slider-wrap viewpoint-control">${range("viewpoint", "VIEWPOINT / 观看位置", -100, 100, q.viewpoint, 1)}<div class="range-ends"><span>左侧</span><span>中央</span><span>右侧</span></div></div><p id="perspective-state" class="inline-hint"></p>`;
          out += btn("my-view", "回到透视观察镜头", "", "text-button");
        }
      } else {
        out += title(q.complete ? "三面交流已完成" : "让三面观众看见你");
        out += `<p>${q.complete ? esc(this.d.summary) : q.moved ? "拖动朝向滑杆，让身前标记朝向三组观众。" : "先换一个站位，再转动身体朝向观众。"}</p>`;
        out += `<div class="actor-positions">${["画面左侧", "舞台中央", "画面右侧"].map((label, i) => btn("actor-position", label, i, q.position === i ? "active" : "")).join("")}</div>`;
        out += `<div class="slider-wrap">${range("actor-angle", "身体朝向", -180, 180, q.angle)}</div>`;
        out += `<div class="connection-row">${this.d.audience.map(a => `<span id="connection-${a.id}" class="${q.connected.includes(a.id) ? "lit" : ""}">${a.en} ${q.connected.includes(a.id) ? "✓" : "○"}</span>`).join("")}</div><small class="cutaway-note">前侧与顶棚作剖切 · 左右以画面为参照</small>`;
      }
      if (q.complete) {
        if (p.quiz) out += '<button data-action="mode" data-value="quiz" class="text-button">再想一想 · 可选小测</button>';
        const periods = T.DATA.periods, index = periods.indexOf(p), next = periods[(index + 1) % periods.length];
        out += `<div class="task-complete"><span>✓ TASK COMPLETE</span><button class="primary" data-action="${index < 3 ? "period" : "recap"}" data-value="${next.id}">${index < 3 ? "下一站 · " + next.name + " →" : "查看本轮记录"}</button></div>`;
      }
      out += `<div class="journey-foot">${btn("replay", "重做本关", "", "text-button")}<button data-action="sources" class="text-button">史料与示意范围</button></div>`;
      return out;
    }
  }
  T.Journey = Journey;
  T.JourneyMath = { alongPath, audienceAngle, angleDistance, flatOffsets };
})(window.TTM);
