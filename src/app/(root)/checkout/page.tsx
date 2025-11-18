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
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Country, State, City } from 'country-state-city';

const formSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  zipCode: z.string().optional(),
});

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  
  // Location states
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: 'Nigeria',
      zipCode: '',
    },
  });

  // Load countries on mount
  useEffect(() => {
    const countryData = Country.getAllCountries();
    setCountries(countryData);
  }, []);

  // Watch for country changes to load states
  const watchCountry = form.watch('country');
  useEffect(() => {
    if (watchCountry) {
      const countryObj = countries.find(c => c.name === watchCountry);
      if (countryObj) {
        const stateData = State.getStatesOfCountry(countryObj.isoCode);
        setStates(stateData);
        // Reset state and city when country changes
        form.setValue('state', '');
        form.setValue('city', '');
        setCities([]);
      }
    }
  }, [watchCountry, countries, form]);

  // Watch for state changes to load cities and calculate shipping
  const watchState = form.watch('state');
  const watchCity = form.watch('city');
  useEffect(() => {
    if (watchState && watchCountry) {
      const countryObj = countries.find(c => c.name === watchCountry);
      const stateObj = states.find(s => s.name === watchState);
      if (countryObj && stateObj) {
        const cityData = City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode);
        setCities(cityData);
      }
    }
  }, [watchState, watchCountry, countries, states]);

  // Calculate shipping when location changes
  useEffect(() => {
    const calculateShipping = async () => {
      const country = form.getValues('country');
      const state = form.getValues('state');
      const city = form.getValues('city');

      if (country && state && city) {
        setIsCalculatingShipping(true);
        try {
          const response = await fetch('/api/shipping/calculate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              country,
              state,
              city
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setShippingFee(data.shippingFee || 0);
          } else {
            setShippingFee(0);
          }
        } catch (error) {
          console.error('Error calculating shipping:', error);
          setShippingFee(0);
        } finally {
          setIsCalculatingShipping(false);
        }
      }
    };

    calculateShipping();
  }, [watchCountry, watchState, watchCity, form]);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/shop');
    }
  }, [items, router]);

  const grandTotal = total + shippingFee;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsProcessing(true);
    
    try {
      // Prepare checkout data
      const checkoutData = {
        customer: {
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
        },
        shippingAddress: {
          street: values.address,
          city: values.city,
          state: values.state,
          country: values.country,
          zipCode: values.zipCode,
        },
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          productImage: item.image,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
        })),
        subtotal: total,
        shippingFee: shippingFee,
        totalAmount: grandTotal,
      };

      // Call checkout API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process checkout');
      }

      // Redirect to Paystack
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        throw new Error('No payment URL received');
      }

    } catch (error: any) {
      toast({
        title: 'Checkout Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <h1 className="text-3xl md:text-4xl font-headline font-bold mb-8 text-center">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="08012345678" {...field} />
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
                    <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="Street address" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    
                    {/* Country Select */}
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                              <option value="">Select Country</option>
                              {countries.map(country => (
                                <option key={country.isoCode} value={country.name}>
                                  {country.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* State Select */}
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              disabled={!watchCountry}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                            >
                              <option value="">Select State</option>
                              {states.map(state => (
                                <option key={state.isoCode} value={state.name}>
                                  {state.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* City Select */}
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              disabled={!watchState}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                            >
                              <option value="">Select City</option>
                              {cities.map(city => (
                                <option key={city.name} value={city.name}>
                                  {city.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField control={form.control} name="zipCode" render={({ field }) => (<FormItem><FormLabel>ZIP/Postal Code (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isProcessing || isCalculatingShipping || !watchCity}
                  >
                    {isProcessing ? 'Processing...' : `Pay with Paystack - ${formatPrice(grandTotal)}`}
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
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {item.quantity}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.size} / {item.color}</p>
                      </div>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>
              <Separator className="my-6" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {isCalculatingShipping ? (
                      'Calculating...'
                    ) : shippingFee > 0 ? (
                      formatPrice(shippingFee)
                    ) : watchCity ? (
                      'calculated in next step'
                    ) : (
                      'Select location'
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>
                    {isCalculatingShipping ? 'Calculating...' : formatPrice(grandTotal)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}