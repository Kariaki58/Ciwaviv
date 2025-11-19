'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { Truck, Package, Clock, CheckCircle, HelpCircle, MapPin, Calendar, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';

const trackOrderSchema = z.object({
  orderId: z.string().min(6, 'Order ID must be at least 6 characters.'),
});

const lostIdSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits.').max(6, 'OTP must be 6 digits.'),
});

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
  } | null;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paystackReference?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
  };
  trackingNumber?: string;
  shippingProvider?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const OrderStatusTimeline = ({ status, estimatedDelivery }: { status: string; estimatedDelivery?: string }) => {
  const getStatusInfo = (currentStatus: string) => {
    const statuses = [
      {
        name: 'pending',
        label: 'Order Placed',
        icon: <Clock className="h-4 w-4 sm:h-5 sm:w-5" />,
      },
      {
        name: 'confirmed',
        label: 'Confirmed',
        icon: <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />,
      },
      {
        name: 'processing',
        label: 'Processing',
        icon: <Package className="h-4 w-4 sm:h-5 sm:w-5" />,
      },
      {
        name: 'shipped',
        label: 'Shipped',
        icon: <Truck className="h-4 w-4 sm:h-5 sm:w-5" />,
      },
      {
        name: 'delivered',
        label: 'Delivered',
        icon: <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />,
      }
    ];

    const currentIndex = statuses.findIndex(s => s.name === currentStatus);
    
    return statuses.map((status, index) => ({
      ...status,
      complete: index <= currentIndex,
      current: index === currentIndex,
      date: index === 3 && estimatedDelivery ? 
        `Est. ${format(new Date(estimatedDelivery), 'MMM dd')}` : 
        index === 4 && estimatedDelivery ? 
        `Delivered ${format(new Date(estimatedDelivery), 'MMM dd')}` :
        status.name === 'pending' ? 'Order date' : 'In progress'
    }));
  };

  const statusInfo = getStatusInfo(status);
  const progressPercentage = ((statusInfo.findIndex(s => s.current) + 1) / statusInfo.length) * 100;

  return (
    <div className="w-full my-4 sm:my-6">
      {/* Mobile: Vertical Timeline */}
      <div className="block sm:hidden">
        <div className="flex flex-col space-y-6 relative">
          {/* Vertical Line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-muted" style={{ zIndex: 1 }}>
            <div
              className="bg-primary w-0.5 transition-all duration-500"
              style={{ height: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {/* Status Items */}
          {statusInfo.map((status, index) => (
            <div key={status.name} className="flex items-start gap-4 relative z-10">
              {/* Status Icon */}
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors duration-300 flex-shrink-0 ${
                  status.complete 
                    ? status.current 
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1' 
                      : 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {status.icon}
              </div>
              
              {/* Status Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${
                  status.complete ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {status.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {status.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Horizontal Timeline */}
      <div className="hidden sm:block">
        <div className="flex justify-between items-start relative">
          {/* Progress Bar Background */}
          <div className="absolute top-3 left-0 w-full h-1.5 bg-muted" style={{ zIndex: 1 }}>
            <div
              className="bg-primary h-1.5 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {/* Status Items */}
          {statusInfo.map((status, index) => (
            <div key={status.name} className="flex flex-col items-center z-10 relative flex-1 min-w-0">
              {/* Status Icon */}
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  status.complete 
                    ? status.current 
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                      : 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {status.icon}
              </div>
              
              {/* Status Label */}
              <p className={`mt-2 text-sm font-semibold text-center leading-tight ${
                status.complete ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {status.label}
              </p>
              
              {/* Status Date */}
              <p className="text-xs text-muted-foreground text-center leading-tight mt-0.5 px-1">
                {status.date}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function TrackOrderPage() {
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const [autoTracking, setAutoTracking] = useState(false);

  const trackOrderForm = useForm<z.infer<typeof trackOrderSchema>>({
    resolver: zodResolver(trackOrderSchema),
    defaultValues: { orderId: '' },
  });

  const lostIdForm = useForm<z.infer<typeof lostIdSchema>>({
    resolver: zodResolver(lostIdSchema),
    defaultValues: { email: '' },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  // Auto-populate and track order when orderId is in URL
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      // Set the order ID in the form
      trackOrderForm.setValue('orderId', orderId);
      setAutoTracking(true);
      
      // Automatically submit the form to track the order
      setTimeout(() => {
        handleAutoTrackOrder(orderId);
      }, 500);
    }
  }, [searchParams]);

  const handleAutoTrackOrder = async (orderId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/track-order?orderId=${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Order not found');
      }

      setFoundOrder(data.order);
      toast({
        title: 'Order Found',
        description: `Tracking order ${data.order.orderNumber}`,
      });
    } catch (error: any) {
      setFoundOrder(null);
      toast({
        variant: 'destructive',
        title: 'Order Not Found',
        description: error.message,
      });
    } finally {
      setLoading(false);
      setAutoTracking(false);
    }
  };

  async function onTrackOrderSubmit(values: z.infer<typeof trackOrderSchema>) {
    setLoading(true);
    try {
      const response = await fetch(`/api/track-order?orderId=${values.orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Order not found');
      }

      setFoundOrder(data.order);
      toast({
        title: 'Order Found',
        description: `Tracking order ${data.order.orderNumber}`,
      });
    } catch (error: any) {
      setFoundOrder(null);
      toast({
        variant: 'destructive',
        title: 'Order Not Found',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function onLostIdSubmit(values: z.infer<typeof lostIdSchema>) {
    try {
      const response = await fetch('/api/recover-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      toast({
        title: 'OTP Sent',
        description: `An OTP has been sent to ${values.email}.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send OTP',
        description: error.message,
      });
    }
  }

  async function onOtpSubmit(values: z.infer<typeof otpSchema>) {
    try {
      const response = await fetch('/api/recover-order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: lostIdForm.getValues('email'),
          otp: values.otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      toast({
        title: 'Order Verified',
        description: `We've found ${data.orders.length} order(s) associated with your email.`,
      });

      // ✅ If only one order found — auto track it immediately
      if (data.orders.length === 1) {
        const orderNumber = data.orders[0].orderNumber;
        trackOrderForm.setValue('orderId', orderNumber);
        await onTrackOrderSubmit({ orderId: orderNumber });
      } 
      // ✅ If multiple orders found — show a dialog or selector
      else if (data.orders.length > 1) {
        // Example: let the user choose one
        const latestOrder = data.orders[0].orderNumber;
        trackOrderForm.setValue('orderId', latestOrder);
        await onTrackOrderSubmit({ orderId: latestOrder });

        toast({
          title: 'Multiple Orders Found',
          description: 'Showing your most recent order.',
        });
      }

      otpForm.reset();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Recovery Failed',
        description: error.message,
      });
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <Package className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-primary" />
        <h1 className="mt-4 sm:mt-6 text-2xl sm:text-4xl md:text-5xl font-headline font-bold">Track Your Order</h1>
        <p className="mt-2 sm:mt-4 text-sm sm:text-lg text-muted-foreground">
          Enter your order ID below to check the current status of your shipment.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto mt-8 sm:mt-12 ">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Enter Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...trackOrderForm}>
            <form onSubmit={trackOrderForm.handleSubmit(onTrackOrderSubmit)} className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
              <FormField
                control={trackOrderForm.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="text-sm sm:text-base">Order ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., ORD-123456789" 
                        className="text-sm sm:text-base"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 sm:mt-0"
                disabled={loading}
                size="sm"
              >
                {loading ? 'Tracking...' : 'Track Order'}
              </Button>
            </form>
          </Form>
          
          {/* Show loading state when auto-tracking */}
          {autoTracking && loading && (
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Package className="h-4 w-4 animate-pulse" />
                <span>Automatically tracking order: <strong>{searchParams.get('orderId')}</strong></span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {foundOrder && (
        <div className="max-w-4xl mx-auto mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          {/* Order Status Card */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Order #{foundOrder.orderNumber}</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Placed on {format(new Date(foundOrder.createdAt), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(foundOrder.status)} self-start`}>
                  {foundOrder.status.charAt(0).toUpperCase() + foundOrder.status.slice(1)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <OrderStatusTimeline 
                status={foundOrder.status} 
                estimatedDelivery={foundOrder.estimatedDelivery}
              />
            </CardContent>
          </Card>

          {/* Shipping Information Card */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base">Shipping Address</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                        {foundOrder.shippingAddress.street}<br />
                        {foundOrder.shippingAddress.city}, {foundOrder.shippingAddress.state}<br />
                        {foundOrder.shippingAddress.country}
                        {foundOrder.shippingAddress.zipCode && `, ${foundOrder.shippingAddress.zipCode}`}
                      </p>
                    </div>
                  </div>
                  {foundOrder.orderNumber && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Package className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base">Tracking Number</h4>
                        <p className="text-xs sm:text-sm font-mono text-gray-800 mt-1 break-all">
                          {foundOrder.orderNumber}
                        </p>
                        {foundOrder.shippingProvider && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Carrier: {foundOrder.shippingProvider}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {foundOrder.estimatedDelivery ? (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">Estimated Delivery</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {format(new Date(foundOrder.estimatedDelivery), 'EEEE, MMMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">Estimated Delivery</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Will be updated soon
                        </p>
                      </div>
                    </div>
                  )}

                  {foundOrder.notes && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">Order Notes</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {foundOrder.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Card */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <div className="space-y-3 sm:space-y-4">
                {foundOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3 sm:pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                      <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-md overflow-hidden flex-shrink-0">
                        <Image 
                          src={item.productImage} 
                          alt={item.productName}
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base truncate">{item.productName}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' • '}
                          {item.color && `Color: ${item.color}`}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2 sm:ml-4">
                      <div className="font-medium text-sm sm:text-base">{formatPrice(item.price)}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Total: {formatPrice(item.subtotal)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-4 sm:mt-6 space-y-1 sm:space-y-2 border-t pt-3 sm:pt-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Subtotal:</span>
                  <span>{formatPrice(foundOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Shipping:</span>
                  <span>{formatPrice(foundOrder.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Tax:</span>
                  <span>{formatPrice(foundOrder.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2 sm:pt-2 mt-2 sm:mt-0">
                  <span>Total:</span>
                  <span>{formatPrice(foundOrder.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lost Order ID Section */}
      <Card className="max-w-3xl mx-auto mt-6 sm:mt-8">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm sm:text-base">Lost your Order ID?</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Enter your email to recover your order details.
                </p>
              </div>
            </div>
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Recover ID
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-sm sm:max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg sm:text-xl">Recover Your Order ID</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm sm:text-base">
                    Enter the email address you used to place the order. We'll send you an OTP to verify your identity.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Form {...lostIdForm}>
                  <form onSubmit={lostIdForm.handleSubmit(onLostIdSubmit)} className="space-y-4">
                    <FormField
                      control={lostIdForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="you@example.com" 
                              className="text-sm sm:text-base"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                      <AlertDialogCancel className="mt-0 text-sm sm:text-base">Cancel</AlertDialogCancel>
                      <Button type="submit" size="sm" className="text-sm sm:text-base">
                        Send OTP
                      </Button>
                    </AlertDialogFooter>
                  </form>
                </Form>
                <div className="mt-4 pt-4 border-t">
                  <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                      <FormField
                        control={otpForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm sm:text-base">Enter OTP</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="123456" 
                                className="text-sm sm:text-base text-center font-mono"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full text-sm sm:text-base">
                        Verify & Recover
                      </Button>
                    </form>
                  </Form>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}