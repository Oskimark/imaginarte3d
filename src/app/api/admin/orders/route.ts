import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    return NextResponse.json({ error: 'Error al obtener las órdenes' }, { status: 500 });
  }
}
