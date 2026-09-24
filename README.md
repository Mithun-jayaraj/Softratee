# SoftraTees - MERN Full Stack

This is a complete MERN stack application for a custom T-shirt clothing brand. It allows customers to browse products, customize them with text and designs, add them to their cart, and checkout. It also features a fully functional admin panel to manage products, orders, and users.

## Features

### Customer Features
- **User Registration and Login:** Secure authentication using JWT.
- **Product Storefront:** Browse, search, and view detailed product information.
- **T-Shirt Customization (CORE):** Select color and size, add custom text (adjustable color, size, position), upload custom designs (adjustable size and position), and preview the result before adding to cart.
- **Cart & Checkout:** Add customized/standard items to the cart, adjust quantities, review order, and process checkout.
- **Order Management:** View order history, track order status, and view delivery details.

### Admin Features
- **Admin Dashboard:** Overview of total sales, total orders, pending shipments, and registered users.
- **Product Management:** Full CRUD capabilities for products. Support for Cloudinary image uploads.
- **Order Management:** View all user orders, track payment status, and mark orders as delivered.
- **Coupon Management:** Create, delete, and view discount coupons.

## Technology Stack
- **Frontend:** React.js, React Router, Context API for state management, plain CSS for styling (responsive).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB, Mongoose ODM.
- **Authentication:** JWT (JSON Web Tokens), bcryptjs for password hashing.
- **Image Storage:** Cloudinary (via multer).
- **Payments:** Prepared for Stripe integration.

## Project Structure
```
project-root/
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, etc.)
│   │   ├── context/        # State management (AuthContext, CartContext)
│   │   ├── pages/          # Application views (Auth, Products, Cart, Admin, etc.)
│   │   ├── services/       # Axios API client setup
│   │   └── App.jsx         # Main application routing
│
├── server/                 # Express backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Business logic for routes
│   ├── middleware/         # Auth, Error handling
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express API routes
│   └── server.js           # Main application entry point
│
└── README.md
```

## Installation Steps

1. **Clone the repository.**
2. **Setup the Backend:**
   - Navigate to the `server` directory: `cd server`
   - Install dependencies: `npm install`
   - Configure environment variables (see below).
   - Start the server: `npm run dev` (starts on port 5000 by default).
3. **Setup the Frontend:**
   - Navigate to the `client` directory: `cd client`
   - Install dependencies: `npm install`
   - Start the React app: `npm run dev`

## Environment Variables
Create a `.env` file in the `server` directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Basic Usage Instructions
- **Access the app:** Open `http://localhost:5173` (default Vite port) in your browser.
- **Admin Access:** Register a new user, then manually set `isAdmin: true` for that user in your MongoDB database to access the `/admin` routes.
- **Customization:** Navigate to any customizable product, click "Customize Design", modify the overlay text/images, and add it directly to your cart.
