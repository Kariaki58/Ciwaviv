
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Instagram, Twitter, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Contact form submitted:', values);
    toast({
      title: 'Message Sent!',
      description: "Thanks for reaching out. We'll get back to you soon.",
    });
    form.reset();
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Get in Touch</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have questions about our products, an order, or our brand? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 bg-card p-8 md:p-12 rounded-lg shadow-lg">
          <div>
            <h2 className="text-2xl font-headline font-bold mb-6">Contact Us</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="How can we help?" className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Send Message
                </Button>
              </form>
            </Form>
          </div>
          <div className="flex flex-col justify-between bg-secondary p-8 rounded-md">
            <div>
              <h3 className="text-xl font-headline font-bold mb-4">Connect with Us</h3>
              <p className="text-muted-foreground mb-6">
                Follow our journey and stay up-to-date with the latest drops and news.
              </p>
              <div className="space-y-4">
                <Link href="#" className="flex items-center group">
                  <Instagram className="h-6 w-6 mr-3 text-muted-foreground group-hover:text-primary" />
                  <span className="group-hover:text-primary">@Fithub_active</span>
                </Link>
                <Link href="#" className="flex items-center group">
                  <Twitter className="h-6 w-6 mr-3 text-muted-foreground group-hover:text-primary" />
                  <span className="group-hover:text-primary">@Fithub</span>
                </Link>
                <Link href="#" className="flex items-center group">
                  <MessageCircle className="h-6 w-6 mr-3 text-muted-foreground group-hover:text-primary" />
                  <span className="group-hover:text-primary">TikTok</span>
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-xl font-headline font-bold mb-4">Our Office</h3>
              <p className="text-muted-foreground">
                123 Active Way<br />
                Lagos, 100212<br />
                Nigeria
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
