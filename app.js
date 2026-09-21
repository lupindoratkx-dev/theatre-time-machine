(function (T) {
  "use strict";

  const D = T.DATA;
  const periods = D.periods;
  const $ = id => document.getElementById(id);

  const escape = s => String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

  const button = (action, label, value = "", extra = "") =>
    '<button type="button" class="' + extra +
    '" data-action="' + action +
    '" data-value="' + escape(value) + '">' +
    label + '</button>';

  let memory = {};
  let current = null;
  let mode = "role";
  let journey = null;
  let evolution = null;
  let selected = "";
  let runtime = {};
  let stage = null;
  let nodes = [];

  function cleanMemory(raw) {
    const out = {};

    periods.forEach(p => {
      const item = raw && typeof raw[p.id] === "object" && raw[p.id] || {};

      out[p.id] = {
        seen: Array.isArray(item.seen)
          ? [...new Set(item.seen.filter(id =>
              p.hotspots.some(h => h.id === id)))]
          : [],
        done: Array.isArray(item.done)
          ? [...new Set(item.done.filter(id => p.tasks.includes(id)))]
          : []
      };
    });

    return out;
  }

  try {
    memory = cleanMemory(
      JSON.parse(localStorage.getItem(D.storageKey) || "{}")
    );
  } catch (e) {
    memory = cleanMemory({});
  }

  function save() {
    try {
      localStorage.setItem(D.storageKey, JSON.stringify(memory));
    } catch (e) {
      $("storage-note").hidden = false;
    }
  }

  function toast(text) {
    $("toast").textContent = text;
    $("toast").classList.add("visible");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      $("toast").classList.remove("visible");
    }, 3200);
  }

  function complete(id) {
    if (!current.tasks.includes(id)) return;
    const state = memory[current.id];

    if (!state.done.includes(id)) {
      state.done.push(id);
      save();
      toast("已完成一项体验 · 探索记录已更新");
    }

    updateProgress();
  }

  function finished(p) {
    const state = memory[p.id];

    return p.tasks.every(task => state.done.includes(task));
  }

  function updateProgress() {
    $("era-nav").innerHTML = periods.map((p, i) => {
      const label =
        '<span class="era-number">' +
          String(i + 1).padStart(2, "0") +
        '</span><span><strong>' +
          escape(p.name) +
        '</strong><small>' +
          escape(p.en) +
        '</small></span><span class="era-mark">' +
          (finished(p) ? "✓" : "") +
        '</span>';

      return button(
        "period",
        label,
        p.id,
        current?.id === p.id ? "era active" : "era"
      );
    }).join("");

    $("era-nav").querySelectorAll("button").forEach(b => {
      b.setAttribute(
        "aria-current",
        current?.id === b.dataset.value ? "step" : "false"
      );
    });

    if (current) {
      const state = memory[current.id];
      const total = current.hotspots.length;

      $("progress-text").textContent =
        state.seen.length + "/" + total + " 热点 · " +
        state.done.length + "/" + current.tasks.length + " 体验";

      $("progress").max = total + current.tasks.length;
      $("progress").value = state.seen.length + state.done.length;
    }

    nodes.forEach(n => {
      const seen = memory[current.id].seen.includes(n.h.id);
      n.el.classList.toggle("found", seen);
      n.el.classList.toggle("selected", n.h.id === selected);
      n.el.setAttribute(
        "aria-label",
        n.h.name + (seen ? "，已探索" : "")
      );
    });
  }

  function overview() {
    if (evolution) { evolution.overview(); stage.highlight(""); return; }
    if (!current) return;
    if (mode === "role" && journey) journey.overview();
    else stage.go(current.camera);
    stage.highlight("");
  }

  function placeHotspots(points, w, h) {
    const used = [];
    const offsets = [
      [0, 0], [52, 0], [-52, 0], [0, 52], [0, -52],
      [52, 52], [-52, 52], [52, -52], [-52, -52],
      [104, 0], [-104, 0], [0, 104]
    ];

    return points.map(p => {
      if (!p || p.x < 0 || p.x > w || p.y < 0 || p.y > h || h < 130) {
        return null;
      }

      for (const [dx, dy] of offsets) {
        const q = {
          x: T.clamp(p.x + dx, 26, w - 26),
          y: T.clamp(p.y + dy, 76, h - 28)
        };

        if (used.every(a => Math.hypot(a.x - q.x, a.y - q.y) >= 49)) {
          used.push(q);
          return q;
        }
      }

      // 过密或镜头过近时仍可通过知识清单访问。
      return null;
    });
  }

  function positionHotspots() {
    if (!current || !stage?.ok) return;

    const raw = nodes.map(n => {
      const offset = stage.offset(n.h.group);
      return stage.project(n.h.pos.map((v, i) => v + offset[i]));
    });

    const positions = placeHotspots(raw, stage.width, stage.height);

    nodes.forEach((n, i) => {
      const p = positions[i];
      const anchor = raw[i];

      n.el.hidden = !p;
      n.line.style.display = p ? "" : "none";

      if (p) {
        n.el.style.left = p.x + "px";
        n.el.style.top = p.y + "px";

        [
          ["x1", anchor.x],
          ["y1", anchor.y],
          ["x2", p.x],
          ["y2", p.y]
        ].forEach(([k, v]) => n.line.setAttribute(k, v));
      }
    });
  }

  function error3d(message) {
    $("fallback").hidden = false;
    $("fallback-text").textContent = message;
    $("hotspots").hidden = true;
    $("scene-hint").textContent = "可继续阅读热点清单与完成小测验";

    if (stage && current) {
      stage.stopAnimation();
      renderCard();
    }
  }

  stage = new T.Stage($("canvas"), positionHotspots, error3d);

  function setPeriod(id) {
    if (journey) journey.dispose();
    if (evolution) evolution.dispose();
    journey = null;
    evolution = null;
    closeModal();
    clearTimeout(setPeriod.roleTimer);
    $("role-arrival").hidden = true;
    $("scene-status").textContent = "";
    if (id === "evolution") {
      current = null;
      mode = "evolution";
      selected = "";
      nodes = [];
      document.body.dataset.screen = "lab";
      document.body.dataset.mode = "evolution";
      document.documentElement.style.setProperty("--accent", periods[0].color);
      $("hotspots").innerHTML = "";
      $("hotspots").hidden = true;
      $("mode-tabs").innerHTML = "";
      $("progress-text").textContent = "EVOLUTION MODE";
      $("progress").max = 12;
      $("progress").value = 0;
      $("relation").hidden = true;
      $("scene-model-note").textContent = "剧场演化教学模型";
      $("scene-hint").textContent = "做出选择 · 观察空间怎样改变";
      evolution = new T.Evolution({
        stage,
        render: () => {
          if (!evolution) return;
          $("card").innerHTML = evolution.html();
          $("progress").value = Number(evolution.progressText().split(" /")[0]) || 0;
        },
        status: text => { $("scene-status").textContent = text; },
        heading: c => {
          $("scene-kicker").textContent = c.kicker;
          $("scene-title").textContent = c.title;
          $("scene-date").textContent = c.date;
        },
        toast
      });
      stage.invalidate();
      return;
    }

    const p = periods.find(x => x.id === id);

    if (!p) {
      current = null;
      nodes = [];
      $("hotspots").innerHTML = "";
      document.body.dataset.screen = "home";
      document.body.dataset.mode = "home";
      document.documentElement.style.setProperty("--accent", periods[0].color);

      stage.load(T.BUILDERS.greek());
      stage.show("relations", false);
      stage.show("anomaly", false);
      stage.show("player", false);
      stage.move("actor", [-.55, .75, -3.2], true);
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        stage.move("chorus" + i, [Math.cos(a) * 1.35, .13, Math.sin(a) * 1.35], true);
      }
      stage.go({ ...periods[0].camera, yaw: -.4, pitch: .72, distance: 28 }, true);
      updateProgress();
      return;
    }

    current = p;
    mode = "role";
    selected = "";

    runtime = {
      mission: 0,
      missionReady: false,
      quiz: 0,
      quizCorrect: false,
      feedback: "",
      station: 0,
      views: new Set(),
      microCorrect: false,
      inserted: false,
      read: new Set(),
      dimension: -1,
      relations: false
    };

    document.body.dataset.screen = "lab";
    document.body.dataset.mode = "role";
    document.documentElement.style.setProperty("--accent", p.color);

    $("scene-kicker").textContent =
      String(periods.indexOf(p) + 1).padStart(2, "0") +
      " / " + p.en.toUpperCase();

    $("scene-title").textContent = p.name;
    $("scene-date").textContent = p.date;
    $("scene-hint").textContent = stage.ok
      ? "单指旋转 · 双指缩放 · 点击编号探索"
      : "可使用右侧热点清单";

    $("scene-model-note").textContent =
      p.id === "elizabeth" ? "前侧剖切示意" : "教学示意模型";

    stage.load(T.BUILDERS[p.id]());
    stage.show("anomaly", false);
    stage.show("relations", false);
    stage.show("guides", false);
    stage.go(p.camera, true);


    $("relation").hidden = p.id !== "greek";
    $("relation").setAttribute("aria-pressed", "false");

    $("hotspots").innerHTML =
      '<svg class="hotspot-lines" aria-hidden="true">' +
      p.hotspots.map(() => '<line/>').join("") +
      '</svg>' +
      p.hotspots.map((h, i) =>
        button("hotspot", String(i + 1), h.id, "hotspot")
      ).join("");

    const lines = $("hotspots").querySelectorAll("line");

    nodes = [...$("hotspots").querySelectorAll("button")].map((el, i) => ({
      el,
      h: p.hotspots[i],
      line: lines[i]
    }));

    $("hotspots").hidden = true;
    journey = new T.Journey(p, {
      stage,
      render: renderCard,
      complete,
      mark: id => {
        const state = memory[p.id];
        if (p.hotspots.some(h => h.id === id) && !state.seen.includes(id)) {
          state.seen.push(id); save(); updateProgress();
        }
      },
      toast,
      status: text => { $("scene-status").textContent = text; },
      restart: () => setPeriod(p.id)
    });
    $("role-arrival").innerHTML = '<span>' + escape(p.journey.place) +
      '</span><strong>' + escape(p.journey.roleEn) + '</strong><p>你是' + escape(p.journey.role) + '</p>';
    $("role-arrival").hidden = false;
    setPeriod.roleTimer = setTimeout(() => { $("role-arrival").hidden = true; }, 1800);
    $("scene-hint").textContent = p.journey.aim;
    $("relation").hidden = true;
    renderTabs();
    renderCard();
    updateProgress();
    stage.invalidate();
  }

  function setMode(next) {
    if (!["role", "explore", "quiz"].includes(next)) next = "role";
    if (next === "quiz" && !current.quiz) next = "role";
    if (journey) journey.deactivate();
    mode = next;
    document.body.dataset.mode = next;
    selected = "";
    stage.highlight("");
    stage.show("relations", false);
    stage.show("anomaly", false);
    $("hotspots").hidden = mode !== "explore" || !stage.ok;
    $("relation").hidden = current.id !== "greek" || mode !== "explore";
    $("role-arrival").hidden = true;
    if (next === "role" && journey) journey.activate();
    else {
      stage.go(current.camera);
      $("scene-status").textContent = next === "quiz" ? "可选思考 · 完成角色体验后再来" : "点击编号 · 查看空间结构与历史资料";
    }
    if (next === "quiz") { runtime.quiz = 0; runtime.quizCorrect = false; runtime.feedback = ""; }
    renderTabs(); renderCard(); updateProgress();
    $("card").scrollTop = 0;
  }

  function renderTabs() {
    const tabs = [["role", "角色任务"], ["explore", "空间导览"]];
    $("mode-tabs").innerHTML = tabs.map(([id, label]) =>
      button("mode", label, id, id === mode ? "tab active" : "tab")
    ).join("");
    $("mode-tabs").querySelectorAll("button").forEach(b => {
      b.setAttribute("aria-pressed", b.dataset.value === mode ? "true" : "false");
    });
  }

  function lead(kicker, title, text) {
    return '<div class="eyebrow">' + escape(kicker) +
      '</div><h2>' + escape(title) +
      '</h2><p>' + escape(text) + '</p>';
  }

  function feedback() {
    return runtime.feedback
      ? '<div class="feedback" role="status">' +
        escape(runtime.feedback) + '</div>'
      : "";
  }

  function question(q, action, locked = false) {
    return '<h3>' + escape(q.q || q.question) +
      '</h3><div class="choices">' +
      q.choices.map((c, i) =>
        '<button type="button" data-action="' + action +
        '" data-value="' + i + '" ' +
        (locked ? "disabled" : "") + '>' +
        String.fromCharCode(65 + i) + ' · ' +
        escape(c) + '</button>'
      ).join("") + '</div>';
  }

  function hotspotsList() {
    return '<div class="hotspot-list">' +
      current.hotspots.map((h, i) => {
        const found = memory[current.id].seen.includes(h.id);

        return button(
          "hotspot",
          '<span class="list-number">' + (i + 1) +
          '</span><span>' + escape(h.name) +
          '</span><span class="list-status">' +
          (found ? "✓" : "＋") + '</span>',
          h.id,
          found ? "found" : ""
        );
      }).join("") +
      '</div>';
  }

  function renderCard() {
    if (!current) return;

    const p = current;
    const done = memory[p.id].done;
    let html = "";

    if (mode === "role" && journey) {
      $("card").innerHTML = journey.html();
      journey.sync();
      const route = $("route");
      if (route) route.disabled = journey.state.docking || journey.state.complete;
      return;
    }
    if (mode === "explore") {
      const h = p.hotspots.find(x => x.id === selected);

      html = h
        ? lead(h.en, h.name, h.text) +
          '<p class="callout">' + escape(h.tip) + '</p>'
        : lead(p.keyword, "点亮你的第一处发现", p.intro) +
          '<p class="muted">点模型编号或下方清单，镜头会自动聚焦。</p>';

      html += hotspotsList();

      html += '<details><summary>模型范围与年代</summary><p>' +
        escape(p.note) + '</p></details>';

      html += button(
        "mode",
        "回到角色任务 →",
        "role",
        "primary wide"
      );

    } else if (mode === "mission") {
      const q = p.missions[runtime.mission];

      html = lead(
        "MISSION " + (runtime.mission + 1) + "/" + p.missions.length,
        "为演出安排空间",
        q.question
      );

      html += '<p class="muted">在模型中选择对应编号，答对后该区域点亮。</p>' +
        feedback() + hotspotsList();

      if (runtime.missionReady) {
        html += button(
          "next-mission",
          runtime.mission === p.missions.length - 1
            ? "完成任务" : "下一个安排 →",
          "",
          "primary wide"
        );
      }

    } else if (mode === "quiz") {
      const q = p.quiz[runtime.quiz];

      html = lead(
        "QUICK CHECK " + (runtime.quiz + 1) + "/" + p.quiz.length,
        "带走一个空间判断",
        "根据刚才的观察选择答案。"
      );

      html += question(q, "quiz-answer", runtime.quizCorrect) + feedback();

      if (runtime.quizCorrect) {
        html += button(
          "next-quiz",
          runtime.quiz === p.quiz.length - 1 ? "完成小测验" : "下一题 →",
          "",
          "primary wide"
        );
      }

    } else if (mode === "anomaly") {
      html = lead(
        "TEMPORAL ANOMALY",
        "一块屏幕穿越到了这里",
        "把 LED 屏放进歌队区，观察实体遮挡，并逐项查看四种影响。"
      );

      html += button(
        "insert",
        runtime.inserted
          ? "已插入 LED 屏 · 再次点击移除"
          : "插入 LED 屏 →",
        "",
        "primary wide"
      );

      if (runtime.inserted) {
        html += '<div class="dimension-tabs">' +
          p.anomaly.map((a, i) =>
            button(
              "dimension",
              (runtime.read.has(i) ? "✓ " : "") + escape(a.name),
              i,
              runtime.dimension === i ? "active" : ""
            )
          ).join("") + '</div>';

        if (runtime.dimension >= 0) {
          html += '<div class="callout">' +
            escape(p.anomaly[runtime.dimension].text) +
            '</div>';
        }

        html += '<p class="muted">红线为被屏幕截断的视线示意。已观察 ' +
          runtime.read.size + '/4 项。</p>';

        html += '<button type="button" class="primary wide" ' +
          'data-action="repair" ' +
          (runtime.read.size < 4 ? "disabled" : "") +
          '>移除异常，恢复演出空间</button>';
      }

      html += feedback();

    } else if (mode === "micro") {
      html = lead(
        "TRY A DIFFERENT VIEW",
        p.micro.title,
        p.micro.text
      );

      let ready = false;

      if (p.id === "medieval") {
        html += '<div class="station-buttons">' +
          [0, 1, 2].map(i =>
            button(
              "station",
              (runtime.station > i ? "✓ " : "") + (i + 1) + " 号站",
              i,
              runtime.station === i ? "active" : ""
            )
          ).join("") + '</div>';

        html += '<p class="muted">已到站 ' +
          runtime.station + '/3 · 车辆沿街道移动</p>';

        ready = runtime.station === 3;

      } else {
        html += '<div class="view-buttons">' +
          p.views.map(v =>
            button(
              "view",
              (runtime.views.has(v.id) ? "✓ " : "") + escape(v.name),
              v.id,
              runtime.view === v.id ? "active" : ""
            )
          ).join("") + '</div>';

        html += button("overview", "返回模型总览", "", "wide");

        html += '<p class="muted">已体验 ' +
          runtime.views.size + "/" + p.views.length +
          ' 个视点</p>';

        ready = runtime.views.size === p.views.length;
      }

      if (ready) {
        html += question(p.micro, "micro-answer", runtime.microCorrect);
      }

      html += feedback();

      if (runtime.microCorrect) {
        html += '<p class="callout">' + escape(p.takeaway) + '</p>' +
          button("recap", "查看我的探索记录 →", "", "primary wide");
      }
    }

    if (done.includes(mode) || mode === "micro" && done.includes("micro")) {
      html += '<p class="completion">✓ 这项体验已完成，可重复尝试</p>';
    }

    html += '<div class="card-foot">' +
      button("sources", "史料与教师提示") +
      '</div>';

    const active = document.activeElement;
    const token = active?.dataset?.action;
    const val = active?.dataset?.value;
    const hadFocus = $("card").contains(active);

    $("card").innerHTML = html;

    if (hadFocus && token) {
      const match = [...$("card").querySelectorAll("button")].find(b =>
        b.dataset.action === token &&
        b.dataset.value === val &&
        !b.disabled
      );

      if (match) match.focus({ preventScroll: true });
    }
  }

  function discover(id) {
    const h = current.hotspots.find(x => x.id === id);
    if (!h) return;

    if (!["explore", "mission"].includes(mode)) {
      toast("切回“探索”可以查看这个热点。");
      return;
    }

    if (mode === "mission" && runtime.missionReady) return;

    selected = id;

    const offset = stage.offset(h.group);
    const target = h.pos.map((v, i) => v + offset[i]);

    if (mode === "mission") {
      const q = current.missions[runtime.mission];

      if (id !== q.target) {
        runtime.feedback = "再观察一下空间。" + q.question;
        renderCard();
        return;
      }

      runtime.missionReady = true;
      runtime.feedback = q.success;
    }

    const seen = memory[current.id].seen;

    if (!seen.includes(id)) {
      seen.push(id);
      save();
    }

    stage.highlight(h.group);
    stage.go({
      target,
      pitch: .72,
      yaw: current.camera.yaw,
      distance: 15
    });

    renderCard();
    updateProgress();
  }

  function openModal(title, html) {
    $("modal-title").textContent = title;
    $("modal-body").innerHTML = html;
    const modal = $("modal");
    if (modal.open) return;
    if (modal.showModal) modal.showModal();
    else { modal.setAttribute("open", ""); modal.classList.add("dialog-fallback"); }
    if (journey && mode === "role") stage.pause(true);
  }

  function closeModal() {
    const modal = $("modal");
    if (modal.open || modal.hasAttribute("open")) {
      if (modal.close) modal.close();
      else modal.removeAttribute("open");
    }
    if (journey && mode === "role") stage.pause(journey.state.paused);
  }

  function recap() {
    let html = '<p>探索记录保存在当前浏览器。</p>';

    html += periods.map(p =>
      '<div class="recap-row">' +
        '<span class="stamp ' + (finished(p) ? "earned" : "") + '">' +
          (finished(p) ? "✓" : "○") +
        '</span><div><h3>' + escape(p.name) +
        '</h3><p>' +
          memory[p.id].seen.length + "/" + p.hotspots.length + " 热点 · " +
          memory[p.id].done.length + "/" + p.tasks.length + " 体验" +
        '</p><small>' + escape(p.takeaway) +
        '</small></div>' +
      '</div>'
    ).join("");

    html += button("reset-dialog", "重新开始全部探索", "", "wide");
    openModal("我的时空护照", html);
  }

  const actions = {
    "evolution-start": () => location.hash = "evolution",
    start: () => location.hash = "greek",

    home: () => {
      location.hash = "home";
    },

    period: id => {
      if (location.hash === "#" + id) setPeriod(id);
      else location.hash = id;
    },

    mode: setMode,
    hotspot: discover,
    overview: () => overview(),
    zoom: value => stage.zoom(Number(value)),

    relation: () => {
      if (mode !== "explore") {
        toast("在“探索”模式可切换观演关系线。");
        return;
      }

      runtime.relations = !runtime.relations;
      stage.show("relations", runtime.relations);
      $("relation").setAttribute("aria-pressed", String(runtime.relations));

      toast(
        runtime.relations
          ? "绿色连线示意多个观看方向，未进行声学模拟。"
          : "已收起观演关系线"
      );
    },

    "next-mission": () => {
      if (!runtime.missionReady) return;

      if (runtime.mission < current.missions.length - 1) {
        runtime.mission++;
        runtime.missionReady = false;
        runtime.feedback = "";
        selected = "";
        overview();
        renderCard();
        updateProgress();
      } else {
        complete("mission");
        setMode("explore");
        toast("演出空间已安排好 · 可以继续小测验或时空异常");
      }
    },

    "quiz-answer": value => {
      if (runtime.quizCorrect) return;

      const q = current.quiz[runtime.quiz];
      runtime.quizCorrect = Number(value) === q.answer;
      runtime.feedback =
        (runtime.quizCorrect ? "回答正确。" : "再试一次。") + q.why;

      renderCard();
    },

    "next-quiz": () => {
      if (!runtime.quizCorrect) return;

      if (runtime.quiz < current.quiz.length - 1) {
        runtime.quiz++;
        runtime.quizCorrect = false;
        runtime.feedback = "";
        renderCard();
      } else {
        complete("quiz");
        setMode("explore");
      }
    },

    insert: () => {
      runtime.inserted = !runtime.inserted;
      stage.show("anomaly", runtime.inserted);
      stage.show("relations", false);
      overview();
      runtime.feedback = "";
      renderCard();
    },

    dimension: value => {
      runtime.dimension = Number(value);
      runtime.read.add(Number(value));
      renderCard();
    },

    repair: () => {
      if (runtime.read.size < 4 || !runtime.inserted) return;

      runtime.inserted = false;
      stage.show("anomaly", false);
      complete("anomaly");

      runtime.feedback =
        "空间已恢复。分析舞台设备时，把技术、位置、观看和历史条件放在一起。";

      renderCard();
    },

    station: value => {
      const i = Number(value);

      if (i !== runtime.station) {
        toast("先完成 " + Math.min(3, runtime.station + 1) + " 号站。");
        return;
      }

      stage.move("wagon", [[-3, 0, 3][i], 0, 0]);
      runtime.station++;
      runtime.feedback =
        "第 " + (i + 1) + " 站停演：同一段故事面对这里的观众。";

      renderCard();
    },

    view: id => {
      const v = current.views.find(x => x.id === id);
      if (!v) return;

      runtime.view = id;
      runtime.views.add(id);
      stage.view(v.eye, v.target);
      runtime.feedback = "";
      stage.highlight("");
      renderCard();
    },

    "micro-answer": value => {
      if (runtime.microCorrect) return;

      const ready = current.id === "medieval"
        ? runtime.station === 3
        : runtime.views.size === current.views.length;

      if (!ready) return;

      const q = current.micro;
      runtime.microCorrect = Number(value) === q.answer;
      runtime.feedback =
        (runtime.microCorrect ? "回答正确。" : "再试一次。") + q.why;

      if (runtime.microCorrect) complete("micro");
      renderCard();
    },

    recap,

    sources: () => {
      const list = current ? [current] : periods;
      let html =
        '<p>模型用于比较空间关系。年代、尺度、服饰与建筑细节均有教学简化。</p>';

      list.forEach(p => {
        html +=
          '<h3>' + escape(p.name) + '</h3>' +
          '<p>' + escape(p.note) + '</p>' +
          '<p class="callout">' + escape(p.transfer) + '</p>' +
          '<ul>' +
          p.sources.map(([name, url]) =>
            '<li><a href="' + escape(url) +
            '" target="_blank" rel="noopener noreferrer">' +
            escape(name) + '</a></li>'
          ).join("") +
          '</ul>';
      });

      openModal("史料与教师提示", html);
    },

    help: () => {
      if (evolution) {
        openModal(
          "怎样体验剧场演化",
          '<p>① 阅读角色提出的演出问题。<br>② 选择一种处理方案。<br>③ 观察3D空间如何变化，再进入下一问题。</p>' +
          '<p>这不是历史考试。选到效果有限的方案时，先观察“为什么问题仍然存在”，再重新选择。</p>' +
          '<p>主线依次经过古希腊、古罗马和中世纪，重点理解“表演活动 → 社会需求 → 观演关系 → 空间形态”。</p>'
        );
        return;
      }
      openModal(
        "怎样探索",
        '<p>① 选择下方时代，你会成为一位观众、巡演者、设计师或演员。<br>' +
        '② 按当前任务入场、推车、布置景片或转身。<br>' +
        '③ 切到“空间导览”可自由旋转并查看热点。</p>' +
        '<p>建议横屏。电脑可用鼠标拖动与滚轮；画布获得焦点后可用方向键旋转、加减键缩放。</p>' +
        '<p>四关快速体验约5分钟；细看全部热点可延长至约10分钟。演出可暂停，随时能返回首页。</p>' +
        button("sources", "查看史料与教师提示", "", "wide")
      );
    },

    share: () => {
      openModal(
        "分享课堂入口",
        '<p>部署后，将正式网页地址生成二维码，学生即可扫码访问。</p>' +
        '<input id="share-url" aria-label="网页地址" readonly value="' +
        escape(location.href) + '">' +
        '<p class="muted">' +
        (location.protocol === "file:"
          ? "当前是本地文件，请先完成静态部署。"
          : "请先在另一部手机确认这个地址可公开访问。") +
        '</p>' +
        button("copy", "复制地址", "", "primary wide")
      );
    },

    copy: async () => {
      const input = $("share-url");
      input.select();

      try {
        await navigator.clipboard.writeText(input.value);
        toast("地址已复制");
      } catch (e) {
        toast("地址已选中，可长按或按 Ctrl+C 复制。");
      }
    },

    fullscreen: async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else {
          toast("请旋转手机横屏，浏览器将使用可用显示区域。");
        }
      } catch (e) {
        toast("当前浏览器请直接使用横屏体验。");
      }
    },

    "reset-dialog": () => {
      openModal(
        "重新探索",
        "<p>清除当前浏览器中本项目的热点与任务记录？</p>" +
        button("reset", "清除并重新开始", "", "primary wide")
      );
    },

    reset: () => {
      memory = cleanMemory({});
      save();
      closeModal();
      location.hash = "home";
      setPeriod("home");
      toast("探索记录已重置");
    },

    close: closeModal
  };

  document.addEventListener("click", e => {
    const b = e.target.closest("button[data-action]");
    if (!b || b.disabled) return;

    if (!stage.ok && ["insert", "repair", "station", "view"].includes(b.dataset.action)) {
      toast("当前空间互动需要恢复 3D 显示。");
      return;
    }

    if (b.dataset.action.startsWith("evolution-") && evolution) {
      evolution.action(b.dataset.action.slice(10), b.dataset.value);
      return;
    }
    if (b.dataset.action.startsWith("journey-") && journey) {
      journey.action(b.dataset.action.slice(8), b.dataset.value);
      return;
    }
    const fn = actions[b.dataset.action];
    if (fn) fn(b.dataset.value);
  });

  document.addEventListener("input", e => {
    if (journey && e.target.matches("input[data-control]")) {
      journey.input(e.target.dataset.control, Number(e.target.value));
    }
  });

  $("modal").addEventListener("close", () => {
    if (journey && mode === "role") stage.pause(journey.state.paused);
  });

  $("modal").addEventListener("click", e => {
    if (e.target === $("modal")) closeModal();
  });

  window.addEventListener("hashchange", () => {
    setPeriod(location.hash.slice(1));
  });

  setPeriod(location.hash.slice(1));

  T.cleanMemory = cleanMemory;
  T.placeHotspots = placeHotspots;
  // 只读状态快照供自动检查和教师诊断，不暴露控制入口。
  T.inspect = () => ({ version: "3.0", period: evolution ? "evolution" : (current?.id || "home"), mode,
    webgl: stage.ok, frame: stage.frame, stats: stage.stats,
    camera: JSON.parse(JSON.stringify(stage.cam)),
    evolution: evolution ? { chapter: evolution.chapter, step: evolution.step, busy: evolution.busy, finished: evolution.finished } : null,
    journey: journey ? JSON.parse(JSON.stringify(journey.state)) : null,
    progress: JSON.parse(JSON.stringify(memory)),
    animation: stage.animation ? { elapsed: stage.animation.elapsed, duration: stage.animation.duration, paused: stage.paused } : null });
  window.TTM_READY = true;
  const warning = $("boot-warning");
  if (warning) warning.hidden = true;
})(window.TTM);
