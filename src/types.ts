export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn?: string;
  image?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  nameBn?: string;
  sku: string;
  categoryId: string;
  description: string;
  descriptionBn?: string;
  price: number;
  discountPrice?: number;
  fabric: string;
  color: string;
  hasBlousePiece: boolean;
  stockQuantity: number;
  images: string[];
  videos?: string[];
  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  village: string;
  district: string;
  pinCode: string;
  state: string;
  isDefault: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'upi';
  paymentStatus: 'pending' | 'paid' | 'failed';
  transactionId?: string;
  uploadedPhotos?: string[];
  shippingAddress: Address;
  createdAt: string;
}
