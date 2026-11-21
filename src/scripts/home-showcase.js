// ================= 2. 顶部光束进度条 =================
const beam = document.getElementById('progressBeam');
window.addEventListener('scroll', () => {
  const top = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  beam.style.width = max > 0 ? `${(top / max) * 100}%` : '0%';
}, { passive: true });

const SCENES = {
  mindnotes: { caption: '空间笔迹', description: '用 Canvas 把一笔平面曲线投影到三维空间。', url: 'https://11suixing11.github.io/mindnotes-pro/', link: '打开白板 ↗', color: '103, 245, 198' },
  tasks: { caption: '同步流程', description: '官方登录、选择课程、同步待办。三个步骤在本地汇成一张清单。', url: 'https://github.com/11suixing11/study-task-hub', link: '查看项目 ↗', color: '255, 183, 108' },
  dfacm: { caption: '训练路径', description: '从练题到提交评测，再回到错题复盘，形成一轮练习。', url: 'https://dfacm.website/', link: '访问网站 ↗', color: '158, 169, 255' },
};
const sceneConsole = document.getElementById('benchmark');
const hero = sceneConsole.closest('.hero');
const scenePanel = document.getElementById('projectRadarPanel');
const sceneTabs = [...sceneConsole.querySelectorAll('[role="tab"]')];
const sceneCaption = document.getElementById('sceneCaption');
const sceneDescription = document.getElementById('sceneDescription');
const sceneLink = document.getElementById('radarSource');
let sceneRenderer;

function selectScene(tab) {
  const name = tab.dataset.scene;
  const data = SCENES[name];
  for (const item of sceneTabs) {
    item.setAttribute('aria-selected', String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  }
  sceneConsole.dataset.scene = name;
  hero.dataset.scene = name;
  scenePanel.setAttribute('aria-labelledby', tab.id);
  sceneCaption.textContent = data.caption;
  sceneDescription.textContent = data.description;
  sceneLink.href = data.url;
  sceneLink.textContent = data.link;
  sceneRenderer?.setScene(name);
}

sceneTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectScene(tab));
  tab.addEventListener('keydown', event => {
    const keys = { ArrowLeft: (index + sceneTabs.length - 1) % sceneTabs.length, ArrowRight: (index + 1) % sceneTabs.length, Home: 0, End: sceneTabs.length - 1 };
    if (!Object.hasOwn(keys, event.key)) return;
    event.preventDefault();
    const next = sceneTabs[keys[event.key]];
    selectScene(next);
    next.focus();
  });
});
scenePanel.setAttribute('role', 'tabpanel');
sceneTabs[0].parentElement.hidden = false;

// Geometry is built once. Only its projection and highlights change each frame.
const TAU = Math.PI * 2;
const sampleCurve = (count, pointAt) => Array.from({ length: count + 1 }, (_, i) => pointAt(i / count));
const knot = (t, phase) => {
  const a = t * TAU;
  const r = 1.4 + .52 * Math.cos(3 * a + phase);
  return [r * Math.cos(2 * a), 1.07 * r * Math.sin(2 * a), .65 * Math.sin(3 * a + phase)];
};
const arc = (radius, y) => sampleCurve(72, t => [radius * Math.cos(t * TAU), y, radius * Math.sin(t * TAU)]);
const taskNodes = [
  { point: [-2.1, .22, .05], label: '官方登录' },
  { point: [0, .27, -.17], label: '选择课程' },
  { point: [2.1, .22, .05], label: '同步待办' },
];
const taskPaths = [-1, 1].flatMap(direction => [-1, 0, 1].map(spread => sampleCurve(33, t => [
  2.1 * t * direction,
  .24 + spread * .72 * Math.sin(t * Math.PI),
  .05 - .23 * (1 - t) + spread * .42 * Math.sin(t * Math.PI),
])));
const trainingRoute = sampleCurve(120, t => {
  const a = TAU * t + .45;
  return [2.13 * Math.cos(a), .72 * Math.sin(2 * a + .6), 1.41 * Math.sin(a)];
});
const trainingNodes = [0, 40, 80].map((index, i) => ({
  point: trainingRoute[index], label: ['练题', '提交', '复盘'][i],
}));
const sceneGeometry = {
  mintThreads: [-.35, -.17, 0, .17, .35].map(phase => sampleCurve(152, t => knot(t, phase))),
  trainingRings: [arc(1.2, -.84), arc(1.8, -.84), arc(2.48, -.84)],
};

