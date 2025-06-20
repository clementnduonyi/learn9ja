import prisma from '@/lib/prisma'; // Import Prisma client instance
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getServices() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: 'asc' } // Example ordering
    });
    return services;
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return []; // Return empty array on error
  }
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">Our Services</h1>
      {services.length === 0 ? (
        <p className="text-center text-gray-500">No services available at the moment. Please check back later.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: any) => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>{service.description}</p>
                <p className="mt-4 font-semibold text-lg">${service.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter>
                {/* Link to a service detail page or an order form */}
                <Button asChild className="w-full">
                  {/* Adjust href based on desired flow */}
                  <Link href={`/order?serviceId=${service.id}`}>Order Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Optional: Revalidate data periodically or on demand
export const revalidate = 3600; // Revalidate services every hour