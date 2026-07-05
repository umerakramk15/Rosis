import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { userAPI } from "../api/index";
import { toast } from "react-toastify";

/* ═══ TOKENS ═══ */
const C = {
  rose:"#c9727a", roseLt:"#e8a0a0", roseXs:"#fde8e8", roseDk:"#8b3a4a",
  ink:"#1e1018", plum:"#2d1a22", cream:"#faf7f4", gold:"#c8a04a",
  border:"#f0d5d8", muted:"#9a7080",
};

/* ═══ ICONS ═══ */
const IC = {
  chevL:  "M15 19l-7-7 7-7",
  store:  "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  user:   "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  lock:   "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  bell:   "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  check:  "M5 13l4 4L19 7",
  eye:    "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  eyeOff: "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22",
  edit:   "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  phone:  "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  mail:   "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
};

const Ic = ({d,size=16,sw=2,c="currentColor",fill="none"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    <path d={d}/>
  </svg>
);

/* ═══ REUSABLE COMPONENTS ═══ */
const Spinner = () => (
  <div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"white",animation:"spin .7s linear infinite"}}/>
);

function Field({ label, id, type="text", placeholder, value, onChange, hint, required, half }) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const isPw = type === "password";
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5,gridColumn:half?"span 1":"span 2"}}>
      <label htmlFor={id} style={{fontFamily:"'DM Sans',sans-serif",fontSize:".7rem",fontWeight:800,color:focused?C.rose:C.muted,letterSpacing:".04em",transition:"color .18s"}}>
        {label}{required&&<span style={{color:C.rose,marginLeft:2}}>*</span>}
      </label>
      <div style={{position:"relative"}}>
        <input id={id} type={isPw&&showPw?"text":type} placeholder={placeholder} value={value} onChange={onChange}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          style={{width:"100%",padding:`10px ${isPw?"40px":"14px"} 10px 13px`,border:`1.5px solid ${focused?C.rose:C.border}`,borderRadius:12,background:"white",fontFamily:"'DM Sans',sans-serif",fontSize:".83rem",color:C.ink,outline:"none",boxShadow:focused?`0 0 0 3px rgba(201,114,122,.1)`:"none",transition:"border .2s,box-shadow .2s"}}/>
        {isPw && (
          <button type="button" onClick={()=>setShowPw(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:2}}>
            <Ic d={showPw?IC.eyeOff:IC.eye} size={14} c={C.muted} sw={2}/>
          </button>
        )}
      </div>
      {hint && <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:".65rem",color:C.muted}}>{hint}</span>}
    </div>
  );
}

function Toggle({ label, sub, on, onChange }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:"#fdf8f8",borderRadius:14,border:`1.5px solid ${C.border}`,marginBottom:10,cursor:"pointer"}} onClick={()=>onChange(!on)}>
      <div>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:".83rem",color:C.ink}}>{label}</p>
        {sub && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:".72rem",color:C.muted,marginTop:2}}>{sub}</p>}
      </div>
      <div style={{width:44,height:24,borderRadius:999,background:on?"linear-gradient(135deg,#c9727a,#e8a0a0)":"#e5e7eb",transition:"background .22s",display:"flex",alignItems:"center",padding:"2px",flexShrink:0}}>
        <div style={{width:20,height:20,borderRadius:"50%",background:"white",transform:on?"translateX(20px)":"translateX(0)",transition:"transform .22s",boxShadow:"0 1px 4px rgba(0,0,0,.18)"}}/>
      </div>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div style={{background:"white",border:`1.5px solid ${C.border}`,borderRadius:22,overflow:"hidden",animation:"fadeUp .4s ease both"}}>
      <div style={{padding:"16px 22px",borderBottom:`1.5px solid ${C.border}`,background:"linear-gradient(90deg,#fdf8f8,white)",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#fde8e8,#fff0f5)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Ic d={icon} size={16} c={C.rose} sw={2}/>
        </div>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:"1.1rem",color:C.ink}}>{title}</h3>
      </div>
      <div style={{padding:"22px"}}>{children}</div>
    </div>
  );
}

