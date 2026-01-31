# VoltVibe Electronics - E-Commerce Platform

A modern, full-featured e-commerce platform for high-end electronics with integrated payment processing.

## Features

- 🛍️ **Product Catalog** - Browse and search through a curated selection of electronics
- 🛒 **Shopping Cart** - Add items, manage quantities, and checkout seamlessly
- 💳 **Payment Integration** - Multiple payment methods including M-Pesa (✅ Complete), Google Pay (✅ Complete), and PayPal (🚧 Coming Soon)
- 🔐 **User Authentication** - Secure login and user profiles
- ⭐ **Reviews & Ratings** - Customer reviews and product ratings
- 🤖 **AI Chat Assistant** - Powered by Google Gemini for shopping assistance
- 🎨 **Modern UI** - Beautiful, responsive design with dark mode support
- 👥 **Role-Based Access** - Customer, Manager, and Super Admin roles

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express
- **Payment**: M-Pesa Daraja API (Safaricom)
- **AI**: Google Gemini API
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Safaricom Developer Account (for M-Pesa payments)
- Google Gemini API Key (optional, for chat assistant)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd elecShop
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy the example from `MPESA_SETUP.md`
   - Create a `.env` file with your credentials
   - See `MPESA_SETUP.md` for detailed configuration

4. Run the application:

**Option 1: Run both frontend and backend together**
```bash
npm run dev:all
```

**Option 2: Run separately**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server
```

5. Open your browser:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Payment Integration

### M-Pesa Integration

M-Pesa STK Push (Lipa Na M-PESA Online) payments are fully implemented using Safaricom's Daraja API.

**Features:**
- STK Push payment initiation
- Real-time payment status polling
- Payment confirmation callbacks
- Error handling and retry logic

**Setup:**
See `MPESA_SETUP.md` for detailed setup instructions.

**Status:**
✅ **Completed** - Ready for testing and production use

### Google Pay Integration

Google Pay is implemented using the Payment Request API (browser-native).

**Features:**
- Browser-native payment sheet
- Tokenized secure payments
- Mobile and desktop support
- Fast one-click checkout

**Setup:**
See `GOOGLE_PAY_SETUP.md` for detailed setup instructions.

**Status:**
✅ **Completed** - Ready for testing (configure payment gateway for production)

### PayPal Integration

🚧 **Coming Soon** - PayPal integration will be implemented next.

## Project Structure

```
elecShop/
├── components/          # React components
│   ├── PaymentModal.tsx
│   ├── MpesaPaymentModal.tsx
│   └── ...
├── services/           # API services
│   ├── mpesaService.ts
│   └── geminiService.ts
├── server/             # Backend server
│   └── index.js       # Express server with M-Pesa API
├── constants.tsx       # App constants
├── types.ts           # TypeScript types
└── App.tsx            # Main app component
```

## Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start backend API server
- `npm run dev:all` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables

Required environment variables (see `MPESA_SETUP.md` for details):

- `MPESA_CONSUMER_KEY` - Safaricom API consumer key
- `MPESA_CONSUMER_SECRET` - Safaricom API consumer secret
- `MPESA_SHORTCODE` - M-Pesa business shortcode
- `MPESA_PASSKEY` - M-Pesa passkey
- `MPESA_BASE_URL` - API base URL (sandbox or production)
- `MPESA_CALLBACK_URL` - Payment callback URL
- `VITE_API_BASE_URL` - Backend API URL for frontend
- `GEMINI_API_KEY` - Google Gemini API key (optional)

## Development

### Adding New Features

1. **Payment Methods**: Add new payment providers in `services/` and update `PaymentModal.tsx`
2. **Components**: Add new React components in `components/`
3. **API Endpoints**: Add new routes in `server/index.js`

## Authentication & RBAC

VoltVibe uses **Supabase** for secure authentication with a comprehensive Role-Based Access Control system.

### User Roles

- **Customer**: Browse products, place orders, view profile
- **Manager**: Admin dashboard, manage products, view analytics
- **Super Admin**: Full system access, delete products, user management

### Setting Up Authentication

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Add credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. See [RBAC_AUTH_GUIDE.md](./RBAC_AUTH_GUIDE.md) for detailed setup

### Admin Dashboard

- Access at `/admin` (Manager and Super Admin only)
- Manage products, view statistics, analytics
- Add, edit, or delete products

For detailed authentication documentation, see [RBAC_AUTH_GUIDE.md](./RBAC_AUTH_GUIDE.md)

### Testing M-Pesa Payments

1. Use sandbox credentials from Safaricom Developer Portal
2. Use test phone numbers provided by Safaricom
3. For callbacks, use ngrok to expose local server:
   ```bash
   ngrok http 3001
   ```

## Security

- Never commit `.env` files
- Keep API credentials secure
- Use HTTPS in production
- Validate all user inputs
- Implement proper error handling

## License

[Your License Here]

## Support

For M-Pesa API issues:
- [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
- [Daraja API Documentation](https://developer.safaricom.co.ke/apis)

For application issues, please open an issue in the repository.

## Deployment

### Quick Deploy (Node server serving static build)

1. Build the client:
```bash
npm run build
```

2. Start the server (serves `dist` when `NODE_ENV=production`):
```bash
NODE_ENV=production npm start
```

This will serve the built frontend and the API from the same process.

### Deploy to Heroku / Render / Generic Node Host

- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` and M-Pesa env vars are set in the host's environment settings.
- The repo includes a `heroku-postbuild` script that builds the client on deploy.
- Start command: `npm start`

### Vercel / Netlify (Frontend) + Separate Backend

- Option A: Deploy frontend to Vercel/Netlify (use `npm run build`).
- Option B: Deploy backend (`server/index.js`) to Render, Railway, or similar and set `VITE_API_BASE_URL` to the backend URL.

### Notes

- Use HTTPS in production for OAuth and payment callbacks.
- If you deploy the server and client together, the server will serve the built `dist` folder automatically when `NODE_ENV=production`.
- See `GOOGLE_OAUTH_SETUP.md` and `MPESA_SETUP.md` for provider-specific deployment notes.

### Containerized Deployment (Docker & Railway)

You can deploy the backend using Railway with the provided `Dockerfile`.

1. Build and run locally (production image):
```bash
# Build image
docker build -t voltvibe-app .

# Run container (set required env vars)
docker run -p 3001:3001 \
   -e VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
   -e VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
   -e MPESA_CONSUMER_KEY="$MPESA_CONSUMER_KEY" \
   -e MPESA_CONSUMER_SECRET="$MPESA_CONSUMER_SECRET" \
   -e MPESA_SHORTCODE="$MPESA_SHORTCODE" \
   -e MPESA_PASSKEY="$MPESA_PASSKEY" \
   -e MPESA_CALLBACK_URL="$MPESA_CALLBACK_URL" \
   voltvibe-app
```

2. Or use `docker-compose` for a simple local deployment:
```bash
docker-compose up --build
```

3. Deploying to Railway

- Create a new Railway project and connect your GitHub repo or choose Docker deploy.
- If using the Docker deployment option, Railway will use the included `Dockerfile` to build.
- Set the environment variables in Railway's dashboard (Supabase keys, M-Pesa secrets, `PORT` if needed).
- Deploy and monitor logs via Railway.

Notes:
- Railway will expose your service on a public URL; update `VITE_API_BASE_URL` in your frontend deployment to point to that URL if the frontend is deployed separately.
- Ensure `MPESA_CALLBACK_URL` uses the public Railway URL (HTTPS) for callbacks.

