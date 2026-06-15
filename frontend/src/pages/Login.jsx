import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../lib";

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
      const getD = (bx, by) => {
        let dx=0,dy=0,alpha=0;
        for (const rip of ripples) {
          const age=(now-rip.t)/RIPPLE_LIFETIME; if(age>1) continue;
          const rx=rip.x*w,ry=rip.y*h,dist=Math.sqrt((bx-rx)**2+(by-ry)**2);
          const speed=rip.click?320:200,waveR=age*speed*(rip.click?1.5:1),waveW=rip.click?60:35;
          const prox=Math.exp(-((dist-waveR)**2)/(2*waveW**2)),fade=1-age,amp=rip.strength*fade*(rip.click?15:6);
          const ang=Math.atan2(by-ry,bx-rx);
          dx+=Math.cos(ang)*prox*amp; dy+=Math.sin(ang)*prox*amp; alpha+=prox*fade*rip.strength;
        }
        const mdx=(bx-mx*w)/w,mdy=(by-my*h)/h,mD=Math.sqrt(mdx**2+mdy**2);
        const mP=Math.exp(-(mD*mD)/0.012)*8;
        dx+=(mdx/(mD+.001))*mP*-1; dy+=(mdy/(mD+.001))*mP*-1;
        dy+=Math.sin(bx/w*8+waveTime)*1.8; dx+=Math.cos(by/h*6+waveTime*.7)*1.0;
        return {dx,dy,alpha};
      };
      for(let row=0;row<=ROWS;row++){
        ctx.beginPath();
        for(let col=0;col<=COLS;col++){
          const bx=col*cW,by=row*cH,{dx,dy,alpha}=getD(bx,by);
          const px=bx+dx,py=by+dy;
          if(col===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
          if(row%6===0&&col%6===0){
            const g=Math.min(1,alpha*2.5+0.08);
            ctx.save();ctx.beginPath();ctx.arc(px,py,1.5,0,Math.PI*2);
            ctx.fillStyle=`rgba(0,212,255,${g*.9})`;ctx.fill();ctx.restore();
          }
        }
        ctx.strokeStyle="rgba(0,180,255,0.07)"; ctx.lineWidth=0.5; ctx.stroke();
      }
      for(let col=0;col<=COLS;col++){
        ctx.beginPath();
        for(let row=0;row<=ROWS;row++){
          const bx=col*cW,by=row*cH,{dx,dy}=getD(bx,by);
          const px=bx+dx,py=by+dy;
          if(row===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
        }
        ctx.strokeStyle="rgba(0,150,220,0.04)"; ctx.lineWidth=0.4; ctx.stroke();
      }
      ripplesRef.current=ripples.filter(r=>now-r.t<RIPPLE_LIFETIME);
      const cg=ctx.createRadialGradient(mx*w,my*h,0,mx*w,my*h,Math.min(w,h)*.4);
      cg.addColorStop(0,"rgba(0,200,255,0.05)"); cg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=cg; ctx.fillRect(0,0,w,h);
      raf = requestAnimationFrame(draw);
    };

    const handleGlobalMouseMove = (e) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const x = e.clientX / w;
      const y = e.clientY / h;
      mouseRef.current = { x, y };

      if (Math.random() < 0.14) {
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
  }, []);
}

function CustomCursor() {
  const dotRef=useRef(null), ringRef=useRef(null);
  useEffect(()=>{
    const mv=e=>{
      if(dotRef.current){dotRef.current.style.left=e.clientX+"px";dotRef.current.style.top=e.clientY+"px";}
      if(ringRef.current){ringRef.current.style.left=e.clientX+"px";ringRef.current.style.top=e.clientY+"px";}
    };
    window.addEventListener("mousemove",mv); return ()=>window.removeEventListener("mousemove",mv);
  },[]);
  return (<>
    <div ref={dotRef} style={{position:"fixed",width:8,height:8,background:"#00d4ff",borderRadius:"50%",
      pointerEvents:"none",zIndex:9999,transform:"translate(-50%,-50%)",
      boxShadow:"0 0 12px #00d4ff,0 0 24px rgba(0,212,255,.5)"}}/>
    <div ref={ringRef} style={{position:"fixed",width:36,height:36,
      border:"1px solid rgba(0,212,255,.5)",borderRadius:"50%",
      pointerEvents:"none",zIndex:9998,transform:"translate(-50%,-50%)",transition:"all .15s ease"}}/>
  </>);
}

