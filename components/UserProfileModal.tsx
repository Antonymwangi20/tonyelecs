
import React from 'react';
// Added Zap to the import list below to resolve "Cannot find name 'Zap'" error on line 161.
import { X, User as UserIcon, Package, Calendar, Tag, ChevronRight, ShieldCheck, Mail, CreditCard, Clock, Zap } from 'lucide-react';
import { User, Order } from '../types';

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  // Simulated orders with an Electronics theme
  const mockOrders: Order[] = [
    {
      id: 'VV-89234',
      date: 'Oct 12, 2024',
      total: 1549.98,
      status: 'Delivered',
      items: ['Zenith Pro 16 Laptop', 'AeroPods Lite']
    },
    {
      id: 'VV-89012',
      date: 'Nov 02, 2024',
      total: 349.50,
      status: 'Shipped',
      items: ['SonicWave Noise Cancelling Headphones']
    },
    {
      id: 'VV-88765',
      date: 'Aug 24, 2024',
      total: 129.99,
      status: 'Delivered',
      items: ['Lumina Smart Home Hub']
    }
  ];

  const orders = user.orders || mockOrders;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'Processing': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'Shipped': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
      case 'Cancelled': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super-admin': return 'Super Admin';
      case 'manager': return 'Catalog Manager';
      default: return 'Customer';
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-950 rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-500">
        
        {/* Left: User Identity Sidebar (Glassy and Clean) */}
        <div className="w-full md:w-80 bg-gray-50 dark:bg-gray-900/50 p-10 flex flex-col items-center text-center border-r dark:border-gray-800">
          <div className="relative mb-10">
            <div className="w-36 h-36 rounded-[2.5rem] overflow-hidden ring-4 ring-blue-600/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-3 -right-3 p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 leading-tight tracking-tight">{user.name}</h2>
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600/10 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-[0.2em] mb-10">
            {getRoleBadge(user.role)}
          </span>

          <div className="w-full space-y-3">
            <div className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-left transition-all hover:border-blue-500/20">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Email</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate block">{user.email}</span>
              </div>
            </div>
            <div className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-left transition-all hover:border-blue-500/20">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Member Status</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white truncate block">Premium Plus</span>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-10">
            <button className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors">
              Settings & Privacy
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Activity & Electronics History */}
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950 overflow-hidden">
          <div className="p-10 sm:p-14 h-full flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-2xl">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Purchase Archive</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Tech & Electronics Acquisitions</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-2xl transition-all hover:rotate-90">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="group p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 hover:border-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500">
                    <div className="flex flex-wrap justify-between items-start gap-6 mb-6">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-[10px] font-black text-blue-600 uppercase tracking-widest shadow-sm">
                            {order.id}
                          </span>
                          <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-widest">{order.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-gray-900 dark:text-white block mb-1 tracking-tighter">${order.total.toLocaleString()}</span>
                        <div className="flex items-center justify-end gap-2 text-gray-400">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Paid via VaultPay</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-4">
                          {order.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border-4 border-gray-50 dark:border-gray-900 flex items-center justify-center shadow-lg group-hover:translate-y-[-4px] transition-transform duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                              <Zap className="w-5 h-5 text-blue-600" />
                            </div>
                          ))}
                        </div>
                        <div className="ml-4">
                          <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase leading-tight">
                            {order.items[0]}
                          </p>
                          {order.items.length > 1 && (
                            <p className="text-[10px] font-bold text-gray-400 uppercase">+{order.items.length - 1} other items</p>
                          )}
                        </div>
                      </div>
                      <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-gray-200 dark:shadow-none">
                        Track Shipment
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-50">
                   <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-full mb-6">
                     <Package className="w-16 h-16 text-gray-300 dark:text-gray-700" />
                   </div>
                   <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Empty Inventory</h4>
                   <p className="text-sm text-gray-500 font-medium mt-2">You haven't acquired any tech from VoltVibe yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
