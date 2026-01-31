import React, { useState } from 'react';
import { ChevronDown, Mail, Phone, MessageCircle, Clock, Globe, Zap } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const Support: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });

  const faqs: FAQ[] = [
    {
      id: 1,
      question: 'How do I track my order?',
      answer: 'You can track your order using the tracking number sent to your email after checkout. Visit our "Track My Order" page or use your order ID from your profile to get real-time updates on your shipment.'
    },
    {
      id: 2,
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy on most items. Products must be in original condition with all packaging. Electronics must be unopened or have minimal usage. Contact our support team for return authorization.'
    },
    {
      id: 3,
      question: 'Do you offer warranty on electronics?',
      answer: 'Yes! All our electronics come with manufacturer warranty. Premium products include extended warranty options. Check the product details page for specific warranty information on your item.'
    },
    {
      id: 4,
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business days delivery. Orders are processed within 24 hours during business days.'
    },
    {
      id: 5,
      question: 'What payment methods do you accept?',
      answer: 'We accept credit/debit cards, M-Pesa, Google Pay, and other digital payment methods. All transactions are secure and encrypted.'
    },
    {
      id: 6,
      question: 'Can I cancel or modify my order?',
      answer: 'Orders can be cancelled within 1 hour of placement if not yet shipped. For modifications, please contact our support team immediately with your order ID.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you for contacting us! We'll respond to ${contactForm.email} shortly.`);
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-6">Support Center</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            We're here to help. Get quick answers to common questions or reach out to our team directly.
          </p>
        </div>
      </div>

      {/* Quick Contact Options */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
          {[
            { icon: MessageCircle, title: 'Live Chat', desc: 'Chat with us now', available: 'Available 24/7' },
            { icon: Mail, title: 'Email Support', desc: 'support@voltvibe.com', available: 'Response within 24h' },
            { icon: Phone, title: 'Phone Support', desc: '+254 700 123 456', available: '9 AM - 6 PM (EAT)' },
            { icon: Globe, title: 'Knowledge Base', desc: 'Search our articles', available: 'Always available' }
          ].map((option, idx) => {
            const Icon = option.icon;
            return (
              <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2">{option.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{option.desc}</p>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {option.available}
                </p>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.3em] mb-4">
              <Zap className="w-3 h-3 fill-current" />
              Frequently Asked
            </span>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Common Questions</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Find answers to questions our customers ask most frequently. Can't find what you're looking for? Contact our support team.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map(faq => (
              <div
                key={faq.id}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-colors"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <span className="font-bold text-gray-900 dark:text-white text-left">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform ${
                      expandedFAQ === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Didn't find what you need?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Fill out the form below and our support team will get back to you as soon as possible.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Your Name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500"
                required
              />
            </div>

            <input
              type="text"
              placeholder="Subject"
              value={contactForm.subject}
              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500"
              required
            />

            <textarea
              placeholder="Your Message"
              rows={5}
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 resize-none"
              required
            ></textarea>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-lg"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Support;