export default function Login({ onBack }) {
  const navigate = useNavigate();
  const canvasRef=useRef(null), ripplesRef=useRef([]), mouseRef=useRef({x:.5,y:.5});
  const [risen, setRisen]=useState(false);
  const [email,setEmail]=useState(""), [pass,setPass]=useState("");
  const [loading,setLoading]=useState(false), [done,setDone]=useState(false);
  const [err,setErr]=useState("");

  useWaterCanvas(canvasRef, ripplesRef, mouseRef);
  useEffect(()=>{ const t=setTimeout(()=>setRisen(true),400); return ()=>clearTimeout(t); },[]);

  const addRipple=(x,y,click=true)=>{
    ripplesRef.current.push({x,y,t:performance.now(),strength:click?1:.35,click});
    if(ripplesRef.current.length>MAX_RIPPLES) ripplesRef.current.shift();
  };
  const handleBgClick=useCallback((e)=>{
    const c=canvasRef.current; if(!c) return;
    const r=c.getBoundingClientRect();
    addRipple((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height,true);
  },[]);

  const handleSubmit=async(e)=>{
    e.stopPropagation();
    setErr("");
    if(!email || !pass){
      setErr("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginApi({ email, password: pass });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Login failed. Check your credentials.");
      }

      const token = payload.token || payload.accessToken;
      const role = (payload.role || payload.user?.role || "USER").toUpperCase();
      if (!token) {
        throw new Error("Login response did not return a valid token.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", payload.name || payload.user?.name || "");
      localStorage.setItem("email", payload.email || payload.user?.email || email);
      localStorage.setItem("phone", payload.phone || payload.user?.phone || "");
      
      setDone(true);

      const normalizedRole = role === "PROVIDER" ? "MANAGER" : role;
      const targetRoute = normalizedRole === "ADMIN" ? "/admin" : normalizedRole === "MANAGER" ? "/manager" : "/user";
      setTimeout(() => navigate(targetRoute), 900);
    } catch (error) {
      setErr(error.message || "Unable to reach login service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={handleBgClick}
      style={{position:"relative",width:"100vw",height:"100vh",overflow:"hidden",cursor:"none",
        fontFamily:"'Rajdhani','Orbitron',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .scanline{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.04) 2px,rgba(0,0,0,.04) 4px);pointer-events:none;z-index:3;}
        .vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,.72) 100%);pointer-events:none;z-index:4;}
        .glowline{position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,212,255,.6),transparent);animation:scanmv 9s linear infinite;z-index:5;}
        @keyframes scanmv{0%{top:-2px;opacity:0}5%{opacity:1}95%{opacity:.4}100%{top:100%;opacity:0}}
        .hud{position:absolute;width:24px;height:24px;border-color:rgba(0,212,255,.4);border-style:solid;pointer-events:none;z-index:8;}
        .htl{top:24px;left:24px;border-width:1px 0 0 1px;} .htr{top:24px;right:24px;border-width:1px 1px 0 0;}
        .hbl{bottom:24px;left:24px;border-width:0 0 1px 1px;} .hbr{bottom:24px;right:24px;border-width:0 1px 1px 0;}
        @keyframes riseUp{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:translateY(0)}}
        .water-input{
          width:100%; padding:12px 16px;
          background:rgba(0,212,255,.05);
          border:1px solid rgba(0,212,255,.25);
          color:#fff; font-family:'Rajdhani',sans-serif; font-size:15px;
          outline:none; transition:border-color .3s, box-shadow .3s;
          margin-bottom:14px;
        }
        .water-input:focus{border-color:rgba(0,212,255,.7);box-shadow:0 0 16px rgba(0,212,255,.15);}
        .water-input::placeholder{color:rgba(255,255,255,.25);}
        .login-btn{
          width:100%; padding:13px;
          background:rgba(0,212,255,.1);
          border:1px solid #00d4ff; color:#00d4ff;
          font-family:'Orbitron',monospace; font-size:12px; letter-spacing:.3em;
          text-transform:uppercase; cursor:pointer;
          transition:all .3s ease;
        }
        .login-btn:hover{background:rgba(0,212,255,.2);box-shadow:0 0 24px rgba(0,212,255,.3);}
        .login-btn:disabled{opacity:.5;cursor:not-allowed;}
        .back-btn{background:none;border:none;color:rgba(0,212,255,.5);
          font-family:'Orbitron',monospace;font-size:10px;letter-spacing:.25em;
          cursor:pointer;padding:0;text-transform:uppercase;transition:color .3s;}
        .back-btn:hover{color:#00d4ff;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:18px;height:18px;border:2px solid rgba(0,212,255,.2);
          border-top-color:#00d4ff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;vertical-align:middle;margin-right:8px;}
        @keyframes checkIn{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        .waterline-svg{position:absolute;bottom:0;left:0;width:100%;pointer-events:none;z-index:6;}
      `}</style>

      <CustomCursor/>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,zIndex:1,display:"block"}}/>
      <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",
        background:"linear-gradient(180deg,rgba(0,30,60,.1) 0%,transparent 50%,rgba(0,30,60,.15) 100%)"}}/>
      <div className="scanline"/> <div className="vignette"/> <div className="glowline"/>
      <div className="hud htl"/> <div className="hud htr"/> <div className="hud hbl"/> <div className="hud hbr"/>

      {/* brand */}
      <div style={{position:"absolute",top:28,left:48,zIndex:10,
        fontFamily:"'Orbitron',monospace",fontSize:"clamp(10px,1.5vw,13px)",
        color:"rgba(0,212,255,.6)",letterSpacing:".3em",textTransform:"uppercase"}}>
        SRM · STUDIO
      </div>
      <button className="back-btn" onClick={e=>{e.stopPropagation();if(onBack)onBack();}}
        style={{position:"absolute",top:32,right:48,zIndex:10}}>
        ← Back to Landing
      </button>

      {/* decorative water SVG — bottom */}
      <svg className="waterline-svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0,60 Q180,20 360,60 Q540,100 720,60 Q900,20 1080,60 Q1260,100 1440,60 L1440,120 L0,120Z"
          fill="rgba(0,212,255,0.04)"/>
        <path d="M0,80 Q180,50 360,80 Q540,110 720,80 Q900,50 1080,80 Q1260,110 1440,80"
          fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="1"/>
      </svg>

      {/* login card — water lo nunchi rise avvutundi */}
      <div style={{position:"absolute",inset:0,zIndex:9,display:"flex",
        alignItems:"center",justifyContent:"center"}}>
        <div onClick={e=>e.stopPropagation()} style={{
          width:"clamp(300px,90vw,420px)",
          opacity: risen?1:0,
          transform: risen?"translateY(0)":"translateY(70px)",
          transition:"opacity .7s ease, transform .7s cubic-bezier(0.23,1,0.32,1)",
        }}>
          {/* card */}
          <div style={{
            background:"rgba(0,10,20,0.75)",
            border:"1px solid rgba(0,212,255,.2)",
            backdropFilter:"blur(12px)",
            padding:"clamp(28px,5vw,44px)",
            position:"relative",
          }}>
            {/* corner accents */}
            {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((s,i)=>(
              <div key={i} style={{position:"absolute",width:12,height:12,...s,
                borderColor:"#00d4ff",borderStyle:"solid",
                borderWidth: i===0?"1px 0 0 1px":i===1?"1px 1px 0 0":i===2?"0 0 1px 1px":"0 1px 1px 0"}}/>
            ))}

            {!done ? (<>
              <div style={{marginBottom:28,textAlign:"center"}}>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,
                  letterSpacing:".4em",color:"rgba(0,212,255,.5)",textTransform:"uppercase",marginBottom:12}}>
                  SRM Studio
                </div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(20px,4vw,28px)",
                  fontWeight:900,color:"#fff",letterSpacing:".05em",marginBottom:6}}>
                  Login to Your Account
                </div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.4)",letterSpacing:".1em"}}>
                  Access your service request dashboard and manage tickets.
                </div>
              </div>

              <div style={{width:60,height:1,background:"linear-gradient(90deg,transparent,rgba(0,212,255,.4),transparent)",margin:"0 auto 28px"}}/>

              <div>
                  {/* Hidden fields to capture browser autofill and reduce popup overlap */}
                  <div style={{position:'absolute',left:'-9999px',top:'auto',width:1,height:1,overflow:'hidden'}} aria-hidden="true">
                    <input type="text" name="username" autoComplete="username" defaultValue="" />
                    <input type="password" name="password" autoComplete="current-password" defaultValue="" />
                  </div>
                <label style={{display:"block",fontSize:10,letterSpacing:".25em",
                  color:"rgba(0,212,255,.6)",textTransform:"uppercase",marginBottom:6}}>
                  Email
                </label>
                  <input className="water-input" name="username" autoComplete="username" type="email" placeholder="email@example.com"
                    value={email} onChange={e=>setEmail(e.target.value)}/>

                <label style={{display:"block",fontSize:10,letterSpacing:".25em",
                  color:"rgba(0,212,255,.6)",textTransform:"uppercase",marginBottom:6}}>
                  Password
                </label>
                <input className="water-input" name="current-password" autoComplete="current-password" type="password" placeholder="••••••••"
                  value={pass} onChange={e=>setPass(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSubmit(e)}/>

                {err&&(
                  <div style={{fontSize:12,color:"rgba(255,80,80,.8)",marginBottom:12,
                    letterSpacing:".1em",textAlign:"center"}}>
                    ⚠ {err}
                  </div>
                )}

                <button className="login-btn" disabled={loading} onClick={handleSubmit}>
                  {loading?(<><span className="spinner"/><span>Verifying...</span></>):"Log In →"}
                </button>

                <div style={{marginTop:18,textAlign:"center",fontSize:12,
                  color:"rgba(255,255,255,.3)",letterSpacing:".05em"}}>
                  Don't have an account?{" "}
                  <span style={{color:"rgba(0,212,255,.7)",cursor:"pointer",
                    textDecoration:"underline",textUnderlineOffset:3}}
                    onClick={e=>{e.stopPropagation(); navigate("/register");}}>
                    Create one now
                  </span>
                </div>
              </div>
            </>) : (
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontSize:52,marginBottom:20,animation:"checkIn .5s ease"}}>✦</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:"clamp(14px,3vw,20px)",
                  fontWeight:900,color:"#00d4ff",letterSpacing:".1em",marginBottom:10}}>
                  Logged In!
                </div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.5)",letterSpacing:".08em"}}>
                  Your service request dashboard is ready.
                </div>
                <div style={{marginTop:24,display:"flex",justifyContent:"center",gap:8}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#00d4ff",
                      animation:`pulse 1s ${i*.2}s infinite`}}/>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* water reflection */}
          <div style={{
            height:24,
            background:"linear-gradient(180deg,rgba(0,212,255,.04),transparent)",
            transform:"scaleY(-1) scaleX(.95)",
            opacity:.4,
            filter:"blur(2px)",
            marginTop:2,
          }}/>
        </div>
      </div>
    </div>
  );
}
