import { useState, useEffect, useRef, useCallback } from "react";

// ── Slide definitions ────────────────────────────────────────────────
const slides = [
  {
    id: 0, type: "welcome",
    headline: "Service Request Hub",
    sub: "Manage Requests Faster",
    body: "Create, assign, and track service requests from one unified dashboard.",
    svgKey: "eye",
  },
  {
    id: 1, type: "requestor",
    headline: "Requestor Workflow",
    sub: "Submit & Monitor",
    body: "Submit service requests in seconds, add details and attachments, and follow updates until completion.",
    svgKey: "diamond",
  },
  {
    id: 2, type: "provider",
    headline: "Provider Workspace",
    sub: "Manage & Resolve",
    body: "Providers receive requests, update task status, add comments, and resolve tickets efficiently.",
    svgKey: "hexgrid",
  },
  {
    id: 3, type: "admin",
    headline: "Admin Dashboard",
    sub: "Control & Report",
    body: "Manage teams, configure workflows, and monitor request health from a centralized admin view.",
    svgKey: "orbit",
  },
  {
    id: 4, type: "automation",
    headline: "Workflow Automation",
    sub: "Keep Work Moving",
    body: "Automate routing, approvals, and escalations so requests move forward without manual delays.",
    svgKey: "diamond",
  },
  {
    id: 5, type: "insights",
    headline: "Insights & Metrics",
    sub: "Measure Performance",
    body: "Track request volume, response times, and SLA performance with built-in dashboards.",
    svgKey: "orbit",
  },
  {
    id: 6, type: "security",
    headline: "Security & Access",
    sub: "Protect Your Data",
    body: "Control user roles, permissions, and request visibility for secure access management.",
    svgKey: "eye",
  },
  {
    id: 7, type: "integrations",
    headline: "Connected Ecosystem",
    sub: "Integrate Seamlessly",
    body: "Connect with your existing tools so service request data stays aligned across teams.",
    svgKey: "hexgrid",
  },
  {
    id: 8, type: "start",
    headline: "Get Started Now",
    sub: "Login or Register",
    body: "Begin managing service requests today. Click below to log in or create your account.",
    svgKey: "rocket",
    isLast: true,
  },
];

