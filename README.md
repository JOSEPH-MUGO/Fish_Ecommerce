# Fish E-commerce Platform

A complete Web e-commerce platform for selling fresh fish and seafood, built with React.js, Node.js, and PostgreSQL.

## Features

### Customer Features
- ✅ **Home Page** - Attractive landing page with featured products and promotions
- ✅ **Shop Page** - Browse products with filters (category, price, search)
- ✅ **Product Details** - Detailed product information with images and specifications
- ✅ **Shopping Cart** - Add/remove items, update quantities
- ✅ **Checkout System** - Secure checkout with delivery details
- ✅ **Order Management** - View order history and status in tabular format
- ✅ **User Authentication** - Register, login, reset password
- ✅ **Contact Page** - Contact form and business information
- ✅ **Responsive Design** - Mobile-friendly across all devices

### Admin Features
- ✅ **Admin Dashboard** - Comprehensive admin panel with sidebar navigation
- ✅ **Product Management** - Add, edit, delete products with image upload
- ✅ **Order Management** - View and update order status with pagination
- ✅ **User Management** - View customer information and statistics
- ✅ **Category Management** - Organize products into categories
- ✅ **Analytics** - Dashboard with key metrics and recent order activity

### Technical Features
- ✅ **Cloudinary Integration** - Image storage and optimization
- ✅ **PostgreSQL Database** - Robust data storage with Prisma ORM
- ✅ **JWT Authentication** - Secure user authentication
- ✅ **Input Validation** - Server-side validation with express-validator
- ✅ **Error Handling** - Comprehensive error handling and logging
- ✅ **SEO Optimization** - Meta tags and structured data
- ✅ **Social Media Integration** - Facebook, Instagram, WhatsApp links

## Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Toastify** - Notifications feedbacks
- **React Icons** - Icon library
- **React Helmet** - SEO meta tags

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - Database ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image storage
- **Helmet** - Security middleware
- **Express Rate Limit** - Rate limiting

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL 
- Cloudinary account

### 1. Clone the repository
```bash
git clone https://github.com/JOSEPH-MUGO/Fish_Ecommerce.git
cd fish-ecommerce
```

### 2. Install dependencies
```bash
npm run install-all
```

### 3. Database Setup
```bash
# Create PostgreSQL database
create db fish_ecommerce;
```
# Configure environment variables
create `.env` file in server and client folder
# Edit server/.env with your database credentials

### 4. Environment Variables 

#### In Server folder (.env)
``` bash
DATABASE_URL="postgresql://username:password@localhost:5432/fish_ecommerce"
JWT_SECRET="your-super-secret-jwt-key"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:3000"
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@email.com
SMTP_PASSWORD=SmtpApppassword
NOTIFICATION_EMAIL=your@email.com
```

#### Client (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### 5. Database Migration
```bash
cd server
npx prisma migrate dev
npx prisma studio
```
## Create Admin User
Generate a bcrypt hash of your chosen password:
In the server folder run
Remember to change `YourAdminPassword` to your desired password.
```bash 
node -e "console.log(require('bcryptjs').hashSync('YourAdminPassword', 12))"
```
-In Prisma Studio (http://localhost:5555), select the **User model** and click **Add Record**.

### Fill these records values:
```bash

- email:	`admin@example.com`
- password:	`paste bcrypt hash from step 1`
- firstName:	`YourFirstAdmin Name`
- lastName: `YourLastAdmin Name`
- phone:	optional
- role:	`ADMIN`
- resetToken:	(leave empty)
- resetTokenExpiry:	(leave empty)
```
Click **Save 1 Change** on top.

### 6. Start Development Servers
# From root directory fish_ecommerce
```bash
npm run dev
```

This will start:
`
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
`
## Admin Account
After seeding the database in prisma studio, you can login with:
- **Email**: `admin@example.com`
- **Password**: `YourAdminPassword`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forget-password` - user forget password
- `POST /api/auth/reset-password` - User reset password
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured/list` - Get featured products

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user orders (authenticated)
- `GET /api/orders/:orderNumber` - Get single order

### Admin Routes
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/products` - Get all products (admin)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### File Upload
- `POST /api/upload/image` - Upload single image
- `DELETE /api/upload/image/:publicId` - Delete image

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

