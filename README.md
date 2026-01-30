# Lena Luxe Wear - E-Commerce Platform

A modern, full-stack e-commerce web application built with Next.js, featuring bilingual support (English/Amharic), dark mode, and comprehensive e-commerce functionality.

![Lena Luxe Wear](./public/lena.png)

## ✨ Features

### Core Features

- 🛍️ **Product Catalog**: Browse 50+ products across multiple categories
- 🔍 **Advanced Search & Filtering**: Real-time search with category, price range, and sorting options
- 🛒 **Shopping Cart**: Add, remove, and manage cart items
- 👤 **User Authentication**: Secure registration and login system
- 📦 **Order Management**: Place orders and track order history
- ⭐ **Product Reviews**: Rate and review products
- ❤️ **Wishlist**: Save favorite products for later
- 🌐 **Bilingual Support**: Full English and Amharic translations
- 🌙 **Dark Mode**: Smooth light/dark theme switching
- 📱 **Responsive Design**: Mobile-first, works on all devices

### Admin Features

- 📊 **Dashboard**: Overview of products, orders, and users
- ➕ **Product Management**: Create, edit, and delete products
- 📋 **Order Management**: View and update order statuses
- 👥 **User Management**: View all users and their roles

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Icons**: Heroicons
- **Authentication**: NextAuth.js
- **State Management**: React Context API

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/lena-luxe-wear.git
cd lena-luxe-wear
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data (50+ products)
npx prisma db seed
```

The seed script will create:

- 4 product categories (Men's Wear, Women's Wear, Kids, Accessories)
- 50+ products with realistic data and images
- Admin user (email: `admin@lena.com`, password: `admin123`)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
lena-luxe-wear/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding script
├── public/
│   └── lena.png               # Logo
├── src/
│   ├── app/
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── api/               # API routes
│   │   ├── cart/              # Shopping cart page
│   │   ├── login/             # Login page
│   │   ├── orders/            # Order history page
│   │   ├── register/          # Registration page
│   │   ├── shop/              # Product listing page
│   │   ├── wishlist/          # Wishlist page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   ├── layout/            # Header, Footer, Providers
│   │   └── products/          # Product components
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Authentication state
│   │   ├── CartContext.tsx    # Shopping cart state
│   │   ├── LanguageContext.tsx # i18n translations
│   │   └── ThemeContext.tsx   # Dark mode state
│   └── lib/
│       └── prisma.ts          # Prisma client
├── .env                        # Environment variables
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies
└── tailwind.config.ts          # Tailwind CSS configuration
```

## 🔑 Default Credentials

After seeding the database:

**Admin Account:**

- Email: `admin@lena.com`
- Password: `admin123`

## 📖 API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/search?q=<query>&category=<category>&minPrice=<min>&maxPrice=<max>&sort=<sort>` - Search products
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/[id]` - Update product (admin only)
- `DELETE /api/products/[id]` - Delete product (admin only)

### Categories

- `GET /api/categories` - Get all categories

### Reviews

- `GET /api/products/[productId]/reviews` - Get product reviews
- `POST /api/products/[productId]/reviews` - Add review (authenticated)

### Wishlist

- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist?productId=<id>` - Remove from wishlist

### Orders

- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `PATCH /api/orders/[id]` - Update order status (admin only)

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

## 🎨 Features in Detail

### Search & Filter

- **Real-time search**: Debounced search across product names and descriptions
- **Category filter**: Filter by Men's Wear, Women's Wear, Kids, or Accessories
- **Price range**: Set minimum and maximum price filters
- **Sorting**: Sort by newest, price (low to high, high to low), or name (A-Z, Z-A)

### Product Reviews

- Star rating (1-5 stars)
- Optional comment
- Display average rating
- View all reviews with user info

### Wishlist

- Save products for later
- Quick add/remove from product cards
- Dedicated wishlist page

## 🌐 Internationalization

The app supports:

- **English (en)**: Default language
- **Amharic (am)**: Full translation coverage

Switch languages using the language toggle in the header.

## 🎨 Theming

- **Light Mode**: Clean, modern design
- **Dark Mode**: Easy on the eyes
- Theme persists across sessions
- Smooth transitions

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Developed by [Your Name]

## 🙏 Acknowledgments

- Product images from [Unsplash](https://unsplash.com)
- Icons from [Heroicons](https://heroicons.com)
- Inspiration from modern e-commerce platforms

---

**⭐ If you like this project, please give it a star!**
