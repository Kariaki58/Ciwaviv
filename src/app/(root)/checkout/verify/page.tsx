'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

interface VerificationResult {
  success: boolean;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    customer: {
      email: string;
      firstName: string;
      lastName: string;
    };
  };
  error?: string;
  message?: string;
}

export default function PaymentVerificationPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');
  const { clearCart } = useCart();
  
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setVerificationResult({
          success: false,
          error: 'No payment reference provided'
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/verify-payment?reference=${reference}`);
        const data = await response.json();

        if (data.success) {
          // Clear cart on successful payment
          clearCart();
        }

        setVerificationResult(data);
      } catch (error) {
        setVerificationResult({
          success: false,
          error: 'Failed to verify payment'
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [reference, clearCart]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-24">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
              <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Payment {verificationResult?.success ? 'Successful' : 'Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            {verificationResult?.success ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Thank You for Your Order!</h3>
                <p className="text-muted-foreground text-center mb-6">
                  {verificationResult.message}
                </p>
                
                {verificationResult.order && (
                  <div className="bg-muted p-4 rounded-lg w-full mb-6">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Order Number:</div>
                      <div className="font-semibold">{verificationResult.order.orderNumber}</div>
                      
                      <div>Amount Paid:</div>
                      <div className="font-semibold">{formatPrice(verificationResult.order.totalAmount)}</div>
                      
                      <div>Status:</div>
                      <div className="font-semibold text-green-600">Confirmed</div>
                      
                      <div>Customer:</div>
                      <div className="font-semibold">
                        {verificationResult.order.customer.firstName} {verificationResult.order.customer.lastName}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/shop">Continue Shopping</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">Go Home</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
                <p className="text-muted-foreground text-center mb-6">
                  {verificationResult?.error || 'Your payment could not be processed.'}
                </p>
                
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/checkout">Try Again</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/shop">Continue Shopping</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}