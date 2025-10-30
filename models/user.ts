import { Schema, model, models } from 'mongoose';
import { IUser } from '../types/mongoose';

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
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
    enum: ['admin', 'customer'],
    default: 'customer'
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
}, {
  timestamps: true
});

userSchema.index({ role: 1 });

export const User = models.User || model("User", userSchema);
