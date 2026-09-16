# NIRAV COUTURE — Luxury Men's Oversized T-Shirts

A production-ready luxury e-commerce web platform engineered for **NIRAV COUTURE**, specialized exclusively in premium heavyweight and oversized Men's T-Shirts.

Built with **Next.js 14 App Router**, React 18, and custom Dark Luxury Silk & Champagne Gold styling.

---

## ✨ Features

- **Luxury Silk & Onyx Aesthetic**: Handcrafted minimalist dark aesthetic with custom typography (*Playfair Display* & *Inter*).
- **Dual-Hover T-Shirt Previews**: Interactive front-and-back model view on product card hover.
- **Dynamic Catalog & Filtering**: Real-time filtering by size (S to XXL), color shades, and price sort.
- **Pincode Delivery & COD Checker**: Live serviceability check with instant delivery estimates.
- **Find My Fit Size Calculator**: Interactive height & weight calculator recommending ideal oversized fit.
- **Customer Reviews & Ratings**: 5-star rating breakdown, verified buyer reviews, and submission modal.
- **Interactive Live Map Tracking (`/track-order`)**: Real-time delivery vehicle route visualization, driver details, and contact options.
- **Role-Based Admin Portal (`/admin`)**:
  - Secure `AdminGuard` role protection.
  - KPI metric cards (Revenue, Orders, AOV).
  - One-click **Orders CSV / Excel Export**.
  - Product catalog management.
- **Clean Checkout Flow**: Simple shipping address entry, flexible payment modes (COD, Pay on Delivery), instant order receipt, and WhatsApp sharing.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.17.0 or higher recommended)
- npm or yarn

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/nirav-couture.git
cd nirav-couture
npm install
```

### 3. Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Building for Production
```bash
npm run build
npm run start
```

---

## 📁 Project Architecture

```text
├── app/
│   ├── account/          # Customer account dashboard & history
│   ├── admin/            # Protected Admin panel (Dashboard, Orders, Products, Team)
│   ├── api/              # Backend REST API routes (orders, products, auth)
│   ├── cart/             # Shopping bag & 2-step direct checkout
│   ├── login/            # User authentication & social login
│   ├── products/         # Product catalog & dynamic [slug] detail pages
│   ├── register/         # Customer registration
│   ├── track-order/      # Live map order tracking
│   └── wishlist/         # Customer wishlist
├── components/           # Reusable UI components (Navbar, Footer, AdminGuard, SupportDrawer, etc.)
├── lib/                  # State contexts, auth logic, and database layer
└── styles/               # Global CSS design tokens and layout styling
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed for **Nirav Prajapati**.
