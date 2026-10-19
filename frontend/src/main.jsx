import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ShoppingBag, ShoppingCart, Search, UserRound, LogOut, PackageCheck, Plus, Minus, Trash2, X, Menu, ShieldCheck } from "lucide-react";
import api from "./api";
import "./style.css";

// Context makes login state and cart available to the whole React application.
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

const demoProducts = [
  { _id: "demo-1", name: "Wireless Headphones", category: "Electronics", price: 1499, stock: 15, description: "Comfortable everyday sound with a clean, minimal design.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80" },
  { _id: "demo-2", name: "Classic Sneakers", category: "Fashion", price: 2199, stock: 12, description: "Lightweight sneakers for your daily routine.", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80" },
  { _id: "demo-3", name: "Smart Watch", category: "Electronics", price: 3299, stock: 8, description: "A smart companion for activity and everyday notifications.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80" },
  { _id: "demo-4", name: "Everyday Backpack", category: "Accessories", price: 1299, stock: 20, description: "A roomy backpack for classes, work, and weekend trips.", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80" },
  { _id: "demo-5", name: "Desk Lamp", category: "Home", price: 899, stock: 18, description: "A simple lamp for focused study sessions.", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80" },
  { _id: "demo-6", name: "Ceramic Coffee Mug", category: "Home", price: 349, stock: 30, description: "A sturdy ceramic mug for your coffee or tea.", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80" },
];

function money(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);
}

function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("shoplite_user") || "null"); }
    catch { return null; }
  });
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("shoplite_cart") || "[]"); }
    catch { return []; }
  });

  // Persist cart so a page refresh does not immediately empty it.
  useEffect(() => localStorage.setItem("shoplite_cart", JSON.stringify(cart)), [cart]);

  const value = useMemo(() => ({
    user, setUser, cart, setCart,
    signOut() {
      localStorage.removeItem("shoplite_token");
      localStorage.removeItem("shoplite_user");
      setUser(null);
    },
  }), [user, cart]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function Header({ page, setPage, openAuth, setShowCart }) {
  const { user, signOut, cart } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = (next) => { setPage(next); setMobileOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <button className="brand" onClick={() => navigate("home")} aria-label="ShopLite home"><span className="brand-mark"><ShoppingBag size={20}/></span> shoplite<span className="brand-dot">.</span></button>
        <nav className={mobileOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation">
          <button className={page === "home" ? "nav-link active" : "nav-link"} onClick={() => navigate("home")}>Shop</button>
          <button className={page === "orders" ? "nav-link active" : "nav-link"} onClick={() => user ? navigate("orders") : openAuth("login")}>My orders</button>
          {user?.role === "admin" && <button className={page === "admin" ? "nav-link active" : "nav-link"} onClick={() => navigate("admin")}>Admin</button>}
        </nav>
        <div className="nav-actions">
          <button className="icon-button cart-button" onClick={() => setShowCart(true)} aria-label="Open cart"><ShoppingCart size={19}/><span className="cart-count">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span></button>
          {user ? <button className="account-button" onClick={signOut}><LogOut size={16}/> <span>Sign out</span></button> : <button className="account-button" onClick={() => openAuth("login")}><UserRound size={16}/> <span>Sign in</span></button>}
          <button className="mobile-menu icon-button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen ? <X size={20}/> : <Menu size={20}/>}</button>
        </div>
      </div>
    </header>
  );
}

function ProductCard({ product, addToCart }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.image || "https://placehold.co/600x450?text=ShopLite"} alt={product.name} className="product-image" loading="lazy" />
        <span className="product-category">{product.category}</span>
      </div>
      <div className="product-info">
        <div className="product-heading"><h3>{product.name}</h3><strong>{money(product.price)}</strong></div>
        <p>{product.description}</p>
        <button className="add-button" onClick={() => addToCart(product)} disabled={product.stock < 1}><Plus size={16}/>{product.stock < 1 ? "Out of stock" : "Add to cart"}</button>
      </div>
    </article>
  );
}

