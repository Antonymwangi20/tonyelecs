
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Product } from '../types';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  editingProduct?: Product | null;
}

const AdminProductModal: React.FC<AdminProductModalProps> = ({ isOpen, onClose, onSave, editingProduct }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Laptops',
    price: 0,
    description: '',
    image: '',
    specs: {}
  });

  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
    } else {
      setFormData({
        name: '',
        category: 'Laptops',
        price: 0,
        description: '',
        image: '',
        specs: {}
      });
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: formData.id || Date.now().toString(),
      rating: formData.rating || 5.0,
      reviews: formData.reviews || 0,
    } as Product);
    onClose();
  };

  const addSpec = () => {
    if (specKey && specValue) {
      setFormData(prev => ({
        ...prev,
        specs: { ...prev.specs, [specKey]: specValue }
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpec = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specs };
      delete newSpecs[key];
      return { ...prev, specs: newSpecs };
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <X className="w-6 h-6 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Product Name</label>
              <input
                required
                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:text-white"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Category</label>
              <select
                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:text-white"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              >
                <option value="Laptops">Laptops</option>
                <option value="Mobile">Mobile</option>
                <option value="Audio">Audio</option>
                <option value="Home">Home</option>
                <option value="Components">Components</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Price ($)</label>
              <input
                type="number"
                required
                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:text-white"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Image URL</label>
              <input
                required
                className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:text-white"
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              required
              rows={3}
              className="w-full bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-2.5 dark:text-white"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Specifications</label>
            <div className="flex gap-2">
              <input
                placeholder="Key (e.g. RAM)"
                className="flex-1 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                value={specKey}
                onChange={e => setSpecKey(e.target.value)}
              />
              <input
                placeholder="Value (e.g. 16GB)"
                className="flex-1 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-4 py-2 text-sm dark:text-white"
                value={specValue}
                onChange={e => setSpecValue(e.target.value)}
              />
              <button
                type="button"
                onClick={addSpec}
                className="bg-blue-600 text-white p-2 rounded-xl"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(formData.specs || {}).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg border dark:border-gray-700">
                  <span className="text-xs font-bold dark:text-gray-300">{k}: {v}</span>
                  <button type="button" onClick={() => removeSpec(k)} className="text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <Save className="w-5 h-5" />
            Save Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProductModal;
