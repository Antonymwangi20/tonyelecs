import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import CartDrawer from './CartDrawer';
import WishlistDrawer from './WishlistDrawer';
import ChatAssistant from './ChatAssistant';
import FilterBar from './FilterBar';
import AuthModal from './AuthModal';
import ProductDetailsModal from './ProductDetailsModal';
import UserProfileModal from './UserProfileModal';
import PaymentModal from './PaymentModal';
import { PRODUCTS as DEFAULT_PRODUCTS, CATEGORIES } from '../constants';
import { Product, CartItem, SortOption, UserRole, User, Review, Order } from '../types';
import { Package, Truck, ShieldCheck, Headphones, Plus, LogIn, Zap, User as UserIcon } from 'lucide-react';

interface MainShopProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
}

const MainShop: React.FC<MainShopProps> = ({ products, onProductsChange }) => {
  const navigate = useNavigate();
  const { user: authUser, logout: authLogout } = useAuth();
  
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use passed products or localStorage
  const [shopProducts, setShopProducts] = useState<Product[]>(
    products && products.length > 0 ? products : (() => {
      const saved = localStorage.getItem('vv-products');
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS.map(p => ({ ...p, reviewList: p.reviewList || [] }));
    })()
  );

  // Convert auth user to User type for display
  const user: User | null = authUser ? {
    id: authUser.id,
    email: authUser.email,
    name: authUser.name || 'User',
    role: authUser.role,
    avatar: authUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.email}`
  } : null;

  const role: UserRole = user?.role || 'customer';
  
  // Permissions Helpers
  const canAddProduct = role === 'super-admin';
  const canEditProduct = role === 'super-admin' || role === 'manager';
  const canDeleteProduct = role === 'super-admin';

  // Cart & Wishlist States
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('vv-cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlistItems, setWishlistItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem('vv-wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // UI States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter States
  const absoluteMaxPrice = useMemo(() => Math.max(...shopProducts.map(p => p.price), 1000), [shopProducts]);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [maxPrice, setMaxPrice] = useState<number>(5000); 
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyHot, setOnlyHot] = useState<boolean>(false);

  useEffect(() => {
    if (maxPrice === 5000) setMaxPrice(absoluteMaxPrice);
  }, [absoluteMaxPrice]);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('vv-user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('vv-products', JSON.stringify(shopProducts)); onProductsChange(shopProducts); }, [shopProducts, onProductsChange]);
  useEffect(() => { localStorage.setItem('vv-cart', JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => { localStorage.setItem('vv-wishlist', JSON.stringify(wishlistItems)); }, [wishlistItems]);

  // Dark Mode
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    handleThemeChange(darkModeMediaQuery);
    darkModeMediaQuery.addEventListener('change', handleThemeChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let result = shopProducts.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = p.price <= maxPrice;
      const matchesRating = (p.rating || 0) >= minRating;
      const matchesHot = !onlyHot || p.isHot;
      return matchesCategory && matchesSearch && matchesPrice && matchesRating && matchesHot;
    });

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      default: result.sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0)); break;
    }
    return result;
  }, [shopProducts, activeCategory, searchQuery, maxPrice, minRating, onlyHot, sortBy]);

  // Product CRUD
  const handleSaveProduct = (product: Product) => {
    if (!canEditProduct) return;
    setShopProducts(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) return prev.map(p => p.id === product.id ? product : p);
      return [{ ...product, reviewList: [] }, ...prev];
    });
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (!canDeleteProduct) return;
    if (window.confirm('Delete this product? This action cannot be undone.')) {
      setShopProducts(prev => prev.filter(p => p.id !== id));
      setCartItems(prev => prev.filter(p => p.id !== id));
      setWishlistItems(prev => prev.filter(p => p.id !== id));
    }
  };

  // Review Logic
  const handleAddReview = (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setShopProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updatedList = [newReview, ...(p.reviewList || [])];
        const avgRating = updatedList.reduce((acc, r) => acc + r.rating, 0) / updatedList.length;
        return {
          ...p,
          reviewList: updatedList,
          rating: Number(avgRating.toFixed(1)),
          reviews: updatedList.length
        };
      }
      return p;
    }));

    // Update selected product for modal refresh
    if (selectedProduct?.id === productId) {
      setSelectedProduct(prev => {
        if (!prev) return null;
        const updatedList = [newReview, ...(prev.reviewList || [])];
        const avgRating = updatedList.reduce((acc, r) => acc + r.rating, 0) / updatedList.length;
        return {
          ...prev,
          reviewList: updatedList,
          rating: Number(avgRating.toFixed(1)),
          reviews: updatedList.length
        };
      });
    }
  };

  // Cart & Wishlist Logic
  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const removeFromCart = (id: string) => setCartItems(prev => prev.filter(item => item.id !== id));
  
  const toggleWishlist = (product: Product) => {
    setWishlistItems(prev => prev.find(item => item.id === product.id) ? prev.filter(item => item.id !== product.id) : [...prev, product]);
  };

  const removeFromWishlist = (id: string) => setWishlistItems(prev => prev.filter(item => item.id !== id));

  const handleViewProduct = (p: Product) => {
    setSelectedProduct(p);
    setIsDetailsOpen(true);
  };

  const handleCheckoutInitiate = (total: number) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setPaymentTotal(total);
    setIsPaymentOpen(true);
    setIsCartOpen(false);
  };

  const handlePaymentSuccess = () => {
    if (!user) return;
    
    const newOrder: Order = {
      id: `VV-${Math.floor(Math.random() * 90000 + 10000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      total: paymentTotal,
      status: 'Processing',
      items: cartItems.map(item => item.name)
    };

    // TODO: Save order to backend/database
    // For now, just store in localStorage
    const orders = JSON.parse(localStorage.getItem('vv-orders') || '[]');
    localStorage.setItem('vv-orders', JSON.stringify([newOrder, ...orders]));

    setCartItems([]);
    setIsPaymentOpen(false);
    setIsProfileOpen(true);
  };

  // Remove cycleRole since we're using real auth now
  const handleLogout = async () => {
    await authLogout();
    setCartItems([]);
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-500">
      <Navbar 
        onCartClick={() => setIsCartOpen(true)} 
        onWishlistClick={() => setIsWishlistOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        onSupportClick={() => navigate('/support')}
        onAdminClick={() => navigate('/admin')}
        cartCount={cartItems.reduce((a, b) => a + b.quantity, 0)}
        wishlistCount={wishlistItems.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        role={role}
        user={user}
        products={shopProducts}
        onViewProduct={handleViewProduct}
      />

      <main className="flex-grow">
        {/* Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.3em] mb-8">
                <Zap className="w-3 h-3 fill-current" />
                Next-Gen Catalog
              </span>
              <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-[1.1]">
                Power Your Future <br />With High-End <span className="text-blue-500">Tech</span>
              </h1>
              <p className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed">
                Discover the latest laptops, smartphones, and components from the world's leading brands. Precision-engineered electronics for pros and gamers.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-xl shadow-blue-900/40">
                  Shop Best Sellers
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold px-8 py-4 rounded-2xl transition-all border border-white/10">
                  New Arrivals
                </button>
              </div>
            </div>
          </div>

        {/* Categories Navigation */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 sticky top-20 z-30 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl' 
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <FilterBar 
          sortBy={sortBy} setSortBy={setSortBy}
          maxPrice={maxPrice} setMaxPrice={setMaxPrice}
          minRating={minRating} setMinRating={setMinRating}
          onlyHot={onlyHot} setOnlyHot={setOnlyHot}
          currentMaxPrice={absoluteMaxPrice}
        />

        {/* Product Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                {activeCategory === 'All' ? 'LATEST DROPS' : activeCategory.toUpperCase()}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-widest">{filteredProducts.length} Listings Available</p>
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  role={role}
                  onAddToCart={addToCart} 
                  onToggleWishlist={toggleWishlist}
                  onViewDetails={handleViewProduct}
                  onEdit={(p) => { setEditingProduct(p); setIsAdminModalOpen(true); }}
                  onDelete={handleDeleteProduct}
                  isWishlisted={wishlistItems.some(item => item.id === product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-gray-50/50 dark:bg-gray-900/30 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
              <Package className="w-16 h-16 text-gray-200 dark:text-gray-800 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">OUT OF STOCK</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">No results match your current setup.</p>
              {canAddProduct && (
                 <button onClick={() => { setEditingProduct(null); setIsAdminModalOpen(true); }} className="mt-8 text-blue-600 font-black uppercase tracking-widest text-xs hover:underline">Add New Inventory</button>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1 bg-blue-600 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">Volt<span className="text-blue-500">Vibe</span></span>
              </div>
              <p className="max-w-md leading-relaxed mb-6">
                Building the bridge between technology and daily life. VoltVibe is your destination for handpicked electronics that push the boundaries of what's possible.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <div className="w-5 h-5 bg-white/50 rounded-sm"></div>
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <div className="w-5 h-5 bg-white/50 rounded-sm"></div>
                </a>
              </div>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Quick Links</h5>
              <ul className="space-y-4 text-sm">
                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/support'); }} className="hover:text-blue-500 transition-colors cursor-pointer">Support Center</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Shipping Policy</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Track My Order</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Newsletter</h5>
              <p className="text-sm mb-4">Get the latest gear drops and tech news in your inbox.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">Join</button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-xs">
            © {new Date().getFullYear()} VoltVibe Electronics. All rights reserved. Built for performance.
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onUpdateQuantity={updateQuantity} 
        onRemove={removeFromCart} 
        onCheckout={handleCheckoutInitiate}
      />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} items={wishlistItems} onRemove={removeFromWishlist} onAddToCart={p => { removeFromWishlist(p.id); addToCart(p); }} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={(user) => { setIsAuthModalOpen(false); }} />
      <UserProfileModal user={user} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      {selectedProduct && <ProductDetailsModal product={selectedProduct} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} isWishlisted={wishlistItems.some(i => i.id === selectedProduct.id)} user={user} onAddReview={handleAddReview} />}
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} total={paymentTotal} onSuccess={handlePaymentSuccess} />
      <ChatAssistant />
    </div>
  );
};

export default MainShop;
