# Ripan Saree Center (Ripan Das Textile)

A premium, modern e-commerce web application and Progressive Web App (PWA) for authentic sarees and textiles.

## 🌟 Features

- **Storefront & Catalog:** Browse Silk, Cotton, Party Wear, and Wedding saree collections.
- **Product Details & Video Previews:** High-resolution product images, video showcases, and detailed descriptions.
- **Interactive Cart & Checkout:** Real-time cart management with multiple payment options (Cash on Delivery, PhonePe, UPI, etc.).
- **Mobile-First & PWA Enabled:** Installable on Android and iOS devices directly from the browser with offline caching and native app feel.
- **Voice Guidance Support:** Interactive voice feedback for signing in and creating accounts.
- **Admin Dashboard:** Full inventory management (add/edit products, stock status), order tracking, customer list, and store banner/logo customization.
- **Firebase Authentication & Cloud Firestore:** Secure user authentication and real-time database integration.

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ripan-saree-center.git
cd ripan-saree-center
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the `.env.example` file to create `.env`:
```bash
cp .env.example .env
```
Ensure your Firebase configuration keys are placed in `.env` if necessary.

### 4. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` (or the port specified in terminal).

### 5. Production Build
```bash
npm run build
```
Preview the production build:
```bash
npm run preview
```

---

## 📱 Progressive Web App (PWA) Installation

- **Android (Chrome):** Visit the site, click the circular RD logo banner or tap **"Install App"** when prompted.
- **iOS (Safari):** Tap the **Share** button at the bottom and select **"Add to Home Screen"**.

---

## 🛠 Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide Icons
- **Database & Auth:** Firebase Firestore, Firebase Authentication, Firebase Storage
- **PWA:** Vite PWA Plugin, Service Worker
