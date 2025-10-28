import { Schema, model } from 'mongoose';
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
  image: { 
    type: String 
  },
  parentCategory: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category',
    default: null 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  sortOrder: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

categorySchema.index({ parentCategory: 1 });
categorySchema.index({ slug: 1 });

export const Category = model<ICategory>('Category', categorySchema);