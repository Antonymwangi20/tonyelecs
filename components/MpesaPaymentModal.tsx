
import React, { useState, useEffect, useRef } from 'react';
import { X, Smartphone, ShieldCheck, Loader2, CheckCircle2, ArrowRight, CreditCard, Zap } from 'lucide-react';
import { initiateSTKPush, pollPaymentStatus, normalizePhoneNumber } from '../services/mpesaService';

interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onSuccess: () => void;
}

type PaymentStep = 'entry' | 'processing' | 'waiting' | 'success' | 'error';

const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({ isOpen, onClose, total, onSuccess }) => {
  const [step, setStep] = useState<PaymentStep>('entry');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [checkoutRequestID, setCheckoutRequestID] = useState<string | null>(null);
  const pollingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('entry');
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

  const handlePay = async (e: React.FormEvent) => {
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={step !== 'success' ? onClose : undefined} />
      
      <div className="relative bg-white dark:bg-gray-950 rounded-[3rem] w-full max-w-md overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-500">
        
        {/* Header - M-Pesa Branding */}
        <div className="bg-[#49b04d] p-8 text-white">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-6 h-6 text-[#49b04d]" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">Lipa na M-PESA</h2>
            </div>
            {step !== 'processing' && step !== 'waiting' && step !== 'success' && step !== 'error' && (
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Payment Amount</p>
            <p className="text-4xl font-black tracking-tighter">KES { (total * 130).toLocaleString() }</p>
            <p className="text-[10px] font-bold opacity-60">≈ ${total.toLocaleString()}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 sm:p-10">
          {step === 'entry' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Merchant Name</p>
                  <p className="text-sm font-black text-gray-900 dark:text-white truncate">VOLTVIBE ELECTRONICS</p>
                </div>
              </div>

              <form onSubmit={handlePay} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
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
                  Pay Now
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3" />
                  Secured by M-Pesa Direct
                </p>
              </form>
            </div>
          )}

          {(step === 'processing' || step === 'waiting') && (
            <div className="text-center py-10 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-[#49b04d]/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#49b04d] border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-[#49b04d]" />
                </div>
              </div>
              
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                {step === 'processing' ? 'Initiating Payment' : 'Check Your Phone'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-[200px] mx-auto">
                {step === 'processing' 
                  ? 'Requesting STK push to your device...' 
                  : 'Please enter your M-Pesa PIN when prompted to complete the transaction.'}
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-[#49b04d] animate-bounce" />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Payment Received!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-10">
                Transaction Successful. Your order <span className="text-blue-600 font-black">#VV-{Math.floor(Math.random() * 90000 + 10000)}</span> is now being processed.
              </p>

              <button
                onClick={handleFinish}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-5 rounded-2xl transition-all shadow-2xl active:scale-95 uppercase tracking-widest text-xs"
              >
                Go to Order Details
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
                <button
                  onClick={() => {
                    setStep('entry');
                    setError('');
                    setCheckoutRequestID(null);
                  }}
                  className="flex-1 bg-[#49b04d] hover:bg-[#3d9441] text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-black py-5 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 flex items-center justify-center gap-4 border-t dark:border-gray-800">
           <CreditCard className="w-4 h-4 text-gray-400" />
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Safe & Encryption Guarded Payment</span>
        </div>
      </div>
    </div>
  );
};

export default MpesaPaymentModal;
