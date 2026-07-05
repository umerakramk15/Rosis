import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useWishlistStore from "../store/wishlistStore";
import useCartStore from "../store/cartStore";
import { wishlistAPI } from "../api/index";
import { toast } from "react-toastify";

/* ═══ ICONS ═══ */
const Ic = ({d,size=18,sw=2,c="currentColor",fill="none"}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    <path d={d}/>
  </svg>
);
const IC = {
  heart:  "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  cart:   "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  trash:  "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  chevL:  "M15 19l-7-7 7-7",
  check:  "M5 13l4 4L19 7",
  x:      "M6 18L18 6M6 6l12 12",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
};

/* ═══ SKELETON ═══ */
const SkCard = () => (
  <div style={{background:"white",borderRadius:22,overflow:"hidden",border:"1.5px solid #f0d5d8"}}>
    <div style={{height:280,background:"linear-gradient(90deg,#fde8e8 25%,#fdf0f0 50%,#fde8e8 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:8}}>
      <div style={{height:12,borderRadius:6,background:"linear-gradient(90deg,#fde8e8 25%,#fdf0f0 50%,#fde8e8 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite",width:"70%"}}/>
      <div style={{height:14,borderRadius:6,background:"linear-gradient(90deg,#fde8e8 25%,#fdf0f0 50%,#fde8e8 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite",width:"50%"}}/>
      <div style={{height:36,borderRadius:12,background:"linear-gradient(90deg,#fde8e8 25%,#fdf0f0 50%,#fde8e8 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite",marginTop:4}}/>
    </div>
  </div>
);

/* ═══ PRODUCT CARD ═══ */
function WishCard({ product, onRemove, onMoveToCart, onNavigate }) {
  const [hov, setHov] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [moving, setMoving]     = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(product._id);
    setRemoving(false);
  };

  const handleMove = async () => {
    setMoving(true);
    await onMoveToCart(product._id);
    setMoving(false);
  };

  const inStock = product.stock > 0;

  return (
    <div style={{background:"white",borderRadius:22,overflow:"hidden",border:"1.5px solid #f0d5d8",transition:"transform .3s,box-shadow .3s",transform:hov?"translateY(-5px)":"none",boxShadow:hov?"0 16px 40px rgba(180,80,80,.13)":"0 2px 12px rgba(140,40,60,.06)",animation:"fadeUp .35s ease both"}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>

      {/* Image */}
      <div style={{position:"relative",height:280,background:"#fdf5f5",overflow:"hidden",cursor:"pointer"}} onClick={() => onNavigate(product._id)}>
        <img src={product.images?.[0]?.url||"https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400"}
          alt={product.name} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .6s",transform:hov?"scale(1.07)":"scale(1)"}}/>

        {/* Category badge */}
        <span style={{position:"absolute",top:12,left:12,background:"#c9727a",color:"white",fontFamily:"'DM Sans',sans-serif",fontSize:".6rem",fontWeight:800,padding:"3px 10px",borderRadius:999,textTransform:"capitalize"}}>
          {product.category}
        </span>

        {/* Stock badge */}
        {!inStock && (
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{background:"white",color:"#dc2626",fontFamily:"'DM Sans',sans-serif",fontSize:".82rem",fontWeight:800,padding:"6px 16px",borderRadius:999}}>Out of Stock</span>
          </div>
        )}

        {/* Remove button */}
        <button onClick={e=>{e.stopPropagation();handleRemove();}}
          style={{position:"absolute",top:12,right:12,width:32,height:32,borderRadius:"50%",background:"white",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.12)",transition:"all .2s"}}
          onMouseEnter={e=>{e.currentTarget.style.background="#fee2e2";}}
          onMouseLeave={e=>{e.currentTarget.style.background="white";}}>
          {removing
            ? <div style={{width:12,height:12,borderRadius:"50%",border:"2px solid #fca5a5",borderTopColor:"#dc2626",animation:"spin .7s linear infinite"}}/>
            : <Ic d={IC.trash} size={14} c="#dc2626" sw={2}/>}
        </button>
      </div>

      {/* Info */}
      <div style={{padding:"16px"}}>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:".68rem",color:"#9a7080",marginBottom:3,textTransform:"capitalize"}}>{product.category}</p>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:"1rem",color:"#1e1018",marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:"pointer"}}
          onClick={() => onNavigate(product._id)}>
          {product.name}
        </p>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:800,fontSize:"1rem",color:"#c9727a"}}>Rs. {product.price?.toLocaleString()}</span>
          {product.ratings?.average > 0 && (
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:".72rem",color:"#9a7080"}}>⭐ {product.ratings.average.toFixed(1)}</span>
          )}
        </div>
        <button onClick={handleMove} disabled={!inStock||moving}
          style={{width:"100%",padding:"11px",borderRadius:14,border:"none",background:!inStock||moving?"#e8b0b8":"linear-gradient(135deg,#c9727a,#e8a0a0)",color:"white",fontFamily:"'DM Sans',sans-serif",fontSize:".8rem",fontWeight:800,cursor:!inStock||moving?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .25s",boxShadow:inStock&&!moving?"0 4px 14px rgba(180,80,80,.25)":"none"}}>
          {moving
            ? <><div style={{width:13,height:13,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"white",animation:"spin .7s linear infinite"}}/> Moving…</>
            : <><Ic d={IC.cart} size={15} c="white" sw={2}/> {inStock ? "Move to Cart" : "Out of Stock"}</>}
        </button>
      </div>
    </div>
  );
}

