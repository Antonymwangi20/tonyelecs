import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Product, Order } from '../types';
import { Package, Users, ShoppingCart, TrendingUp, Plus, Edit2, Trash2, Eye, LogOut, BarChart3, User as UserIcon } from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddProduct: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, onEditProduct, onDeleteProduct, onAddProduct }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'users'>('overview');

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalInventory = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
    const avgRating = products.length > 0 
      ? (products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length).toFixed(1)
      : 0;

    return { totalProducts, totalInventory, totalValue, avgRating };
  }, [products]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {user?.role === 'super-admin' ? 'Super Admin - Full Access' : 'Manager - Limited Access'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-2xl">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2 rounded-2xl font-bold text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'users', label: 'Users', icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-4 font-bold text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'blue' },
                { label: 'Total Inventory', value: stats.totalInventory, icon: ShoppingCart, color: 'green' },
                { label: 'Inventory Value', value: `KES ${(stats.totalValue / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'purple' },
                { label: 'Avg Rating', value: `${stats.avgRating} ⭐`, icon: Eye, color: 'yellow' }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                const colorClasses = {
                  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
                  green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
                  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
                  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600'
                };

                return (
                  <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl">
                    <div className={`w-12 h-12 rounded-xl ${colorClasses[stat.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-2xl">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Admin Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={onAddProduct}
                  className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-2xl transition-colors text-left"
                >
                  <Plus className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Add New Product</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Create a new inventory item</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800 rounded-2xl transition-colors text-left"
                >
                  <Package className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Manage Products</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Edit or remove items</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Product Management</h2>
              <button
                onClick={onAddProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white text-sm">{product.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-bold text-gray-900 dark:text-white">KES {product.price.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className={`font-bold ${(product.stock || 0) > 10 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock || 0}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-bold text-yellow-500">{product.rating || 0} ⭐</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEditProduct(product)}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteProduct(product.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8">User Management</h2>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-2xl text-center">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">User management features coming soon</p>
              <p className="text-xs text-gray-400 mt-2">Track customer accounts and activity</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
