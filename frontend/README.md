
/*
# Plant Health Detection System - Frontend

## Overview
React frontend for the Plant Health Detection System with secure dual-token authentication.

## Features
- ✅ Dual Token Authentication (Access + Refresh)
- ✅ Automatic token refresh
- ✅ Protected routes
- ✅ Image upload with validation
- ✅ Real-time prediction results
- ✅ Session-based history (Claude-style)
- ✅ Responsive design with Tailwind CSS

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend running on http://localhost:3000

### Setup Steps

1. Install dependencies:
```bash
npm install
```

2. Create .env file:
```bash
cp .env.example .env
```

3. Update .env with your backend URL:
```
VITE_API_URL=http://localhost:3000/api
```

4. Start development server:
```bash
npm run dev
```

5. Open browser:
```
http://localhost:5173
```

## Project Structure
```
src/
├── api/              # API integration
│   ├── axios.js      # Configured axios with interceptors
│   ├── auth.js       # Auth API calls
│   ├── prediction.js # Prediction API calls
│   └── history.js    # History API calls
├── components/       # React components
│   ├── auth/         # Authentication components
│   ├── layout/       # Layout components
│   ├── prediction/   # Prediction components
│   └── history/      # History components
├── context/          # React context
│   └── AuthContext.jsx
├── hooks/            # Custom hooks
│   └── useAuth.js
├── pages/            # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Predict.jsx
│   └── History.jsx
├── utils/            # Utilities
│   ├── tokenManager.js  # Token storage
│   ├── constants.js
│   └── helpers.js
├── App.jsx           # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles
```

## Security Features

### Token Management
- **Access Token**: Stored in memory (NOT localStorage)
- **Refresh Token**: HTTP-only cookie (automatic)
- **Auto-refresh**: Seamless token renewal
- **XSS Protection**: No tokens in localStorage
- **CSRF Protection**: SameSite cookies

### Authentication Flow
1. User logs in → Receives access token + refresh cookie
2. Access token stored in memory (15min lifespan)
3. Token sent with every API request
4. On expiry → Auto-refresh using cookie
5. Refresh fails → Redirect to login

## API Integration

### Axios Configuration
- Base URL from environment
- Automatic token injection
- Response interceptor for refresh
- Error handling

### Token Refresh Flow
```javascript
Request → 401 TOKEN_EXPIRED → Auto refresh → Retry request
```

## Build for Production

```bash
npm run build
```

Outputs to `dist/` directory.

## Environment Variables

```bash
VITE_API_URL=http://localhost:3000/api  # Backend API URL
```

## Testing

### Manual Testing Checklist
- [ ] Registration
- [ ] Login
- [ ] Token auto-refresh (wait 16min)
- [ ] Image upload
- [ ] Prediction display
- [ ] History viewing
- [ ] Session management
- [ ] Logout
- [ ] Protected routes

## Troubleshooting

### CORS Issues
Ensure backend has proper CORS configuration:
```javascript
cors({
  origin: 'http://localhost:5173',
  credentials: true
})
```

### Token Refresh Not Working
- Check cookies in browser DevTools
- Verify `withCredentials: true` in axios
- Ensure backend sends `Set-Cookie` header

### Images Not Uploading
- Check file size (max 5MB)
- Verify file type (JPG, PNG only)
- Check network tab for errors

## License
MIT
*/