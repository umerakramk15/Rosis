import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { orderAPI } from "../api/index";
import { toast } from "react-toastify";

/* ═══ STATUS CONFIG ═══ */
const STATUS_META = {
  pending:    { color:"#b45309", bg:"#fef3c7", border:"#fde68a", dot:"#f59e0b", label:"Pending"    },
  confirmed:  { color:"#1d4ed8", bg:"#eff6ff", border:"#bfdbfe", dot:"#3b82f6", label:"Confirmed"  },
  processing: { color:"#6d28d9", bg:"#f5f3ff", border:"#ddd6fe", dot:"#8b5cf6", label:"Processing" },
  shipped:    { color:"#0369a1", bg:"#e0f2fe", border:"#bae6fd", dot:"#0ea5e9", label:"Shipped"    },
  delivered:  { color:"#065f46", bg:"#ecfdf5", border:"#a7f3d0", dot:"#10b981", label:"Delivered"  },
  cancelled:  { color:"#991b1b", bg:"#fef2f2", border:"#fecaca", dot:"#ef4444", label:"Cancelled"  },
};

const STATUS_FLOW = ["pending","confirmed","processing","shipped","delivered"];

const fmtDate = d => new Date(d).toLocaleDateString("en-PK", { day:"2-digit", month:"short", year:"numeric" });

/* ═══ ICONS ═══ */
const P = {
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  eye:    "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  x:      "M6 18L18 6M6 6l12 12",
  chevL:  "M15 19l-7-7 7-7",
  chevD:  "M19 9l-7 7-7-7",
  check:  "M5 13l4 4L19 7",
  pkg:    "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  truck:  "M1 3h15v13H1zm15 5h4l3 3v5h-7V8z",
  map:    "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
  mail:   "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  refresh:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
};
const Ic = ({d,size=16,sw=1.8,c="currentColor",fill="none"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

/* ═══ STATUS BADGE ═══ */
const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 11px", borderRadius:999, background:m.bg, border:`1px solid ${m.border}`, color:m.color, fontFamily:"'DM Sans',sans-serif", fontSize:".67rem", fontWeight:800, letterSpacing:".04em", whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:m.dot, flexShrink:0 }}/>
      {m.label}
    </span>
  );
};

