# Week 4 MERN Capstone — ShopLite E-Commerce

This project is based on the uploaded Week 4 PDFs. It includes:
- React frontend connected to a Node.js/Express API
- Signup and login using hashed passwords and JWT
- Product listing and search
- Shopping cart and checkout/order creation
- Order history for the logged-in user
- Admin-only product create/update/delete endpoints
- Deployment configuration for Vercel (frontend) and Render (backend)
- MongoDB Atlas configuration

## 1. Requirements
- Node.js 20+ and npm
- MongoDB local installation or MongoDB Atlas account
- Git and GitHub account
- Postman (recommended for API testing)

## 2. Run the backend
Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to `.env` and fill in values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/week4_shoplite
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
```

Then run:

```bash
npm run dev
```

API base URL: `http://localhost:5000/api`

For the first admin account, register with the email matching `ADMIN_EMAIL`. The server assigns the admin role only to that configured email. Keep this value private in production.

## 3. Run the frontend
Open a second terminal in `frontend`:

```bash
npm install
```

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Then run:

```bash
npm run dev
```

Open the local URL printed by Vite.

## 4. Main API routes
| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| GET | `/api/products` | No | List/search products |
| GET | `/api/products/:id` | No | Product details |
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Login and get JWT |
| GET | `/api/auth/me` | Bearer token | Current account |
| POST | `/api/orders` | Bearer token | Create order from cart |
| GET | `/api/orders/my` | Bearer token | Current user's orders |
| POST | `/api/admin/products` | Admin token | Add product |
| PUT | `/api/admin/products/:id` | Admin token | Update product |
| DELETE | `/api/admin/products/:id` | Admin token | Delete product |

Use Postman → Authorization → Bearer Token for protected routes.

## 5. Deployment
### Backend on Render
1. Push this folder/repository to GitHub.
2. Create a Render **Web Service** from the repository and set the Root Directory to `backend`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `ADMIN_EMAIL`, and `NODE_ENV=production`.
6. After deploying the frontend, set `CLIENT_URL` to the deployed Vercel frontend URL.
7. Use the Render service URL as the frontend `VITE_API_URL`, with `/api` at the end.

### Frontend on Vercel
1. Import the GitHub repository into Vercel.
2. Set Root Directory to `frontend`.
3. Framework preset: Vite.
4. Add `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api`.
5. Deploy.

For SPA route fallback, `frontend/vercel.json` is included. The app primarily uses the root route.

## 6. Submit to college
- Submit the GitHub repository URL.
- Include screenshots of the home/product listing, signup/login, cart, and order history.
- Include Postman screenshots for signup/login, product listing, and order creation.
- Add your actual deployed Vercel and Render URLs to this README after deployment.
- Deployment and GitHub publishing require your own account; this project cannot publish or deploy without your credentials.

## Notes
- Checkout creates a demo order record; it does not charge a real payment method.
- Product admin endpoints are protected by an admin role.
- Never commit `.env` or real secrets to GitHub.
