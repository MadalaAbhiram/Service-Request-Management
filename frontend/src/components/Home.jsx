import { useEffect, useRef, useCallback } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../styles/Home.css";

const RIPPLE_LIFETIME = 1800;
const MAX_RIPPLES = 20;

function useWaterCanvas(canvasRef, ripplesRef, mouseRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    let raf = 0;

    const draw = (now) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const waveTime = now * 0.001;

      for (let wave = 0; wave < 9; wave++) {
        const baseY = ((wave + 1) / 10) * h;
        const amplitude = 8 + wave * 1.4;
        const frequency = 0.006 + wave * 0.00035;
        const speed = 0.35 + wave * 0.045;
        ctx.beginPath();
        for (let x = -20; x <= w + 20; x += 18) {
          const cursorLift = Math.exp(-((x - mx * w) ** 2) / 50000) * (my * h - baseY) * 0.025;
          const y = baseY
            + Math.sin(x * frequency + waveTime * speed + wave) * amplitude
            + Math.sin(x * frequency * 0.45 - waveTime * speed * 0.7) * amplitude * 0.5
            + cursorLift;
          if (x === -20) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(0, 190, 255, ${0.08 + wave * 0.012})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      const ripples = ripplesRef.current;
      for (const ripple of ripples) {
        const age = (now - ripple.t) / RIPPLE_LIFETIME;
        if (age > 1) continue;
        const radius = age * (ripple.click ? 260 : 130);
        ctx.beginPath();
        ctx.ellipse(ripple.x * w, ripple.y * h, radius, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 212, 255, ${(1 - age) * ripple.strength * 0.45})`;
        ctx.lineWidth = ripple.click ? 1.5 : 1;
        ctx.stroke();
      }

      ripplesRef.current = ripples.filter((r) => now - r.t < RIPPLE_LIFETIME);

      const glow = ctx.createRadialGradient(mx * w, my * h, 0, mx * w, my * h, Math.min(w, h) * 0.4);
      glow.addColorStop(0, "rgba(0,200,255,0.05)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    };

    const handleGlobalMouseMove = (e) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const x = e.clientX / w;
      const y = e.clientY / h;
      mouseRef.current = { x, y };

      if (Math.random() < 0.05) {
        ripplesRef.current.push({ x, y, t: performance.now(), strength: 0.35, click: false });
        if (ripplesRef.current.length > MAX_RIPPLES) ripplesRef.current.shift();
      }
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [canvasRef, mouseRef, ripplesRef]);
}

function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const mv = (e) => {
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${e.clientX}px`;
        ringRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", mv);
    return () => window.removeEventListener("mousemove", mv);
  }, []);

  return (
    <>
      <div ref={dotRef} className="home-cursor-dot" />
      <div ref={ringRef} className="home-cursor-ring" />
    </>
  );
}

function Home({ children }) {
  const canvasRef = useRef(null);
  const ripplesRef = useRef([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useWaterCanvas(canvasRef, ripplesRef, mouseRef);

  const addRipple = useCallback((x, y, click = true) => {
    ripplesRef.current.push({ x, y, t: performance.now(), strength: click ? 1 : 0.35, click });
    if (ripplesRef.current.length > MAX_RIPPLES) ripplesRef.current.shift();
  }, []);

  const handleClick = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      addRipple((e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height, true);
    },
    [addRipple]
  );

  return (
    <div className="home-layout water-scene" onClick={handleClick}>
      <CustomCursor />

      <canvas ref={canvasRef} className="water-canvas" />
      <div className="home-overlay" />
      <div className="scanline" />
      <div className="vignette" />
      <div className="glowline" />
      <div className="hud htl" />
      <div className="hud htr" />
      <div className="hud hbl" />
      <div className="hud hbr" />

      <Sidebar />

      <div className="main-container">
        <Navbar />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}

export default Home;