// Seed the backdrop so its composition stays consistent across resizes and theme changes.
function particleRandom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

const orbitDust = (() => {
  const random = particleRandom(2473);
  return Array.from({ length: 88 }, () => ({
    angle: random() * TAU,
    radius: 1.78 + random() * 1.28,
    altitude: (random() - .5) * 1.65,
    speed: .035 + random() * .10,
    brightness: random(),
  }));
})();

function initHeroParticles(canvas, isPlaying) {
  const context = canvas.getContext('2d');
  if (!context) return;
  canvas.hidden = false;
  const random = particleRandom(42137);
  const stars = Array.from({ length: 176 }, (_, index) => ({
    x: random(), y: random(), depth: random(), phase: random() * TAU,
    onArc: index % 3 !== 0,
  }));
  const sparks = [];
  let width = 0, height = 0, age = 0;
  let pointer = null;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    sparks.length = 0;
    pointer = null;
  }

  function point(x, y, radius, opacity, tint) {
    context.fillStyle = `rgba(${tint}, ${opacity})`;
    context.beginPath();
    context.arc(x, y, radius, 0, TAU);
    context.fill();
  }

  function paint(dt, tint) {
    if (!width || !height) return;
    age += dt;
    context.clearRect(0, 0, width, height);
    const count = width < 620 ? 84 : stars.length;
    for (let i = 0; i < count; i++) {
      const star = stars[i];
      const { depth, phase } = star;
      const lane = (star.x + age * (.011 + depth * .019)) % 1;
      const x = 5 + lane * (width - 10);
      const y = star.onArc
        ? height * (.60 - .23 * Math.sin(lane * Math.PI * 1.56 - .62) + (star.y - .5) * .20)
        : height * star.y;
      const flicker = .76 + .24 * Math.sin(phase + age * (1.2 + depth));
      const fade = Math.min(1, lane * 14, (1 - lane) * 14);
      const near = pointer ? Math.max(0, 1 - Math.hypot(pointer.x - x, pointer.y - y) / 100) : 0;
      const radius = .48 + depth ** 2 * 1.52 + near * .7;
      const alpha = Math.min(.9, fade * flicker * (.24 + depth * .49) + near * .22);
      if (depth > .89) point(x, y, radius * 2.8, alpha * .10, tint);
      point(x, y, radius, alpha, tint);
      if (depth > .96) point(x, y, radius * .44, alpha, '229, 253, 250');
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const spark = sparks[i];
      spark.remaining -= dt;
      if (spark.remaining <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      const fade = spark.remaining / spark.lifetime;
      context.strokeStyle = `rgba(${tint}, ${fade * .46})`;
      context.lineWidth = spark.size * fade;
      context.beginPath();
      context.moveTo(spark.x - spark.vx * .10, spark.y - spark.vy * .10);
      context.lineTo(spark.x, spark.y);
      context.stroke();
      point(spark.x, spark.y, Math.max(.4, spark.size * fade), fade * .86, tint);
    }
  }

  hero.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !isPlaying()) return;
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const from = pointer || { x, y };
    const distance = Math.hypot(x - from.x, y - from.y);
    if (pointer && distance < 5) return;
    for (let i = 0, count = Math.min(6, Math.ceil(distance / 18) + 1); i < count; i++) {
      const along = (i + 1) / count;
      const angle = random() * TAU;
      const speed = 16 + random() * 40;
      const lifetime = .32 + random() * .55;
      sparks.push({
        x: from.x + (x - from.x) * along + (random() - .5) * 9,
        y: from.y + (y - from.y) * along + (random() - .5) * 9,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        size: 1.2 + random() * 1.8, lifetime, remaining: lifetime,
      });
    }
    if (sparks.length > 76) sparks.splice(0, sparks.length - 76);
    pointer = { x, y };
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointer = null; });
  return { resize, paint };
}

