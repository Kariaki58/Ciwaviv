import { Schema, model } from 'mongoose';
import { IOrder, IOrderItem } from '../types/mongoose';

const orderItemSchema = new Schema<IOrderItem>({
  product: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  productName: { 
    type: String, 
    required: true 
  },
  productImage: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1 
  },
  price: { 
    type: Number, 
    required: true 
  },
  size: { 
    type: String 
  },
  color: { 
    type: String 
  },
  subtotal: { 
    type: Number, 
    required: true 
  }
});

const orderSchema = new Schema<IOrder>({
  orderNumber: { 
    type: String, 
    required: true,
    unique: true 
  },
  customer: { 
    type: Schema.Types.ObjectId, 
    ref: 'Customer',
    required: true 
  },
  items: [orderItemSchema],
  subtotal: { 
    type: Number, 
    required: true 
  },
  shippingFee: { 
    type: Number, 
    default: 0 
  },
  taxAmount: { 
    type: Number, 
    default: 0 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending' 
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  billingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  paymentMethod: { 
    type: String, 
    required: true 
  },
  trackingNumber: { 
    type: String 
  },
  shippingProvider: { 
    type: String 
  },
  estimatedDelivery: { 
    type: Date 
  },
  notes: { 
    type: String 
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

orderSchema.index({ customer: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = model<IOrder>('Order', orderSchema);