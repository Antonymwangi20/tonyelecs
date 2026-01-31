// Google Pay Service
// Handles Google Pay payment integration using Payment Request API

export interface GooglePayPaymentRequest {
  amount: number;
  currency: string;
  merchantId?: string;
  merchantName?: string;
}

export interface GooglePayPaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentMethod?: any;
  error?: string;
  message?: string;
}

// Check if Google Pay is available
export async function isGooglePayAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  // Check for Payment Request API support
  if (!window.PaymentRequest) {
    console.warn('Payment Request API is not supported in this browser');
    return false;
  }

  // Check if we're on HTTPS or localhost (required for Payment Request API)
  const isSecureContext = window.isSecureContext || 
    window.location.protocol === 'https:' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (!isSecureContext) {
    console.warn('Payment Request API requires HTTPS or localhost');
    return false;
  }

  // Check if Google Pay is supported
  const paymentMethods = [
    {
      supportedMethods: 'https://google.com/pay',
      data: {
        environment: 'TEST', // Use 'PRODUCTION' for live
        apiVersion: 2,
        apiVersionMinor: 0,
        merchantInfo: {
          merchantId: 'BCR2DN6TZ6P6ZYX2', // Test merchant ID
          merchantName: 'VoltVibe Electronics'
        },
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'exampleGatewayMerchantId'
            }
          }
        }]
      }
    }
  ];

  try {
    const request = new PaymentRequest(paymentMethods, {
      total: {
        label: 'Total',
        amount: { currency: 'USD', value: '0.01' }
      }
    });
    
    // Use async canMakePayment if available
    const canMakePayment = request.canMakePayment 
      ? await Promise.resolve(request.canMakePayment())
      : null;
    
    return canMakePayment !== null;
  } catch (e: any) {
    console.warn('Error checking Google Pay availability:', e.message);
    return false;
  }
}

