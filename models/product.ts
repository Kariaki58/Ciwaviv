import { Schema, model, models } from 'mongoose';
import { IProduct, IImage } from '../types/mongoose';

const imageSchema = new Schema<IImage>({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  aiHint: { type: String }
});

const productSchema = new Schema<IProduct>({
  name: {
    type: String, 
    required: true,
    trim: true
  },
  slug: {
    type: String, 
    required: true,
    unique: true,
    lowercase: true
  },
  sold: {
    type: Number
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  images: [imageSchema],
  category: { 
    type: Schema.Types.ObjectId, 
    ref: 'Category',
    required: true 
  },
  sizes: [{ 
    type: String 
  }],
  colors: [{ 
    type: String 
  }],
  inventory: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5 
  },
  reviewCount: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ seller: 1 });

export const Product = models.Product || model("Product", productSchema);