function initSceneRenderer() {
  const canvas = document.getElementById('sceneArt');
  const surface = document.getElementById('sceneSurface');
  const motion = document.getElementById('sceneMotion');
  const context = canvas.getContext('2d');
  if (!context) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const limit = (value, min, max) => Math.min(max, Math.max(min, value));
  let width = 0, height = 0;
  let scene = 'mindnotes';
  let yaw = .16, pitch = -.32, elapsed = 0;
  let heroVisible = true, sceneVisible = true, motionOverride = null;
  let frameId = 0, previousFrame = null;
  let drag = null;

  function draw() {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    const tint = SCENES[scene].color;
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cx = Math.cos(pitch), sx = Math.sin(pitch);
    const scale = Math.min(width / 6.2, height / 5.1);

    function project([x, y, z]) {
      const a = x * cy + z * sy;
      const b = z * cy - x * sy;
      const depth = b * cx + y * sx;
      const perspective = 7 / (7 - depth);
      return [width / 2 + a * scale * perspective, height * .465 - (y * cx - b * sx) * scale * perspective, perspective];
    }

    function stroke(points, weight, opacity, color = tint, dashed = false) {
      context.beginPath();
      points.forEach((point, i) => {
        const [x, y] = project(point);
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.lineWidth = weight;
      context.strokeStyle = `rgba(${color}, ${opacity})`;
      if (dashed) context.setLineDash([4, 4]);
      context.stroke();
      if (dashed) context.setLineDash([]);
    }

    function light(point, size, opacity = 1) {
      const [x, y, perspective] = project(point);
      const radius = size * perspective;
      const halo = context.createRadialGradient(x, y, 0, x, y, radius * 4);
      halo.addColorStop(0, `rgba(${tint}, ${opacity * .7})`);
      halo.addColorStop(1, `rgba(${tint}, 0)`);
      context.fillStyle = halo;
      context.fillRect(x - radius * 4, y - radius * 4, radius * 8, radius * 8);
      context.beginPath();
      context.arc(x, y, radius, 0, TAU);
      context.fillStyle = `rgba(242, 254, 255, ${opacity})`;
      context.fill();
    }

    function mark(nodes) {
      nodes.map(node => ({ ...node, position: project(node.point) })).sort((a, b) => a.position[2] - b.position[2]).forEach(({ point, label, position: [x, y] }) => {
        light(point, 3.4);
        context.font = '600 12px "Microsoft YaHei", sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        const labelWidth = context.measureText(label).width;
        context.fillStyle = '#0b1115';
        context.fillRect(x - labelWidth / 2 - 5, y - 27, labelWidth + 10, 19);
        context.fillStyle = '#e8eff5';
        context.fillText(label, x, y - 17);
      });
    }

    context.save();
    context.fillStyle = `rgb(${tint})`;
    for (const [index, dust] of orbitDust.entries()) {
      if (width < 450 && index >= 52) break;
      const angle = dust.angle + elapsed * dust.speed;
      const [x, y, depth] = project([
        Math.cos(angle) * dust.radius,
        dust.altitude + .47 * Math.sin(angle * 2),
        Math.sin(angle) * dust.radius,
      ]);
      const shimmer = .75 + .25 * Math.sin(dust.angle + elapsed * 1.6);
      const radius = (.48 + dust.brightness ** 2 * 1.72) * depth;
      context.globalAlpha = (.22 + dust.brightness * .53) * shimmer * Math.min(1, depth);
      context.beginPath();
      context.arc(x, y, radius, 0, TAU);
      context.fill();
      if (dust.brightness > .9) {
        context.globalAlpha *= .16;
        context.beginPath();
        context.arc(x, y, radius * 3.5, 0, TAU);
        context.fill();
      }
    }
    context.restore();

    context.lineCap = 'round';
    context.lineJoin = 'round';
    if (scene === 'mindnotes') {
      const threads = sceneGeometry.mintThreads;
      stroke(threads[2], 20, .06);
      stroke(threads[2], 9, .15);
      threads.forEach((path, index) => stroke(path, index === 2 ? 2.5 : 1.25, index === 2 ? .94 : .49, index < 2 ? '80, 210, 249' : tint));
      for (let index = 0; index < 3; index++) light(knot((elapsed * .21 + index / 3) % 1, 0), index === 0 ? 4.6 : 2.2);
    } else if (scene === 'tasks') {
      taskPaths.forEach((path, index) => {
        const main = index % 3 === 1;
        stroke(path, main ? 8 : 4, .08);
        stroke(path, main ? 1.9 : 1, main ? .87 : .39, tint, !main);
        const progress = (elapsed * .43 + index * .15 + .32) % 1;
        const flow = index < 3 ? 1 - progress : progress;
        light(path[Math.round(flow * (path.length - 1))], main ? 3.1 : 1.7, main ? 1 : .72);
      });
      for (const { point: [x, y, z] } of taskNodes) {
        const square = [[x - .33, y - .33, z], [x + .33, y - .33, z], [x + .33, y + .33, z], [x - .33, y + .33, z], [x - .33, y - .33, z]];
        stroke(square, 7, .10);
        stroke(square, 1.3, .67);
      }
      mark(taskNodes);
    } else {
      sceneGeometry.trainingRings.forEach((ring, index) => stroke(ring, 1, index === 2 ? .40 : .27, tint, index === 1));
      stroke(trainingRoute, 13, .10);
      stroke(trainingRoute, 2.8, .90);
      mark(trainingNodes);
      light(trainingRoute[Math.floor((elapsed * 23 + 14) % (trainingRoute.length - 1))], 4.7);
    }
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    width = bounds.width;
    height = bounds.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    context.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
    draw();
  }

  const wantsMotion = () => motionOverride ?? !reducedMotion.matches;
  const canAnimate = () => wantsMotion() && heroVisible && !document.hidden;
  const particles = initHeroParticles(document.getElementById('heroParticles'), canAnimate);

  function tick(now) {
    frameId = 0;
    if (!canAnimate()) return;
    const dt = previousFrame === null ? 0 : Math.min((now - previousFrame) / 1000, .05);
    previousFrame = now;
    particles?.paint(dt, SCENES[scene].color);
    if (sceneVisible) {
      elapsed += dt;
      if (!drag) yaw = (yaw + dt * (scene === 'tasks' ? .12 : .24)) % TAU;
      draw();
    }
    frameId = requestAnimationFrame(tick);
  }

  function syncPlayback() {
    motion.textContent = wantsMotion() ? '暂停演示' : '播放演示';
    if (canAnimate()) {
      if (!frameId) frameId = requestAnimationFrame(tick);
    } else {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
      previousFrame = null;
    }
  }

  motion.addEventListener('click', () => {
    motionOverride = !wantsMotion();
    syncPlayback();
  });
  reducedMotion.addEventListener('change', () => {
    motionOverride = null;
    syncPlayback();
  });
  document.addEventListener('visibilitychange', syncPlayback);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        else sceneVisible = entry.isIntersecting;
      }
      syncPlayback();
    });
    observer.observe(hero);
    observer.observe(surface);
  }

  function rotate(horizontal, vertical) {
    yaw = (yaw + horizontal) % TAU;
    pitch = limit(pitch + vertical, -1.1, 1.1);
    draw();
  }

  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || drag) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    rotate((event.clientX - drag.x) * .012, (event.clientY - drag.y) * .010);
    drag.x = event.clientX;
    drag.y = event.clientY;
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => {
    canvas.addEventListener(type, event => {
      if (drag?.id === event.pointerId) drag = null;
    });
  });
  canvas.addEventListener('keydown', event => {
    const offsets = { ArrowLeft: [-.18, 0], ArrowRight: [.18, 0], ArrowUp: [0, -.15], ArrowDown: [0, .15] };
    if (!Object.hasOwn(offsets, event.key)) return;
    event.preventDefault();
    rotate(...offsets[event.key]);
  });

  canvas.hidden = false;
  surface.querySelector('.scene-fallback').hidden = true;
  document.getElementById('sceneInstructions').hidden = false;
  motion.hidden = false;
  function resizeParticles() {
    particles?.resize();
    particles?.paint(0, SCENES[scene].color);
  }
  resize();
  resizeParticles();
  window.addEventListener('resize', resize);
  window.addEventListener('resize', resizeParticles);
  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(surface);
    new ResizeObserver(resizeParticles).observe(hero);
  }
  syncPlayback();
  return {
    setScene(name) {
      if (scene === name) return;
      scene = name;
      yaw = .16;
      pitch = name === 'dfacm' ? -.47 : -.32;
      elapsed = 0;
      particles?.paint(0, SCENES[scene].color);
      draw();
    },
  };
}

