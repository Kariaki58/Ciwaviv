
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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Truck, PackageSearch, Clock, CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';

const formSchema = z.object({
  orderId: z.string().min(6, 'Order ID must be at least 6 characters.'),
});

const OrderStatus = ({ status }: { status: string }) => {
    const statuses = [
        { name: 'Processing', icon: <Clock className="h-6 w-6" />, complete: ['Processing', 'Shipped', 'Delivered'].includes(status) },
        { name: 'Shipped', icon: <Truck className="h-6 w-6" />, complete: ['Shipped', 'Delivered'].includes(status) },
        { name: 'Delivered', icon: <CheckCircle className="h-6 w-6" />, complete: ['Delivered'].includes(status) },
    ]

    return (
        <div className="w-full max-w-md mx-auto my-8">
            <div className="flex justify-between items-center relative">
                {statuses.map((s, index) => (
                    <div key={s.name} className="flex flex-col items-center z-10">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${s.complete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                            {s.icon}
                        </div>
                        <p className={`mt-2 text-sm font-semibold ${s.complete ? 'text-foreground' : 'text-muted-foreground'}`}>{s.name}</p>
                    </div>
                ))}
                <div className="absolute top-6 left-0 w-full h-1 bg-muted">
                    <div className="bg-primary h-1" style={{ width: status === 'Processing' ? '25%' : status === 'Shipped' ? '75%' : status === 'Delivered' ? '100%' : '0%' }}></div>
                </div>
            </div>
        </div>
    )
}


export default function TrackOrderPage() {
  const [orderStatus, setOrderStatus] = useState('');
  const [searchedId, setSearchedId] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Searching for order:', values.orderId);
    setSearchedId(values.orderId);
    // Mock order status
    const mockStatuses = ['Processing', 'Shipped', 'Delivered'];
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    setOrderStatus(randomStatus);
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-2xl mx-auto text-center">
        <PackageSearch className="mx-auto h-16 w-16 text-primary" />
        <h1 className="mt-6 text-4xl md:text-5xl font-headline font-bold">Track Your Order</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Enter your order ID below to check the status of your shipment.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader>
          <CardTitle>Enter Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Track Order
              </Button>
            </form>
          </Form>

          {orderStatus && (
            <div className="mt-12 text-center">
              <h2 className="text-2xl font-bold">Order Status for #{searchedId}</h2>
              <p className="text-lg font-medium text-primary mt-2">{orderStatus}</p>
              <OrderStatus status={orderStatus} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
