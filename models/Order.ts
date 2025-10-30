import { Schema, model, models } from 'mongoose';
import { IOrder, IOrderItem, ICustomerInfo, IShippingAddress } from '../types/mongoose';

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

const customerInfoSchema = new Schema<ICustomerInfo>({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true }
});

const shippingAddressSchema = new Schema<IShippingAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true, default: 'Nigeria' },
  zipCode: { type: String }
});

const orderSchema = new Schema<IOrder>({
  orderNumber: { 
    type: String, 
    required: true,
    unique: true 
  },
  customer: {
    type: customerInfoSchema,
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
  paymentMethod: { 
    type: String, 
    default: 'paystack' 
  },
  paystackReference: {
    type: String,
    unique: true,
    sparse: true
  },
  shippingAddress: {
    type: shippingAddressSchema,
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


orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = models.Order || model<IOrder>('Order', orderSchema);