sceneRenderer = initSceneRenderer();
selectScene(sceneTabs[0]);

// ================= 4. Bento 卡片光标聚光灯 =================
document.querySelectorAll('.bento-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
});

// Project workflow tabs progressively enhance the static walkthroughs.
document.querySelectorAll('[data-project-flow]').forEach(flow => {
  const tablist = flow.querySelector('[role="tablist"]');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  function selectStep(index) {
    tabs.forEach((tab, position) => {
      const active = position === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[position].toggleAttribute('inert', !active);
      panels[position].tabIndex = active ? 0 : -1;
    });
  }
  tabs.forEach((tab, index) => {
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    tab.addEventListener('click', () => selectStep(index));
    tab.addEventListener('keydown', event => {
      const next = { ArrowLeft: (index + tabs.length - 1) % tabs.length, ArrowRight: (index + 1) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (!Object.hasOwn(next, event.key)) return;
      event.preventDefault();
      selectStep(next[event.key]);
      tabs[next[event.key]].focus();
    });
  });
  flow.querySelector('.flow-panels').classList.add('is-enhanced');
  selectStep(0);
  tablist.hidden = false;
});

(function initMiniCanvas() {
  const canvas = document.getElementById('miniBoard');
  const context = canvas.getContext('2d');
  if (!context || !('PointerEvent' in window)) return;
  const lab = canvas.closest('.board-lab');
  const swatches = [...lab.querySelectorAll('[data-ink]')];
  const brushWidth = document.getElementById('boardWidth');
  const undo = document.getElementById('undoCanvas');
  const history = [];
  let width = 0;
  let height = 0;
  let ink = swatches[0].dataset.ink;
  let example = true;
  let strokes = [];
  let active = null;

  function drawExample() {
    const scale = Math.min(width / 450, height / 270, 1.35);
    context.save();
    context.translate((width - 450 * scale) / 2, (height - 270 * scale) / 2);
    context.scale(scale, scale);
    const topics = [
      { y: 55, title: '目标', note: '列出需求', color: '#6ef4c5' },
      { y: 135, title: '实现', note: '拆分任务', color: '#ffbb76' },
      { y: 215, title: '发布', note: '验证成果', color: '#b5a7ff' },
    ];
    for (const { y, color } of topics) {
      context.beginPath();
      context.moveTo(172, 135);
      context.bezierCurveTo(220, 135, 226, y, 277, y);
      context.strokeStyle = color;
      context.globalAlpha = .75;
      context.lineWidth = 2;
      context.stroke();
    }
    context.globalAlpha = 1;
    context.textBaseline = 'middle';
    function node(x, y, w, h, tint) {
      context.beginPath();
      context.roundRect(x, y, w, h, 11);
      context.fillStyle = '#101b20';
      context.fill();
      context.strokeStyle = tint;
      context.lineWidth = 1.5;
      context.stroke();
    }
    node(27, 103, 147, 64, '#6ef4c5');
    context.fillStyle = '#def8ee';
    context.font = '600 23px "Microsoft YaHei", sans-serif';
    context.fillText('项目规划', 53, 135);
    for (const { y, title, note, color } of topics) {
      node(277, y - 28, 146, 56, color);
      context.fillStyle = color;
      context.font = '600 18px "Microsoft YaHei", sans-serif';
      context.fillText(title, 295, y - 7);
      context.fillStyle = '#bdc6ce';
      context.font = '15px "Microsoft YaHei", sans-serif';
      context.fillText(note, 295, y + 13);
    }
    context.restore();
  }

  // Keep strokes in normalized coordinates so both live ink and undo survive a resize.
  function drawSegment(stroke, to, from) {
    const x = to.x * width;
    const y = to.y * height;
    context.beginPath();
    if (from) {
      context.lineWidth = stroke.width;
      context.lineCap = 'round';
      context.strokeStyle = stroke.color;
      context.moveTo(from.x * width, from.y * height);
      context.lineTo(x, y);
      context.stroke();
    } else {
      context.fillStyle = stroke.color;
      context.arc(x, y, stroke.width / 2, 0, TAU);
      context.fill();
    }
  }

  function repaint() {
    context.clearRect(0, 0, width, height);
    if (example) drawExample();
    for (const stroke of strokes) {
      stroke.points.forEach((point, index) => drawSegment(stroke, point, stroke.points[index - 1]));
    }
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(bounds.width * dpr);
    const pixelHeight = Math.round(bounds.height * dpr);
    if (width === bounds.width && height === bounds.height && canvas.width === pixelWidth && canvas.height === pixelHeight) return;
    width = bounds.width;
    height = bounds.height;
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    context.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
    repaint();
  }

  function updateUndo() {
    undo.setAttribute('aria-disabled', String(history.length === 0));
  }

  function checkpoint() {
    history.push({ example, strokes: strokes.slice() });
    if (history.length > 24) history.shift();
    updateUndo();
  }

  function changeExample(show) {
    if (example === show && strokes.length === 0) return;
    active = null;
    checkpoint();
    example = show;
    strokes = [];
    repaint();
  }

  function addPoint(event) {
    const { left, top, width: currentWidth, height: currentHeight } = canvas.getBoundingClientRect();
    const to = { x: (event.clientX - left) / currentWidth, y: (event.clientY - top) / currentHeight };
    const from = active.stroke.points.at(-1);
    if (from && Math.hypot((to.x - from.x) * width, (to.y - from.y) * height) < 1) return;
    active.stroke.points.push(to);
    drawSegment(active.stroke, to, from);
  }

  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || active || !width || !height) return;
    checkpoint();
    const stroke = { color: ink, width: Number(brushWidth.value), points: [] };
    active = { id: event.pointerId, stroke };
    strokes.push(stroke);
    canvas.setPointerCapture(event.pointerId);
    addPoint(event);
  });
  canvas.addEventListener('pointermove', event => {
    if (active?.id === event.pointerId) addPoint(event);
  });
  canvas.addEventListener('pointerup', event => {
    if (active?.id !== event.pointerId) return;
    addPoint(event);
    active = null;
  });
  for (const name of ['pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(name, event => {
      if (active?.id === event.pointerId) active = null;
    });
  }

  for (const swatch of swatches) {
    swatch.addEventListener('click', () => {
      ink = swatch.dataset.ink;
      swatches.forEach(item => item.setAttribute('aria-pressed', String(item === swatch)));
    });
  }
  undo.addEventListener('click', () => {
    if (!history.length) return;
    active = null;
    ({ example, strokes } = history.pop());
    repaint();
    updateUndo();
  });
  document.getElementById('clearCanvas').addEventListener('click', () => changeExample(false));
  document.getElementById('sampleCanvas').addEventListener('click', () => changeExample(true));
  document.getElementById('exportCanvas').addEventListener('click', () => {
    if (!width || !height) return;
    const image = document.createElement('canvas');
    image.width = canvas.width;
    image.height = canvas.height;
    const exportContext = image.getContext('2d');
    if (!exportContext) return;
    exportContext.fillStyle = '#0b1112';
    exportContext.fillRect(0, 0, image.width, image.height);
    exportContext.drawImage(canvas, 0, 0);
    const download = document.createElement('a');
    download.download = 'mindnotes-sketch.png';
    download.href = image.toDataURL('image/png');
    download.click();
  });

  lab.hidden = false;
  resize();
  window.addEventListener('resize', resize);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
})();

