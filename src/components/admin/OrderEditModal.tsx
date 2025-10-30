'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface OrderEditModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (order: any) => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' }
];

const paymentStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' }
];

export default function OrderEditModal({ order, isOpen, onClose, onUpdate }: OrderEditModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [formData, setFormData] = useState({
    status: order?.status || '',
    paymentStatus: order?.paymentStatus || '',
    trackingNumber: order?.trackingNumber || '',
    shippingProvider: order?.shippingProvider || '',
    estimatedDelivery: order?.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : '',
    notes: order?.notes || ''
  });

  if (!isOpen || !order) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate processing status - requires estimated delivery date
    if (formData.status === 'processing' && !formData.estimatedDelivery) {
      newErrors.estimatedDelivery = 'Estimated delivery date is required when status is set to Processing';
    }

    // Validate shipped status - requires shipping provider and notes
    if (formData.status === 'shipped') {
      if (!formData.shippingProvider) {
        newErrors.shippingProvider = 'Shipping provider is required when status is set to Shipped';
      }
      if (!formData.notes.trim()) {
        newErrors.notes = 'Notes are required when status is set to Shipped (e.g., tracking info, shipping details)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before updating the order.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setErrors({}); // Clear errors when submitting

    try {
      const updates: any = {};
      
      if (formData.status !== order.status) updates.status = formData.status;
      if (formData.paymentStatus !== order.paymentStatus) updates.paymentStatus = formData.paymentStatus;
      if (formData.trackingNumber !== order.trackingNumber) updates.trackingNumber = formData.trackingNumber;
      if (formData.shippingProvider !== order.shippingProvider) updates.shippingProvider = formData.shippingProvider;
      if (formData.estimatedDelivery !== (order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : '')) {
        updates.estimatedDelivery = formData.estimatedDelivery ? new Date(formData.estimatedDelivery) : null;
      }
      if (formData.notes !== order.notes) updates.notes = formData.notes;

      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          updates
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order');
      }

      onUpdate(data.order);
      onClose();
      
      toast({
        title: 'Order Updated',
        description: 'Order has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for the field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleStatusChange = (value: string) => {
    handleInputChange('status', value);
    
    // Auto-clear related errors when status changes
    if (value !== 'processing' && errors.estimatedDelivery) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.estimatedDelivery;
        return newErrors;
      });
    }
    
    if (value !== 'shipped') {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.shippingProvider;
        delete newErrors.notes;
        return newErrors;
      });
    }
  };

  // Helper function to show requirement hints
  const getStatusRequirements = () => {
    if (formData.status === 'processing') {
      return "💡 Required: Set an estimated delivery date when status is 'Processing'";
    }
    if (formData.status === 'shipped') {
      return "💡 Required: Shipping provider and notes are required when status is 'Shipped'";
    }
    return null;
  };

  const requirementHint = getStatusRequirements();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Order</h2>
            <Button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              variant="ghost"
            >
              ✕
            </Button>
          </div>

          {/* Requirement Hint */}
          {requirementHint && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">{requirementHint}</p>
            </div>
          )}

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Please fix the following errors:
              </h4>
              <ul className="text-sm text-red-700 list-disc list-inside">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className='bg-gray-700 text-white'>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Order Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none bg-gray-700 focus:ring-2 focus:ring-primary focus:border-primary ${
                      errors.estimatedDelivery || errors.shippingProvider || errors.notes 
                        ? 'border-red-300' 
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="" disabled>
                      Current: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </option>
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {(errors.estimatedDelivery || errors.shippingProvider || errors.notes) && (
                    <p className="text-xs text-red-500 mt-1">
                      This status change requires additional information
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <select
                    id="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                    className="w-full px-3 py-2 border bg-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="" disabled>
                      Current: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </option>
                    {paymentStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trackingNumber">Tracking Number</Label>
                    <Input
                      id="trackingNumber"
                      value={formData.trackingNumber}
                      onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                      placeholder="Enter tracking number"
                      className='bg-gray-700'
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingProvider">
                      Shipping Provider {formData.status === 'shipped' && '*'}
                    </Label>
                    <Input
                      id="shippingProvider"
                      value={formData.shippingProvider}
                      onChange={(e) => handleInputChange('shippingProvider', e.target.value)}
                      placeholder="e.g., GIG, River Joy"
                      className={errors.shippingProvider ? 'border-red-300 bg-gray-700' : 'bg-gray-700'}
                    />
                    {errors.shippingProvider && (
                      <p className="text-xs text-red-500 mt-1">{errors.shippingProvider}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="estimatedDelivery">
                    Estimated Delivery {formData.status === 'processing' && '*'}
                  </Label>
                  <Input
                    id="estimatedDelivery"
                    type="date"
                    value={formData.estimatedDelivery}
                    onChange={(e) => handleInputChange('estimatedDelivery', e.target.value)}
                    className={errors.estimatedDelivery ? 'border-red-300 bg-gray-700' : 'bg-gray-700'}
                  />
                  {errors.estimatedDelivery && (
                    <p className="text-xs text-red-500 mt-1">{errors.estimatedDelivery}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">
                    Notes {formData.status === 'shipped' && '*'}
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder={
                      formData.status === 'shipped' 
                        ? "Required for shipped orders. Include tracking info, shipping details, etc..."
                        : "Add any notes about this order..."
                    }
                    rows={3}
                    className={errors.notes ? 'border-red-300 bg-gray-700' : 'bg-gray-700'}
                  />
                  {errors.notes && (
                    <p className="text-xs text-red-500 mt-1">{errors.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || Object.keys(errors).length > 0}
              >
                {loading ? 'Updating...' : 'Update Order'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}