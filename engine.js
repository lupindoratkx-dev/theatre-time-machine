/* 原生 WebGL 微缩模型引擎：无网络请求、无第三方依赖。 */
window.TTM = window.TTM || {};

(function (T) {
  "use strict";

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);

  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];

  const norm = a => {
    const l = Math.hypot(...a) || 1;
    return a.map(v => v / l);
  };

  const rgb = hex =>
    [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);

  function multiply(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++)
      for (let r = 0; r < 4; r++)
        for (let k = 0; k < 4; k++)
          o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
    return o;
  }

  function matrix(cam, aspect) {
    const { yaw, pitch, distance } = cam;

    const eye = [
      cam.target[0] + Math.sin(yaw) * Math.cos(pitch) * distance,
      cam.target[1] + Math.sin(pitch) * distance,
      cam.target[2] + Math.cos(yaw) * Math.cos(pitch) * distance
    ];

    const z = norm(sub(eye, cam.target));
    const x = norm(cross([0, 1, 0], z));
    const y = cross(z, x);

    const view = new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -dot(x, eye), -dot(y, eye), -dot(z, eye), 1
    ]);

    const f = 1 / Math.tan((cam.fov || Math.PI / 4) / 2);
    const n = .1;
    const far = 120;

    const projection = new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + n) / (n - far), -1,
      0, 0, 2 * far * n / (n - far), 0
    ]);

    return multiply(projection, view);
  }

  class Mesh {
    constructor() {
      this.parts = {};
      this.group = "base";
    }

    use(id) {
      this.group = id;
      return this;
    }

    tri(a, b, c, color) {
      const n = norm(cross(sub(b, a), sub(c, a)));
      const light =
        .57 + .17 * Math.max(0, n[1]) +
        .24 * Math.max(0, dot(n, norm([-.6, 1, .7]))) +
        .06 * Math.max(0, dot(n, norm([.7, .4, -.8])));

      const col = rgb(color).map(v => v * light);
      const list = this.parts[this.group] || (this.parts[this.group] = []);

      [a, b, c].forEach(v => list.push(...v, ...col, 1));
    }

    quad(a, b, c, d, color) {
      this.tri(a, b, c, color);
      this.tri(a, c, d, color);
    }

    box(x, y, z, w, h, d, color, rot = 0) {
      const cs = Math.cos(rot);
      const sn = Math.sin(rot);
      const v = (a, b, c) => [
        x + a * cs + c * sn,
        y + b,
        z - a * sn + c * cs
      ];

      const p = [
        v(-w / 2, 0, -d / 2),
        v(w / 2, 0, -d / 2),
        v(w / 2, 0, d / 2),
        v(-w / 2, 0, d / 2),
        v(-w / 2, h, -d / 2),
        v(w / 2, h, -d / 2),
        v(w / 2, h, d / 2),
        v(-w / 2, h, d / 2)
      ];

      [
        [0, 3, 2, 1],
        [4, 5, 6, 7],
        [0, 1, 5, 4],
        [1, 2, 6, 5],
        [2, 3, 7, 6],
        [3, 0, 4, 7]
      ].forEach(face => {
        this.quad(...face.slice().reverse().map(i => p[i]), color);
      });
    }

    band(x, z, ri, ro, y, h, a0, a1, color, segments = 24) {
      const p = (r, a, b) => [
        x + Math.cos(a) * r,
        b,
        z + Math.sin(a) * r
      ];

      for (let i = 0; i < segments; i++) {
        const a = a0 + (a1 - a0) * i / segments;
        const b = a0 + (a1 - a0) * (i + 1) / segments;

        this.quad(
          p(ri, a, y + h), p(ri, b, y + h),
          p(ro, b, y + h), p(ro, a, y + h), color
        );

        this.quad(
          p(ro, a, y), p(ro, a, y + h),
          p(ro, b, y + h), p(ro, b, y), color
        );

        if (ri > 0) {
          this.quad(
            p(ri, b, y), p(ri, b, y + h),
            p(ri, a, y + h), p(ri, a, y), color
          );
        }
      }

      this.quad(
        p(ri, a0, y), p(ri, a0, y + h),
        p(ro, a0, y + h), p(ro, a0, y), color
      );

      this.quad(
        p(ro, a1, y), p(ro, a1, y + h),
        p(ri, a1, y + h), p(ri, a1, y), color
      );
    }

    cylinder(x, y, z, r, h, color, n = 12) {
      this.band(x, z, 0, r, y, h, 0, Math.PI * 2, color, n);
    }

    roof(x, y, z, w, h, d, color) {
      const a = [x - w / 2, y, z - d / 2];
      const b = [x + w / 2, y, z - d / 2];
      const c = [x, y + h, z - d / 2];

      const A = [x - w / 2, y, z + d / 2];
      const B = [x + w / 2, y, z + d / 2];
      const C = [x, y + h, z + d / 2];

      this.tri(a, b, c, color);
      this.tri(B, A, C, color);
      this.quad(a, c, C, A, color);
      this.quad(c, b, B, C, color);
    }

    // 透明顶点渐变的接触阴影，独立批次共享父组的移动与显隐。
    shadow(x, y, z, rx, rz, strength = .24) {
      const id = this.group + "~shadow";
      const list = this.parts[id] || (this.parts[id] = []);
      const color = [.11, .15, .16];
      const v = (r, a) => [x + Math.cos(a) * rx * r, y + .018,
        z + Math.sin(a) * rz * r, ...color, strength * (1 - r) * (1 - r)];
      for (let ring = 0; ring < 4; ring++) {
        for (let i = 0; i < 20; i++) {
          const a = i * Math.PI / 10, b = (i + 1) * Math.PI / 10;
          const ri = ring / 4, ro = (ring + 1) / 4;
          list.push(...v(ri, a), ...v(ro, b), ...v(ro, a),
            ...v(ri, a), ...v(ri, b), ...v(ro, b));
        }
      }
    }

    sphere(x, y, z, rx, ry, rz, color, segments = 8) {
      const v = (a, b) => [x + Math.cos(a) * Math.sin(b) * rx,
        y + Math.cos(b) * ry, z + Math.sin(a) * Math.sin(b) * rz];
      for (let i = 0; i < segments; i++) for (let j = 0; j < 5; j++) {
        const a = i * Math.PI * 2 / segments, b = (i + 1) * Math.PI * 2 / segments;
        this.quad(v(a, j * Math.PI / 5), v(b, j * Math.PI / 5),
          v(b, (j + 1) * Math.PI / 5), v(a, (j + 1) * Math.PI / 5), color);
      }
    }

    person(x, y, z, color, scale = 1, yaw = 0) {
      this.shadow(x, y, z, .34 * scale, .29 * scale, .32);
      const p = (a, b, c) => [x + (a * Math.cos(yaw) + c * Math.sin(yaw)) * scale,
        y + b * scale, z + (-a * Math.sin(yaw) + c * Math.cos(yaw)) * scale];
      this.cylinder(x, y + .10 * scale, z, .14 * scale, .45 * scale, color, 8);
      [-1, 1].forEach(side => {
        const foot = p(side * .075, 0, .035);
        this.box(...foot, .09 * scale, .14 * scale, .17 * scale, "#4e4940", yaw);
        this.line(p(side * .17, .48, 0), p(side * .20, .24, .035), color, .047 * scale);
      });
      this.sphere(x, y + .67 * scale, z, .105 * scale, .135 * scale, .105 * scale, "#dbc9ad");
      this.tri(p(-.10, .5, .132), p(0, .32, .16), p(.10, .5, .132), "#dcc2a0");
      // 朝向标识：面部小楔形，无表情、无纹理。
      this.tri(p(-.04, .66, .095), p(.04, .66, .095), p(0, .69, .15), "#e9d8bf");
    }

    line(a, b, color, width = .035) {
      const n = norm(sub(b, a));
      const u = norm(cross(n, Math.abs(n[1]) > .9 ? [1, 0, 0] : [0, 1, 0]));
      const v = cross(n, u);

      const p = (x, s, t) =>
        x.map((q, i) => q + width * (s * u[i] + t * v[i]));

      [
        [1, 1, -1, 1],
        [-1, 1, -1, -1],
        [-1, -1, 1, -1],
        [1, -1, 1, 1]
      ].forEach(([s, t, S, U]) => {
        this.quad(
          p(a, s, t), p(b, s, t),
          p(b, S, U), p(a, S, U), color
        );
      });
    }
  }

  class Stage {
    constructor(canvas, onFrame, onError) {
      this.canvas = canvas;
      this.onFrame = onFrame;
      this.onError = onError;
      this.parts = [];
      this.cam = {
        yaw: .45,
        pitch: .85,
        distance: 25,
        target: [0, 1, 0]
      };
      this.want = JSON.parse(JSON.stringify(this.cam));
      this.ok = false;
      this.frame = 0;
      this.animation = null;
      this.paused = false;
      this.controlsEnabled = true;
      this.reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      try {
        const gl = canvas.getContext("webgl", {
          alpha: true,
          antialias: true,
          powerPreference: "low-power"
        });

        if (!gl) throw Error("此浏览器未启用 WebGL");
        this.gl = gl;

        const compile = (type, source) => {
          const shader = gl.createShader(type);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);

          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw Error(gl.getShaderInfoLog(shader));
          }
          return shader;
        };

        const vs = compile(
          gl.VERTEX_SHADER,
          "attribute vec3 aPosition;" +
          "attribute vec4 aColor;" +
          "uniform mat4 uMatrix;" +
          "uniform vec3 uShift;" +
          "uniform float uTurn;" +
          "uniform vec3 uPivot;" +
          "varying vec4 vColor;" +
          "void main(){" +
          "vColor=aColor;" +
          "vec3 p=aPosition-uPivot;" +
          "float c=cos(uTurn),s=sin(uTurn);" +
          "p=vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);" +
          "gl_Position=uMatrix*vec4(p+uPivot+uShift,1.0);" +
          "}"
        );

        const fs = compile(
          gl.FRAGMENT_SHADER,
          "precision mediump float;" +
          "varying vec4 vColor;" +
          "uniform float uActive;" +
          "void main(){" +
          "gl_FragColor=vec4(mix(vColor.rgb,vec3(0.48,0.89,0.78),uActive),vColor.a);" +
          "}"
        );

        this.program = gl.createProgram();
        gl.attachShader(this.program, vs);
        gl.attachShader(this.program, fs);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
          throw Error(gl.getProgramInfoLog(this.program));
        }

        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.useProgram(this.program);

        this.pos = gl.getAttribLocation(this.program, "aPosition");
        this.col = gl.getAttribLocation(this.program, "aColor");
        this.mat = gl.getUniformLocation(this.program, "uMatrix");
        this.shift = gl.getUniformLocation(this.program, "uShift");
        this.turn = gl.getUniformLocation(this.program, "uTurn");
        this.pivot = gl.getUniformLocation(this.program, "uPivot");
        this.active = gl.getUniformLocation(this.program, "uActive");

        gl.enableVertexAttribArray(this.pos);
        gl.enableVertexAttribArray(this.col);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        this.ok = true;
      } catch (e) {
        onError(e.message);
        return;
      }

      this.controls();
      this.resize = () => this.invalidate();

      if (window.ResizeObserver) {
        this.observer = new ResizeObserver(this.resize);
        this.observer.observe(canvas);
      } else {
        window.addEventListener("resize", this.resize);
      }

      canvas.addEventListener("webglcontextlost", e => {
        e.preventDefault();
        this.ok = false;
        cancelAnimationFrame(this.frame);
        this.frame = 0;
        onError("3D 显示已中断，请刷新页面恢复。学习记录已保存在本机。");
      });

      document.addEventListener("visibilitychange", () => {
        this.lastTime = 0;
        if (document.hidden) {
          cancelAnimationFrame(this.frame);
          this.frame = 0;
        } else this.invalidate();
      });
      this.invalidate();
    }

    load(mesh) {
      this.stopAnimation();
      if (!this.ok) return;

      const g = this.gl;
      this.parts.forEach(p => g.deleteBuffer(p.buffer));

      this.parts = Object.entries(mesh.parts).map(([id, data]) => {
        const buffer = g.createBuffer();
        g.bindBuffer(g.ARRAY_BUFFER, buffer);
        g.bufferData(g.ARRAY_BUFFER, new Float32Array(data), g.STATIC_DRAW);

        return {
          id,
          buffer,
          count: data.length / 7,
          shadow: id.endsWith("~shadow"),
          angle: 0, angleTo: 0, pivot: [0, 0, 0],
          show: true,
          offset: [0, 0, 0],
          to: [0, 0, 0]
        };
      });

      this.selected = "";
      this.invalidate();
    }

    show(id, visible) {
      this.parts.filter(p => p.id === id || p.id.startsWith(id + "~")).forEach(p => p.show = visible);
      this.invalidate();
    }

    move(id, position, instant = false) {
      this.parts.filter(p => p.id === id || p.id.startsWith(id + "~")).forEach(p => {
        p.to = [...position];
        if (instant) p.offset = [...position];
      });
      this.invalidate();
    }

    rotate(id, angle, pivot = [0, 0, 0], instant = false) {
      this.parts.filter(p => p.id === id || p.id.startsWith(id + "~")).forEach(p => {
        p.angleTo = p.angle + Math.atan2(Math.sin(angle - p.angle), Math.cos(angle - p.angle));
        p.pivot = [...pivot];
        if (instant) p.angle = p.angleTo;
      });
      this.invalidate();
    }

    animate(duration, step, finish) {
      this.animation = { duration, elapsed: 0, step, finish };
      this.paused = false;
      this.lastTime = 0;
      step(0);
      this.invalidate();
    }

    stopAnimation() {
      this.animation = null;
      this.paused = false;
      this.lastTime = 0;
    }

    pause(value) {
      this.paused = value;
      this.lastTime = 0;
      this.invalidate();
    }

    offset(id) {
      return this.parts.find(p => p.id === id)?.offset || [0, 0, 0];
    }

    highlight(id) {
      this.selected = id;
      this.invalidate();
    }

    view(eye, target, instant = false) {
      const v = sub(eye, target);
      const distance = Math.hypot(...v);

      this.go({
        target,
        yaw: Math.atan2(v[0], v[2]),
        pitch: Math.asin(v[1] / distance),
        distance
      }, instant);
    }

    go(options, instant = false) {
      Object.assign(this.want, options);
      this.want.target = [...this.want.target];

      const diff = this.want.yaw - this.cam.yaw;
      this.want.yaw = this.cam.yaw + Math.atan2(Math.sin(diff), Math.cos(diff));

      if (instant || this.reduced) {
        this.cam = JSON.parse(JSON.stringify(this.want));
      }

      this.invalidate();
    }

    zoom(factor) {
      this.go({
        distance: clamp(this.want.distance * factor, 5, 45)
      });
    }

    controls() {
      const c = this.canvas;
      const points = new Map();

      const distance = () => {
        const p = [...points.values()];
        return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      };

      c.addEventListener("pointerdown", e => {
        if (!this.controlsEnabled || e.pointerType === "mouse" && e.button !== 0) return;

        this.want = JSON.parse(JSON.stringify(this.cam));
        points.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (c.setPointerCapture) c.setPointerCapture(e.pointerId);
      });

      c.addEventListener("pointermove", e => {
        if (!points.has(e.pointerId)) return;

        const old = points.get(e.pointerId);
        const before = points.size === 2 ? distance() : 0;
        points.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (points.size === 2) {
          this.zoom(before / Math.max(1, distance()));
        } else if (points.size === 1) {
          this.go({
            yaw: this.want.yaw - (e.clientX - old.x) * .007,
            pitch: clamp(
              this.want.pitch + (e.clientY - old.y) * .006,
              .07, 1.48
            )
          });
        }
      });

      const end = e => points.delete(e.pointerId);
      ["pointerup", "pointercancel", "lostpointercapture"].forEach(name => {
        c.addEventListener(name, end);
      });

      c.addEventListener("wheel", e => {
        e.preventDefault();
        if (this.controlsEnabled) this.zoom(Math.exp(clamp(e.deltaY, -100, 100) * .002));
      }, { passive: false });

      c.addEventListener("keydown", e => {
        const keys = [
          "ArrowLeft", "ArrowRight",
          "ArrowUp", "ArrowDown", "+", "-"
        ];

        if (!this.controlsEnabled || !keys.includes(e.key)) return;
        e.preventDefault();

        if (e.key === "+") {
          this.zoom(.9);
        } else if (e.key === "-") {
          this.zoom(1.1);
        } else {
          const step = .12;
          this.go({
            yaw: this.want.yaw +
              (e.key === "ArrowLeft" ? step : e.key === "ArrowRight" ? -step : 0),
            pitch: clamp(
              this.want.pitch +
              (e.key === "ArrowUp" ? step : e.key === "ArrowDown" ? -step : 0),
              .07, 1.48
            )
          });
        }
      });
    }

    project(position) {
      if (!this.mvp) return null;

      const m = this.mvp;
      const v = [...position, 1];
      const q = [0, 0, 0, 0];

      for (let r = 0; r < 4; r++)
        for (let i = 0; i < 4; i++)
          q[r] += m[i * 4 + r] * v[i];

      if (q[3] <= 0 || q[2] / q[3] < -1 || q[2] / q[3] > 1) {
        return null;
      }

      return {
        x: (q[0] / q[3] + 1) * this.width / 2,
        y: (1 - q[1] / q[3]) * this.height / 2
      };
    }

    invalidate() {
      if (this.ok && !this.frame && !document.hidden) {
        this.frame = requestAnimationFrame(time => this.draw(time));
      }
    }

    draw(time = performance.now()) {
      this.frame = 0;
      if (!this.ok) return;
      const dt = this.lastTime ? Math.min(100, Math.max(0, time - this.lastTime)) : 16;
      this.lastTime = time;
      const animation = this.animation;
      if (animation && !this.paused) {
        animation.elapsed += dt;
        animation.step(Math.min(1, animation.elapsed / animation.duration));
        if (animation.elapsed >= animation.duration && this.animation === animation) {
          this.animation = null;
          if (animation.finish) animation.finish();
        }
      }
      let moving = false;

      const lerp = (a, b) => {
        if (Math.abs(a - b) < .002 || this.reduced) return b;
        moving = true;
        return a + (b - a) * (1 - Math.pow(.84, dt / 16.667));
      };

      ["yaw", "pitch", "distance"].forEach(k => {
        this.cam[k] = lerp(this.cam[k], this.want[k]);
      });

      this.cam.target = this.cam.target.map((v, i) =>
        lerp(v, this.want.target[i])
      );

      this.parts.forEach(p => {
        p.offset = p.offset.map((v, i) => lerp(v, p.to[i]));
        p.angle = lerp(p.angle, p.angleTo);
      });

      const c = this.canvas;
      const g = this.gl;

      this.width = c.clientWidth;
      this.height = c.clientHeight;

      if (!this.width || !this.height) return;

      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(this.width * ratio);
      const h = Math.round(this.height * ratio);

      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }

      g.viewport(0, 0, w, h);
      g.clear(g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT);

      this.mvp = matrix(this.cam, this.width / this.height);
      g.uniformMatrix4fv(this.mat, false, this.mvp);

      const visible = this.parts.filter(p => p.show).sort((a, b) => Number(a.shadow) - Number(b.shadow));
      this.stats = { drawCalls: visible.length, triangles: visible.reduce((n, p) => n + p.count / 3, 0), width: w, height: h };
      visible.forEach(p => {
        g.depthMask(!p.shadow);
        g.bindBuffer(g.ARRAY_BUFFER, p.buffer);
        g.vertexAttribPointer(this.pos, 3, g.FLOAT, false, 28, 0);
        g.vertexAttribPointer(this.col, 4, g.FLOAT, false, 28, 12);
        g.uniform3fv(this.shift, p.offset);
        g.uniform3fv(this.pivot, p.pivot);
        g.uniform1f(this.turn, p.angle);
        g.uniform1f(this.active, !p.shadow && this.selected && (p.id === this.selected || p.id.startsWith(this.selected + "~")) ? .38 : 0);
        g.drawArrays(g.TRIANGLES, 0, p.count);
      });

      g.depthMask(true);
      if (this.onFrame) this.onFrame();
      if (moving || this.animation && !this.paused) this.invalidate();
      else this.lastTime = 0;
    }
  }

  Object.assign(T, {
    Mesh,
    Stage,
    matrix,
    clamp
  });
})(window.TTM);