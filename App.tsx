
import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import ChatAssistant from './components/ChatAssistant';
import FilterBar from './components/FilterBar';
import AdminProductModal from './components/AdminProductModal';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import ProductDetailsModal from './components/ProductDetailsModal';
import UserProfileModal from './components/UserProfileModal';
import PaymentModal from './components/PaymentModal';
import Support from './components/Support';
import MainShop from './components/MainShop';
import { PRODUCTS as DEFAULT_PRODUCTS, CATEGORIES } from './constants';
import { Product, CartItem, SortOption, UserRole, User, Review, Order } from './types';
import { Package, Truck, ShieldCheck, Headphones, Plus, LogIn, Zap, User as UserIcon } from 'lucide-react';

const AppRoutes: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('vv-products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS.map(p => ({ ...p, reviewList: p.reviewList || [] }));
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('vv-products', JSON.stringify(products));
  }, [products]);

  const handleSaveProduct = (product: Product) => {
    setProducts(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) return prev.map(p => p.id === product.id ? product : p);
      return [{ ...product, reviewList: [] }, ...prev];
    });
    setEditingProduct(null);
    setIsAdminModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Delete this product? This action cannot be undone.')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsAdminModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAdminModalOpen(true);
  };

  const navigate = useNavigate();
  return (
    <>
      <Routes>
        <Route path="/" element={<MainShop products={products} onProductsChange={setProducts} />} />
        <Route path="/support" element={<Support />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole={['manager', 'super-admin']}>
              <AdminDashboard 
                products={products}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddProduct={handleAddProduct}
              />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <AdminProductModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
        onSave={handleSaveProduct} 
        editingProduct={editingProduct} 
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
