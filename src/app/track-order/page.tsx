
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
import { useState } from 'react';
import { Truck, Package, Clock, CheckCircle, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { products } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const trackOrderSchema = z.object({
  orderId: z.string().min(6, 'Order ID must be at least 6 characters.'),
});

const lostIdSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

const otpSchema = z.object({
    otp: z.string().min(6, 'OTP must be 6 digits.').max(6, 'OTP must be 6 digits.'),
})

type OrderStatus = 'Processing' | 'Shipped' | 'Delivered';

const mockOrder = {
  id: '123456',
  status: 'Shipped' as OrderStatus,
  estimatedDelivery: 'June 28, 2024',
  items: [
    { ...products[0], quantity: 1, size: 'L', color: 'Black' },
    { ...products[2], quantity: 1, size: 'M', color: 'White' },
  ],
  total: 45000.00,
  shippingAddress: '123 Active Way, Lagos, 100212, Nigeria',
};

const OrderStatusTimeline = ({ status }: { status: OrderStatus }) => {
  const statuses = [
    {
      name: 'Processing',
      icon: <Clock className="h-6 w-6" />,
      complete: ['Processing', 'Shipped', 'Delivered'].includes(status),
      date: 'June 24, 2024',
    },
    {
      name: 'Shipped',
      icon: <Truck className="h-6 w-6" />,
      complete: ['Shipped', 'Delivered'].includes(status),
      date: 'June 25, 2024',
    },
    {
      name: 'Delivered',
      icon: <CheckCircle className="h-6 w-6" />,
      complete: ['Delivered'].includes(status),
      date: 'Est. June 28, 2024',
    },
  ];

  const statusIndex = statuses.findIndex(s => s.name === status);
  const progressPercentage = statusIndex === 0 ? 25 : statusIndex === 1 ? 75 : 100;

  return (
    <div className="w-full my-8">
      <div className="flex justify-between items-center relative">
        <div
          className="absolute top-6 left-0 w-full h-1 bg-muted"
          style={{ zIndex: 1 }}
        >
          <div
            className="bg-primary h-1 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        {statuses.map((s, index) => (
          <div key={s.name} className="flex flex-col items-center z-10 relative">
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                s.complete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {s.icon}
            </div>
            <p
              className={`mt-2 text-sm font-semibold text-center ${
                s.complete ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {s.name}
            </p>
            <p className="text-xs text-muted-foreground">{s.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function TrackOrderPage() {
  const [foundOrder, setFoundOrder] = useState<typeof mockOrder | null>(null);
  const { toast } = useToast();

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

  function onTrackOrderSubmit(values: z.infer<typeof trackOrderSchema>) {
    console.log('Searching for order:', values.orderId);
    if (values.orderId === mockOrder.id) {
      setFoundOrder(mockOrder);
    } else {
      setFoundOrder(null);
      toast({
        variant: 'destructive',
        title: 'Order Not Found',
        description: "We couldn't find an order with that ID. Please check the ID and try again.",
      });
    }
  }

  function onLostIdSubmit(values: z.infer<typeof lostIdSchema>) {
    console.log('OTP requested for email:', values.email);
    // This would trigger sending an OTP in a real app
    toast({
        title: 'OTP Sent',
        description: `An OTP has been sent to ${values.email}.`,
    })
  }

  function onOtpSubmit(values: z.infer<typeof otpSchema>) {
    console.log('OTP submitted:', values.otp);
    // This would verify the OTP and retrieve order IDs
    toast({
        title: 'Order ID(s) Recovered',
        description: `We've sent your order IDs to your email. The mock order ID is ${mockOrder.id}`,
    })
    otpForm.reset();
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <Package className="mx-auto h-16 w-16 text-primary" />
        <h1 className="mt-6 text-4xl md:text-5xl font-headline font-bold">Track Your Order</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Enter your order ID below to check the current status of your shipment.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto mt-12">
        <CardHeader>
          <CardTitle>Enter Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...trackOrderForm}>
            <form onSubmit={trackOrderForm.handleSubmit(onTrackOrderSubmit)} className="flex items-end gap-4">
              <FormField
                control={trackOrderForm.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Order ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Track Order
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {foundOrder && (
        <Card className="max-w-3xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Order Status for #{foundOrder.id}</CardTitle>
            <p className="text-muted-foreground">
              Current status: <span className="font-bold text-primary">{foundOrder.status}</span>
            </p>
          </CardHeader>
          <CardContent>
            <OrderStatusTimeline status={foundOrder.status} />
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="font-semibold text-lg mb-4">Items in Shipment</h3>
                    <ul className="space-y-4">
                        {foundOrder.items.map(item => (
                            <li key={item.id} className="flex items-center gap-4">
                                <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                                <Image src={item.images[0].src} alt={item.name} fill className="object-cover" />
                                </div>
                                <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {item.size} / {item.color}
                                </p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-medium ml-auto">{formatPrice(item.price * item.quantity)}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-4">Shipping Details</h3>
                    <p className="text-muted-foreground">
                        {foundOrder.shippingAddress}
                    </p>
                    <h3 className="font-semibold text-lg mb-4 mt-6">Order Summary</h3>
                    <div className="space-y-2 text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatPrice(foundOrder.total)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>Free</span>
                        </div>
                        <div className="flex justify-between font-bold text-foreground text-lg mt-2 pt-2 border-t">
                            <span>Total:</span>
                            <span>{formatPrice(foundOrder.total)}</span>
                        </div>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="max-w-3xl mx-auto mt-8">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Lost your Order ID?</h3>
              <p className="text-sm text-muted-foreground">
                Enter your email to recover your order details.
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Recover ID</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Recover Your Order ID</AlertDialogTitle>
                <AlertDialogDescription>
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button type="submit">Send OTP</Button>
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
                                <FormLabel>Enter OTP</FormLabel>
                                <FormControl>
                                <Input placeholder="123456" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">Verify & Recover</Button>
                    </form>
                </Form>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}


    