import { Schema, model, models } from 'mongoose';
import { ICustomer, IAddress } from '../types/mongoose';


const customerSchema = new Schema<ICustomer>({
  email: {
    type: String
  }
}, {
  timestamps: true
});

customerSchema.index({ user: 1 });

export const Customer = models.Customer || model<ICustomer>('Customer', customerSchema);