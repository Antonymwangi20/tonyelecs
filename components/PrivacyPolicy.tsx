import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const PrivacyPolicy: React.FC = () => {
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
            Privacy Policy
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-8">
            Last Updated: February 2, 2026
          </p>

          <div className="prose prose-invert max-w-none dark:prose-invert text-gray-700 dark:text-gray-300 space-y-6">
            <p className="text-base leading-relaxed">
              Your privacy matters. This policy explains what we collect, how we use it, and how we protect it when you use <strong>VoltVibe Electronics</strong>.
            </p>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Information We Collect</h2>
              <p>We may collect:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Personal Info:</strong> Name, email, phone, shipping address</li>
                <li><strong>Order Info:</strong> Items ordered, payment method (we don't store raw card numbers)</li>
                <li><strong>Usage Data:</strong> Pages visited, clicks, device/browser type</li>
                <li><strong>Cookies & Tracking:</strong> Small files to help the site work and improve experience</li>
              </ul>
              <p className="mt-4">
                We collect this info when you place an order, sign up for updates, or interact with the site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">How We Use Your Info</h2>
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Process and deliver your orders</li>
                <li>Communicate order status and support</li>
                <li>Improve the site and customer experience</li>
                <li>Send marketing emails (only if you opt in)</li>
                <li>Prevent fraud and enforce our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Sharing Your Info</h2>
              <p>
                We <strong>do not sell or rent</strong> your personal information. We may share info with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Service providers</strong> (e.g., couriers, payment processors like Paystack)</li>
                <li><strong>Legal authorities</strong> if required by law</li>
                <li><strong>Successors</strong> in case of business sale or merger</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">How We Protect Your Data</h2>
              <p>We use reasonable technical and organizational safeguards to keep your data safe:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>SSL encryption for data in transit</li>
                <li>Secure servers and access controls</li>
                <li>Regular security reviews</li>
              </ul>
              <p className="mt-4">
                No system is perfect — so absolute security isn't guaranteed, but we work hard to protect your info.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Cookies & Tracking</h2>
              <p>
                We use cookies and similar tech to make the site work and understand how people use it. You can manage cookies in your browser settings, but that may impact site functionality.
              </p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2">Cookies we use:</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Essential:</strong> Required for site functionality (authentication, cart, etc.)</li>
                <li><strong>Analytics:</strong> Help us understand site usage (Google Analytics)</li>
                <li><strong>Marketing:</strong> Track conversions and improve ads (optional)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Access</strong> your personal data</li>
                <li><strong>Correct</strong> inaccurate information</li>
                <li><strong>Delete</strong> your data (with some exceptions for legal or transactional reasons)</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, email <strong>support@voltvibeelectronics.com</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Data Retention</h2>
              <p>We retain your personal information for as long as necessary to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Fulfill your orders and transactions</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
              </ul>
              <p className="mt-4">
                After this period, we securely delete or anonymize your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Third-Party Links</h2>
              <p>
                Our site may link to other sites (payment processors, couriers, etc.). We aren't responsible for their privacy practices. We recommend reviewing their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Children's Privacy</h2>
              <p>
                Our site is not intended for children under 13. We do not knowingly collect data from children under 13. If we become aware of such collection, we'll delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3">Changes to This Policy</h2>
              <p>
                We may update this policy. The updated version will show the <strong>last updated</strong> date. Continued use of the site after changes means you accept the new policy.
              </p>
              <p className="mt-4 text-sm italic">
                <strong>Your continued use of the site indicates acceptance of this Privacy Policy.</strong>
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Contact Us</h3>
              <p className="text-sm space-y-2">
                If you have questions or concerns about our privacy practices:
              </p>
              <ul className="list-none space-y-2 mt-3 text-sm">
                <li><strong>📧 Email:</strong> support@voltvibeelectronics.com</li>
                <li><strong>📱 Support Form:</strong> Available on our site under "Support"</li>
                <li><strong>📍 Address:</strong> Nairobi, Kenya</li>
              </ul>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                <strong>Effective Date:</strong> February 2, 2026
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

export default PrivacyPolicy;
