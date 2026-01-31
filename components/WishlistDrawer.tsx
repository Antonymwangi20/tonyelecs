
import React from 'react';
import { X, Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemove: (id: string) => void;
  onAddToCart: (p: Product) => void;
}

const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ isOpen, onClose, items, onRemove, onAddToCart }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 transition-colors">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Wishlist</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto py-6 px-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-10 h-10 text-gray-300 dark:text-gray-700" />
                </div>
                <h3 className="text-gray-900 dark:text-white font-bold mb-1">Wishlist is empty</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[200px]">Save your favorite gear for later.</p>
                <button 
                  onClick={onClose}
                  className="mt-6 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 group bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all">
                    <div className="w-20 h-20 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate pr-2">{item.name}</h4>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">${item.price.toLocaleString()}</p>
                      <button 
                        onClick={() => onAddToCart(item)}
                        className="flex items-center gap-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        MOVE TO CART
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20">
             <button 
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
             >
               Keep Shopping
               <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistDrawer;
