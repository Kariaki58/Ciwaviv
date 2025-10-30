import { Schema, model, models } from 'mongoose';

const otpSchema = new Schema({
  email: { type: String, required: true, lowercase: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, {
  timestamps: true,
});

// Optional: auto-delete expired OTPs using TTL index
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = models.Otp || model('Otp', otpSchema);