// ================= 6. 文章筛选和阅读器 =================
// 标题、分类、日期和原文链接取自上方文章列表，这里只存内嵌摘要。
const POST_PREVIEWS = {
  'dfacm-training': `<p>训练从专题路线开始：选题、提交、查看反馈，再回到错题入口复盘。赛事日历把日常练习和真实比赛连接起来。</p><blockquote>练题 → 评测 → 复盘 → 再练习。</blockquote><p>算法训练和 AI 实践是两个入口，作品在自己的开发环境中完成。 <a href="https://dfacm.website/training/" target="_blank" rel="noopener">打开训练入口 ↗</a></p>`,
  'study-task-hub-sync': `<p>应用先读取课程目录，再由用户选择需要记录的课程，最后读取选中课程的任务。目录刷新成功，不等于任务同步完成。</p><h3>保留同步边界</h3><p>会话过期时保留旧任务；部分分页未读完时标明覆盖不完整；平台明确没有任务时才更新为空结果。</p><p>它只做任务聚合与提醒，不代答、不代交。 <a href="https://github.com/11suixing11/study-task-hub" target="_blank" rel="noopener">查看项目 ↗</a></p>`,
  'hello-world': `<p>这是 Fuwari 版博客的开篇。站点由 Astro 驱动，主题使用 Fuwari。</p><p>这篇文章也记录了建站初衷，以及怎样从 Markdown 模板开始写一篇新文章。</p>`,
  'how-this-blog-is-built': `<p>先用 Astro 做出文章流、归档、搜索和 RSS，再换用 Fuwari，把时间从重复造轮子转回内容与细节。</p><p>博客通过 GitHub Pages 部署，Pagefind 负责构建后的站内搜索。</p>`,
  'markdown-demo': `<p>这篇文章演示本站支持的 Markdown 元素，写新文章时可以直接对照语法。</p><p>原文包含标题、表格、代码高亮、数学公式和提示框等完整示例。</p><pre><code>pnpm run dev      # 开发
pnpm run build    # 构建 + 搜索索引
pnpm run preview  # 预览构建产物</code></pre>`,
  'mindnotes-local-first': `<p>MindNotes Pro 不追求账户、云端同步和多人协作，而是把单人白板的边界做清楚：打开、写画、保存、导出。</p><blockquote>一个开源项目可以受启发，但不能靠模糊归因来显得更专业。</blockquote><p>文中记录的维护重点是可靠性、回归测试、导出与恢复。 <a href="https://11suixing11.github.io/mindnotes-pro/" target="_blank" rel="noopener">打开白板 ↗</a></p>`
};

