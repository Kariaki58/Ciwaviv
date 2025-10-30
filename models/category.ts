import { Schema, model, models } from 'mongoose';
import { ICategory } from '../types/mongoose';

const categorySchema = new Schema<ICategory>({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  slug: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true
  },
  description: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
}, {
  timestamps: true
});

categorySchema.index({ slug: 1 });

export const Category = models.Category || model<ICategory>('Category', categorySchema);