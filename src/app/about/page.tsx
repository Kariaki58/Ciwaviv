import { CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about the Ciwaviv story, our mission to innovate sportswear, and our commitment to performance and sustainability.',
};

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Hero Section */}
        <section className="text-center mb-16 md:mb-24">
          <p className="font-headline text-primary font-semibold">OUR STORY</p>
          <h1 className="text-4xl md:text-6xl font-headline font-bold mt-2 mb-6">
            Movement is Life. We Design For It.
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
            Ciwaviv was born from a simple idea: that your gear should amplify your energy, not hold you back. We create high-performance activewear that seamlessly blends cutting-edge technology with bold, modern style.
          </p>
        </section>

        {/* Image Grid Section */}
        <section className="mb-16 md:mb-24">
          <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
            <div className="md:col-span-6 relative h-96 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="https://picsum.photos/seed/about1/1200/800"
                alt="Diverse group of athletes"
                fill
                className="object-cover"
                data-ai-hint="diverse athletes"
              />
            </div>
            <div className="md:col-span-4 relative h-96 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="https://picsum.photos/seed/about2/800/1200"
                alt="Close-up of sportswear fabric"
                fill
                className="object-cover"
                data-ai-hint="sportswear fabric"
              />
            </div>
          </div>
        </section>

        {/* Mission and Values Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center mb-16 md:mb-24">
          <div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-6">
              Our Mission: To Empower Your Every Move
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We are relentlessly focused on innovation. Our design process starts with you—the athlete, the yogi, the weekend warrior. We analyze movement, test materials to their limits, and obsess over every stitch to ensure our products deliver unparalleled performance, comfort, and durability.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle2 className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Innovation in Motion</h3>
                  <p className="text-muted-foreground">We utilize advanced, responsive fabrics that adapt to your body's temperature and movement.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg">Style Meets Performance</h3>
                  <p className="text-muted-foreground">Our aesthetic is clean, modern, and energetic, designed to make you look and feel your best.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-[500px] w-full rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://picsum.photos/seed/about3/800/1000"
              alt="Designer sketching sportswear"
              fill
              className="object-cover"
              data-ai-hint="designer sketch"
            />
          </div>
        </section>

        {/* Commitment Section */}
        <section className="bg-card p-8 md:p-12 rounded-lg">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              Our Commitment to the Planet
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
              Performance shouldn't come at the expense of our planet. We are committed to sustainable practices, from sourcing recycled materials to minimizing our carbon footprint. Join us in building a healthier future, one workout at a time.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
