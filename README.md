# 🛒 E-Mart — Full-Stack E-Commerce Web Application

A modern, full-featured e-commerce platform built with **React**, **Vite**, and **Supabase**. E-Mart offers a seamless shopping experience with a dynamic product catalog, cart management, secure checkout, order tracking, and a powerful admin dashboard — all backed by a real-time PostgreSQL database with Row Level Security.

---

## 🌟 Features

### 👤 Customer Features
- **User Authentication** — Sign up, log in, and manage your profile securely via Supabase Auth
- **Product Browsing** — Explore products by category with search and filter support
- **Product Details** — View detailed product pages with image galleries and customer reviews
- **Shopping Cart** — Add, remove, and update item quantities in a persistent cart
- **Checkout** — Complete purchases with a shipping address form and atomic order placement
- **Order History** — View all past orders and their current status
- **Reviews** — Leave ratings and comments on purchased products (purchase-verified)

### 🛠️ Admin Features
- **Admin Dashboard** — Full analytics overview with sales charts powered by Recharts
- **Product Management** — Create, edit, activate/deactivate products with image uploads
- **Category Management** — Add and manage product categories
- **Order Management** — View all orders and update their status (pending → processing → shipped → delivered → cancelled)
- **User Management** — View registered customers and manage roles

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite 7 |
| **Routing** | React Router DOM v7 |
| **Styling** | Tailwind CSS v3 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Backend / Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **File Storage** | Supabase Storage |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
E-Mart-E-commerce-Website-/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images & media
│   ├── components/          # Reusable UI components
│   │   ├── BrandTicker.jsx  # Animated brand logo ticker
│   │   ├── Features.jsx     # Features/USP section
│   │   ├── Footer.jsx       # Site footer
│   │   ├── HeroSlider.jsx   # Homepage hero banner slider
│   │   ├── Layout.jsx       # Page layout wrapper (Navbar + Outlet)
│   │   ├── Navbar.jsx       # Navigation bar with cart & auth
│   │   ├── Newsletter.jsx   # Email newsletter subscription
│   │   ├── ProductReviews.jsx # Product review system
│   │   ├── SaleProducts.jsx # Featured/sale products section
│   │   ├── SidePanel.jsx    # Cart/filter side panel
│   │   └── Testimonials.jsx # Customer testimonials
│   ├── context/
│   │   ├── AuthContext.jsx  # Global authentication state
│   │   └── CartContext.jsx  # Global shopping cart state
│   ├── data/                # Static data / seed helpers
│   ├── lib/
│   │   └── supabaseClient.js # Supabase client initialization
│   ├── pages/
│   │   ├── Home.jsx         # Landing page
│   │   ├── Products.jsx     # Product listing page
│   │   ├── ProductDetails.jsx # Single product page
│   │   ├── Categories.jsx   # Category browser
│   │   ├── Cart.jsx         # Shopping cart page
│   │   ├── Checkout.jsx     # Checkout & payment page
│   │   ├── Orders.jsx       # Order history page
│   │   ├── Login.jsx        # Login page
│   │   ├── SignUp.jsx       # Registration page
│   │   └── AdminDashboard.jsx # Admin control panel
│   ├── App.jsx              # Root component & route definitions
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── db_schema.sql            # Full PostgreSQL schema with RLS policies
├── supabase_schema.sql      # Supabase-specific schema helpers
├── .env.example             # Environment variable template
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite configuration
└── vercel.json              # Vercel deployment config
```

---

## 🗄️ Database Schema

The app uses a Supabase-hosted PostgreSQL database with **Row Level Security (RLS)** enabled on all tables.

### Tables

| Table | Description |
|---|---|
| `profiles` | Extended user info (name, avatar, role: `customer` / `admin`) |
| `categories` | Product categories with active/inactive toggle |
| `products` | Products with price, stock, images array, and category FK |
| `orders` | Customer orders with status tracking and shipping address |
| `order_items` | Line items for each order (product, quantity, price at purchase) |
| `reviews` | Product ratings & comments (only for verified purchasers) |

### Key Design Decisions

- **Atomic Order Placement**: Orders are created via the `create_order_with_items()` PostgreSQL function, which locks product rows, validates stock, deducts inventory, and calculates totals in a single transaction — preventing race conditions.
- **Role-based Access**: RLS policies enforce that only `admin`-role users can manage products, categories, and all orders. Customers can only access their own data.
- **Review Verification**: The reviews RLS policy checks that a reviewer actually purchased the product before allowing an insert.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Supabase](https://supabase.com/) account and project

### 1. Clone the Repository

```bash
git clone https://github.com/Hassi711/E-Mart-E-commerce-Website-.git
cd E-Mart-E-commerce-Website-
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> You can find these values in your Supabase project under **Settings → API**.

### 4. Set Up the Database

1. Open the **Supabase SQL Editor** for your project.
2. Copy the contents of `db_schema.sql` and run it in the editor.
3. This will create all tables, indexes, RLS policies, triggers, and stored functions.

### 5. Create a Storage Bucket

In the Supabase dashboard, go to **Storage** and create a public bucket named `products` for product image uploads.

### 6. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔑 Admin Access

To grant admin privileges to a user:

1. Have the user sign up via the app.
2. In the Supabase dashboard, go to **Table Editor → profiles**.
3. Find the user's row and change their `role` from `customer` to `admin`.
4. The user can now access `/admin/dashboard`.

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev Server | `npm run dev` | Start local development server with HMR |
| Build | `npm run build` | Build production bundle |
| Preview | `npm run preview` | Preview the production build locally |
| Lint | `npm run lint` | Run ESLint checks |

---

## ☁️ Deployment

This project is pre-configured for **Vercel** deployment via `vercel.json`.

1. Push the repository to GitHub.
2. Connect the repo to [Vercel](https://vercel.com).
3. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as **Environment Variables** in the Vercel project settings.
4. Deploy — Vercel will handle the rest.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🙌 Author

Built by **[Hassi711](https://github.com/Hassi711)**.  
Feel free to star ⭐ the repository if you find it useful!
