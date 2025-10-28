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
  user: Types.ObjectId;
  phone?: string;
  dateOfBirth?: Date;
  addresses: IAddress[];
  preferences: {
    newsletter: boolean;
    marketingEmails: boolean;
    sizePreference?: string;
    categoryPreferences: Types.ObjectId[];
  };
  loyaltyPoints: number;
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

export interface IOrderItem extends Document {
  product: Types.ObjectId;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  subtotal: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  shippingProvider?: string;
  estimatedDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}