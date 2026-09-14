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

  function greek() {
    const m = new T.Mesh();
    base(m, "#b3a78d", 8);

    m.use("terrain");
    m.box(0, -.06, -6.6, 11, .12, 1.5, "#477e87");

    m.use("theatron");

    for (let row = 0; row < 11; row++) {
      const ri = 3.2 + row * .37;
      const ro = ri + .35;

      for (let wedge = 0; wedge < 7; wedge++) {
        const a = -.12 + wedge * (PI + .24) / 7;

        m.band(
          0, 0, ri, ro,
          .03, .19 + row * .23,
          a + .025,
          a + (PI + .24) / 7 - .025,
          row % 2 ? "#eee4ce" : "#dbd0b8",
          5
        );
      }
    }

    m.use("orchestra");
    m.cylinder(0, .02, 0, 2.92, .09, "#d8b879", 56);
    m.band(0, 0, 2.78, 2.9, .12, .025, 0, 2 * PI, "#eae2c9", 56);

    for (let i = 0; i < 7; i++) {
      const a = i * PI * 2 / 7;
      m.person(Math.cos(a) * 1.4, .13, Math.sin(a) * 1.4, "#b5644f");
    }

    m.use("proskenion");
    m.box(0, .05, -3.25, 6.5, .7, 1.08, "#ded1b3");

    for (let i = -3; i <= 3; i++) {
      m.box(i, .14, -2.67, .15, .5, .13, "#f4ebd8");
    }

    m.person(-.7, .75, -3.15, "#387981", 1.2);

    m.use("skene");
    m.box(0, 0, -4.6, 7, 2.65, 1.15, "#bfb599");
    m.roof(0, 2.65, -4.6, 7.5, .45, 1.5, "#d8c5a0");

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
        i % 3 ? "#748883" : "#af694e",
        .8
      );
    }

    m.use("relations");

    [-4, 0, 4].forEach(x => {
      m.line([x, 2.7, 4.8], [0, 1.3, -3.15], "#66cfb5", .04);
    });

    m.use("anomaly");
    m.box(0, .13, .6, 5.7, 3.25, .19, "#1b2733");
    m.box(0, .32, .715, 5.35, 2.9, .04, "#1c627b");

    [-2, 2].forEach(x => {
      m.box(x, .12, .6, .25, .25, 1.2, "#16252d");
    });

    for (let x = -2.3; x < 2.4; x += .42) {
      for (let y = .55; y < 3; y += .4) {
        m.box(
          x, y, .75, .23, .21, .025,
          (Math.round((x + 2.3) * 10) + Math.round(y * 10)) % 2
            ? "#99e8e2"
            : "#5787c8"
        );
      }
    }

    [-4, 0, 4].forEach(x => {
      const a = [x, 2.7, 4.8];
      const b = [0, 1.3, -3.15];
      const t = (.78 - a[2]) / (b[2] - a[2]);
      const hit = a.map((v, i) => v + (b[i] - v) * t);

      m.line(a, hit, "#ff846f", .065);
      m.cylinder(hit[0], hit[1] - .08, hit[2], .12, .17, "#ffbf8b", 8);
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
    m.box(-3.6, 0, -1.87, .8, 2, .07, "#363f3e");
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

    m.use("stations");

    [-3, 0, 3].forEach(x => {
      m.band(x, 1, 1, 1.13, .08, .025, 0, 2 * PI, "#f2d391", 28);
    });

    m.use("wagon");
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
    m.person(-.35, .73, 1.05, "#eee0b7", 1.25);
    m.person(.4, .73, .85, "#b7664f", 1.1);

    m.use("crowd");

    [-3, 0, 3].forEach(x => {
      for (let i = 0; i < 5; i++) {
        m.person(
          x - .8 + i * .4,
          .09,
          2.9 + (i % 2) * .4,
          i % 2 ? "#5c7671" : "#a06952"
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
      m.box(x, .18, -2.2, .35, 3.5, 9.5, "#c6c5a7");
      m.box(x, .18, 0, .7, 3.6, .4, "#743f42");

      for (let z = -6; z < 2; z += 1.6) {
        m.box(
          x - .23 * Math.sign(x), .18, z,
          .2, 3.6, .3, "#e8ddbf"
        );
      }
    });

    m.box(0, .35, -7.15, 8, 3.8, .2, "#4d6b61");

    m.use("flats");

    for (let j = 0; j < 5; j++) {
      const s = 1 - j * .145;
      const z = -.8 - j * 1.24;
      const y = .4 + j * .08;

      [-1, 1].forEach(sign => {
        const x = sign * (3.25 - j * .46);
        const h = 3.25 * s;
        const w = 1.7 * s;

        m.box(x, y, z, w, h, .14, "#e5d9be");
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

    [-3.15, 3.15].forEach(x => {
      m.line([x, .45, 0], [0, .9, -9], "#8edde0", .025);
    });

    return m;
  }

  function elizabeth() {
    const m = new T.Mesh();
    base(m, "#89765f", 7.4);

    m.use("yard");
    m.cylinder(0, .01, 0, 5, .1, "#c4ac82", 48);

    m.use("galleries");

    for (let k = 0; k < 20; k++) {
      const a = k * 2 * PI / 20;
      const b = (k + 1) * 2 * PI / 20;

      // 前侧剖切，便于教学观察。
      if (a > PI * .3 && a < PI * .7) continue;

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

    m.person(0, .81, -1.8, "#a9524c", 1.4);

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

    m.box(0, 4.18, -2.1, 5.1, .25, 4.65, "#4d7180");
    m.roof(0, 4.43, -2.1, 5.3, .55, 4.8, "#876a4a");

    m.use("audience");

    for (let i = 0; i < 20; i++) {
      const a = .05 + i * (PI - .1) / 19;
      const r = 3.6 + (i % 2) * .5;

      m.person(
        Math.cos(a) * r,
        .12,
        Math.sin(a) * r,
        i % 3 ? "#697e74" : "#a0584d",
        .9
      );
    }

    return m;
  }

  T.BUILDERS = {
    greek,
    medieval,
    renaissance,
    elizabeth
  };
})(window.TTM);