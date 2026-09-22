/* 场景几何集中在这里；坐标单位是教学模型单位。 */
(function (T) {
  "use strict";

  const PI = Math.PI;

  function base(m, color, r = 8) {
    m.use("base");
    m.cylinder(0, -.7, 0, r + .22, .22, "#101b20", 64);
    m.cylinder(0, -.48, 0, r, .48, color, 64);
    m.band(0, 0, r - .10, r, .005, .04, 0, 2 * PI, "#bbbcaa", 64);
  }

  const PALETTE = {
    stone: "#ded7c5", earth: "#b8a586", wood: "#a98865",
    dark: "#4c4841", actor: "#b76e55", crowd: "#738078", accent: "#8edacb"
  };

  function olive(m, x, z, scale = 1) {
    m.use("landscape");
    m.shadow(x, .02, z, .8 * scale, .7 * scale);
    m.cylinder(x, 0, z, .07 * scale, .85 * scale, "#776850", 7);
    m.sphere(x, 1.05 * scale, z, .65 * scale, .5 * scale, .6 * scale, "#788779", 7);
    m.sphere(x + .24 * scale, 1.35 * scale, z, .42 * scale, .32 * scale, .4 * scale, "#929a7a", 7);
  }

  function greek() {
    const m = new T.Mesh();
    base(m, PALETTE.earth, 8);

    m.use("terrain");
    m.box(0, -.06, -6.6, 11, .12, 1.5, "#7c9697");
    [-4, -1.5, 1, 3.5].forEach((x, i) => {
      m.roof(x, .02, -6.6, 3.1, .5 + i % 2 * .5, 1.5, "#819596");
    });
    [[-6.6, 1.3, .8], [6.7, 1, 1], [-5.9, -4.1, .7], [5.9, -4.5, .9]].forEach(v => olive(m, ...v));
    m.use("terrain");
    m.band(0, 0, 6.9, 7.3, .02, 2.48, -.1, PI + .1, "#a99c83", 48);
    m.shadow(0, .015, -4.4, 5, 1.5);

    m.use("theatron");

    for (let row = 0; row < 11; row++) {
      const ri = 3.2 + row * .37;
      const ro = ri + .35;

      for (let wedge = 0; wedge < 8; wedge++) {
        const a = -.12 + wedge * (PI + .24) / 8;

        m.band(
          0, 0, ri, ro,
          .03, .19 + row * .23,
          a + .025,
          a + (PI + .24) / 8 - .025,
          row % 2 ? "#e4ddca" : "#dcd4bf",
          5
        );
      }
    }

    m.use("orchestra");
    m.cylinder(0, .02, 0, 2.92, .09, "#d8b879", 56);
    m.band(0, 0, 2.78, 2.9, .12, .025, 0, 2 * PI, "#eae2c9", 56);

    // 角色与歌队独立分组，保留建筑热点分组。
    for (let i = 0; i < 6; i++) {
      m.use("chorus" + i);
      m.person(0, 0, 0, "#ac715b", .95);
    }
    m.use("player");
    m.person(0, 0, 0, PALETTE.accent, 1.15);
    m.band(0, 0, .27, .33, .02, .025, 0, PI * 2, PALETTE.accent, 20);
    m.use("actor");
    m.person(0, 0, 0, PALETTE.actor, 1.25);

    m.use("proskenion");
    m.box(0, .05, -3.25, 6.5, .7, 1.08, "#ded1b3");

    for (let i = -3; i <= 3; i++) {
      m.box(i, .14, -2.67, .15, .5, .13, "#f4ebd8");
    }



    m.use("skene");
    m.box(0, 0, -4.6, 7, 2.65, 1.15, "#bfb599");
    m.box(0, 2.48, -4.6, 7.3, .16, 1.42, "#e9dfc8");
    m.box(0, 2.67, -4.6, 7.65, .13, 1.6, "#b9a586");
    m.roof(0, 2.8, -4.6, 7.7, .43, 1.65, "#c2af8b");
    [-3.25, -1.05, 1.05, 3.25].forEach(x => {
      m.box(x, .04, -3.94, .23, 2.45, .28, PALETTE.stone);
      m.box(x, 2.27, -3.94, .38, .16, .34, "#f1e6d0");
      m.box(x, .04, -3.94, .4, .16, .36, "#d0c5ae");
    });

    [-2.1, 0, 2.1].forEach(x => {
      m.box(x, .08, -3.99, .78, 1.65, .08, "#3b4948");

      [-.48, .48].forEach(d => {
        m.cylinder(x + d, 0, -3.87, .1, 2.45, "#f0e7d2");
      });
    });

    m.use("parodos");

    [-1, 1].forEach(s => {
      m.box(s * 4.7, .025, -2.35, 2.6, .07, .72, "#c8b17f", s * .24);
      m.line(
        [s * 3.5, .13, -2.25],
        [s * 5.8, .13, -2.85],
        "#f6ead2", .045
      );
    });

    m.use("people");

    for (let i = 0; i < 24; i++) {
      const row = i % 3 * 3 + 2;
      const a = .10 + (i / 24) * (PI - .20);
      const r = 3.2 + row * .37;

      m.person(
        Math.cos(a) * r,
        .23 + row * .23,
        Math.sin(a) * r,
        PALETTE.crowd,
        .85, Math.atan2(-Math.cos(a), -Math.sin(a))
      );
    }

    m.use("relations");

    [-4, 0, 4].forEach(x => {
      m.line([x, 2.7, 4.8], [0, 1.3, -3.15], "#66cfb5", .04);
    });

    m.use("anomaly");
    // 现代镜框与实体侧翼进入歌队区：有真实遮挡，并保留中央开口。
    [-1, 1].forEach(sign => {
      m.box(sign * 2.25, .12, .65, 1.35, 3.55, .32, "#313e43");
      m.box(sign * 1.62, .12, .85, .09, 3.4, .055, "#c29273");
      m.shadow(sign * 2.2, .125, .65, 1, .6);
    });
    m.box(0, 3.36, .65, 5.9, .5, .38, "#3b464a");
    m.box(0, 3.3, .86, 3.25, .08, .06, "#c29273");
    [-4.2, 4.2].forEach(x => {
      const a = [x, 2.65, 4], b = [0, 1.35, -3.15];
      const t = (.86 - a[2]) / (b[2] - a[2]);
      const hit = a.map((v, i) => v + (b[i] - v) * t);
      m.line(a, hit, "#d5836c", .045);
    });

    return m;
  }

  function wheel(m, x, y, z) {
    for (let i = 0; i < 12; i++) {
      const a = i * PI / 6;
      const b = (i + 1) * PI / 6;
      const p = (xx, t) => [
        xx,
        y + Math.cos(t) * .33,
        z + Math.sin(t) * .33
      ];

      m.quad(
        p(x - .07, a), p(x + .07, a),
        p(x + .07, b), p(x - .07, b),
        "#3c3430"
      );

      m.tri(
        [x + .075, y, z],
        p(x + .075, a),
        p(x + .075, b),
        "#937453"
      );
    }
  }

  function medieval() {
    const m = new T.Mesh();
    base(m, "#928c78", 7.5);

    m.use("street");

    for (let i = -5; i <= 5; i++) {
      for (let j = -3; j <= 4; j++) {
        m.box(
          i, .01, j, .94, .045, .94,
          (i + j) % 2 ? "#aaa28a" : "#9f9782"
        );
      }
    }

    m.use("church");
    m.box(-4, 0, -3.4, 2.8, 3.8, 3, "#8a8f89");
    m.roof(-4, 3.8, -3.4, 3.1, 1.3, 3.4, "#414c4c");
    m.box(-4.8, 0, -3.4, 1.1, 5.3, 1.7, "#858b88");
    m.roof(-4.8, 5.3, -3.4, 1.3, .9, 1.9, "#455354");
    m.box(-3.6, 0, -1.87, .8, 1.5, .07, "#363f3e");
    m.tri([-4, 1.5, -1.82], [-3.6, 2.12, -1.82], [-3.2, 1.5, -1.82], "#363f3e");
    m.box(-3.6, 2.6, -1.83, .18, .6, .06, "#445555");
    m.box(-4.8, 4.28, -2.52, .5, .75, .06, "#354143");
    [-5.1, -2.9].forEach(x => m.box(x, 0, -1.9, .23, 2.6, .5, "#a7aaa0"));
    m.shadow(-4, .07, -3.4, 2.5, 2.2);
    m.roof(-4.8, 5.4, -3.4, 1.2, 1.6, 1.6, "#455354");
    m.cylinder(-4.8, 5.9, -3.4, .05, .9, "#e2d3af", 6);
    m.box(-4.8, 6.5, -3.4, .55, .06, .06, "#e2d3af");

    m.use("houses");

    [0, 2.4, 4.8].forEach((x, i) => {
      m.box(x, 0, -4.2, 2, 2.4 + i * .25, 2, "#d1c3a4");
      m.roof(x, 2.4 + i * .25, -4.2, 2.35, .95, 2.5, "#715749");

      [-.75, .75].forEach(s => {
        m.box(x + s, 0, -3.18, .12, 2.4 + i * .25, .09, "#544c42");
      });

      m.box(x, 1.5, -3.14, 2, .12, .09, "#544c42");
      m.box(x, .25, -3.11, .6, 1.05, .09, "#555e58");
    });

    m.use("houses");
    [[6.0, -.8, 2.0], [-6, .6, 1.6]].forEach(([x, z, h]) => {
      m.box(x, .04, z, 1.55, h, 1.7, "#b6b2a0");
      m.roof(x, h, z, 1.8, .8, 2, "#6b6153");
      m.box(x, .15, z + .86, .48, 1, .05, PALETTE.dark);
      m.shadow(x, .065, z, 1.4, 1.4);
    });
    m.use("stations");

    [-3, 0, 3].forEach(x => {
      m.band(x, 1, 1, 1.13, .08, .025, 0, 2 * PI, "#f2d391", 28);
    });

    m.use("wagon");
    m.shadow(0, .08, 1, 1.9, 1.3, .4);
    m.box(0, .46, 1, 2.4, .27, 1.8, "#8a6144");

    [-1.08, 1.08].forEach(x => {
      [.4, 1.6].forEach(z => wheel(m, x, .33, z));
    });

    m.box(0, .73, .22, 2.3, 1.9, .12, "#814e49");

    [-1.04, 1.04].forEach(x => {
      m.box(x, .72, 1, .1, 2, .1, "#d6bb82");
    });

    m.box(0, 2.69, .8, 2.5, .12, 1.85, "#8c4944");
    m.box(.8, 2.81, .7, .055, .8, .055, "#e4cca1");
    m.box(.55, 3.11, .7, .5, .38, .05, "#d1a457");
    m.use("wagon-flap");
    m.box(0, .67, 1.75, 2.3, .11, .95, "#b49165");
    [-.9, .9].forEach(x => m.line([x, .65, 2.15], [x, .1, 2.15], "#765d47", .06));
    m.use("wagon-cast");
    m.person(-.35, .73, 1.05, "#a7564d", 1.05);
    m.person(.4, .73, .85, "#a7564d", .95);

    [-3, 0, 3].forEach((x, station) => {
      m.use("crowd" + station);
      for (let i = 0; i < 5; i++) {
        m.person(
          x - .8 + i * .4,
          .09,
          3.7 + (i % 2) * .4,
          PALETTE.crowd, 1, PI
        );
      }
    });

    return m;
  }

  function renaissance() {
    const m = new T.Mesh();
    base(m, "#b8b299", 8);

    m.use("floor");
    m.box(0, 0, -.8, 10, .18, 13.5, "#ddd1b5");
    m.box(0, .18, -3.5, 8, .22, 7.1, "#695d48");

    m.quad(
      [-3.15, .415, 0],
      [-1, .85, -7],
      [1, .85, -7],
      [3.15, .415, 0],
      "#bfad8a"
    );

    m.use("court");

    [-4.6, 4.6].forEach(x => {
      m.box(x, .18, -2.2, .25, .6, 9.5, "#b5b39b");
      m.box(x, .18, 0, .7, 3.6, .4, "#743f42");

      for (let z = -6; z < 2; z += 1.6) {
        m.box(
          x - .23 * Math.sign(x), .18, z,
          .2, 3.6, .3, "#e8ddbf"
        );
      }
    });

    m.box(0, 3.8, 0, 9.7, .32, .45, "#d5c7a8");
    m.box(0, 3.64, .23, 8.7, .14, .1, "#997e57");
    m.box(0, .35, -7.15, 8, 3.8, .2, "#68837e");
    m.use("backdrop");
    [-.9, -.3, .3, .9].forEach((x, i) => {
      m.box(x, .83, -7, .38, .7 + i % 2 * .2, .08, "#b7bca8");
      m.roof(x, 1.53 + i % 2 * .2, -7, .4, .25, .1, "#8a9586");
    });

    m.use("flats");

    for (let j = 0; j < 5; j++) {
      const s = 1 - j * .145;
      const z = -.8 - j * 1.24;
      const y = .4 + j * .08;

      [-1, 1].forEach(sign => {
        m.use("flats" + Math.min(2, Math.floor(j / 2)) + (sign < 0 ? "L" : "R"));
        const x = sign * (3.25 - j * .46);
        const h = 3.25 * s;
        const w = 1.7 * s;

        m.shadow(x, y + .025, z, w * .8, .45);
        m.box(x, y, z, w, h, .14, "#e5d9be");
        m.box(x, y + .04, z + .1, w + .13, .12 * s, .18, "#bdae8b");
        [-.43, .43].forEach(d => m.box(x + d * w, y, z + .1, .10 * s, h, .10, "#cfbd96"));
        m.line([x, y + h * .62, z - .14], [x, .42, z - .7], "#8e7b5a", .04);
        m.roof(x, y + h, z, w + .1, .4 * s, .14, "#9c8a68");
        m.box(x, y + .18, z + .09, .43 * s, 1.25 * s, .025, "#45574f");
        m.box(x, y + 1.9 * s, z + .09, .50 * s, .6 * s, .025, "#78958a");
        m.box(x, y + h - .24 * s, z + .12, w, .09, .055, "#b19b72");
      });
    }

    m.use("seat");
    m.box(0, .18, 5.5, 1.2, .2, 1.2, "#aa9164");
    m.box(0, .38, 5.65, .72, .55, .65, "#8e4e4d");
    m.box(0, .45, 5.95, .75, 1.1, .15, "#9d6252");

    m.use("benches");

    [-1, 1].forEach(s => {
      [3, 4.5, 6].forEach(z => {
        m.box(s * 2.6, .18, z, 2.9, .45, .45, "#7b6952");
      });
    });

    m.use("guides");

    [-3.15, -1.55, 0, 1.55, 3.15].forEach(x => {
      m.line([x, .435, 0], [0, .94, -7], PALETTE.accent, .014);
    });
    m.use("vanishing");
    m.sphere(0, .95, -6.95, .08, .08, .05, "#bbf4df");
    m.line([-.22, .95, -6.9], [.22, .95, -6.9], PALETTE.accent, .013);
    m.line([0, .73, -6.9], [0, 1.17, -6.9], PALETTE.accent, .013);

    return m;
  }

  function elizabeth() {
    const m = new T.Mesh();
    base(m, "#89765f", 7.4);

    m.use("landscape");
    [[-4.6, -5.2], [3.8, -5.6]].forEach(([x, z]) => {
      m.box(x, .02, z, 1.6, 2, 1.2, "#a89d86");
      m.roof(x, 2.02, z, 1.8, .8, 1.4, "#6f7367");
    });
    m.use("yard");
    m.cylinder(0, .01, 0, 5, .1, "#c4ac82", 48);

    m.use("galleries");

    for (let k = 0; k < 20; k++) {
      const a = k * 2 * PI / 20;
      const b = (k + 1) * 2 * PI / 20;

      // 前侧剖切，便于教学观察。
      if (a > PI * .3 && a < PI * .7) continue;
      // 任务模式扩大前侧剖口，让三面观众同时可见；导览恢复较小剖口。
      m.use(a >= 0 && b <= PI + .001 ? "gallery-front" : "galleries");

      for (let level = 0; level < 3; level++) {
        const y = .14 + level * 1.48;

        m.band(0, 0, 4.9, 6.8, y, .14, a, b, "#b99464", 2);
        m.band(0, 0, 4.9, 5.03, y + .14, .53, a, b, "#c4b598", 2);
        m.band(0, 0, 6.65, 6.8, y + .14, 1.35, a, b, "#ddd0b6", 2);

        [a, b].forEach(t => {
          [5, 6.62].forEach(r => {
            m.box(
              Math.cos(t) * r, y, Math.sin(t) * r,
              .13, 1.47, .13, "#584439"
            );
          });

          m.box(
            Math.cos(t) * 5.85,
            y + 1.32,
            Math.sin(t) * 5.85,
            1.9, .12, .13, "#584439", -t
          );
        });
      }

      m.band(0, 0, 4.83, 6.93, 4.65, .28, a, b, "#846c4b", 2);
    }

    m.use("thrust");
    m.box(0, .12, -2.1, 4.7, .68, 4.7, "#ad8256");

    for (let x = -2.1; x <= 2.1; x += .42) {
      m.box(x, .805, -2.1, .025, .025, 4.7, "#79573f");
    }

    m.use("actor");
    m.person(0, 0, 0, PALETTE.actor, 1.4);
    m.use("facing");
    m.tri([-.27, .025, .45], [0, .025, .95], [.27, .025, .45], PALETTE.accent);
    m.band(0, 0, .40, .43, .023, .016, 0, 2 * PI, PALETTE.accent, 32);

    m.use("backstage");
    m.box(0, .12, -4.5, 4.7, 4.5, .3, "#c7bda4");

    [-1.4, 1.4].forEach(x => {
      m.box(x, .82, -4.31, .85, 1.7, .04, "#6b353b");
    });

    m.box(0, 2.8, -4.1, 4.7, .5, .6, "#825d41");

    m.use("heavens");

    [-1.8, 1.8].forEach(x => {
      m.cylinder(x, .8, -.3, .13, 3.4, "#a3594d", 12);
    });

    m.use("canopy");
    m.box(0, 4.18, -2.1, 5.1, .25, 4.65, "#687d7e");
    m.roof(0, 4.43, -2.1, 5.3, .55, 4.8, "#876a4a");

    ["left", "front", "right"].forEach((side, sector) => {
      m.use("audience-" + side);
      for (let i = 0; i < 10; i++) {
        const x = sector === 1 ? -2.0 + (i % 5) : (sector === 0 ? -3.3 : 3.3) + Math.floor(i / 5) * (sector === 0 ? -.55 : .55);
        const z = sector === 1 ? 2.1 + Math.floor(i / 5) * .6 : -2.6 + (i % 5) * .62;
        m.person(x, .12, z, PALETTE.crowd, .85, Math.atan2(-x, -1 - z));
      }
      m.shadow(sector === 1 ? 0 : sector === 0 ? -3.6 : 3.6, .122,
        sector === 1 ? 2.4 : -1.3, sector === 1 ? 2.8 : .85, sector === 1 ? .9 : 2.1, .2);
    });
    return m;
  }

  T.BUILDERS = {
    greek,
    medieval,
    renaissance,
    elizabeth
  };
})(window.TTM);
