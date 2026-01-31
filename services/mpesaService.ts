// M-Pesa Payment Service
// This service handles communication with the backend M-Pesa API

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference?: string;
  transactionDesc?: string;
}

export interface STKPushResponse {
  success: boolean;
  checkoutRequestID?: string;
  customerMessage?: string;
  responseCode?: string;
  responseDescription?: string;
  merchantRequestID?: string;
  error?: string;
  message?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  resultCode?: number;
  resultDesc?: string;
  checkoutRequestID?: string;
  merchantRequestID?: string;
  error?: string;
  message?: string;
}

/**
 * Normalize phone number to Safaricom format (254XXXXXXXXX)
 */
export function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/\s+/g, '').replace(/-/g, '');
  
  if (normalized.startsWith('0')) {
    normalized = '254' + normalized.substring(1);
  } else if (normalized.startsWith('+')) {
    normalized = normalized.substring(1);
  } else if (!normalized.startsWith('254')) {
    normalized = '254' + normalized;
  }
  
  return normalized;
}

/**
 * Initiate STK Push payment request
 */
export async function initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mpesa/stk-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: normalizePhoneNumber(request.phoneNumber),
        amount: request.amount,
        accountReference: request.accountReference || 'VOLTVIBE',
        transactionDesc: request.transactionDesc || 'Payment for electronics purchase'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to initiate payment',
        message: data.message || 'An error occurred while processing your payment request'
      };
    }

    return {
      success: true,
      checkoutRequestID: data.checkoutRequestID,
      customerMessage: data.customerMessage,
      responseCode: data.responseCode,
      responseDescription: data.responseDescription,
      merchantRequestID: data.merchantRequestID
    };
  } catch (error) {
    console.error('STK Push Error:', error);
    return {
      success: false,
      error: 'Network error',
      message: 'Unable to connect to payment server. Please check your internet connection and try again.'
    };
  }
}

/**
 * Query payment status using checkout request ID
 */
export async function queryPaymentStatus(checkoutRequestID: string): Promise<PaymentStatusResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mpesa/query-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkoutRequestID
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to query payment status',
        message: data.message || 'An error occurred while checking payment status'
      };
    }

    return {
      success: true,
      resultCode: data.resultCode,
      resultDesc: data.resultDesc,
      checkoutRequestID: data.checkoutRequestID,
      merchantRequestID: data.merchantRequestID
    };
  } catch (error) {
    console.error('Query Status Error:', error);
    return {
      success: false,
      error: 'Network error',
      message: 'Unable to check payment status. Please try again.'
    };
  }
}

/**
 * Poll payment status until completion or timeout
 */
export async function pollPaymentStatus(
  checkoutRequestID: string,
  onStatusUpdate?: (status: PaymentStatusResponse) => void,
  maxAttempts: number = 30,
  intervalMs: number = 3000
): Promise<PaymentStatusResponse> {
  let attempts = 0;

  return new Promise((resolve) => {
    const poll = async () => {
      attempts++;
      
      const status = await queryPaymentStatus(checkoutRequestID);
      
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }

      // ResultCode 0 means payment successful
      // ResultCode 1032 means user cancelled
      // Other codes indicate various failure states
      if (status.success && status.resultCode !== undefined) {
        if (status.resultCode === 0) {
          resolve(status);
          return;
        } else if (status.resultCode === 1032) {
          resolve({
            ...status,
            success: false,
            error: 'Payment cancelled',
            message: 'You cancelled the payment request on your phone'
          });
          return;
        } else if (status.resultCode !== undefined && status.resultCode !== 0) {
          // Payment failed
          resolve({
            ...status,
            success: false,
            error: 'Payment failed',
            message: status.resultDesc || 'Payment could not be completed'
          });
          return;
        }
      }

      // Continue polling if not resolved and within max attempts
      if (attempts < maxAttempts) {
        setTimeout(poll, intervalMs);
      } else {
        // Timeout - payment might still be pending
        resolve({
          success: false,
          error: 'Timeout',
          message: 'Payment status check timed out. Please check your phone or contact support.'
        });
      }
    };

    // Start polling after initial delay
    setTimeout(poll, intervalMs);
  });
}

