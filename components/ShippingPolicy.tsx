import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const ShippingPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-500">
      <Navbar 
        onCartClick={() => {}}
        onWishlistClick={() => {}}
        onAuthClick={() => {}}
        onProfileClick={() => {}}
        onLogout={() => {}}
        onSupportClick={() => navigate('/support')}
        onAdminClick={undefined}
        cartCount={0}
        wishlistCount={0}
        searchQuery=""
        setSearchQuery={() => {}}
        role="customer"
        user={null}
        products={[]}
        onViewProduct={() => {}}
      />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-8 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-12 shadow-lg">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-2">
            Shipping Policy
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-8">
            Last Updated: February 2, 2026
          </p>

          <div className="prose prose-invert max-w-none dark:prose-invert text-gray-700 dark:text-gray-300 space-y-6">
            <p className="text-base leading-relaxed">
              This Shipping Policy explains how orders are processed, shipped, and delivered on <strong>VoltVibe Electronics</strong> (the "Site").
            </p>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Order Processing</h2>
              <p>
                We process orders within <strong>1–3 business days</strong> of receipt. Orders placed on weekends or public holidays will start processing the next business day.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Shipping Methods & Delivery Times</h2>
              <p>
                We offer shipping within Kenya. Estimated delivery times (after processing) are:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Standard Shipping:</strong> 3–7 business days</li>
              </ul>
              <p className="mt-4">
                Delivery times may vary depending on your location and courier performance. Delays can happen (especially during holidays), and we're not liable for delays outside our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Shipping Costs</h2>
              <p>
                Shipping fees are calculated at checkout based on your delivery address and package weight. We reserve the right to update shipping fees <strong>without notice</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Tracking</h2>
              <p>
                You'll receive a tracking number via email/SMS once your order ships. Use it to track your package with the courier.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Delivery Issues</h2>
              <p>
                If a package is marked "Delivered" by the carrier but you didn't receive it, contact the courier first. If they can't help, reach us at <strong>support@voltvibeelectronics.com</strong> — we'll investigate.
              </p>
              <p className="mt-4">
                We are <strong>not responsible</strong> for packages stolen after confirmed delivery or delivered to an incorrect address if the customer entered the wrong information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Damaged or Lost Shipments</h2>
              <p>
                If your order arrives damaged, you must notify us within <strong>48 hours of delivery</strong> with photos of the damage.
              </p>
              <p className="mt-4">
                For lost shipments, we'll open a claim with the courier. If the courier confirms loss, we will <strong>replace</strong> the order or <strong>issue a refund</strong> at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Returns & Exchanges</h2>
              <p>
                Shipping Policy doesn't cover returns — that's a separate policy. Please find our Returns Policy linked on the site.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <strong>Questions about shipping?</strong> Contact us at <strong>support@voltvibeelectronics.com</strong> or use the Support form on our site.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 border-t border-white/5 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs">
          © {new Date().getFullYear()} VoltVibe Electronics. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ShippingPolicy;
