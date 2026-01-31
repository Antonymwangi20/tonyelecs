
import React, { useState } from 'react';
import { X, Star, ShoppingCart, Heart, Send, MessageCircle, Info } from 'lucide-react';
import { Product, Review, User } from '../types';

interface ProductDetailsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  isWishlisted: boolean;
  user: User | null;
  onAddReview: (productId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart, 
  onToggleWishlist, 
  isWishlisted,
  user,
  onAddReview
}) => {
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  if (!isOpen) return null;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    onAddReview(product.id, {
      userId: user.id,
      userName: user.name,
      rating: newRating,
      comment: newComment
    });
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        
        {/* Left: Image & Quick Actions */}
        <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-800 relative group">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <button 
            onClick={() => onToggleWishlist(product)}
            className={`absolute top-8 right-8 p-4 rounded-3xl shadow-xl transition-all ${
              isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-gray-900/90 text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Right: Info & Reviews */}
        <div className="w-full md:w-1/2 flex flex-col h-full bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="p-8 sm:p-12 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">{product.category}</span>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mt-2 leading-tight">{product.name}</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400/10 rounded-xl">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-lg font-black text-yellow-600">{product.rating}</span>
                <span className="text-sm text-gray-400 font-medium">({product.reviews} reviews)</span>
              </div>
              <span className="text-3xl font-black text-gray-900 dark:text-white">${product.price.toLocaleString()}</span>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">{product.description}</p>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{key}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{value}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => onAddToCart(product)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-200 dark:shadow-none"
            >
              <ShoppingCart className="w-6 h-6" />
              ADD TO SHOPPING BAG
            </button>

            {/* Reviews Section */}
            <div className="pt-12 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-8">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Customer Reviews</h3>
              </div>

              {/* Review Form */}
              {user ? (
                <form onSubmit={handleSubmitReview} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] mb-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold dark:text-white">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          type="button" 
                          onClick={() => setNewRating(star)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${star <= newRating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <textarea 
                      required
                      placeholder="Share your experience with this tech..."
                      className="w-full bg-white dark:bg-gray-900 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button type="submit" className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2rem] text-center mb-10">
                  <p className="text-blue-600 dark:text-blue-400 font-bold mb-2">Want to share your thoughts?</p>
                  <p className="text-xs text-blue-500 dark:text-blue-500/70 mb-4 font-medium uppercase tracking-wider">Sign in to write a review</p>
                </div>
              )}

              {/* Review List */}
              <div className="space-y-6">
                {product.reviewList?.length ? (
                  product.reviewList.map((review) => (
                    <div key={review.id} className="group pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{review.userName}</h4>
                            <div className="flex gap-0.5 mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{review.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Info className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium italic">No reviews yet. Be the first to share your experience!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