// ── SVG Illustrations (water-themed, rise animation) ─────────────────
const SvgIllustration = ({ svgKey, visible }) => {
  const style = {
    position: "absolute", right: "8vw", top: "50%",
    transform: visible ? "translateY(-50%) scale(1)" : "translateY(30%) scale(0.85)",
    opacity: visible ? 1 : 0,
    transition: "all 0.7s cubic-bezier(0.23,1,0.32,1)",
    width: "clamp(180px,28vw,340px)",
    pointerEvents: "none",
    filter: "drop-shadow(0 0 32px rgba(0,212,255,0.35))",
  };

  const svgs = {
    eye: (
      <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" style={style}>
        <defs>
          <radialGradient id="eg1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#001524" stopOpacity="0"/>
          </radialGradient>
          <clipPath id="riseClip">
            <rect x="0" y={visible ? 0 : 200} width="300" height="300"
              style={{transition:"y 0.8s cubic-bezier(0.23,1,0.32,1)"}}/>
          </clipPath>
        </defs>
        <g clipPath="url(#riseClip)">
          {[...Array(6)].map((_,i)=>(
            <ellipse key={i} cx="150" cy="150"
              rx={40+i*22} ry={18+i*9}
              fill="none" stroke="rgba(0,212,255,0.18)" strokeWidth="0.8"/>
          ))}
          <ellipse cx="150" cy="150" rx="110" ry="52" fill="none" stroke="rgba(0,212,255,0.5)" strokeWidth="1.2"/>
          <circle cx="150" cy="150" r="32" fill="url(#eg1)" stroke="#00d4ff" strokeWidth="1.5"/>
          <circle cx="150" cy="150" r="18" fill="rgba(0,212,255,0.15)" stroke="#7df9ff" strokeWidth="1"/>
          <circle cx="150" cy="150" r="6" fill="#00d4ff"/>
          {[...Array(12)].map((_,i)=>{
            const a = (i/12)*Math.PI*2;
            return <line key={i} x1={150+Math.cos(a)*36} y1={150+Math.sin(a)*36}
              x2={150+Math.cos(a)*55} y2={150+Math.sin(a)*55}
              stroke="rgba(0,212,255,0.4)" strokeWidth="0.8"/>;
          })}
          <line x1="10" x2="290" y1="150" y2="150" stroke="rgba(0,212,255,0.12)" strokeWidth="0.5"/>
          <line x1="150" y1="10" x2="150" y2="290" stroke="rgba(0,212,255,0.12)" strokeWidth="0.5"/>
        </g>
        {/* water surface line */}
        <path d="M10,220 Q75,208 150,220 Q225,232 290,220" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="1"/>
        <path d="M10,228 Q75,216 150,228 Q225,240 290,228" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="0.6"/>
      </svg>
    ),
    diamond: (
      <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" style={style}>
        <defs>
          <linearGradient id="dg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#7df9ff" stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        <g style={{transform: visible?"translateY(0)":"translateY(60px)", transition:"transform 0.8s ease", opacity: visible?1:0}}>
          <polygon points="150,40 240,150 150,260 60,150" fill="url(#dg1)" stroke="#00d4ff" strokeWidth="1.2"/>
          <polygon points="150,70 220,150 150,230 80,150" fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="0.8"/>
          <polygon points="150,100 200,150 150,200 100,150" fill="none" stroke="rgba(0,212,255,0.5)" strokeWidth="0.6"/>
          <line x1="60" y1="150" x2="240" y2="150" stroke="rgba(0,212,255,0.2)" strokeWidth="0.5"/>
          <line x1="150" y1="40" x2="150" y2="260" stroke="rgba(0,212,255,0.2)" strokeWidth="0.5"/>
          <line x1="60" y1="150" x2="150" y2="40" stroke="rgba(0,212,255,0.15)" strokeWidth="0.5"/>
          <line x1="240" y1="150" x2="150" y2="260" stroke="rgba(0,212,255,0.15)" strokeWidth="0.5"/>
          <circle cx="150" cy="150" r="8" fill="#00d4ff" opacity="0.9"/>
          {[{x:150,y:40},{x:240,y:150},{x:150,y:260},{x:60,y:150}].map((p,i)=>(
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="rgba(0,212,255,0.7)"/>
          ))}
        </g>
        <path d="M10,248 Q75,236 150,248 Q225,260 290,248" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="1"/>
      </svg>
    ),
    hexgrid: (
      <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" style={style}>
        {[
          [150,110],[115,130],[185,130],[150,170],[115,190],[185,190],[150,150]
        ].map(([cx,cy],i)=>{
          const pts = [...Array(6)].map((_,j)=>{
            const a = j*Math.PI/3 - Math.PI/6;
            return `${cx+28*Math.cos(a)},${cy+28*Math.sin(a)}`;
          }).join(" ");
          return <polygon key={i} points={pts}
            fill={i===6?"rgba(0,212,255,0.15)":"rgba(0,212,255,0.06)"}
            stroke="rgba(0,212,255,0.4)" strokeWidth="0.8"
            style={{opacity: visible?1:0, transform: visible?"translateY(0)":"translateY(50px)",
              transition:`all 0.6s ${i*0.07}s ease`}}/>;
        })}
        <circle cx="150" cy="150" r="10" fill="#00d4ff" style={{opacity:visible?1:0,transition:"opacity 0.5s 0.4s"}}/>
        <path d="M10,242 Q75,230 150,242 Q225,254 290,242" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="1"/>
      </svg>
    ),
    orbit: (
      <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" style={style}>
        <defs>
          <radialGradient id="og1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#001524" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g style={{opacity:visible?1:0,transition:"opacity 0.6s ease"}}>
          <circle cx="150" cy="150" r="22" fill="url(#og1)"/>
          {[50,75,100].map((r,i)=>(
            <ellipse key={i} cx="150" cy="150" rx={r} ry={r*0.38}
              fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="0.8"
              transform={`rotate(${i*35} 150 150)`}/>
          ))}
          {[[50,0],[75,45],[100,90]].map(([r,a],i)=>{
            const rad = a*Math.PI/180;
            const ry = r*0.38;
            return <circle key={i} cx={150+r*Math.cos(rad)} cy={150+ry*Math.sin(rad)}
              r="5" fill="#7df9ff" opacity="0.8"/>;
          })}
        </g>
        <path d="M10,245 Q75,233 150,245 Q225,257 290,245" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="1"/>
      </svg>
    ),
    rocket: (
      <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" style={{
        ...style,
        transform: visible ? "translateY(-50%) scale(1)" : "translateY(10%) scale(0.85)",
      }}>
        <defs>
          <linearGradient id="rg1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7df9ff"/>
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.3"/>
          </linearGradient>
        </defs>
        {/* rocket body */}
        <g style={{opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(60px)",
          transition:"all 0.7s ease"}}>
          <path d="M150,60 C130,80 120,120 120,155 L180,155 C180,120 170,80 150,60Z"
            fill="url(#rg1)" stroke="#00d4ff" strokeWidth="1"/>
          <rect x="130" y="155" width="40" height="30" rx="4"
            fill="rgba(0,212,255,0.2)" stroke="#00d4ff" strokeWidth="0.8"/>
          <path d="M120,155 L100,185 L130,185Z" fill="rgba(0,212,255,0.3)" stroke="#00d4ff" strokeWidth="0.7"/>
          <path d="M180,155 L200,185 L170,185Z" fill="rgba(0,212,255,0.3)" stroke="#00d4ff" strokeWidth="0.7"/>
          <circle cx="150" cy="115" r="14" fill="rgba(0,20,40,0.8)" stroke="#00d4ff" strokeWidth="1"/>
          <circle cx="150" cy="115" r="8" fill="rgba(0,212,255,0.25)" stroke="#7df9ff" strokeWidth="0.6"/>
          {/* flame */}
          <path d="M135,185 Q140,210 150,220 Q160,210 165,185Z"
            fill="rgba(0,212,255,0.5)" stroke="#00d4ff" strokeWidth="0.5"/>
          <path d="M140,185 Q144,202 150,210 Q156,202 160,185Z"
            fill="rgba(125,249,255,0.7)"/>
          {/* particles */}
          {[[148,230],[144,238],[152,242],[140,246],[158,235]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r="2" fill="rgba(0,212,255,0.5)"
              style={{animation:`particleFade 1.2s ${i*0.2}s infinite`}}/>
          ))}
        </g>
        <path d="M10,260 Q75,248 150,260 Q225,272 290,260" fill="none" stroke="rgba(0,212,255,0.5)" strokeWidth="1.2"/>
        <style>{`@keyframes particleFade{0%,100%{opacity:0.6;transform:translateY(0)}50%{opacity:0;transform:translateY(12px)}}`}</style>
      </svg>
    ),
  };
  return svgs[svgKey] || null;
};

