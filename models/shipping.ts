import { Schema, model, models } from 'mongoose';

const shippingSchema = new Schema({
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['specific', 'flat', 'state'], default: 'specific' }
}, {
  timestamps: true
});

// Add index for faster lookups
shippingSchema.index({ country: 1, state: 1, city: 1 });
shippingSchema.index({ type: 1 });

export const Shipping = models.Shipping || model('Shipping', shippingSchema);