import { Schema, model, models } from 'mongoose';
import { ICart, ICartItem } from '../types/mongoose';

const cartItemSchema = new Schema<ICartItem>({
  product: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1,
    default: 1 
  },
  size: { 
    type: String 
  },
  color: { 
    type: String 
  },
  price: { 
    type: Number, 
    required: true 
  }
});

const cartSchema = new Schema<ICart>({
  customer: { 
    type: Schema.Types.ObjectId, 
    ref: 'Customer',
    required: true,
    unique: true 
  },
  items: [cartItemSchema],
  totalAmount: { 
    type: Number, 
    default: 0 
  },
  itemCount: { 
    type: Number, 
    default: 0 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.itemCount = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.lastUpdated = new Date();
  next();
});

cartSchema.index({ customer: 1 });

export const Cart = models.Cart || model<ICart>('Cart', cartSchema);