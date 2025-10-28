import { Schema, model } from 'mongoose';
import { IUser } from '../types/mongoose';

const userSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['seller', 'customer'],
    default: 'customer'
  },
  companyName: { 
    type: String,
    trim: true
  },
  phone: { 
    type: String 
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  businessInfo: {
    taxId: String,
    businessType: String
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  avatar: { 
    type: String 
  },
  lastLogin: { 
    type: Date 
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export const User = model<IUser>('User', userSchema);