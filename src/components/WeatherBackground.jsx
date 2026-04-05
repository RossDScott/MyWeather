import { useRef, useEffect } from 'react';

/* ── Particle initialisers (one per effect key) ── */

const INIT = {
  sunny: (w, h) => {
    const particles = [];
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: w * 0.7 + (Math.random() - 0.5) * w * 0.5,
        y: h * 0.2 + (Math.random() - 0.5) * h * 0.3,
        r: 1 + Math.random() * 2,
        speed: 0.2 + Math.random() * 0.3,
        angle: Math.random() * Math.PI * 2,
        opacity: 0.2 + Math.random() * 0.3,
      });
    }
    return particles;
  },

  clouds: (w, h) => buildClouds(w, h, 12, 28, 0.018, 0.015, 0.08, 0.12, 0.05, 0.55),

  'clouds-light': (w, h) => buildClouds(w, h, 4, 18, 0.012, 0.01, 0.06, 0.10, 0.05, 0.45),

  fog: (w, h) => buildClouds(w, h, 6, 28, 0.025, 0.015, 0.03, 0.03, 0.3, 0.6, 1.8),

  rain: (w, h) => {
    const particles = [];
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        speed: 8 + Math.random() * 8,
        len: 12 + Math.random() * 18,
        opacity: 0.15 + Math.random() * 0.25,
        drift: 0,
      });
    }
    return particles;
  },

  lightning: () => [{ flash: 0 }],

  snow: (w, h) => {
    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        r: 1.5 + Math.random() * 3,
        speed: 0.3 + Math.random() * 0.8,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.02,
        opacity: 0.4 + Math.random() * 0.4,
      });
    }
    return particles;
  },
};

/* ── Shared cloud builder ── */

function buildClouds(w, h, count, blobCount, opBase, opRange, speedBase, speedRange, yStart, ySpan, scaleMul = 1) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const cx = Math.random() * w * 1.6 - w * 0.3;
    const cy = h * yStart + Math.random() * h * ySpan;
    const scale = (0.5 + Math.random() * 1.0) * scaleMul;
    const blobs = [];
    for (let j = 0; j < blobCount; j++) {
      const spreadX = (Math.random() - 0.5) * 180 * scale;
      const spreadY = (Math.random() - 0.5) * 40 * scale;
      const distFromCentre = Math.abs(spreadX) / (90 * scale);
      const baseR = (30 + Math.random() * 35) * scale * (1 - distFromCentre * 0.4);
      blobs.push({ ox: spreadX, oy: spreadY, r: Math.max(8, baseR) });
    }
    particles.push({
      x: cx, y: cy, blobs,
      speed: speedBase + Math.random() * speedRange,
      opacity: opBase + Math.random() * opRange,
      depth: Math.random(),
    });
  }
  particles.sort((a, b) => a.depth - b.depth);
  return particles;
}

/* ── Effect drawers (one per effect key) ── */

const BLUR_SETTINGS = {
  clouds:         { primary: 16, secondary: 30, color: '190,200,220' },
  'clouds-light': { primary: 16, secondary: 30, color: '190,200,220' },
  fog:            { primary: 24, secondary: 45, color: '200,205,215' },
};

const DRAW = {
  sunny: (ctx, particles, w, h) => {
    const grd = ctx.createRadialGradient(w * 0.72, h * 0.08, 10, w * 0.72, h * 0.08, 150);
    grd.addColorStop(0, 'rgba(255,220,100,0.25)');
    grd.addColorStop(0.5, 'rgba(255,180,50,0.08)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
    particles.forEach((d) => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,230,150,${d.opacity})`;
      ctx.fill();
      d.angle += 0.008;
      d.x += Math.cos(d.angle) * d.speed;
      d.y += Math.sin(d.angle) * d.speed * 0.5;
    });
  },

  clouds: (ctx, particles, w, _h, offscreen) => drawClouds(ctx, particles, w, offscreen, 'clouds'),

  'clouds-light': (ctx, particles, w, _h, offscreen) => drawClouds(ctx, particles, w, offscreen, 'clouds-light'),

  fog: (ctx, particles, w, _h, offscreen) => drawClouds(ctx, particles, w, offscreen, 'fog'),

  rain: (ctx, particles, w, h) => {
    particles.forEach((d) => {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + d.drift, d.y + d.len);
      ctx.strokeStyle = `rgba(174,194,224,${d.opacity})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      d.y += d.speed;
      d.x += d.drift;
      if (d.y > h) { d.y = -d.len; d.x = Math.random() * w; }
      if (d.x > w) d.x = 0;
    });
  },

  lightning: (ctx, particles, w, h) => {
    const state = particles[0];
    if (state.flash > 0) {
      ctx.fillStyle = `rgba(200,180,255,${state.flash * 0.12})`;
      ctx.fillRect(0, 0, w, h);
      state.flash -= 0.05;
    } else if (Math.random() < 0.005) {
      state.flash = 1;
    }
  },

  snow: (ctx, particles, w, h) => {
    particles.forEach((d) => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${d.opacity})`;
      ctx.fill();
      d.y += d.speed;
      d.wobble += d.wobbleSpeed;
      d.x += Math.sin(d.wobble) * 0.5;
      if (d.y > h + d.r) { d.y = -d.r; d.x = Math.random() * w; }
    });
  },
};

/* ── Shared cloud drawer ── */

function drawClouds(ctx, particles, w, offscreen, key) {
  const oc = offscreen.getContext('2d');
  const { primary, secondary, color } = BLUR_SETTINGS[key];
  oc.clearRect(0, 0, offscreen.width, offscreen.height);
  particles.forEach((d) => {
    d.blobs.forEach((b) => {
      oc.beginPath();
      oc.arc(d.x + b.ox, d.y + b.oy, b.r, 0, Math.PI * 2);
      oc.fillStyle = `rgba(${color},${d.opacity})`;
      oc.fill();
    });
    d.x += d.speed;
    const maxR = Math.max(...d.blobs.map((b) => Math.abs(b.ox) + b.r));
    if (d.x - maxR > w) d.x = -maxR;
  });
  ctx.save();
  ctx.filter = `blur(${primary}px)`;
  ctx.drawImage(offscreen, 0, 0);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.filter = `blur(${secondary}px)`;
  ctx.drawImage(offscreen, 0, 0);
  ctx.restore();
}

/* ── Layers that need an offscreen canvas for blur compositing ── */

const BLUR_LAYERS = new Set(['clouds', 'clouds-light', 'fog']);

/* ── Component ── */

export default function WeatherBackground({ effectLayers }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const layerKey = effectLayers.join(',');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width = rect.width * dpr;
    const h = canvas.height = rect.height * dpr;

    const layers = effectLayers.map((key) => ({
      key,
      particles: INIT[key](w, h),
    }));

    let offscreen = null;
    if (effectLayers.some((k) => BLUR_LAYERS.has(k))) {
      offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      layers.forEach(({ key, particles }) => {
        DRAW[key](ctx, particles, w, h, offscreen);
      });
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [layerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