// ── Water canvas hook ─────────────────────────────────────────────────
const RIPPLE_LIFETIME = 1800;
const MAX_RIPPLES = 20;

function useWaterCanvas(canvasRef, ripplesRef, mouseRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const COLS = 80, ROWS = 55;
    let raf;
    const draw = (now) => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#000a12"); bg.addColorStop(0.5, "#001524"); bg.addColorStop(1, "#000508");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      const ripples = ripplesRef.current;
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      const cW = w/COLS, cH = h/ROWS;
      const waveTime = now * 0.0005;
      const getDisplace = (bx, by) => {
        let dx=0,dy=0,alpha=0;
        for (const rip of ripples) {
          const age = (now - rip.t) / RIPPLE_LIFETIME;
          if (age>1) continue;
          const rx=rip.x*w, ry=rip.y*h;
          const dist = Math.sqrt((bx-rx)**2+(by-ry)**2);
          const speed = rip.click?320:200, waveR=age*speed*(rip.click?1.5:1);
          const waveW = rip.click?60:35;
          const prox = Math.exp(-((dist-waveR)**2)/(2*waveW**2));
          const fade=1-age, amp=rip.strength*fade*(rip.click?15:6);
          const ang = Math.atan2(by-ry, bx-rx);
          dx += Math.cos(ang)*prox*amp; dy += Math.sin(ang)*prox*amp;
          alpha += prox*fade*rip.strength;
        }
        const mdx=(bx-mx*w)/w, mdy=(by-my*h)/h;
        const mD=Math.sqrt(mdx**2+mdy**2);
        const mP=Math.exp(-(mD*mD)/0.012)*8;
        dx += (mdx/(mD+0.001))*mP*-1; dy += (mdy/(mD+0.001))*mP*-1;
        dy += Math.sin(bx/w*8+waveTime)*1.8;
        dx += Math.cos(by/h*6+waveTime*0.7)*1.0;
        return {dx,dy,alpha};
      };
      // horizontal lines
      for (let row=0;row<=ROWS;row++) {
        ctx.beginPath();
        for (let col=0;col<=COLS;col++) {
          const bx=col*cW, by=row*cH;
          const {dx,dy,alpha} = getDisplace(bx,by);
          const px=bx+dx, py=by+dy;
          if(col===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
          if (row%6===0&&col%6===0) {
            const g=Math.min(1,alpha*2.5+0.08);
            ctx.save(); ctx.beginPath(); ctx.arc(px,py,1.5,0,Math.PI*2);
            ctx.fillStyle=`rgba(0,212,255,${g*0.9})`; ctx.fill(); ctx.restore();
          }
        }
        ctx.strokeStyle="rgba(0,180,255,0.07)"; ctx.lineWidth=0.5; ctx.stroke();
      }
      // vertical lines
      for (let col=0;col<=COLS;col++) {
        ctx.beginPath();
        for (let row=0;row<=ROWS;row++) {
          const bx=col*cW, by=row*cH;
          const {dx,dy} = getDisplace(bx,by);
          const px=bx+dx, py=by+dy;
          if(row===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
        }
        ctx.strokeStyle="rgba(0,150,220,0.04)"; ctx.lineWidth=0.4; ctx.stroke();
      }
      ripplesRef.current = ripples.filter(r=>now-r.t<RIPPLE_LIFETIME);
      // caustic
      const cg=ctx.createRadialGradient(mx*w,my*h,0,mx*w,my*h,Math.min(w,h)*0.4);
      cg.addColorStop(0,"rgba(0,200,255,0.05)"); cg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=cg; ctx.fillRect(0,0,w,h);
      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, []);
}

// ── Custom cursor ─────────────────────────────────────────────────────
function CustomCursor() {
  const dotRef=useRef(null), ringRef=useRef(null);
  useEffect(()=>{
    const mv=e=>{
      if(dotRef.current){dotRef.current.style.left=e.clientX+"px";dotRef.current.style.top=e.clientY+"px";}
      if(ringRef.current){ringRef.current.style.left=e.clientX+"px";ringRef.current.style.top=e.clientY+"px";}
    };
    window.addEventListener("mousemove",mv);
    return ()=>window.removeEventListener("mousemove",mv);
  },[]);
  return (<>
    <div ref={dotRef} style={{position:"fixed",width:8,height:8,background:"#00d4ff",borderRadius:"50%",
      pointerEvents:"none",zIndex:9999,transform:"translate(-50%,-50%)",
      boxShadow:"0 0 12px #00d4ff,0 0 24px rgba(0,212,255,0.5)"}}/>
    <div ref={ringRef} style={{position:"fixed",width:36,height:36,
      border:"1px solid rgba(0,212,255,0.5)",borderRadius:"50%",
      pointerEvents:"none",zIndex:9998,transform:"translate(-50%,-50%)",
      transition:"all 0.15s ease"}}/>
  </>);
}

// ── Main Landing component ────────────────────────────────────────────
export default function Landing({ onLogin }) {
  const canvasRef=useRef(null);
  const ripplesRef=useRef([]);
  const mouseRef=useRef({x:0.5,y:0.5});
  const [slide,setSlide]=useState(0);
  const [visible,setVisible]=useState(true);
  const [transitioning,setTransitioning]=useState(false);
  const [dir,setDir]=useState(1);
  const [intro,setIntro]=useState(true);
  const [showLogoutMessage]=useState(()=>sessionStorage.getItem("logoutMessage")==="true");

  useWaterCanvas(canvasRef, ripplesRef, mouseRef);

  useEffect(()=>{ sessionStorage.removeItem("logoutMessage"); },[]);
  useEffect(()=>{ const t=setTimeout(()=>setIntro(false),2400); return ()=>clearTimeout(t); },[]);

  const addRipple=(x,y,click=true)=>{
    ripplesRef.current.push({x,y,t:performance.now(),strength:click?1:0.35,click});
    if(ripplesRef.current.length>MAX_RIPPLES) ripplesRef.current.shift();
  };

  const goTo=useCallback((next)=>{
    if(transitioning) return;
    setDir(next>slide?1:-1);
    setTransitioning(true); setVisible(false);
    setTimeout(()=>{ setSlide(next); setVisible(true); setTimeout(()=>setTransitioning(false),600); },420);
  },[slide,transitioning]);

  const handleClick=useCallback((e)=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const rect=canvas.getBoundingClientRect();
    addRipple((e.clientX-rect.left)/rect.width,(e.clientY-rect.top)/rect.height,true);
    const current=slides[slide];
    if(current.isLast){ if(onLogin) onLogin(); return; }
    goTo((slide+1)%slides.length);
  },[slide,goTo,onLogin]);

  const handleMouseMove=useCallback((e)=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const rect=canvas.getBoundingClientRect();
    const x=(e.clientX-rect.left)/rect.width, y=(e.clientY-rect.top)/rect.height;
    mouseRef.current={x,y};
    if(Math.random()<0.18) addRipple(x,y,false);
  },[]);

  const cur=slides[slide];

  return (
    <div onClick={handleClick} onMouseMove={handleMouseMove}
      style={{position:"relative",width:"100vw",height:"100vh",overflow:"hidden",cursor:"none",
        fontFamily:"'Rajdhani','Orbitron',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .scanline{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px);pointer-events:none;z-index:3;}
        .vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,0.72) 100%);pointer-events:none;z-index:4;}
        .glowline{position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,212,255,0.6),transparent);animation:scanmv 9s linear infinite;z-index:5;}
        @keyframes scanmv{0%{top:-2px;opacity:0}5%{opacity:1}95%{opacity:.4}100%{top:100%;opacity:0}}
        .hud{position:absolute;width:24px;height:24px;border-color:rgba(0,212,255,0.4);border-style:solid;pointer-events:none;z-index:8;}
        .htl{top:24px;left:24px;border-width:1px 0 0 1px;} .htr{top:24px;right:24px;border-width:1px 1px 0 0;}
        .hbl{bottom:24px;left:24px;border-width:0 0 1px 1px;} .hbr{bottom:24px;right:24px;border-width:0 1px 1px 0;}
        .dot{width:6px;height:6px;border-radius:50%;border:1px solid rgba(0,212,255,0.5);background:transparent;cursor:pointer;transition:all .3s;}
        .dot.on{background:#00d4ff;box-shadow:0 0 8px #00d4ff;transform:scale(1.35);}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        .a1{animation:fadeUp .5s .05s both ease-out} .a2{animation:fadeUp .5s .15s both ease-out}
        .a3{animation:fadeUp .5s .25s both ease-out} .a4{animation:fadeUp .5s .36s both ease-out}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes progLoad{from{width:0}to{width:100%}}
        .lastbtn{
          display:inline-block;margin-top:28px;padding:12px 32px;
          border:1px solid #00d4ff;color:#00d4ff;
          font-family:'Orbitron',monospace;font-size:clamp(10px,1.4vw,13px);
          letter-spacing:.25em;text-transform:uppercase;
          background:rgba(0,212,255,0.07);cursor:pointer;
          transition:all .3s ease;
          animation:fadeUp .5s .5s both ease-out;
        }
        .lastbtn:hover{background:rgba(0,212,255,0.18);box-shadow:0 0 24px rgba(0,212,255,0.3);}
        .bottom-login-btn {
          position: absolute;
          bottom: 48px;
          right: 48px;
          z-index: 10;
          font-size: 10px;
          letter-spacing: .25em;
          color: #00d4ff;
          text-transform: uppercase;
          cursor: pointer;
          border: 1px solid rgba(0,212,255,0.3);
          padding: 8px 16px;
          background: rgba(0,212,255,0.06);
          font-family: 'Orbitron', monospace;
          transition: all 0.3s ease;
        }
        .bottom-login-btn:hover {
          background: rgba(0,212,255,0.18);
          box-shadow: 0 0 16px rgba(0,212,255,0.3);
          border-color: #00d4ff;
        }
      `}</style>

      <CustomCursor/>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,zIndex:1,display:"block"}}/>
      <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",
        background:"linear-gradient(180deg,rgba(0,30,60,.1) 0%,transparent 50%,rgba(0,30,60,.15) 100%)"}}/>
      <div className="scanline"/> <div className="vignette"/> <div className="glowline"/>
      <div className="hud htl"/> <div className="hud htr"/> <div className="hud hbl"/> <div className="hud hbr"/>

      {/* top bar */}
      <div style={{position:"absolute",top:28,left:48,right:48,display:"flex",
        alignItems:"center",justifyContent:"space-between",zIndex:10}}>
        <span style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(10px,1.5vw,13px)",
          color:"rgba(0,212,255,0.6)",letterSpacing:".3em",textTransform:"uppercase"}}>
          SRM System
        </span>
        <div style={{display:"flex",gap:8}}>
          {slides.map((s,i)=>(
            <div key={s.id} className={`dot${i===slide?" on":""}`}
              onClick={e=>{e.stopPropagation();goTo(i);}}/>
          ))}
        </div>
        <span style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(9px,1.2vw,11px)",
          color:"rgba(0,212,255,0.35)",letterSpacing:".2em"}}>
          {String(slide+1).padStart(2,"0")} / {String(slides.length).padStart(2,"0")}
        </span>
      </div>

      {/* SVG illustration — water lo nunchi vasthundi */}
      <SvgIllustration svgKey={cur.svgKey} visible={visible}/>

      {/* slide text */}
      <div style={{position:"absolute",inset:0,zIndex:9,display:"flex",alignItems:"center",
        paddingLeft:"clamp(32px,8vw,110px)",paddingTop:80}}>
        <div key={slide} style={{
          opacity:visible?1:0,
          transform:visible?"translateY(0)":`translateY(${dir*30}px)`,
          transition:"opacity .4s ease, transform .4s ease",
          maxWidth:"50vw",
        }}>
          <div className="a1" style={{display:"inline-block",border:"1px solid rgba(0,212,255,.3)",
            padding:"3px 10px",fontSize:"clamp(9px,1.2vw,11px)",letterSpacing:".25em",
            color:"rgba(0,212,255,.7)",textTransform:"uppercase",marginBottom:16}}>
            {cur.sub}
          </div>
          <div className="a2" style={{fontFamily:"'Orbitron',monospace",
            fontSize:"clamp(32px,6vw,80px)",fontWeight:900,lineHeight:1,color:"#fff",
            textShadow:"0 0 40px rgba(0,212,255,.3)",marginBottom:8}}>
            {cur.headline.split(" ").map((word,wIndex,words)=>(
              <span key={`${word}-${wIndex}`} style={{display:"inline-block",whiteSpace:"nowrap"}}>
                {word.split("").map((c,i)=>(
                  <span key={i} style={{display:"inline-block",
                    animation:`fadeUp .4s ${.15+(wIndex*word.length+i)*.028}s both ease-out`}}>
                    {c}
                  </span>
                ))}
                {wIndex < words.length - 1 ? "\u00a0" : ""}
              </span>
            ))}
          </div>
          <div className="a3" style={{fontSize:"clamp(11px,1.8vw,16px)",color:"rgba(0,212,255,.7)",
            letterSpacing:".28em",textTransform:"uppercase",marginBottom:20}}>
            {cur.sub}
          </div>
          <p className="a4" style={{fontFamily:"'Rajdhani',sans-serif",
            fontSize:"clamp(13px,1.7vw,17px)",color:"rgba(255,255,255,.55)",
            lineHeight:1.75,fontWeight:400}}>
            {cur.body}
          </p>
          {cur.isLast && (
            <div className="lastbtn" onClick={e=>{e.stopPropagation();if(onLogin)onLogin();}}>
              ▶ &nbsp; Continue to Login
            </div>
          )}
        </div>
      </div>

      {/* bottom hints */}
      <div style={{position:"absolute",bottom:48,left:48,zIndex:10,
        display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:1,height:32,background:"linear-gradient(180deg,transparent,rgba(0,212,255,.5))"}}/>
        <span style={{fontSize:9,letterSpacing:".3em",color:"rgba(0,212,255,.35)",textTransform:"uppercase"}}>
          {cur.type}
        </span>
      </div>
      <div 
        onClick={e=>{e.stopPropagation();if(onLogin)onLogin();}}
        className="bottom-login-btn"
      >
        Continue to Login →
      </div>
      <div style={{position:"absolute",right:32,top:"50%",zIndex:10,
        transform:"translateY(-50%) rotate(90deg)",fontSize:9,letterSpacing:".3em",
        color:"rgba(0,212,255,.2)",textTransform:"uppercase",whiteSpace:"nowrap"}}>
        Click anywhere to move forward
      </div>

      {/* progress */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,
        background:"rgba(0,212,255,.1)",zIndex:10}}>
        <div style={{height:"100%",
          background:"linear-gradient(90deg,#00d4ff,#7df9ff)",
          boxShadow:"0 0 8px #00d4ff",
          width:`${((slide+1)/slides.length)*100}%`,
          transition:"width .4s ease"}}/>
      </div>

      {/* intro overlay */}
      {intro&&(
        <div style={{position:"absolute",inset:0,background:"#000a12",zIndex:20,
          display:"flex",alignItems:"center",justifyContent:"center",
          transition:"opacity .8s ease"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(13px,2vw,20px)",
              color:"#00d4ff",letterSpacing:".4em",textTransform:"uppercase",marginBottom:24}}>
              {showLogoutMessage ? "Thank you!😊😊" : "Welcome to the Service Request Management System"}
            </div>
            <div style={{width:200,height:1,background:"rgba(0,212,255,.15)",
              position:"relative",margin:"0 auto"}}>
              <div style={{position:"absolute",top:0,left:0,height:"100%",
                background:"#00d4ff",animation:"progLoad 2.2s ease-in-out forwards",
                boxShadow:"0 0 8px #00d4ff"}}/>
            </div>
            <div style={{marginTop:14,fontSize:9,letterSpacing:".3em",
              color:"rgba(0,212,255,.4)",textTransform:"uppercase"}}>
              {showLogoutMessage ? "Newly · Developed · For · Efficient · Service · Management" : "Newly · Developed · For · Efficient · Service · Management"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