/* ═══ MAIN PAGE ═══ */
export default function WishlistPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchWishlist();
  }, [user, navigate]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await wishlistAPI.getWishlist();
      setItems(res.data.data.wishlist || []);
    } catch (err) {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await wishlistAPI.toggleWishlist(productId);
      setItems(prev => prev.filter(p => p._id !== productId));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      const result = await addToCart(productId, 1);
      if (result.success) {
        await wishlistAPI.toggleWishlist(productId);
        setItems(prev => prev.filter(p => p._id !== productId));
        toast.success("Moved to cart!");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to move to cart");
    }
  };

  const handleClearAll = async () => {
    try {
      await wishlistAPI.clearWishlist();
      setItems([]);
      toast.success("Wishlist cleared");
    } catch {
      toast.error("Failed to clear wishlist");
    }
  };

  const filtered = search.trim()
    ? items.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div style={{minHeight:"100vh",background:"#faf7f4",fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#e8a0a0;border-radius:4px;}
        img{display:block;}
      `}</style>

      {/* HEADER */}
      <div style={{background:"white",borderBottom:"1.5px solid #f0d5d8",padding:"16px clamp(16px,4vw,32px)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 16px rgba(140,40,60,.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <button onClick={() => navigate(-1)}
            style={{background:"#fde8e8",border:"none",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Ic d={IC.chevL} size={16} c="#c9727a" sw={2.5}/>
          </button>
          <div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:"clamp(1.2rem,3vw,1.6rem)",color:"#1e1018"}}>My Wishlist</h1>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:".72rem",color:"#9a7080"}}>{items.length} saved item{items.length!==1?"s":""}</p>
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {/* Search */}
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
              <Ic d={IC.search} size={14} c="#c9727a" sw={2}/>
            </span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search wishlist…"
              style={{padding:"8px 12px 8px 32px",borderRadius:12,border:"1.5px solid #f0d5d8",fontFamily:"'DM Sans',sans-serif",fontSize:".78rem",color:"#1e1018",background:"white",outline:"none",width:200}}
              onFocus={e=>{e.target.style.borderColor="#c9727a";}}
              onBlur={e=>{e.target.style.borderColor="#f0d5d8";}}/>
          </div>
          {items.length > 0 && (
            <button onClick={handleClearAll}
              style={{padding:"8px 16px",borderRadius:12,border:"1.5px solid #fca5a5",background:"#fee2e2",color:"#dc2626",fontFamily:"'DM Sans',sans-serif",fontSize:".75rem",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              <Ic d={IC.trash} size={13} c="#dc2626" sw={2}/> Clear All
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:1200,margin:"0 auto",padding:"24px clamp(16px,4vw,32px)"}}>
        {loading ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:20}}>
            {Array(6).fill(0).map((_,i) => <SkCard key={i}/>)}
          </div>
        ) : items.length === 0 ? (
          <div style={{textAlign:"center",padding:"80px 20px",animation:"fadeUp .4s ease"}}>
            <div style={{width:80,height:80,borderRadius:24,background:"#fde8e8",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
              <Ic d={IC.heart} size={36} c="#e8a0a0" sw={1.5}/>
            </div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:"1.5rem",color:"#1e1018",marginBottom:8}}>Your wishlist is empty</h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:".85rem",color:"#9a7080",marginBottom:24,maxWidth:340,margin:"0 auto 24px"}}>Browse our products and save items you love to your wishlist.</p>
            <button onClick={() => navigate("/products")}
              style={{padding:"12px 28px",borderRadius:16,border:"none",background:"linear-gradient(135deg,#c9727a,#e8a0a0)",color:"white",fontFamily:"'DM Sans',sans-serif",fontSize:".85rem",fontWeight:800,cursor:"pointer",boxShadow:"0 6px 20px rgba(180,80,80,.28)"}}>
              Browse Products
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"60px",color:"#9a7080",fontFamily:"'DM Sans',sans-serif"}}>
            <p style={{fontSize:"1rem",marginBottom:8}}>No items match your search.</p>
            <button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:"#c9727a",fontWeight:700,fontSize:".82rem"}}>Clear search</button>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:20}}>
            {filtered.map((product,i) => (
              <div key={product._id} style={{animationDelay:`${i*.05}s`}}>
                <WishCard
                  product={product}
                  onRemove={handleRemove}
                  onMoveToCart={handleMoveToCart}
                  onNavigate={id => navigate(`/products/${id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
