/* 连续场景几何与状态快照。复用 V2 的 Mesh、植被、景屋及演出车。 */
(function (T) {
  "use strict";
  const PI = Math.PI, CX = 26;
  const clone = value => JSON.parse(JSON.stringify(value));
  const blend = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const ease = t => { t = T.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const palette = { stone: "#dfd6c2", wood: "#ae8860", pale: "#eadfbe", green: "#869487", dark: "#46514e", brick: "#a8755f" };

  function importParts(m, source, id, destination) {
    Object.entries(source.parts).forEach(([key, data]) => {
      if (key === id || key.startsWith(id + "~")) m.parts[destination + key.slice(id.length)] = [...data];
    });
  }

  function arch(m, x, z, angle, height = 2.3, width = 1.15) {
    const radius = width / 2, outer = radius + .22, spring = height - outer;
    const p = (xx, y, zz) => [x + xx * Math.cos(angle) + zz * Math.sin(angle), y, z - xx * Math.sin(angle) + zz * Math.cos(angle)];
    [-1, 1].forEach(sign => {
      const v = p(sign * (radius + .11), 0, 0);
      m.box(...v, .22, spring, .45, palette.stone, angle);
    });
    for (let j = 0; j < 10; j++) {
      const a = j * PI / 10, b = (j + 1) * PI / 10;
      const q = (r, t, side) => p(Math.cos(t) * r, spring + Math.sin(t) * r, side);
      [-.225, .225].forEach(side => m.quad(q(radius, a, side), q(outer, a, side), q(outer, b, side), q(radius, b, side), j % 2 ? palette.stone : "#c5bda9"));
      m.quad(q(radius, a, -.225), q(radius, b, -.225), q(radius, b, .225), q(radius, a, .225), "#aaa18d");
      m.quad(q(outer, a, .225), q(outer, b, .225), q(outer, b, -.225), q(outer, a, -.225), palette.stone);
    }
  }

  function build() {
    const m = new T.Mesh(), greek = T.BUILDERS.greek(), medieval = T.BUILDERS.medieval();
    importParts(m, greek, "base", "earth");
    importParts(m, greek, "landscape", "trees");
    importParts(m, greek, "orchestra", "dancefloor");
    importParts(m, greek, "parodos", "passages");
    importParts(m, greek, "skene", "stonehouse");
    m.use("altar").cylinder(0, .02, 0, .37, .58, "#e1d0ab", 8);
    m.box(0, .57, 0, .92, .13, .76, "#f0dec0");
    m.use("hill");
    const point = (r, a, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
    for (let j = 0; j < 36; j++) {
      const a = -.08 + j * (PI + .16) / 36, b = -.08 + (j + 1) * (PI + .16) / 36;
      m.quad(point(3.25, a, .03), point(3.25, b, .03), point(7.8, b, 2.98), point(7.8, a, 2.98), j % 3 ? "#9a997c" : "#a5a082");
      m.quad(point(7.8, a, 0), point(7.8, a, 2.98), point(7.8, b, 2.98), point(7.8, b, 0), "#9a8a70");
    }
    for (let row = 0; row < 10; row++) {
      ["wood", "stone"].forEach(material => {
        m.use(material + "seat" + row);
        for (let wedge = 0; wedge < 6; wedge++) {
          const a = -.08 + wedge * (PI + .16) / 6;
          m.band(0, 0, 3.4 + row * .44, 3.81 + row * .44, .11 + row * .31, .16, a + .024, a + (PI + .16) / 6 - .024,
            material === "wood" ? (row % 2 ? "#b89570" : palette.wood) : (row % 2 ? "#e9deca" : palette.stone), 5);
        }
      });
    }
    m.use("woodposts");
    [-2.8, -1, 1, 2.8].forEach(x => m.box(x, 0, -4.8, .18, 2.3, .18, palette.wood));
    m.use("woodwalls");
    m.box(0, 0, -5.25, 5.8, 2.2, .18, "#876b50");
    [-2.8, 2.8].forEach(x => m.box(x, 0, -4.65, .18, 2.2, 1.25, palette.wood));
    [-1.9, 1.9].forEach(x => m.box(x, 0, -4, 1.85, 2.2, .16, "#b4926c"));
    m.box(0, 1.7, -4, 1.92, .5, .16, "#b4926c");
    m.use("woodroof").roof(0, 2.2, -4.7, 6.15, .7, 1.9, "#877358");
    m.use("threshold").box(0, .02, -3.96, 1.8, .12, .65, "#bba180");
    m.use("actingfloor").box(0, .06, -3.1, 6.3, .10, 1.4, "#cfb18b");
    m.band(0, -3.1, .38, .43, .175, .014, 0, 2 * PI, "#e7d6ad", 20);
    m.use("canvaswall").box(0, 0, -3.9, 4.5, 2.5, .08, "#9d5e4c");
    m.use("lowwall").box(0, 0, -4.1, 6.7, 1.2, .24, "#ccc2a9");
    m.use("temporary");
    [-4.7, -2.3, 0, 2.3, 4.7].forEach(x => {
      m.box(x, 0, 4.7, .15, 3.1, .15, palette.wood);
      m.line([x - .55, 0, 4.7], [x + .55, 2.9, 4.7], palette.wood, .08);
    });
    m.box(0, 3.1, 4.7, 10, .16, 1.2, palette.wood);
    for (let group = 0; group < 4; group++) {
      m.use("arches" + group);
      for (let i = 0; i < 4; i++) {
        const a = .08 + (group * 4 + i) * (PI - .16) / 15;
        arch(m, Math.cos(a) * 6.45, Math.sin(a) * 6.45, PI / 2 - a, 2.55, 1.0);
      }
    }
    m.use("romanbase");
    m.band(0, 0, 6.04, 7.27, 2.55, .18, -.02, PI + .02, "#d0c5ae", 44);
    m.band(0, 0, 3.12, 3.37, 0, .25, -.12, PI + .12, "#e8ddc7", 40);
    for (let tier = 0; tier < 3; tier++) {
      m.use("facade" + tier);
      const y = tier * 1.64;
      m.box(0, y, -5.22, 7.3, 1.65, .50, "#bca78c");
      [-2.4, 0, 2.4].forEach(x => {
        m.box(x, y + .08, -4.91, .8, 1.19, .055, "#4e5149");
        if (tier) {
          m.cylinder(x, y + .10, -4.73, .10, .57, "#ddd2b9", 6);
          m.sphere(x, y + .8, -4.73, .1, .15, .1, "#ddd2b9", 6);
        }
      });
      [-3.4, -1.5, 1.5, 3.4].forEach(x => {
        m.cylinder(x, y + .08, -4.67, .13, 1.4, palette.pale, 10);
        m.box(x, y + 1.46, -4.67, .40, .14, .4, palette.pale);
        m.box(x, y, -4.67, .42, .17, .42, palette.stone);
      });
      m.box(0, y + 1.61, -4.92, 7.7, .19, 1.05, palette.pale);
    }
    m.use("arena").cylinder(0, .02, 0, 3.9, .11, "#cbac7b", 60);
    m.band(0, 0, 3.7, 3.95, .1, .4, 0, 2 * PI, "#c9b99c", 64);
    for (let layer = 0; layer < 3; layer++) {
      m.use("ring" + layer);
      for (let row = layer * 3; row < layer * 3 + 3; row++)
        m.band(0, 0, 4 + row * .47, 4.43 + row * .47, .14 + row * .32, .22, 0, PI * 2, row % 2 ? "#dac8aa" : "#e6d9bf", 64);
    }
    m.use("rubble");
    for (let i = 0; i < 17; i++) {
      const a = i * 2.4, r = 2 + i % 4 * 1.3;
      m.box(Math.cos(a) * r, 0, Math.sin(a) * r, .6 + i % 3 * .2, .22 + i % 2 * .16, .42, "#85847b", a);
    }
    m.use("cityground");
    m.cylinder(CX, -.55, 0, 10.6, .55, "#8b8d7b", 64);
    m.band(CX, 0, 10.48, 10.6, .01, .035, 0, PI * 2, "#bec2a6", 64);
    m.use("churchground");
    m.cylinder(CX, -.55, -3.5, 5.6, .55, "#919682", 48);
    m.band(CX,-3.5,5.48,5.6,.01,.035,0,2*PI,"#b9bfa4",48);
    m.use("road");
    for (let x = -9; x <= 9; x++) for (let z = 0; z < 5; z++)
      m.box(CX + x, .012, z, .96, .04, .96, (x + z) % 2 ? "#aaab94" : "#b7b39a");
    m.use("churchfloor").box(CX, .03, -3.8, 6.5, .12, 5.8, "#b6b7a2");
    m.use("churchwalls");
    m.box(CX, .1, -6.7, 6.6, 3.8, .28, "#9a9d8d");
    [-3.2, 3.2].forEach(s => m.box(CX + s, .1, -3.8, .28, 3.7, 5.8, "#adae9c"));
    [-2.55, 2.55].forEach(s => m.box(CX + s, .1, -.85, 1.32, 2.7, .25, "#b8b9a5"));
    [-2, 2].forEach(s => m.cylinder(CX + s, .16, -4.8, .22, 3.4, "#d4d1b9", 8));
    m.box(CX, 1.5, -6.48, .12, 1.4, .10, "#d5c89e");
    m.box(CX, 2.3, -6.48, .85, .12, .10, "#d5c89e");
    m.use("churchroof").roof(CX, 3.8, -5.6, 7.1, 1.2, 2.5, "#596969");
    m.use("belltower").box(CX - 3.9, 0, -5.5, 1.45, 5.8, 1.6, "#979c8e");
    m.roof(CX - 3.9, 5.8, -5.5, 1.65, 1, 1.8, "#4f6261");
    m.box(CX - 3.9, 4.6, -4.68, .6, .83, .05, "#435450");
    m.use("tomb").box(CX, .16, -4.75, 1.5, .7, .75, "#d6cfb6");
    m.box(CX, .85, -4.75, 1.7, .15, .95, "#e4dbc0");
    m.use("book").box(CX, .3, -2.3, .40, .70, .35, "#8c6950");
    m.box(CX, .99, -2.3, .7, .08, .45, "#ede0b6");
    m.use("pictures");
    [-1.5, 1.5].forEach(x => {
      m.box(CX + x, .4, -3.5, 1.2, 1.6, .10, "#b39165");
      m.box(CX + x, .65, -3.43, .85, 1, .04, "#789d9b");
    });
    for (let i = 0; i < 3; i++) {
      m.use("mansion" + i);
      const x = CX - 2.15 + i * 2.15;
      m.box(x, .12, -2.8, 1.6, .15, 1.4, palette.wood);
      m.box(x, .27, -3.35, 1.6, 1.48, .12, ["#b9c8bd", "#c5b18c", "#885e53"][i]);
      [-.7, .7].forEach(s => m.box(x + s, .27, -2.8, .15, 1.8, .15, palette.wood));
      m.roof(x, 1.8, -2.95, 1.8, .48, 1.3, ["#739b9b", "#c4a178", "#5c5d54"][i]);
      if (i === 2) m.box(x, .27, -3.20, .95, 1.05, .08, "#493b35");
      if (i === 0) m.sphere(x, 1, -3.18, .42, .42, .03, "#e1d4ad", 8);
      if (i === 1) [-.43, 0, .43].forEach(dx => m.box(x + dx, 1.7, -3.32, .23, .5, .20, "#ded0af"));
    }
    const houses = [[-7,-4,2.4,2.5], [6,-4.4,2.5,3], [8,-1.5,2,2.1], [-8.2,0,2.1,2.3], [-6.8,6.1,2.2,2.2], [6.8,6.1,2.5,3], [1.9,7.9,2.1,2.2], [-2,7.9,2,2.4]];
    houses.forEach(([x,z,w,h], i) => {
      m.use("house" + i);
      m.box(CX + x, 0, z, w, h, 1.9, i % 2 ? "#c4bba0" : "#b1b0a0");
      m.roof(CX + x, h, z, w + .18, .9, 2.15, i % 2 ? "#7e6856" : "#687b74");
      [-.65, .65].forEach(dx => m.box(CX + x + dx, 0, z + .99, .1, h, .06, "#655b4b"));
      m.box(CX + x, 1.2, z + .99, w, .13, .06, "#746753");
      m.box(CX + x, .03, z + 1, .5, 1.0, .07, "#55594b");
    });
    ["wagon", "wagon-flap", "wagon-cast"].forEach(id => importParts(m, medieval, id, id));
    for (let i = 0; i < 3; i++) {
      m.use("stop" + i);
      m.band(CX - 5 + 5 * i, 2, 1.25, 1.33, .07, .035, 0, 2 * PI, "#9fdec7", 40);
      m.cylinder(CX - 5 + 5 * i - 1.6, .05, 1.8, .06, 1.45, palette.wood, 6);
      m.box(CX - 5 + 5 * i - 1.3, 1.03, 1.8, .6, .4, .04, "#7fae9b");
    }
    const people = [
      ...Array.from({ length: 6 }, (_, i) => ["chorus" + i, "#ad745d", .96]),
      ...Array.from({ length: 24 }, (_, i) => ["viewer" + i, i % 3 ? "#738880" : "#b0ac93", .90]),
      ["actor", "#b8765e", 1.15], ["maker", "#8fdacb", 1.10],
      ...Array.from({ length: 4 }, (_, i) => ["cleric" + i, i % 2 ? "#c2bda5" : "#8b7470", 1.05])
    ];
    people.forEach(([id, color, scale]) => m.use(id).person(0, 0, 0, color, scale));
    if (T.extendStoryMesh) T.extendStoryMesh(m);
    return m;
  }

  class World {
    constructor(stage) {
      this.stage = stage;
      this.mesh = build();
      this.ids = Object.keys(this.mesh.parts).filter(id => !id.includes("~"));
      this.stage.load(this.mesh);
      this.current = this.snapshot(0);
      this.apply(this.current);
    }
    snapshot(index, stop = -1) {
      const s = {};
      this.ids.forEach(id => { s[id] = { visible: false, position: [0,0,0], scale: [1,1,1], tint: [1,1,1], opacity: 1, angle: 0, tilt: 0, pivot: [0,0,0] }; });
      s["wagon-flap"].pivot = [0,.72,1.29];
      s["wagon-flap"].tilt = -PI/2;
      const show = (...ids) => ids.forEach(id => { s[id].visible = true; });
      const put = (id, pos, angle = 0) => { show(id); s[id].position = pos; s[id].angle = angle; };
      show("earth", "trees");
      if (index <= 7) {
        show("altar", "maker");
        put("maker", [-4.5, 0, -2.4], -.9);
        if (index >= 1) show("dancefloor");
        if (index >= 2) {
          if (index < 6) show("hill");
          for (let i = 0; i < 10; i++) show((index < 5 ? "wood" : "stone") + "seat" + i);
        }
        if (index >= 3 && index < 5) show("woodposts", "woodwalls", "woodroof", "threshold");
        if (index >= 4) show("actingfloor");
        if (index >= 5) show("passages");
        if (index >= 5 && index < 7) show("stonehouse");
        if (index >= 6) show("romanbase", "arches0", "arches1", "arches2", "arches3");
        if (index === 7) show("facade0", "facade1", "facade2");
        for (let i = 0; i < 6; i++) {
          const a = i * PI / 3;
          put("chorus" + i, index ? [Math.cos(a) * 1.55, .13, Math.sin(a) * 1.55] : [-1.6 + (i % 3) * .9, 0, -.5 + Math.floor(i / 3) * 1.1], -a - PI / 2);
        }
        put("actor", index >= 4 ? [0, .18, -3.1] : [-1, index >= 1 ? .13 : 0, -1.9]);
        for (let i = 0; i < 24; i++) {
          if (index === 0 && i > 7) continue;
          if (index === 1 && i > 14) continue;
          const a = .18 + (i % 8) / 7 * (PI - .36), row = 1 + Math.floor(i / 8) * 3, r = index >= 2 ? 3.5 + row * .44 : 3 + Math.floor(i / 8) * .57;
          put("viewer" + i, [Math.cos(a) * r, index >= 2 ? .27 + row * .31 : 0, Math.sin(a) * r], -a - PI / 2);
        }
      } else if (index === 8) {
        show("arena", "ring0", "ring1", "ring2");
        ["arena", "ring0", "ring1", "ring2"].forEach(id => s[id].scale = [1.10, 1, .84]);
        put("actor", [-1.1, .13, .25]); put("maker", [1.1, .13, -.25], PI);
        for (let i = 0; i < 24; i++) {
          const a = i * PI / 12, row = i % 3 + 4, r = 4.2 + row * .47;
          put("viewer" + i, [Math.cos(a) * r * 1.10, .36 + row * .32, Math.sin(a) * r * .84], -a - PI / 2);
        }
      } else {
        show("rubble", "romanbase", "facade0", "churchfloor", "churchwalls", "churchroof", "belltower", index < 12 ? "churchground" : "cityground", "tomb");
        ["earth", "trees", "romanbase", "facade0"].forEach(id => { s[id].tint = [.62,.67,.65]; s[id].scale = [1, .7, 1]; });
        for (let i = 0; i < 5; i++) { show("stoneseat" + i); s["stoneseat" + i].tint = [.67,.7,.65]; }
        put("maker", [CX - 2.5, .15, -1.5], -.8);
        for (let i = 0; i < 4; i++) put("cleric" + i, [CX - 1.4 + i * .8, .15, index >= 10 ? -3.8 + i % 2 * .8 : -1.7], PI);
        if (index >= 11 && index < 14) {
          show("mansion0", "mansion1", "mansion2"); s.tomb.visible = false;
          for(let i=0;i<4;i++) put("cleric"+i,[CX-2.2+i*1.4,.15,-1.7],0);
        }
        for (let i = 0; i < (index >= 12 ? 24 : 8); i++) {
          const side = i % 2 ? 1 : -1;
          const position = index < 12 ? [CX + side * (1.15 + i % 3 * .55), .15, -.9 + Math.floor(i / 4) * .4]
            : [CX - 6.7 + i % 8 * 1.9, .07, 4.6 + Math.floor(i / 8) * .7];
          put("viewer" + i, position, PI);
        }
        if (index >= 12) {
          show("road");
          for (let i = 0; i < (index >= 13 ? 8 : 4); i++) show("house" + i);
          for (let i = 0; i < 3; i++) s["mansion" + i].position = [0, 0, 4];
          for (let i = 0; i < 4; i++) put("cleric" + i, [CX - 1.4 + i * .8, .1, 2.1 + i % 2 * .4]);
          put("maker", [CX - 3.5, .07, 1.7]);
        }
        if (index >= 14) {
          show("wagon", "stop0", "stop1", "stop2");
          const x = stop >= 0 ? T.STORY.stations[stop].x : CX - 8;
          ["wagon", "wagon-flap", "wagon-cast"].forEach(id => s[id].position = [x, .07, 1]);
          for (let i = 0; i < 4; i++) s["cleric" + i].visible = false;
          for (let i = 0; i < 24; i++) {
            const station = Math.floor(i / 8), j = i % 8;
            put("viewer" + i, [CX - 5 + station * 5 + (j % 4 - 1.5) * .53, .07, 5 + Math.floor(j / 4) * .65], PI);
          }
        }
      }
      return s;
    }
    apply(snapshot) {
      this.ids.forEach(id => {
        const p = snapshot[id];
        this.stage.show(id, p.visible);
        this.stage.move(id, p.position, true);
        this.stage.rotate(id, p.angle, p.pivot || [0,0,0], true);
        this.stage.appearance(id, p);
      });
      this.current = clone(snapshot);
    }
    transition(target, duration, done, clip) {
      const from = clone(this.current), to = clone(target), ids = this.ids;
      const changed = ids.filter(id => to[id].visible && !from[id].visible);
      const changeOrder = id => Math.max(0, changed.indexOf(id)) / Math.max(1, changed.length - 1);
      this.stage.controlsEnabled = false;
      this.stage.animate(this.stage.reduced ? 260 : duration, t => {
        const frame = {};
        ids.forEach(id => {
          const a = from[id], b = to[id], appeared = b.visible && !a.visible;
          const k = ease(appeared ? (t - changeOrder(id) * .28) / .72 : t);
          const opacity = appeared ? k : (!b.visible && a.visible ? 1 - ease(t) : b.opacity);
          frame[id] = { visible: a.visible || b.visible, opacity,
            position: blend(a.position, b.position, ease(t)),
            scale: appeared ? [b.scale[0], Math.max(.015, k * b.scale[1]), b.scale[2]] : blend(a.scale, b.scale, ease(t)),
            tint: blend(a.tint, b.tint, ease(t)), angle: a.angle + Math.atan2(Math.sin(b.angle-a.angle), Math.cos(b.angle-a.angle)) * ease(t),
            tilt: a.tilt + (b.tilt-a.tilt)*ease(t), pivot: blend(a.pivot,b.pivot,ease(t)) };
          if(id==="wagon-flap")frame[id].scale=[1,1,1];
          // 新人物直接在落点淡入；避免从世界原点飞来。
          if (appeared && /^(viewer|cleric|chorus)/.test(id)) { frame[id].position = [...b.position]; frame[id].scale = b.scale; }
        });
        if (clip) clip(frame, t);
        this.apply(frame);
      }, () => {
        this.apply(to); this.stage.controlsEnabled = true; if (done) done();
      });
    }
    alternative(effect, index) {
      const s = clone(this.current), put = (id, pos) => { s[id].visible = true; s[id].position = pos; };
      if (effect === "line" || effect === "mix" || effect === "overlap") {
        for (let i = 0; i < 6; i++) put("chorus" + i, effect === "line" ? [-3 + i * 1.2, .14, .1] : [Math.cos(i) * .65, .14, Math.sin(i) * .65]);
        if (effect === "mix") for (let i = 0; i < 6; i++) put("viewer" + i, [Math.cos(i+.3) * 1.2, .14, Math.sin(i+.3) * 1.2]);
        if (effect === "overlap") put("actor", [0, .14, 0]);
      }
      if (["crowded", "far", "flat", "camp", "half"].includes(effect)) for (let i = 0; i < 24; i++) {
        const a = .24 + (i % 8) / 7 * (PI-.48), r = effect === "far" ? 6.1 + Math.floor(i/8)*.6 : 3.2 + Math.floor(i/8)*.35;
        put("viewer" + i, [Math.cos(a)*r, .14, Math.sin(a)*r]);
      }
      if (effect === "camp") ["woodposts", "woodwalls", "woodroof"].forEach(id => s[id].position = [3, 0, -.7]);
      if (["screen", "cloth", "frontal"].includes(effect)) { s.canvaswall.visible = true; if (effect === "frontal") s.canvaswall.position = [0,0,4]; }
      if (effect === "openchange") { put("actor", [0,.14,0]); s.actor.tint = [.55,1.1,1.25]; }
      if (effect === "separate") put("actor", [6.5,0,-1.7]);
      if (effect === "repair") { s.woodroof.scale = [1,.35,1]; s.woodseat6.position = [0,-.3,.25]; }
      if (effect === "timber") s.temporary.visible = true;
      if (effect === "lowwall") s.lowwall.visible = true;
      if (effect === "read") { s.book.visible = true; put("cleric0", [CX,.15,-2.7]); }
      if (effect === "pictures") s.pictures.visible = true;
      if (effect === "switch") { s.mansion1.visible = true; s.mansion1.position = [0,0,1]; put("cleric0", [CX-1.4,.15,-1.2]); }
      if (effect === "disperse") {
        for (let i=0;i<3;i++) { s["mansion"+i].visible = true; s["mansion"+i].position = [(i-1)*3,0,0]; }
        put("cleric0", [CX-5,.15,-2]);
      }
      if (effect === "limit") for (let i=0;i<8;i++) put("viewer"+i, [CX-3+i*.75,.07,3.5]);
      if (effect === "indoors") for (let i=0;i<3;i++) s["mansion"+i].position = [0,0,2.7];
      if (effect === "carry") { s.mansion0.position = [-3,.25,5]; s.mansion2.position = [3,.25,5]; put("cleric0", [CX-5,.1,2.4]); }
      if (effect === "wait") for (let i=0;i<16;i++) put("viewer"+i, [CX+(i<8?-7:7),.07,(i%8)*.5]);
      return s;
    }
    costume(done) {
      const base = clone(this.current), target = clone(base);
      target.actor.tint = [.62,1.05,1.15];
      target.actor.position = [0,.18,-3.1];
      this.transition(target, 1900, done, (f,t) => {
        const a = ease(t < .52 ? t/.52 : (t-.52)/.48);
        f.actor.position = t < .52 ? blend(base.actor.position,[0,.14,-4.7],a) : blend([0,.14,-4.7],[0,.18,-3.1],a);
        f.actor.opacity = t > .38 && t < .65 ? .05 : 1;
        f.actor.tint = t > .52 ? target.actor.tint : base.actor.tint;
      });
    }
    performance(done, kind = "gesture") {
      const base = clone(this.current);
      this.stage.controlsEnabled = false;
      this.stage.animate(this.stage.reduced ? 400 : 2000, t => {
        const f = clone(base);
        for (let i=0;i<4;i++) if (f["cleric"+i].visible) {
          f["cleric"+i].position[0] += Math.sin(t*PI*2+i)*.5;
          f["cleric"+i].angle = Math.sin(t*PI*2)*.7;
        }
        if(kind === "places") {
          f.cleric0.position = [CX-2.15 + ease(t)*4.3, .15, -1.65];
          f.cleric0.angle = PI/2;
        }
        if (f["wagon-cast"].visible) f["wagon-cast"].position[0] += Math.sin(t*PI*2)*.17;
        this.apply(f);
      },()=>{this.apply(base);this.stage.controlsEnabled=true;done?.();});
    }
  }
  T.StoryWorld = World;
  T.storyEase = ease;
})(window.TTM);
