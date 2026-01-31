import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Safaricom Daraja API Configuration
// Trim whitespace from credentials to avoid common copy-paste issues
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY?.trim();
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET?.trim();
const SHORTCODE = process.env.MPESA_SHORTCODE?.trim();
const PASSKEY = process.env.MPESA_PASSKEY?.trim();
const BASE_URL = (process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke').trim(); // Use 'https://api.safaricom.co.ke' for production

// Validate required environment variables
if (!CONSUMER_KEY || !CONSUMER_SECRET || !SHORTCODE || !PASSKEY) {
  console.error('❌ Missing required M-Pesa credentials in .env file:');
  if (!CONSUMER_KEY) console.error('   - MPESA_CONSUMER_KEY');
  if (!CONSUMER_SECRET) console.error('   - MPESA_CONSUMER_SECRET');
  if (!SHORTCODE) console.error('   - MPESA_SHORTCODE');
  if (!PASSKEY) console.error('   - MPESA_PASSKEY');
  console.error('\n📝 Please check MPESA_SETUP.md for configuration instructions.\n');
}

// Token caching to avoid unnecessary requests
let cachedToken = null;
let tokenExpiry = null;
const TOKEN_EXPIRY_BUFFER = 60 * 1000; // Refresh token 1 minute before expiry

// Get OAuth Access Token
async function getAccessToken() {
  try {
    // Check if we have a valid cached token
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - TOKEN_EXPIRY_BUFFER) {
      return cachedToken;
    }

    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
      throw new Error('M-Pesa credentials not configured. Please check your .env file.');
    }

    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    // For sandbox, the OAuth endpoint might be different
    const oauthUrl = BASE_URL.includes('sandbox') 
      ? `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`
      : `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;

    console.log('🔑 Requesting OAuth token from:', oauthUrl.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in log

    const response = await axios.get(oauthUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data || !response.data.access_token) {
      throw new Error('Invalid response from OAuth endpoint. No access token received.');
    }

    // Cache the token (tokens typically expire in 1 hour)
    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in ? response.data.expires_in * 1000 : 3600 * 1000);
    
    console.log('✅ OAuth token obtained successfully');
    return cachedToken;
  } catch (error) {
    console.error('❌ Error getting access token:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('   No response received. Check your internet connection and BASE_URL.');
    } else {
      console.error('   Error:', error.message);
    }
    throw error;
  }
}

// Generate password for STK Push
// Format: base64(BusinessShortCode + Passkey + Timestamp)
// Timestamp format: YYYYMMDDHHmmss (14 digits, no separators)
function generatePassword() {
  const now = new Date();
  // Format: YYYYMMDDHHmmss (14 digits)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
  
  // Ensure SHORTCODE is treated as string for concatenation
  const shortcodeStr = String(SHORTCODE);
  const passwordString = `${shortcodeStr}${PASSKEY}${timestamp}`;
  const password = Buffer.from(passwordString).toString('base64');
  
  return { password, timestamp };
}

// Initiate STK Push (C2B Payment)
app.post('/api/mpesa/stk-push', async (req, res) => {
  try {
    const { phoneNumber, amount, accountReference, transactionDesc } = req.body;

    // Validate inputs
    if (!phoneNumber || !amount) {
      return res.status(400).json({ 
        error: 'Phone number and amount are required' 
      });
    }

    // Validate credentials are configured
    if (!CONSUMER_KEY || !CONSUMER_SECRET || !SHORTCODE || !PASSKEY) {
      const missing = [];
      if (!CONSUMER_KEY) missing.push('MPESA_CONSUMER_KEY');
      if (!CONSUMER_SECRET) missing.push('MPESA_CONSUMER_SECRET');
      if (!SHORTCODE) missing.push('MPESA_SHORTCODE');
      if (!PASSKEY) missing.push('MPESA_PASSKEY');
      
      return res.status(500).json({
        error: 'M-Pesa credentials not configured',
        message: `Missing required credentials: ${missing.join(', ')}`,
        details: 'STK Push (Lipa Na M-PESA Online) requires a Passkey. Please check MPESA_SETUP.md for instructions.'
      });
    }

    // Normalize phone number (ensure it starts with 254)
    let normalizedPhone = phoneNumber.replace(/\s+/g, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '254' + normalizedPhone.substring(1);
    } else if (normalizedPhone.startsWith('+')) {
      normalizedPhone = normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith('254')) {
      normalizedPhone = '254' + normalizedPhone;
    }

    // Validate phone number format (should be 12 digits starting with 254)
    if (!/^254[17]\d{8}$/.test(normalizedPhone)) {
      return res.status(400).json({
        error: 'Invalid phone number format',
        message: 'Phone number must be a valid Kenyan mobile number (e.g., 254712345678)'
      });
    }

    // Get access token
    console.log('📱 Initiating STK Push for:', normalizedPhone);
    const accessToken = await getAccessToken();
    
    // Generate password and timestamp
    const { password, timestamp } = generatePassword();

    // Determine callback URL
    // For sandbox, you can use a test URL or ngrok
    // For production, must be a valid HTTPS URL
    let callbackURL = process.env.MPESA_CALLBACK_URL;
    
    if (!callbackURL) {
      // Default to localhost for development, but warn user
      const defaultURL = `${req.protocol}://${req.get('host')}/api/mpesa/callback`;
      
      // Check if it's localhost (not publicly accessible)
      if (defaultURL.includes('localhost') || defaultURL.includes('127.0.0.1')) {
        console.warn('⚠️  WARNING: Using localhost callback URL. This will fail in sandbox/production.');
        console.warn('   For sandbox testing, use ngrok or set MPESA_CALLBACK_URL in .env');
        console.warn('   Example: ngrok http 3001');
        console.warn('   Then set: MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback');
      }
      
      callbackURL = defaultURL;
    }

    // STK Push request payload
    // Note: According to Safaricom docs, Amount should be a string
    // BusinessShortCode can be number or string, but we'll use number for consistency
    const stkPushPayload = {
      BusinessShortCode: parseInt(SHORTCODE, 10), // Ensure it's a number
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: String(Math.round(amount)), // Amount as string per Safaricom format
      PartyA: normalizedPhone,
      PartyB: parseInt(SHORTCODE, 10), // Ensure it's a number
      PhoneNumber: normalizedPhone,
      CallBackURL: callbackURL,
      AccountReference: accountReference || 'VOLTVIBE',
      TransactionDesc: transactionDesc || 'Payment for electronics purchase'
    };

    console.log('🔗 Callback URL:', callbackURL);

    // Debug: Log the password generation components (without exposing full passkey)
    console.log('🔐 Password generation:');
    console.log('   Shortcode:', SHORTCODE);
    console.log('   Passkey length:', PASSKEY ? PASSKEY.length : 0);
    console.log('   Timestamp:', timestamp);
    console.log('   Password (first 20 chars):', password.substring(0, 20) + '...');

    console.log('📤 Sending STK Push request to:', `${BASE_URL}/mpesa/stkpush/v1/processrequest`);

    // Make STK Push request
    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      stkPushPayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ STK Push initiated successfully:', response.data.CheckoutRequestID);

    res.json({
      success: true,
      checkoutRequestID: response.data.CheckoutRequestID,
      customerMessage: response.data.CustomerMessage,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
      merchantRequestID: response.data.MerchantRequestID
    });

  } catch (error) {
    console.error('❌ STK Push Error:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      
      // Provide more helpful error messages
      if (error.response.data?.errorCode === '404.001.03') {
        return res.status(401).json({
          error: 'Invalid Access Token',
          message: 'Authentication failed. Please check your Consumer Key and Consumer Secret in the .env file.',
          details: 'The OAuth token could not be validated. Ensure your credentials are correct and your app is active in the Safaricom Developer Portal.'
        });
      }
      
      if (error.response.data?.errorCode === '400.002.02') {
        return res.status(400).json({
          error: 'Invalid Callback URL',
          message: 'The callback URL must be publicly accessible (not localhost).',
          details: 'For local development, use ngrok to expose your server. Run: ngrok http 3001, then set MPESA_CALLBACK_URL in your .env file to the ngrok HTTPS URL.',
          callbackUrl: process.env.MPESA_CALLBACK_URL || 'Not set (using localhost)',
          solution: '1. Install ngrok: https://ngrok.com/download\n2. Run: ngrok http 3001\n3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)\n4. Add to .env: MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback\n5. Restart server'
        });
      }
    } else {
      console.error('   Error:', error.message);
    }
    
    res.status(500).json({
      error: 'Failed to initiate payment',
      message: error.response?.data?.errorMessage || error.message || 'An unexpected error occurred'
    });
  }
});

