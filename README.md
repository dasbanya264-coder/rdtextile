# 🌸 Ripan Saree Center (R.D Textile)

> **Authentic Handloom Saree Boutique & E-Commerce Progressive Web App (PWA)**  
> শান্তিপুর, পশ্চিমবঙ্গ থেকে খাঁটি তসর, জামদানি ও সিল্ক শাড়ির নির্ভরযোগ্য প্রতিষ্ঠান।

---

## 🌟 Features (মূল সুবিধাসমূহ)

- **Curated Handloom Collections:** তসর শাড়ি (Tasar), জামদানি শাড়ি (Jamdani), এবং পিওর সিল্ক শাড়ি (Pure Silk)।
- **📲 Progressive Web App (PWA) & Mobile Download:**
  - সরাসরি ব্রাউজার থেকেই যেকোনো গ্রাহক ফোনে অ্যাপটি ডাউনলোড ও ইনস্টল করতে পারবেন (Android ও iOS)।
  - কোনো প্লে-স্টোর ছাড়াই ইনস্টল হয়ে সরাসরি ফোনের হোম স্ক্রিনে অ্যাপ আইকন তৈরি হয়।
- **📱 100% Full-Screen Experience (মোবাইল ফুল স্ক্রিন মোড):**
  - ইনস্টল করা অ্যাপ ব্রাউজার বার ছাড়াই ফুল স্ক্রিন অ্যাপ আকারে চালু হয়।
  - ব্রাউজারে থাকা অবস্থায়ও এক ক্লিকে "Full Screen" টগল করার সুবিধা।
- **Interactive Shopping & Video Previews:** শাড়ির হাই-রেজোলিউশন ছবি ও রিয়েল ভিডিও রিভিউ দেখার সুবিধা।
- **Cart & Direct Checkout:** সহজে কার্টে শাড়ি যোগ, ক্যাশ অন ডেলিভারি (COD) এবং PhonePe / Google Pay / UPI পেমেন্ট কিউআর কোড।
- **WhatsApp Direct Order:** এক ক্লিকে সরাসরি হোয়াটসঅ্যাপে প্রোডাক্টের বিস্তারিতসহ অর্ডার পাঠানোর সুবিধা।
- **Admin Dashboard:** প্রোডাক্ট যুক্ত করা, স্টক আপডেট, ব্যানার ও অর্ডার ম্যানেজমেন্ট।
- **Real-Time Database:** Google Firebase Cloud Firestore ও Authentication দ্বারা সুরক্ষিত।

---

## 🚀 How to Upload to GitHub (গিটহাবে আপলোড করার নিয়ম)

আপনি যদি এই প্রজেক্টটি আপনার নিজের GitHub একাউন্টে আপলোড করতে চান, নিচের ধাপগুলো অনুসরণ করুন:

### ধাপ ১: গিটহাবে একটি নতুন রিপোজিটরি তৈরি করুন
1. [GitHub](https://github.com) এ লগইন করে **New Repository** তৈরি করুন (যেমন: `ripan-saree-center`)।
2. রিপোজিটরিটি `Public` বা `Private` নির্বাচন করুন (README যুক্ত করার দরকার নেই)।

### ধাপ ২: টার্মিনালে নিচের কমান্ডগুলো চালান
```bash
# ১. গিট ইনিশিয়ালাইজ করুন (যদি পূর্বে না করা থাকে)
git init

# ২. সব ফাইল যুক্ত করুন
git add .

# ৩. প্রথম কমিট সম্পন্ন করুন
git commit -m "feat: complete Ripan Saree Center PWA with full-screen and download features"

# ৪. মেইন ব্রাঞ্চ নির্ধারণ করুন
git branch -M main

# ৫. আপনার গিটহাব রিপোজিটরির লিংক যুক্ত করুন (YOUR_USERNAME ও REPO_NAME পরিবর্তন করুন)
git remote add origin https://github.com/YOUR_USERNAME/ripan-saree-center.git

# ৬. কোড গিটহাবে পুশ করুন
git push -u origin main
```

---

## 💻 Local Setup & Development (নিজের কম্পিউটারে চালানোর নিয়ম)

### ১. ক্লোন করুন
```bash
git clone https://github.com/YOUR_USERNAME/ripan-saree-center.git
cd ripan-saree-center
```

### ২. প্যাকেজ ইনস্টল করুন
```bash
npm install
```

### ৩. কনফিগারেশন
`firebase-applet-config.example.json` ফাইলটির একটি কপি করে `firebase-applet-config.json` তৈরি করুন এবং আপনার ফায়ারবেস ক্রেডেনশিয়াল বসান।

### ৪. ডেভেলপমেন্ট সার্ভার চালু করুন
```bash
npm run dev
```
ব্রাউজারে খুলুন: `http://localhost:3000`

### ৫. প্রোডাকশন বিল্ড তৈরি
```bash
npm run build
```

---

## 📲 How Customers Can Download the App (গ্রাহকরা যেভাবে অ্যাপ ডাউনলোড করবেন)

### অ্যান্ড্রয়েড (Android):
1. ওয়েবসাইটটি ওপেন করলে উপরে ও নিচে **"ডাউনলোড / Install App"** বাটন দেখা যাবে।
2. সেখানে ক্লিক করলেই **"Install"** কনফার্মেশন প্রম্পট আসবে।
3. ক্লিক করলেই অ্যাপটি সরাসরি ফোনে ইনস্টল হয়ে যাবে এবং অন্য যেকোনো মোবাইল অ্যাপের মতো ফুল স্ক্রিনে চলবে।

### আইফোন (iPhone / iOS):
1. Safari ব্রাউজারে সাইটটি ওপেন করুন।
2. নিচের **Share** আইকনে চাপ দিন।
3. তালিকায় গিয়ে **"Add to Home Screen"** এ ক্লিক করুন।

---

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide Icons
- **Database & Backend:** Firebase Cloud Firestore & Auth
- **PWA:** vite-plugin-pwa, Web App Manifest, Service Workers

---

## 📍 Contact & Address

- **প্রতিষ্ঠান:** Ripan Saree Center (R.D Textile)
- **ঠিকানা:** 234, Soumendra Nath Thakur Rd, Santipur, West Bengal – 741404
- **ফোন / হোয়াটসঅ্যাপ:** +91 9064300941