function Storefront({ products, addToCart, openAuth }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];
  const visible = products.filter((p) => {
    const matchesText = `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(search.toLowerCase());
    return matchesText && (category === "All" || p.category === category);
  });

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot"/> YOUR EVERYDAY MARKETPLACE</span>
          <h1>Good finds.<br/><span>Better everyday.</span></h1>
          <p>Thoughtfully picked essentials for your everyday life. Find your next favourite thing, all in one place.</p>
          <a className="primary-button hero-cta" href="#products">Explore collection <span>↘</span></a>
          <div className="hero-note"><ShieldCheck size={17}/> Simple shopping. Secure sign-in. Easy orders.</div>
        </div>
        <div className="hero-art">
          <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
          <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=850&q=85" alt="Minimal wristwatch product" />
          <div className="floating-card"><span className="floating-star">✦</span><div><strong>Made for your day</strong><small>Everyday essentials, reimagined.</small></div></div>
        </div>
      </section>

      <section className="trust-strip">
        <div><strong>Curated picks</strong><span>Useful things, chosen well</span></div>
        <div><strong>Clear pricing</strong><span>No checkout surprises</span></div>
        <div><strong>Made simple</strong><span>Browse, add, and order</span></div>
      </section>

      <section className="products-section" id="products">
        <div className="section-top"><div><span className="eyebrow">THE COLLECTION</span><h2>Find your <span>everyday.</span></h2><p>Little upgrades that make a difference.</p></div><span className="result-count">{visible.length} products</span></div>
        <div className="filter-row">
          <label className="search-box"><Search size={18}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." aria-label="Search products"/></label>
          <div className="category-filters">{categories.map((item) => <button key={item} className={category === item ? "filter-chip selected" : "filter-chip"} onClick={() => setCategory(item)}>{item}</button>)}</div>
        </div>
        {visible.length ? <div className="product-grid">{visible.map((product) => <ProductCard key={product._id} product={product} addToCart={addToCart}/>)}</div> : <div className="empty-state"><ShoppingBag size={30}/><h3>No products found</h3><p>Try another search or category.</p></div>}
        <p className="demo-note">Demo store for the Week 4 MERN assignment. Prices are shown in INR; checkout does not charge real money.</p>
      </section>
      <section className="newsletter"><div><span className="eyebrow">A LITTLE NOTE FROM US</span><h2>Good things, <span>good days.</span></h2><p>Sign in to keep track of your orders and make shopping easier.</p></div><button className="primary-button" onClick={() => openAuth("signup")}>Create an account <span>↗</span></button></section>
    </>
  );
}

function AuthModal({ mode, setMode, close, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const response = await api.post(endpoint, { name, email, password });
      onSuccess(response.data);
      close();
    } catch (err) {
      setError(err.response?.data?.message || "Could not connect to the API. Check the backend and VITE_API_URL.");
    } finally { setBusy(false); }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="modal-close icon-button" onClick={close} aria-label="Close"><X size={20}/></button>
        <span className="modal-mark"><ShoppingBag size={22}/></span>
        <span className="eyebrow">{mode === "signup" ? "JOIN THE COMMUNITY" : "WELCOME BACK"}</span>
        <h2 id="auth-title">{mode === "signup" ? "Create your account" : "Sign in to ShopLite"}</h2>
        <p>{mode === "signup" ? "A few details and you're all set." : "Your next good find is just a click away."}</p>
        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" && <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder="Your name"/></label>}
          <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"/></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="At least 8 characters"/></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button full-button" disabled={busy}>{busy ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"} <span>↗</span></button>
        </form>
        <p className="switch-auth">{mode === "signup" ? "Already have an account?" : "New to ShopLite?"} <button onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}>{mode === "signup" ? "Sign in" : "Create account"}</button></p>
      </section>
    </div>
  );
}

function CartDrawer({ close, checkout, busy }) {
  const { cart, setCart } = useApp();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const update = (id, delta) => setCart((old) => old.map((item) => item._id === id ? { ...item, quantity: Math.max(1, Math.min(99, item.quantity + delta)) } : item));
  return (
    <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <aside className="cart-drawer" aria-label="Shopping cart">
        <div className="drawer-header"><div><span className="eyebrow">YOUR BAG</span><h2>Shopping cart <span>({cart.length})</span></h2></div><button className="icon-button" onClick={close} aria-label="Close cart"><X/></button></div>
        <div className="cart-items">
          {cart.length ? cart.map((item) => <div className="cart-item" key={item._id}><img src={item.image || "https://placehold.co/160x160?text=Item"} alt={item.name}/><div className="cart-item-details"><strong>{item.name}</strong><span>{money(item.price)}</span><div className="quantity-control"><button onClick={() => update(item._id, -1)} aria-label="Decrease quantity"><Minus size={13}/></button><span>{item.quantity}</span><button onClick={() => update(item._id, 1)} aria-label="Increase quantity"><Plus size={13}/></button></div></div><button className="remove-item" onClick={() => setCart((old) => old.filter((x) => x._id !== item._id))} aria-label={`Remove ${item.name}`}><Trash2 size={16}/></button></div>) : <div className="empty-state cart-empty"><ShoppingCart size={32}/><h3>Your cart is empty</h3><p>Find something you love and add it here.</p></div>}
        </div>
        <div className="cart-footer"><div className="subtotal"><span>Subtotal</span><strong>{money(total)}</strong></div><p>Shipping and taxes are included in this demo checkout.</p><button className="primary-button full-button" onClick={checkout} disabled={!cart.length || busy}>{busy ? "Placing order..." : "Checkout"} <span>↗</span></button></div>
      </aside>
    </div>
  );
}

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { api.get("/orders/my").then((r) => setOrders(r.data.orders)).catch((e) => setError(e.response?.data?.message || "Could not load orders")); }, []);
  return <section className="subpage"><span className="eyebrow">YOUR ACCOUNT</span><h1>Your <span>orders.</span></h1><p className="subpage-intro">A handy record of the things you've ordered.</p>{error && <p className="form-error">{error}</p>}{orders.length ? <div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div className="order-top"><div><small>ORDER ID</small><strong>#{order._id.slice(-8).toUpperCase()}</strong></div><span className="order-status">{order.status}</span></div><div className="order-lines">{order.items.map((item, i) => <div key={`${order._id}-${i}`}><span>{item.name} × {item.quantity}</span><strong>{money(item.price * item.quantity)}</strong></div>)}</div><div className="order-total"><span>Order total</span><strong>{money(order.total)}</strong></div><small className="order-date">{new Date(order.createdAt).toLocaleString()}</small></article>)}</div> : !error && <div className="empty-state"><PackageCheck size={34}/><h3>No orders yet</h3><p>Your placed orders will appear here.</p></div>}</section>;
}

function AdminPage({ products, reload }) {
  const empty = { name: "", category: "General", description: "", price: "", stock: "20", image: "" };
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const setField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setBusy(true); setMessage(""); setError("");
    try {
      await api.post("/admin/products", { ...form, price: Number(form.price), stock: Number(form.stock) });
      setMessage("Product created successfully."); setForm(empty); await reload();
    } catch (err) { setError(err.response?.data?.message || "Could not create product"); }
    finally { setBusy(false); }
  }

  async function remove(id) {
    if (!window.confirm("Delete this product?")) return;
    try { await api.delete(`/admin/products/${id}`); await reload(); }
    catch (err) { setError(err.response?.data?.message || "Could not delete product"); }
  }

  return <section className="subpage"><span className="eyebrow">STORE MANAGEMENT</span><h1>Admin <span>dashboard.</span></h1><p className="subpage-intro">Add products and keep the store collection up to date.</p><div className="admin-layout"><form className="admin-form" onSubmit={submit}><h2><Plus size={20}/> Add a product</h2><label>Product name<input name="name" value={form.name} onChange={setField} required/></label><div className="form-two"><label>Price (₹)<input name="price" type="number" min="0" value={form.price} onChange={setField} required/></label><label>Stock<input name="stock" type="number" min="0" value={form.stock} onChange={setField} required/></label></div><label>Category<input name="category" value={form.category} onChange={setField} required/></label><label>Image URL<input name="image" type="url" value={form.image} onChange={setField} placeholder="https://..."/></label><label>Description<textarea name="description" value={form.description} onChange={setField} rows="3"/></label>{message && <p className="success-message">{message}</p>}{error && <p className="form-error">{error}</p>}<button className="primary-button full-button" disabled={busy}>{busy ? "Saving..." : "Save product"} <span>↗</span></button></form><div className="admin-products"><h2>Current products <span>{products.length}</span></h2>{products.map((product) => <div className="admin-product" key={product._id}><img src={product.image || "https://placehold.co/100x100?text=Item"} alt=""/><div><strong>{product.name}</strong><small>{money(product.price)} · Stock {product.stock}</small></div><button className="remove-item" onClick={() => remove(product._id)} aria-label={`Delete ${product.name}`}><Trash2 size={16}/></button></div>)}</div></div></section>;
}

function Footer() {
  return <footer className="site-footer"><div className="footer-main"><button className="brand footer-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span className="brand-mark"><ShoppingBag size={19}/></span> shoplite<span className="brand-dot">.</span></button><p>Everyday essentials, thoughtfully picked.</p><span className="footer-project">A MERN stack capstone project</span></div><div className="footer-bottom"><span>© {new Date().getFullYear()} ShopLite demo store</span><span>Built with React · Express · MongoDB</span></div></footer>;
}

function App() {
  const { user, setUser, cart, setCart } = useApp();
  const [page, setPage] = useState("home");
  const [products, setProducts] = useState(demoProducts);
  const [apiReady, setApiReady] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadProducts() {
    try {
      const response = await api.get("/products");
      setProducts(response.data.products);
      setApiReady(true);
    } catch {
      setApiReady(false);
      // Demo products keep the UI browsable when the API is not running.
      setProducts(demoProducts);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  function authSuccess(data) {
    localStorage.setItem("shoplite_token", data.token);
    localStorage.setItem("shoplite_user", JSON.stringify(data.user));
    setUser(data.user);
    setNotice(`Welcome${data.user.name ? `, ${data.user.name}` : ""}!`);
  }

  function addToCart(product) {
    setCart((old) => {
      const found = old.find((item) => item._id === product._id);
      if (found) return old.map((item) => item._id === product._id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock || 99) } : item);
      return [...old, { ...product, quantity: 1 }];
    });
    setNotice(`${product.name} added to cart`);
    window.setTimeout(() => setNotice(""), 2500);
  }

  async function checkout() {
    if (!user) { setShowCart(false); setAuthMode("login"); return; }
    if (cart.some((item) => String(item._id).startsWith("demo-")) && !apiReady) {
      setNotice("Start the backend and load database products before checkout.");
      window.setTimeout(() => setNotice(""), 3500);
      return;
    }
    setCartBusy(true);
    try {
      const response = await api.post("/orders", { items: cart.map((item) => ({ productId: item._id, quantity: item.quantity })) });
      setCart([]);
      setShowCart(false);
      setNotice(response.data.message);
      setPage("orders");
      await loadProducts();
    } catch (err) {
      setNotice(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setCartBusy(false);
      window.setTimeout(() => setNotice(""), 3500);
    }
  }

  return (
    <>
      <Header page={page} setPage={setPage} openAuth={setAuthMode} setShowCart={setShowCart}/>
      {!apiReady && <div className="api-banner">Preview mode: connect the backend and MongoDB to enable signup, checkout, and saved products.</div>}
      <main>
        {page === "home" && <Storefront products={products} addToCart={addToCart} openAuth={setAuthMode}/>}
        {page === "orders" && (user ? <OrdersPage/> : <div className="subpage"><h1>Please sign in</h1><button className="primary-button" onClick={() => setAuthMode("login")}>Sign in ↗</button></div>)}
        {page === "admin" && (user?.role === "admin" ? <AdminPage products={products} reload={loadProducts}/> : <div className="subpage"><h1>Admin access required</h1><p>Sign in with the configured administrator email.</p></div>)}
      </main>
      <Footer/>
      {showCart && <CartDrawer close={() => setShowCart(false)} checkout={checkout} busy={cartBusy}/>}
      {authMode && <AuthModal mode={authMode} setMode={setAuthMode} close={() => setAuthMode(null)} onSuccess={authSuccess}/>}
      {notice && <div className="toast" role="status">{notice}</div>}
    </>
  );
}

function Root() {
  return <AppProvider><App/></AppProvider>;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><Root/></React.StrictMode>);
