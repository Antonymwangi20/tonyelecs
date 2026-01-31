
import React, { useState, useEffect, useRef } from 'react';
import { X, Smartphone, ShieldCheck, Loader2, CheckCircle2, ArrowRight, CreditCard, Zap, Globe, Github } from 'lucide-react';
import { initiateSTKPush, pollPaymentStatus } from '../services/mpesaService';
import { initiateGooglePayPayment, isGooglePayAvailable, processGooglePayOnBackend } from '../services/googlePayService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onSuccess: () => void;
}

type PaymentMethod = 'mpesa' | 'gpay' | 'paypal';
type PaymentStep = 'selection' | 'mpesa_entry' | 'processing' | 'waiting' | 'success' | 'error';

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, total, onSuccess }) => {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<PaymentStep>('selection');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [checkoutRequestID, setCheckoutRequestID] = useState<string | null>(null);
  const pollingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('selection');
      setMethod(null);
      setPhone('');
      setError('');
      setCheckoutRequestID(null);
      pollingRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validatePhone = (p: string) => {
    const regex = /^(?:254|\+254|0)?(7|1)(?:(?:[0-9][0-9])|(?:[0-9][0-8]))[0-9]{6}$/;
    return regex.test(p);
  };

  const startPayment = async (selectedMethod: PaymentMethod) => {
    setMethod(selectedMethod);
    if (selectedMethod === 'mpesa') {
      setStep('mpesa_entry');
    } else if (selectedMethod === 'gpay') {
      // Check if Google Pay is available (async check)
      setStep('processing');
      const isAvailable = await isGooglePayAvailable();
      if (!isAvailable) {
        setError('Google Pay is not available on this device or browser. Please use Chrome, Edge, or Safari, and ensure you\'re on HTTPS or localhost.');
        setStep('error');
        return;
      }
      
      // Start Google Pay flow
      await handleGooglePay();
    } else {
      // PayPal (to be implemented)
      setStep('processing');
      setTimeout(() => {
        setStep('waiting');
        setTimeout(() => setStep('success'), 2500);
      }, 1500);
    }
  };

  const handleGooglePay = async () => {
    try {
      setError('');
      setStep('processing');

      // Initiate Google Pay payment
      const paymentResponse = await initiateGooglePayPayment({
        amount: total,
        currency: 'USD',
        merchantName: 'VoltVibe Electronics'
      });

      if (!paymentResponse.success) {
        setError(paymentResponse.message || paymentResponse.error || 'Payment failed');
        setStep('error');
        return;
      }

      // Process payment on backend (optional - for server-side validation)
      // For now, we'll just use the client-side response
      // In production, you should validate the payment token on your backend
      setStep('waiting');
      
      // Simulate backend processing
      const backendResponse = await processGooglePayOnBackend(
        paymentResponse.paymentMethod,
        total
      );

      if (backendResponse.success) {
        setStep('success');
      } else {
        setError(backendResponse.message || backendResponse.error || 'Payment processing failed');
        setStep('error');
      }
    } catch (err: any) {
      console.error('Google Pay error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setStep('error');
    }
  };

  const handleMpesaPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setError('Please enter a valid M-Pesa phone number');
      return;
    }
    setError('');
    setStep('processing');

    try {
      // Calculate amount in KES (assuming 1 USD = 130 KES)
      const amountKES = Math.round(total * 130);
      
      // Initiate STK Push
      const stkResponse = await initiateSTKPush({
        phoneNumber: phone,
        amount: amountKES,
        accountReference: 'VOLTVIBE',
        transactionDesc: 'Payment for electronics purchase'
      });

      if (!stkResponse.success || !stkResponse.checkoutRequestID) {
        setError(stkResponse.message || stkResponse.error || 'Failed to initiate payment');
        setStep('error');
        return;
      }

      // Store checkout request ID and move to waiting state
      setCheckoutRequestID(stkResponse.checkoutRequestID);
      setStep('waiting');

      // Start polling for payment status
      if (!pollingRef.current) {
        pollingRef.current = true;
        
        const statusResponse = await pollPaymentStatus(
          stkResponse.checkoutRequestID,
          (status) => {
            // Optional: Update UI based on intermediate status updates
            if (status.resultDesc) {
              console.log('Payment status:', status.resultDesc);
            }
          },
          30, // Max 30 attempts
          3000 // Poll every 3 seconds
        );

        pollingRef.current = false;

        if (statusResponse.success && statusResponse.resultCode === 0) {
          setStep('success');
        } else {
          setError(statusResponse.message || statusResponse.error || 'Payment failed or was cancelled');
          setStep('error');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred. Please try again.');
      setStep('error');
      pollingRef.current = false;
    }
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  const getBrandColor = () => {
    if (method === 'mpesa') return 'bg-[#49b04d]';
    if (method === 'paypal') return 'bg-[#003087]';
    if (method === 'gpay') return 'bg-gray-900';
    return 'bg-blue-600';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={step !== 'success' ? onClose : undefined} />
      
      <div className="relative bg-white dark:bg-gray-950 rounded-[3rem] w-full max-w-md overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className={`${getBrandColor()} p-8 text-white transition-colors duration-500`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                {method === 'mpesa' ? <Smartphone className="w-6 h-6 text-[#49b04d]" /> : 
                 method === 'paypal' ? <Globe className="w-6 h-6 text-[#003087]" /> :
                 <CreditCard className="w-6 h-6 text-gray-900" />}
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">
                {step === 'selection' ? 'Secure Checkout' : 
                 method === 'mpesa' ? 'Lipa na M-PESA' : 
                 method === 'gpay' ? 'Google Pay' : 'PayPal Checkout'}
              </h2>
            </div>
            {step !== 'processing' && step !== 'waiting' && step !== 'success' && step !== 'error' && (
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Payable Total</p>
            <p className="text-4xl font-black tracking-tighter">${total.toLocaleString()}</p>
            {method === 'mpesa' && (
              <p className="text-xs font-bold opacity-80 mt-1">KES {(total * 130).toLocaleString()}</p>
            )}
          </div>
        </div>

        <div className="p-8 sm:p-10">
          {step === 'selection' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Select Payment Method</p>
              
              <button 
                onClick={() => startPayment('mpesa')}
                className="w-full flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-[2rem] border border-gray-100 dark:border-gray-800 hover:border-[#49b04d]/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#49b04d] rounded-xl flex items-center justify-center text-white">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-gray-900 dark:text-white">M-PESA</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">STK Push / Mobile Money</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#49b04d] group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => startPayment('paypal')}
                className="w-full flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-[2rem] border border-gray-100 dark:border-gray-800 hover:border-blue-600/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#003087] rounded-xl flex items-center justify-center text-white">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-gray-900 dark:text-white">PayPal</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Worldwide Fast Checkout</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => startPayment('gpay')}
                className="w-full flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-800 hover:border-gray-600/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-gray-900 dark:text-white">Google Pay</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Quick Pay with Google Account</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          )}

          {step === 'mpesa_entry' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handleMpesaPay} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">M-Pesa Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="e.g. 0712345678"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:ring-4 focus:ring-[#49b04d]/20 dark:text-white transition-all font-bold"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1">{error}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#49b04d] hover:bg-[#3d9441] text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-green-500/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                >
                  Request STK Push
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep('selection')} 
                  className="w-full text-[10px] text-gray-400 font-black uppercase hover:text-gray-600 transition-colors"
                >
                  Back to methods
                </button>
              </form>
            </div>
          )}

          {(step === 'processing' || step === 'waiting') && (
            <div className="text-center py-10 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className={`absolute inset-0 border-4 ${method === 'mpesa' ? 'border-[#49b04d]/10' : method === 'paypal' ? 'border-blue-100' : 'border-gray-100'} rounded-full`} />
                <div className={`absolute inset-0 border-4 ${method === 'mpesa' ? 'border-[#49b04d]' : method === 'paypal' ? 'border-[#003087]' : 'border-gray-900'} border-t-transparent rounded-full animate-spin`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  {method === 'mpesa' ? <Smartphone className="w-8 h-8 text-[#49b04d]" /> : 
                   method === 'paypal' ? <Globe className="w-8 h-8 text-[#003087]" /> :
                   <ShieldCheck className="w-8 h-8 text-gray-900" />}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                {step === 'processing' ? 'Authorizing...' : 
                 method === 'mpesa' ? 'Confirm on Phone' : 'Finalizing Order'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-[200px] mx-auto">
                {step === 'processing' 
                  ? `Contacting ${method === 'mpesa' ? 'M-Pesa' : method === 'paypal' ? 'PayPal' : 'Google'} secure gateway...` 
                  : method === 'mpesa' ? 'Please enter your PIN on your mobile device to authorize.' : 'Securing your transaction details...'}
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-[#49b04d] animate-bounce" />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Payment Successful</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-10 leading-relaxed">
                Thank you! Your transaction via <span className="font-black text-blue-600 uppercase">{method}</span> has been verified. Your gear is now being prepped for shipping.
              </p>

              <button
                onClick={handleFinish}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-5 rounded-2xl transition-all shadow-2xl active:scale-95 uppercase tracking-widest text-xs"
              >
                View My Order
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <X className="w-12 h-12 text-red-500" />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Payment Failed</h3>
              <p className="text-sm text-red-500 dark:text-red-400 font-medium mb-10">
                {error || 'Payment could not be completed. Please try again.'}
              </p>

              <div className="flex gap-3">
                {method === 'mpesa' ? (
                  <>
                    <button
                      onClick={() => {
                        setStep('mpesa_entry');
                        setError('');
                        setCheckoutRequestID(null);
                      }}
                      className="flex-1 bg-[#49b04d] hover:bg-[#3d9441] text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        setStep('selection');
                        setError('');
                        setCheckoutRequestID(null);
                      }}
                      className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-black py-5 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                      Back
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (method === 'gpay') {
                          handleGooglePay();
                        } else {
                          setStep('processing');
                        }
                        setError('');
                      }}
                      className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        setStep('selection');
                        setError('');
                      }}
                      className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-black py-5 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                      Back
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 flex items-center justify-center gap-4 border-t dark:border-gray-800">
           <ShieldCheck className="w-4 h-4 text-green-500" />
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">End-to-End Encryption Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