const postList = document.getElementById('postList');
const filterShell = document.getElementById('filterShell');
const filterBtns = [...filterShell.querySelectorAll('.filter-btn')];
const glider = document.getElementById('filterGlider');
const postRows = [...postList.querySelectorAll('.post-row')];

function moveGlider(btn) {
  glider.style.width = `${btn.offsetWidth}px`;
  glider.style.height = `${btn.offsetHeight}px`;
  glider.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
}

function selectFilter(btn) {
  for (const item of filterBtns) {
    const selected = item === btn;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  }
  for (const row of postRows) {
    row.hidden = btn.id !== 'filterAll' && row.dataset.cat !== btn.dataset.cat;
  }
  postList.setAttribute('aria-labelledby', btn.id);
  moveGlider(btn);
}

filterBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => selectFilter(btn));
  btn.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? filterBtns.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + filterBtns.length) % filterBtns.length;
    selectFilter(filterBtns[next]);
    filterBtns[next].focus();
  });
});
postList.setAttribute('role', 'tabpanel');
filterShell.hidden = false;
selectFilter(filterBtns[0]);
const positionGlider = () => moveGlider(filterShell.querySelector('[aria-selected="true"]'));
window.addEventListener('load', positionGlider, { once: true });
window.addEventListener('resize', positionGlider);
if ('ResizeObserver' in window) {
  const filterObserver = new ResizeObserver(positionGlider);
  filterBtns.forEach(btn => filterObserver.observe(btn));
}