// Initialize Google Pay payment
export async function initiateGooglePayPayment(
  request: GooglePayPaymentRequest
): Promise<GooglePayPaymentResponse> {
  try {
    // Check for Payment Request API support
    if (!window.PaymentRequest) {
      return {
        success: false,
        error: 'Payment Request API not supported',
        message: 'Your browser does not support Google Pay. Please use Chrome, Edge, or Safari.'
      };
    }

    // Check for secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext || 
      window.location.protocol === 'https:' || 
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!isSecureContext) {
      return {
        success: false,
        error: 'Secure context required',
        message: 'Google Pay requires HTTPS. Please access the site over a secure connection.'
      };
    }

    // Get environment variables
    const environment = (import.meta as any).env?.VITE_GOOGLE_PAY_ENVIRONMENT || 'TEST';
    const merchantId = (import.meta as any).env?.VITE_GOOGLE_PAY_MERCHANT_ID || 'BCR2DN6TZ6P6ZYX2';
    const gateway = (import.meta as any).env?.VITE_GOOGLE_PAY_GATEWAY || 'stripe';
    const gatewayMerchantId = (import.meta as any).env?.VITE_GOOGLE_PAY_GATEWAY_MERCHANT_ID || '';

    // Validate production configuration
    if (environment === 'PRODUCTION') {
      if (!merchantId || merchantId === 'BCR2DN6TZ6P6ZYX2') {
        return {
          success: false,
          error: 'Invalid merchant configuration',
          message: 'Production mode requires a valid VITE_GOOGLE_PAY_MERCHANT_ID. Please set your production merchant ID in .env file.'
        };
      }

      if (!gatewayMerchantId) {
        return {
          success: false,
          error: 'Missing gateway merchant ID',
          message: 'Production mode requires VITE_GOOGLE_PAY_GATEWAY_MERCHANT_ID. This is your payment gateway (Stripe, PayPal, etc.) merchant ID. Please configure it in your .env file.'
        };
      }
    }

    // Determine tokenization method
    // For production, use PAYMENT_GATEWAY (requires gateway merchant ID)
    // For test, can use either
    let tokenizationSpec;
    
    if (environment === 'PRODUCTION') {
      // Production requires PAYMENT_GATEWAY with valid gateway merchant ID
      tokenizationSpec = {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: gateway,
          gatewayMerchantId: gatewayMerchantId
        }
      };
    } else {
      // Test mode - use PAYMENT_GATEWAY with example values
      tokenizationSpec = {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: gateway || 'example',
          gatewayMerchantId: gatewayMerchantId || 'exampleGatewayMerchantId'
        }
      };
    }

    // Google Pay payment method
    const paymentMethodData: PaymentMethodData[] = [
      {
        supportedMethods: 'https://google.com/pay',
        data: {
          environment: environment,
          apiVersion: 2,
          apiVersionMinor: 0,
          merchantInfo: {
            merchantId: merchantId,
            merchantName: request.merchantName || 'VoltVibe Electronics'
          },
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA']
            },
            tokenizationSpecification: tokenizationSpec
          }]
        }
      }
    ];

    // Payment details
    const paymentDetails: PaymentDetailsInit = {
      total: {
        label: 'VoltVibe Electronics',
        amount: {
          currency: request.currency || 'USD',
          value: request.amount.toFixed(2)
        }
      },
      displayItems: [
        {
          label: 'Order Total',
          amount: {
            currency: request.currency || 'USD',
            value: request.amount.toFixed(2)
          }
        }
      ]
    };

    // Payment options
    const paymentOptions: PaymentOptions = {
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: false,
      requestShipping: false
    };

    // Create payment request
    const paymentRequest = new PaymentRequest(
      paymentMethodData,
      paymentDetails,
      paymentOptions
    );

    // Check if can make payment
    let canMakePayment;
    try {
      canMakePayment = await paymentRequest.canMakePayment();
    } catch (e: any) {
      console.error('Error checking payment availability:', e);
      return {
        success: false,
        error: 'Payment check failed',
        message: 'Unable to check payment availability. Please try again or use another payment method.'
      };
    }

    if (!canMakePayment) {
      return {
        success: false,
        error: 'Google Pay not available',
        message: 'Google Pay is not available on this device or browser. Please use another payment method.'
      };
    }

    // Show payment sheet with error handling
    let paymentResponse;
    try {
      paymentResponse = await paymentRequest.show();
    } catch (e: any) {
      // Handle specific IPC connection errors
      if (e.message && e.message.includes('IPC')) {
        return {
          success: false,
          error: 'Payment service unavailable',
          message: 'The payment service is temporarily unavailable. Please refresh the page and try again, or use another payment method.'
        };
      }
      
      // Handle other errors
      if (e.name === 'AbortError' || e.name === 'NotAllowedError') {
        return {
          success: false,
          error: 'Payment cancelled',
          message: 'You cancelled the payment request.'
        };
      }

      throw e; // Re-throw unknown errors
    }

    // Process payment (in a real app, you'd send this to your backend)
    // For now, we'll simulate processing
    try {
      // Complete the payment
      await paymentResponse.complete('success');

      return {
        success: true,
        transactionId: paymentResponse.details?.transactionId || `GP-${Date.now()}`,
        paymentMethod: paymentResponse.details
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Payment processing failed',
        message: error.message || 'Failed to process payment'
      };
    }
    } catch (error: any) {
      console.error('Google Pay Error:', error);
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Payment cancelled',
          message: 'You cancelled the payment request.'
        };
      }

      // Handle IPC connection errors
      if (error.message && (
        error.message.includes('IPC') || 
        error.message.includes('Renderer process') ||
        error.message.includes('browser process')
      )) {
        return {
          success: false,
          error: 'Payment service unavailable',
          message: 'The payment service is temporarily unavailable. Please try: 1) Refresh the page, 2) Use a different browser (Chrome/Edge recommended), 3) Check if you\'re on HTTPS or localhost, 4) Try another payment method.'
        };
      }

      // Handle NotSupportedError
      if (error.name === 'NotSupportedError') {
        return {
          success: false,
          error: 'Payment method not supported',
          message: 'Google Pay is not supported in this context. Please use Chrome, Edge, or Safari on HTTPS.'
        };
      }

      // Handle OR_BIBED_11 error (merchant/gateway configuration issue)
      if (error.message && (
        error.message.includes('OR_BIBED_11') ||
        error.message.includes('merchant is having trouble') ||
        error.message.includes('BIBED')
      )) {
        const environment = (import.meta as any).env?.VITE_GOOGLE_PAY_ENVIRONMENT || 'TEST';
        const gatewayMerchantId = (import.meta as any).env?.VITE_GOOGLE_PAY_GATEWAY_MERCHANT_ID || '';
        
        if (environment === 'PRODUCTION' && !gatewayMerchantId) {
          return {
            success: false,
            error: 'Gateway configuration required',
            message: 'Production mode requires VITE_GOOGLE_PAY_GATEWAY_MERCHANT_ID. Please configure your payment gateway (Stripe, PayPal, etc.) merchant ID in your .env file. See GOOGLE_PAY_SETUP.md for details.'
          };
        }
        
        return {
          success: false,
          error: 'Merchant configuration issue',
          message: 'There\'s an issue with the merchant or payment gateway configuration. Please verify: 1) Your Google Pay merchant ID is correct, 2) Your payment gateway merchant ID is set and valid, 3) Your merchant account is fully activated. See GOOGLE_PAY_SETUP.md for setup instructions.'
        };
      }

      return {
        success: false,
        error: 'Payment failed',
        message: error.message || 'An error occurred while processing your payment. Please try again or use another payment method.'
      };
    }
  }

// Process payment on backend (call your API)
export async function processGooglePayOnBackend(
  paymentData: any,
  amount: number
): Promise<GooglePayPaymentResponse> {
  try {
    const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';
    
    const response = await fetch(`${API_BASE_URL}/api/payments/google-pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentData,
        amount,
        currency: 'USD'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Payment processing failed',
        message: data.message || 'Failed to process payment on server'
      };
    }

    return {
      success: true,
      transactionId: data.transactionId,
      paymentMethod: data.paymentMethod
    };
  } catch (error: any) {
    console.error('Backend payment error:', error);
    return {
      success: false,
      error: 'Network error',
      message: 'Unable to connect to payment server. Please check your internet connection.'
    };
  }
}

// Declare PaymentRequest types for TypeScript
declare global {
  interface Window {
    PaymentRequest?: any;
  }
}

