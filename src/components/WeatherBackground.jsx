import { useRef, useEffect, useCallback } from 'react';

export default function WeatherBackground({ weatherType }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const initParticles = useCallback((w, h, type) => {
    const particles = [];
    if (type === 'rainy' || type === 'stormy') {
      for (let i = 0; i < 150; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          speed: 8 + Math.random() * 8,
          len: 12 + Math.random() * 18,
          opacity: 0.15 + Math.random() * 0.25,
          drift: type === 'stormy' ? 2 + Math.random() * 2 : 0,
        });
      }
    } else if (type === 'snowy') {
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
    } else if (type === 'sunny') {
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
    } else if (type === 'overcast') {
      for (let i = 0; i < 12; i++) {
        const cx = Math.random() * w * 1.6 - w * 0.3;
        const cy = h * 0.05 + Math.random() * h * 0.55;
        const scale = 0.5 + Math.random() * 1.0;
        const blobs = [];
        for (let j = 0; j < 28; j++) {
          const spreadX = (Math.random() - 0.5) * 180 * scale;
          const spreadY = (Math.random() - 0.5) * 40 * scale;
          const distFromCentre = Math.abs(spreadX) / (90 * scale);
          const baseR = (30 + Math.random() * 35) * scale * (1 - distFromCentre * 0.4);
          blobs.push({ ox: spreadX, oy: spreadY, r: Math.max(8, baseR) });
        }
        particles.push({
          x: cx, y: cy, blobs,
          speed: 0.08 + Math.random() * 0.12,
          opacity: 0.018 + Math.random() * 0.015,
          depth: Math.random(),
        });
      }
      particles.sort((a, b) => a.depth - b.depth);
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width = rect.width * dpr;
    const h = canvas.height = rect.height * dpr;

    const particles = initParticles(w, h, weatherType);
    let flash = 0;

    // Reusable offscreen canvas for overcast compositing
    let offscreen = null;
    let oc = null;
    if (weatherType === 'overcast') {
      offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
      oc = offscreen.getContext('2d');
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      if (weatherType === 'rainy' || weatherType === 'stormy') {
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
        if (weatherType === 'stormy') {
          if (flash > 0) {
            ctx.fillStyle = `rgba(200,180,255,${flash * 0.12})`;
            ctx.fillRect(0, 0, w, h);
            flash -= 0.05;
          } else if (Math.random() < 0.005) {
            flash = 1;
          }
        }
      } else if (weatherType === 'snowy') {
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
      } else if (weatherType === 'sunny') {
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
      } else if (weatherType === 'overcast') {
        oc.clearRect(0, 0, w, h);
        particles.forEach((d) => {
          d.blobs.forEach((b) => {
            oc.beginPath();
            oc.arc(d.x + b.ox, d.y + b.oy, b.r, 0, Math.PI * 2);
            oc.fillStyle = `rgba(190,200,220,${d.opacity})`;
            oc.fill();
          });
          d.x += d.speed;
          const maxR = Math.max(...d.blobs.map((b) => Math.abs(b.ox) + b.r));
          if (d.x - maxR > w) d.x = -maxR;
        });
        ctx.save();
        ctx.filter = 'blur(16px)';
        ctx.drawImage(offscreen, 0, 0);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.filter = 'blur(30px)';
        ctx.drawImage(offscreen, 0, 0);
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [weatherType, initParticles]);

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
