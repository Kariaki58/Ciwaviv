import { Schema, model } from 'mongoose';
import { ICustomer, IAddress } from '../types/mongoose';

const addressSchema = new Schema<IAddress>({
  type: { 
    type: String, 
    enum: ['billing', 'shipping'],
    required: true 
  },
  street: { 
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  state: { 
    type: String, 
    required: true 
  },
  country: { 
    type: String, 
    required: true 
  },
  zipCode: { 
    type: String, 
    required: true 
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  }
});

const customerSchema = new Schema<ICustomer>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true 
  },
  phone: { 
    type: String 
  },
  dateOfBirth: { 
    type: Date 
  },
  addresses: [addressSchema],
  preferences: {
    newsletter: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: true },
    sizePreference: String,
    categoryPreferences: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Category' 
    }]
  },
  loyaltyPoints: { 
    type: Number, 
    default: 0 
  },
  totalOrders: { 
    type: Number, 
    default: 0 
  },
  totalSpent: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

customerSchema.index({ user: 1 });

export const Customer = model<ICustomer>('Customer', customerSchema);