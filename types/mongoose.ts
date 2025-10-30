import { Document, Types } from 'mongoose';

export interface IImage extends Document {
  src: string;
  alt: string;
  aiHint?: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  sold: number;
  images: IImage[];
  category: Types.ObjectId;
  seller: Types.ObjectId;
  tags: string[];
  sizes: string[];
  colors: string[];
  inventory: number;
  isActive: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'seller' | 'customer';
  companyName?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  businessInfo?: {
    taxId: string;
    businessType: string;
  };
  isVerified: boolean;
  avatar?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: Types.ObjectId;
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddress extends Document {
  type: 'billing' | 'shipping';
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}

export interface ICustomer extends Document {
  name: string;
  email: string
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartItem extends Document {
  product: Types.ObjectId;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
}

export interface ICart extends Document {
  customer: Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  itemCount: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: Types.ObjectId;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  subtotal: number;
}

export interface ICustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: ICustomerInfo;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  paystackReference?: string;
  shippingAddress: IShippingAddress;
  trackingNumber?: string;
  shippingProvider?: string;
  estimatedDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}