
import React from 'react';
import { SlidersHorizontal, ChevronDown, Star } from 'lucide-react';
import { SortOption } from '../types';

interface FilterBarProps {
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  minRating: number;
  setMinRating: (val: number) => void;
  onlyHot: boolean;
  setOnlyHot: (val: boolean) => void;
  currentMaxPrice: number;
}

const FilterBar: React.FC<FilterBarProps> = ({
  sortBy,
  setSortBy,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  onlyHot,
  setOnlyHot,
  currentMaxPrice
}) => {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-4 sticky top-[120px] sm:top-16 z-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                isFilterOpen 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {(maxPrice < currentMaxPrice || minRating > 0 || onlyHot) && (
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              )}
            </button>

            <div className="relative group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 pr-10 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rating</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 overflow-x-auto pb-2 md:pb-0">
             <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-medium text-gray-900 dark:text-white">Price Range:</span>
                <span>$0 - ${maxPrice.toLocaleString()}</span>
             </div>
             <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-medium text-gray-900 dark:text-white">Min Rating:</span>
                <div className="flex items-center text-yellow-500">
                   <Star className="w-3 h-3 fill-current" />
                   <span className="ml-1 text-gray-700 dark:text-gray-300 font-bold">{minRating}+</span>
                </div>
             </div>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Price Filter */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-900 dark:text-white block">Max Price</label>
              <input 
                type="range" 
                min="0" 
                max={currentMaxPrice} 
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 font-medium">
                <span>$0</span>
                <span>${currentMaxPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-900 dark:text-white block">Minimum Rating</label>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      minRating === rating 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {rating === 0 ? 'Any' : `${rating}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-900 dark:text-white block">Availability</label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={onlyHot}
                    onChange={(e) => setOnlyHot(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white font-medium">Hot Sellers Only</span>
              </label>
              <button 
                onClick={() => {
                  setMaxPrice(currentMaxPrice);
                  setMinRating(0);
                  setOnlyHot(false);
                }}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