function PwStrength({ password }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const colors   = ["#ef4444","#f59e0b","#22c55e","#16a34a"];
  const labels   = ["Weak","Fair","Good","Strong"];
  return (
    <div>
      <div style={{display:"flex",gap:4,marginBottom:5}}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{flex:1,height:4,borderRadius:999,background:i<strength?colors[strength-1]:C.border,transition:"background .3s"}}/>
        ))}
      </div>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:".65rem",color:C.muted}}>
        Strength: <strong style={{color:colors[strength-1]||C.muted}}>{labels[strength-1]||"—"}</strong>
      </p>
    </div>
  );
}

/* ═══ MAIN PAGE ═══ */
export default function MerchantSettings() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [activeSection, setActiveSection] = useState("profile");
  const [saving, setSaving]               = useState(false);

  // Profile form
  const [profile, setProfile] = useState({ name:"", phone:"" });

  // Password form
  const [pwForm, setPwForm] = useState({ current:"", newPw:"", confirm:"" });

  // Notification prefs
  const [notifs, setNotifs] = useState({
    newOrder: true, lowStock: true, priceAlert: false, weeklyReport: true,
  });

  // Load user data
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "merchant") { navigate("/customer/dashboard"); return; }
    setProfile({ name: user.name || "", phone: user.phone || "" });
  }, [user, navigate]);

  // Save profile
  const handleSaveProfile = async () => {
    if (!profile.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      if (profile.phone) formData.append("phone", profile.phone);
      await userAPI.updateProfile(formData);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) { toast.error("All password fields are required"); return; }
    if (pwForm.newPw !== pwForm.confirm) { toast.error("Passwords do not match"); return; }
    if (pwForm.newPw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSaving(true);
    try {
      const { authAPI } = await import("../api/authAPI");
      await authAPI.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      toast.success("Password updated successfully!");
      setPwForm({ current:"", newPw:"", confirm:"" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "M";

  const NAV_ITEMS = [
    { id:"profile",       label:"Profile",       icon:IC.user   },
    { id:"security",      label:"Security",      icon:IC.shield },
    { id:"notifications", label:"Notifications", icon:IC.bell   },
  ];

  return (
    <div style={{minHeight:"100vh",background:C.cream,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#e8a0a0;border-radius:4px;}
        img{display:block;} input,select,button{font-family:inherit;}
      `}</style>

      {/* HEADER */}
      <div style={{background:"white",borderBottom:`1.5px solid ${C.border}`,padding:"16px clamp(16px,4vw,32px)",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 16px rgba(140,40,60,.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <button onClick={() => navigate("/merchant/dashboard")}
            style={{background:C.roseXs,border:"none",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Ic d={IC.chevL} size={16} c={C.rose} sw={2.5}/>
          </button>
          <div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:"clamp(1.2rem,3vw,1.6rem)",color:C.ink}}>Merchant Settings</h1>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:".72rem",color:C.muted}}>Manage your account and preferences</p>
          </div>
        </div>
        <button onClick={handleLogout}
          style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:12,border:`1.5px solid ${C.border}`,background:"white",color:C.muted,fontFamily:"'DM Sans',sans-serif",fontSize:".78rem",fontWeight:700,cursor:"pointer"}}>
          <Ic d={IC.logout} size={14} c="currentColor" sw={2}/> Logout
        </button>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px clamp(16px,4vw,32px)",display:"grid",gridTemplateColumns:"220px 1fr",gap:24,alignItems:"start"}}>

        {/* SIDEBAR */}
        <div style={{position:"sticky",top:80}}>
          {/* Merchant card */}
          <div style={{background:"white",border:`1.5px solid ${C.border}`,borderRadius:22,padding:"20px",marginBottom:16,textAlign:"center"}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#c9727a,#e8a0a0)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",boxShadow:"0 4px 16px rgba(180,80,80,.22)"}}>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:"1.3rem",color:"white"}}>{initials}</span>
            </div>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:"1rem",color:C.ink}}>{user?.name}</p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:".72rem",color:C.muted,marginTop:2}}>{user?.email}</p>
            <span style={{display:"inline-block",marginTop:8,padding:"3px 12px",borderRadius:999,background:"linear-gradient(135deg,#fde8e8,#fff0f5)",color:C.rose,fontFamily:"'DM Sans',sans-serif",fontSize:".65rem",fontWeight:800,letterSpacing:".06em"}}>✦ MERCHANT</span>
          </div>

          {/* Nav */}
          <div style={{background:"white",border:`1.5px solid ${C.border}`,borderRadius:22,padding:"10px",overflow:"hidden"}}>
            {NAV_ITEMS.map(item => {
              const isAct = activeSection === item.id;
              return (
                <button key={item.id} onClick={() => setActiveSection(item.id)}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",marginBottom:3,borderRadius:14,border:"none",background:isAct?"linear-gradient(135deg,#fde8e8,#fff0f5)":"transparent",cursor:"pointer",transition:"all .2s",textAlign:"left",boxShadow:isAct?"inset 3px 0 0 #c9727a":"none"}}>
                  <div style={{width:30,height:30,borderRadius:9,background:isAct?"linear-gradient(135deg,#c9727a,#e8a0a0)":"transparent",border:isAct?"none":`1.5px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
                    <Ic d={item.icon} size={14} c={isAct?"white":C.muted} sw={isAct?2:1.8}/>
                  </div>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:isAct?800:500,fontSize:".82rem",color:isAct?C.roseDk:C.muted,transition:"color .2s"}}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{display:"flex",flexDirection:"column",gap:20}}>

          {/* ── PROFILE SECTION ── */}
          {activeSection === "profile" && (
            <>
              <Card title="Personal Information" icon={IC.user}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
                  <div style={{gridColumn:"span 2"}}>
                    <Field label="Full Name" id="name" placeholder="Your full name" value={profile.name} onChange={e=>setProfile(f=>({...f,name:e.target.value}))} required/>
                  </div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:".7rem",fontWeight:800,color:C.muted,letterSpacing:".04em",display:"block",marginBottom:5}}>EMAIL ADDRESS</label>
                    <div style={{padding:"10px 14px",border:`1.5px solid ${C.border}`,borderRadius:12,background:"#f8f8f8",fontFamily:"'DM Sans',sans-serif",fontSize:".83rem",color:C.muted}}>{user?.email}</div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:".65rem",color:C.muted,marginTop:4}}>Email address cannot be changed</p>
                  </div>
                  <div style={{gridColumn:"span 2"}}>
                    <Field label="Phone Number" id="phone" type="tel" placeholder="+92 300 1234567" value={profile.phone || ""} onChange={e=>setProfile(f=>({...f,phone:e.target.value}))} hint="Used for order notifications"/>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"flex-end",marginTop:22}}>
                  <button onClick={handleSaveProfile} disabled={saving}
                    style={{display:"flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:14,border:"none",background:saving?"#e8b0b8":"linear-gradient(135deg,#c9727a,#e8a0a0)",color:"white",fontFamily:"'DM Sans',sans-serif",fontSize:".82rem",fontWeight:800,cursor:saving?"not-allowed":"pointer",boxShadow:"0 5px 18px rgba(180,80,80,.25)"}}>
                    {saving ? <><Spinner/> Saving…</> : <><Ic d={IC.check} size={15} c="white" sw={2.5}/> Save Profile</>}
                  </button>
                </div>
              </Card>

              {/* Account Info */}
              <Card title="Account Information" icon={IC.store}>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {[
                    { label:"Account Type",  val:"Merchant Account", accent:C.rose },
                    { label:"Member Since",  val:user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-PK", {year:"numeric",month:"long",day:"numeric"}) : "—" },
                    { label:"Account ID",    val:user?._id?.slice(-12).toUpperCase() || "—" },
                    { label:"Email Status",  val:"Verified ✓", accent:"#16a34a" },
                  ].map((r,i) => (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"#fdf8f8",borderRadius:12,border:`1px solid ${C.border}`}}>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:".78rem",color:C.muted,fontWeight:500}}>{r.label}</span>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:".82rem",fontWeight:800,color:r.accent||C.ink}}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* ── SECURITY SECTION ── */}
          {activeSection === "security" && (
            <>
              <Card title="Change Password" icon={IC.lock}>
                <div style={{display:"flex",flexDirection:"column",gap:16}}>
                  <Field label="Current Password" id="cp" type="password" placeholder="••••••••" value={pwForm.current} onChange={e=>setPwForm(f=>({...f,current:e.target.value}))} required/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                    <Field label="New Password" id="np" type="password" placeholder="Min. 8 characters" value={pwForm.newPw} onChange={e=>setPwForm(f=>({...f,newPw:e.target.value}))} half hint="Use uppercase, lowercase, numbers and symbols"/>
                    <Field label="Confirm Password" id="cf" type="password" placeholder="Repeat new password" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))} half/>
                  </div>
                  <PwStrength password={pwForm.newPw}/>
                  {pwForm.newPw && pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:".72rem",color:"#dc2626",fontWeight:700}}>✗ Passwords do not match</p>
                  )}
                </div>
                <div style={{display:"flex",justifyContent:"flex-end",marginTop:22}}>
                  <button onClick={handleChangePassword} disabled={saving || !pwForm.current || !pwForm.newPw || !pwForm.confirm}
                    style={{display:"flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:14,border:"none",background:saving||!pwForm.current?"#e8b0b8":"linear-gradient(135deg,#c9727a,#e8a0a0)",color:"white",fontFamily:"'DM Sans',sans-serif",fontSize:".82rem",fontWeight:800,cursor:"pointer",boxShadow:"0 5px 18px rgba(180,80,80,.25)"}}>
                    {saving ? <><Spinner/> Updating…</> : <><Ic d={IC.shield} size={15} c="white" sw={2}/> Update Password</>}
                  </button>
                </div>
              </Card>

              <Card title="Security Tips" icon={IC.shield}>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    "Use a unique password that you don't use elsewhere",
                    "Enable 2FA for extra account security",
                    "Never share your login credentials with anyone",
                    "Log out from shared or public computers",
                  ].map((tip,i) => (
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"12px 14px",background:"#fdf8f8",borderRadius:12,border:`1px solid ${C.border}`}}>
                      <Ic d={IC.check} size={14} c={C.rose} sw={2.5}/>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:".78rem",color:C.ink,lineHeight:1.5}}>{tip}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* ── NOTIFICATIONS SECTION ── */}
          {activeSection === "notifications" && (
            <Card title="Notification Preferences" icon={IC.bell}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:".82rem",color:C.muted,marginBottom:18,lineHeight:1.6}}>
                Choose which notifications you want to receive via email.
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {[
                  { key:"newOrder",      label:"New Order Alerts",    sub:"Get notified when a customer places a new order"          },
                  { key:"lowStock",      label:"Low Stock Warnings",  sub:"Alert when product stock falls below threshold"           },
                  { key:"priceAlert",    label:"AI Price Suggestions", sub:"Notify when AI suggests a new price for your products"   },
                  { key:"weeklyReport",  label:"Weekly Sales Report", sub:"Receive a weekly summary of your store performance"       },
                ].map(n => (
                  <Toggle
                    key={n.key}
                    label={n.label}
                    sub={n.sub}
                    on={notifs[n.key]}
                    onChange={v => {
                      setNotifs(prev => ({...prev, [n.key]: v}));
                      toast.success(`${n.label} ${v ? "enabled" : "disabled"}`);
                    }}
                  />
                ))}
              </div>
              <div style={{marginTop:16,padding:"14px 16px",background:"linear-gradient(135deg,#fde8e8,#fff0f5)",border:`1.5px solid #f5c8cc`,borderRadius:14}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:".78rem",color:C.roseDk}}>
                  📧 Notifications are sent to <strong>{user?.email}</strong>
                </p>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