/* ═══ STATUS DROPDOWN ═══ */
const StatusDropdown = ({ current, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const allowedNext = STATUS_FLOW.filter(s => {
    const ci = STATUS_FLOW.indexOf(current);
    const si = STATUS_FLOW.indexOf(s);
    return si > ci;
  });

  if (disabled || ["delivered","cancelled"].includes(current)) {
    return <StatusBadge status={current}/>;
  }

  return (
    <div ref={ref} style={{ position:"relative", zIndex:20 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:10, border:`1.5px solid ${open?"#c9727a":"#f0d5d8"}`, background:open?"#fdf5f5":"white", fontFamily:"'DM Sans',sans-serif", fontSize:".74rem", fontWeight:800, color:open?"#c9727a":"#6b4d5a", cursor:"pointer", transition:"all .18s", whiteSpace:"nowrap" }}>
        <Ic d={P.refresh} size={12} sw={2} c="currentColor"/>
        Update
        <Ic d={P.chevD} size={11} sw={2.5} c="currentColor"/>
      </button>
      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 8px)", left:0, background:"white", borderRadius:16, border:"1.5px solid #f0d5d8", boxShadow:"0 16px 40px rgba(140,40,60,.16)", minWidth:180, overflow:"hidden", zIndex:300 }}>
          <div style={{ padding:"8px 12px 5px", borderBottom:"1px solid #f8eded" }}>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".6rem", fontWeight:800, color:"#b09090", letterSpacing:".1em" }}>UPDATE STATUS</p>
          </div>
          {allowedNext.length === 0 ? (
            <div style={{ padding:"12px 14px" }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".75rem", color:"#b09090" }}>No further updates available</p>
            </div>
          ) : allowedNext.map(s => {
            const m = STATUS_META[s];
            return (
              <button key={s} onClick={() => { onChange(s); setOpen(false); }}
                style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 14px", border:"none", background:"white", cursor:"pointer", transition:"background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background="#fdfafa"}
                onMouseLeave={e => e.currentTarget.style.background="white"}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:m.dot, flexShrink:0 }}/>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".78rem", fontWeight:700, color:m.color }}>{m.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ═══ ORDER DETAIL MODAL ═══ */
function OrderDetailModal({ order, onClose, onStatusUpdate }) {
  if (!order) return null;
  const total = order.total || order.items?.reduce((s,i) => s + i.price * i.qty, 0) || 0;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(20,10,16,.55)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"flex-end", backdropFilter:"blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width:"100%", maxWidth:520, height:"100vh", background:"white", overflowY:"auto", boxShadow:"-20px 0 60px rgba(140,40,60,.18)", display:"flex", flexDirection:"column" }}>
        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:"1.5px solid #f0d5d8", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"white", zIndex:10 }}>
          <div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".65rem", fontWeight:800, color:"#b09090", letterSpacing:".1em" }}>ORDER DETAILS</p>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.25rem", color:"#1e1018" }}>
              #{order._id.slice(-8).toUpperCase()}
            </h3>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:10, background:"#fde8e8", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <Ic d={P.x} size={15} c="#c9727a" sw={2.5}/>
          </button>
        </div>

        <div style={{ flex:1, padding:"20px 24px", display:"flex", flexDirection:"column", gap:20 }}>
          {/* Status + Update */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:"#fdf8f8", borderRadius:16, border:"1.5px solid #f0d5d8" }}>
            <div>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".68rem", fontWeight:800, color:"#b09090", letterSpacing:".06em", marginBottom:6 }}>CURRENT STATUS</p>
              <StatusBadge status={order.orderStatus}/>
            </div>
            <StatusDropdown
              current={order.orderStatus}
              onChange={status => onStatusUpdate(order._id, status)}
            />
          </div>

          {/* Customer Info */}
          <div style={{ background:"white", border:"1.5px solid #f0d5d8", borderRadius:16, overflow:"hidden" }}>
            <div style={{ padding:"10px 16px", borderBottom:"1px solid #f0d5d8", background:"#fdf8f8" }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".66rem", fontWeight:800, color:"#b09090", letterSpacing:".1em" }}>CUSTOMER</p>
            </div>
            <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { icon:P.pkg,  label:"Name",    val: order.userId?.name || "Customer" },
                { icon:P.mail, label:"Email",   val: order.userId?.email || "—" },
                { icon:P.map,  label:"Ship To", val: order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.city}` : "—" },
              ].map(r => (
                <div key={r.label} style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:"#fde8e8", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                    <Ic d={r.icon} size={13} c="#c9727a" sw={2}/>
                  </div>
                  <div>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".65rem", fontWeight:800, color:"#b09090", letterSpacing:".06em" }}>{r.label}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".8rem", fontWeight:600, color:"#1e1018", marginTop:1 }}>{r.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div style={{ background:"white", border:"1.5px solid #f0d5d8", borderRadius:16, overflow:"hidden" }}>
            <div style={{ padding:"10px 16px", borderBottom:"1px solid #f0d5d8", background:"#fdf8f8" }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".66rem", fontWeight:800, color:"#b09090", letterSpacing:".1em" }}>
                ORDER ITEMS ({order.items?.length})
              </p>
            </div>
            <div style={{ padding:"8px 0" }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:i < order.items.length-1 ? "1px solid #faf0f2" : "none" }}>
                  <div style={{ width:44, height:44, borderRadius:10, background:"#fdf5f5", border:"1px solid #f0d5d8", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Ic d={P.pkg} size={16} c="#e8a0a0" sw={1.5}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:".82rem", color:"#1e1018", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".7rem", color:"#b09090" }}>Qty: {item.qty} × Rs. {item.price?.toLocaleString()}</p>
                  </div>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:".95rem", color:"#c9727a", flexShrink:0 }}>
                    Rs. {(item.price * item.qty)?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div style={{ background:"linear-gradient(135deg,#fde8e8,#fff0f5)", border:"1.5px solid #f5c8cc", borderRadius:16, padding:"16px 20px" }}>
            {[
              { label:"Subtotal",    val:`Rs. ${order.subtotal?.toLocaleString() || 0}` },
              order.discount > 0 ? { label:"Discount", val:`-Rs. ${order.discount}`, accent:"#16a34a" } : null,
              { label:"Delivery",    val:order.deliveryFee === 0 ? "FREE" : `Rs. ${order.deliveryFee}`, accent:order.deliveryFee===0?"#16a34a":undefined },
            ].filter(Boolean).map((r,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".78rem", color:"#8a6060" }}>{r.label}</span>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".78rem", fontWeight:700, color:r.accent||"#1e1018" }}>{r.val}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1.5px solid #f5c8cc", paddingTop:10, marginTop:4 }}>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1rem", color:"#1e1018" }}>Total</span>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.15rem", color:"#c9727a" }}>Rs. {total?.toLocaleString()}</span>
            </div>
          </div>

          {/* Date */}
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", color:"#b09090", textAlign:"center" }}>
            Order placed on {fmtDate(order.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══ SKELETON ═══ */
const Sk = ({h=52,r=10}) => (
  <div style={{height:h,borderRadius:r,background:"linear-gradient(90deg,#fde8e8 25%,#fdf0f0 50%,#fde8e8 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>
);

/* ═══ MAIN PAGE ═══ */
export default function OrdersManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const LIMIT = 15;

  // Redirect if not merchant
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "merchant") { navigate("/customer/dashboard"); return; }
  }, [user, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, ...(statusFilter !== "all" && { status: statusFilter }) };
      const res = await orderAPI.getMerchantOrders(params);
      setOrders(res.data.data.orders || []);
      setTotal(res.data.data.total || 0);
      setTotalPages(res.data.data.pages || 1);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await orderAPI.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o._id === orderId ? {...o, orderStatus: status} : o));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({...prev, orderStatus: status}));
      }
      toast.success(`Order updated to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
    } finally {
      setUpdatingId(null);
    }
  };

  // Client-side search filter
  const filtered = search.trim()
    ? orders.filter(o =>
        o._id.includes(search) ||
        o.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.userId?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  // KPI counts
  const counts = orders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ minHeight:"100vh", background:"#faf7f4" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar{width:4px;height:4px;} ::-webkit-scrollbar-thumb{background:#e8a0a0;border-radius:4px;}
        img { display:block; }
      `}</style>

      {/* HEADER */}
      <div style={{ background:"white", borderBottom:"1.5px solid #f0d5d8", padding:"16px clamp(16px,4vw,32px)", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 16px rgba(140,40,60,.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={() => navigate("/merchant/dashboard")}
            style={{ background:"#fde8e8", border:"none", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <Ic d={P.chevL} size={16} c="#c9727a" sw={2.5}/>
          </button>
          <div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"clamp(1.2rem,3vw,1.6rem)", color:"#1e1018" }}>Order Management</h1>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", color:"#9a7080" }}>{total} total orders</p>
          </div>
        </div>
        <button onClick={fetchOrders}
          style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:12, border:"1.5px solid #f0d5d8", background:"white", color:"#c9727a", fontFamily:"'DM Sans',sans-serif", fontSize:".78rem", fontWeight:700, cursor:"pointer" }}>
          <Ic d={P.refresh} size={14} c="#c9727a" sw={2}/> Refresh
        </button>
      </div>

      {/* KPI PILLS */}
      <div style={{ padding:"14px clamp(16px,4vw,32px)", display:"flex", gap:10, flexWrap:"wrap" }}>
        {[
          { key:"all",        label:"All Orders",  count:total },
          { key:"pending",    label:"Pending",     count:counts.pending    || 0 },
          { key:"confirmed",  label:"Confirmed",   count:counts.confirmed  || 0 },
          { key:"processing", label:"Processing",  count:counts.processing || 0 },
          { key:"shipped",    label:"Shipped",     count:counts.shipped    || 0 },
          { key:"delivered",  label:"Delivered",   count:counts.delivered  || 0 },
          { key:"cancelled",  label:"Cancelled",   count:counts.cancelled  || 0 },
        ].map(s => {
          const isAct = statusFilter === s.key;
          return (
            <button key={s.key} onClick={() => { setStatusFilter(s.key); setPage(1); }}
              style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:999, border:`1.5px solid ${isAct?"#c9727a":"#f0d5d8"}`, background:isAct?"linear-gradient(135deg,#c9727a,#e8a0a0)":"white", color:isAct?"white":"#9a7080", fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", fontWeight:800, cursor:"pointer", transition:"all .18s", whiteSpace:"nowrap" }}>
              {s.label}
              {s.count > 0 && (
                <span style={{ padding:"1px 7px", borderRadius:999, background:isAct?"rgba(255,255,255,.25)":"#fde8e8", color:isAct?"white":"#c9727a", fontSize:".62rem", fontWeight:900 }}>
                  {s.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SEARCH */}
      <div style={{ padding:"0 clamp(16px,4vw,32px) 14px" }}>
        <div style={{ position:"relative", maxWidth:380 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}><Ic d={P.search} size={15} c="#c9727a" sw={2}/></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID or customer…"
            style={{ width:"100%", padding:"10px 14px 10px 36px", borderRadius:14, border:"1.5px solid #f0d5d8", fontFamily:"'DM Sans',sans-serif", fontSize:".83rem", color:"#1e1018", background:"white", outline:"none", boxShadow:"0 2px 8px rgba(140,40,60,.05)" }}
            onFocus={e => {e.target.style.borderColor="#c9727a"; e.target.style.boxShadow="0 0 0 3px rgba(201,114,122,.1)";}}
            onBlur={e => {e.target.style.borderColor="#f0d5d8"; e.target.style.boxShadow="0 2px 8px rgba(140,40,60,.05)";}}/>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ padding:"0 clamp(16px,4vw,32px) 28px" }}>
        <div style={{ background:"white", border:"1.5px solid #f0d5d8", borderRadius:22, overflow:"hidden", boxShadow:"0 2px 16px rgba(140,40,60,.07)", animation:"fadeUp .4s ease both" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:750 }}>
              <thead>
                <tr style={{ background:"#fdf8f8", borderBottom:"1.5px solid #f0d5d8" }}>
                  {["Order ID","Customer","Items","Total","Status","Date","Actions"].map((h,i) => (
                    <th key={i} style={{ padding:"12px 16px", textAlign:"left", fontFamily:"'DM Sans',sans-serif", fontSize:".64rem", fontWeight:900, color:"#b09090", letterSpacing:".1em", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding:20 }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {[1,2,3,4,5].map(i => <Sk key={i}/>)}
                    </div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding:"60px 20px", textAlign:"center" }}>
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.2rem", color:"#c9727a" }}>No orders found</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".78rem", color:"#b09090", marginTop:6 }}>Try adjusting your filters</p>
                  </td></tr>
                ) : filtered.map((order, i) => (
                  <tr key={order._id} style={{ borderBottom:"1px solid #faf0f2", transition:"background .15s", cursor:"pointer", animation:`fadeUp .3s ${i*.04}s ease both` }}
                    onMouseEnter={e => e.currentTarget.style.background="#fdfafa"}
                    onMouseLeave={e => e.currentTarget.style.background="white"}>

                    {/* Order ID */}
                    <td style={{ padding:"13px 16px" }}>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:".8rem", color:"#c9727a" }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".67rem", color:"#b09090", marginTop:2 }}>
                        {order.paymentStatus === "paid" ? "✓ Paid" : "⏳ Pending"}
                      </p>
                    </td>

                    {/* Customer */}
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#c9727a,#e8a0a0)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:".78rem", color:"white" }}>
                            {order.userId?.name?.charAt(0)?.toUpperCase() || "C"}
                          </span>
                        </div>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:".78rem", color:"#1e1018", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:140 }}>
                            {order.userId?.name || "Customer"}
                          </p>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".67rem", color:"#b09090", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:140 }}>
                            {order.userId?.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Items */}
                    <td style={{ padding:"13px 16px" }}>
                      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".78rem", color:"#6b4d5a", fontWeight:600 }}>
                        {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                      </p>
                      {order.items?.[0] && (
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".67rem", color:"#b09090", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:160 }}>
                          {order.items[0].name}{order.items.length > 1 ? ` +${order.items.length-1}` : ""}
                        </p>
                      )}
                    </td>

                    {/* Total */}
                    <td style={{ padding:"13px 16px" }}>
                      <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1rem", color:"#1e1018" }}>
                        Rs. {order.total?.toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding:"13px 16px" }}>
                      <StatusBadge status={order.orderStatus}/>
                    </td>

                    {/* Date */}
                    <td style={{ padding:"13px 16px" }}>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".75rem", color:"#9a7080" }}>
                        {fmtDate(order.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <button onClick={() => setSelectedOrder(order)}
                          style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:10, border:"1.5px solid #f0d5d8", background:"white", color:"#c9727a", fontFamily:"'DM Sans',sans-serif", fontSize:".72rem", fontWeight:700, cursor:"pointer", transition:"all .18s", whiteSpace:"nowrap" }}
                          onMouseEnter={e => {e.currentTarget.style.background="#c9727a"; e.currentTarget.style.color="white"; e.currentTarget.style.borderColor="#c9727a";}}
                          onMouseLeave={e => {e.currentTarget.style.background="white"; e.currentTarget.style.color="#c9727a"; e.currentTarget.style.borderColor="#f0d5d8";}}>
                          <Ic d={P.eye} size={12} c="currentColor" sw={2}/> View
                        </button>
                        {updatingId === order._id ? (
                          <div style={{ width:14, height:14, borderRadius:"50%", border:"2px solid #f0d5d8", borderTopColor:"#c9727a", animation:"spin .7s linear infinite" }}/>
                        ) : (
                          <StatusDropdown
                            current={order.orderStatus}
                            onChange={status => handleStatusUpdate(order._id, status)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div style={{ padding:"16px 20px", borderTop:"1px solid #f0d5d8", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:".75rem", color:"#9a7080" }}>
                Page {page} of {totalPages} · {total} orders
              </p>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  style={{ padding:"7px 14px", borderRadius:10, border:"1.5px solid #f0d5d8", background:"white", color:"#c9727a", fontFamily:"'DM Sans',sans-serif", fontSize:".75rem", fontWeight:700, cursor:page===1?"not-allowed":"pointer", opacity:page===1?.5:1 }}>
                  ← Prev
                </button>
                {Array.from({length:Math.min(5,totalPages)},(_,i)=>i+1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    style={{ width:34, height:34, borderRadius:10, border:`1.5px solid ${page===n?"#c9727a":"#f0d5d8"}`, background:page===n?"linear-gradient(135deg,#c9727a,#e8a0a0)":"white", color:page===n?"white":"#6b4d5a", fontFamily:"'DM Sans',sans-serif", fontSize:".78rem", fontWeight:800, cursor:"pointer" }}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  style={{ padding:"7px 14px", borderRadius:10, border:"1.5px solid #f0d5d8", background:"white", color:"#c9727a", fontFamily:"'DM Sans',sans-serif", fontSize:".75rem", fontWeight:700, cursor:page===totalPages?"not-allowed":"pointer", opacity:page===totalPages?.5:1 }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
