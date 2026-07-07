import db from '@/lib/db';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from './product-detail-client';

export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductoDetallePage({ params }: PageProps) {
  const { id } = await params;
  
  let product = null;
  try {
    product = await db.product.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error al obtener detalle de producto:', error);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <ProductDetailClient product={product} />
    </div>
  );
}
