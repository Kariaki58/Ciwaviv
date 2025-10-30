'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';
import { useState, useEffect } from 'react'; // Add useEffect

interface OrderViewModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors: { [key: string]: string } = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
};

const paymentStatusColors: { [key: string]: string } = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-blue-100 text-blue-800'
};

export default function OrderViewModal({ order, isOpen, onClose }: OrderViewModalProps) {
  const [currentOrder, setCurrentOrder] = useState(order);

  // Sync with the latest order data
  useEffect(() => {
    if (order) {
      setCurrentOrder(order);
    }
  }, [order]);

  if (!isOpen || !currentOrder) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-200">Order Details</h2>
            <Button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              variant="ghost"
            >
              ✕
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Information */}
            <Card className='bg-gray-700 text-white'>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Order Number:</div>
                  <div>{currentOrder.orderNumber}</div>
                  
                  <div className="font-medium">Order Date:</div>
                  <div>{format(new Date(currentOrder.createdAt), 'PPP')}</div>
                  
                  <div className="font-medium">Status:</div>
                  <div>
                    <Badge className={statusColors[currentOrder.status]}>
                      {currentOrder.status.charAt(0).toUpperCase() + currentOrder.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="font-medium">Payment Status:</div>
                  <div>
                    <Badge className={paymentStatusColors[currentOrder.paymentStatus]}>
                      {currentOrder.paymentStatus.charAt(0).toUpperCase() + currentOrder.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                  
                  {currentOrder.paystackReference && (
                    <>
                      <div className="font-medium">Payment Reference:</div>
                      <div className="font-mono text-xs">{currentOrder.paystackReference}</div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className='bg-gray-700 text-white'>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Name:</div>
                  <div>{currentOrder.customer.firstName} {currentOrder.customer.lastName}</div>
                  
                  <div className="font-medium">Email:</div>
                  <div>{currentOrder.customer.email}</div>
                  
                  <div className="font-medium">Phone:</div>
                  <div>{currentOrder.customer.phone}</div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className='bg-gray-700 text-white'>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div>{currentOrder.shippingAddress.street}</div>
                  <div>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}</div>
                  <div>{currentOrder.shippingAddress.country}</div>
                  {currentOrder.shippingAddress.zipCode && (
                    <div>ZIP: {currentOrder.shippingAddress.zipCode}</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="md:col-span-2 bg-gray-700 text-white">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentOrder.items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden">
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-100">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && ' • '}
                            {item.color && `Color: ${item.color}`}
                          </div>
                          <div className="text-sm text-gray-100">Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(item.price)}</div>
                        <div className="text-sm text-gray-100">Total: {formatPrice(item.subtotal)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(currentOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{formatPrice(currentOrder.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatPrice(currentOrder.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatPrice(currentOrder.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}