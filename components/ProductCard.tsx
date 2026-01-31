
import React, { useState } from 'react';
import { Star, ShoppingCart, Info, ChevronDown, ChevronUp, Cpu, HardDrive, Layout, Battery, Zap, Heart, Edit, Trash2, Eye } from 'lucide-react';
import { Product, UserRole } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onViewDetails: (p: Product) => void;
  isWishlisted: boolean;
  role: UserRole;
  onEdit?: (p: Product) => void;
  onDelete?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onToggleWishlist, onViewDetails, isWishlisted, role, onEdit, onDelete }) => {
  const [showSpecs, setShowSpecs] = useState(false);

  const canEdit = role === 'super-admin' || role === 'manager';
  const canDelete = role === 'super-admin';

  const getSpecIcon = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('cpu')) return <Cpu className="w-3.5 h-3.5" />;
    if (k.includes('ram') || k.includes('storage') || k.includes('vram')) return <HardDrive className="w-3.5 h-3.5" />;
    if (k.includes('display') || k.includes('screen')) return <Layout className="w-3.5 h-3.5" />;
    if (k.includes('battery')) return <Battery className="w-3.5 h-3.5" />;
    return <Zap className="w-3.5 h-3.5" />;
  };

  return (
    <div className="group bg-white dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900 cursor-pointer" onClick={() => onViewDetails(product)}>
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {product.isHot && (
          <span className="absolute top-5 left-5 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-2xl uppercase tracking-[0.15em] shadow-lg shadow-red-500/30">
            Hot
          </span>
        )}
        
        {/* Controls Overlay */}
        <div className="absolute top-5 right-5 flex flex-col gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
            className={`p-3.5 rounded-3xl shadow-xl transition-all duration-300 backdrop-blur-xl ${
              isWishlisted 
                ? 'bg-red-500 text-white scale-110' 
                : 'bg-white/90 dark:bg-gray-900/90 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onViewDetails(product); }}
            className="p-3.5 bg-blue-600 text-white rounded-3xl shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
          >
            <Eye className="w-5 h-5" />
          </button>

          {canEdit && (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(product); }}
              className="p-3.5 bg-gray-900 text-white rounded-3xl shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-300 delay-100"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}

          {canDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete?.(product.id); }}
              className="p-3.5 bg-red-600 text-white rounded-3xl shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-300 delay-150"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-7 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{product.category}</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-400/10 rounded-lg">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-black text-yellow-600">{product.rating}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => onViewDetails(product)}>
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 leading-relaxed font-medium">{product.description}</p>
        
        {/* Specs Toggle */}
        <div className="mb-6">
          <button 
            onClick={() => setShowSpecs(!showSpecs)}
            className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all uppercase tracking-widest"
          >
            {showSpecs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showSpecs ? 'Hide Details' : 'View Specs'}
          </button>
          
          {showSpecs && (
            <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {Object.entries(product.specs || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-[11px] bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-gray-100/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-tight">
                    {getSpecIcon(key)}
                    {key}
                  </div>
                  <span className="font-black text-gray-900 dark:text-gray-200">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
          <span className="text-2xl font-black text-gray-900 dark:text-white">${product.price.toLocaleString()}</span>
          <button 
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-2 bg-gray-900 dark:bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200 dark:shadow-none"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