const modal = document.getElementById('readerModal');
const readerMeta = document.getElementById('readerMeta');
const readerBody = document.getElementById('readerBody');
const readerTitle = document.getElementById('readerTitle');
const readerOriginal = document.getElementById('readerOriginal');
let lastReaderTrigger = null;
let startedOnBackdrop = false;

function openReader(link) {
  const id = link.dataset.openPost;
  const preview = Object.hasOwn(POST_PREVIEWS, id) ? POST_PREVIEWS[id] : '';
  const description = link.querySelector('.post-body p')?.textContent;
  if ((!preview && !description) || typeof modal.showModal !== 'function') return false;
  const row = link.closest('.post-row');
  lastReaderTrigger = link;
  startedOnBackdrop = false;
  readerMeta.textContent = `${row.querySelector('time').dateTime} · ${row.dataset.cat} · 文章摘要`;
  readerTitle.textContent = link.querySelector('h3').textContent;
  readerOriginal.href = link.href;
  if (preview) {
    readerBody.innerHTML = preview; // Authored excerpts for the selected articles.
  } else {
    const summary = document.createElement('p');
    summary.textContent = description;
    readerBody.replaceChildren(summary);
  }
  modal.showModal();
  modal.scrollTop = 0;
  readerTitle.focus({ preventScroll: true });
  return true;
}

postList.querySelectorAll('[data-open-post]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (openReader(link)) event.preventDefault();
  });
});

modal.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const focusable = modal.querySelectorAll('a[href], button:not([disabled])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const current = document.activeElement;
  if (current === readerTitle || current === modal || (event.shiftKey ? current === first : current === last)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  }
});

function onBackdrop(event) {
  if (event.target !== modal) return false;
  const box = modal.getBoundingClientRect();
  return event.clientX < box.left || event.clientX >= box.right || event.clientY < box.top || event.clientY >= box.bottom;
}

modal.addEventListener('pointerdown', event => { startedOnBackdrop = onBackdrop(event); });
modal.addEventListener('click', event => {
  if (startedOnBackdrop && onBackdrop(event)) modal.close();
  startedOnBackdrop = false;
});
document.getElementById('readerClose').addEventListener('click', () => modal.close());
modal.addEventListener('close', () => {
  if (modal.open) return;
  lastReaderTrigger?.focus({ preventScroll: true });
  lastReaderTrigger = null;
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  }));
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  document.documentElement.classList.add('reveal-ready');
}

document.getElementById('year').textContent = new Date().getFullYear();
