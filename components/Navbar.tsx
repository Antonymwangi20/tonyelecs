
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, Menu, Zap, Heart, ShieldCheck, User as UserIcon, LogOut, X, ArrowRight, Command } from 'lucide-react';
import { User, UserRole, Product } from '../types';

interface NavbarProps {
  onCartClick: () => void;
  onWishlistClick: () => void;
  onAuthClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  onSupportClick?: () => void;
  onAdminClick?: () => void;
  cartCount: number;
  wishlistCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  role: UserRole;
  user: User | null;
  products: Product[];
  onViewProduct: (p: Product) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onCartClick, 
  onWishlistClick, 
  onAuthClick,
  onProfileClick,
  onLogout,
  onSupportClick,
  onAdminClick,
  cartCount, 
  wishlistCount, 
  searchQuery, 
  setSearchQuery, 
  role,
  user,
  products,
  onViewProduct
}) => {
  const [isBumping, setIsBumping] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevCount = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 300);
      return () => clearTimeout(timer);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  // Keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicking outside of search to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.length >= 2 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super-admin': return 'Super Admin';
      case 'manager': return 'Catalog Manager';
      default: return 'Customer';
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-20">
          
          {/* Left: Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer group justify-start">
            <div className="p-2 bg-blue-600 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white leading-none">Volt<span className="text-blue-600">Vibe</span></span>
              {role !== 'customer' && (
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5">
                  {getRoleBadge(role)}
                </span>
              )}
            </div>
          </div>

          {/* Middle: Search Bar Section (The Star of the Navbar) */}
          <div 
            ref={searchRef}
            className={`flex justify-center transition-all duration-300 ${
              showMobileSearch ? 'fixed inset-0 z-50 bg-white dark:bg-gray-950 p-4 h-20 items-center' : 'hidden lg:flex'
            }`}
          >
            <div className="relative w-full max-w-lg group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className={`h-4 w-4 ${showResults ? 'text-blue-600' : 'text-gray-400'} transition-colors`} />
              </div>
              <input
                ref={inputRef}
                type="text"
                className="block w-full pl-11 pr-24 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500/50 text-sm transition-all dark:text-white placeholder-gray-400 font-medium"
                placeholder="Search premium electronics..."
                value={searchQuery}
                onFocus={() => setShowResults(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
              />
              
              {/* Desktop Shortcut Hint */}
              <div className="absolute inset-y-0 right-3 flex items-center gap-1.5 pointer-events-none hidden sm:flex">
                <span className="flex items-center gap-0.5 px-2 py-1 bg-gray-200/50 dark:bg-gray-800 rounded-lg text-[10px] font-black text-gray-400 border border-gray-300/50 dark:border-gray-700">
                  <Command className="w-2.5 h-2.5" />
                  K
                </span>
              </div>

              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setShowResults(false); }}
                  className="absolute inset-y-0 right-14 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-2"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {showMobileSearch && (
                <button 
                  onClick={() => setShowMobileSearch(false)}
                  className="lg:hidden ml-4 p-2 text-gray-500 font-bold text-sm"
                >
                  Close
                </button>
              )}

              {/* Advanced Results Dropdown */}
              {showResults && searchQuery.length >= 2 && (
                <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-2 ring-1 ring-black/5">
                  <div className="px-4 py-3 flex items-center justify-between border-b dark:border-gray-800/50 mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Matching Items</span>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Global Search</span>
                  </div>
                  
                  {searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map(product => (
                        <button
                          key={product.id}
                          onClick={() => {
                            onViewProduct(product);
                            setShowResults(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all text-left group"
                        >
                          <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-200/50 dark:border-gray-700/50">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{product.name}</h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight">{product.category}</p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1">
                            <span className="text-sm font-black text-gray-900 dark:text-white">${product.price.toLocaleString()}</span>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 rounded-md">
                               <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                               <span className="text-[8px] font-black text-green-600 uppercase">In Stock</span>
                            </div>
                          </div>
                        </button>
                      ))}
                      <div className="p-3 pt-4 text-center border-t dark:border-gray-800/50">
                        <button className="text-[10px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
                          Show all results for "{searchQuery}"
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-6 h-6 text-gray-300 dark:text-gray-700" />
                      </div>
                      <p className="text-sm text-gray-500 font-bold mb-1">No items found</p>
                      <p className="text-[11px] text-gray-400">Try searching for "Laptops" or "Audio"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions Section */}
          <div className="flex items-center gap-2 sm:gap-4 justify-end">
            <button 
              onClick={() => setShowMobileSearch(true)}
              className="lg:hidden p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button 
              onClick={onWishlistClick}
              className="relative p-3 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all hover:scale-110 active:scale-90"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-gray-950">
                  {wishlistCount}
                </span>
              )}
            </button>
            
            <button 
              onClick={onCartClick}
              className={`relative p-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-110 active:scale-90 ${
                isBumping ? 'scale-125 text-blue-600' : ''
              }`}
            >
              <ShoppingCart className={`w-5 h-5 ${isBumping ? 'fill-blue-500/10' : ''}`} />
              {cartCount > 0 && (
                <span className={`absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white ring-2 ring-white dark:ring-gray-950 transition-transform ${isBumping ? 'scale-125' : ''}`}>
                  {cartCount}
                </span>
              )}
            </button>

            <div className="relative">
              {user ? (
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 p-1 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-600 overflow-hidden ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="hidden xl:block text-sm font-black dark:text-white pr-2 truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                </button>
              ) : (
                <button 
                  onClick={onAuthClick}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200 dark:shadow-none"
                >
                  Join
                </button>
              )}

              {showProfileMenu && user && (
                <div className="absolute top-[calc(100%+12px)] right-0 w-64 bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden p-2 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl mb-2">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{getRoleBadge(user.role)}</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                  </div>
                  
                  <button 
                    onClick={() => { onProfileClick(); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-xs font-black text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                  >
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    MY PROFILE
                  </button>

                  {user && (user.role === 'manager' || user.role === 'super-admin') && onAdminClick && (
                    <button
                      onClick={() => { onAdminClick(); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-xs font-black text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                      <Command className="w-4 h-4 text-green-600" />
                      ADMIN DASHBOARD
                    </button>
                  )}

                  {onSupportClick && (
                    <button 
                      onClick={() => { onSupportClick(); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-xs font-black text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      SUPPORT
                    </button>
                  )}
                  
                  <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2" />
                  
                  <button 
                    onClick={() => { onLogout(); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    SIGN OUT
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