// STK Push Query - Check payment status
app.post('/api/mpesa/query-status', async (req, res) => {
  try {
    const { checkoutRequestID } = req.body;

    if (!checkoutRequestID) {
      return res.status(400).json({ error: 'CheckoutRequestID is required' });
    }

    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    const queryPayload = {
      BusinessShortCode: parseInt(SHORTCODE, 10), // Ensure it's a number
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID
    };

    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`,
      queryPayload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      resultCode: response.data.ResultCode,
      resultDesc: response.data.ResultDesc,
      checkoutRequestID: response.data.CheckoutRequestID,
      merchantRequestID: response.data.MerchantRequestID
    });

  } catch (error) {
    console.error('Query Status Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to query payment status',
      message: error.response?.data?.errorMessage || error.message
    });
  }
});

// Callback endpoint for M-Pesa notifications
app.post('/api/mpesa/callback', (req, res) => {
  try {
    const callbackData = req.body;
    console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

    // Handle the callback
    if (callbackData.Body?.stkCallback) {
      const stkCallback = callbackData.Body.stkCallback;
      const resultCode = stkCallback.ResultCode;
      const resultDesc = stkCallback.ResultDesc;
      const checkoutRequestID = stkCallback.CheckoutRequestID;
      const merchantRequestID = stkCallback.MerchantRequestID;

      if (resultCode === 0) {
        // Payment successful
        const callbackMetadata = stkCallback.CallbackMetadata;
        const items = callbackMetadata?.Item || [];
        
        const receiptNumber = items.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
        const transactionDate = items.find(item => item.Name === 'TransactionDate')?.Value;
        const phoneNumber = items.find(item => item.Name === 'PhoneNumber')?.Value;
        const amount = items.find(item => item.Name === 'Amount')?.Value;

        console.log('Payment Successful:', {
          receiptNumber,
          transactionDate,
          phoneNumber,
          amount,
          checkoutRequestID,
          merchantRequestID
        });

        // Here you would typically:
        // 1. Update your database with the payment confirmation
        // 2. Send confirmation email to customer
        // 3. Update order status
      } else {
        // Payment failed or cancelled
        console.log('Payment Failed:', {
          resultCode,
          resultDesc,
          checkoutRequestID,
          merchantRequestID
        });
      }
    }

    // Always acknowledge receipt
    res.json({
      ResultCode: 0,
      ResultDesc: 'Callback received successfully'
    });

  } catch (error) {
    console.error('Callback Error:', error);
    res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Error processing callback'
    });
  }
});

// Google Pay payment processing endpoint
app.post('/api/payments/google-pay', async (req, res) => {
  try {
    const { paymentData, amount, currency } = req.body;

    // Validate inputs
    if (!paymentData || !amount) {
      return res.status(400).json({
        error: 'Payment data and amount are required'
      });
    }

    console.log('💳 Processing Google Pay payment:', {
      amount,
      currency: currency || 'USD',
      hasPaymentData: !!paymentData
    });

    // In a real implementation, you would:
    // 1. Validate the payment token with Google Pay API
    // 2. Process the payment through your payment gateway (Stripe, PayPal, etc.)
    // 3. Store the transaction in your database
    // 4. Send confirmation email

    // For now, we'll simulate successful processing
    // In production, integrate with your actual payment processor
    
    // Example: If using Stripe
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Convert to cents
    //   currency: currency.toLowerCase(),
    //   payment_method_data: paymentData
    // });

    // Generate a transaction ID
    const transactionId = `GP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('✅ Google Pay payment processed:', transactionId);

    res.json({
      success: true,
      transactionId,
      amount,
      currency: currency || 'USD',
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('❌ Google Pay processing error:', error);
    res.status(500).json({
      error: 'Payment processing failed',
      message: error.message || 'An error occurred while processing your payment'
    });
  }
});

// Serve static client build in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  console.log('📦 Serving static files from', distPath);
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'M-Pesa Payment API' });
});

