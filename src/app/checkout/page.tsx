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
import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const formSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  cardName: z.string().min(1, 'Name on card is required'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry date (MM/YY)'),
  cvc: z.string().regex(/^\d{3,4}$/, 'Invalid CVC'),
});

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    },
  });

  useEffect(() => {
    if (items.length === 0) {
      router.push('/shop');
    }
  }, [items, router]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Checkout values:', values);
    toast({
      title: 'Order Placed!',
      description: 'Thank you for your purchase. A confirmation has been sent to your email.',
    });
    clearCart();
    router.push('/');
  }

  if (items.length === 0) {
    return null; // Or a loading/redirecting state
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <h1 className="text-3xl md:text-4xl font-headline font-bold mb-8 text-center">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Shipping & Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Shipping Address</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid sm:grid-cols-3 gap-4">
                      <FormField control={form.control} name="city" render={({ field }) => (<FormItem className="sm:col-span-1"><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="country" render={({ field }) => (<FormItem className="sm:col-span-1"><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="postalCode" render={({ field }) => (<FormItem className="sm:col-span-1"><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Details (Mock)</h3>
                    <FormField control={form.control} name="cardName" render={({ field }) => (<FormItem><FormLabel>Name on Card</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="cardNumber" render={({ field }) => (<FormItem><FormLabel>Card Number</FormLabel><FormControl><Input placeholder="0000 0000 0000 0000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="expiryDate" render={({ field }) => (<FormItem><FormLabel>Expiry (MM/YY)</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="cvc" render={({ field }) => (<FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Pay ${total.toFixed(2)}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="row-start-1 lg:row-start-auto">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {items.map(item => (
                  <li key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden mr-4">
                        <Image src={item.image} alt={item.name} fill className="object-cover" data-ai-hint="product photo" />
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {item.quantity}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.size} / {item.color}</p>
                      </div>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </li>
                ))}
              </ul>
              <Separator className="my-6" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
