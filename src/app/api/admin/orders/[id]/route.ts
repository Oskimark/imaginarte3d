import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'CANCELLED']),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = statusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Estado de orden no válido' }, { status: 400 });
    }

    const existingOrder = await db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: { status: result.data.status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    return NextResponse.json({ error: 'Error al actualizar el estado de la orden' }, { status: 500 });
  }
}