// Test endpoint to verify credentials and token generation
app.get('/api/mpesa/test-auth', async (req, res) => {
  try {
    const credentials = {
      hasConsumerKey: !!CONSUMER_KEY,
      hasConsumerSecret: !!CONSUMER_SECRET,
      hasShortcode: !!SHORTCODE,
      hasPasskey: !!PASSKEY,
      baseUrl: BASE_URL,
      shortcode: SHORTCODE || 'NOT SET'
    };

    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
      return res.status(400).json({
        success: false,
        error: 'Credentials not configured',
        credentials,
        message: 'Please configure MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in your .env file'
      });
    }

    // Try to get access token
    const token = await getAccessToken();
    
    res.json({
      success: true,
      message: 'Authentication successful',
      credentials: {
        ...credentials,
        consumerKey: CONSUMER_KEY.substring(0, 10) + '...' // Show partial key for verification
      },
      tokenReceived: !!token,
      tokenLength: token ? token.length : 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: error.message,
      details: error.response?.data || 'Check your credentials and network connection'
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 M-Pesa Payment Server running on port ${PORT}`);
  console.log(`📡 Base URL: ${BASE_URL}`);
  console.log(`📱 Shortcode: ${SHORTCODE || 'NOT CONFIGURED'}`);
  
  if (!CONSUMER_KEY || !CONSUMER_SECRET || !SHORTCODE || !PASSKEY) {
    console.log(`\n⚠️  WARNING: M-Pesa credentials not fully configured!`);
    console.log(`   Please check your .env file and see MPESA_SETUP.md for instructions.\n`);
  } else {
    console.log(`✅ M-Pesa credentials loaded`);
    // Test token generation on startup
    getAccessToken()
      .then(() => {
        console.log(`✅ OAuth token test successful\n`);
      })
      .catch((err) => {
        console.log(`❌ OAuth token test failed:`);
        console.log(`   ${err.message}\n`);
      });
  }
});

